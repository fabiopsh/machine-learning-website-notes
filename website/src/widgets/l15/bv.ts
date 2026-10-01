import { useSyncExternalStore } from 'react'
import { gauss, lstsq, polyfit, rng } from '../../lib/math'

/* ------------------------------------------------------------------ esempio «20 punti e 50 fit» (15.1, 15.2, 15.4) */

/** funzione vera dell'esempio: y = x + 2 sin(1,5 x) */
export const trueF = (x: number) => x + 2 * Math.sin(1.5 * x)
/** rumore N(0; 0,2): 0,2 è la varianza */
export const NOISE_VAR = 0.2
export const NPTS = 20
export const NFITS = 50
export const XMAX = 10

export type LineSet = { xs: number[]; ys: number[]; w: [number, number] }

const lineCache = new Map<number, LineSet>()

/** Un dataset di 20 punti (x uniforme in [0, 10]) e la retta ai minimi quadrati. */
export function lineSet(seed: number): LineSet {
  let d = lineCache.get(seed)
  if (!d) {
    const r = rng(1500 + seed * 7919)
    const xs = Array.from({ length: NPTS }, () => r() * XMAX)
    const ys = xs.map((x) => trueF(x) + Math.sqrt(NOISE_VAR) * gauss(r))
    const w = polyfit(xs, ys, 1)
    d = { xs, ys, w: [w[0], w[1]] }
    lineCache.set(seed, d)
  }
  return d
}

/** i 50 dataset della figura (il primo è quello della 15.1) */
export const FITS: LineSet[] = Array.from({ length: NFITS }, (_, i) => lineSet(i))
/** predizione media: la media di rette è la retta con i coefficienti medi */
export const MEAN_W: [number, number] = [
  FITS.reduce((s, d) => s + d.w[0], 0) / NFITS,
  FITS.reduce((s, d) => s + d.w[1], 0) / NFITS,
]
export const lineAt = (w: [number, number], x: number) => w[0] + w[1] * x

/** bias² e varianza nel punto x, stimati sui 50 fit */
export function biasVarAt(x: number) {
  const hbar = lineAt(MEAN_W, x)
  let v = 0
  for (const d of FITS) v += (lineAt(d.w, x) - hbar) ** 2
  return { hbar, bias2: (hbar - trueF(x)) ** 2, variance: v / NFITS }
}

/* ------------------------------------------------------------------ esempio di Bishop: sinusoide e λ (15.6, 15.7) */

export const sine = (x: number) => Math.sin(2 * Math.PI * x)
const SINE_NOISE = 0.3
export const NSETS = 25
const NPER = 25
const NBASIS = 24
const WIDTH = 0.1
/** griglia su cui si disegnano e si confrontano le curve */
export const GRID = Array.from({ length: 101 }, (_, i) => i / 100)

/** funzioni di base: una costante (intercetta) più 24 gaussiane equispaziate in [0, 1] */
const phi = (x: number) => [1, ...Array.from({ length: NBASIS }, (_, j) => Math.exp(-((x - j / (NBASIS - 1)) ** 2) / (2 * WIDTH * WIDTH)))]

const SETS = (() => {
  const r = rng(2525)
  return Array.from({ length: NSETS }, () => {
    const xs = Array.from({ length: NPER }, () => r())
    return { Phi: xs.map(phi), ts: xs.map((x) => sine(x) + SINE_NOISE * gauss(r)) }
  })
})()
const TEST = (() => {
  const r = rng(4242)
  const xs = Array.from({ length: 400 }, () => r())
  return { Phi: xs.map(phi), ts: xs.map((x) => sine(x) + SINE_NOISE * gauss(r)) }
})()
const GRID_PHI = GRID.map(phi)
const dot = (a: number[], b: number[]) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export type LambdaFit = {
  /** le 25 curve sulla griglia */
  curves: number[][]
  /** la loro media */
  mean: number[]
  bias2: number
  variance: number
  test: number
}

const lamCache = new Map<number, LambdaFit>()

/**
 * Le 25 ipotesi per un dato ln λ: minimi quadrati con penalità λ‖w‖² (intercetta esclusa),
 * risolti sulla matrice aumentata [Φ; √λ I].
 */
export function lambdaFit(lnLambda: number): LambdaFit {
  const key = Math.round(lnLambda * 100)
  let out = lamCache.get(key)
  if (out) return out
  const s = Math.sqrt(Math.exp(key / 100))
  const n = NBASIS + 1
  const pen = Array.from({ length: NBASIS }, (_, j) => Array.from({ length: n }, (_, i) => (i === j + 1 ? s : 0)))
  const zeros = new Array(NBASIS).fill(0)
  let test = 0
  const curves = SETS.map((d) => {
    const w = lstsq([...d.Phi, ...pen], [...d.ts, ...zeros])
    test += TEST.Phi.reduce((a, row, i) => a + (TEST.ts[i] - dot(row, w)) ** 2, 0) / TEST.ts.length
    return GRID_PHI.map((row) => dot(row, w))
  })
  const mean = GRID.map((_, i) => curves.reduce((a, c) => a + c[i], 0) / NSETS)
  let bias2 = 0
  let variance = 0
  GRID.forEach((x, i) => {
    bias2 += (mean[i] - sine(x)) ** 2
    for (const c of curves) variance += (c[i] - mean[i]) ** 2 / NSETS
  })
  out = { curves, mean, bias2: bias2 / GRID.length, variance: variance / GRID.length, test: test / NSETS }
  lamCache.set(key, out)
  return out
}

export const LN_MIN = -3
export const LN_MAX = 2.6
/** i tre valori della figura degli appunti */
export const LN_NOTES = [2.6, -0.31, -2.4]

/** ln λ condiviso tra la 15.6 e la 15.7 */
let lnLam = 2.6
const listeners = new Set<() => void>()
export function setLnLambda(v: number) {
  lnLam = Math.round(Math.max(LN_MIN, Math.min(LN_MAX, v)) * 100) / 100
  listeners.forEach((f) => f())
}
export function useLnLambda() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => lnLam,
    () => lnLam,
  )
}
