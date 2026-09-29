import { useEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from 'react'
import { useWidth } from '../../lib/useSize'
import { cssVar, useTheme } from '../../lib/theme'

/**
 * Superficie z = f(x, y) disegnata su canvas con proiezione ortografica
 * e algoritmo del pittore. Si ruota trascinando (o con le frecce).
 * Sul "pavimento" si possono disegnare curve di livello e frecce.
 */

export type V3 = [number, number, number]
export type Overlay =
  | { kind: 'point'; p: V3; color: string; r?: number; ring?: boolean }
  | { kind: 'line'; a: V3; b: V3; color: string; width?: number; dash?: number[] }
  | { kind: 'arrow'; a: V3; b: V3; color: string; width?: number }
  | { kind: 'polyline'; pts: V3[]; color: string; width?: number }

type Props = {
  f: (x: number, y: number) => number
  x: [number, number]
  y: [number, number]
  z: [number, number]
  n?: number
  /** curve di livello proiettate sul pavimento */
  levels?: number[]
  overlays?: Overlay[]
  height?: number
  aspect?: number
  /** colori della superficie: rampa per l'altezza */
  ramp?: 'blue' | 'step'
  initial?: { yaw: number; pitch: number }
  zScale?: number
  axisLabels?: [string, string, string]
  ariaLabel?: string
  /** rotazione lenta automatica finché l'utente non interagisce */
  spin?: boolean
  /** distanza del "pavimento" sotto la superficie, in frazioni dell'intervallo z */
  floorGap?: number
}

type Cam = { yaw: number; pitch: number }

/** Quota del pavimento dato l'intervallo z e lo stacco richiesto. */
export function floorOf(zr: [number, number], gap: number) {
  return zr[0] - (zr[1] - zr[0]) * gap
}

export function Surface3D({
  f,
  x: xr,
  y: yr,
  z: zr,
  n = 34,
  levels,
  overlays = [],
  height,
  aspect = 0.72,
  ramp = 'blue',
  initial = { yaw: -0.65, pitch: 0.62 },
  zScale = 0.75,
  axisLabels = ['x₁', 'x₂', 'z'],
  ariaLabel,
  spin,
  floorGap = 0,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const w = useWidth(wrap, 400)
  const h = height ?? Math.round(Math.min(420, Math.max(240, w * aspect)))
  const [cam, setCam] = useState<Cam>(initial)
  const [touched, setTouched] = useState(false)
  const drag = useRef<{ x: number; y: number; cam: Cam } | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!spin || touched) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = t - last
      last = t
      setCam((c) => ({ ...c, yaw: c.yaw + dt * 0.00012 }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spin, touched])

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(h * dpr)
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    draw(ctx, { w, h, f, xr, yr, zr, n, levels, overlays, cam, ramp, zScale, axisLabels, floorGap })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, f, xr[0], xr[1], yr[0], yr[1], zr[0], zr[1], n, levels, overlays, cam, ramp, zScale, theme, floorGap])

  const onDown = (e: RPointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, cam }
    setTouched(true)
  }
  const onMove = (e: RPointerEvent) => {
    const d = drag.current
    if (!d) return
    setCam({
      yaw: d.cam.yaw + (e.clientX - d.x) * 0.008,
      pitch: Math.min(1.5, Math.max(0.08, d.cam.pitch + (e.clientY - d.y) * 0.006)),
    })
  }
  const onUp = () => {
    drag.current = null
  }
  const onKey = (e: RKeyboardEvent) => {
    const m: Record<string, Partial<Cam>> = {
      ArrowLeft: { yaw: cam.yaw - 0.1 },
      ArrowRight: { yaw: cam.yaw + 0.1 },
      ArrowUp: { pitch: Math.min(1.5, cam.pitch + 0.08) },
      ArrowDown: { pitch: Math.max(0.08, cam.pitch - 0.08) },
    }
    if (m[e.key]) {
      e.preventDefault()
      setTouched(true)
      setCam({ ...cam, ...m[e.key] })
    }
  }

  return (
    <div ref={wrap} className="s3d">
      <canvas
        ref={canvas}
        style={{ width: w, height: h }}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      />
      <span className={`s3d__hint${touched ? ' is-hidden' : ''}`}>trascina per ruotare</span>
    </div>
  )
}

