import { useSyncExternalStore } from 'react'
import { gauss, polyfit, polyval, rng } from '../../lib/math'

/**
 * Stato condiviso dalle figure del fitting polinomiale (4.1–4.4):
 * cambiare il grado M o rigenerare il rumore in una figura aggiorna tutte le altre.
 */

export const target = (x: number) => Math.sin(2 * Math.PI * x)
export const NOISE = 0.3

// i 10 campioni della figura originale (Bishop), letti dal grafico
const ORIGINAL_T = [0.35, 0.82, 1.0, 0.97, 0.12, 0.16, -0.85, -0.45, -0.57, 0.26]

type State = { M: number; l: number; seed: number }
let state: State = { M: 3, l: 10, seed: 0 }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((f) => f())

export function setM(M: number) {
  state = { ...state, M }
  emit()
}
export function setL(l: number) {
  state = { ...state, l }
  emit()
}
export function reseed() {
  state = { ...state, seed: state.seed + 1 }
  emit()
}
export function resetOriginal() {
  state = { ...state, seed: 0 }
  emit()
}

export function usePoly() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}

type Data = { xs: number[]; ts: number[] }
const cache = new Map<string, Data>()

/** Training set di l punti. Con seed 0 e l = 10 sono i punti della figura originale. */
export function trainingSet(l: number, seed: number): Data {
  const key = `tr${l}:${seed}`
  let d = cache.get(key)
  if (!d) {
    const r = rng(1000 + seed * 97 + l)
    const xs = l === 10 ? Array.from({ length: 10 }, (_, i) => i / 9) : Array.from({ length: l }, (_, i) => (l <= 15 ? i / (l - 1) : r()))
    const ts = xs.map((x, i) => (seed === 0 && l === 10 ? ORIGINAL_T[i] : target(x) + NOISE * gauss(r)))
    d = { xs, ts }
    cache.set(key, d)
  }
  return d
}

/** Test set grande e indipendente, dalla stessa distribuzione. */
export function testSet(seed: number): Data {
  const key = `ts:${seed}`
  let d = cache.get(key)
  if (!d) {
    const r = rng(77 + seed * 31)
    const xs = Array.from({ length: 200 }, () => r())
    const ts = xs.map((x) => target(x) + NOISE * gauss(r))
    d = { xs, ts }
    cache.set(key, d)
  }
  return d
}

export function fit(l: number, seed: number, M: number) {
  const d = trainingSet(l, seed)
  return polyfit(d.xs, d.ts, M)
}

/** Errore RMS: radice della media degli errori quadratici (stessa scala del target). */
export function rms(w: number[], d: Data) {
  let s = 0
  for (let i = 0; i < d.xs.length; i++) s += (d.ts[i] - polyval(w, d.xs[i])) ** 2
  return Math.sqrt(s / d.xs.length)
}
