import { useSyncExternalStore } from 'react'
import { rng } from '../../lib/math'

/**
 * Un MLP con uno strato nascosto (tanh) addestrato con backpropagation batch,
 * gradiente medio (diviso per l), momentum e weight decay separato (bias esclusi):
 *   Δw = η·(media dei δ_t o_u) + α·Δw_old,   w ← w + Δw − λ·w
 * È la regola «a iperparametri indipendenti» della lezione. Uscita lineare o sigmoidale.
 */

export type NetW = { W1: number[][]; W2: number[][] } // W1[j] = [w_j0, w_j1…], W2[k] = [w_k0, w_k1…]
export type TrainCfg = {
  X: number[][]
  Y: number[][]
  H: number
  eta: number
  alpha: number
  lambda: number
  out: 'lin' | 'sig'
  seed: number
  init: number
  /** set su cui misurare l'errore durante l'addestramento (validazione / test) */
  Xv?: number[][]
  Yv?: number[][]
}

export function initNet(nIn: number, H: number, nOut: number, seed: number, init: number): NetW {
  const r = rng(seed)
  const u = () => (r() * 2 - 1) * init
  return {
    W1: Array.from({ length: H }, () => Array.from({ length: nIn + 1 }, u)),
    W2: Array.from({ length: nOut }, () => Array.from({ length: H + 1 }, u)),
  }
}

export function forward(net: NetW, x: number[], out: 'lin' | 'sig') {
  const h = net.W1.map((w) => {
    let s = w[0]
    for (let i = 0; i < x.length; i++) s += w[i + 1] * x[i]
    return Math.tanh(s)
  })
  const o = net.W2.map((w) => {
    let s = w[0]
    for (let j = 0; j < h.length; j++) s += w[j + 1] * h[j]
    return out === 'sig' ? 1 / (1 + Math.exp(-s)) : s
  })
  return { h, o }
}

export function mse(net: NetW, X: number[][], Y: number[][], out: 'lin' | 'sig') {
  let s = 0
  for (let p = 0; p < X.length; p++) {
    const { o } = forward(net, X[p], out)
    for (let k = 0; k < o.length; k++) s += (Y[p][k] - o[k]) ** 2
  }
  return s / X.length
}

export function accuracy(net: NetW, X: number[][], Y: number[][]) {
  let ok = 0
  for (let p = 0; p < X.length; p++) if (forward(net, X[p], 'sig').o[0] > 0.5 === Y[p][0] > 0.5) ok++
  return ok / X.length
}

/** un'epoca batch; modifica net e mom sul posto */
export function epoch(net: NetW, mom: NetW, c: TrainCfg) {
  const H = net.W1.length
  const K = net.W2.length
  const g1 = net.W1.map((w) => w.map(() => 0))
  const g2 = net.W2.map((w) => w.map(() => 0))
  const l = c.X.length
  for (let p = 0; p < l; p++) {
    const x = c.X[p]
    const { h, o } = forward(net, x, c.out)
    const dk = o.map((ok, k) => (c.Y[p][k] - ok) * (c.out === 'sig' ? ok * (1 - ok) : 1))
    for (let k = 0; k < K; k++) {
      g2[k][0] += dk[k]
      for (let j = 0; j < H; j++) g2[k][j + 1] += dk[k] * h[j]
    }
    for (let j = 0; j < H; j++) {
      let s = 0
      for (let k = 0; k < K; k++) s += dk[k] * net.W2[k][j + 1]
      const dj = s * (1 - h[j] * h[j])
      g1[j][0] += dj
      for (let i = 0; i < x.length; i++) g1[j][i + 1] += dj * x[i]
    }
  }
  const upd = (W: number[][], M: number[][], G: number[][]) => {
    for (let a = 0; a < W.length; a++)
      for (let b = 0; b < W[a].length; b++) {
        M[a][b] = (c.eta * G[a][b]) / l + c.alpha * M[a][b]
        W[a][b] += M[a][b]
        if (b > 0) W[a][b] -= c.lambda * W[a][b]
      }
  }
  upd(net.W2, mom.W2, g2)
  upd(net.W1, mom.W1, g1)
}

