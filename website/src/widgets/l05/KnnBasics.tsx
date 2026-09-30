import { useMemo, useState } from 'react'
import { Axes, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

type P = { x: number; y: number }
type LP = P & { c: 0 | 1 }
const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'
const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)

/* ------------------------------------------------------------------ Fig. 5.16 */

const QX: [number, number] = [0, 10]
const QY: [number, number] = [0, 7]
const QPTS: LP[] = [
  { x: 5.6, y: 3.9, c: 1 },
  { x: 3.6, y: 4.6, c: 0 },
  { x: 6.5, y: 4.6, c: 0 },
  { x: 4.9, y: 5.5, c: 0 },
  { x: 4.8, y: 1.0, c: 0 },
  { x: 3.1, y: 1.8, c: 1 },
  { x: 6.3, y: 1.4, c: 1 },
  { x: 1.3, y: 4.7, c: 1 },
  { x: 8.6, y: 2.6, c: 0 },
  { x: 8.9, y: 5.9, c: 1 },
  { x: 1.6, y: 1.2, c: 0 },
]
const Q0: P = { x: 4.9, y: 3.3 }

export function KnnQuery() {
  const [q, setQ] = useState<P>(Q0)
  const [k, setK] = useState(1)
  const order = QPTS.map((p, i) => ({ i, d: dist(p, q) })).sort((a, b) => a.d - b.d)
  const nb = order.slice(0, k)
  const plus = nb.filter((o) => QPTS[o.i].c === 1).length
  const res = plus / k > 0.5 ? 1 : 0
  const R = order[k - 1].d
  const moved = useLatch({ m: q.x !== Q0.x || q.y !== Q0.y }).m
  const seen = useLatch({ five: !moved && k === 5, agree: moved && k >= 3 && res === QPTS[order[0].i].c && res === 1 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: '+ (classe 1)', color: C1, kind: 'dot' },
            { label: '− (classe 0)', color: C0, kind: 'dot' },
          ]}
        />
        <Segmented size="sm" label="k" value={k} onChange={setK} options={[1, 3, 5, 7, 9].map((v) => ({ value: v, label: String(v) }))} />
      </div>
      <div className="wgrid">
        <Plot xDomain={QX} yDomain={QY} equal aspect={0.72} margin={{ l: 14, r: 10, t: 10, b: 14 }}>
          <Axes hideX hideY grid={false} />
          <Circle c={q} r={R} />
          {nb.map((o) => (
            <Polyline key={o.i} pts={[q, QPTS[o.i]]} color="var(--ink-4)" width={1.2} />
          ))}
          {QPTS.map((p, i) => (
            <Sign key={i} p={p} in={nb.some((o) => o.i === i)} />
          ))}
          <Label x={q.x} y={q.y} dx={12} dy={20} className="plot-label--math plot-label--strong">
            xq
          </Label>
          <Handle x={q.x} y={q.y} label="punto di interrogazione x_q" onMove={setQ} />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label="vicini «+»" tone="blue" value={String(plus)} />
            <Readout label="vicini «−»" tone="orange" value={String(k - plus)} />
          </div>
          <span className={`verdict ${res ? 'verdict--info' : 'verdict--warn'}`}>
            {k}-NN risponde {res ? '«+»' : '«−»'}
          </span>
          <p className="wnote">
            Il cerchio passa per il {k}° vicino: dentro ci sono i {k} esempi più vicini a x<sub>q</sub>, che votano a maggioranza.
          </p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Con k = 1 risponde «+» (il vicino più prossimo); passa a k = 5 senza muovere il punto: risponde «−».',
            done: seen.five,
          },
          { label: 'Sposta il punto di interrogazione dove anche con k ≥ 3 la risposta è «+».', done: seen.agree },
        ]}
      />
    </div>
  )
}

function Circle({ c, r }: { c: P; r: number }) {
  const { x, y } = usePlot()
  const rp = Math.abs(x(c.x + r) - x(c.x))
  return <circle cx={x(c.x)} cy={y(c.y)} r={rp + 13} fill="var(--accent-soft)" stroke="var(--ink-2)" strokeWidth={1.6} />
}

