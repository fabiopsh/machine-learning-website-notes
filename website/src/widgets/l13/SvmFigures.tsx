import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Arrow, Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Slider } from '../../components/ui/Controls'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { g, isSv, rbfK, svrAt, trainSvc, trainSvr, weights, type Vec } from './solver'

type P = { x: number; y: number }

const POS = 'var(--c-blue)'
const NEG = 'var(--c-orange)'
const D3: [number, number] = [0, 3]

/* ------------------------------------------------------------------ dati */

// due classi linearmente separabili con un margine visibile
const SEP_POS: Vec[] = [
  [2.0, 2.4],
  [2.5, 1.9],
  [2.3, 2.8],
  [2.8, 2.5],
  [1.8, 2.8],
  [2.7, 1.4],
  [2.15, 1.95],
  [2.9, 2.1],
]
const SEP_NEG: Vec[] = [
  [0.6, 0.8],
  [1.1, 0.5],
  [0.9, 1.3],
  [0.4, 1.5],
  [1.45, 0.85],
  [0.7, 0.3],
  [1.15, 1.55],
  [0.3, 0.7],
]
const SEP_X = [...SEP_POS, ...SEP_NEG]
const SEP_D = [...SEP_POS.map(() => 1), ...SEP_NEG.map(() => -1)]
const HARD_C = 1e5

// punti dentro un cerchio (+1) e fuori (−1), con uno stacco attorno al confine
function ring(seed: number, n: number, A = 1, B = 1, maxR = 9) {
  const r = rng(seed)
  const X: Vec[] = []
  const d: number[] = []
  while (X.length < n) {
    const x = [-1.5 + 3 * r(), -1.5 + 3 * r()]
    const q = (x[0] / A) ** 2 + (x[1] / B) ** 2
    if (Math.abs(q - 1) < 0.3 || x[0] ** 2 + x[1] ** 2 > maxR) continue
    X.push(x)
    d.push(q < 1 ? 1 : -1)
  }
  return { X, d }
}

/* ------------------------------------------------------------------ mattoni grafici */

/** Retta w·x + b = c, estesa oltre il riquadro (il grafico la ritaglia). */
function levelLine(w: Vec, b: number, c: number): P[] {
  const n2 = w[0] ** 2 + w[1] ** 2
  const p0 = { x: (w[0] * (c - b)) / n2, y: (w[1] * (c - b)) / n2 }
  const t = { x: -w[1] / Math.sqrt(n2), y: w[0] / Math.sqrt(n2) }
  return [
    { x: p0.x - 20 * t.x, y: p0.y - 20 * t.y },
    { x: p0.x + 20 * t.x, y: p0.y + 20 * t.y },
  ]
}

function Pts({ X, d, sv, dim }: { X: Vec[]; d: number[]; sv?: (i: number) => boolean; dim?: (i: number) => boolean }) {
  return (
    <>
      {X.map((x, i) => (
        <g key={i} opacity={dim?.(i) ? 0.25 : 1}>
          {sv?.(i) && <Dot x={x[0]} y={x[1]} r={10} color="var(--ink)" hollow />}
          <Dot x={x[0]} y={x[1]} r={5} color={d[i] > 0 ? POS : NEG} />
        </g>
      ))}
    </>
  )
}

function Margins({ w, b, band }: { w: Vec; b: number; band?: boolean }) {
  return (
    <>
      {band && <Band w={w} b={b} />}
      <Polyline pts={levelLine(w, b, 1)} color="var(--ink-3)" width={1.4} dash="5 4" />
      <Polyline pts={levelLine(w, b, -1)} color="var(--ink-3)" width={1.4} dash="5 4" />
      <Polyline pts={levelLine(w, b, 0)} color="var(--c-red)" width={2.4} />
    </>
  )
}

/** Zona di sicurezza tra le rette g = ±1. */
function Band({ w, b }: { w: Vec; b: number }) {
  const { x, y, clipId } = usePlot()
  const a = levelLine(w, b, 1)
  const c = levelLine(w, b, -1)
  const d = `M${x(a[0].x)},${y(a[0].y)} L${x(a[1].x)},${y(a[1].y)} L${x(c[1].x)},${y(c[1].y)} L${x(c[0].x)},${y(c[0].y)} Z`
  return <path d={d} className="svm13__band" clipPath={`url(#${clipId})`} />
}

const LEG_CLASSES = [
  { label: <>classe +1</>, color: POS, kind: 'dot' as const },
  { label: <>classe −1</>, color: NEG, kind: 'dot' as const },
]

/* ------------------------------------------------------------------ Fig. 13.1 */

const RING1 = ring(1311, 46)
const R3: [number, number] = [-1.5, 1.5]

function linePts(a: P, b: P) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return [
    { x: a.x - 20 * dx, y: a.y - 20 * dy },
    { x: a.x + 20 * dx, y: a.y + 20 * dy },
  ]
}

/** Errori di una retta per due punti, scegliendo il verso migliore. */
function lineErrors(a: P, b: P, X: Vec[], d: number[]) {
  const e = X.filter((x, i) => d[i] * ((b.x - a.x) * (x[1] - a.y) - (b.y - a.y) * (x[0] - a.x)) < 0).length
  return Math.min(e, X.length - e)
}