// ------------------------------------------------------------------ rendering

type DrawArgs = {
  w: number
  h: number
  f: (x: number, y: number) => number
  xr: [number, number]
  yr: [number, number]
  zr: [number, number]
  n: number
  levels?: number[]
  overlays: Overlay[]
  cam: Cam
  ramp: 'blue' | 'step'
  zScale: number
  axisLabels: [string, string, string]
  floorGap: number
}

function hexToRgb(c: string): [number, number, number] {
  const m = c.replace('#', '')
  if (m.length === 3) return [0, 1, 2].map((i) => parseInt(m[i] + m[i], 16)) as [number, number, number]
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)) as [number, number, number]
}
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

export function resolveColor(c: string) {
  const m = /^var\((--[\w-]+)\)$/.exec(c)
  return m ? cssVar(m[1]) : c
}

function draw(ctx: CanvasRenderingContext2D, a: DrawArgs) {
  const { w, h, f, xr, yr, zr, n, levels, overlays, cam, ramp, zScale, floorGap } = a
  // il pavimento può stare più in basso della superficie (come nei disegni alla lavagna)
  const zf = floorOf(zr, floorGap)
  const zAll: [number, number] = [zf, zr[1]]
  const dark = document.documentElement.dataset.theme === 'dark'
  const ink = cssVar('--ink-2')
  const muted = cssVar('--ink-4')
  const line = cssVar('--line-2')
  const floorC = cssVar('--bg-sunken')
  const blue = hexToRgb(cssVar('--c-blue'))
  const bg = hexToRgb(cssVar('--plot-bg'))
  const lowC = dark ? mix(blue, bg, 0.72) : mix(blue, [255, 255, 255], 0.82)
  const highC = dark ? mix(blue, [255, 255, 255], 0.15) : mix(blue, [0, 0, 0], 0.18)
  const orange = hexToRgb(cssVar('--c-orange'))

  const cx = (xr[0] + xr[1]) / 2
  const cy = (yr[0] + yr[1]) / 2
  const sx = (xr[1] - xr[0]) / 2
  const sy = (yr[1] - yr[0]) / 2
  const zmid = (zAll[0] + zAll[1]) / 2
  const sz = (zAll[1] - zAll[0]) / 2
  const cyaw = Math.cos(cam.yaw)
  const syaw = Math.sin(cam.yaw)
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  // scala che dipende solo dall'inclinazione: ruotando (yaw) l'oggetto non "respira"
  const vmax = zScale * cp + Math.SQRT2 * sp
  const scale = Math.min((w / (2 * Math.SQRT2)) * 0.9, (h / (2 * vmax)) * 0.86)
  const ox = w / 2
  const oy = h / 2

  const proj = (p: V3) => {
    const X = (p[0] - cx) / sx
    const Y = (p[1] - cy) / sy
    const Z = ((p[2] - zmid) / sz) * zScale
    const x1 = X * cyaw - Y * syaw
    const y1 = X * syaw + Y * cyaw
    const up = Z * cp + y1 * sp
    const depth = y1 * cp - Z * sp
    return { x: ox + x1 * scale, y: oy - up * scale, d: depth }
  }

  // pavimento
  const corners: V3[] = [
    [xr[0], yr[0], zf],
    [xr[1], yr[0], zf],
    [xr[1], yr[1], zf],
    [xr[0], yr[1], zf],
  ].map((c) => c as V3)
  ctx.beginPath()
  corners.forEach((c, i) => {
    const p = proj(c)
    if (i) ctx.lineTo(p.x, p.y)
    else ctx.moveTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.fillStyle = floorC
  ctx.fill()
  ctx.strokeStyle = line
  ctx.lineWidth = 1
  ctx.stroke()

  // campionamento
  const gx = (i: number) => xr[0] + ((xr[1] - xr[0]) * i) / n
  const gy = (j: number) => yr[0] + ((yr[1] - yr[0]) * j) / n
  const Z: number[][] = []
  for (let i = 0; i <= n; i++) {
    Z.push([])
    for (let j = 0; j <= n; j++) Z[i].push(f(gx(i), gy(j)))
  }

  // curve di livello sul pavimento (marching squares)
  if (levels?.length) {
    ctx.lineWidth = 1.2
    for (const L of levels) {
      ctx.strokeStyle = dark ? 'rgba(140,180,240,0.55)' : 'rgba(42,120,214,0.55)'
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const segs = marchCell(gx(i), gx(i + 1), gy(j), gy(j + 1), Z[i][j], Z[i + 1][j], Z[i + 1][j + 1], Z[i][j + 1], L)
          for (const [p, q] of segs) {
            const A = proj([p[0], p[1], zf])
            const B = proj([q[0], q[1], zf])
            ctx.moveTo(A.x, A.y)
            ctx.lineTo(B.x, B.y)
          }
        }
      }
      ctx.stroke()
    }
  }

  // overlay "sotto" (sul pavimento): disegnati prima della superficie
  const floorOverlays = overlays.filter((o) => isFloor(o, zf))
  const topOverlays = overlays.filter((o) => !isFloor(o, zf))
  drawOverlays(ctx, floorOverlays, proj)

  // quadrilateri della superficie, dal più lontano al più vicino
  type Quad = { pts: { x: number; y: number }[]; d: number; t: number; shade: number }
  const quads: Quad[] = []
  const light = normalize([-0.4, -0.5, 0.9])
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v: V3[] = [
        [gx(i), gy(j), Z[i][j]],
        [gx(i + 1), gy(j), Z[i + 1][j]],
        [gx(i + 1), gy(j + 1), Z[i + 1][j + 1]],
        [gx(i), gy(j + 1), Z[i][j + 1]],
      ]
      const P = v.map(proj)
      const d = (P[0].d + P[1].d + P[2].d + P[3].d) / 4
      const zAvg = (v[0][2] + v[1][2] + v[2][2] + v[3][2]) / 4
      const t = Math.min(1, Math.max(0, (zAvg - zr[0]) / (zr[1] - zr[0])))
      // normale in coordinate normalizzate
      const ux = [(v[1][0] - v[0][0]) / sx, 0, ((v[1][2] - v[0][2]) / sz) * zScale]
      const uy = [0, (v[3][1] - v[0][1]) / sy, ((v[3][2] - v[0][2]) / sz) * zScale]
      const nn = normalize(cross(ux, uy))
      const shade = Math.abs(nn[0] * light[0] + nn[1] * light[1] + nn[2] * light[2])
      quads.push({ pts: P, d, t, shade })
    }
  }
  quads.sort((a, b) => b.d - a.d)
  for (const q of quads) {
    let c: number[]
    if (ramp === 'step') {
      c = q.t > 0.5 ? mix(orange, [255, 255, 255], dark ? 0.2 : 0.35) : mix(lowC, bg, 0.2)
    } else {
      c = mix(lowC, highC, q.t)
    }
    const k = 0.72 + 0.28 * q.shade
    const col = `rgb(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)})`
    ctx.beginPath()
    ctx.moveTo(q.pts[0].x, q.pts[0].y)
    for (let s = 1; s < 4; s++) ctx.lineTo(q.pts[s].x, q.pts[s].y)
    ctx.closePath()
    ctx.fillStyle = col
    ctx.fill()
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
    ctx.lineWidth = 0.6
    ctx.stroke()
  }

  drawOverlays(ctx, topOverlays, proj)

  // assi: etichette sui bordi del pavimento rivolti verso chi guarda
  ctx.font = 'italic 14px "Newsreader Variable", Georgia, serif'
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  const pick = (c: V3[]) => c.map(proj).reduce((best, p) => (p.d < best.d ? p : best))
  const lx = pick([
    [cx, yr[0] - sy * 0.16, zf],
    [cx, yr[1] + sy * 0.16, zf],
  ])
  const ly = pick([
    [xr[0] - sx * 0.16, cy, zf],
    [xr[1] + sx * 0.16, cy, zf],
  ])
  ctx.fillText(a.axisLabels[0], lx.x, lx.y + 5)
  ctx.fillText(a.axisLabels[1], ly.x, ly.y + 5)
  // asse z nell'angolo più lontano, così non attraversa la superficie
  const far = (
    [
      [xr[0], yr[0]],
      [xr[1], yr[0]],
      [xr[1], yr[1]],
      [xr[0], yr[1]],
    ] as [number, number][]
  ).reduce((best, c) => (proj([c[0], c[1], zf]).d > proj([best[0], best[1], zf]).d ? c : best))
  const bot = proj([far[0], far[1], zf])
  const top = proj([far[0], far[1], zr[1]])
  ctx.strokeStyle = muted
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(bot.x, bot.y)
  ctx.lineTo(top.x, top.y)
  ctx.stroke()
  ctx.fillText(a.axisLabels[2], top.x, top.y - 8)
}

