import { useState } from 'react'
import { Axes, Dot, FnPath, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Legend, Readout } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { lstsq, rng } from '../../lib/math'
import { svgScript } from '../../components/plot/svgText'
import { useLatch } from '../../lib/useLatch'

/**
 * Cascade Correlation su una regressione in una dimensione.
 * - uscita lineare: i suoi pesi (da bias, input e tutte le unità nascoste) si trovano ai minimi quadrati;
 * - ogni nuova unità (tanh) riceve bias, input e le uscite di tutte le unità precedenti; i suoi pesi
 *   si addestrano con ascesa del gradiente per massimizzare S = |Σ_p (o_p − ō)(E_p − Ē)| e poi si congelano;
 * - si addestra un pool di candidate e si tiene quella con S più alto.
 */

const N = 50
const f = (x: number) => Math.sin(2 * Math.PI * x) + 0.6 * Math.exp(-((x - 0.72) ** 2) / 0.004)
const XS = Array.from({ length: N }, (_, i) => i / (N - 1))
const YS = XS.map(f)
const inp = (x: number) => 4 * x - 2
const MAXU = 6
const POOL = 6

type Unit = { w: number[]; S: number } // w = [bias, input, h1, …, h_{n-1}]

function hiddenOut(units: Unit[], x: number) {
  const h: number[] = []
  for (const u of units) {
    let s = u.w[0] + u.w[1] * inp(x)
    for (let j = 0; j < h.length; j++) s += u.w[j + 2] * h[j]
    h.push(Math.tanh(s))
  }
  return h
}
const feats = (units: Unit[], x: number) => [1, inp(x), ...hiddenOut(units, x)]

function fitOutput(units: Unit[]) {
  return lstsq(
    XS.map((x) => feats(units, x)),
    YS,
  )
}
const predict = (units: Unit[], wo: number[], x: number) => feats(units, x).reduce((s, v, i) => s + v * wo[i], 0)

function trainCandidate(units: Unit[], resid: number[], seed: number): Unit {
  const r = rng(seed)
  const nIn = 2 + units.length
  let w = Array.from({ length: nIn }, () => (r() * 2 - 1) * 1.5)
  const I = XS.map((x) => [1, inp(x), ...hiddenOut(units, x)])
  const Em = resid.reduce((a, b) => a + b) / N
  const Ec = resid.map((e) => e - Em)
  let S = 0
  for (let it = 0; it < 400; it++) {
    const o = I.map((row) => Math.tanh(row.reduce((s, v, j) => s + v * w[j], 0)))
    const om = o.reduce((a, b) => a + b) / N
    S = o.reduce((s, v, p) => s + (v - om) * Ec[p], 0)
    const sg = Math.sign(S) || 1
    const g = w.map((_, j) => sg * I.reduce((s, row, p) => s + Ec[p] * (1 - o[p] * o[p]) * row[j], 0))
    w = w.map((v, j) => v + (0.6 * g[j]) / N)
  }
  return { w, S: Math.abs(S) }
}

type State = { units: Unit[]; wo: number[]; history: number[] }
const mseOf = (units: Unit[], wo: number[]) => XS.reduce((s, x, p) => s + (YS[p] - predict(units, wo, x)) ** 2, 0) / N
function initState(): State {
  const wo = fitOutput([])
  return { units: [], wo, history: [mseOf([], wo)] }
}

