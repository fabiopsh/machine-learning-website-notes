import { useState } from 'react'
import { Arrow, Axes, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Readout, Segmented } from '../../components/ui/Controls'

type P = { x: number; y: number }
const D: [number, number] = [-4, 4]

/** Prodotto scalare come "allineamento" tra vettori, e le tre norme a confronto. */
export function DotProduct() {
  const [mode, setMode] = useState<'dot' | 'norm'>('dot')
  const [a, setA] = useState<P>({ x: 3, y: 1 })
  const [b, setB] = useState<P>({ x: 1.2, y: 2.6 })
  const [norm, setNorm] = useState<'2' | '1' | 'inf'>('2')
  const [seen, setSeen] = useState({ ortho: false, neg: false, par: false, norms: false })

  const dot = a.x * b.x + a.y * b.y
  const na = Math.hypot(a.x, a.y)
  const nb = Math.hypot(b.x, b.y)
  const cos = na && nb ? dot / (na * nb) : 0
  const theta = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI
  const state = Math.abs(cos) < 0.035 ? 'ortho' : cos > 0.998 ? 'par' : cos > 0 ? 'pos' : 'neg'

  const mark = (st: string) =>
    setSeen((s) => ({ ...s, ortho: s.ortho || st === 'ortho', neg: s.neg || st === 'neg', par: s.par || st === 'par' }))

  const onA = (p: P) => {
    setA(snap(p, b))
    mark(stateOf(snap(p, b), b))
  }
  const onB = (p: P) => {
    setB(snap(p, a))
    mark(stateOf(a, snap(p, a)))
  }

  const n1 = Math.abs(a.x) + Math.abs(a.y)
  const nInf = Math.max(Math.abs(a.x), Math.abs(a.y))

  return (
    <div>
      <div className="wbar">
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m)
            if (m === 'norm') setSeen((s) => ({ ...s, norms: true }))
          }}
          options={[
            { value: 'dot', label: 'Prodotto scalare' },
            { value: 'norm', label: 'Norme' },
          ]}
        />
        {mode === 'norm' && (
          <Segmented
            size="sm"
            value={norm}
            onChange={setNorm}
            options={[
              { value: '1', label: <Tex>{'L^1'}</Tex> },
              { value: '2', label: <Tex>{'L^2'}</Tex> },
              { value: 'inf', label: <Tex>{'L^\\infty'}</Tex> },
            ]}
          />
        )}
      </div>
      <div className="wgrid">
        <Plot xDomain={D} yDomain={D} equal aspect={0.9} maxH={400} margin={{ l: 30, r: 10, t: 10, b: 26 }}>
          <Axes xTicks={[-4, -2, 0, 2, 4]} yTicks={[-4, -2, 0, 2, 4]} origin />
          {mode === 'dot' ? (
            <>
              <Projection a={a} b={b} />
              <AngleArc a={a} b={b} theta={theta} />
              <Arrow from={{ x: 0, y: 0 }} to={b} color="var(--c-orange)" width={2.6} />
              <Arrow from={{ x: 0, y: 0 }} to={a} color="var(--c-blue)" width={2.6} />
              <Label x={a.x} y={a.y} dx={12} dy={-10} className="plot-label--math plot-label--strong">
                a
              </Label>
              <Label x={b.x} y={b.y} dx={12} dy={-10} className="plot-label--math plot-label--strong">
                b
              </Label>
              <Handle x={b.x} y={b.y} color="var(--c-orange)" label="punta del vettore b" onMove={onB} />
              <Handle x={a.x} y={a.y} color="var(--c-blue)" label="punta del vettore a" onMove={onA} />
            </>
          ) : (
            <>
              <NormBalls a={a} active={norm} />
              <Polyline
                pts={[
                  { x: 0, y: 0 },
                  { x: a.x, y: 0 },
                  { x: a.x, y: a.y },
                ]}
                color="var(--ink-4)"
                width={1.2}
                dash="3 3"
              />
              <Arrow from={{ x: 0, y: 0 }} to={a} color="var(--c-blue)" width={2.6} />
              <Label x={a.x} y={a.y} dx={12} dy={-10} className="plot-label--math plot-label--strong">
                x
              </Label>
              <Handle x={a.x} y={a.y} color="var(--c-blue)" label="punta del vettore x" onMove={(p) => setA(p)} />
            </>
          )}
        </Plot>
        <div className="wside">
          {mode === 'dot' ? (
            <>
              <div className="wpanel">
                <div className="wpanel__title">Per componenti</div>
                <div className="wmath">
                  <Tex>{`\\mathbf{a}\\cdot\\mathbf{b} = (${f(a.x)})(${f(b.x)}) + (${f(a.y)})(${f(b.y)}) = ${f(dot)}`}</Tex>
                </div>
              </div>
              <div className="wpanel">
                <div className="wpanel__title">Con l’angolo</div>
                <div className="wmath">
                  <Tex>{`|\\mathbf{a}|\\,|\\mathbf{b}|\\cos\\theta = ${f(na)} \\cdot ${f(nb)} \\cdot \\cos(${theta.toFixed(0)}^\\circ) = ${f(na * nb * cos)}`}</Tex>
                </div>
              </div>
              <span className={`verdict ${state === 'neg' ? 'verdict--bad' : state === 'ortho' ? 'verdict--info' : 'verdict--good'}`}>
                {state === 'ortho'
                  ? 'Ortogonali: il prodotto scalare è nullo'
                  : state === 'par'
                    ? 'Paralleli: il prodotto scalare è massimo'
                    : state === 'pos'
                      ? 'Puntano nella stessa direzione: prodotto positivo'
                      : 'Versi opposti: prodotto negativo'}
              </span>
              <p className="wnote">
                La parte colorata lungo <Tex>{'\\mathbf{a}'}</Tex> è la proiezione di <Tex>{'\\mathbf{b}'}</Tex>: il prodotto
                scalare vale la sua lunghezza (con segno) per <Tex>{'|\\mathbf{a}|'}</Tex>.
              </p>
            </>
          ) : (
            <>
              <Readout
                label={<Tex>{'\\|\\mathbf{x}\\|_2 = \\sqrt{x_1^2 + x_2^2}'}</Tex>}
                value={fmt(na, 3)}
                tone={norm === '2' ? 'accent' : undefined}
              />
              <Readout label={<Tex>{'\\|\\mathbf{x}\\|_1 = |x_1| + |x_2|'}</Tex>} value={fmt(n1, 3)} tone={norm === '1' ? 'accent' : undefined} />
              <Readout
                label={<Tex>{'\\|\\mathbf{x}\\|_\\infty = \\max_i |x_i|'}</Tex>}
                value={fmt(nInf, 3)}
                tone={norm === 'inf' ? 'accent' : undefined}
              />
              <p className="wnote">
                La forma tratteggiata è l’insieme dei punti che hanno la <em>stessa</em> norma di <Tex>{'\\mathbf{x}'}</Tex>: un
                cerchio per <Tex>{'L^2'}</Tex>, un rombo per <Tex>{'L^1'}</Tex>, un quadrato per <Tex>{'L^\\infty'}</Tex>. Per
                ogni vettore vale <Tex>{'\\|\\mathbf{x}\\|_\\infty \\le \\|\\mathbf{x}\\|_2 \\le \\|\\mathbf{x}\\|_1'}</Tex>.
              </p>
            </>
          )}
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Rendi i due vettori ortogonali: il prodotto scalare si annulla.', done: seen.ortho },
          { label: 'Porta b dalla parte opposta di a: il prodotto diventa negativo.', done: seen.neg },
          { label: 'Allinea b con a: per lunghezze fissate il prodotto è massimo.', done: seen.par },
          { label: 'Passa alla scheda “Norme” e confronta le tre misure di lunghezza.', done: seen.norms },
        ]}
      />
    </div>
  )
}

