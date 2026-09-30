/**
 * SVM risolta davvero nel browser: SMO con la coppia di massima violazione (come libsvm) sul duale
 *   min ½ αᵀQα + pᵀα   con 0 ≤ α ≤ C e yᵀα = 0,   Q_ij = y_i y_j K_ij.
 * Classificazione: p = −1. Regressione (ε-SVR): 2N variabili α, α′ con y = ±1 e p = ε ∓ d.
 * Adatta a pochi punti (qualche decina), come nelle figure.
 */

export type Vec = number[]
export type Kernel = (a: Vec, b: Vec) => number

export const linearK: Kernel = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0)
export const polyK =
  (p: number): Kernel =>
  (a, b) =>
    (linearK(a, b) + 1) ** p
export const rbfK =
  (sigma: number): Kernel =>
  (a, b) =>
    Math.exp(-a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / (2 * sigma * sigma))

function smo(K: number[][], y: number[], p: number[], C: number, tol = 1e-4, maxIter = 40000) {
  const n = y.length
  const a = new Array(n).fill(0)
  const G = [...p]
  const Q = (i: number, j: number) => y[i] * y[j] * K[i][j]
  for (let it = 0; it < maxIter; it++) {
    let i = -1
    let j = -1
    let gmax = -Infinity
    let gmin = Infinity
    for (let t = 0; t < n; t++) {
      const up = (y[t] === 1 && a[t] < C) || (y[t] === -1 && a[t] > 0)
      const low = (y[t] === 1 && a[t] > 0) || (y[t] === -1 && a[t] < C)
      const v = -y[t] * G[t]
      if (up && v > gmax) {
        gmax = v
        i = t
      }
      if (low && v < gmin) {
        gmin = v
        j = t
      }
    }
    if (i < 0 || j < 0 || gmax - gmin < tol) break
    const ai = a[i]
    const aj = a[j]
    if (y[i] !== y[j]) {
      let quad = Q(i, i) + Q(j, j) + 2 * Q(i, j)
      if (quad <= 0) quad = 1e-12
      const delta = (-G[i] - G[j]) / quad
      const diff = a[i] - a[j]
      a[i] += delta
      a[j] += delta
      if (diff > 0) {
        if (a[j] < 0) {
          a[j] = 0
          a[i] = diff
        }
      } else if (a[i] < 0) {
        a[i] = 0
        a[j] = -diff
      }
      if (diff > 0) {
        if (a[i] > C) {
          a[i] = C
          a[j] = C - diff
        }
      } else if (a[j] > C) {
        a[j] = C
        a[i] = C + diff
      }
    } else {
      let quad = Q(i, i) + Q(j, j) - 2 * Q(i, j)
      if (quad <= 0) quad = 1e-12
      const delta = (G[i] - G[j]) / quad
      const sum = a[i] + a[j]
      a[i] -= delta
      a[j] += delta
      if (sum > C) {
        if (a[i] > C) {
          a[i] = C
          a[j] = sum - C
        }
      } else if (a[j] < 0) {
        a[j] = 0
        a[i] = sum
      }
      if (sum > C) {
        if (a[j] > C) {
          a[j] = C
          a[i] = sum - C
        }
      } else if (a[i] < 0) {
        a[i] = 0
        a[j] = sum
      }
    }
    const di = a[i] - ai
    const dj = a[j] - aj
    for (let t = 0; t < n; t++) G[t] += Q(t, i) * di + Q(t, j) * dj
  }
  // ρ: media di y·G sui vettori liberi, altrimenti punto medio dei limiti
  let sum = 0
  let nf = 0
  let ub = Infinity
  let lb = -Infinity
  for (let t = 0; t < n; t++) {
    const yG = y[t] * G[t]
    if (a[t] > 1e-9 && a[t] < C - 1e-9) {
      sum += yG
      nf++
    } else if ((a[t] <= 1e-9 && y[t] === -1) || (a[t] >= C - 1e-9 && y[t] === 1)) ub = Math.min(ub, yG)
    else lb = Math.max(lb, yG)
  }
  const rho = nf > 0 ? sum / nf : (ub + lb) / 2
  return { a, rho }
}

export type Svc = { X: Vec[]; d: number[]; alpha: number[]; b: number; k: Kernel; C: number }

/** Classificatore: α_i ≥ 0, g(x) = Σ α_i d_i k(x_i, x) + b. */
export function trainSvc(X: Vec[], d: number[], C: number, k: Kernel = linearK): Svc {
  const K = X.map((a) => X.map((b) => k(a, b)))
  const { a, rho } = smo(
    K,
    d,
    d.map(() => -1),
    C,
  )
  return { X, d, alpha: a, b: -rho, k, C }
}

export const g = (m: Svc, x: Vec) => m.X.reduce((s, xi, i) => (m.alpha[i] > 1e-9 ? s + m.alpha[i] * m.d[i] * m.k(xi, x) : s), m.b)

/** Pesi espliciti (solo kernel lineare): w = Σ α_i d_i x_i. */
export const weights = (m: Svc) => m.X[0].map((_, c) => m.X.reduce((s, xi, i) => s + m.alpha[i] * m.d[i] * xi[c], 0))

export const isSv = (m: Svc, i: number) => m.alpha[i] > 1e-6

export type Svr = { X: Vec[]; gamma: number[]; b: number; k: Kernel }

/** ε-SVR: h(x) = Σ γ_i k(x_i, x) + b con γ_i = α_i − α′_i. */
export function trainSvr(X: Vec[], dv: number[], C: number, eps: number, k: Kernel): Svr {
  const n = X.length
  const K1 = X.map((a) => X.map((b) => k(a, b)))
  const K = Array.from({ length: 2 * n }, (_, i) => Array.from({ length: 2 * n }, (_, j) => K1[i % n][j % n]))
  const y = Array.from({ length: 2 * n }, (_, i) => (i < n ? 1 : -1))
  const p = Array.from({ length: 2 * n }, (_, i) => (i < n ? eps - dv[i] : eps + dv[i - n]))
  const { a, rho } = smo(K, y, p, C)
  return { X, gamma: X.map((_, i) => a[i] - a[i + n]), b: -rho, k }
}

export const svrAt = (m: Svr, x: Vec) => m.X.reduce((s, xi, i) => (Math.abs(m.gamma[i]) > 1e-9 ? s + m.gamma[i] * m.k(xi, x) : s), m.b)
