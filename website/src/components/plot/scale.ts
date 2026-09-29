export type Scale = ((v: number) => number) & {
  invert: (p: number) => number
  domain: [number, number]
  range: [number, number]
  ticks: (n?: number) => number[]
}

export function scaleLinear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const k = (r1 - r0) / (d1 - d0 || 1)
  const s = ((v: number) => r0 + (v - d0) * k) as Scale
  s.invert = (p: number) => d0 + (p - r0) / k
  s.domain = domain
  s.range = range
  s.ticks = (n = 5) => niceTicks(Math.min(d0, d1), Math.max(d0, d1), n)
  return s
}

export function niceStep(span: number, n: number) {
  const raw = span / Math.max(1, n)
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1
  return step * mag
}

export function niceTicks(a: number, b: number, n = 5): number[] {
  if (!(b > a)) return [a]
  const step = niceStep(b - a, n)
  const start = Math.ceil(a / step - 1e-9) * step
  const out: number[] = []
  for (let v = start; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toFixed(10))
  return out
}

/** Formattazione italiana (virgola decimale) con cifre significative contenute. */
export function fmt(v: number, digits = 2) {
  if (!Number.isFinite(v)) return '—'
  const s = Math.abs(v) >= 1e5 ? v.toExponential(2) : v.toFixed(digits)
  return s.replace('-', '−').replace('.', ',')
}

export function fmtTick(v: number) {
  const s = Number.isInteger(v) ? String(v) : String(+v.toPrecision(6))
  return s.replace('-', '−').replace('.', ',')
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
