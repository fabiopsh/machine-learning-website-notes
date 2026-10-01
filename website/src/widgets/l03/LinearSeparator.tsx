import { useMemo, useState } from 'react'
import { Arrow, Axes, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Segmented } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { Surface3D, type Overlay } from '../common/Surface3D'
import { useLatch } from '../../lib/useLatch'

type P = { x: number; y: number }
type Pt = P & { d: 0 | 1 }

const DATA: Pt[] = [
  { x: 1.9, y: 3.8, d: 1 },
  { x: 0.8, y: 3.1, d: 1 },
  { x: 2.2, y: 2.8, d: 1 },
  { x: 1.3, y: 1.3, d: 1 },
  { x: 0.5, y: 0.9, d: 1 },
  { x: 4.4, y: 3.1, d: 0 },
  { x: 3.6, y: 2.2, d: 0 },
  { x: 4.3, y: 1.5, d: 0 },
  { x: 3.3, y: 1.1, d: 0 },
]
const X: [number, number] = [0, 5]
const Y: [number, number] = [0, 4.5]

/** Retta per P e Q; la classe 1 sta a sinistra del verso P → Q. */
function lineParams(P: P, Q: P) {
  let w1 = -(Q.y - P.y)
  let w2 = Q.x - P.x
  let w0 = -(w1 * P.x + w2 * P.y)
  const k = Math.max(Math.abs(w1), Math.abs(w2)) || 1
  w1 /= k
  w2 /= k
  w0 /= k
  return { w1, w2, w0 }
}

export function LinearSeparator() {
  const [P, setP] = useState<P>({ x: 0.3, y: 2.0 })
  const [Q, setQ] = useState<P>({ x: 4.7, y: 2.4 })
  const [view, setView] = useState<'2d' | '3d'>('2d')
  const [hover, setHover] = useState<P | null>(null)
  const [seen, setSeen] = useState({ three: false, flip: false })
  const { w1, w2, w0 } = lineParams(P, Q)
  const h = (x: number, y: number) => (w1 * x + w2 * y + w0 >= 0 ? 1 : 0)
  const wrong = DATA.filter((p) => h(p.x, p.y) !== p.d)
  const err = wrong.length / DATA.length

  const reached = useLatch({ perfect: wrong.length === 0 })

  const flip = () => {
    setP(Q)
    setQ(P)
    setSeen((s) => ({ ...s, flip: true }))
  }

  const f3 = useMemo(() => (x: number, y: number) => (w1 * x + w2 * y + w0 >= 0 ? 1 : 0), [w1, w2, w0])
  const overlays = useMemo<Overlay[]>(
    () =>
      DATA.map((p) => ({
        kind: 'point' as const,
        p: [p.x, p.y, p.d] as [number, number, number],
        color: p.d === 1 ? 'var(--c-blue)' : 'var(--c-orange)',
        r: 5.5,
      })),
    [],
  )

  const mid = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }
  const wn = Math.hypot(w1, w2) || 1

  return (
    <div>
      <div className="wbar">
        <Segmented
          value={view}
          onChange={(v) => {
            setView(v)
            if (v === '3d') setSeen((s) => ({ ...s, three: true }))
          }}
          options={[
            { value: '2d', label: tx('Piano degli input', 'Input plane') },
            { value: '3d', label: tx('Vista 3D di h(x)', '3D view of h(x)') },
          ]}
        />
        <Btn icon="reset" onClick={flip}>
          {tx('Inverti le classi', 'Invert classes')}
        </Btn>
      </div>
      <div className="wgrid">
        {view === '2d' ? (
          <Plot
            xDomain={X}
            yDomain={Y}
            aspect={0.78}
            equal
            onPointerMove={(p) => setHover(p)}
            onPointerLeave={() => setHover(null)}
            overlay={({ x, y }) =>
              hover && hover.x > X[0] && hover.x < X[1] && hover.y > Y[0] && hover.y < Y[1] ? (
                <div className="ptip" style={{ left: x(hover.x), top: y(hover.y) }}>
                  <Tex>{'\\mathbf{w}^T\\mathbf{x}+w_0'}</Tex> = <b>{fmt(w1 * hover.x + w2 * hover.y + w0)}</b> → h = <b>{h(hover.x, hover.y)}</b>
                </div>
              ) : null
            }
          >
            <HalfPlanes w1={w1} w2={w2} w0={w0} />
            <Axes xTicks={[0, 1, 2, 3, 4, 5]} yTicks={[0, 1, 2, 3, 4]} xLabel="x₁" yLabel="x₂" />
            <LineThrough P={P} Q={Q} />
            <Arrow from={mid} to={{ x: mid.x + (w1 / wn) * 0.7, y: mid.y + (w2 / wn) * 0.7 }} color="var(--ink-2)" width={1.8} />
            <PointLabels wrong={new Set(wrong)} />
            <Handle x={P.x} y={P.y} label={tx('primo punto della retta', 'first line point')} onMove={setP} />
            <Handle x={Q.x} y={Q.y} label={tx('secondo punto della retta', 'second line point')} onMove={setQ} />
          </Plot>
        ) : (
          <Surface3D
            f={f3}
            x={X}
            y={Y}
            z={[0, 1]}
            n={60}
            ramp="step"
            zScale={0.45}
            overlays={overlays}
            initial={{ yaw: -0.5, pitch: 0.75 }}
            aspect={0.78}
            ariaLabel={tx('La funzione di classificazione 0/1 vista in 3D', '0/1 classification function seen in 3D')}
          />
        )}
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{tx('L’iperpiano (qui una retta)', 'The hyperplane (here a line)')}</div>
            <div className="wmath">
              <Tex>{`${f(w1)}\\,x_1 ${sg(w2)} ${f(Math.abs(w2))}\\,x_2 ${sg(w0)} ${f(Math.abs(w0))} = 0`}</Tex>
            </div>
          </div>
          <div className="wpanel">
            <div className="wpanel__title">{tx('Il classificatore', 'The classifier')}</div>
            <div className="wmath">
              <Tex>{`h(\\mathbf{x}) = \\begin{cases} 1 & \\text{${tx('se', 'if')} } \\mathbf{w}^T\\mathbf{x}+w_0 \\ge 0 \\\\ 0 & \\text{${tx('altrimenti', 'otherwise')}}\\end{cases}`}</Tex>
            </div>
          </div>
          <div className="readouts">
            <Readout label={tx('errori (loss 0/1)', 'errors (0/1 loss)')} value={tx(`${wrong.length} su ${DATA.length}`, `${wrong.length} of ${DATA.length}`)} tone={wrong.length ? undefined : 'accent'} />
            <Readout label={tx('errore medio', 'average error')} value={`${fmt(err * 100, 0)}%`} sub={tx(`accuratezza ${fmt((1 - err) * 100, 0)}%`, `accuracy ${fmt((1 - err) * 100, 0)}%`)} />
          </div>
          <p className="wnote">
            {tx(
              <>
                La freccia è <Tex>{'\\mathbf{w} = (w_1, w_2)'}</Tex>: è perpendicolare alla retta e punta verso la regione dove{' '}
                <Tex>{'h = 1'}</Tex>.
              </>,
              <>
                The arrow is <Tex>{'\\mathbf{w} = (w_1, w_2)'}</Tex>: it is perpendicular to the line and points towards the region where{' '}
                <Tex>{'h = 1'}</Tex>.
              </>,
            )}
          </p>
        </div>
      </div>
      <Tasks
        items={[
          { label: tx('Trascina le due maniglie finché tutti i punti sono classificati bene (0 errori).', 'Drag the two handles until all points are correctly classified (0 errors).'), done: reached.perfect },
          { label: tx('Passa alla vista 3D: h(x) è una funzione «a gradino», che vale 1 da una parte e 0 dall’altra.', 'Switch to 3D view: h(x) is a step function, equal to 1 on one side and 0 on the other.'), done: seen.three },
          { label: tx('Premi «Inverti le classi»: stessa retta, w cambia verso e le regioni si scambiano.', 'Click "Invert classes": same line, w reverses direction and the regions swap.'), done: seen.flip },
        ]}
      />
    </div>
  )
}

