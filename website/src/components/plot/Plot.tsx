import {
  createContext,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { tx } from '../../lib/i18n'
import { useWidth } from '../../lib/useSize'
import { clamp, fmtTick, scaleLinear, type Scale } from './scale'
import { subDigits } from './svgText'

export type Margin = { t: number; r: number; b: number; l: number }
export type Pt = { x: number; y: number }
type PointerLike = { clientX: number; clientY: number; currentTarget: EventTarget | null }

/** L'<svg> del grafico a partire dall'elemento che ha ricevuto l'evento. */
function svgOf(t: EventTarget | null): SVGSVGElement | null {
  if (t instanceof SVGSVGElement) return t
  if (t instanceof SVGElement) return t.ownerSVGElement
  return null
}

export type PlotCtx = {
  x: Scale
  y: Scale
  w: number
  h: number
  m: Margin
  iw: number
  ih: number
  clipId: string
  /** coordinate dati dal puntatore (l'evento deve provenire da un elemento del grafico) */
  toData: (e: PointerLike) => Pt
}

const Ctx = createContext<PlotCtx | null>(null)
export function usePlot() {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePlot fuori da <Plot>')
  return c
}

type PlotProps = {
  xDomain: [number, number]
  yDomain: [number, number]
  /** altezza = larghezza × aspect (limitata da minH/maxH) */
  aspect?: number
  height?: number
  minH?: number
  maxH?: number
  margin?: Partial<Margin>
  /** mantiene la stessa scala su x e y (per geometria: vettori, angoli, cerchi) */
  equal?: boolean
  className?: string
  ariaLabel?: string
  children: ReactNode | ((c: PlotCtx) => ReactNode)
  overlay?: (c: PlotCtx) => ReactNode
  onPointerMove?: (p: Pt, e: ReactPointerEvent<SVGSVGElement>) => void
  onPointerLeave?: () => void
  onPointerDown?: (p: Pt, e: ReactPointerEvent<SVGSVGElement>) => void
}

export function Plot({
  xDomain,
  yDomain,
  aspect = 0.62,
  height,
  minH = 220,
  maxH = 460,
  margin,
  equal,
  className,
  ariaLabel,
  children,
  overlay,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
}: PlotProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const w = useWidth(wrap)
  const narrow = w < 480
  const m: Margin = { t: 16, r: 18, b: narrow ? 34 : 38, l: narrow ? 38 : 46, ...margin }
  let h = height ?? clamp(Math.round(w * aspect), minH, maxH)
  let iw = Math.max(10, w - m.l - m.r)
  let ih = Math.max(10, h - m.t - m.b)
  let xd = xDomain
  let yd = yDomain
  if (equal) {
    // stessa unità su entrambi gli assi: si allarga il dominio più "stretto"
    const kx = iw / (xDomain[1] - xDomain[0])
    const ky = ih / (yDomain[1] - yDomain[0])
    if (kx > ky) {
      const span = iw / ky
      const c = (xDomain[0] + xDomain[1]) / 2
      xd = [c - span / 2, c + span / 2]
    } else {
      const span = ih / kx
      const c = (yDomain[0] + yDomain[1]) / 2
      yd = [c - span / 2, c + span / 2]
    }
  }
  iw = Math.max(10, w - m.l - m.r)
  ih = Math.max(10, h - m.t - m.b)
  h = ih + m.t + m.b
  const clipId = useId().replace(/:/g, '')

  const ctx = useMemo<PlotCtx>(() => {
    const x = scaleLinear(xd, [m.l, m.l + iw])
    const y = scaleLinear(yd, [m.t + ih, m.t])
    const toData = (e: PointerLike) => {
      const r = svgOf(e.currentTarget)?.getBoundingClientRect()
      if (!r) return { x: 0, y: 0 }
      return { x: x.invert(e.clientX - r.left), y: y.invert(e.clientY - r.top) }
    }
    return { x, y, w, h, m, iw, ih, clipId, toData }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xd[0], xd[1], yd[0], yd[1], w, h, m.l, m.t, iw, ih, clipId])

  return (
    <Ctx.Provider value={ctx}>
      <div ref={wrap} className={`plot${className ? ' ' + className : ''}`}>
        <svg
          width={w}
          height={h}
          role="img"
          aria-label={ariaLabel}
          onPointerMove={onPointerMove ? (e) => onPointerMove(ctx.toData(e), e) : undefined}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown ? (e) => onPointerDown(ctx.toData(e), e) : undefined}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={m.l} y={m.t} width={iw} height={ih} />
            </clipPath>
          </defs>
          {typeof children === 'function' ? children(ctx) : children}
        </svg>
        {overlay && <div className="plot__overlay">{overlay(ctx)}</div>}
      </div>
    </Ctx.Provider>
  )
}

