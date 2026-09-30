import { useSyncExternalStore } from 'react'
import { gauss, rng } from '../../lib/math'

/**
 * Il problema di esempio della lezione (Hastie-Tibshirani-Friedman): 200 punti nel piano, 100 per classe.
 * Due modi di generarli, i due scenari degli appunti:
 *   - 'gauss' (scenario 1): una gaussiana per classe, componenti scorrelate, stessa varianza, medie diverse;
 *   - 'mix'   (scenario 2): ogni classe è una miscela di 10 gaussiane strette.
 * Conoscendo la densità generatrice si calcola anche il classificatore ottimo di Bayes.
 * Stato condiviso dalle figure 5.1, 5.11, 5.17, 5.19–5.21: scenario e k.
 */

export type Pt = { x: number; y: number; c: 0 | 1 }
export type Scenario = 'mix' | 'gauss'

export const X: [number, number] = [-3, 3.8]
export const Y: [number, number] = [-2.6, 3.4]
export const L = 200
const N_TEST = 4000
const MIX_VAR = 1 / 5
const GAUSS_SD = 1.15

/** centri delle 10 gaussiane di ogni classe (classe 1 attorno a (1, 0), classe 0 attorno a (0, 1)) */
const centers = (() => {
  const r = rng(37007)
  const mk = (mx: number, my: number) => Array.from({ length: 10 }, () => ({ x: mx + gauss(r), y: my + gauss(r) }))
  return { 1: mk(1, 0), 0: mk(0, 1) } as Record<0 | 1, { x: number; y: number }[]>
})()
/** i centri veri delle miscele (scenario 2), mostrati nella figura 5.1 */
export const mixCenters = centers
const MEAN: Record<0 | 1, { x: number; y: number }> = { 1: { x: 1, y: 0 }, 0: { x: 0, y: 1 } }

function sample(sc: Scenario, c: 0 | 1, r: () => number): Pt {
  if (sc === 'mix') {
    const m = centers[c][Math.floor(r() * 10)]
    const s = Math.sqrt(MIX_VAR)
    return { x: m.x + s * gauss(r), y: m.y + s * gauss(r), c }
  }
  return { x: MEAN[c].x + GAUSS_SD * gauss(r), y: MEAN[c].y + GAUSS_SD * gauss(r), c }
}

function makeSet(sc: Scenario, n: number, seed: number): Pt[] {
  const r = rng(seed)
  const out: Pt[] = []
  for (let i = 0; i < n; i++) out.push(sample(sc, i < n / 2 ? 1 : 0, r))
  return out
}

/** densità della classe c nel punto (a meno di costanti comuni alle due classi) */
function density(sc: Scenario, c: 0 | 1, x: number, y: number) {
  if (sc === 'mix') {
    let s = 0
    for (const m of centers[c]) s += Math.exp(-((x - m.x) ** 2 + (y - m.y) ** 2) / (2 * MIX_VAR))
    return s / 10
  }
  const m = MEAN[c]
  return Math.exp(-((x - m.x) ** 2 + (y - m.y) ** 2) / (2 * GAUSS_SD * GAUSS_SD))
}

/** P(classe 1 | x) con classi equiprobabili: il classificatore di Bayes risponde 1 se supera 0,5 */
export function bayesP1(sc: Scenario, x: number, y: number) {
  const a = density(sc, 1, x, y)
  const b = density(sc, 0, x, y)
  return a + b > 0 ? a / (a + b) : 0.5
}

/* ------------------------------------------------------------------ K-NN precalcolato */

/**
 * Per ogni punto di interrogazione si ordinano i 200 punti di training per distanza e si salvano
 * le somme cumulate delle etichette: così avg_k(x) = cum[k] / k per qualsiasi k, senza ricalcolare.
 */
function knnTable(train: Pt[], qs: { x: number; y: number }[]) {
  const n = train.length
  const cum = new Uint16Array(qs.length * (n + 1))
  const d = new Float64Array(n)
  const idx = Array.from({ length: n }, (_, i) => i)
  qs.forEach((q, j) => {
    for (let i = 0; i < n; i++) d[i] = (train[i].x - q.x) ** 2 + (train[i].y - q.y) ** 2
    idx.sort((a, b) => d[a] - d[b])
    let s = 0
    const o = j * (n + 1)
    cum[o] = 0
    for (let i = 0; i < n; i++) {
      s += train[idx[i]].c
      cum[o + i + 1] = s
    }
  })
  return cum
}