const f = (v: number) => fmt(v).replace(',', '{,}').replace('−', '-')
const sg = (v: number) => (v >= 0 ? '+' : '-')

function HalfPlanes({ w1, w2, w0 }: { w1: number; w2: number; w0: number }) {
  const { x, y, clipId } = usePlot()
  // poligono della regione h = 1 dentro il riquadro (clipping di Sutherland–Hodgman su un semipiano)
  const [x0, x1] = x.domain
  const [y0, y1] = y.domain
  const box: P[] = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ]
  const side = (p: P) => w1 * p.x + w2 * p.y + w0
  const clip = (keepPos: boolean) => {
    const out: P[] = []
    for (let i = 0; i < 4; i++) {
      const a = box[i]
      const b = box[(i + 1) % 4]
      const sa = side(a) * (keepPos ? 1 : -1)
      const sb = side(b) * (keepPos ? 1 : -1)
      if (sa >= 0) out.push(a)
      if (sa >= 0 !== sb >= 0) {
        const t = sa / (sa - sb)
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      }
    }
    return out
  }
  const toD = (pts: P[]) => (pts.length ? 'M' + pts.map((p) => `${x(p.x)},${y(p.y)}`).join('L') + 'Z' : '')
  return (
    <g clipPath={`url(#${clipId})`}>
      <path d={toD(clip(true))} fill="var(--c-blue)" opacity={0.1} />
      <path d={toD(clip(false))} fill="var(--c-orange)" opacity={0.1} />
    </g>
  )
}

function LineThrough({ P, Q }: { P: P; Q: P }) {
  const dx = Q.x - P.x
  const dy = Q.y - P.y
  const L = Math.hypot(dx, dy) || 1
  const k = 20
  return (
    <Polyline
      pts={[
        { x: P.x - (dx / L) * k, y: P.y - (dy / L) * k },
        { x: P.x + (dx / L) * k, y: P.y + (dy / L) * k },
      ]}
      color="var(--c-red)"
      width={2.4}
    />
  )
}

function PointLabels({ wrong }: { wrong: Set<Pt> }) {
  const { x, y } = usePlot()
  return (
    <g>
      {DATA.map((p, i) => {
        const bad = wrong.has(p)
        return (
          <g key={i} transform={`translate(${x(p.x)} ${y(p.y)})`} className={`lsep__pt${bad ? ' is-bad' : ''}`}>
            {bad && <circle r={15} className="lsep__ring" />}
            <circle r={11} fill={p.d ? 'var(--c-blue)' : 'var(--c-orange)'} stroke="var(--plot-bg)" strokeWidth={2} />
            <text y={4.5} textAnchor="middle">
              {p.d}
            </text>
          </g>
        )
      })}
    </g>
  )
}
