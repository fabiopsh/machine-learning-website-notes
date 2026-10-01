import { useMemo, useState } from 'react'
import { Arrow, Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { Surface3D, type Overlay, type V3 } from '../common/Surface3D'

type P = { x: number; y: number }
const f2 = (v: number) => fmt(v).replace(',', '{,}').replace('−', '-')
const sg = (v: number) => (v >= 0 ? '+' : '-')

/** retta w₁x₁ + w₂x₂ + w₀ = 0 tra i bordi di un riquadro (per disegnarla) */
function lineIn(w1: number, w2: number, w0: number, X: [number, number], Y: [number, number]): P[] {
  if (Math.abs(w2) > Math.abs(w1)) return [X[0] - 5, X[1] + 5].map((x) => ({ x, y: (-w0 - w1 * x) / w2 }))
  return [Y[0] - 5, Y[1] + 5].map((y) => ({ x: (-w0 - w2 * y) / w1, y }))
}

/* ------------------------------------------------------------------ Fig. 5.2 */

const HX: [number, number] = [0, 4.5]
const HY: [number, number] = [0, 4]
const EXAMPLES = [
  { x: 1, y: 1, d: 1 },
  { x: 0.5, y: 3, d: 1 },
  { x: 2, y: 2, d: 0 },
]

export function Hyperplane3D() {
  const [w0, setW0] = useState(1.6)
  const [w1, setW1] = useState(-1)
  const [w2, setW2] = useState(-0.25)
  const f = useMemo(() => (a: number, b: number) => Math.max(-5, Math.min(5, w0 + w1 * a + w2 * b)), [w0, w1, w2])
  const h = (p: P) => (w0 + w1 * p.x + w2 * p.y >= 0 ? 1 : 0)
  const right = EXAMPLES.filter((e) => h(e) === e.d).length
  const moved = useLatch({ m: w0 !== 1.6 || w1 !== -1 || w2 !== -0.25 }).m
  const seen = useLatch({ moved, wrong: moved && right < 3, back: moved && right === 3 })

  const overlays = useMemo<Overlay[]>(() => {
    const seg = clipLine(w1, w2, w0)
    const list: Overlay[] = []
    if (seg) list.push({ kind: 'line', a: [seg[0].x, seg[0].y, 0], b: [seg[1].x, seg[1].y, 0], color: 'var(--c-red)', width: 3.2 })
    for (const e of EXAMPLES) {
      const z = w0 + w1 * e.x + w2 * e.y
      list.push({
        kind: 'line',
        a: [e.x, e.y, 0],
        b: [e.x, e.y, Math.max(-5, Math.min(5, z))],
        color: 'var(--ink-3)',
        width: 1.2,
        dash: [3, 4],
      })
      list.push({ kind: 'point', p: [e.x, e.y, 0] as V3, color: e.d ? 'var(--c-blue)' : 'var(--c-orange)', r: 6 })
    }
    return list
  }, [w0, w1, w2])

  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <Tex>{'z = \\mathbf{w}^T\\mathbf{x} + w_0'}</Tex>, color: 'var(--c-blue)', kind: 'area' },
            { label: tx('confine di decisione', 'decision boundary'), color: 'var(--c-red)' },
            { label: tx('esempi con y = 1', 'examples with y = 1'), color: 'var(--c-blue)', kind: 'dot' },
            { label: tx('con y = 0', 'with y = 0'), color: 'var(--c-orange)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Surface3D
          f={f}
          x={HX}
          y={HY}
          z={[-5, 5]}
          n={24}
          plane={0}
          floor={false}
          overlays={overlays}
          zScale={0.8}
          aspect={0.82}
          initial={{ yaw: -0.75, pitch: 0.5 }}
          axisLabels={['x₁', 'x₂', 'z']}
          ariaLabel={tx("Il piano w^T x attraversa il piano degli input lungo il confine di decisione", "The plane w^T x crosses the input plane along the decision boundary")}
        />
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{tx('Il confine di decisione', 'The decision boundary')}</div>
            <div className="wmath">
              <Tex>{`${f2(w0)} ${sg(w1)} ${f2(Math.abs(w1))}\\,x_1 ${sg(w2)} ${f2(Math.abs(w2))}\\,x_2 = 0`}</Tex>
            </div>
          </div>
          <table className="hyp__table">
            <thead>
              <tr>
                <th>{tx('esempio', 'example')}</th>
                <th>
                  <Tex>{'\\mathbf{w}^T\\mathbf{x}+w_0'}</Tex>
                </th>
                <th>h</th>
                <th>y</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((e, i) => {
                const z = w0 + w1 * e.x + w2 * e.y
                const ok = h(e) === e.d
                return (
                  <tr key={i} className={ok ? undefined : 'is-bad'}>
                    <td>
                      ({fmt(e.x, 1)}; {fmt(e.y, 1)})
                    </td>
                    <td className="hyp__num">{fmt(z)}</td>
                    <td className="hyp__num">{h(e)}</td>
                    <td className="hyp__num">{e.d}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="controls">
        <Slider label={<Tex>{'w_0'}</Tex>} min={-3} max={3} step={0.05} value={w0} onChange={setW0} format={(v) => fmt(v)} width={180} />
        <Slider
          label={<Tex>{'w_1'}</Tex>}
          min={-1.5}
          max={1.5}
          step={0.05}
          value={w1}
          onChange={setW1}
          format={(v) => fmt(v)}
          width={180}
        />
        <Slider
          label={<Tex>{'w_2'}</Tex>}
          min={-1.5}
          max={1.5}
          step={0.05}
          value={w2}
          onChange={setW2}
          format={(v) => fmt(v)}
          width={180}
        />
      </div>
      <Tasks
        items={[
          { label: tx('Muovi i pesi: il piano si inclina e la retta rossa (dove il piano taglia z = 0) si sposta.', 'Adjust the weights: the plane tilts and the red line (where the plane cuts z = 0) moves.'), done: seen.moved },
          { label: tx('Fai sbagliare almeno un esempio: il suo punto finisce dal lato «sbagliato» del piano.', 'Make at least one example misclassified: its point ends up on the “wrong” side of the plane.'), done: seen.wrong },
          { label: tx('Ritrova pesi che classificano bene tutti e tre gli esempi.', 'Find weights that correctly classify all three examples again.'), done: seen.back },
        ]}
      />
    </div>
  )
}

/** segmento della retta w₁x₁ + w₂x₂ + w₀ = 0 dentro il rettangolo degli input */
function clipLine(w1: number, w2: number, w0: number): [P, P] | null {
  const pts: P[] = []
  const g = (x: number, y: number) => w0 + w1 * x + w2 * y
  const corners: P[] = [
    { x: HX[0], y: HY[0] },
    { x: HX[1], y: HY[0] },
    { x: HX[1], y: HY[1] },
    { x: HX[0], y: HY[1] },
  ]
  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % 4]
    const ga = g(a.x, a.y)
    const gb = g(b.x, b.y)
    if (ga === 0) pts.push(a)
    if (ga * gb < 0) {
      const t = ga / (ga - gb)
      pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return pts.length >= 2 ? [pts[0], pts[1]] : null
}

/* ------------------------------------------------------------------ Fig. 5.3 */

// dati sismici letti dalla figura (x₁ onde di volume, x₂ onde di superficie)
const QUAKES: P[] = [
  [4.85, 4.8],
  [5.05, 6.0],
  [5.2, 4.5],
  [5.2, 4.15],
  [5.25, 5.0],
  [5.35, 4.95],
  [5.4, 5.55],
  [5.5, 5.2],
  [5.5, 5.7],
  [5.6, 5.85],
  [5.65, 5.6],
  [5.75, 5.55],
  [5.8, 5.75],
  [5.9, 5.9],
  [5.95, 6.05],
  [5.9, 5.45],
  [6.0, 6.6],
  [6.05, 5.6],
  [6.1, 6.1],
  [6.1, 6.3],
  [6.2, 6.5],
  [6.15, 6.75],
  [6.2, 6.9],
  [6.3, 6.8],
  [6.35, 6.55],
  [6.3, 5.9],
  [6.55, 7.0],
].map(([x, y]) => ({ x, y }))
const BLASTS: P[] = [
  [5.2, 3.4],
  [5.5, 3.8],
  [5.7, 3.8],
  [5.75, 4.2],
  [5.85, 4.35],
  [5.9, 4.5],
  [5.95, 4.25],
  [6.0, 4.4],
  [6.05, 4.7],
  [6.1, 4.55],
  [6.15, 4.8],
  [6.2, 4.65],
  [6.25, 4.85],
  [6.1, 4.3],
  [5.9, 3.8],
].map(([x, y]) => ({ x, y }))
const SX: [number, number] = [4.4, 7.1]
const SY: [number, number] = [2.5, 7.5]
const sismic = (p: P) => -4.9 + 1.7 * p.x - p.y

export function Seismic() {
  const [q, setQ] = useState<P>({ x: 6, y: 3 })
  const v = sismic(q)
  const cls = v >= 0 ? 1 : -1
  const moved = useLatch({ m: Math.abs(q.x - 6) > 0.02 || Math.abs(q.y - 3) > 0.02 }).m
  const seen = useLatch({ quake: cls < 0, near: moved && Math.abs(v) < 0.08 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('terremoti', 'earthquakes'), color: 'var(--c-orange)', kind: 'dot' },
            { label: tx('esplosioni nucleari', 'nuclear explosions'), color: 'var(--c-blue)', kind: 'dot' },
            { label: '−4,9 + 1,7x₁ − x₂ = 0', color: 'var(--ink-2)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={SX} yDomain={SY} aspect={0.8} margin={{ l: 38, b: 36 }}>
          <Axes xTicks={[4.5, 5, 5.5, 6, 6.5, 7]} yTicks={[3, 4, 5, 6, 7]} xLabel="x₁" yLabel="x₂" />
          <Polyline pts={lineIn(1.7, -1, -4.9, SX, SY)} color="var(--ink-2)" width={1.6} dash="5 4" />
          {QUAKES.map((p, i) => (
            <Dot key={`q${i}`} x={p.x} y={p.y} r={4} color="var(--c-orange)" hollow />
          ))}
          {BLASTS.map((p, i) => (
            <Dot key={`b${i}`} x={p.x} y={p.y} r={4} color="var(--c-blue)" />
          ))}
          <Polyline
            pts={[
              { x: SX[0], y: q.y },
              { x: q.x, y: q.y },
              { x: q.x, y: SY[0] },
            ]}
            color="var(--accent)"
            width={1.2}
            dash="4 4"
          />
          <Star p={q} />
          <Handle x={q.x} y={q.y} label={tx('nuovo evento sismico', 'new seismic event')} onMove={setQ} />
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{tx('Nuovo evento', 'New event')}</div>
            <div className="wmath">
              <Tex>{`h(${f2(q.x)};\\,${f2(q.y)}) = \\operatorname{sign}(-4{,}9 + 1{,}7 \\cdot ${f2(q.x)} - ${f2(q.y)})`}</Tex>
            </div>
            <div className="wmath">
              <Tex>{`= \\operatorname{sign}(${f2(v)}) = ${cls > 0 ? '+1' : '-1'}`}</Tex>
            </div>
          </div>
          <span className={`verdict ${cls > 0 ? 'verdict--info' : 'verdict--warn'}`}>{cls > 0 ? tx('esplosione nucleare', 'nuclear explosion') : tx('terremoto', 'earthquake')}</span>
          <p className="wnote">{tx('La stella parte dall’evento (6, 3) dell’esempio degli appunti.', 'The star starts at the event (6, 3) from the notes example.')}</p>
        </div>
      </div>
      <Tasks
        items={[
          { label: tx('Trascina la stella nella nuvola dei terremoti: il segno diventa −1.', 'Drag the star into the earthquake cluster: the sign becomes −1.'), done: seen.quake },
          { label: tx('Portala proprio sul confine tratteggiato: la combinazione pesata vale circa 0.', 'Place it right on the dashed boundary: the weighted sum is approximately 0.'), done: seen.near },
        ]}
      />
    </div>
  )
}

function Star({ p }: { p: P }) {
  const { x, y } = usePlot()
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 5 : 12
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    return `${x(p.x) + r * Math.cos(a)},${y(p.y) + r * Math.sin(a)}`
  }).join(' ')
  return <polygon points={pts} fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeLinejoin="round" />
}

/* ------------------------------------------------------------------ Fig. 5.4 */

const PX: [number, number] = [0, 8]
const PY: [number, number] = [0, 7.2]
const ZEROS: P[] = [
  { x: 1.4, y: 6.6 },
  { x: 0.9, y: 5.2 },
  { x: 0.9, y: 3.9 },
  { x: 3.0, y: 5.0 },
  { x: 4.2, y: 6.4 },
  { x: 5.3, y: 6.3 },
]
const ONES: P[] = [
  { x: 4.0, y: 3.4 },
  { x: 2.9, y: 2.8 },
  { x: 2.9, y: 1.2 },
  { x: 5.4, y: 2.3 },
  { x: 6.8, y: 1.4 },
  { x: 6.4, y: 4.9 },
]

/** altre rette separatrici (estratte a caso e tenute solo se separano i dati) */
const OTHERS = (() => {
  const r = rng(54)
  const out: { w1: number; w2: number; w0: number }[] = []
  for (let t = 0; t < 4000 && out.length < 5; t++) {
    const a = r() * Math.PI
    const w1 = Math.sin(a)
    const w2 = -Math.cos(a)
    const px = 2 + r() * 4
    const py = 2 + r() * 3
    const w0 = -(w1 * px + w2 * py)
    const g = (p: P) => w1 * p.x + w2 * p.y + w0
    const s = Math.sign(g(ONES[0]))
    if (ONES.every((p) => Math.sign(g(p)) === s) && ZEROS.every((p) => Math.sign(g(p)) === -s)) out.push({ w1, w2, w0 })
  }
  return out
})()

export function SeparatorProps() {
  const [A, setA] = useState<P>({ x: 0.6, y: 2.2 })
  const [B, setB] = useState<P>({ x: 7.6, y: 5.8 })
  const [K, setK] = useState(1)
  const [others, setOthers] = useState(false)
  // w perpendicolare alla retta A→B, orientato verso gli «1»
  let w1 = B.y - A.y
  let w2 = -(B.x - A.x)
  const nrm = Math.hypot(w1, w2) || 1
  w1 /= nrm
  w2 /= nrm
  let w0 = -(w1 * A.x + w2 * A.y)
  const g = (p: P) => w1 * p.x + w2 * p.y + w0
  const ones = ONES.filter((p) => g(p) > 0).length
  if (ones < ONES.length / 2) {
    w1 = -w1
    w2 = -w2
    w0 = -w0
  }
  const h = (p: P) => (w1 * p.x + w2 * p.y + w0 >= 0 ? 1 : 0)
  const wrong = ONES.filter((p) => !h(p)).length + ZEROS.filter((p) => h(p)).length
  const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }
  const moved = useLatch({ m: A.x !== 0.6 || B.x !== 7.6 || A.y !== 2.2 || B.y !== 5.8 }).m
  const seen = useLatch({
    others,
    scale: K !== 1 && Math.abs(K - 1) > 0.2,
    origin: moved && Math.abs(w0) < 0.05,
    sep: moved && wrong === 0,
  })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('classe 1', 'class 1'), color: 'var(--c-blue)', kind: 'dot' },
            { label: tx('classe 0', 'class 0'), color: 'var(--c-orange)', kind: 'dot' },
            { label: tx('la tua retta', 'your line'), color: 'var(--c-red)' },
            ...(others ? [{ label: tx('altre soluzioni', 'other solutions'), color: 'var(--ink-3)', kind: 'dash' as const }] : []),
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={PX} yDomain={PY} equal aspect={0.85}>
          <Axes xTicks={[0, 2, 4, 6, 8]} yTicks={[0, 2, 4, 6]} xLabel="x₁" yLabel="x₂" />
          {others &&
            OTHERS.map((o, i) => <Polyline key={i} pts={lineIn(o.w1, o.w2, o.w0, PX, PY)} color="var(--ink-3)" width={1.3} dash="5 4" />)}
          <Polyline pts={lineIn(w1, w2, w0, PX, PY)} color="var(--c-red)" width={2.4} />
          <Arrow
            from={mid}
            to={{ x: mid.x + w1 * 1.2 * Math.min(K, 2.2), y: mid.y + w2 * 1.2 * Math.min(K, 2.2) }}
            color="var(--ink)"
            width={2}
          />
          <Label
            x={mid.x + w1 * 1.2 * Math.min(K, 2.2)}
            y={mid.y + w2 * 1.2 * Math.min(K, 2.2)}
            dx={8}
            dy={-6}
            className="plot-label--math plot-label--strong"
          >
            w
          </Label>
          <Dot x={0} y={0} r={3} color="var(--ink-3)" />
          {ZEROS.map((p, i) => (
            <Digit key={`z${i}`} p={p} d={0} bad={h(p) === 1} />
          ))}
          {ONES.map((p, i) => (
            <Digit key={`o${i}`} p={p} d={1} bad={h(p) === 0} />
          ))}
          <Handle x={A.x} y={A.y} label={tx('primo punto della retta', 'first point of line')} onMove={setA} />
          <Handle x={B.x} y={B.y} label={tx('secondo punto della retta', 'second point of line')} onMove={setB} />
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">
              {tx('La retta con i pesi moltiplicati per', 'The line with weights multiplied by')} <Tex>K</Tex>
            </div>
            <div className="wmath">
              <Tex>{`${f2(K * w1)}\\,x_1 ${sg(w2)} ${f2(Math.abs(K * w2))}\\,x_2 ${sg(w0)} ${f2(Math.abs(K * w0))} = 0`}</Tex>
            </div>
            <div className="wmath">
              <Tex>{`x_2 = -x_1\\frac{w_1}{w_2} - \\frac{w_0}{w_2} = ${f2(-w1 / w2)}\\,x_1 ${sg(-w0 / w2)} ${f2(Math.abs(w0 / w2))}`}</Tex>
            </div>
          </div>
          <Slider
            label={
              <>
                {tx('scala', 'scale')} <Tex>K</Tex>
              </>
            }
            min={0.3}
            max={3}
            step={0.05}
            value={K}
            onChange={setK}
            format={(v) => fmt(v)}
          />
          <div className="readouts">
            <Readout label={tx('errori', 'errors')} value={`${wrong} ${tx('su', 'of')} ${ONES.length + ZEROS.length}`} tone={wrong ? undefined : 'accent'} />
            <Readout
              label={<Tex>{'w_0'}</Tex>}
              value={fmt(K * w0)}
              sub={Math.abs(w0) < 0.05 ? tx('la retta passa per l’origine', 'line passes through the origin') : undefined}
            />
          </div>
          <Toggle label={tx('mostra altre rette separatrici', 'show other separating lines')} checked={others} onChange={setOthers} />
        </div>
      </div>
      <Tasks
        items={[
          { label: tx('Trascina la retta finché separa tutti i punti: la freccia w resta perpendicolare.', 'Drag the line until it separates all points: the weight arrow w remains perpendicular.'), done: seen.sep },
          { label: tx('Cambia la scala K: i pesi cambiano, la retta no.', 'Change scale K: weights change, but the line does not.'), done: seen.scale },
          { label: tx('Mostra le altre soluzioni: se ne esiste una, ne esistono molte.', 'Show other solutions: if one exists, infinitely many exist.'), done: seen.others },
          { label: tx('Fai passare la retta per l’origine: w₀ diventa 0.', 'Make the line pass through the origin: w₀ becomes 0.'), done: seen.origin },
        ]}
      />
    </div>
  )
}

