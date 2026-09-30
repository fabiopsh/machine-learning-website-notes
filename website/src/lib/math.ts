/** Utilità numeriche per le figure (niente dipendenze esterne). */

/** Generatore pseudo-casuale riproducibile (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Campione gaussiano standard (Box-Muller) dato un generatore uniforme. */
export function gauss(rand: () => number) {
  let u = 0
  while (u === 0) u = rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Minimi quadrati generici: w = argmin ‖A w − b‖² con la QR di Householder
 * (stabile anche con colonne quasi dipendenti). A ha l righe e n ≤ l colonne.
 */
export function lstsq(A0: number[][], b0: number[]): number[] {
  const A = A0.map((r) => r.slice())
  const b = b0.slice()
  const l = A.length
  const n = A[0]?.length ?? 0
  for (let k = 0; k < n; k++) {
    let norm = 0
    for (let i = k; i < l; i++) norm += A[i][k] * A[i][k]
    norm = Math.sqrt(norm)
    if (norm < 1e-14) continue
    const alpha = A[k][k] > 0 ? -norm : norm
    const v = new Array(l).fill(0)
    v[k] = A[k][k] - alpha
    for (let i = k + 1; i < l; i++) v[i] = A[i][k]
    let vv = 0
    for (let i = k; i < l; i++) vv += v[i] * v[i]
    if (vv < 1e-30) continue
    for (let j = k; j < n; j++) {
      let s = 0
      for (let i = k; i < l; i++) s += v[i] * A[i][j]
      const f = (2 * s) / vv
      for (let i = k; i < l; i++) A[i][j] -= f * v[i]
    }
    let s = 0
    for (let i = k; i < l; i++) s += v[i] * b[i]
    const f = (2 * s) / vv
    for (let i = k; i < l; i++) b[i] -= f * v[i]
  }
  const w = new Array(n).fill(0)
  for (let k = n - 1; k >= 0; k--) {
    let s = b[k]
    for (let j = k + 1; j < n; j++) s -= A[k][j] * w[j]
    w[k] = Math.abs(A[k][k]) < 1e-14 ? 0 : s / A[k][k]
  }
  return w
}

/**
 * Minimi quadrati per un polinomio di grado M: w = argmin Σ (y_p − Σ_j w_j x_p^j)².
 * QR sulla matrice di Vandermonde. Se M+1 > l il sistema è sottodeterminato: si limita il grado a l−1.
 */
export function polyfit(xs: number[], ys: number[], M: number): number[] {
  const n = Math.min(M + 1, xs.length)
  const w = lstsq(
    xs.map((x) => Array.from({ length: n }, (_, j) => x ** j)),
    ys,
  )
  while (w.length < M + 1) w.push(0)
  return w
}

/**
 * Ridge regression (Tikhonov) per un polinomio di grado M:
 * w = argmin Σ (y_p − h_w(x_p))² + λ‖w‖², cioè w = (XᵀX + λI)⁻¹Xᵀy.
 * Si risolve come minimi quadrati sulla matrice aumentata [X; √λ I], [y; 0].
 */
export function ridgePolyfit(xs: number[], ys: number[], M: number, lambda: number): number[] {
  const n = M + 1
  const A = xs.map((x) => Array.from({ length: n }, (_, j) => x ** j))
  const b = ys.slice()
  const s = Math.sqrt(Math.max(0, lambda))
  for (let j = 0; j < n; j++) {
    A.push(Array.from({ length: n }, (_, i) => (i === j ? s : 0)))
    b.push(0)
  }
  return lstsq(A, b)
}

export function polyval(w: number[], x: number) {
  let y = 0
  for (let j = w.length - 1; j >= 0; j--) y = y * x + w[j]
  return y
}

/** Somma degli errori quadratici E(w) = Σ (y_p − h(x_p))². */
export function sse(w: number[], xs: number[], ys: number[]) {
  let s = 0
  for (let i = 0; i < xs.length; i++) s += (ys[i] - polyval(w, xs[i])) ** 2
  return s
}

/** Funzione di ripartizione della normale standard (erf di Abramowitz–Stegun, errore < 1.5e-7). */
export function normCdf(z: number) {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

export function normPdf(x: number, mu = 0, sigma = 1) {
  return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI))
}

export const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
