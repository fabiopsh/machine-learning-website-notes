import { rng } from '../../lib/math'

/**
 * Cifre «manoscritte» 16×16 a livelli di grigio (come il dataset ZIP code), generate in modo riproducibile:
 * ogni cifra è un insieme di tratti, deformati a caso (rotazione, inclinazione, scala, spessore) e poi
 * rasterizzati misurando la distanza di ogni pixel dal tratto più vicino.
 */

export const N = 16
export type Img = number[] // N×N valori in [0, 1], 1 = inchiostro

type P = [number, number]

const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 18): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]
  })

const STROKES: P[][][] = [
  [ellipse(0.5, 0.5, 0.27, 0.39)],
  [
    [
      [0.36, 0.26],
      [0.53, 0.1],
      [0.53, 0.9],
    ],
  ],
  [
    [
      [0.25, 0.3],
      [0.35, 0.14],
      [0.55, 0.1],
      [0.72, 0.22],
      [0.7, 0.42],
      [0.5, 0.62],
      [0.25, 0.9],
      [0.78, 0.9],
    ],
  ],
  [
    [
      [0.27, 0.18],
      [0.5, 0.1],
      [0.7, 0.2],
      [0.68, 0.38],
      [0.45, 0.48],
      [0.7, 0.58],
      [0.73, 0.78],
      [0.5, 0.9],
      [0.25, 0.82],
    ],
  ],
  [
    [
      [0.62, 0.9],
      [0.62, 0.1],
      [0.22, 0.62],
      [0.8, 0.62],
    ],
  ],
  [
    [
      [0.72, 0.1],
      [0.32, 0.1],
      [0.28, 0.45],
      [0.5, 0.4],
      [0.72, 0.52],
      [0.72, 0.75],
      [0.5, 0.9],
      [0.25, 0.82],
    ],
  ],
  [
    [
      [0.68, 0.12],
      [0.42, 0.22],
      [0.28, 0.5],
      [0.3, 0.78],
      [0.5, 0.9],
      [0.7, 0.78],
      [0.7, 0.58],
      [0.5, 0.48],
      [0.3, 0.6],
    ],
  ],
  [
    [
      [0.22, 0.12],
      [0.78, 0.12],
      [0.45, 0.9],
    ],
  ],
  [ellipse(0.5, 0.3, 0.19, 0.19, 12), ellipse(0.5, 0.7, 0.24, 0.2, 14)],
  [
    [
      [0.7, 0.4],
      [0.5, 0.5],
      [0.3, 0.4],
      [0.3, 0.22],
      [0.5, 0.1],
      [0.7, 0.2],
      [0.7, 0.5],
      [0.6, 0.9],
    ],
  ],
]

function distSeg(px: number, py: number, a: P, b: P) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2))
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy)
}

export function digit(d: number, seed: number): Img {
  const r = rng(1600 + d * 101 + seed * 7919)
  const rot = (r() - 0.5) * 0.36
  const skew = (r() - 0.5) * 0.4
  const sx = 0.82 + r() * 0.3
  const sy = 0.9 + r() * 0.15
  const thick = 0.045 + r() * 0.04
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const tf = ([x, y]: P): P => {
    let u = (x - 0.5) * sx
    const v = (y - 0.5) * sy
    u += skew * -v
    return [0.5 + u * c - v * s, 0.5 + u * s + v * c]
  }
  const strokes = STROKES[d].map((st) => st.map(tf))
  const img: Img = []
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const px = (i + 0.5) / N
      const py = (j + 0.5) / N
      let dmin = 1
      for (const st of strokes) for (let k = 0; k + 1 < st.length; k++) dmin = Math.min(dmin, distSeg(px, py, st[k], st[k + 1]))
      img.push(Math.max(0, Math.min(1, (thick + 0.03 - dmin) / 0.045)))
    }
  return img
}

/** trasla l'immagine di (dx, dy) pixel; i pixel che entrano sono bianchi */
export function shift(img: Img, dx: number, dy: number): Img {
  const out: Img = new Array(N * N).fill(0)
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const si = i - dx
      const sj = j - dy
      if (si >= 0 && si < N && sj >= 0 && sj < N) out[j * N + i] = img[sj * N + si]
    }
  return out
}