function useLinePanel({ X, d, dom, start }: { X: Vec[]; d: number[]; dom: [number, number]; start: [P, P] }) {
  const [a, setA] = useState(start[0])
  const [b, setB] = useState(start[1])
  const e = lineErrors(a, b, X, d)
  return {
    e,
    node: (
      <Plot xDomain={dom} yDomain={dom} equal aspect={1} maxH={300} margin={{ l: 26, r: 10, t: 10, b: 24 }}>
        <Axes xTicks={[]} yTicks={[]} xLabel="" yLabel="" />
        <Polyline pts={linePts(a, b)} color="var(--c-red)" width={2.2} />
        <Pts X={X} d={d} />
        <Handle x={a.x} y={a.y} label="primo punto della retta" onMove={setA} />
        <Handle x={b.x} y={b.y} label="secondo punto della retta" onMove={setB} />
      </Plot>
    ),
  }
}

export function Separable() {
  const left = useLinePanel({
    X: SEP_X,
    d: SEP_D,
    dom: D3,
    start: [
      { x: 0.5, y: 2.3 },
      { x: 2.6, y: 0.9 },
    ],
  })
  const right = useLinePanel({
    X: RING1.X,
    d: RING1.d,
    dom: R3,
    start: [
      { x: -1.2, y: -0.3 },
      { x: 1.2, y: 0.4 },
    ],
  })
  const seen = useLatch({ left: left.e === 0, right: right.e <= 8 })
  return (
    <div>
      <div className="wbar">
        <Legend items={[...LEG_CLASSES, { label: 'retta (trascina le due maniglie)', color: 'var(--c-red)' }]} />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">Linearmente separabili</div>
          {left.node}
          <Readout label="errori della retta" tone={left.e === 0 ? 'accent' : undefined} value={String(left.e)} />
        </div>
        <div>
          <div className="htf__title">Non linearmente separabili</div>
          {right.node}
          <Readout label="errori della retta" value={String(right.e)} sub="nessuna retta arriva a zero" />
        </div>
      </div>
      <Tasks
        items={[
          { label: 'A sinistra, sposta la retta finché gli errori sono zero.', done: seen.left },
          { label: 'A destra, cerca la retta migliore: sbaglia sempre una parte dei punti.', done: seen.right },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.2 */

const SVM_SEP = trainSvc(SEP_X, SEP_D, HARD_C)
const W_SEP = weights(SVM_SEP)
const RHO_MAX = 2 / Math.hypot(W_SEP[0], W_SEP[1])

/** Porta la retta ottima in forma «due punti». */
function optimalPts(w: Vec, b: number): [P, P] {
  const L = levelLine(w, b, 0)
  const c = { x: (L[0].x + L[1].x) / 2, y: (L[0].y + L[1].y) / 2 }
  const t = { x: (L[1].x - L[0].x) / 40, y: (L[1].y - L[0].y) / 40 }
  // centro della retta vicino al centro del riquadro
  const k = ((1.5 - c.x) * t.x + (1.5 - c.y) * t.y) / (t.x ** 2 + t.y ** 2)
  const m = { x: c.x + k * t.x, y: c.y + k * t.y }
  return [
    { x: m.x - 0.9 * t.x, y: m.y - 0.9 * t.y },
    { x: m.x + 0.9 * t.x, y: m.y + 0.9 * t.y },
  ]
}

export function MarginExplorer() {
  const [a, setA] = useState<P>({ x: 0.7, y: 2.3 })
  const [b, setB] = useState<P>({ x: 2.2, y: 0.6 })
  const [usedOpt, setUsedOpt] = useState(false)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const L = Math.hypot(dx, dy) || 1
  let n = { x: dy / L, y: -dx / L }
  let s = SEP_X.map((x) => n.x * (x[0] - a.x) + n.y * (x[1] - a.y))
  if (s.filter((v, i) => SEP_D[i] * v < 0).length > SEP_X.length / 2) {
    n = { x: -n.x, y: -n.y }
    s = s.map((v) => -v)
  }
  const errors = s.filter((v, i) => SEP_D[i] * v < 0).length
  const half = Math.min(...s.map(Math.abs))
  const rho = errors ? 0 : 2 * half
  // retta come w·x + b = 0 con |g| = 1 sul punto più vicino (forma canonica), per disegnare la zona
  const w: Vec = [n.x / half, n.y / half]
  const b0 = -(n.x * a.x + n.y * a.y) / half
  const near = s.map((v) => Math.abs(Math.abs(v) - half) < 1e-9)
  const seen = useLatch({ better: !errors && rho > 0.6 * RHO_MAX && !usedOpt, opt: usedOpt })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...LEG_CLASSES,
            { label: 'iperpiano', color: 'var(--c-red)' },
            { label: 'bordi del margine', color: 'var(--ink-3)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={D3} yDomain={D3} equal aspect={1} maxH={360} margin={{ l: 30, r: 10, t: 10, b: 30 }}>
          <Axes xTicks={[0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xLabel="x₁" yLabel="x₂" />
          {!errors && <Margins w={w} b={b0} band />}
          {errors > 0 && <Polyline pts={linePts(a, b)} color="var(--c-red)" width={2.4} />}
          <Pts X={SEP_X} d={SEP_D} sv={(i) => !errors && near[i]} />
          <Handle x={a.x} y={a.y} label="primo punto dell’iperpiano" onMove={(p) => (setA(p), setUsedOpt(false))} />
          <Handle x={b.x} y={b.y} label="secondo punto dell’iperpiano" onMove={(p) => (setB(p), setUsedOpt(false))} />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout
              label={
                <>
                  margine <Tex>\rho</Tex> di questa retta
                </>
              }
              tone="accent"
              value={errors ? '—' : fmt(rho, 2)}
            />
            <Readout label={<>margine massimo</>} value={fmt(RHO_MAX, 2)} />
          </div>
          <div className={`verdict ${errors ? 'verdict--bad' : rho > RHO_MAX - 1e-3 ? 'verdict--good' : 'verdict--info'}`}>
            <span>
              {errors
                ? `La retta sbaglia ${errors} punti: non è un iperpiano separatore.`
                : rho > RHO_MAX - 1e-3
                  ? 'Iperpiano ottimo: nessuna retta separatrice ha un margine più largo.'
                  : 'Separa le classi, ma un’altra retta ha un margine più largo.'}
            </span>
          </div>
          <p className="wnote">
            La zona grigia è larga <Tex>\rho</Tex>: il doppio della distanza tra la retta e il punto più vicino (cerchiato).
          </p>
          <Btn
            icon="sparkle"
            variant="soft"
            onClick={() => {
              const [p, q] = optimalPts(W_SEP, SVM_SEP.b)
              setA(p)
              setB(q)
              setUsedOpt(true)
            }}
          >
            Iperpiano ottimo
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Ruota e sposta la retta per allargare il margine senza sbagliare punti.', done: seen.better },
          { label: 'Mostra l’iperpiano ottimo: è quello a margine massimo.', done: seen.opt },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.3 */

function Clickable({
  X,
  d,
  onClick,
  removed,
  sv,
}: {
  X: Vec[]
  d: number[]
  onClick: (i: number) => void
  removed: Set<number>
  sv: (i: number) => boolean
}) {
  const { x, y } = usePlot()
  return (
    <g>
      {X.map((p, i) => (
        <g
          key={i}
          className="svm13__pt"
          transform={`translate(${x(p[0])} ${y(p[1])})`}
          onClick={() => onClick(i)}
          role="button"
          tabIndex={0}
          aria-label={`punto ${i + 1}: ${removed.has(i) ? 'rimosso, clic per rimetterlo' : 'clic per toglierlo'}`}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(i)}
        >
          <circle r={14} className="svm13__hit" />
          {removed.has(i) ? (
            <path d="M-5,-5 L5,5 M5,-5 L-5,5" className="svm13__gone" />
          ) : (
            <>
              {sv(i) && <circle r={10} className="svm13__ring" />}
              <circle r={5.5} fill={d[i] > 0 ? POS : NEG} stroke="var(--plot-bg)" strokeWidth={1.5} />
            </>
          )}
        </g>
      ))}
    </g>
  )
}

export function SupportVectors() {
  const [removed, setRemoved] = useState<Set<number>>(new Set())
  const keep = SEP_X.map((_, i) => i).filter((i) => !removed.has(i))
  const hasBoth = keep.some((i) => SEP_D[i] > 0) && keep.some((i) => SEP_D[i] < 0)
  const m = useMemo(
    () =>
      hasBoth
        ? trainSvc(
            keep.map((i) => SEP_X[i]),
            keep.map((i) => SEP_D[i]),
            HARD_C,
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [removed],
  )
  const w = m ? weights(m) : null
  const svIdx = new Set(m ? keep.filter((_, j) => isSv(m, j)) : [])
  const changed = w ? Math.abs(w[0] - W_SEP[0]) + Math.abs(w[1] - W_SEP[1]) + Math.abs(m!.b - SVM_SEP.b) > 1e-3 : true
  const removedSv = [...removed].some((i) => isSv(SVM_SEP, i))
  const seen = useLatch({ same: removed.size > 0 && !changed, diff: removed.size > 0 && changed })
  const toggle = (i: number) =>
    setRemoved((s) => {
      const t = new Set(s)
      if (t.has(i)) t.delete(i)
      else t.add(i)
      return t
    })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...LEG_CLASSES,
            { label: 'support vector', color: 'var(--ink)', kind: 'dot' },
            { label: <Tex>{'\\mathbf{w}^T\\mathbf{x} + b = \\pm 1'}</Tex>, color: 'var(--ink-3)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={D3} yDomain={D3} equal aspect={1} maxH={360} margin={{ l: 30, r: 10, t: 10, b: 30 }}>
          <Axes xTicks={[0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xLabel="x₁" yLabel="x₂" />
          {w && m && <Margins w={w} b={m.b} band />}
          {w && m && <MarginLabels w={w} b={m.b} />}
          <Clickable X={SEP_X} d={SEP_D} onClick={toggle} removed={removed} sv={(i) => svIdx.has(i)} />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout
              label={
                <>
                  support vector <Tex>{'N_s'}</Tex>
                </>
              }
              value={String(svIdx.size)}
              sub={`su ${keep.length} punti`}
            />
            <Readout
              label={
                <>
                  margine <Tex>\rho</Tex>
                </>
              }
              tone="accent"
              value={w ? fmt(2 / Math.hypot(w[0], w[1]), 2) : '—'}
            />
          </div>
          <div className={`verdict ${removed.size === 0 ? 'verdict--info' : changed ? 'verdict--warn' : 'verdict--good'}`}>
            <span>
              {removed.size === 0
                ? 'Clicca un punto per toglierlo dal training set (e di nuovo per rimetterlo).'
                : changed
                  ? `L’iperpiano è cambiato: ${removedSv ? 'hai tolto un support vector' : 'i punti rimasti hanno un altro ottimo'}.`
                  : 'L’iperpiano non cambia: i punti tolti non erano support vector.'}
            </span>
          </div>
          {m && (
            <div className="wpanel">
              <div className="wpanel__title">Moltiplicatori non nulli</div>
              <div className="svm13__alphas">
                {keep
                  .map((i, j) => ({ i, a: m.alpha[j] }))
                  .filter((q) => q.a > 1e-6)
                  .map((q) => (
                    <span key={q.i}>
                      <Tex>{`\\alpha_{${q.i + 1}}`}</Tex> = {fmt(q.a, 2)}
                    </span>
                  ))}
              </div>
              <p className="wnote">Tutti gli altri punti hanno α = 0.</p>
            </div>
          )}
          <Btn icon="reset" variant="ghost" onClick={() => setRemoved(new Set())} disabled={removed.size === 0}>
            Rimetti tutti i punti
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Togli un punto lontano dal confine: l’iperpiano resta identico.', done: seen.same },
          { label: 'Togli un support vector (cerchiato): l’iperpiano si sposta e il margine cresce.', done: seen.diff },
        ]}
      />
    </div>
  )
}

function MarginLabels({ w, b }: { w: Vec; b: number }) {
  // etichette delle tre rette vicino al bordo destro-basso
  const at = (c: number) => {
    const L = levelLine(w, b, c)
    const t = (0.12 - L[0].y) / (L[1].y - L[0].y)
    return { x: L[0].x + t * (L[1].x - L[0].x), y: 0.12 }
  }
  const p0 = at(0)
  const pp = at(1)
  const pm = at(-1)
  return (
    <>
      <Label x={pm.x} y={pm.y} dx={5} className="plot-label--muted">
        −1
      </Label>
      <Label x={p0.x} y={p0.y} dx={5} className="plot-label--strong">
        0
      </Label>
      <Label x={pp.x} y={pp.y} dx={5} className="plot-label--muted">
        +1
      </Label>
    </>
  )
}

/* ------------------------------------------------------------------ Fig. 13.4 */

export function Distance() {
  const [p, setP] = useState<P>({ x: 2.4, y: 1.0 })
  const w = W_SEP
  const nw = Math.hypot(w[0], w[1])
  const gx = w[0] * p.x + w[1] * p.y + SVM_SEP.b
  const r = gx / nw
  const xp = { x: p.x - (r * w[0]) / nw, y: p.y - (r * w[1]) / nw }
  const svs = SEP_X.map((x, i) => ({ x, i })).filter((q) => isSv(SVM_SEP, q.i) && SEP_D[q.i] > 0)
  const onSv = svs.some((q) => Math.hypot(q.x[0] - p.x, q.x[1] - p.y) < 0.05)
  const seen = useLatch({ neg: r < -0.05, sv: onSv })
  // piede di w_o: il punto dell'iperpiano più vicino al centro
  const L = levelLine(w, SVM_SEP.b, 0)
  const tt = { x: L[1].x - L[0].x, y: L[1].y - L[0].y }
  const k = ((1.2 - L[0].x) * tt.x + (2.2 - L[0].y) * tt.y) / (tt.x ** 2 + tt.y ** 2)
  const foot = { x: L[0].x + k * tt.x, y: L[0].y + k * tt.y }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'iperpiano ottimo', color: 'var(--c-red)' },
            {
              label: (
                <>
                  distanza <Tex>r</Tex>
                </>
              ),
              color: 'var(--c-violet)',
            },
            { label: <Tex>{'\\mathbf{w}_o'}</Tex>, color: 'var(--ink)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={D3} yDomain={D3} equal aspect={1} maxH={360} margin={{ l: 30, r: 10, t: 10, b: 30 }}>
          <Axes xTicks={[0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xLabel="x₁" yLabel="x₂" />
          <Margins w={w} b={SVM_SEP.b} />
          <Pts X={SEP_X} d={SEP_D} dim={() => true} />
          <Arrow from={foot} to={{ x: foot.x + (0.55 * w[0]) / nw, y: foot.y + (0.55 * w[1]) / nw }} color="var(--ink)" width={2} />
          <Label
            x={foot.x + (0.55 * w[0]) / nw}
            y={foot.y + (0.55 * w[1]) / nw}
            dx={6}
            dy={-4}
            className="plot-label--math plot-label--strong"
          >
            {svgScript('w', 'o')}
          </Label>
          <Polyline pts={[p, xp]} color="var(--c-violet)" width={2.4} />
          <Dot x={xp.x} y={xp.y} r={4.5} color="var(--c-violet)" />
          <Label x={xp.x} y={xp.y} dx={-8} dy={14} anchor="end" className="plot-label--math">
            {svgScript('x', 'p')}
          </Label>
          <Label x={(p.x + xp.x) / 2} y={(p.y + xp.y) / 2} dx={8} dy={4} className="plot-label--math plot-label--strong">
            r
          </Label>
          <Handle x={p.x} y={p.y} label="punto x" onMove={setP} />
          <Label x={p.x} y={p.y} dx={12} dy={-10} className="plot-label--math plot-label--strong">
            x
          </Label>
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label={<Tex>{'g(\\mathbf{x}) = \\mathbf{w}_o^T\\mathbf{x} + b_o'}</Tex>} value={fmt(gx, 2)} />
            <Readout label={<Tex>{'\\|\\mathbf{w}_o\\|'}</Tex>} value={fmt(nw, 2)} />
            <Readout label={<Tex>{'r = g(\\mathbf{x}) / \\|\\mathbf{w}_o\\|'}</Tex>} tone="violet" value={fmt(r, 3)} />
          </div>
          <p className="wnote">
            Su un support vector <Tex>{'g = 1'}</Tex> e quindi <Tex>{'r = 1/\\|\\mathbf{w}_o\\| = \\rho/2'}</Tex> = {fmt(1 / nw, 3)}.
          </p>
          <Btn
            variant="soft"
            onClick={() => {
              const q = svs[0].x
              setP({ x: q[0], y: q[1] })
            }}
          >
            Porta x su un support vector
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Porta x dall’altra parte dell’iperpiano: g e r diventano negativi.', done: seen.neg },
          { label: 'Porta x su un support vector: la distanza è metà del margine.', done: seen.sv },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.5 */

export function SoftMargin() {
  const [lc, setLc] = useState(0) // log10 C
  const [ip, setIp] = useState<P>({ x: 1.6, y: 1.35 })
  const [ineg, setIneg] = useState<P>({ x: 2.25, y: 2.2 })
  const C = 10 ** lc
  const X = useMemo(() => [...SEP_X, [ip.x, ip.y], [ineg.x, ineg.y]], [ip, ineg])
  const d = [...SEP_D, 1, -1]
  const m = useMemo(() => trainSvc(X, d, C), [X, C]) // eslint-disable-line react-hooks/exhaustive-deps
  const w = weights(m)
  const nw = Math.hypot(w[0], w[1])
  const xi = X.map((x, i) => Math.max(0, 1 - d[i] * g(m, x)))
  const nSv = m.alpha.filter((a) => a > 1e-6).length
  const atC = m.alpha.filter((a) => a > C - 1e-6).length
  const errs = xi.filter((v) => v > 1).length
  const seen = useLatch({ low: lc <= -1, high: lc >= 2.5 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...LEG_CLASSES,
            { label: 'support vector', color: 'var(--ink)', kind: 'dot' },
            {
              label: (
                <>
                  slack <Tex>{'\\xi_i'}</Tex>
                </>
              ),
              color: 'var(--c-violet)',
            },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={D3} yDomain={D3} equal aspect={1} maxH={360} margin={{ l: 30, r: 10, t: 10, b: 30 }}>
          <Axes xTicks={[0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xLabel="x₁" yLabel="x₂" />
          <Margins w={w} b={m.b} band />
          {X.map((x, i) =>
            xi[i] > 1e-6 ? (
              <Polyline
                key={`s${i}`}
                pts={[
                  { x: x[0], y: x[1] },
                  { x: x[0] + (d[i] * xi[i] * w[0]) / nw ** 2, y: x[1] + (d[i] * xi[i] * w[1]) / nw ** 2 },
                ]}
                color="var(--c-violet)"
                width={2}
              />
            ) : null,
          )}
          <Pts X={X} d={d} sv={(i) => m.alpha[i] > 1e-6} />
          {[ip, ineg].map((q, j) =>
            xi[SEP_X.length + j] > 1e-6 ? (
              <Label key={j} x={q.x} y={q.y} dx={12} dy={16} className="plot-label--math">
                {svgScript('ξ', j ? 'j' : 'i')} = {fmt(xi[SEP_X.length + j], 2)}
              </Label>
            ) : null,
          )}
          <Handle x={ip.x} y={ip.y} r={4} color={POS} label="punto della classe +1" onMove={setIp} />
          <Handle x={ineg.x} y={ineg.y} r={4} color={NEG} label="punto della classe −1" onMove={setIneg} />
        </Plot>
        <div className="wside">
          <Slider
            label={
              <>
                iperparametro <Tex>C</Tex>
              </>
            }
            min={-2}
            max={3}
            step={0.05}
            value={lc}
            onChange={setLc}
            format={(v) => fmt(10 ** v, v < 0 ? 2 : 0)}
          />
          <div className="readouts">
            <Readout
              label={
                <>
                  margine <Tex>{'\\rho = 2/\\|\\mathbf{w}\\|'}</Tex>
                </>
              }
              tone="accent"
              value={fmt(2 / nw, 2)}
            />
            <Readout label="support vector" value={String(nSv)} sub={`${atC} con α = C (nel margine)`} />
            <Readout
              label={
                <>
                  errori di training (<Tex>{'\\xi_i > 1'}</Tex>)
                </>
              }
              value={String(errs)}
            />
          </div>
          <p className="wnote">Trascina i due punti con la maniglia: dentro il margine dal lato giusto, o dal lato sbagliato.</p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Abbassa C: il margine si allarga e ammette più punti al suo interno (rischio di underfitting).', done: seen.low },
          { label: 'Alza C: nessun errore tollerato, il margine si stringe (rischio di overfitting).', done: seen.high },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.6 */

function useDragAngles(init: { yaw: number; pitch: number }) {
  const [ang, setAng] = useState(init)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [moved, setMoved] = useState(false)
  const handlers = {
    onPointerDown: (e: RPointerEvent<SVGSVGElement>) => {
      last.current = { x: e.clientX, y: e.clientY }
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: RPointerEvent<SVGSVGElement>) => {
      if (!last.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      setAng((a) => ({ yaw: a.yaw + dx * 0.01, pitch: Math.max(-1.4, Math.min(1.4, a.pitch + dy * 0.01)) }))
      setMoved(true)
    },
    onPointerUp: () => {
      last.current = null
    },
  }
  return { ang, handlers, moved }
}

export function FeatureMap() {
  const [A, setA] = useState(1.1)
  const [B, setB] = useState(0.8)
  const data = useMemo(() => ring(1316, 60, A, B, 2.1), [A, B])
  const { ang, handlers, moved } = useDragAngles({ yaw: -0.8, pitch: 0.3 })
  const seen = useLatch({ rot: moved, shape: A !== 1.1 || B !== 0.8 })
  const Z = data.X.map((x) => [x[0] ** 2, Math.SQRT2 * x[0] * x[1], x[1] ** 2])
  const W = 340
  const H = 300
  const cy = Math.cos(ang.yaw)
  const sy = Math.sin(ang.yaw)
  const cp = Math.cos(ang.pitch)
  const sp = Math.sin(ang.pitch)
  // z1 → asse x, z3 → asse y (profondità), z2 → verticale; centrato sul cubo [0,2.25]×[−1.6,1.6]×[0,2.25]
  const proj = (z: number[]) => {
    const X0 = z[0] - 1.1
    const Y0 = z[2] - 1.1
    const Z0 = z[1] * 0.7
    const x1 = X0 * cy - Y0 * sy
    const y1 = X0 * sy + Y0 * cy
    const z1 = Z0 * cp - y1 * sp
    return { x: W / 2 + x1 * 70, y: H / 2 - z1 * 70, depth: y1 * cp + Z0 * sp }
  }
  const axis = (a: number[], b: number[], lab: 'z1' | 'z2' | 'z3') => {
    const p = proj(a)
    const q = proj(b)
    return (
      <g key={lab} className="fm13__axis">
        <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
        <text x={q.x + 4} y={q.y - 4}>
          {svgScript('z', lab[1])}
        </text>
      </g>
    )
  }
  // piano z1/A² + z3/B² = 1, esteso lungo z2
  const plane = [
    [A * A, -1.6, 0],
    [0, -1.6, B * B],
    [0, 1.6, B * B],
    [A * A, 1.6, 0],
  ].map(proj)
  const order = Z.map((z, i) => ({ i, p: proj(z) })).sort((a, b) => b.p.depth - a.p.depth)
  return (
    <div>
      <div className="wbar">
        <Legend items={[...LEG_CLASSES, { label: 'confine: ellisse / piano', color: 'var(--c-red)' }]} />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">
            Spazio di input <Tex>{'(x_1, x_2)'}</Tex>
          </div>
          <Plot xDomain={[-1.5, 1.5]} yDomain={[-1.5, 1.5]} equal aspect={1} maxH={300} margin={{ l: 26, r: 10, t: 10, b: 26 }}>
            <Axes xTicks={[-1, 0, 1]} yTicks={[-1, 0, 1]} xLabel="x₁" yLabel="x₂" />
            <Polyline
              pts={Array.from({ length: 121 }, (_, k) => ({
                x: A * Math.cos((k / 120) * 2 * Math.PI),
                y: B * Math.sin((k / 120) * 2 * Math.PI),
              }))}
              color="var(--c-red)"
              width={2.2}
            />
            <Pts X={data.X} d={data.d} />
          </Plot>
        </div>
        <div>
          <div className="htf__title">
            Spazio delle feature <Tex>{'(x_1^2, \\sqrt{2}x_1x_2, x_2^2)'}</Tex>
          </div>
          <svg
            className="fm13__svg"
            viewBox={`0 0 ${W} ${H}`}
            {...handlers}
            role="img"
            aria-label="Spazio delle feature in 3D, trascina per ruotarlo"
          >
            {axis([0, 0, 0], [2.4, 0, 0], 'z1')}
            {axis([0, -1.6, 0], [0, 1.8, 0], 'z2')}
            {axis([0, 0, 0], [0, 0, 2.4], 'z3')}
            <polygon className="fm13__plane" points={plane.map((q) => `${q.x},${q.y}`).join(' ')} />
            {order.map(({ i, p }) => (
              <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={data.d[i] > 0 ? POS : NEG} stroke="var(--plot-bg)" strokeWidth={1.2} />
            ))}
          </svg>
          <p className="wnote">
            Trascina per ruotare. Il piano è <Tex>{`z_1/${fmt(A * A, 2)} + z_3/${fmt(B * B, 2)} = 1`}</Tex>.
          </p>
        </div>
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              semiasse <Tex>a</Tex> dell’ellisse
            </>
          }
          min={0.6}
          max={1.35}
          step={0.05}
          value={A}
          onChange={setA}
          format={(v) => fmt(v, 2)}
        />
        <Slider
          label={
            <>
              semiasse <Tex>b</Tex>
            </>
          }
          min={0.6}
          max={1.35}
          step={0.05}
          value={B}
          onChange={setB}
          format={(v) => fmt(v, 2)}
        />
      </div>
      <Tasks
        items={[
          { label: 'Ruota lo spazio delle feature: le due classi stanno ai due lati di un piano.', done: seen.rot },
          { label: 'Cambia la forma dell’ellisse: nello spazio delle feature cambia solo l’inclinazione del piano.', done: seen.shape },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.7 */

const ARCH_X: Vec[] = [
  [0.5, 0.6],
  [0.9, 1.0],
  [2.1, 2.3],
  [2.5, 2.6],
  [0.6, 2.4],
  [1.0, 2.1],
  [2.3, 0.6],
  [2.6, 1.0],
  [1.5, 1.5],
  [1.8, 0.4],
]
const ARCH_D = [1, 1, 1, 1, -1, -1, -1, -1, 1, -1]

export function Architecture() {
  const [sigma, setSigma] = useState(0.6)
  const [q, setQ] = useState<P>({ x: 1.2, y: 1.4 })
  const m = useMemo(() => trainSvc(ARCH_X, ARCH_D, 10, rbfK(sigma)), [sigma])
  const svs = ARCH_X.map((_, i) => i).filter((i) => isSv(m, i))
  const ks = svs.map((i) => m.k(ARCH_X[i], [q.x, q.y]))
  const out = g(m, [q.x, q.y])
  const seen = useLatch({ sig: sigma !== 0.6, move: q.x !== 1.2 })
  const G = 45
  const cells = useMemo(() => {
    const c: { x: number; y: number; s: number }[] = []
    for (let i = 0; i < G; i++)
      for (let j = 0; j < G; j++) {
        const x = ((i + 0.5) / G) * 3
        const y = ((j + 0.5) / G) * 3
        c.push({ x, y, s: Math.sign(g(m, [x, y])) })
      }
    return c
  }, [m])
  const n = svs.length
  const VW = 360
  const VH = Math.max(220, 40 + n * 30)
  const hy = (k: number) => 30 + ((VH - 60) * (k + 0.5)) / n
  return (
    <div>
      <div className="wbar">
        <Legend items={[...LEG_CLASSES, { label: 'support vector', color: 'var(--ink)', kind: 'dot' }]} />
      </div>
      <div className="wgrid wgrid--even">
        <Plot xDomain={D3} yDomain={D3} equal aspect={1} maxH={320} margin={{ l: 26, r: 10, t: 10, b: 26 }}>
          <Cells cells={cells} n={G} />
          <Axes xTicks={[0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xLabel="x₁" yLabel="x₂" />
          <Pts X={ARCH_X} d={ARCH_D} sv={(i) => isSv(m, i)} />
          <Handle x={q.x} y={q.y} label="pattern x da classificare" onMove={setQ} />
        </Plot>
        <svg className="arch13" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label="Architettura della SVM">
          {svs.map((i, k) => (
            <g key={i}>
              {[0, 1].map((u) => (
                <line key={u} className="arch13__edge" x1={40} y1={VH / 2 + (u ? 22 : -22)} x2={150} y2={hy(k)} />
              ))}
              <line className="arch13__edge" x1={150} y1={hy(k)} x2={290} y2={VH / 2} />
              <text className="arch13__w" x={212} y={hy(k) + (VH / 2 - hy(k)) * 0.2 - 3} textAnchor="middle">
                {fmt(m.alpha[i] * ARCH_D[i], 2)}
              </text>
            </g>
          ))}
          {[0, 1].map((u) => (
            <g key={u} className="arch13__node">
              <circle cx={40} cy={VH / 2 + (u ? 22 : -22)} r={15} />
              <text x={40} y={VH / 2 + (u ? 22 : -22) + 5} textAnchor="middle">
                {svgScript('x', String(u + 1))}
              </text>
            </g>
          ))}
          {svs.map((i, k) => (
            <g key={i} className="arch13__node arch13__node--k">
              <rect x={112} y={hy(k) - 12} width={76} height={24} rx={6} />
              <rect className="arch13__fill" x={112} y={hy(k) - 12} width={76 * ks[k]} height={24} rx={6} />
              <text x={150} y={hy(k) + 5} textAnchor="middle">
                {fmt(ks[k], 2)}
              </text>
            </g>
          ))}
          <g className="arch13__node">
            <circle cx={300} cy={VH / 2} r={20} />
            <text x={300} y={VH / 2 + 6} textAnchor="middle">
              Σ
            </text>
          </g>
          <text className="arch13__lbl" x={300} y={VH / 2 + 38} textAnchor="middle">
            + b = {fmt(out, 2)}
          </text>
          <text className="arch13__lbl" x={150} y={16} textAnchor="middle">
            K(x, x
            <tspan baselineShift="sub" fontSize="0.7em">
              i
            </tspan>
            )
          </text>
        </svg>
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              larghezza <Tex>\sigma</Tex> del kernel RBF
            </>
          }
          min={0.3}
          max={1.2}
          step={0.05}
          value={sigma}
          onChange={setSigma}
          format={(v) => fmt(v, 2)}
        />
        <Readout label="unità nascoste = support vector" tone="accent" value={String(n)} />
        <Readout
          label={
            <>
              uscita <Tex>{'\\operatorname{sign}(g(\\mathbf{x}))'}</Tex>
            </>
          }
          value={out >= 0 ? '+1' : '−1'}
        />
      </div>
      <Tasks
        items={[
          {
            label: (
              <>
                Trascina il pattern <Tex>{'\\mathbf{x}'}</Tex>: ogni unità nascosta risponde con{' '}
                <Tex>{'K(\\mathbf{x}, \\mathbf{x}_i)'}</Tex>, più alta vicino al suo support vector.
              </>
            ),
            done: seen.move,
          },
          { label: 'Cambia σ: cambiano i support vector, e con loro il numero di unità nascoste.', done: seen.sig },
        ]}
      />
    </div>
  )
}

function Cells({ cells, n }: { cells: { x: number; y: number; s: number }[]; n: number }) {
  const { x, y } = usePlot()
  const w = Math.abs(x(3 / n) - x(0))
  const h = Math.abs(y(0) - y(3 / n))
  return (
    <g className="svm13__cells">
      {cells.map((c, i) => (
        <rect key={i} x={x(c.x) - w / 2} y={y(c.y) - h / 2} width={w + 0.5} height={h + 0.5} className={c.s > 0 ? 'is-pos' : 'is-neg'} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 13.8 */

export function EpsLoss() {
  const [eps, setEps] = useState(0.5)
  const [r, setR] = useState(1.2)
  const L = (v: number) => Math.max(0, Math.abs(v) - eps)
  const seen = useLatch({ zero: Math.abs(r) < eps, big: eps >= 1 })
  return (
    <div>
      <div className="wbar">
        <Legend items={[{ label: <Tex>{'L_\\varepsilon(d, y)'}</Tex>, color: 'var(--c-red)' }]} />
      </div>
      <Plot xDomain={[-2.5, 2.5]} yDomain={[0, 2]} aspect={0.45} margin={{ b: 40 }}>
        <Axes xTicks={[-2, -1, 0, 1, 2]} yTicks={[0, 1, 2]} xLabel="d − y" yLabel="loss" />
        <Polyline
          pts={[
            { x: -eps, y: 0 },
            { x: -eps, y: 2 },
          ]}
          color="var(--ink-4)"
          width={1}
          dash="3 4"
        />
        <Polyline
          pts={[
            { x: eps, y: 0 },
            { x: eps, y: 2 },
          ]}
          color="var(--ink-4)"
          width={1}
          dash="3 4"
        />
        <Label x={-eps} y={1.85} dx={-4} anchor="end" className="plot-label--math">
          −ε
        </Label>
        <Label x={eps} y={1.85} dx={4} className="plot-label--math">
          +ε
        </Label>
        <FnPath f={L} color="var(--c-red)" width={2.6} samples={400} />
        <Dot x={r} y={L(r)} r={5} color="var(--c-red)" />
        <Handle x={r} y={0} axis="x" label="residuo d − y" onMove={(p) => setR(p.x)} />
      </Plot>
      <div className="controls">
        <Slider
          label={
            <>
              ampiezza <Tex>\varepsilon</Tex>
            </>
          }
          min={0}
          max={1.2}
          step={0.05}
          value={eps}
          onChange={setEps}
          format={(v) => fmt(v, 2)}
        />
        <Readout label={<Tex>{'d - y'}</Tex>} value={fmt(r, 2)} />
        <Readout
          label={<Tex>{'L_\\varepsilon'}</Tex>}
          tone="red"
          value={fmt(L(r), 2)}
          sub={Math.abs(r) < eps ? 'dentro il tubo: costo zero' : 'fuori dal tubo'}
        />
      </div>
      <Tasks
        items={[
          { label: 'Porta il residuo tra −ε e +ε: l’errore non costa nulla.', done: seen.zero },
          { label: 'Allarga ε fino a 1: il tratto piatto cresce e più errori diventano gratuiti.', done: seen.big },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 13.9 */

const TUBE = (() => {
  const r = rng(1319)
  const xs = Array.from({ length: 26 }, (_, i) => (i + 0.2 + 0.6 * r()) / 26)
  return xs.map((x) => ({ x, t: Math.sin(2 * Math.PI * x) + 0.22 * gauss(r) }))
})()

export function EpsTube() {
  const [eps, setEps] = useState(0.2)
  const [lc, setLc] = useState(1)
  const m = useMemo(
    () =>
      trainSvr(
        TUBE.map((p) => [p.x]),
        TUBE.map((p) => p.t),
        10 ** lc,
        eps,
        rbfK(0.12),
      ),
    [eps, lc],
  )
  const h = (x: number) => svrAt(m, [x])
  const sv = TUBE.map((_, i) => Math.abs(m.gamma[i]) > 1e-6)
  const nSv = sv.filter(Boolean).length
  const seen = useLatch({ wide: eps >= 0.4, zero: eps === 0 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'dati', color: POS, kind: 'dot' },
            {
              label: (
                <>
                  modello <Tex>{'h(\\mathbf{x})'}</Tex>
                </>
              ),
              color: 'var(--c-red)',
            },
            {
              label: (
                <>
                  tubo <Tex>\pm\varepsilon</Tex>
                </>
              ),
              color: 'var(--c-red)',
              kind: 'area',
            },
            {
              label: (
                <>
                  slack <Tex>{"\\xi_i, \\xi'_i"}</Tex>
                </>
              ),
              color: 'var(--c-violet)',
            },
          ]}
        />
      </div>
      <Plot xDomain={[0, 1]} yDomain={[-1.8, 1.8]} aspect={0.5}>
        <Tube h={h} eps={eps} />
        <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="d" />
        <FnPath f={h} color="var(--c-red)" width={2.4} samples={300} />
        {TUBE.map((p, i) => {
          const y = h(p.x)
          const out = Math.abs(p.t - y) - eps
          return out > 1e-6 ? (
            <Polyline
              key={`s${i}`}
              pts={[
                { x: p.x, y: y + Math.sign(p.t - y) * eps },
                { x: p.x, y: p.t },
              ]}
              color="var(--c-violet)"
              width={2}
            />
          ) : null
        })}
        {TUBE.map((p, i) => (
          <g key={i}>
            {sv[i] && <Dot x={p.x} y={p.t} r={9} color="var(--ink)" hollow />}
            <Dot x={p.x} y={p.t} r={4.5} color={POS} />
          </g>
        ))}
      </Plot>
      <div className="controls">
        <Slider
          label={
            <>
              ampiezza del tubo <Tex>\varepsilon</Tex>
            </>
          }
          min={0}
          max={0.6}
          step={0.02}
          value={eps}
          onChange={setEps}
          format={(v) => fmt(v, 2)}
        />
        <Slider
          label={
            <>
              iperparametro <Tex>C</Tex>
            </>
          }
          min={-1}
          max={2}
          step={0.05}
          value={lc}
          onChange={setLc}
          format={(v) => fmt(10 ** v, v < 0 ? 2 : 0)}
        />
        <Readout label="support vector (cerchiati)" tone="accent" value={`${nSv} su ${TUBE.length}`} />
      </div>
      <Tasks
        items={[
          { label: 'Allarga il tubo: i punti dentro non contano e i support vector diminuiscono.', done: seen.wide },
          { label: 'Porta ε a zero: ogni errore costa, e quasi tutti i punti diventano support vector.', done: seen.zero },
        ]}
      />
    </div>
  )
}

function Tube({ h, eps }: { h: (x: number) => number; eps: number }) {
  const { x, y } = usePlot()
  const xs = Array.from({ length: 161 }, (_, i) => i / 160)
  const up = xs.map((v) => `${x(v)},${y(h(v) + eps)}`)
  const dn = xs.map((v) => `${x(v)},${y(h(v) - eps)}`).reverse()
  return <polygon className="svm13__tube" points={[...up, ...dn].join(' ')} />
}