function Digit({ p, d, bad }: { p: P; d: 0 | 1; bad: boolean }) {
  const { x, y } = usePlot()
  return (
    <g transform={`translate(${x(p.x)} ${y(p.y)})`} className={`lsep__pt${bad ? ' is-bad' : ''}`}>
      {bad && <circle r={15} className="lsep__ring" />}
      <circle r={11} fill={d ? 'var(--c-blue)' : 'var(--c-orange)'} stroke="var(--plot-bg)" strokeWidth={2} />
      <text y={4.5} textAnchor="middle">
        {d}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.5 */

export function LossSmooth() {
  const [y, setY] = useState<1 | -1>(1)
  const [o, setO] = useState(-1.2)
  const l01 = (v: number) => (Math.sign(v) === y || (v === 0 && y === 1) ? 0 : 1)
  const lsq = (v: number) => (y - v) ** 2
  const slope = -2 * (y - o)
  const moved = useLatch({ m: o !== -1.2 }).m
  const seen = useLatch({ right: moved && l01(o) === 0, min: Math.abs(o - y) < 0.06, neg: y === -1 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('loss 0/1', '0/1 loss'), color: 'var(--c-violet)' },
            { label: tx('loss quadratica (y − wᵀx)²', 'squared loss (y − wᵀx)²'), color: 'var(--c-red)' },
          ]}
        />
        <Segmented
          size="sm"
          label="target"
          value={y}
          onChange={setY}
          options={[
            { value: 1, label: 'y = +1' },
            { value: -1, label: 'y = −1' },
          ]}
        />
      </div>
      <Plot xDomain={[-2, 2]} yDomain={[0, 9]} aspect={0.5}>
        <Axes xTicks={[-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]} yTicks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} xLabel="wᵀx" yLabel={tx('loss', 'loss')} />
        <ZeroOne y={y} />
        <FnPath f={lsq} color="var(--c-red)" width={2.4} />
        <Polyline
          pts={[
            { x: o - 0.45, y: lsq(o) - slope * 0.45 },
            { x: o + 0.45, y: lsq(o) + slope * 0.45 },
          ]}
          color="var(--ink-3)"
          width={1.2}
          dash="4 4"
        />
        {Math.abs(slope) > 0.05 && (
          <Arrow from={{ x: o, y: 0.35 }} to={{ x: o - Math.sign(slope) * 0.4, y: 0.35 }} color="var(--c-green)" width={2} />
        )}
        <Dot x={o} y={lsq(o)} r={4.5} color="var(--c-red)" />
        <Dot x={o} y={l01(o)} r={4.5} color="var(--c-violet)" />
        <Handle x={o} y={0} axis="x" label={tx('valore di w^T x', 'value of w^T x')} onMove={(p) => setO(Math.round(p.x * 100) / 100)} bounds={{ x: [-2, 2] }} />
      </Plot>
      <div className="readouts">
        <Readout label="wᵀx" value={fmt(o)} sub={`${tx('classe predetta', 'predicted class')} ${o >= 0 ? '+1' : '−1'}`} />
        <Readout label={tx('loss 0/1', '0/1 loss')} tone="violet" value={String(l01(o))} sub={tx('pendenza sempre 0', 'slope always 0')} />
        <Readout label={tx('loss quadratica', 'squared loss')} tone="red" value={fmt(lsq(o))} sub={`${tx('pendenza', 'slope')} ${fmt(slope)}`} />
      </div>
      <Tasks
        items={[
          { label: tx('Porta wᵀx dal lato giusto: la loss 0/1 va a zero, ma la sua pendenza non aiuta mai (è piatta).', 'Bring wᵀx to the correct side: 0/1 loss drops to zero, but its gradient never helps (it is flat).'), done: seen.right },
          { label: tx('Trova il minimo della loss quadratica: sta proprio in wᵀx = y.', 'Find the minimum of the squared loss: it lies exactly at wᵀx = y.'), done: seen.min },
          { label: tx('Passa a y = −1: la parabola si sposta e il minimo è di nuovo dal lato giusto.', 'Switch to y = −1: the parabola shifts and the minimum is once again on the correct side.'), done: seen.neg },
        ]}
      />
    </div>
  )
}

function ZeroOne({ y }: { y: 1 | -1 }) {
  const pts =
    y > 0
      ? [
          { x: -2, y: 1 },
          { x: 0, y: 1 },
          { x: 0, y: 0 },
          { x: 2, y: 0 },
        ]
      : [
          { x: -2, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
        ]
  return <Polyline pts={pts} color="var(--c-violet)" width={2.4} />
}
