import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Label, Plot, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/** dado: segna le parti casuali e non addestrate */
function Die({ x, y, s = 20 }: { x: number; y: number; s?: number }) {
  return (
    <g className="die18" transform={`translate(${x} ${y}) rotate(-12)`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.2} />
      {[
        [-1, -1],
        [1, -1],
        [0, 0],
        [-1, 1],
        [1, 1],
      ].map(([a, b], i) => (
        <circle key={i} cx={a * s * 0.26} cy={b * s * 0.26} r={s * 0.085} />
      ))}
    </g>
  )
}

function Q({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect className="ru20__q" x={x - 15} y={y - 14} width={30} height={28} rx={4} />
      <text className="ru20__t ru20__t--sm" x={x} y={y + 4.5} textAnchor="middle">
        {svgScript('q', '−1', 'sup')}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 20.6: Simple RNN (Elman) */

export function Elman() {
  const [sel, setSel] = useState<number | null>(1)
  const [n, setN] = useState(0)
  const HX = [150, 250, 350]
  const IX = [70, 130]
  const QX = [250, 310, 370]
  const pick = (i: number) => {
    setSel(i)
    setN(n + 1)
  }
  return (
    <div>
      <div className="wgrid">
        <svg className="el20" viewBox="0 0 470 330" role="img" aria-label={tx('Simple RNN di Elman con tre unità nascoste ricorrenti', 'Elman’s Simple RNN with three hidden recurrent units')}>
          <rect className="el20__box" x={110} y={24} width={280} height={36} rx={6} />
          <text className="el20__t" x={250} y={47} textAnchor="middle">
            {tx('strato di uscita (eventuale)', 'output layer (optional)')}
          </text>
          <line className="el20__w" x1={250} y1={24} x2={250} y2={6} />
          <text className="el20__t" x={262} y={14}>
            y(t)
          </text>
          {HX.map((x, i) => (
            <line key={i} className="el20__w" x1={x} y1={128} x2={x} y2={60} />
          ))}
          {/* ritorni: dall'uscita di ogni unità al proprio ritardo (tratteggiati) */}
          {HX.map((x, i) => (
            <path
              key={i}
              className={'el20__fb' + (sel !== null ? ' is-on' : '')}
              d={`M${x},${96 - i * 10}H${432 - i * 12}V${314 - i * 6}H${QX[i]}V288`}
            />
          ))}
          {/* pesi di input e pesi ricorrenti */}
          {HX.map((x, h) =>
            IX.map((ix, j) => <line key={`i${h}-${j}`} className={'el20__w' + (sel === h ? ' is-in' : '')} x1={ix} y1={258} x2={x} y2={176} />),
          )}
          {HX.map((x, h) =>
            QX.map((qx, k) => <line key={`r${h}-${k}`} className={'el20__w' + (sel === h ? ' is-rec' : '')} x1={qx} y1={258} x2={x} y2={176} />),
          )}
          {HX.map((x, i) => (
            <g
              key={i}
              className={'el20__u' + (sel === i ? ' is-on' : '')}
              role="button"
              tabIndex={0}
              aria-label={tx(`unità nascosta ${i + 1}`, `hidden unit ${i + 1}`)}
              aria-pressed={sel === i}
              onClick={() => pick(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(i)}
            >
              <circle cx={x} cy={152} r={24} />
              <text x={x} y={157} textAnchor="middle">
                {svgScript('x', String(i + 1))}
              </text>
            </g>
          ))}
          {IX.map((x, i) => (
            <circle key={i} className="el20__in" cx={x} cy={272} r={13} />
          ))}
          <text className="el20__t" x={100} y={277} textAnchor="middle">
            …
          </text>
          <text className="el20__t" x={100} y={308} textAnchor="middle">
            {svgScript('l', '1')} … {svgScript('l', 'm')}
          </text>
          {QX.map((x, i) => (
            <Q key={i} x={x} y={274} />
          ))}
          <text className="el20__t el20__t--math" x={62} y={216}>
            w
          </text>
          <text className="el20__t el20__t--math" x={396} y={216}>
            ŵ
          </text>
        </svg>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{sel !== null ? tx(`Unità nascosta ${sel + 1}`, `Hidden unit ${sel + 1}`) : 'Simple RNN'}</div>
            {tx(
              <>
                Riceve l’input corrente (pesi <Tex>{'w'}</Tex>, in blu) e gli stati precedenti di <b>tutte</b> le unità nascoste, attraverso i
                ritardi <Tex>{'q^{-1}'}</Tex> (pesi <Tex>{'\\hat w'}</Tex>, in arancione).
              </>,
              <>
                It receives the current input (weights <Tex>{'w'}</Tex>, in blue) and the previous states of <b>all</b> the hidden units, through
                the delays <Tex>{'q^{-1}'}</Tex> (weights <Tex>{'\\hat w'}</Tex>, in orange).
              </>,
            )}
            {sel !== null && (
              <div className="wmath">
                <Tex>{`x_${sel + 1}(t) = f\\Big(\\sum_{j=1}^{m} w_{${sel + 1}j}\\,l_j(t) + \\sum_{k} \\hat w_{${sel + 1}k}\\,x_k(t-1) + \\theta_${sel + 1}\\Big)`}</Tex>
              </div>
            )}
          </div>
          <Legend
            items={[
              { label: tx('pesi di input', 'input weights'), color: 'var(--c-blue)' },
              { label: tx('pesi ricorrenti', 'recurrent weights'), color: 'var(--c-orange)' },
              { label: tx('stato riportato al ritardo', 'state fed back to the delay'), color: 'var(--ink-3)', kind: 'dash' },
            ]}
          />
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca le tre unità nascoste: ognuna riceve gli stessi input e gli stati precedenti di tutte e tre.',
              'Click the three hidden units: each one receives the same inputs and the previous states of all three.',
            ),
            done: n >= 2,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.7: unfolding */

type WId = 'w1' | 'w2' | 'r11' | 'r12' | 'r21' | 'r22'
const WNAMES: Record<WId, string> = {
  w1: tx('peso di input verso l’unità 1', 'input weight to unit 1'),
  w2: tx('peso di input verso l’unità 2', 'input weight to unit 2'),
  r11: tx('peso ricorrente dall’unità 1 all’unità 1', 'recurrent weight from unit 1 to unit 1'),
  r12: tx('peso ricorrente dall’unità 2 all’unità 1', 'recurrent weight from unit 2 to unit 1'),
  r21: tx('peso ricorrente dall’unità 1 all’unità 2', 'recurrent weight from unit 1 to unit 2'),
  r22: tx('peso ricorrente dall’unità 2 all’unità 2', 'recurrent weight from unit 2 to unit 2'),
}

export function Unfolding() {
  const [k, setK] = useState(3)
  const [hot, setHot] = useState<WId | null>(null)
  const [touched, setTouched] = useState(false)
  const seen = useLatch({ deep: k >= 5 })
  const on = (id: WId) => ({
    className: `uf20__w uf20__w--${id}` + (hot === id ? ' is-hot' : hot ? ' is-dim' : ''),
    onPointerEnter: () => {
      setHot(id)
      setTouched(true)
    },
    onPointerLeave: () => setHot(null),
    onClick: () => {
      setHot(id)
      setTouched(true)
    },
  })
  // rete srotolata: livello 0 = stato iniziale, livelli 1…k = repliche
  const H = 60 + k * 62
  const ly = (lv: number) => H - 30 - lv * 62
  const UX = [330, 410]
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="uf20" viewBox={`0 0 500 ${Math.max(H, 250)}`} style={{ minWidth: 470 }} role="img" aria-label={tx('Unfolding di una RNN a due unità lungo la sequenza di input', 'Unfolding of an RNN with two units along the input sequence')}>
          {/* la RNN originale */}
          <g transform={`translate(0 ${Math.max(H, 250) / 2 - 110})`}>
            <text className="uf20__t" x={110} y={12} textAnchor="middle">
              {tx('la RNN', 'the RNN')}
            </text>
            <path className="uf20__fb" d="M70,66V40H196V212H110V196" />
            <path className="uf20__fb" d="M150,58V48H182V204H166V196" />
            <line {...on('w1')} x1={30} y1={176} x2={62} y2={106} />
            <line {...on('w2')} x1={30} y1={176} x2={140} y2={106} />
            <line {...on('r11')} x1={104} y1={166} x2={72} y2={110} />
            <line {...on('r21')} x1={110} y1={166} x2={146} y2={110} />
            <line {...on('r12')} x1={160} y1={166} x2={78} y2={108} />
            <line {...on('r22')} x1={166} y1={166} x2={152} y2={110} />
            <circle className="uf20__u" cx={70} cy={88} r={21} />
            <circle className="uf20__u" cx={150} cy={88} r={21} />
            <circle className="uf20__in" cx={26} cy={184} r={10} />
            <text className="uf20__t" x={26} y={212} textAnchor="middle">
              l(t)
            </text>
            <Q x={110} y={180} />
            <Q x={166} y={180} />
          </g>
          <line className="uf20__sep" x1={236} y1={10} x2={236} y2={Math.max(H, 250) - 10} />
          {/* la rete di codifica */}
          {Array.from({ length: k }, (_, s) => {
            const lv = s + 1
            const y0 = ly(lv - 1)
            const y1 = ly(lv)
            const ix = 268
            const iy = (y0 + y1) / 2 + 12
            return (
              <g key={s}>
                <line {...on('w1')} x1={ix + 8} y1={iy - 4} x2={UX[0] - 16} y2={y1 + 10} />
                <line {...on('w2')} x1={ix + 8} y1={iy - 4} x2={UX[1] - 18} y2={y1 + 8} />
                <line {...on('r11')} x1={UX[0]} y1={y0 - 17} x2={UX[0]} y2={y1 + 17} />
                <line {...on('r21')} x1={UX[0] + 8} y1={y0 - 15} x2={UX[1] - 8} y2={y1 + 15} />
                <line {...on('r12')} x1={UX[1] - 8} y1={y0 - 15} x2={UX[0] + 8} y2={y1 + 15} />
                <line {...on('r22')} x1={UX[1]} y1={y0 - 17} x2={UX[1]} y2={y1 + 17} />
                <circle className="uf20__in" cx={ix} cy={iy} r={8} />
                <text className="uf20__t" x={ix - 12} y={iy + 4} textAnchor="end">
                  l({lv})
                </text>
              </g>
            )
          })}
          {Array.from({ length: k + 1 }, (_, lv) => (
            <g key={lv}>
              {UX.map((x) => (
                <circle key={x} className={'uf20__u' + (lv === 0 ? ' is-zero' : '')} cx={x} cy={ly(lv)} r={17} />
              ))}
              <text className="uf20__t uf20__t--mono" x={UX[1] + 34} y={ly(lv) + 4}>
                {lv}
              </text>
            </g>
          ))}
          <text className="uf20__t" x={UX[1] + 28} y={ly(k) - 22}>
            {tx('presente', 'present')}
          </text>
          <text className="uf20__t" x={UX[1] + 28} y={ly(0) + 26}>
            {tx('passato', 'past')}
          </text>
        </svg>
      </div>
      <Controls>
        <Slider label={tx('lunghezza della sequenza di input', 'length of the input sequence')} min={1} max={6} step={1} value={k} onChange={setK} width={230} />
        <div className="readouts">
          <Readout
            label={tx('strati della rete srotolata', 'layers of the unrolled network')}
            tone="accent"
            value={String(k)}
            sub={tx('una replica del modello per passo', 'one replica of the model per step')}
          />
          <Readout label={tx('pesi liberi', 'free weights')} value="6" sub={tx('sempre gli stessi, condivisi tra le repliche', 'always the same, shared among the replicas')} />
        </div>
      </Controls>
      <p className="wnote">
        {hot
          ? tx(`Evidenziato: ${WNAMES[hot]}, in tutte le sue repliche.`, `Highlighted: ${WNAMES[hot]}, in all its replicas.`)
          : tx(
              'Passa sopra un peso (o toccalo): lo stesso colore indica lo stesso peso, replicato a ogni passo.',
              'Hover over a weight (or tap it): the same color indicates the same weight, replicated at each step.',
            )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Evidenzia un peso della RNN: compare, identico, in ogni strato della rete srotolata (pesi condivisi).',
              'Highlight a weight of the RNN: it appears, identical, in every layer of the unrolled network (shared weights).',
            ),
            done: touched,
          },
          {
            label: tx(
              'Allunga la sequenza a 5 o più passi: la rete di codifica diventa profonda, una rete diversa per ogni lunghezza.',
              'Lengthen the sequence to 5 or more steps: the encoding network becomes deep, a different network for each length.',
            ),
            done: seen.deep,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.8: Echo State Network */

type EsnPart = 'in' | 'res' | 'out'
const ESN_TEXT: Record<EsnPart, { title: string; text: string }> = {
  in: {
    title: tx('Strato di input', 'Input layer'),
    text: tx(
      'L’input u(t) (prima indicato con l(t)) entra nel reservoir con i pesi W_in: casuali, non addestrati.',
      'The input u(t) (previously denoted by l(t)) enters the reservoir with the weights W_in: random, not trained.',
    ),
  },
  res: {
    title: 'Reservoir',
    text: tx(
      'Un grande insieme di unità ricorrenti connesse in modo sparso e casuale (pesi Ŵ): non viene addestrato dopo l’inizializzazione casuale. Il suo stato è x(t).',
      'A large set of sparsely and randomly connected recurrent units (weights Ŵ): it is not trained after the random initialization. Its state is x(t).',
    ),
  },
  out: {
    title: 'Readout',
    text: tx(
      'Un semplice strato feedforward di unità lineari (pesi W_out) che legge lo stato x(t) e produce y(t): è l’unica parte addestrata, con metodi lineari efficienti (es. ridge regression).',
      'A simple feedforward layer of linear units (weights W_out) that reads the state x(t) and produces y(t): it is the only trained part, with efficient linear methods (e.g. ridge regression).',
    ),
  },
}

export function Esn() {
  const [seed, setSeed] = useState(0)
  const [sel, setSel] = useState<EsnPart>('res')
  const [clicked, setClicked] = useState<Record<string, boolean>>({})
  const net = useMemo(() => {
    const r = rng(2008 + seed * 41)
    const units: { x: number; y: number }[] = []
    let guard = 0
    while (units.length < 11 && guard++ < 2000) {
      const a = r() * 2 * Math.PI
      const q = Math.sqrt(r())
      const p = { x: 300 + q * 118 * Math.cos(a), y: 130 + q * 78 * Math.sin(a) }
      if (units.every((u) => Math.hypot(u.x - p.x, u.y - p.y) > 44)) units.push(p)
    }
    const edges: [number, number][] = []
    units.forEach((_, i) => units.forEach((__, j) => i !== j && r() < 0.17 && edges.push([i, j])))
    const loops = units.map(() => r() < 0.2)
    return { units, edges, loops }
  }, [seed])
  const pick = (p: EsnPart) => {
    setSel(p)
    setClicked((c) => ({ ...c, [p]: true }))
  }
  const part = (p: EsnPart, children: ReactNode) => (
    <g
      className={'esn20__part' + (sel === p ? ' is-on' : '')}
      role="button"
      tabIndex={0}
      aria-pressed={sel === p}
      aria-label={ESN_TEXT[p].title}
      onClick={() => pick(p)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(p)}
    >
      {children}
    </g>
  )
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="esn20" viewBox="0 0 600 270" style={{ minWidth: 540 }} role="img" aria-label={tx('Echo State Network: input, reservoir casuale, readout lineare', 'Echo State Network: input, random reservoir, linear readout')}>
          <defs>
            <marker id="esn20a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0L10,5L0,10z" className="ru20__head" />
            </marker>
          </defs>
          {part(
            'in',
            <>
              <rect className="esn20__hit" x={14} y={56} width={130} height={170} rx={12} />
              {[0, 1, 2, 3].map((i) => (
                <circle key={i} className="esn20__in" cx={50} cy={92 + i * 30} r={9} />
              ))}
              {[0, 3].map((i) => (
                <line key={i} className="esn20__arrow" x1={62} y1={92 + i * 30} x2={128} y2={104 + i * 18} markerEnd="url(#esn20a)" />
              ))}
              <text className="esn20__m" x={98} y={146} textAnchor="middle">
                {svgScript('W', 'in')}
              </text>
              <text className="esn20__t" x={79} y={246} textAnchor="middle">
                {tx('strato di input · u(t)', 'input layer · u(t)')}
              </text>
              <Die x={108} y={74} />
            </>,
          )}
          {part(
            'res',
            <>
              <ellipse className="esn20__res" cx={300} cy={130} rx={150} ry={104} />
              {net.edges.map(([a, b], i) => {
                const A = net.units[a]
                const B = net.units[b]
                const d = Math.hypot(B.x - A.x, B.y - A.y)
                return (
                  <line
                    key={i}
                    className="esn20__arrow"
                    x1={A.x + ((B.x - A.x) / d) * 10}
                    y1={A.y + ((B.y - A.y) / d) * 10}
                    x2={B.x - ((B.x - A.x) / d) * 12}
                    y2={B.y - ((B.y - A.y) / d) * 12}
                    markerEnd="url(#esn20a)"
                  />
                )
              })}
              {net.units.map((u, i) => (
                <g key={i}>
                  {net.loops[i] && <path className="esn20__arrow" d={`M${u.x - 6},${u.y - 7}c-14,-22 18,-22 8,-2`} markerEnd="url(#esn20a)" />}
                  <circle className="esn20__u" cx={u.x} cy={u.y} r={9} />
                </g>
              ))}
              <text className="esn20__m" x={392} y={62} textAnchor="middle">
                Ŵ
              </text>
              <text className="esn20__t" x={300} y={256} textAnchor="middle">
                reservoir · x(t)
              </text>
              <Die x={330} y={40} />
            </>,
          )}
          {part(
            'out',
            <>
              <rect className="esn20__hit" x={460} y={56} width={128} height={170} rx={12} />
              {[0, 1, 2, 3].map((i) => (
                <circle key={i} className="esn20__out" cx={552} cy={92 + i * 30} r={9} />
              ))}
              {[0, 3].map((i) => (
                <line key={i} className="esn20__arrow" x1={470} y1={104 + i * 18} x2={540} y2={92 + i * 30} markerEnd="url(#esn20a)" />
              ))}
              <text className="esn20__m" x={502} y={146} textAnchor="middle">
                {svgScript('W', 'out')}
              </text>
              <text className="esn20__t" x={524} y={246} textAnchor="middle">
                readout · y(t)
              </text>
            </>,
          )}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          {ESN_TEXT[sel].title} — {sel === 'out' ? tx('addestrato', 'trained') : tx('non addestrato', 'not trained')}
        </div>
        {ESN_TEXT[sel].text}
      </div>
      <Controls>
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          {tx('Rilancia i dadi (nuovo reservoir)', 'Reroll the dice (new reservoir)')}
        </Btn>
      </Controls>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca le tre parti: input e reservoir sono casuali e non addestrati, solo il readout si addestra.',
              'Click the three parts: input and reservoir are random and not trained, only the readout is trained.',
            ),
            done: !!clicked.in && !!clicked.out,
          },
          {
            label: tx('Rilancia i dadi: le connessioni del reservoir sono sparse e casuali.', 'Reroll the dice: the connections of the reservoir are sparse and random.'),
            done: seed >= 1,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.9: organizzazione markoviana */

const STR0 = ['aaaaa', 'abbaa', 'abaab', 'bbbab']
const SUF_COL: Record<string, string> = { aa: 'var(--c-blue)', ab: 'var(--c-orange)', ba: 'var(--c-green)', bb: 'var(--c-violet)' }

/** reservoir di due unità: x(t) = tanh(W_in u(t) + ρ Ŵ x(t−1)), con Ŵ casuale di norma 1 (ρ < 1 = contrattivo) */
function reservoir(seed: number) {
  const r = rng(2009 + seed * 29)
  const win = { a: [0.9 * gauss(r), 0.9 * gauss(r)], b: [0.9 * gauss(r), 0.9 * gauss(r)] }
  // i due input devono spingere lo stato in direzioni ben distinte
  if (Math.hypot(win.a[0] - win.b[0], win.a[1] - win.b[1]) < 1.2) {
    win.b = [-win.a[0], -win.a[1] + 0.8]
  }
  const th = r() * 2 * Math.PI
  const W = [
    [Math.cos(th), -Math.sin(th)],
    [Math.sin(th), Math.cos(th)],
  ]
  return { win, W }
}
function stateOf(s: string, net: ReturnType<typeof reservoir>, rho: number) {
  let x = [0, 0]
  for (const ch of s) {
    const u = net.win[ch as 'a' | 'b']
    x = [Math.tanh(u[0] + rho * (net.W[0][0] * x[0] + net.W[0][1] * x[1])), Math.tanh(u[1] + rho * (net.W[1][0] * x[0] + net.W[1][1] * x[1]))]
  }
  return x
}

function StatePts({ pts }: { pts: { s: string; x: number[] }[] }) {
  const { x, y } = usePlot()
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} className="mk20__pt" cx={x(p.x[0])} cy={y(p.x[1])} r={6.5} style={{ fill: SUF_COL[p.s.slice(-2)] }} />
      ))}
    </g>
  )
}