export function CascadeCorrelation() {
  const [st, setSt] = useState<State>(initState)
  const [phase, setPhase] = useState(0)
  const n = st.units.length
  const add = () => {
    if (n >= MAXU) return
    const resid = XS.map((x, p) => predict(st.units, st.wo, x) - YS[p])
    let best: Unit | null = null
    for (let c = 0; c < POOL; c++) {
      const u = trainCandidate(st.units, resid, 1000 * (n + 1) + c * 17)
      if (!best || u.S > best.S) best = u
    }
    const units = [...st.units, best!]
    const wo = fitOutput(units)
    setSt({ units, wo, history: [...st.history, mseOf(units, wo)] })
    setPhase(4)
  }
  const cur = mseOf(st.units, st.wo)
  const seen = useLatch({ one: n >= 1, three: n >= 3, all: n >= MAXU })
  const resid = (x: number) => f(x) - predict(st.units, st.wo, x)
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('funzione da approssimare', 'function to approximate'), color: 'var(--c-green)' },
            { label: tx('uscita della rete', 'network output'), color: 'var(--c-red)' },
            { label: tx('errore residuo', 'residual error'), color: 'var(--c-orange)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <CascadeDiagram n={n} />
          <p className="wnote">{tx('* = pesi congelati dopo l’addestramento della candidata (in blu).', '* = weights frozen after training the candidate (in blue).')}</p>
        </div>
        <div>
          <Plot xDomain={[0, 1]} yDomain={[-1.6, 1.8]} aspect={0.75} minH={200} maxH={300} margin={{ l: 30, r: 8, t: 8, b: 24 }}>
            <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} origin />
            <FnPath f={resid} color="var(--c-orange)" width={1.4} dash="4 3" />
            <FnPath f={f} color="var(--c-green)" width={2.2} />
            <FnPath f={(x) => predict(st.units, st.wo, x)} color="var(--c-red)" width={2.2} samples={300} />
          </Plot>
          <Plot
            xDomain={[0, MAXU]}
            yDomain={[0, st.history[0] * 1.05]}
            aspect={0.32}
            minH={110}
            maxH={150}
            margin={{ l: 44, r: 8, t: 8, b: 26 }}
          >
            <Axes xTicks={[0, 1, 2, 3, 4, 5, 6]} yTicks={3} yFormat={(v) => fmt(v, 2)} xLabel={tx('unità nascoste', 'hidden units')} />
            <Polyline pts={st.history.map((v, i) => ({ x: i, y: v }))} color="var(--c-red)" width={2} />
            {st.history.map((v, i) => (
              <Dot key={i} x={i} y={v} r={3.5} color="var(--c-red)" />
            ))}
          </Plot>
        </div>
      </div>
      <ol className="arch6__steps cc8__steps">
        {[
          tx('Rete N₀ senza unità nascoste, addestrata (qui: uscita ai minimi quadrati).', 'Network N₀ with no hidden units, trained (here: least squares output).'),
          tx('Nuova unità: pool di candidate addestrate a massimizzare la correlazione S con l’errore residuo.', 'New unit: pool of candidate units trained to maximize correlation S with residual error.'),
          tx('Si tiene la candidata migliore, se ne congelano i pesi in ingresso, si riaddestra l’uscita.', 'The best candidate is retained, its input weights frozen, output retrained.'),
          tx('La prossima unità riceverà gli input e le uscite di tutte le unità precedenti (cascata).', 'The next unit will receive inputs and outputs of all previous units (cascade).'),
          tx('Si continua finché l’errore residuo soddisfa il criterio di arresto.', 'Training continues until residual error satisfies stopping criterion.'),
        ].map((s, i) => (
          <li key={i} className={i === (n === 0 ? 0 : phase) ? 'is-on' : undefined}>
            {s}
          </li>
        ))}
      </ol>
      <div className="controls">
        <Btn icon="step" variant="soft" onClick={add} disabled={n >= MAXU}>
          {tx('Aggiungi un’unità', 'Add a unit')}
        </Btn>
        <Btn
          icon="reset"
          onClick={() => {
            setSt(initState())
            setPhase(0)
          }}
          title={tx('Ricomincia da N₀', 'Restart from N₀')}
        />
        <div className="readouts">
          <Readout label={tx('unità nascoste', 'hidden units')} value={String(n)} />
          <Readout label={tx('MSE di training', 'training MSE')} tone="red" value={fmt(cur, 4)} />
          <Readout label={tx('S dell’ultima unità', 'S of last unit')} value={n ? fmt(st.units[n - 1].S, 2) : '—'} sub={tx(`scelta tra ${POOL} candidate`, `chosen among ${POOL} candidates`)} />
        </div>
      </div>
      <Tasks
        items={[
          { label: tx('Aggiungi la prima unità: l’errore residuo (arancione) si riduce.', 'Add the first unit: residual error (orange) decreases.'), done: seen.one },
          { label: tx('Arriva a tre unità: ogni nuova unità riceve anche le uscite delle precedenti.', 'Reach three units: each new unit also receives outputs of previous ones.'), done: seen.three },
          { label: tx('Continua fino a sei unità e guarda la curva dell’errore scendere.', 'Continue up to six units and watch the error curve drop.'), done: seen.all },
        ]}
      />
    </div>
  )
}