const f = (v: number) => fmt(v).replace(',', '{,}')

function stateOf(a: P, b: P) {
  const c = (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1)
  return Math.abs(c) < 0.035 ? 'ortho' : c > 0.998 ? 'par' : c > 0 ? 'pos' : 'neg'
}

/** Aggancio morbido all'ortogonalità: aiuta a "trovare" il prodotto nullo. */
function snap(p: P, other: P): P {
  const no = Math.hypot(other.x, other.y)
  const np = Math.hypot(p.x, p.y)
  if (!no || !np) return p
  const c = (p.x * other.x + p.y * other.y) / (no * np)
  if (Math.abs(c) < 0.03) {
    // proietta su una delle due perpendicolari
    const ux = -other.y / no
    const uy = other.x / no
    const s = p.x * ux + p.y * uy >= 0 ? 1 : -1
    return { x: ux * np * s, y: uy * np * s }
  }
  if (Math.abs(c) > 0.996) {
    // e al parallelismo (stesso verso o verso opposto)
    const s = c > 0 ? 1 : -1
    return { x: (other.x / no) * np * s, y: (other.y / no) * np * s }
  }
  return p
}

function Projection({ a, b }: { a: P; b: P }) {
  const na2 = a.x * a.x + a.y * a.y
  if (!na2) return null
  const k = (a.x * b.x + a.y * b.y) / na2
  const pr = { x: a.x * k, y: a.y * k }
  return (
    <>
      <Polyline pts={[b, pr]} color="var(--ink-4)" width={1.2} dash="3 4" />
      <Polyline pts={[{ x: 0, y: 0 }, pr]} color="var(--c-orange)" width={7} opacity={0.28} />
    </>
  )
}