const clone = (n: NetW): NetW => ({ W1: n.W1.map((r) => r.slice()), W2: n.W2.map((r) => r.slice()) })
const zeros = (n: NetW): NetW => ({ W1: n.W1.map((r) => r.map(() => 0)), W2: n.W2.map((r) => r.map(() => 0)) })

export type Run = {
  net: NetW
  done: number
  total: number
  /** [epoca, errore di training, errore su Xv] */
  hist: [number, number, number][]
  acc?: [number, number, number][]
  /** copie della rete a ogni registrazione (solo con keepNets) */
  nets?: NetW[]
}

/**
 * Addestramento progressivo: parte alla prima sottoscrizione e avanza di qualche centinaio di epoche
 * per frame, così la figura mostra la rete che impara. `snapshot` è stabile tra un frame e l'altro.
 */
/** `every`: registra ogni `every` epoche; con un valore negativo registra in scala logaritmica (passo relativo −every). */
export function trainer(cfg: TrainCfg, total: number, every = 10, withAcc = false, keepNets = false) {
  let net = initNet(cfg.X[0].length, cfg.H, cfg.Y[0].length, cfg.seed, cfg.init)
  let mom = zeros(net)
  let done = 0
  let nextRec = 0
  const advance = () => (every > 0 ? done + every : Math.max(done + 1, Math.round(done * (1 - every))))
  let hist: [number, number, number][] = []
  let acc: [number, number, number][] = []
  let nets: NetW[] = []
  const rec = () => {
    if (keepNets) nets.push(clone(net))
    hist.push([done, mse(net, cfg.X, cfg.Y, cfg.out), cfg.Xv ? mse(net, cfg.Xv, cfg.Yv!, cfg.out) : NaN])
    if (withAcc && cfg.Xv) acc.push([done, accuracy(net, cfg.X, cfg.Y), accuracy(net, cfg.Xv, cfg.Yv!)])
  }
  rec()
  nextRec = advance()
  let snap: Run = { net: clone(net), done, total, hist: hist.slice(), acc: acc.slice(), nets: nets.slice() }
  const listeners = new Set<() => void>()
  let raf = 0
  const step = () => {
    const t0 = performance.now()
    while (done < total && performance.now() - t0 < 12) {
      epoch(net, mom, cfg)
      done++
      if (done >= nextRec || done === total) {
        rec()
        nextRec = advance()
      }
    }
    snap = { net: clone(net), done, total, hist: hist.slice(), acc: acc.slice(), nets: nets.slice() }
    listeners.forEach((f) => f())
    raf = done < total ? requestAnimationFrame(step) : 0
  }
  const restart = (patch: Partial<TrainCfg>) => {
    Object.assign(cfg, patch)
    net = initNet(cfg.X[0].length, cfg.H, cfg.Y[0].length, cfg.seed, cfg.init)
    mom = zeros(net)
    done = 0
    hist = []
    acc = []
    nets = []
    rec()
    nextRec = advance()
    snap = { net: clone(net), done, total, hist: hist.slice(), acc: acc.slice(), nets: nets.slice() }
    listeners.forEach((f) => f())
    if (!raf && listeners.size) raf = requestAnimationFrame(step)
  }
  return {
    cfg,
    subscribe(cb: () => void) {
      listeners.add(cb)
      if (!raf && done < total) raf = requestAnimationFrame(step)
      return () => {
        listeners.delete(cb)
        if (!listeners.size && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      }
    },
    get: () => snap,
    restart,
  }
}

export type Trainer = ReturnType<typeof trainer>

export function useTrainer(t: Trainer) {
  return useSyncExternalStore(t.subscribe, t.get, t.get)
}
