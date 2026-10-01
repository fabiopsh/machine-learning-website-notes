import { useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Slider, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

type XY = [number, number]

function interp(pts: XY[], x: number) {
  if (x <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++)
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  return pts[pts.length - 1][1]
}

/* ------------------------------------------------------------------ Fig. 17.11: deep double descent */

/** valori letti dalla figura originale (ResNet18 su CIFAR-10, 15% di etichette rumorose) */
const DD_TEST: XY[] = [
  [1, 0.535],
  [2, 0.395],
  [3, 0.355],
  [4, 0.343],
  [5, 0.35],
  [6, 0.37],
  [8, 0.405],
  [10, 0.412],
  [12, 0.41],
  [14, 0.395],
  [16, 0.385],
  [18, 0.37],
  [20, 0.36],
  [25, 0.34],
  [30, 0.33],
  [35, 0.32],
  [40, 0.312],
  [45, 0.305],
  [50, 0.3],
  [55, 0.297],
  [60, 0.294],
  [64, 0.292],
]
const DD_TRAIN: XY[] = [
  [1, 0.535],
  [2, 0.39],
  [3, 0.33],
  [4, 0.29],
  [5, 0.275],
  [6, 0.255],
  [8, 0.2],
  [10, 0.13],
  [12, 0.07],
  [14, 0.03],
  [16, 0.012],
  [18, 0.005],
  [20, 0.003],
  [64, 0.001],
]
const THRESH = 11

function Band({ from, to }: { from: number; to: number }) {
  const { x, m, ih } = usePlot()
  return <rect className="dd17__band" x={x(from)} y={m.t} width={x(to) - x(from)} height={ih} />
}

export function DoubleDescent() {
  const [w, setW] = useState(4)
  const [moved, setMoved] = useState(false)
  const regime = w < 5 ? 'classic' : w <= 19 ? 'critical' : 'modern'
  const seen = useLatch({ peak: moved && w >= 9 && w <= 13, modern: moved && w >= 40 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('errore di test', 'test error'), color: 'var(--c-orange)' },
            { label: tx('errore di training', 'training error'), color: 'var(--c-blue)', kind: 'dash' },
            { label: tx('regime critico', 'critical regime'), color: 'var(--c-yellow)', kind: 'area' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 66]} yDomain={[0, 0.58]} aspect={0.5} margin={{ b: 40 }}>
        <Axes
          xTicks={[1, 10, 20, 30, 40, 50, 60]}
          yTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
          yFormat={(v) => fmt(v, 1)}
          xLabel={tx('larghezza del modello (ResNet18)', 'model width (ResNet18)')}
          yLabel={tx('errore', 'error')}
        />
        <Band from={5} to={19} />
        <Polyline
          pts={[
            { x: THRESH, y: 0 },
            { x: THRESH, y: 0.58 },
          ]}
          color="var(--ink-2)"
          width={1.4}
          dash="5 4"
        />
        <Polyline pts={DD_TRAIN.map(([x, y]) => ({ x, y }))} color="var(--c-blue)" width={2} dash="6 4" />
        <Polyline pts={DD_TEST.map(([x, y]) => ({ x, y }))} color="var(--c-orange)" width={2.4} />
        <Label x={THRESH + 1} y={0.2} className="plot-label--muted">
          {tx('soglia di interpolazione', 'interpolation threshold')}
        </Label>
        <Label x={36} y={0.52} className="plot-label--muted">
          {tx('regime moderno: più grande è meglio →', 'modern regime: larger is better →')}
        </Label>
        <Polyline
          pts={[
            { x: w, y: 0 },
            { x: w, y: 0.58 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Dot x={w} y={interp(DD_TEST, w)} color="var(--c-orange)" />
        <Dot x={w} y={interp(DD_TRAIN, w)} color="var(--c-blue)" />
        <Handle
          x={w}
          y={0}
          axis="x"
          label={tx('larghezza del modello', 'model width')}
          onMove={(p) => {
            setW(Math.max(1, Math.min(64, Math.round(p.x))))
            setMoved(true)
          }}
        />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label={tx('larghezza', 'width')} tone="accent" value={String(w)} />
          <Readout label={tx('errore di test', 'test error')} tone="orange" value={fmt(interp(DD_TEST, w), 2)} />
          <Readout label={tx('errore di training', 'training error')} tone="blue" value={fmt(interp(DD_TRAIN, w), 2)} />
        </div>
        <span className={'verdict ' + (regime === 'classic' ? 'verdict--info' : regime === 'critical' ? 'verdict--warn' : 'verdict--good')}>
          {regime === 'classic'
            ? tx('Regime classico: il compromesso bias-varianza, la solita curva a U.', 'Classical regime: bias-variance trade-off, the usual U-shaped curve.')
            : regime === 'critical'
              ? tx('Regime critico: attorno alla soglia di interpolazione (errore di training quasi nullo) l’errore di test ha un picco.', 'Critical regime: around the interpolation threshold (near-zero training error) the test error peaks.')
              : tx('Regime moderno: sovra-parametrizzazione, l’errore di test scende di nuovo.', 'Modern regime: over-parametrization, test error drops again.')}
        </span>
      </div>
      <Tasks
        items={[
          { label: tx('Porta la larghezza attorno a 11, la soglia di interpolazione: l’errore di training è quasi zero e quello di test è al picco.', 'Bring the width around 11, the interpolation threshold: training error is near zero and test error peaks.'), done: seen.peak },
          { label: tx('Vai oltre 40: l’errore di test è più basso del minimo della prima discesa.', 'Go past 40: test error is lower than the minimum of the first descent.'), done: seen.modern },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.12: double descent con i polinomi */

/** MSE mediano su 250 prove, letto dalla figura originale (Fleuret) */
const PD_TEST: XY[] = [
  [0, 5.2e-2],
  [1, 8.5e-3],
  [2, 4.3e-3],
  [3, 7.2e-3],
  [4, 2.8e-2],
  [5, 6.5e-2],
  [6, 3.2e-1],
  [7, 6.2e-1],
  [8, 1.0e-1],
  [9, 4e-2],
  [10, 1.5e-2],
  [11, 7.2e-3],
  [12, 5.5e-3],
  [13, 3.3e-3],
  [14, 2.8e-3],
  [15, 2.6e-3],
  [16, 2.5e-3],
]
const PD_TRAIN: XY[] = [
  [0, 4.2e-2],
  [1, 4.3e-3],
  [2, 1.9e-3],
  [3, 8.5e-4],
  [4, 2.1e-4],
  [5, 1.8e-5],
  [5.2, 1e-5],
]

export function PolyDescent() {
  const [d, setD] = useState(2)
  const [moved, setMoved] = useState(false)
  const seen = useLatch({ peak: moved && d === 7, far: moved && d >= 14 })
  const test = PD_TEST[d][1]
  const train = d <= 5 ? PD_TRAIN[d][1] : 0
  const lg = (pts: XY[]) => pts.map(([x, y]) => ({ x, y: Math.log10(y) }))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('errore di training', 'training error'), color: 'var(--c-blue)' },
            { label: tx('errore di test', 'test error'), color: 'var(--c-orange)' },
          ]}
        />
      </div>
      <Plot xDomain={[-0.5, 16.5]} yDomain={[-5, 0]} aspect={0.6} margin={{ l: 62, b: 40 }}>
        <Axes
          xTicks={[0, 2, 4, 6, 8, 10, 12, 14, 16]}
          yTicks={[-5, -4, -3, -2, -1, 0]}
          yFormat={(v) => fmt(10 ** v, Math.max(0, -v))}
          xLabel={tx('grado del polinomio', 'polynomial degree')}
          yLabel={tx('MSE (scala logaritmica)', 'MSE (log scale)')}
        />
        <Polyline
          pts={[
            { x: 7, y: -5 },
            { x: 7, y: 0 },
          ]}
          color="var(--ink-4)"
          width={1}
        />
        <Polyline pts={lg(PD_TRAIN)} color="var(--c-blue)" width={2.2} />
        <Polyline pts={lg(PD_TEST)} color="var(--c-orange)" width={2.4} />
        <Dot x={d} y={Math.log10(test)} color="var(--c-orange)" />
        {d <= 5 && <Dot x={d} y={Math.log10(train)} color="var(--c-blue)" />}
        <Handle
          x={d}
          y={-5}
          axis="x"
          label={tx('grado del polinomio', 'polynomial degree')}
          onMove={(p) => {
            setD(Math.max(0, Math.min(16, Math.round(p.x))))
            setMoved(true)
          }}
        />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label={tx('grado', 'degree')} tone="accent" value={String(d)} />
          <Readout label={tx('errore di test', 'test error')} tone="orange" value={fmt(test, test < 0.01 ? 4 : 3)} />
          <Readout label={tx('errore di training', 'training error')} tone="blue" value={d <= 5 ? fmt(train, 5) : tx('sotto 0,00001', 'below 0.00001')} />
        </div>
        <span className={'verdict ' + (d < 6 ? 'verdict--info' : d <= 8 ? 'verdict--warn' : 'verdict--good')}>
          {d < 6
            ? tx('Prima discesa e risalita: la classica U.', 'First descent and rise: the classic U-shape.')
            : d <= 8
              ? tx('Il picco, al grado in cui l’errore di training si azzera.', 'The peak, at the degree where training error vanishes.')
              : tx('Seconda discesa: il fit è guidato solo dal termine di penalità.', 'Second descent: the fit is driven solely by the penalty term.')}
        </span>
      </div>
      <Tasks
        items={[
          { label: tx('Porta il grado a 7: l’errore di training si è azzerato e quello di test è al massimo.', 'Bring the degree to 7: training error has reached zero and test error is at its peak.'), done: seen.peak },
          { label: tx('Sali oltre il grado 14: l’errore di test torna ai livelli del minimo della prima discesa.', 'Go above degree 14: test error returns to the levels of the first descent minimum.'), done: seen.far },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.13: gradient clipping */

/** funzione di costo con una scogliera: una parete ripida a sinistra e un fondo in leggera pendenza */
const KW = 40
const W0 = 1.2
const HWALL = 1.5
const SLOPE = 0.05
const sWall = (w: number) => 1 / (1 + Math.exp(KW * (w - W0)))
const cost = (w: number) => HWALL * sWall(w) + SLOPE * w
const grad = (w: number) => -HWALL * KW * sWall(w) * (1 - sWall(w)) + SLOPE
const ETA = 6
const START = 3.1
const NSTEPS = 11

function path(clip: number | null, n: number) {
  const ws = [START]
  const gs: number[] = []
  for (let i = 0; i < n; i++) {
    const w = ws[ws.length - 1]
    let g = grad(w)
    gs.push(g)
    if (clip !== null && Math.abs(g) > clip) g = (clip * g) / Math.abs(g)
    ws.push(Math.max(0.2, Math.min(9.4, w - ETA * g)))
  }
  return { ws, gs }
}

/** i passi come salti ad arco sopra la curva: più lungo il passo, più alto l'arco */
function Hops({ ws }: { ws: number[] }) {
  const { x, y } = usePlot()
  let d = ''
  for (let i = 0; i + 1 < ws.length; i++) {
    const x1 = x(ws[i])
    const y1 = y(cost(ws[i]))
    const x2 = x(ws[i + 1])
    const y2 = y(cost(ws[i + 1]))
    const lift = Math.min(120, 10 + Math.abs(x2 - x1) * 0.28)
    d += `M${x1.toFixed(1)},${y1.toFixed(1)}Q${((x1 + x2) / 2).toFixed(1)},${(Math.min(y1, y2) - lift).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
  }
  return <path d={d} fill="none" stroke="var(--ink)" strokeWidth={1.4} />
}

export function Clipping() {
  const [on, setOn] = useState(false)
  const [v, setV] = useState(0.1)
  const [n, setN] = useState(NSTEPS)
  const seen = useLatch({ on })
  const { ws, gs } = path(on ? v : null, n)
  const far = Math.max(...ws)
  const gmax = Math.max(...gs.map(Math.abs))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('funzione di costo', 'cost function'), color: 'var(--c-violet)' },
            { label: tx('passi della discesa', 'descent steps'), color: 'var(--ink)', kind: 'dot' },
          ]}
        />
        <Toggle label="gradient clipping" checked={on} onChange={setOn} />
      </div>
      <Plot xDomain={[0, 9.5]} yDomain={[0, 2.1]} aspect={0.5} margin={{ b: 40 }}>
        <Axes xTicks={[0, 2, 4, 6, 8]} yTicks={[0, 0.5, 1, 1.5, 2]} yFormat={(y) => fmt(y, 1)} xLabel={tx('peso w', 'weight w')} yLabel={tx('costo J(w)', 'cost J(w)')} />
        <FnPath f={cost} color="var(--c-violet)" width={2.4} samples={600} />
        <Hops ws={ws} />
        {ws.map((w, i) => (
          <Dot key={i} x={w} y={cost(w)} color={i === 0 ? 'var(--c-green)' : 'var(--ink)'} r={i === ws.length - 1 ? 5 : 3.6} />
        ))}
        <Label x={START} y={cost(START) + 0.14} anchor="middle" className="plot-label--muted">
          {tx('partenza', 'start')}
        </Label>
        <Label x={0.3} y={1.9} className="plot-label--muted">
          {tx('scogliera', 'cliff')}
        </Label>
      </Plot>
      <Controls>
        <Slider
          label={
            <>
              {tx('soglia', 'threshold')} <Tex>{'v'}</Tex> {tx('sulla norma', 'on norm')}
            </>
          }
          min={0.06}
          max={0.5}
          step={0.01}
          value={v}
          onChange={setV}
          format={(x) => fmt(x, 2)}
          width={200}
        />
        <Slider label={tx('passi eseguiti', 'steps taken')} min={1} max={NSTEPS} step={1} value={n} onChange={setN} width={180} />
        <div className="readouts">
          <Readout label={tx('gradiente più grande incontrato', 'largest gradient encountered')} value={fmt(gmax, 2)} sub={on ? tx(`tagliato a ${fmt(Math.min(v, gmax), 2)}`, `clipped to ${fmt(Math.min(v, gmax), 2)}`) : tx('usato così com’è', 'used as-is')} />
          <Readout label={tx('punto più lontano raggiunto', 'furthest point reached')} tone="accent" value={<Tex>{`w = ${fmt(far, 1)}`}</Tex>} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: tx('Senza clipping segui i passi: quando un passo finisce sulla parete della scogliera, il gradiente enorme catapulta il peso lontanissimo.', 'Without clipping follow the steps: when a step lands on the cliff wall, the huge gradient catapults the weight far away.'), done: n < NSTEPS || seen.on },
          { label: tx('Attiva il clipping: la direzione è la stessa, ma il passo è limitato e la reazione alla scogliera è moderata.', 'Enable clipping: the direction is unchanged, but the step is bounded and the reaction to the cliff is moderate.'), done: seen.on },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.14: dropout */

type Mask = [boolean, boolean, boolean, boolean] // x1, x2, h1, h2
const POS = { x1: [14, 50], x2: [46, 50], h1: [14, 30], h2: [46, 30], y: [30, 10] } as const
const works = (m: Mask) => (m[0] || m[1]) && (m[2] || m[3])
const maskOf = (k: number): Mask => [!(k & 8), !(k & 4), !(k & 2), !(k & 1)]

function SubNet({ m, big, onToggle }: { m: Mask; big?: boolean; onToggle?: (i: number) => void }) {
  const names = ['x1', 'x2', 'h1', 'h2'] as const
  const r = big ? 7.5 : 6
  const edges: [keyof typeof POS, keyof typeof POS, boolean][] = [
    ['x1', 'h1', m[0] && m[2]],
    ['x1', 'h2', m[0] && m[3]],
    ['x2', 'h1', m[1] && m[2]],
    ['x2', 'h2', m[1] && m[3]],
    ['h1', 'y', m[2]],
    ['h2', 'y', m[3]],
  ]
  return (
    <svg viewBox="0 0 60 60" className={'dr17__net' + (big ? ' dr17__net--big' : '')} aria-hidden={!big}>
      {edges.map(([a, b, on], i) => on && <line key={i} className="dr17__edge" x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} />)}
      {names.map((nm, i) =>
        m[i] || big ? (
          <g
            key={nm}
            className={'dr17__u' + (m[i] ? '' : ' is-off') + (onToggle ? ' is-click' : '')}
            onClick={onToggle ? () => onToggle(i) : undefined}
            role={onToggle ? 'button' : undefined}
            tabIndex={onToggle ? 0 : undefined}
            aria-label={onToggle ? tx(`unità ${nm}: ${m[i] ? 'presente' : 'rimossa'}`, `unit ${nm}: ${m[i] ? 'present' : 'dropped'}`) : undefined}
            onKeyDown={onToggle ? (e) => (e.key === 'Enter' || e.key === ' ') && onToggle(i) : undefined}
          >
            <circle cx={POS[nm][0]} cy={POS[nm][1]} r={r} />
            <text x={POS[nm][0]} y={POS[nm][1] + 2.4} textAnchor="middle">
              {svgScript(nm[0], nm[1])}
            </text>
          </g>
        ) : null,
      )}
      <g className="dr17__u">
        <circle cx={POS.y[0]} cy={POS.y[1]} r={r} />
        <text x={POS.y[0]} y={POS.y[1] + 2.4} textAnchor="middle">
          y
        </text>
      </g>
    </svg>
  )
}

export function Dropout() {
  const [m, setM] = useState<Mask>([true, true, true, true])
  const [draws, setDraws] = useState(0)
  const [broken, setBroken] = useState(false)
  const key = (m[0] ? 0 : 8) + (m[1] ? 0 : 4) + (m[2] ? 0 : 2) + (m[3] ? 0 : 1)
  const set = (nm: Mask) => {
    setM(nm)
    if (!works(nm)) setBroken(true)
  }
  const sample = () => {
    const r = rng(1714 + draws * 97)
    set([r() < 0.8, r() < 0.8, r() < 0.5, r() < 0.5])
    setDraws(draws + 1)
  }
  return (
    <div>
      <div className="dr17">
        <div className="dr17__base">
          <div className="htf__title">{tx('Rete base (clicca un’unità per rimuoverla)', 'Base network (click a unit to drop it)')}</div>
          <SubNet m={m} big onToggle={(i) => set(m.map((v, j) => (j === i ? !v : v)) as Mask)} />
          <span className={'verdict ' + (works(m) ? 'verdict--good' : 'verdict--bad')}>
            {works(m)
              ? tx('C’è un percorso dall’input all’uscita.', 'There is a path from input to output.')
              : tx('Nessun percorso dall’input all’uscita: questa sotto-rete non funziona.', 'No path from input to output: this sub-network is disconnected.')}
          </span>
        </div>
        <div>
          <div className="htf__title">{tx('Le 16 sotto-reti', 'The 16 sub-networks')}</div>
          <div className="dr17__grid">
            {Array.from({ length: 16 }, (_, k) => {
              const mk = maskOf(k)
              return (
                <button
                  key={k}
                  type="button"
                  className={'dr17__cell' + (k === key ? ' is-on' : '') + (works(mk) ? '' : ' is-bad')}
                  aria-label={tx(`sotto-rete ${k + 1}${works(mk) ? '' : ', non funziona'}`, `sub-network ${k + 1}${works(mk) ? '' : ', disconnected'}`)}
                  aria-pressed={k === key}
                  onClick={() => set(mk)}
                >
                  <SubNet m={mk} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <Controls>
        <Btn icon="play" variant="soft" onClick={sample}>
          {tx('Campiona una maschera', 'Sample a mask')}
        </Btn>
        <p className="wnote">
          {tx(
            'Probabilità di includere un’unità: 0,8 per gli input, 0,5 per le unità nascoste. Le sotto-reti segnate in rosso (7 su 16) non collegano più l’input all’uscita.',
            'Probability of retaining a unit: 0.8 for inputs, 0.5 for hidden units. The sub-networks in red (7 out of 16) no longer connect input to output.',
          )}
        </p>
      </Controls>
      <Tasks
        items={[
          { label: tx('Campiona qualche maschera: a ogni esempio si addestra una sotto-rete diversa.', 'Sample a few masks: on each example a different sub-network is trained.'), done: draws >= 3 },
          { label: tx('Trova una sotto-rete che non funziona (nessun percorso dall’input all’uscita).', 'Find a broken sub-network (no path from input to output).'), done: broken },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.15: L1 e L2 */

const C = 1.5

function NormPanel({ kind, theta }: { kind: 'l1' | 'l2'; theta: number }) {
  const a = [Math.cos(theta), Math.sin(theta)]
  const sol = kind === 'l2' ? [C * a[0], C * a[1]] : a[1] > a[0] ? [0, C / a[1]] : [C / a[0], 0]
  const size = kind === 'l2' ? C : Math.abs(sol[0]) + Math.abs(sol[1])
  const shape = (s: number) =>
    kind === 'l2'
      ? Array.from({ length: 73 }, (_, i) => ({ x: s * Math.cos((i / 72) * 2 * Math.PI), y: s * Math.sin((i / 72) * 2 * Math.PI) }))
      : [
          { x: s, y: 0 },
          { x: 0, y: s },
          { x: -s, y: 0 },
          { x: 0, y: -s },
          { x: s, y: 0 },
        ]
  // la retta dei vincoli: a·w = C
  const dir = [-a[1], a[0]]
  const p0 = [C * a[0], C * a[1]]
  const sparse = Math.abs(sol[0]) < 1e-9 || Math.abs(sol[1]) < 1e-9
  return (
    <div>
      <div className="htf__title">
        {tx('Norma', 'Norm')} <Tex>{kind === 'l1' ? 'L^1' : 'L^2'}</Tex>
      </div>
      <Plot xDomain={[-2.4, 2.9]} yDomain={[-2.4, 2.9]} equal aspect={1} minH={220} maxH={330} margin={{ l: 14, r: 14, t: 12, b: 14 }}>
        <Axes origin xTicks={[]} yTicks={[]} grid={false} />
        <Polyline pts={shape(size * 0.62)} color="var(--c-blue)" width={2} />
        <Polyline pts={shape(size)} color="var(--ink-2)" width={1.5} dash="6 4" />
        <Polyline
          pts={[
            { x: p0[0] - 6 * dir[0], y: p0[1] - 6 * dir[1] },
            { x: p0[0] + 6 * dir[0], y: p0[1] + 6 * dir[1] },
          ]}
          color="var(--c-red)"
          width={2.2}
        />
        <Dot x={sol[0]} y={sol[1]} color="var(--c-red)" r={5.5} />
        <Label x={2.75} y={0} dy={16} anchor="end" className="plot-label--math">
          w₁
        </Label>
        <Label x={0} y={2.75} dx={8} className="plot-label--math">
          w₂
        </Label>
      </Plot>
      <div className="readouts">
        <Readout label={<Tex>{'w_1'}</Tex>} value={fmt(sol[0], 2)} />
        <Readout label={<Tex>{'w_2'}</Tex>} value={fmt(sol[1], 2)} />
      </div>
      <span className={'verdict ' + (sparse ? 'verdict--good' : 'verdict--info')}>
        {sparse ? tx('Un peso è esattamente zero: soluzione sparsa.', 'One weight is exactly zero: sparse solution.') : tx('Entrambi i pesi sono diversi da zero.', 'Both weights are non-zero.')}
      </span>
    </div>
  )
}

export function L1L2() {
  const [deg, setDeg] = useState(58)
  const theta = (deg * Math.PI) / 180
  const seen = useLatch({ low: deg < 40, moved: deg !== 58 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('vincoli dei dati', 'data constraints'), color: 'var(--c-red)' },
            { label: tx('curve di livello della norma', 'norm level contours'), color: 'var(--c-blue)' },
            { label: tx('la soluzione', 'the solution'), color: 'var(--c-red)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <NormPanel kind="l1" theta={theta} />
        <NormPanel kind="l2" theta={theta} />
      </div>
      <Controls>
        <Slider label={tx('inclinazione della retta dei vincoli', 'constraint line slope')} min={8} max={82} step={1} value={deg} onChange={setDeg} format={(v) => `${v}°`} width={300} />
      </Controls>
      <Tasks
        items={[
          { label: tx('Cambia l’inclinazione della retta: con la norma L² la soluzione scorre lungo il cerchio, con la L¹ resta su un vertice del rombo.', 'Change the line slope: with the L² norm the solution slides along the circle, with L¹ it sticks to a rhombus vertex.'), done: seen.moved },
          { label: tx('Scendi sotto 40°: la soluzione L¹ salta sull’altro vertice, dove è l’altro peso a essere zero.', 'Drop below 40°: the L¹ solution jumps to the other vertex, where the other weight becomes zero.'), done: seen.low },
        ]}
      />
    </div>
  )
}