function AngleArc({ a, b, theta }: { a: P; b: P; theta: number }) {
  const { x, y } = usePlot()
  const r = 0.9
  const a1 = Math.atan2(a.y, a.x)
  const a2 = Math.atan2(b.y, b.x)
  let d = a2 - a1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const N = 24
  let path = ''
  for (let i = 0; i <= N; i++) {
    const t = a1 + (d * i) / N
    path += `${i ? 'L' : 'M'}${x(Math.cos(t) * r)},${y(Math.sin(t) * r)}`
  }
  const mid = a1 + d / 2
  return (
    <g>
      <path d={path} fill="none" stroke="var(--ink-3)" strokeWidth={1.3} />
      <text className="plot-label" x={x(Math.cos(mid) * (r + 0.45))} y={y(Math.sin(mid) * (r + 0.45)) + 4} textAnchor="middle">
        θ = {theta.toFixed(0)}°
      </text>
    </g>
  )
}

function NormBalls({ a, active }: { a: P; active: '1' | '2' | 'inf' }) {
  const { x, y } = usePlot()
  const r2 = Math.hypot(a.x, a.y)
  const r1 = Math.abs(a.x) + Math.abs(a.y)
  const ri = Math.max(Math.abs(a.x), Math.abs(a.y))
  const style = (k: string, color: string) => ({
    fill: k === active ? `color-mix(in srgb, ${color} 10%, transparent)` : 'none',
    stroke: color,
    strokeWidth: k === active ? 2 : 1.2,
    strokeDasharray: '5 4',
    opacity: k === active ? 1 : 0.45,
  })
  const k = x(1) - x(0)
  return (
    <g>
      <rect x={x(-ri)} y={y(ri)} width={2 * ri * k} height={2 * ri * k} style={style('inf', 'var(--c-violet)')} />
      <circle cx={x(0)} cy={y(0)} r={r2 * k} style={style('2', 'var(--c-green)')} />
      <path d={`M${x(r1)},${y(0)}L${x(0)},${y(r1)}L${x(-r1)},${y(0)}L${x(0)},${y(-r1)}Z`} style={style('1', 'var(--c-orange)')} />
    </g>
  )
}