function isFloor(o: Overlay, zf: number) {
  if (o.kind === 'point') return o.p[2] === zf
  if (o.kind === 'polyline') return o.pts.every((p) => p[2] === zf)
  return o.a[2] === zf && o.b[2] === zf
}

function drawOverlays(ctx: CanvasRenderingContext2D, list: Overlay[], proj: (p: V3) => { x: number; y: number }) {
  const bg = cssVar('--plot-bg')
  for (const o of list) {
    const color = resolveColor(o.color)
    if (o.kind === 'point') {
      const p = proj(o.p)
      ctx.beginPath()
      ctx.arc(p.x, p.y, o.r ?? 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      if (o.ring !== false) {
        ctx.lineWidth = 2.5
        ctx.strokeStyle = bg
        ctx.stroke()
      }
    } else if (o.kind === 'line' || o.kind === 'arrow') {
      const A = proj(o.a)
      const B = proj(o.b)
      ctx.beginPath()
      ctx.setLineDash(o.kind === 'line' ? (o.dash ?? []) : [])
      ctx.moveTo(A.x, A.y)
      ctx.lineTo(B.x, B.y)
      ctx.strokeStyle = color
      ctx.lineWidth = o.width ?? 2
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.setLineDash([])
      if (o.kind === 'arrow') {
        const len = Math.hypot(B.x - A.x, B.y - A.y)
        if (len > 2) {
          const ux = (B.x - A.x) / len
          const uy = (B.y - A.y) / len
          const hl = Math.min(10, len * 0.5)
          ctx.beginPath()
          ctx.moveTo(B.x + ux * 2, B.y + uy * 2)
          ctx.lineTo(B.x - ux * hl - uy * hl * 0.5, B.y - uy * hl + ux * hl * 0.5)
          ctx.lineTo(B.x - ux * hl + uy * hl * 0.5, B.y - uy * hl - ux * hl * 0.5)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.fill()
        }
      }
    } else if (o.kind === 'polyline') {
      ctx.beginPath()
      o.pts.forEach((pt, i) => {
        const p = proj(pt)
        if (i) ctx.lineTo(p.x, p.y)
        else ctx.moveTo(p.x, p.y)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = o.width ?? 2
      ctx.lineJoin = 'round'
      ctx.stroke()
    }
  }
}

function cross(a: number[], b: number[]) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}
function normalize(v: number[]) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Marching squares su una cella: restituisce i segmenti della curva di livello L. */
export function marchCell(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  a: number,
  b: number,
  c: number,
  d: number,
  L: number,
): [[number, number], [number, number]][] {
  // vertici: a=(x0,y0) b=(x1,y0) c=(x1,y1) d=(x0,y1)
  const idx = (a > L ? 1 : 0) | (b > L ? 2 : 0) | (c > L ? 4 : 0) | (d > L ? 8 : 0)
  if (idx === 0 || idx === 15) return []
  const t = (p: number, q: number) => (L - p) / (q - p || 1e-12)
  const e0: [number, number] = [x0 + (x1 - x0) * t(a, b), y0] // a-b
  const e1: [number, number] = [x1, y0 + (y1 - y0) * t(b, c)] // b-c
  const e2: [number, number] = [x0 + (x1 - x0) * t(d, c), y1] // d-c
  const e3: [number, number] = [x0, y0 + (y1 - y0) * t(a, d)] // a-d
  const table: Record<number, [[number, number], [number, number]][]> = {
    1: [[e3, e0]],
    2: [[e0, e1]],
    3: [[e3, e1]],
    4: [[e1, e2]],
    5: [
      [e3, e0],
      [e1, e2],
    ],
    6: [[e0, e2]],
    7: [[e3, e2]],
    8: [[e2, e3]],
    9: [[e0, e2]],
    10: [
      [e0, e1],
      [e2, e3],
    ],
    11: [[e1, e2]],
    12: [[e1, e3]],
    13: [[e0, e1]],
    14: [[e0, e3]],
  }
  return table[idx] ?? []
}