/** lo schema della cascata: input in basso, uscita in alto, unità nascoste in diagonale; * = pesi congelati */
function CascadeDiagram({ n }: { n: number }) {
  const W = 360
  const H = 300
  const inX = [70, 130]
  const inY = 270
  const out = { x: 70, y: 36 }
  const hid = Array.from({ length: n }, (_, j) => ({ x: 170 + j * 30, y: 220 - j * 30 }))
  const edge = (a: { x: number; y: number }, b: { x: number; y: number }, frozen: boolean, k: string) => {
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    return (
      <g key={k}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`cc8__edge${frozen ? ' is-frozen' : ''}`} markerEnd="url(#cc8-arrow)" />
        {frozen && (
          <text x={mx + 4} y={my - 2} className="cc8__star">
            *
          </text>
        )}
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cc8" role="img" aria-label={tx(`Rete Cascade Correlation con ${n} unità nascoste`, `Cascade Correlation network with ${n} hidden units`)}>
      <defs>
        <marker
          id="cc8-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0,0L10,5L0,10Z" className="cc8__head" />
        </marker>
      </defs>
      <rect x={40} y={inY - 18} width={120} height={36} rx={8} className="cc8__inbox" />
      {inX.map((x, i) => edge({ x, y: inY - 14 }, { x: out.x + (i ? 6 : -6), y: out.y + 14 }, false, `io${i}`))}
      {hid.map((h, j) => (
        <g key={j}>
          {inX.map((x, i) => edge({ x, y: inY - 14 }, { x: h.x - 8, y: h.y + 10 }, true, `ih${j}${i}`))}
          {hid.slice(0, j).map((p, q) => edge({ x: p.x + 10, y: p.y - 4 }, { x: h.x - 10, y: h.y + 4 }, true, `hh${q}${j}`))}
          {edge({ x: h.x - 10, y: h.y - 8 }, { x: out.x + 12, y: out.y + 10 }, false, `ho${j}`)}
        </g>
      ))}
      {inX.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={inY} r={12} className="cc8__node" />
          <text x={x} y={inY + 4} textAnchor="middle" className="cc8__lbl">
            {i ? 'x' : '1'}
          </text>
        </g>
      ))}
      {hid.map((h, j) => (
        <g key={j}>
          <circle cx={h.x} cy={h.y} r={13} className={`cc8__node cc8__node--h${j === n - 1 ? ' is-new' : ''}`} />
          <text x={h.x} y={h.y + 4} textAnchor="middle" className="cc8__lbl">
            {svgScript('o', String(j + 1))}
          </text>
        </g>
      ))}
      <circle cx={out.x} cy={out.y} r={14} className="cc8__node cc8__node--out" />
      <text x={out.x} y={out.y + 4} textAnchor="middle" className="cc8__lbl">
        o
      </text>
      <line x1={out.x} y1={out.y - 14} x2={out.x} y2={6} className="cc8__edge" markerEnd="url(#cc8-arrow)" />
    </svg>
  )
}
