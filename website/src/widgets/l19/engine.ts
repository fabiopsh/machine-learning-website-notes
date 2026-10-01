import { rng } from '../../lib/math'

export type P = { x: number; y: number }
export const d2 = (a: P, b: P) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

/** indice del vettore di riferimento vincente (il più vicino) */
export function winner(x: P, ws: P[]) {
  let best = 0
  for (let i = 1; i < ws.length; i++) if (d2(x, ws[i]) < d2(x, ws[best])) best = i
  return best
}

/** cella di Voronoi del sito i: il rettangolo tagliato dai semipiani «più vicino a i che a j» */
export function voronoiCell(S: P[], i: number, box: [number, number, number, number]): P[] {
  const [x0, y0, x1, y1] = box
  let poly: P[] = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ]
  const a = S[i]
  S.forEach((b, j) => {
    if (j === i || poly.length < 3) return
    const n = { x: b.x - a.x, y: b.y - a.y }
    const c = (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2
    const side = (p: P) => n.x * p.x + n.y * p.y - c
    const out: P[] = []
    for (let k = 0; k < poly.length; k++) {
      const A = poly[k]
      const B = poly[(k + 1) % poly.length]
      const sa = side(A)
      const sb = side(B)
      if (sa <= 0) out.push(A)
      if (sa <= 0 !== sb <= 0) {
        const t = sa / (sa - sb)
        out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t })
      }
    }
    poly = out
  })
  return poly
}

/* ------------------------------------------------------------------ SOM su dati uniformi nel quadrato */

export const SOM_N = 14
/** iterazioni a cui si salva lo stato della mappa (come nella figura degli appunti) */
export const SOM_STEPS = [0, 20, 100, 1000, 5000, 100000]

/**
 * Addestra una SOM N×N su input uniformi in [0,1]² e restituisce i pesi alle iterazioni di SOM_STEPS.
 * Vicinato gaussiano sulla griglia con raggio σ(t) che si restringe; learning rate η(t) decrescente.
 * Con `zeroRadius` si aggiorna solo il vincitore (K-means on-line).
 */
export function trainSom(zeroRadius: boolean): Float32Array[] {
  const N = SOM_N
  const r = rng(1907)
  const w = new Float32Array(N * N * 2)
  for (let i = 0; i < N * N; i++) {
    w[2 * i] = 0.5 + (r() - 0.5) * 0.04
    w[2 * i + 1] = 0.5 + (r() - 0.5) * 0.04
  }
  const snaps: Float32Array[] = []
  const last = SOM_STEPS[SOM_STEPS.length - 1]
  let next = 0
  for (let t = 0; t <= last; t++) {
    if (t === SOM_STEPS[next]) {
      snaps.push(w.slice())
      next++
    }
    const x = r()
    const y = r()
    let best = 0
    let bd = Infinity
    for (let i = 0; i < N * N; i++) {
      const dx = x - w[2 * i]
      const dy = y - w[2 * i + 1]
      const d = dx * dx + dy * dy
      if (d < bd) {
        bd = d
        best = i
      }
    }
    const eta = Math.max(0.02, 0.5 * Math.exp(-t / 3000))
    if (zeroRadius) {
      w[2 * best] += eta * (x - w[2 * best])
      w[2 * best + 1] += eta * (y - w[2 * best + 1])
      continue
    }
    const sigma = Math.max(0.7, (N / 2) * Math.exp(-t / 400))
    const br = Math.floor(best / N)
    const bc = best % N
    const reach = Math.ceil(sigma * 3)
    for (let rr = Math.max(0, br - reach); rr <= Math.min(N - 1, br + reach); rr++)
      for (let cc = Math.max(0, bc - reach); cc <= Math.min(N - 1, bc + reach); cc++) {
        const h = Math.exp(-((rr - br) ** 2 + (cc - bc) ** 2) / (2 * sigma * sigma))
        const i = rr * N + cc
        w[2 * i] += eta * h * (x - w[2 * i])
        w[2 * i + 1] += eta * h * (y - w[2 * i + 1])
      }
  }
  return snaps
}