function Sign({ p, in: inside }: { p: LP; in: boolean }) {
  const { x, y } = usePlot()
  return (
    <g transform={`translate(${x(p.x)} ${y(p.y)})`} className={`knn__sign${inside ? ' is-in' : ''}`}>
      <circle r={11} fill={p.c ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={2} />
      <path d={p.c ? 'M-5,0H5M0,-5V5' : 'M-5,0H5'} stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.18 */

const VX: [number, number] = [0, 10]
const VY: [number, number] = [0, 8]

function sites(seed: number): LP[] {
  const r = rng(seed)
  const out: LP[] = []
  while (out.length < 26) {
    const p = { x: 0.4 + r() * 9.2, y: 0.4 + r() * 7.2 }
    if (out.every((o) => dist(o, p) > 1.1)) {
      // classe 1 più probabile a sinistra, per avere zone compatte come nella figura
      const c = (r() < (p.x < 5 ? 0.72 : 0.28) ? 1 : 0) as 0 | 1
      out.push({ ...p, c })
    }
  }
  return out
}

type V = { p: P; t: number }

/** cella di Voronoi del sito i: il rettangolo tagliato dai semipiani «più vicino a i che a j» */
function cell(S: LP[], i: number): V[] {
  let poly: V[] = [
    { p: { x: VX[0], y: VY[0] }, t: -1 },
    { p: { x: VX[1], y: VY[0] }, t: -1 },
    { p: { x: VX[1], y: VY[1] }, t: -1 },
    { p: { x: VX[0], y: VY[1] }, t: -1 },
  ]
  const a = S[i]
  S.forEach((b, j) => {
    if (j === i || poly.length < 3) return
    // tieni i punti p con (b − a)·p ≤ (|b|² − |a|²)/2
    const n = { x: b.x - a.x, y: b.y - a.y }
    const c = (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2
    const side = (p: P) => n.x * p.x + n.y * p.y - c
    const out: V[] = []
    for (let k = 0; k < poly.length; k++) {
      const A = poly[k]
      const B = poly[(k + 1) % poly.length]
      const sa = side(A.p)
      const sb = side(B.p)
      const inA = sa <= 0
      const inB = sb <= 0
      const I = () => {
        const t = sa / (sa - sb)
        return { x: A.p.x + (B.p.x - A.p.x) * t, y: A.p.y + (B.p.y - A.p.y) * t }
      }
      if (inA) out.push(A)
      if (inA && !inB) out.push({ p: I(), t: j })
      if (!inA && inB) out.push({ p: I(), t: A.t })
    }
    poly = out
  })
  return poly
}

export function Voronoi() {
  const [seed, setSeed] = useState(3)
  const S = useMemo(() => sites(seed), [seed])
  const cells = useMemo(() => S.map((_, i) => cell(S, i)), [S])
  const [q, setQ] = useState<P>({ x: 5, y: 4 })
  const [border, setBorder] = useState(false)
  const nearest = S.reduce((best, p, i) => (dist(p, q) < dist(S[best], q) ? i : best), 0)
  const [cellsSeen, setCellsSeen] = useState<number[]>([])
  if (!cellsSeen.includes(nearest)) setCellsSeen([...cellsSeen, nearest])
  const seen = useLatch({ walk: cellsSeen.length >= 4, border, other: seed !== 3 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'celle dei punti di classe 1', color: C1, kind: 'area' },
            { label: 'di classe 0', color: C0, kind: 'area' },
            ...(border ? [{ label: 'confine del 1-NN', color: 'var(--ink)' }] : []),
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={VX} yDomain={VY} equal aspect={0.8} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
          <Axes hideX hideY grid={false} />
          <Cells S={S} cells={cells} hot={nearest} border={border} />
          <Polyline pts={[q, S[nearest]]} color="var(--ink-2)" width={1.4} dash="4 3" />
          <Handle x={q.x} y={q.y} label="punto da classificare" onMove={setQ} />
        </Plot>
        <div className="wside">
          <span className={`verdict ${S[nearest].c ? 'verdict--info' : 'verdict--warn'}`}>il 1-NN risponde classe {S[nearest].c}</span>
          <p className="wnote">
            Ogni cella contiene i punti del piano più vicini al suo pattern che a qualsiasi altro; i lati delle celle sono equidistanti da
            due pattern.
          </p>
          <Toggle label="evidenzia il confine del 1-NN" checked={border} onChange={setBorder} />
          <Btn icon="reset" onClick={() => setSeed((s) => s + 1)}>
            Altri punti
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Trascina il punto attraverso almeno quattro celle: la risposta è l’etichetta della cella.', done: seen.walk },
          { label: 'Evidenzia il confine del 1-NN: segue i lati tra celle di classi diverse.', done: seen.border },
          { label: 'Genera altri punti: le celle cambiano, la regola no.', done: seen.other },
        ]}
      />
    </div>
  )
}

function Cells({ S, cells, hot, border }: { S: LP[]; cells: V[][]; hot: number; border: boolean }) {
  const { x, y } = usePlot()
  const d = (poly: V[]) => 'M' + poly.map((v) => `${x(v.p.x).toFixed(1)},${y(v.p.y).toFixed(1)}`).join('L') + 'Z'
  let bd = ''
  cells.forEach((poly, i) =>
    poly.forEach((v, k) => {
      if (v.t > i && S[v.t].c !== S[i].c) {
        const w = poly[(k + 1) % poly.length]
        bd += `M${x(v.p.x).toFixed(1)},${y(v.p.y).toFixed(1)}L${x(w.p.x).toFixed(1)},${y(w.p.y).toFixed(1)}`
      }
    }),
  )
  return (
    <g>
      {cells.map((poly, i) => (
        <path
          key={i}
          d={d(poly)}
          fill={S[i].c ? C1 : C0}
          fillOpacity={i === hot ? 0.34 : 0.13}
          stroke="var(--ink-3)"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      ))}
      {border && <path d={bd} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />}
      {S.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={4.5} fill={p.c ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={1.5} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.22 */

const SQ: P = { x: 1.0, y: 1.5 }
const SA: LP = { x: 1.2, y: 3.9, c: 1 }
const SB: LP = { x: 4.5, y: 2.2, c: 0 }

export function ScaleNN() {
  const [alpha, setAlpha] = useState(1)
  const sc = (p: P) => ({ x: alpha * p.x, y: p.y })
  const q = sc(SQ)
  const a = sc(SA)
  const b = sc(SB)
  const da = dist(q, a)
  const db = dist(q, b)
  const nearA = da <= db
  const seen = useLatch({ flip: !nearA, big: alpha >= 1.4 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'punto in alto (classe 1)', color: C1, kind: 'dot' },
            { label: 'punto a destra (classe 0)', color: C0, kind: 'dot' },
            { label: 'vicino più prossimo', color: 'var(--ink)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={[0, 7]} yDomain={[0, 4.6]} equal aspect={0.66} margin={{ l: 30, b: 34 }}>
          <Axes xTicks={[0, 1, 2, 3, 4, 5, 6, 7]} yTicks={[0, 1, 2, 3, 4]} xLabel={alpha === 1 ? 'x₁' : `${fmt(alpha)} · x₁`} yLabel="x₂" />
          <Polyline pts={[q, a]} color={nearA ? 'var(--ink)' : 'var(--ink-4)'} width={nearA ? 2.2 : 1.2} dash={nearA ? undefined : '4 4'} />
          <Polyline
            pts={[q, b]}
            color={!nearA ? 'var(--ink)' : 'var(--ink-4)'}
            width={!nearA ? 2.2 : 1.2}
            dash={!nearA ? undefined : '4 4'}
          />
          <Pt p={a} c={1} />
          <Pt p={b} c={0} />
          <Pt p={q} c={-1} />
          <Label x={q.x} y={q.y} dx={-4} dy={22} anchor="middle" className="plot-label--math plot-label--strong">
            x
          </Label>
        </Plot>
        <div className="wside">
          <Slider label={<>scala di x₁ (α)</>} min={0.2} max={1.6} step={0.01} value={alpha} onChange={setAlpha} format={(v) => fmt(v)} />
          <div className="readouts">
            <Readout label="distanza dal punto in alto" tone="blue" value={fmt(da)} />
            <Readout label="distanza dal punto a destra" tone="orange" value={fmt(db)} />
          </div>
          <span className={`verdict ${nearA ? 'verdict--info' : 'verdict--warn'}`}>
            vicino più prossimo: {nearA ? 'il punto in alto' : 'il punto a destra'}
          </span>
          <p className="wnote">Riscalare una variabile equivale a cambiare la metrica: gli stessi dati hanno un vicino diverso.</p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Comprimi l’asse x₁ (α piccolo): il vicino più prossimo diventa il punto a destra.', done: seen.flip },
          { label: 'Allarga l’asse x₁ (α grande): il punto a destra si allontana ancora di più.', done: seen.big },
        ]}
      />
    </div>
  )
}

function Pt({ p, c }: { p: P; c: number }) {
  const { x, y } = usePlot()
  return (
    <circle cx={x(p.x)} cy={y(p.y)} r={c < 0 ? 4 : 7} fill={c < 0 ? 'var(--ink)' : c ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={2} />
  )
}