type AxesProps = {
  xTicks?: number[] | number
  yTicks?: number[] | number
  xLabel?: ReactNode
  yLabel?: ReactNode
  grid?: boolean
  /** assi che passano per l'origine (per geometria) */
  origin?: boolean
  xFormat?: (v: number) => string
  yFormat?: (v: number) => string
  hideX?: boolean
  hideY?: boolean
}

export function Axes({
  xTicks = 6,
  yTicks = 5,
  xLabel,
  yLabel,
  grid = true,
  origin = false,
  xFormat = fmtTick,
  yFormat = fmtTick,
  hideX,
  hideY,
}: AxesProps) {
  const { x, y, m, iw, ih } = usePlot()
  const xt = typeof xTicks === 'number' ? x.ticks(xTicks) : xTicks
  const yt = typeof yTicks === 'number' ? y.ticks(yTicks) : yTicks
  const x0 = origin ? clamp(x(0), m.l, m.l + iw) : m.l
  const y0 = origin ? clamp(y(0), m.t, m.t + ih) : m.t + ih
  const edge = origin ? '' : ' axes__line--edge'
  return (
    <g className="axes">
      {/* pannello dell'area del grafico: invisibile nello stile classico, lastra di vetro nel glass */}
      <rect className="axes__frame" x={m.l} y={m.t} width={iw} height={ih} />
      {grid && (
        <g className="axes__grid">
          {xt.map((v) => (
            <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={m.t} y2={m.t + ih} />
          ))}
          {yt.map((v) => (
            <line key={`gy${v}`} x1={m.l} x2={m.l + iw} y1={y(v)} y2={y(v)} />
          ))}
        </g>
      )}
      {!hideX && <line className={'axes__line' + edge} x1={m.l} x2={m.l + iw} y1={y0} y2={y0} />}
      {!hideY && <line className={'axes__line' + edge} x1={x0} x2={x0} y1={m.t} y2={m.t + ih} />}
      {!hideX &&
        xt.map((v) => (
          <text key={`tx${v}`} className="axes__tick" x={x(v)} y={m.t + ih + 16} textAnchor="middle">
            {origin && v === 0 ? '' : xFormat(v)}
          </text>
        ))}
      {!hideY &&
        yt.map((v) => (
          <text key={`ty${v}`} className="axes__tick" x={m.l - 8} y={y(v) + 3.5} textAnchor="end">
            {origin && v === 0 ? '' : yFormat(v)}
          </text>
        ))}
      {xLabel && (
        <text className="axes__label" x={m.l + iw} y={m.t + ih + 32} textAnchor="end">
          {subDigits(xLabel)}
        </text>
      )}
      {/* sopra l'asse y, a destra delle etichette dei tick: non si sovrappone al tick più alto */}
      {yLabel && (
        <text className="axes__label" x={m.l} y={m.t - 6} textAnchor="start">
          {subDigits(yLabel)}
        </text>
      )}
    </g>
  )
}

type FnPathProps = {
  f: (x: number) => number
  color: string
  width?: number
  samples?: number
  dash?: string
  opacity?: number
  from?: number
  to?: number
  className?: string
}

/** Grafico di una funzione y = f(x), spezzato dove non è finito, ritagliato sull'area del grafico. */
export function FnPath({ f, color, width = 2, samples = 240, dash, opacity, from, to, className }: FnPathProps) {
  const { x, y, clipId } = usePlot()
  const a = from ?? x.domain[0]
  const b = to ?? x.domain[1]
  const lo = y.domain[0] - (y.domain[1] - y.domain[0]) * 4
  const hi = y.domain[1] + (y.domain[1] - y.domain[0]) * 4
  let d = ''
  let pen = false
  for (let i = 0; i <= samples; i++) {
    const xv = a + ((b - a) * i) / samples
    const yv = f(xv)
    if (!Number.isFinite(yv)) {
      pen = false
      continue
    }
    const yc = clamp(yv, lo, hi)
    d += `${pen ? 'L' : 'M'}${x(xv).toFixed(2)},${y(yc).toFixed(2)}`
    pen = true
  }
  return (
    <path
      className={className}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      clipPath={`url(#${clipId})`}
    />
  )
}

export function Polyline({
  pts,
  color,
  width = 2,
  dash,
  fill = 'none',
  opacity,
  clip = true,
}: {
  pts: Pt[]
  color: string
  width?: number
  dash?: string
  fill?: string
  opacity?: number
  clip?: boolean
}) {
  const { x, y, clipId } = usePlot()
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`).join('')
  return (
    <path
      d={d + (fill !== 'none' ? 'Z' : '')}
      fill={fill}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      clipPath={clip ? `url(#${clipId})` : undefined}
    />
  )
}