export function MarkovStates() {
  const [strs, setStrs] = useState(STR0)
  const [rho, setRho] = useState(0.4)
  const [seed, setSeed] = useState(0)
  const [edits, setEdits] = useState(0)
  const net = useMemo(() => reservoir(seed), [seed])
  const pts = strs.map((s) => ({ s, x: stateOf(s, net, rho) }))
  const seen = useLatch({ high: rho >= 0.9 })
  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1])
  return (
    <div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Stringhe di input (clicca una lettera per cambiarla)', 'Input strings (click a letter to change it)')}</div>
          <div className="mk20__strs">
            {strs.map((s, k) => (
              <div key={k} className="mk20__str">
                {[...s].map((ch, i) => (
                  <button
                    key={i}
                    type="button"
                    className={'mk20__ch' + (i >= s.length - 2 ? ' is-suf' : '')}
                    style={i >= s.length - 2 ? { borderColor: SUF_COL[s.slice(-2)] } : undefined}
                    onClick={() => {
                      setStrs(strs.map((q, j) => (j === k ? q.slice(0, i) + (ch === 'a' ? 'b' : 'a') + q.slice(i + 1) : q)))
                      setEdits(edits + 1)
                    }}
                    aria-label={tx(`stringa ${k + 1}, simbolo ${i + 1}: ${ch}`, `string ${k + 1}, symbol ${i + 1}: ${ch}`)}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="wnote">
            {tx(
              'Il tempo scorre da sinistra a destra: gli ultimi due simboli (riquadrati) sono il suffisso, cioè gli input più recenti.',
              'Time runs from left to right: the last two symbols (boxed) are the suffix, that is, the most recent inputs.',
            )}
          </p>
          <div className="readouts">
            <Readout label={tx('distanza tra le prime due', 'distance between the first two')} value={fmt(dist(pts[0].x, pts[1].x), 2)} sub={`${strs[0]} · ${strs[1]}`} />
            <Readout label={tx('tra la prima e la terza', 'between the first and third')} value={fmt(dist(pts[0].x, pts[2].x), 2)} sub={`${strs[0]} · ${strs[2]}`} />
          </div>
        </div>
        <div>
          <div className="htf__title">{tx('Spazio degli stati', 'State space')}</div>
          <Plot xDomain={[-1.1, 1.1]} yDomain={[-1.1, 1.1]} equal aspect={0.85} minH={220} maxH={320} margin={{ l: 30, b: 30 }}>
            <Axes origin xTicks={[]} yTicks={[]} grid={false} />
            <StatePts pts={pts} />
            {pts.map((p, i) => (
              <Label key={i} x={p.x[0]} y={p.x[1]} dx={10} dy={i % 2 ? 14 : -8} className="plot-label--strong">
                {p.s}
              </Label>
            ))}
          </Plot>
        </div>
      </div>
      <Controls>
        <Slider label={tx('contrattività (raggio spettrale ρ)', 'contractivity (spectral radius ρ)')} min={0.1} max={1.2} step={0.05} value={rho} onChange={setRho} format={(v) => fmt(v, 2)} width={250} />
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          {tx('Rilancia i dadi', 'Reroll the dice')}
        </Btn>
        <Btn onClick={() => setStrs(STR0)} disabled={strs === STR0}>
          {tx('Stringhe della figura', 'Strings of the figure')}
        </Btn>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            Un reservoir vero, con due sole unità per poterne disegnare lo stato, a pesi casuali e mai addestrati. Il colore indica il suffisso
            di due simboli.
          </>,
          <>
            A real reservoir, with only two units so that its state can be drawn, with random weights that are never trained. The color
            indicates the two-symbol suffix.
          </>,
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Cambia i primi simboli di una stringa: il punto si sposta poco. Cambia l’ultimo: salta lontano.',
              'Change the first symbols of a string: the point moves a little. Change the last one: it jumps far away.',
            ),
            done: edits >= 2,
          },
          {
            label: tx(
              'Porta ρ vicino a 1 o oltre: la funzione di transizione non è più contrattiva e il passato lontano pesa di più.',
              'Bring ρ close to 1 or beyond: the transition function is no longer contractive and the distant past weighs more.',
            ),
            done: seen.high,
          },
          {
            label: tx(
              'Rilancia i dadi: con pesi casuali diversi le stringhe con lo stesso suffisso restano vicine.',
              'Reroll the dice: with different random weights the strings with the same suffix stay close.',
            ),
            done: seed >= 1,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.10 e 20.11: codifica di alberi */

type T = { l: string; c?: T[] }
type Laid = { l: string; x: number; y: number; h: number; x0: number; x1: number; depth: number; kids: Laid[] }

/** dispone l'albero: le foglie occupano posizioni successive, ogni nodo sta sopra la media dei figli */
function layout(t: T, depth: number, next: { v: number }): Laid {
  const kids = (t.c ?? []).map((k) => layout(k, depth + 1, next))
  if (!kids.length) {
    const x = next.v++
    return { l: t.l, x, y: depth, h: 0, x0: x, x1: x, depth, kids }
  }
  return {
    l: t.l,
    x: (kids[0].x + kids[kids.length - 1].x) / 2,
    y: depth,
    h: 1 + Math.max(...kids.map((k) => k.h)),
    x0: Math.min(...kids.map((k) => k.x0)),
    x1: Math.max(...kids.map((k) => k.x1)),
    depth,
    kids,
  }
}
const flat = (n: Laid): Laid[] => [n, ...n.kids.flatMap(flat)]
const maxDepth = (n: Laid): number => Math.max(n.depth, ...n.kids.map(maxDepth))

function TreeSvg({ tree, step, chem }: { tree: T; step: number; chem?: boolean }) {
  const root = layout(tree, 0, { v: 0 })
  const nodes = flat(root)
  const DX = chem ? 78 : 84
  const DY = chem ? 92 : 84
  const R = chem ? 25 : 20
  const leaves = root.x1 + 1
  const W = leaves * DX + 40
  const H = (maxDepth(root) + 1) * DY + 66
  const px = (x: number) => 20 + DX / 2 + x * DX
  const py = (y: number) => 68 + y * DY
  const bottom = (n: Laid): number => (n.kids.length ? Math.max(...n.kids.map(bottom)) : n.depth)
  return (
    <svg className="tr20" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W * 1.25 }} role="img" aria-label={tx('Codifica di un albero dalle foglie alla radice', 'Encoding of a tree from the leaves to the root')}>
      {/* riquadri annidati: ogni nodo già codificato racchiude il proprio sotto-albero */}
      {nodes
        .slice()
        .sort((a, b) => b.h - a.h)
        .map((n, i) =>
          n.h < step ? (
            <rect
              key={i}
              className={'tr20__box' + (n.h === step - 1 ? ' is-new' : '')}
              x={px(n.x0) - R - 8 - n.h * 5}
              y={py(n.depth) - R - 8 - n.h * 3}
              width={(n.x1 - n.x0) * DX + 2 * (R + 8 + n.h * 5)}
              height={(bottom(n) - n.depth) * DY + 2 * (R + 8) + n.h * 6}
              rx={8}
            />
          ) : null,
        )}
      {nodes.map((n) =>
        n.kids.map((k, j) => {
          const dx = px(k.x) - px(n.x)
          const dy = py(k.y) - py(n.y)
          const d = Math.hypot(dx, dy)
          return (
            <line
              key={`${n.l}-${n.x}-${j}`}
              className="tr20__edge"
              x1={px(n.x) + (dx / d) * R}
              y1={py(n.y) + (dy / d) * R}
              x2={px(k.x) - (dx / d) * (R + 2)}
              y2={py(k.y) - (dy / d) * (R + 2)}
            />
          )
        }),
      )}
      {nodes.map((n, i) => (
        <g key={i} className={'tr20__n' + (n.h < step ? ' is-done' : '') + (n.h === step - 1 ? ' is-new' : '')}>
          <circle cx={px(n.x)} cy={py(n.y)} r={R} />
          <text x={px(n.x)} y={py(n.y) + 5} textAnchor="middle">
            {chem ? n.l.replace(/(\d)/g, '') : n.l}
            {chem && /\d/.test(n.l) && (
              <tspan dy="4" fontSize="0.72em">
                {n.l.replace(/\D/g, '')}
              </tspan>
            )}
          </text>
        </g>
      ))}
      {step > root.h && (
        <g className="tr20__out">
          <path d={`M${px(root.x)},${py(0) - R - 4}V8m-7,9l7,-9l7,9`} />
        </g>
      )}
    </svg>
  )
}

const TREE_A: T = { l: 'f', c: [{ l: 'd', c: [{ l: 'a' }, { l: 'b' }] }, { l: 'e', c: [{ l: 'c' }] }] }
const TREE_B: T = { l: 'f', c: [{ l: 'd', c: [{ l: 'a' }, { l: 'b' }, { l: 'c' }] }, { l: 'e' }] }
const heightOf = (t: T): number => (t.c?.length ? 1 + Math.max(...t.c.map(heightOf)) : 0)

function useSteps(max: number) {
  const [step, setStep] = useState(0)
  return {
    step,
    next: () => setStep(Math.min(max, step + 1)),
    reset: () => setStep(0),
    done: step >= max,
  }
}

export function TreeEncoding() {
  const [which, setWhich] = useState<'a' | 'b'>('a')
  const tree = which === 'a' ? TREE_A : TREE_B
  const max = heightOf(tree) + 1
  const st = useSteps(max)
  const [seenB, setSeenB] = useState(false)
  const msg =
    st.step === 0
      ? tx('Nessun vertice è ancora stato codificato.', 'No vertex has been encoded yet.')
      : st.step === 1
        ? tx('Si parte dalle foglie: lo stato di una foglia dipende solo dal suo label.', 'We start from the leaves: the state of a leaf depends only on its label.')
        : st.done
          ? tx('La radice è codificata: il suo stato riassume tutto l’albero.', 'The root is encoded: its state summarizes the whole tree.')
          : tx(
              'Lo stato di ogni vertice dipende dal suo label e dagli stati dei suoi figli.',
              'The state of each vertex depends on its label and on the states of its children.',
            )
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label={tx('struttura', 'structure')}
          value={which}
          onChange={(v) => {
            setWhich(v)
            st.reset()
            setSeenB(true)
          }}
          options={[
            { value: 'a', label: tx('albero della figura', 'tree of the figure') },
            { value: 'b', label: tx('c spostato sotto d', 'c moved under d') },
          ]}
        />
      </div>
      <div className="wgrid">
        <div className="tr20__wrap">
          <TreeSvg tree={tree} step={st.step} />
        </div>
        <div className="wside">
          <svg className="ru20" viewBox="0 0 230 200" role="img" aria-label={tx('Modello grafico per alberi: lo stato riceve l’input e gli stati dei figli attraverso i ritardi q1…qk', 'Graphical model for trees: the state receives the input and the states of the children through the delays q1…qk')}>
            <defs>
              <marker id="tr20a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0L10,5L0,10z" className="ru20__head" />
              </marker>
            </defs>
            <line className="ru20__arrow" x1={60} y1={176} x2={60} y2={136} markerEnd="url(#tr20a)" />
            <line className="ru20__arrow" x1={60} y1={98} x2={60} y2={70} markerEnd="url(#tr20a)" />
            <line className="ru20__arrow" x1={60} y1={32} x2={60} y2={10} markerEnd="url(#tr20a)" />
            <path className="ru20__loop" d="M76,106C100,84 126,90 128,108" markerEnd="url(#tr20a)" />
            <path className="ru20__loop" d="M76,104C120,62 196,78 198,108" markerEnd="url(#tr20a)" />
            <path className="ru20__loop" d="M128,140C118,160 90,152 76,132" markerEnd="url(#tr20a)" />
            <path className="ru20__loop" d="M198,140C180,180 100,170 70,136" markerEnd="url(#tr20a)" />
            <circle className="ru20__unit" cx={60} cy={51} r={18} />
            <circle className="ru20__unit" cx={60} cy={117} r={18} />
            <rect className="ru20__q" x={112} y={110} width={32} height={30} rx={4} />
            <rect className="ru20__q" x={182} y={110} width={32} height={30} rx={4} />
            <text className="ru20__t ru20__t--sm" x={128} y={130} textAnchor="middle">
              {svgScript('q', '1')}
            </text>
            <text className="ru20__t ru20__t--sm" x={198} y={130} textAnchor="middle">
              {svgScript('q', 'k')}
            </text>
            <text className="ru20__t" x={163} y={130} textAnchor="middle">
              …
            </text>
            <text className="ru20__t" x={60} y={196} textAnchor="middle">
              l
            </text>
            <text className="ru20__t" x={34} y={122} textAnchor="middle">
              x
            </text>
            <text className="ru20__t" x={74} y={16}>
              y
            </text>
          </svg>
          <p className="wnote">
            {tx(
              'Modello grafico per alberi: lo stato x riceve il label l e gli stati dei figli, uno per ogni ritardo.',
              'Graphical model for trees: the state x receives the label l and the states of the children, one for each delay.',
            )}
          </p>
        </div>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          {tx('Passo', 'Step')} {st.step} {tx('di', 'of')} {max}
        </div>
        {msg}
      </div>
      <Controls>
        <Btn icon="step" variant="soft" onClick={st.next} disabled={st.done}>
          {tx('Codifica il livello successivo', 'Encode the next level')}
        </Btn>
        <Btn icon="reset" onClick={st.reset} disabled={st.step === 0}>
          {tx('Ricomincia', 'Restart')}
        </Btn>
      </Controls>
      <Tasks
        items={[
          {
            label: tx('Segui la codifica dal basso verso l’alto, dalle foglie fino alla radice.', 'Follow the encoding bottom-up, from the leaves to the root.'),
            done: st.done,
          },
          {
            label: tx(
              'Cambia la struttura dell’albero e ripeti: la codifica cambia di conseguenza.',
              'Change the structure of the tree and repeat: the encoding changes accordingly.',
            ),
            done: seenB && st.step >= 2,
          },
        ]}
      />
    </div>
  )
}

const CHEM_A: T = { l: 'OH', c: [{ l: 'C', c: [{ l: 'CH3' }, { l: 'CH3' }, { l: 'CH3' }] }] }
const CHEM_B: T = { l: 'O', c: [{ l: 'CH2', c: [{ l: 'CH2', c: [{ l: 'CH3' }] }] }, { l: 'CH3' }] }

export function RecNN() {
  const max = Math.max(heightOf(CHEM_A), heightOf(CHEM_B)) + 1
  const st = useSteps(max)
  return (
    <div>
      <div className="tr20__pair">
        <div>
          <TreeSvg tree={CHEM_A} step={st.step} chem />
        </div>
        <div>
          <TreeSvg tree={CHEM_B} step={st.step} chem />
        </div>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          {tx('Passo', 'Step')} {st.step} {tx('di', 'of')} {max}
        </div>
        {st.step === 0
          ? tx(
              'Due frammenti chimici rappresentati come alberi. La codifica parte dalle foglie («Start»).',
              'Two chemical fragments represented as trees. The encoding starts from the leaves (“Start”).',
            )
          : st.done
            ? tx('Alla radice la rete produce l’uscita per l’albero (la freccia in alto).', 'At the root the network produces the output for the tree (the arrow at the top).')
            : tx(
                'La stessa rete si srotola lungo ciascuna struttura: le unità (e i pesi) sono le stesse per tutti i vertici di un albero e per tutti gli alberi.',
                'The same network is unrolled along each structure: the units (and the weights) are the same for all the vertices of a tree and for all the trees.',
              )}
      </div>
      <Controls>
        <Btn icon="step" variant="soft" onClick={st.next} disabled={st.done}>
          {st.step === 0 ? tx('Start: codifica le foglie', 'Start: encode the leaves') : tx('Codifica il livello successivo', 'Encode the next level')}
        </Btn>
        <Btn icon="reset" onClick={st.reset} disabled={st.step === 0}>
          {tx('Ricomincia', 'Restart')}
        </Btn>
      </Controls>
      <Tasks
        items={[
          {
            label: tx(
              'Porta la codifica fino alle radici dei due alberi: strutture diverse danno reti srotolate diverse, con gli stessi pesi.',
              'Carry the encoding up to the roots of the two trees: different structures give different unrolled networks, with the same weights.',
            ),
            done: st.done,
          },
        ]}
      />
    </div>
  )
}
