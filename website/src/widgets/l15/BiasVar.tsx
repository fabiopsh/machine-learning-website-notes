import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import {
  FITS,
  GRID,
  LN_MAX,
  LN_MIN,
  LN_NOTES,
  MEAN_W,
  NOISE_VAR,
  XMAX,
  biasVarAt,
  lambdaFit,
  lineAt,
  lineSet,
  setLnLambda,
  sine,
  trueF,
  useLnLambda,
  type LineSet,
} from './bv'

const X_DOM: [number, number] = [0, XMAX]
const Y_DOM: [number, number] = [-1, 12.5]
const Y_TICKS = [0, 2, 4, 6, 8, 10, 12]
const X_TICKS = [0, 2, 4, 6, 8, 10]

/** molte rette sottili in un solo <path> */
function Lines({ sets, color, opacity = 0.45 }: { sets: LineSet[]; color: string; opacity?: number }) {
  const { x, y, clipId } = usePlot()
  const d = sets
    .map((s) => `M${x(0).toFixed(1)},${y(lineAt(s.w, 0)).toFixed(1)}L${x(XMAX).toFixed(1)},${y(lineAt(s.w, XMAX)).toFixed(1)}`)
    .join('')
  return <path d={d} fill="none" stroke={color} strokeWidth={1} opacity={opacity} clipPath={`url(#${clipId})`} />
}

/* ------------------------------------------------------------------ Fig. 15.1 */

