import { marchCell } from './Surface3D'

/** Segmenti di una curva di livello di f su una griglia (marching squares). */
export function contourSegments(
  f: (x: number, y: number) => number,
  xr: [number, number],
  yr: [number, number],
  level: number,
  n = 64,
) {
  const gx = (i: number) => xr[0] + ((xr[1] - xr[0]) * i) / n
  const gy = (j: number) => yr[0] + ((yr[1] - yr[0]) * j) / n
  const Z: number[][] = []
  for (let i = 0; i <= n; i++) {
    Z.push([])
    for (let j = 0; j <= n; j++) Z[i].push(f(gx(i), gy(j)))
  }
  const segs: [[number, number], [number, number]][] = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      segs.push(...marchCell(gx(i), gx(i + 1), gy(j), gy(j + 1), Z[i][j], Z[i + 1][j], Z[i + 1][j + 1], Z[i][j + 1], level))
  return segs
}

/** Converte i segmenti in un path SVG date le scale del grafico. */
export function segsToPath(segs: [[number, number], [number, number]][], sx: (v: number) => number, sy: (v: number) => number) {
  let d = ''
  for (const [p, q] of segs) d += `M${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}L${sx(q[0]).toFixed(1)},${sy(q[1]).toFixed(1)}`
  return d
}