export const GX = 70
export const GY = 56
export const gridX = (i: number) => X[0] + ((X[1] - X[0]) * i) / (GX - 1)
export const gridY = (j: number) => Y[0] + ((Y[1] - Y[0]) * j) / (GY - 1)

type Model = {
  train: Pt[]
  test: Pt[]
  /** somme cumulate per la griglia (GX × GY punti) */
  grid: Uint16Array
  /** errore di training e di test del K-NN per k = 1…L (indice k) */
  errTrain: number[]
  errTest: number[]
  /** modello lineare: regressione sui target 0/1, confine wᵀx = 0,5 */
  lin: { w0: number; w1: number; w2: number; errTrain: number; errTest: number }
  bayesErr: number
}

const cache = new Map<Scenario, Model>()

function errors(set: Pt[], cum: Uint16Array) {
  const out = [NaN]
  for (let k = 1; k <= L; k++) {
    let wrong = 0
    for (let j = 0; j < set.length; j++) {
      const h = cum[j * (L + 1) + k] / k > 0.5 ? 1 : 0
      if (h !== set[j].c) wrong++
    }
    out.push(wrong / set.length)
  }
  return out
}

function linearFit(train: Pt[]) {
  // equazioni normali 3 × 3 su x̃ = [1, x₁, x₂]
  const S = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const t = [0, 0, 0]
  for (const p of train) {
    const v = [1, p.x, p.y]
    for (let a = 0; a < 3; a++) {
      t[a] += v[a] * p.c
      for (let b = 0; b < 3; b++) S[a][b] += v[a] * v[b]
    }
  }
  // eliminazione di Gauss
  const M = S.map((r, i) => [...r, t[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  return { w0: M[0][3] / M[0][0], w1: M[1][3] / M[1][1], w2: M[2][3] / M[2][2] }
}

export function model(sc: Scenario): Model {
  let m = cache.get(sc)
  if (m) return m
  const train = makeSet(sc, L, sc === 'mix' ? 11 : 12)
  const test = makeSet(sc, N_TEST, sc === 'mix' ? 21 : 22)
  const qs: { x: number; y: number }[] = []
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) qs.push({ x: gridX(i), y: gridY(j) })
  const grid = knnTable(train, qs)
  const errTrain = errors(train, knnTable(train, train))
  const errTest = errors(test, knnTable(train, test))
  const w = linearFit(train)
  const hl = (p: Pt) => (w.w0 + w.w1 * p.x + w.w2 * p.y > 0.5 ? 1 : 0)
  const rate = (set: Pt[], h: (p: Pt) => number) => set.filter((p) => h(p) !== p.c).length / set.length
  const lin = { ...w, errTrain: rate(train, hl), errTest: rate(test, hl) }
  const bayesErr = rate(test, (p) => (bayesP1(sc, p.x, p.y) > 0.5 ? 1 : 0))
  m = { train, test, grid, errTrain, errTest, lin, bayesErr }
  cache.set(sc, m)
  return m
}

/** avg_k nel nodo (i, j) della griglia */
export function gridAvg(m: Model, i: number, j: number, k: number) {
  return m.grid[(j * GX + i) * (L + 1) + k] / k
}

/* ------------------------------------------------------------------ stato condiviso */

type State = { scenario: Scenario; k: number }
let state: State = { scenario: 'mix', k: 15 }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((f) => f())

export function setScenario(scenario: Scenario) {
  state = { ...state, scenario }
  emit()
}
export function setK(k: number) {
  state = { ...state, k }
  emit()
}
export function useHtf() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}

/** valori di k proposti dagli slider (dispari, più una scala quasi logaritmica fino a k = l) */
export const K_STEPS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 25, 31, 37, 45, 55, 69, 83, 101, 121, 151, 175, 200]