export function TwentyPoints() {
  const [seed, setSeed] = useState(0)
  const [n, setN] = useState(0)
  const d = lineSet(seed)
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'i 20 punti del dataset', color: 'var(--c-blue)', kind: 'dot' },
            { label: 'funzione vera', color: 'var(--c-green)' },
            { label: 'ipotesi lineare adattata', color: 'var(--c-red)' },
          ]}
        />
      </div>
      <Plot xDomain={X_DOM} yDomain={Y_DOM} aspect={0.58}>
        <Axes xTicks={X_TICKS} yTicks={Y_TICKS} xLabel="x" yLabel="y" />
        <FnPath f={trueF} color="var(--c-green)" width={2.2} />
        <FnPath f={(x) => lineAt(d.w, x)} color="var(--c-red)" width={2.4} samples={2} />
        {d.xs.map((x, i) => (
          <Dot key={i} x={x} y={d.ys[i]} color="var(--c-blue)" r={4} />
        ))}
      </Plot>
      <Controls>
        <div className="readouts">
          <Readout
            label="retta adattata"
            tone="red"
            value={<Tex>{`h(x) = ${fmt(d.w[1], 2)}\\,x ${d.w[0] < 0 ? '-' : '+'} ${fmt(Math.abs(d.w[0]), 2)}`}</Tex>}
          />
        </div>
        <Btn
          icon="reset"
          onClick={() => {
            setSeed(seed + 1)
            setN(n + 1)
          }}
        >
          Nuovo dataset
        </Btn>
        {seed !== 0 && (
          <Btn variant="ghost" onClick={() => setSeed(0)}>
            Il primo dataset
          </Btn>
        )}
      </Controls>
      <Tasks
        items={[
          {
            label: 'Estrai tre dataset nuovi: la funzione vera resta la stessa, ma la retta trovata cambia ogni volta.',
            done: n >= 3,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 15.2 */

export function FiftyFits() {
  const [k, setK] = useState(50)
  const seen = useLatch({ few: k <= 5 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'rette adattate (una per dataset)', color: 'var(--c-red)' },
            { label: 'funzione vera', color: 'var(--c-green)' },
          ]}
        />
      </div>
      <Plot xDomain={X_DOM} yDomain={Y_DOM} aspect={0.58}>
        <Axes xTicks={X_TICKS} yTicks={Y_TICKS} xLabel="x" yLabel="y" />
        <Lines sets={FITS.slice(0, k)} color="var(--c-red)" opacity={k <= 5 ? 0.9 : 0.5} />
        <FnPath f={trueF} color="var(--c-green)" width={2.2} />
      </Plot>
      <Controls>
        <Slider label="numero di dataset (di 20 punti ciascuno)" min={1} max={50} step={1} value={k} onChange={setK} width={300} />
      </Controls>
      <Tasks
        items={[
          {
            label: 'Scendi a pochi dataset e poi risali a 50: ogni dataset dà una retta diversa, e nessuna segue le onde della funzione vera.',
            done: seen.few,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 15.4 */

export function VarianceFits() {
  const [xq, setXq] = useState(6.3)
  const [showF, setShowF] = useState(false)
  const b = biasVarAt(xq)
  const sd = Math.sqrt(b.variance)
  const seen = useLatch({ f: showF, low: b.bias2 < 0.02, high: b.bias2 > 2.5 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'le 50 ipotesi', color: 'var(--ink-3)' },
            { label: <>predizione media</>, color: 'var(--c-red)' },
            ...(showF ? [{ label: 'funzione vera', color: 'var(--c-green)' }] : []),
          ]}
        />
        <Toggle label="mostra la funzione vera" checked={showF} onChange={setShowF} />
      </div>
      <Plot xDomain={X_DOM} yDomain={Y_DOM} aspect={0.58}>
        <Axes xTicks={X_TICKS} yTicks={Y_TICKS} xLabel="x" yLabel="y" />
        <Lines sets={FITS} color="var(--ink-2)" opacity={0.4} />
        {showF && <FnPath f={trueF} color="var(--c-green)" width={2.2} />}
        <FnPath f={(x) => lineAt(MEAN_W, x)} color="var(--c-red)" width={2.8} samples={2} />
        <Polyline
          pts={[
            { x: xq, y: Y_DOM[0] },
            { x: xq, y: Y_DOM[1] },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        {/* dispersione delle ipotesi in x: ± una deviazione standard attorno alla media */}
        <Polyline
          pts={[
            { x: xq, y: b.hbar - sd },
            { x: xq, y: b.hbar + sd },
          ]}
          color="var(--c-violet)"
          width={5}
        />
        {showF && (
          <>
            <Polyline
              pts={[
                { x: xq + 0.12, y: b.hbar },
                { x: xq + 0.12, y: trueF(xq) },
              ]}
              color="var(--c-green)"
              width={2.5}
            />
            <Dot x={xq} y={trueF(xq)} color="var(--c-green)" r={4.5} />
          </>
        )}
        <Dot x={xq} y={b.hbar} color="var(--c-red)" r={4.5} />
        <Label x={8.6} y={lineAt(MEAN_W, 8.6) - 2.2} className="plot-label--math">
          h̄(x)
        </Label>
        <Handle x={xq} y={Y_DOM[0]} axis="x" label="punto x" onMove={(p) => setXq(Math.round(p.x * 20) / 20)} />
      </Plot>
      <Controls>
        <div className="readouts">
          <Readout label={<Tex>{'x'}</Tex>} tone="accent" value={fmt(xq, 2)} />
          <Readout label="varianza" tone="violet" value={fmt(b.variance, 3)} sub="dispersione delle 50 rette" />
          <Readout
            label={
              <>bias²</>
            }
            tone="green"
            value={fmt(b.bias2, 3)}
            sub={<Tex>{'(\\bar h(x) - f(x))^2'}</Tex>}
          />
          <Readout
            label={
              <>rumore²</>
            }
            value={fmt(NOISE_VAR, 3)}
            sub={<Tex>{'\\sigma^2'}</Tex>}
          />
          <Readout label="errore atteso" value={fmt(b.variance + b.bias2 + NOISE_VAR, 3)} sub="la somma dei tre" />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Mostra la funzione vera: il tratto verde è la distanza tra la media delle rette e la funzione, cioè il bias.', done: seen.f },
          { label: 'Sposta x dove la media incrocia la funzione vera: il bias si annulla, restano varianza e rumore.', done: seen.f && seen.low },
          { label: 'Sposta x su una cresta o in una valle della funzione vera: l’errore è quasi tutto bias.', done: seen.f && seen.high },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 15.3 */

const HC = { x: 285, y: 262 }
const OPT = { x: 462, y: 58 }
const DATA = { x: 560, y: 58 }
const UNIT = (() => {
  const dx = OPT.x - HC.x
  const dy = OPT.y - HC.y
  const n = Math.hypot(dx, dy)
  return { x: dx / n, y: dy / n }
})()
/** posizioni (nel cerchio unitario) delle soluzioni dei vari training set */
const OFFS = (() => {
  const r = rng(153)
  const out: [number, number][] = [
    [-0.55, 0.3],
    [0.45, 0.55],
  ]
  while (out.length < 12) {
    const a = r() * 2 * Math.PI
    const q = 0.25 + 0.65 * Math.sqrt(r())
    out.push([q * Math.cos(a), q * Math.sin(a)])
  }
  return out
})()

type Part = 'var' | 'bias' | 'noise' | null

export function SpaceView() {
  const [size, setSize] = useState(0.55)
  const [n, setN] = useState(2)
  const [hot, setHot] = useState<Part>(null)
  const rx = 150 + 125 * size
  const ry = 82 + 58 * size
  // distanza del bordo di H nella direzione dell'ottimo
  const db = 1 / Math.sqrt((UNIT.x / rx) ** 2 + (UNIT.y / ry) ** 2)
  const c = { x: HC.x + UNIT.x * db * 0.5, y: HC.y + UNIT.y * db * 0.5 }
  const rrx = db * 0.42
  const rry = db * 0.3
  const seen = useLatch({ small: size <= 0.1, big: size >= 0.95, more: n >= 6 })
  const cls = (p: Part) => (hot === p ? ' is-hot' : hot ? ' is-dim' : '')
  const on = (p: Part) => ({
    onPointerEnter: () => setHot(p),
    onPointerLeave: () => setHot(null),
    onFocus: () => setHot(p),
    onBlur: () => setHot(null),
    tabIndex: 0,
  })
  return (
    <div>
      <svg className="sv15" viewBox="0 0 640 400" role="img" aria-label="Vista grafica di bias, varianza e rumore nello spazio delle funzioni">
        <ellipse className="sv15__h" cx={HC.x} cy={HC.y} rx={rx} ry={ry} />
        <text className="sv15__cap" x={HC.x - rx + 26} y={HC.y + ry * 0.55}>
          insieme delle funzioni
        </text>
        <ellipse className={'sv15__reg' + cls('var')} cx={c.x} cy={c.y} rx={rrx} ry={rry} />
        <g className={'sv15__seg sv15__seg--bias' + cls('bias')}>
          <line x1={c.x} y1={c.y} x2={OPT.x} y2={OPT.y} />
        </g>
        <g className={'sv15__seg sv15__seg--noise' + cls('noise')}>
          <line x1={OPT.x} y1={OPT.y} x2={DATA.x} y2={DATA.y} />
        </g>
        {OFFS.slice(0, n).map(([a, b], i) => (
          <circle key={i} className="sv15__sol" cx={c.x + a * rrx} cy={c.y + b * rry} r={5.5} />
        ))}
        <circle className="sv15__mean" cx={c.x} cy={c.y} r={6.5} />
        <circle className="sv15__pt" cx={OPT.x} cy={OPT.y} r={6.5} />
        <circle className="sv15__pt" cx={DATA.x} cy={DATA.y} r={6.5} />
        <text className="sv15__lbl" x={OPT.x} y={OPT.y - 16} textAnchor="middle">
          soluzione ottima
        </text>
        <text className="sv15__lbl" x={DATA.x + 13} y={DATA.y + 5}>
          dati
        </text>
        <text className={'sv15__name' + cls('noise')} x={(OPT.x + DATA.x) / 2} y={OPT.y + 27} textAnchor="middle">
          rumore
        </text>
        <text className={'sv15__name' + cls('bias')} x={(c.x + OPT.x) / 2 + 14} y={(c.y + OPT.y) / 2 + 4}>
          bias
        </text>
        <text className={'sv15__name sv15__name--in' + cls('var')} x={c.x} y={c.y + rry + 20} textAnchor="middle">
          varianza
        </text>
        <text className="sv15__lbl sv15__lbl--sm" x={c.x - rrx - 8} y={c.y - rry - 22} textAnchor="end">
          <tspan x={c.x - rrx - 8}>soluzioni ottenute con</tspan>
          <tspan x={c.x - rrx - 8} dy="1.2em">
            training set diversi
          </tspan>
        </text>
      </svg>
      <div className="sv15__keys">
        <button type="button" className={'sv15__key' + cls('var')} {...on('var')}>
          <b>Varianza</b> — l’ampiezza della regione delle soluzioni: training set diversi producono soluzioni diverse.
        </button>
        <button type="button" className={'sv15__key' + cls('bias')} {...on('bias')}>
          <b>Bias</b> — la distanza tra il centro della regione (la media delle soluzioni) e la soluzione ottima.
        </button>
        <button type="button" className={'sv15__key' + cls('noise')} {...on('noise')}>
          <b>Rumore</b> — la distanza tra la soluzione ottima e i dati: non dipende dal modello.
        </button>
      </div>
      <Controls>
        <Slider
          label="ampiezza dell’insieme delle funzioni"
          min={0}
          max={1}
          step={0.01}
          value={size}
          onChange={setSize}
          format={(v) => (v < 0.34 ? 'piccolo' : v < 0.67 ? 'medio' : 'grande')}
          width={280}
        />
        <Btn icon="play" onClick={() => setN(Math.min(OFFS.length, n + 1))} disabled={n >= OFFS.length}>
          Un altro training set
        </Btn>
        <Btn icon="reset" onClick={() => setN(2)} disabled={n === 2}>
          Ricomincia
        </Btn>
      </Controls>
      <Tasks
        items={[
          { label: 'Aggiungi altri training set: ognuno dà una soluzione diversa, dentro la regione scura.', done: seen.more },
          {
            label: 'Rimpicciolisci l’insieme delle funzioni: la regione si stringe (meno varianza) ma si allontana dall’ottimo (più bias).',
            done: seen.small,
          },
          { label: 'Ingrandiscilo: la regione delle soluzioni si allarga, perché la sua ampiezza dipende da quella dell’insieme.', done: seen.big },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 15.5: le freccette */

type Board = { id: string; bias: boolean; variance: boolean }
const BOARDS: Board[] = [
  { id: 'll', bias: false, variance: false },
  { id: 'lh', bias: false, variance: true },
  { id: 'hl', bias: true, variance: false },
  { id: 'hh', bias: true, variance: true },
]
const NDARTS = 22

function darts(b: Board, seed: number) {
  const r = rng(77 + seed * 131 + (b.bias ? 7 : 0) + (b.variance ? 31 : 0))
  const spread = b.variance ? 20 : 4.5
  const off = b.bias ? { x: -6, y: -40 } : { x: 0, y: 0 }
  return Array.from({ length: NDARTS }, () => {
    const a = r() * 2 * Math.PI
    const q = spread * Math.sqrt(-2 * Math.log(1 - r() * 0.98)) * 0.75
    return { x: off.x + q * Math.cos(a), y: off.y + q * Math.sin(a) }
  })
}

const BOARD_TEXT: Record<string, { title: string; text: string; tone: string }> = {
  ll: { title: 'Basso bias, bassa varianza', text: 'Le freccette sono tutte al centro: il caso ideale.', tone: 'good' },
  lh: {
    title: 'Basso bias, alta varianza',
    text: 'Le freccette sono sparse attorno al centro: in media sono giuste, ma ognuna può finire lontano. Corrisponde all’overfitting.',
    tone: 'warn',
  },
  hl: {
    title: 'Alto bias, bassa varianza',
    text: 'Le freccette sono raggruppate ma lontane dal centro: tutte sbagliano nello stesso modo. Corrisponde all’underfitting.',
    tone: 'warn',
  },
  hh: { title: 'Alto bias, alta varianza', text: 'Le freccette sono sparse e lontane dal centro.', tone: 'bad' },
}

export function Darts() {
  const [sel, setSel] = useState<string | null>(null)
  const [seed, setSeed] = useState(0)
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const all = useMemo(() => BOARDS.map((b) => darts(b, seed)), [seed])
  const info = sel ? BOARD_TEXT[sel] : null
  return (
    <div>
      <div className="darts15">
        <span />
        <span className="darts15__col">Bassa varianza</span>
        <span className="darts15__col">Alta varianza</span>
        {BOARDS.map((b, i) => (
          <DartCell key={b.id} first={i % 2 === 0} label={b.bias ? 'Alto bias' : 'Basso bias'}>
            <button
              type="button"
              className={'darts15__board' + (sel === b.id ? ' is-on' : '')}
              aria-pressed={sel === b.id}
              aria-label={BOARD_TEXT[b.id].title}
              onClick={() => {
                setSel(b.id)
                setPicked((p) => ({ ...p, [b.id]: true }))
              }}
            >
              <svg viewBox="-70 -70 140 140" aria-hidden="true">
                <circle className="darts15__ring darts15__ring--0" r={64} />
                <circle className="darts15__ring darts15__ring--1" r={46} />
                <circle className="darts15__ring darts15__ring--0" r={27} />
                <circle className="darts15__bull" r={9} />
                {all[i].map((d, j) => (
                  <circle key={j} className="darts15__dart" cx={d.x} cy={d.y} r={2.6} />
                ))}
              </svg>
            </button>
          </DartCell>
        ))}
      </div>
      <Controls>
        {info ? (
          <div className="wpanel darts15__info">
            <div className="wpanel__title">{info.title}</div>
            {info.text}
          </div>
        ) : (
          <p className="wnote">Clicca un bersaglio per leggere a quale situazione corrisponde.</p>
        )}
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          Rilancia le freccette
        </Btn>
      </Controls>
      <Tasks
        items={[
          { label: 'Trova il bersaglio che corrisponde all’underfitting.', done: !!picked.hl },
          { label: 'Trova quello che corrisponde all’overfitting.', done: !!picked.lh },
        ]}
      />
    </div>
  )
}

function DartCell({ first, label, children }: { first: boolean; label: string; children: ReactNode }) {
  return (
    <>
      {first && <span className="darts15__row">{label}</span>}
      {children}
    </>
  )
}

/* ------------------------------------------------------------------ Fig. 15.6 */

const S_DOM: [number, number] = [-1.6, 1.6]
const S_TICKS = [-1, 0, 1]

function Curves({ rows, color }: { rows: number[][]; color: string }) {
  const { x, y, clipId } = usePlot()
  const d = rows.map((row) => 'M' + row.map((v, i) => `${x(GRID[i]).toFixed(1)},${y(v).toFixed(1)}`).join('L')).join('')
  return <path d={d} fill="none" stroke={color} strokeWidth={1} opacity={0.6} clipPath={`url(#${clipId})`} />
}

const lamLabel = (v: number) => fmt(v, 2)

export function LambdaFits() {
  const ln = useLnLambda()
  const fit = useMemo(() => lambdaFit(ln), [ln])
  const seen = useLatch({ mid: Math.abs(ln + 0.31) < 0.006, low: ln <= -2.4 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'ipotesi apprese (una per dataset)', color: 'var(--c-red)' },
            { label: 'funzione vera', color: 'var(--c-green)' },
          ]}
        />
        <Segmented
          size="sm"
          label={<Tex>{'\\ln\\lambda'}</Tex>}
          value={LN_NOTES.find((v) => Math.abs(v - ln) < 0.006) ?? 'altro'}
          onChange={(v) => typeof v === 'number' && setLnLambda(v)}
          options={LN_NOTES.map((v) => ({ value: v as number | string, label: lamLabel(v) }))}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">Le 25 ipotesi</div>
          <Plot xDomain={[0, 1]} yDomain={S_DOM} aspect={0.72} minH={190} maxH={300} margin={{ l: 34, r: 10 }}>
            <Axes xTicks={[0, 1]} yTicks={S_TICKS} xLabel="x" yLabel="t" />
            <Curves rows={fit.curves} color="var(--c-red)" />
          </Plot>
        </div>
        <div>
          <div className="htf__title">La loro media e la funzione vera</div>
          <Plot xDomain={[0, 1]} yDomain={S_DOM} aspect={0.72} minH={190} maxH={300} margin={{ l: 34, r: 10 }}>
            <Axes xTicks={[0, 1]} yTicks={S_TICKS} xLabel="x" yLabel="t" />
            <FnPath f={sine} color="var(--c-green)" width={2.4} />
            <Polyline pts={fit.mean.map((v, i) => ({ x: GRID[i], y: v }))} color="var(--c-red)" width={2.4} />
          </Plot>
        </div>
      </div>
      <Controls>
        <Slider
          label={<Tex>{'\\ln\\lambda'}</Tex>}
          min={LN_MIN}
          max={LN_MAX}
          step={0.01}
          value={ln}
          onChange={setLnLambda}
          format={lamLabel}
          width={280}
        />
        <div className="readouts">
          <Readout
            label={
              <>bias²</>
            }
            tone="blue"
            value={fmt(fit.bias2, 3)}
          />
          <Readout label="varianza" tone="red" value={fmt(fit.variance, 3)} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Passa a ln λ = −0,31: le curve si allargano e la media si avvicina alla sinusoide.', done: seen.mid },
          {
            label: 'Scendi a ln λ = −2,4 (o meno): le 25 curve sono molto diverse tra loro, ma la loro media coincide quasi con la sinusoide.',
            done: seen.low,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 15.7 */

const LN_GRID = Array.from({ length: Math.round((LN_MAX - LN_MIN) / 0.1) + 1 }, (_, i) => Math.round((LN_MIN + i * 0.1) * 100) / 100)
const T_MAX = 0.18

export function Tradeoff() {
  const ln = useLnLambda()
  const rows = useMemo(() => LN_GRID.map((v) => ({ v, ...lambdaFit(v) })), [])
  const cur = useMemo(() => lambdaFit(ln), [ln])
  const best = rows.reduce((a, b) => (b.bias2 + b.variance < a.bias2 + a.variance ? b : a))
  const bestT = rows.reduce((a, b) => (b.test < a.test ? b : a))
  const [moved, setMoved] = useState(false)
  const seen = useLatch({ min: moved && Math.abs(ln - best.v) <= 0.1, left: moved && ln <= -2.5 })
  const line = (f: (r: (typeof rows)[number]) => number) => rows.map((r) => ({ x: r.v, y: Math.min(T_MAX, f(r)) }))
  const move = (v: number) => {
    setMoved(true)
    setLnLambda(v)
  }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            {
              label: (
                <>bias²</>
              ),
              color: 'var(--c-blue)',
            },
            { label: 'varianza', color: 'var(--c-red)' },
            {
              label: (
                <>bias² + varianza</>
              ),
              color: 'var(--c-violet)',
            },
            { label: 'errore di test', color: 'var(--ink)' },
          ]}
        />
      </div>
      <Plot xDomain={[LN_MIN, LN_MAX]} yDomain={[0, T_MAX]} aspect={0.56} margin={{ b: 40 }}>
        <Axes xTicks={[-3, -2, -1, 0, 1, 2]} yTicks={[0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18]} yFormat={(v) => fmt(v, 2)} xLabel="ln λ" />
        <Polyline pts={line((r) => r.test)} color="var(--ink)" width={2.4} />
        <Polyline pts={line((r) => r.bias2 + r.variance)} color="var(--c-violet)" width={2.4} />
        <Polyline pts={line((r) => r.variance)} color="var(--c-red)" width={2.2} />
        <Polyline pts={line((r) => r.bias2)} color="var(--c-blue)" width={2.2} />
        <Label x={LN_MIN + 0.1} y={T_MAX * 0.94} className="plot-label--muted">
          ← complessità più alta
        </Label>
        <Label x={LN_MAX - 0.75} y={T_MAX * 0.94} anchor="end" className="plot-label--muted">
          underfitting →
        </Label>
        <Polyline
          pts={[
            { x: ln, y: 0 },
            { x: ln, y: T_MAX },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Dot x={ln} y={Math.min(T_MAX, cur.bias2 + cur.variance)} color="var(--c-violet)" />
        <Dot x={ln} y={Math.min(T_MAX, cur.test)} color="var(--ink)" />
        <Handle x={ln} y={0} axis="x" label="ln λ" onMove={(p) => move(Math.round(p.x * 10) / 10)} />
      </Plot>
      <Controls>
        <div className="readouts">
          <Readout label={<Tex>{'\\ln\\lambda'}</Tex>} tone="accent" value={fmt(ln, 2)} />
          <Readout
            label={
              <>bias²</>
            }
            tone="blue"
            value={fmt(cur.bias2, 3)}
          />
          <Readout label="varianza" tone="red" value={fmt(cur.variance, 3)} />
          <Readout label="somma" tone="violet" value={fmt(cur.bias2 + cur.variance, 3)} sub={`minimo a ln λ = ${fmt(best.v, 1)}`} />
          <Readout label="errore di test" value={fmt(cur.test, 3)} sub={`minimo a ln λ = ${fmt(bestT.v, 1)}`} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Porta ln λ sul minimo della somma (viola): l’errore di test (nero) ha il minimo circa nello stesso punto.', done: seen.min },
          { label: 'Vai tutto a sinistra (λ piccolo): il bias è quasi zero, l’errore è dovuto alla varianza.', done: seen.left },
        ]}
      />
    </div>
  )
}