export function Dot({
  x: xv,
  y: yv,
  r = 4.5,
  color,
  hollow,
  className,
  title,
}: {
  x: number
  y: number
  r?: number
  color: string
  hollow?: boolean
  className?: string
  title?: string
}) {
  const { x, y } = usePlot()
  return (
    <circle
      className={`dot${className ? ' ' + className : ''}`}
      cx={x(xv)}
      cy={y(yv)}
      r={r}
      fill={hollow ? 'var(--plot-bg)' : color}
      stroke={hollow ? color : 'var(--plot-bg)'}
      strokeWidth={hollow ? 2 : 2}
    >
      {title && <title>{title}</title>}
    </circle>
  )
}

type HandleProps = {
  x: number
  y: number
  onMove: (p: Pt) => void
  axis?: 'x' | 'y' | 'both'
  label?: string
  step?: number
  color?: string
  r?: number
  /** limiti in coordinate dati */
  bounds?: { x?: [number, number]; y?: [number, number] }
  onStart?: () => void
  onEnd?: () => void
}

/** Maniglia trascinabile (mouse, touch e tastiera). Il colore d'accento = "si può muovere". */
export function Handle({ x: hx, y: hy, onMove, axis = 'both', label, step, color, r = 7, bounds, onStart, onEnd }: HandleProps) {
  const { x, y, toData } = usePlot()
  const [drag, setDrag] = useState(false)
  const off = useRef<Pt>({ x: 0, y: 0 })
  const bx = bounds?.x ?? x.domain
  const by = bounds?.y ?? y.domain
  const emit = (p: Pt) => {
    onMove({
      x: axis === 'y' ? hx : clamp(p.x, Math.min(...bx), Math.max(...bx)),
      y: axis === 'x' ? hy : clamp(p.y, Math.min(...by), Math.max(...by)),
    })
  }
  const down = (e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    const p = toData(e)
    off.current = { x: hx - p.x, y: hy - p.y }
    setDrag(true)
    onStart?.()
  }
  const move = (e: ReactPointerEvent<SVGGElement>) => {
    if (!drag) return
    const p = toData(e)
    emit({ x: p.x + off.current.x, y: p.y + off.current.y })
  }
  const up = () => {
    if (drag) onEnd?.()
    setDrag(false)
  }
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const sx = step ?? (x.domain[1] - x.domain[0]) / 60
    const sy = step ?? (y.domain[1] - y.domain[0]) / 60
    const k = e.shiftKey ? 5 : 1
    const moves: Record<string, Pt> = {
      ArrowLeft: { x: hx - sx * k, y: hy },
      ArrowRight: { x: hx + sx * k, y: hy },
      ArrowUp: { x: hx, y: hy + sy * k },
      ArrowDown: { x: hx, y: hy - sy * k },
    }
    const p = moves[e.key]
    if (p) {
      e.preventDefault()
      emit(p)
    }
  }
  return (
    <g
      className={`handle${drag ? ' is-drag' : ''}${axis !== 'both' ? ' handle--' + axis : ''}`}
      transform={`translate(${x(hx)} ${y(hy)})`}
      tabIndex={0}
      role="slider"
      aria-label={label ?? tx('maniglia trascinabile', 'draggable handle')}
      aria-valuetext={`${hx.toFixed(2)}, ${hy.toFixed(2)}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      style={color ? ({ '--h': color } as CSSProperties) : undefined}
    >
      <circle className="handle__hit" r={22} />
      <circle className="handle__halo" r={r + 8} />
      <circle className="handle__dot" r={r} />
    </g>
  )
}

/** Etichetta di testo nei grafici, in coordinate dati. */
export function Label({
  x: xv,
  y: yv,
  children,
  anchor = 'start',
  dx = 0,
  dy = 0,
  className,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  dx?: number
  dy?: number
  className?: string
}) {
  const { x, y } = usePlot()
  return (
    <text className={`plot-label${className ? ' ' + className : ''}`} x={x(xv) + dx} y={y(yv) + dy} textAnchor={anchor}>
      {subDigits(children)}
    </text>
  )
}

/** Freccia (vettore) da a → b in coordinate dati. */
export function Arrow({
  from,
  to,
  color,
  width = 2.2,
  head = 9,
  dash,
  className,
}: {
  from: Pt
  to: Pt
  color: string
  width?: number
  head?: number
  dash?: string
  className?: string
}) {
  const { x, y } = usePlot()
  const x1 = x(from.x)
  const y1 = y(from.y)
  const x2 = x(to.x)
  const y2 = y(to.y)
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1) return null
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const hl = Math.min(head, len * 0.6)
  const bx = x2 - ux * hl
  const by = y2 - uy * hl
  const px = -uy * hl * 0.45
  const py = ux * hl * 0.45
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={bx + ux * 1} y2={by + uy * 1} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <path d={`M${x2},${y2}L${bx + px},${by + py}L${bx - px},${by - py}Z`} fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />
    </g>
  )
}
