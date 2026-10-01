import { useEffect, useMemo, useRef, useState } from 'react'
import { Arrow, Axes, Dot, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { floorOf, Surface3D, type Overlay, type V3 } from '../common/Surface3D'

type Preset = 'dome' | 'bowl' | 'saddle'
type Fn = {
  f: (x: number, y: number) => number
  g: (x: number, y: number) => [number, number]
  z: [number, number]
  levels: number[]
  start: [number, number]
  kind: string
}

const R: [number, number] = [-2.2, 2.2]

const FNS: Record<Preset, Fn> = {
  dome: {
    f: (x, y) => 2 * Math.exp(-(x * x + y * y) / 1.8),
    g: (x, y) => {
      const v = 2 * Math.exp(-(x * x + y * y) / 1.8)
      return [(-2 * x * v) / 1.8, (-2 * y * v) / 1.8]
    },
    z: [0, 2.1],
    levels: [0.15, 0.4, 0.7, 1.0, 1.3, 1.6, 1.85],
    start: [0.9, -0.7],
    kind: tx('un massimo', 'a maximum'),
  },
  bowl: {
    f: (x, y) => 0.5 * x * x + 0.25 * y * y,
    g: (x, y) => [x, 0.5 * y],
    z: [0, 3.7],
    levels: [0.15, 0.45, 0.9, 1.5, 2.2, 3.0],
    start: [-1.6, 1.4],
    kind: tx('un minimo', 'a minimum'),
  },
  saddle: {
    f: (x, y) => 0.35 * (x * x - y * y),
    g: (x, y) => [0.7 * x, -0.7 * y],
    z: [-1.75, 1.75],
    levels: [-1.2, -0.8, -0.4, -0.1, 0.1, 0.4, 0.8, 1.2],
    start: [1.3, 0.25],
    kind: tx('un punto di sella', 'a saddle point'),
  },
}

const ARROW_K = 0.55
const ETA = 0.45
const GAP = 0.55

export function GradientExplorer() {
  const [preset, setPreset] = useState<Preset>('dome')
  const F = FNS[preset]
  const [p, setP] = useState<[number, number]>(F.start)
  const [trail, setTrail] = useState<[number, number][]>([])
  const [auto, setAuto] = useState(false)
  const [done, setDone] = useState({ dragged: false, descent: false })
  const runRef = useRef(0)

  const [gx, gy] = F.g(p[0], p[1])
  const gn = Math.hypot(gx, gy)
  const z = F.f(p[0], p[1])
  const stationary = gn < 0.03

  const reached = useLatch({ stationary, saddle: stationary && preset === 'saddle' })

  const choose = (k: Preset) => {
    setPreset(k)
    setP(FNS[k].start)
    setTrail([])
    setAuto(false)
  }

  const pRef = useRef(p)
  useEffect(() => {
    pRef.current = p
  }, [p])

  /** Un passo di discesa; restituisce la norma del gradiente nel nuovo punto. */
  const step = () => {
    const cur = pRef.current
    const [a, b] = FNS[preset].g(cur[0], cur[1])
    const next: [number, number] = [
      Math.max(R[0], Math.min(R[1], cur[0] - ETA * a)),
      Math.max(R[0], Math.min(R[1], cur[1] - ETA * b)),
    ]
    pRef.current = next
    setP(next)
    setTrail((t) => (t.length ? [...t, next] : [cur, next]))
    setDone((d) => ({ ...d, descent: true }))
    const [na, nb] = FNS[preset].g(next[0], next[1])
    return Math.hypot(na, nb)
  }

  useEffect(() => {
    if (!auto) return
    const id = ++runRef.current
    let n = 0
    const t = window.setInterval(() => {
      if (runRef.current !== id) return
      n++
      const g = step()
      if (n > 40 || g < 0.004) setAuto(false)
    }, 140)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, preset])

  const overlays = useMemo<Overlay[]>(() => {
    const zf = floorOf(F.z, GAP)
    const tip: V3 = [p[0] + ARROW_K * gx, p[1] + ARROW_K * gy, zf]
    const anti: V3 = [p[0] - ARROW_K * gx, p[1] - ARROW_K * gy, zf]
    const list: Overlay[] = [
      { kind: 'line', a: [p[0], p[1], zf], b: [p[0], p[1], z], color: 'var(--ink-3)', width: 1.2, dash: [4, 4] },
      { kind: 'arrow', a: [p[0], p[1], zf], b: tip, color: 'var(--c-orange)', width: 2.4 },
      { kind: 'arrow', a: [p[0], p[1], zf], b: anti, color: 'var(--c-green)', width: 2.4 },
      { kind: 'point', p: [p[0], p[1], zf], color: 'var(--ink-2)', r: 3.5 },
    ]
    if (trail.length > 1) list.push({ kind: 'polyline', pts: trail.map(([a, b]) => [a, b, F.f(a, b)] as V3), color: 'var(--accent)', width: 2.2 })
    list.push({ kind: 'point', p: [p[0], p[1], z], color: 'var(--accent)', r: 6 })
    return list
  }, [p, gx, gy, z, F, trail])

  return (
    <div className="gradx">
      <div className="wbar">
        <Segmented
          value={preset}
          onChange={choose}
          options={[
            { value: 'dome', label: tx('Cupola', 'Dome') },
            { value: 'bowl', label: tx('Conca', 'Bowl') },
            { value: 'saddle', label: tx('Sella', 'Saddle') },
          ]}
        />
        <Legend
          items={[
            { label: <Tex>{'\\nabla f'}</Tex>, color: 'var(--c-orange)' },
            { label: <Tex>{'-\\nabla f'}</Tex>, color: 'var(--c-green)' },
            { label: tx('curve di livello', 'level curves'), color: 'var(--c-blue)' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <Surface3D
          f={F.f}
          x={R}
          y={R}
          z={F.z}
          levels={F.levels}
          overlays={overlays}
          floorGap={GAP}
          aspect={0.95}
          ariaLabel={tx(
            'Superficie z = f(x1, x2) con il punto selezionato e le curve di livello sul piano',
            'Surface z = f(x1, x2) with the selected point and the level curves on the plane',
          )}
        />
        <Plot xDomain={R} yDomain={R} equal aspect={1} maxH={380} margin={{ l: 34, r: 12, t: 12, b: 30 }}>
          {({ x, y }) => (
            <>
              <Axes xTicks={[-2, -1, 0, 1, 2]} yTicks={[-2, -1, 0, 1, 2]} origin xLabel="x₁" yLabel="x₂" />
              <Contours f={F.f} levels={F.levels} />
              <path
                d={segsToPath(contourSegments(F.f, R, R, z, 70), x, y)}
                stroke="var(--ink)"
                strokeWidth={1.6}
                fill="none"
                opacity={stationary ? 0 : 0.85}
              />
              {!stationary && <Tangent p={p} g={[gx, gy]} />}
              {trail.length > 1 && <Polyline pts={trail.map(([a, b]) => ({ x: a, y: b }))} color="var(--accent)" width={2} opacity={0.7} />}
              {trail.slice(0, -1).map(([a, b], i) => (
                <Dot key={i} x={a} y={b} r={2.5} color="var(--accent)" />
              ))}
              <Arrow from={{ x: p[0], y: p[1] }} to={{ x: p[0] + ARROW_K * gx, y: p[1] + ARROW_K * gy }} color="var(--c-orange)" width={2.4} />
              <Arrow from={{ x: p[0], y: p[1] }} to={{ x: p[0] - ARROW_K * gx, y: p[1] - ARROW_K * gy }} color="var(--c-green)" width={2.4} />
              <Handle
                x={p[0]}
                y={p[1]}
                label={tx('punto sul piano', 'point on the plane')}
                onMove={(q) => {
                  setP([q.x, q.y])
                  setTrail([])
                  setAuto(false)
                  setDone((d) => ({ ...d, dragged: true }))
                }}
              />
            </>
          )}
        </Plot>
      </div>
      <div className="controls">
        <div className="readouts">
          <Readout label={<Tex>{'(x_1, x_2)'}</Tex>} value={tx(`(${fmt(p[0])}; ${fmt(p[1])})`, `(${fmt(p[0])}, ${fmt(p[1])})`)} />
          <Readout label={<Tex>{'f(x_1,x_2)'}</Tex>} value={fmt(z, 3)} />
          <Readout label={<Tex>{'\\nabla f'}</Tex>} tone="orange" value={tx(`(${fmt(gx)}; ${fmt(gy)})`, `(${fmt(gx)}, ${fmt(gy)})`)} />
          <Readout label={<Tex>{'\\|\\nabla f\\|'}</Tex>} value={fmt(gn, 3)} sub={stationary ? tx('punto stazionario', 'stationary point') : gn > 1 ? tx('pendenza ripida', 'steep slope') : gn > 0.35 ? tx('pendenza media', 'moderate slope') : tx('quasi piatto', 'almost flat')} />
        </div>
        <div className="gradx__btns">
          <Btn icon="step" onClick={step} variant="soft">
            {tx('Passo di discesa', 'Descent step')}
          </Btn>
          <Btn icon={auto ? 'pause' : 'play'} onClick={() => setAuto((a) => !a)}>
            {auto ? tx('Ferma', 'Stop') : tx('Discesa automatica', 'Automatic descent')}
          </Btn>
          <Btn icon="reset" onClick={() => choose(preset)} title={tx('Ricomincia', 'Restart')} />
        </div>
      </div>
      {stationary && (
        <p className="gradx__verdict">
          <span className="verdict verdict--info">
            <Tex>{'\\nabla f = \\mathbf{0}'}</Tex>{tx(`: qui c’è ${F.kind}`, `: here there is ${F.kind}`)}
          </span>
        </p>
      )}
      <Tasks
        items={[
          {
            label: tx(
              'Trascina il punto: la freccia arancione resta sempre perpendicolare alla curva di livello (in nero).',
              'Drag the point: the orange arrow always stays perpendicular to the level curve (in black).',
            ),
            done: done.dragged,
          },
          {
            label: tx(
              'Porta il punto dove il gradiente si annulla (un punto stazionario).',
              'Move the point to where the gradient vanishes (a stationary point).',
            ),
            done: reached.stationary,
          },
          {
            label: tx(
              'Nella “Sella” trova il punto stazionario: non è né un minimo né un massimo.',
              'In the “Saddle”, find the stationary point: it is neither a minimum nor a maximum.',
            ),
            done: reached.saddle,
          },
          {
            label: tx(
              'Premi “Passo di discesa”: il punto si sposta lungo −∇f, verso valori di f più bassi.',
              'Press “Descent step”: the point moves along −∇f, toward lower values of f.',
            ),
            done: done.descent,
          },
        ]}
      />
    </div>
  )
}

function Contours({ f, levels }: { f: (x: number, y: number) => number; levels: number[] }) {
  const { x, y } = usePlot()
  const paths = useMemo(() => levels.map((L) => segsToPath(contourSegments(f, R, R, L, 70), x, y)), [f, levels, x, y])
  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="var(--c-blue)" strokeWidth={1.1} fill="none" opacity={0.45} />
      ))}
    </g>
  )
}

function Tangent({ p, g }: { p: [number, number]; g: [number, number] }) {
  const n = Math.hypot(g[0], g[1]) || 1
  const u: [number, number] = [g[0] / n, g[1] / n]
  const t: [number, number] = [-u[1], u[0]]
  const L = 0.55
  const s = 0.13
  return (
    <>
      <Polyline
        pts={[
          { x: p[0] - t[0] * L, y: p[1] - t[1] * L },
          { x: p[0] + t[0] * L, y: p[1] + t[1] * L },
        ]}
        color="var(--ink-3)"
        width={1.2}
        dash="4 4"
      />
      <Polyline
        pts={[
          { x: p[0] + t[0] * s, y: p[1] + t[1] * s },
          { x: p[0] + t[0] * s + u[0] * s, y: p[1] + t[1] * s + u[1] * s },
          { x: p[0] + u[0] * s, y: p[1] + u[1] * s },
        ]}
        color="var(--ink-3)"
        width={1.1}
      />
    </>
  )
}
