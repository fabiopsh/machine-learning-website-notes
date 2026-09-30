import { gauss, polyfit, polyval, rng } from '../../lib/math'

/**
 * Dati comuni alle figure della lezione 10: l = 24 punti da sin(2πx) più rumore (come nella lezione 4),
 * già in ordine casuale, così il fold di un punto è semplicemente i mod K. L'iperparametro θ è il grado M
 * del polinomio.
 */

export type Pt = { x: number; t: number }

export const L = 24
export const THETAS = [1, 3, 5, 7]

export const DATA: Pt[] = (() => {
  const r = rng(1011)
  const xs = Array.from({ length: L }, (_, i) => (i + 0.15 + 0.7 * r()) / L)
  const perm = xs.map((_, i) => i).sort(() => r() - 0.5)
  return perm.map((i) => ({ x: xs[i], t: Math.sin(2 * Math.PI * xs[i]) + 0.3 * gauss(r) }))
})()

export const fit = (P: Pt[], M: number) =>
  polyfit(
    P.map((p) => p.x),
    P.map((p) => p.t),
    M,
  )

/** R_emp(h, D): errore quadratico medio del polinomio w sui punti P. */
export const remp = (w: number[], P: Pt[]) => P.reduce((s, p) => s + (p.t - polyval(w, p.x)) ** 2, 0) / P.length

/** Indici divisi in K fold (round-robin sull'ordine dato). */
export const foldsOf = (idx: number[], K: number) => Array.from({ length: K }, (_, k) => idx.filter((_, j) => j % K === k))

export const pick = (idx: number[]) => idx.map((i) => DATA[i])

/** K-fold CV sugli indici idx: errore di validazione di ogni fold per il grado M. */
export function cvErrors(idx: number[], K: number, M: number) {
  const F = foldsOf(idx, K)
  return F.map((vl) => {
    const tr = idx.filter((i) => !vl.includes(i))
    return remp(fit(pick(tr), M), pick(vl))
  })
}

export const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
export const std = (v: number[]) => {
  const m = avg(v)
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)
}
export const argmin = (v: number[]) => v.indexOf(Math.min(...v))

export const ALL = DATA.map((_, i) => i)

/** Rimescolamento deterministico (Fisher-Yates). */
export function shuffled(idx: number[], seed: number) {
  const r = rng(seed)
  const a = [...idx]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
