import { useEffect, useMemo, useState } from 'react'
import { Axes, Plot, usePlot } from '../../components/plot/Plot'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Controls, Legend, Readout, Segmented, Toggle } from '../../components/ui/Controls'
import { LOCALE, tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'
import { SOM_N, SOM_STEPS, trainSom } from './engine'

/* ------------------------------------------------------------------ Fig. 19.5: dallo spazio di input alla mappa */

type P3 = [number, number, number]
/** proiezione obliqua dello spazio 3D sul foglio */
const O = { x: 150, y: 190 }
const proj = ([x, y, z]: P3) => ({ x: O.x + x * 105 - z * 52, y: O.y - y * 105 + z * 38 })
const arch = (t: number): P3 => [0.15 + 1.25 * t, 0.25 + 1.15 * Math.sin(Math.PI * t), 0.9 * (1 - t)]
const PTS: P3[] = Array.from({ length: 21 }, (_, i) => {
  const t = i / 20
  const p = arch(t)
  // due file di punti, leggermente scostate dalla curva
  const off = i % 2 ? 0.06 : -0.06
  return [p[0] + off, p[1] + off * 0.6, p[2]]
})
/** pesi delle 9 unità: lungo la curva, in ordine «a serpentina» sulla griglia, così unità vicine hanno pesi vicini */
const SNAKE = [0, 1, 2, 5, 4, 3, 6, 7, 8]
const UNIT_W: P3[] = []
SNAKE.forEach((u, k) => {
  UNIT_W[u] = arch((k + 0.5) / 9)
})
const d3 = (a: P3, b: P3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
const WIN = PTS.map((p) => UNIT_W.reduce((best, w, i) => (d3(p, w) < d3(p, UNIT_W[best]) ? i : best), 0))
/** centro della cella (riga, colonna) del parallelogramma che rappresenta la griglia 3×3 */
const cellPt = (r: number, c: number) => ({ x: 438 + c * 62 - r * 14, y: 78 + r * 30 })

export function SomMapping() {
  const [pt, setPt] = useState<number | null>(3)
  const [unit, setUnit] = useState<number | null>(null)
  const [seen, setSeen] = useState({ p: 0, u: false })
  const hotUnit = pt !== null ? WIN[pt] : unit
  const from = pt !== null ? proj(PTS[pt]) : null
  const to = hotUnit !== null ? cellPt(Math.floor(hotUnit / 3) + 0.5, (hotUnit % 3) + 0.5) : null
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="map19" viewBox="0 0 660 270" style={{ minWidth: 540 }} role="img" aria-label={tx('Punti nello spazio di input 3D mappati su una griglia neurale 2D', 'Points in the 3D input space mapped onto a 2D neural grid')}>
          <g className="map19__axes">
            <line x1={O.x} y1={O.y} x2={O.x} y2={24} />
            <line x1={O.x} y1={O.y} x2={O.x + 200} y2={O.y} />
            <line x1={O.x} y1={O.y} x2={O.x - 78} y2={O.y + 57} />
          </g>
          {from && to && <line className="map19__arrow" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />}
          {PTS.map((p, i) => {
            const q = proj(p)
            const on = pt === i || (unit !== null && WIN[i] === unit)
            return (
              <circle
                key={i}
                className={'map19__pt' + (on ? ' is-on' : '')}
                cx={q.x}
                cy={q.y}
                r={on ? 6 : 4.5}
                role="button"
                tabIndex={0}
                aria-label={tx(`punto ${i + 1}`, `point ${i + 1}`)}
                onClick={() => {
                  setPt(i)
                  setUnit(null)
                  setSeen((s) => ({ ...s, p: s.p + 1 }))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setPt(i)
                    setUnit(null)
                  }
                }}
              />
            )
          })}
          {Array.from({ length: 9 }, (_, u) => {
            const r = Math.floor(u / 3)
            const c = u % 3
            const a = cellPt(r, c)
            const b = cellPt(r, c + 1)
            const cc = cellPt(r + 1, c + 1)
            const d = cellPt(r + 1, c)
            return (
              <path
                key={u}
                className={'map19__cell' + (hotUnit === u ? ' is-on' : '')}
                d={`M${a.x},${a.y}L${b.x},${b.y}L${cc.x},${cc.y}L${d.x},${d.y}Z`}
                role="button"
                tabIndex={0}
                aria-label={tx(`unità ${u + 1} della mappa`, `unit ${u + 1} of the map`)}
                onClick={() => {
                  setUnit(u)
                  setPt(null)
                  setSeen((s) => ({ ...s, u: true }))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setUnit(u)
                    setPt(null)
                  }
                }}
              />
            )
          })}
          <text className="map19__t" x={40} y={258}>
            {tx('spazio di input 3D (o multidimensionale, in generale)', '3D input space (or multidimensional, in general)')}
          </text>
          <text className="map19__t" x={420} y={196}>
            {tx('mappa neurale (griglia 2D)', 'neural map (2D grid)')}
          </text>
        </svg>
      </div>
      <p className="wnote">
        {pt !== null
          ? tx(
              'L’unità evidenziata è la vincitrice per il punto scelto: quella il cui vettore dei pesi è il più vicino all’input.',
              'The highlighted unit is the winner for the chosen point: the one whose weight vector is closest to the input.',
            )
          : tx(
              'I punti evidenziati sono quelli per cui l’unità scelta è la vincitrice. Unità vicine sulla mappa rispondono a punti vicini nello spazio di input.',
              'The highlighted points are those for which the chosen unit is the winner. Units that are close on the map respond to points that are close in the input space.',
            )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca alcuni punti vicini tra loro: finiscono sulla stessa unità o su unità vicine.',
              'Click a few points close to each other: they end up on the same unit or on nearby units.',
            ),
            done: seen.p >= 3,
          },
          {
            label: tx(
              'Clicca un’unità della mappa: si accendono i punti che rappresenta.',
              'Click a unit of the map: the points it represents light up.',
            ),
            done: seen.u,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 19.6: l'homunculus */

/** parti del corpo nell'ordine in cui compaiono lungo la corteccia; `a` = ampiezza relativa dell'area (illustrativa) */
const BODY: { name: string; a: number }[] = [
  { name: tx('dita dei piedi', 'toes'), a: 1 },
  { name: tx('ginocchio', 'knee'), a: 0.9 },
  { name: tx('anca', 'hip'), a: 0.9 },
  { name: tx('tronco', 'trunk'), a: 1.3 },
  { name: tx('spalla', 'shoulder'), a: 0.9 },
  { name: tx('braccio', 'arm'), a: 0.9 },
  { name: tx('gomito', 'elbow'), a: 0.9 },
  { name: tx('polso', 'wrist'), a: 0.9 },
  { name: tx('mano', 'hand'), a: 2.4 },
  { name: tx('dita', 'fingers'), a: 2.6 },
  { name: tx('pollice', 'thumb'), a: 1.9 },
  { name: tx('collo', 'neck'), a: 0.8 },
  { name: tx('sopracciglio', 'eyebrow'), a: 0.8 },
  { name: tx('occhio', 'eye'), a: 1.2 },
  { name: tx('viso', 'face'), a: 2.3 },
  { name: tx('labbra', 'lips'), a: 2.7 },
  { name: tx('mascella', 'jaw'), a: 1.1 },
  { name: tx('lingua', 'tongue'), a: 1.8 },
  { name: tx('deglutizione', 'swallowing'), a: 1.1 },
]
const TOT = BODY.reduce((s, b) => s + b.a, 0)
// dall'angolo 186° (a sinistra) a −6° (a destra), passando in alto
const A0 = 186
const A1 = -6
const SEGS = BODY.map((b, i) => {
  const before = BODY.slice(0, i).reduce((s, q) => s + q.a, 0)
  return { ...b, a0: A0 + ((A1 - A0) * before) / TOT, a1: A0 + ((A1 - A0) * (before + b.a)) / TOT }
})

export function Homunculus() {
  const [sel, setSel] = useState(8)
  const [n, setN] = useState(0)
  const [big, setBig] = useState(false)
  const CX = 310
  const CY = 318
  const R1 = 150
  const R2 = 196
  const pt = (r: number, deg: number) => ({ x: CX + r * Math.cos((deg * Math.PI) / 180), y: CY - r * Math.sin((deg * Math.PI) / 180) })
  const maxA = Math.max(...BODY.map((b) => b.a))
  return (
    <div>
      <div className="pipe16__scroll">
      <svg className="hom19" viewBox="0 0 620 340" style={{ minWidth: 520 }} role="img" aria-label={tx('Homunculus somatosensoriale: le parti del corpo in ordine lungo la corteccia', 'Somatosensory homunculus: the parts of the body in order along the cortex')}>
        {SEGS.map((s, i) => {
          const p1 = pt(R2, s.a0)
          const p2 = pt(R2, s.a1)
          const p3 = pt(R1, s.a1)
          const p4 = pt(R1, s.a0)
          const mid = (s.a0 + s.a1) / 2
          const lp = pt(R2 + 8, mid)
          const flip = mid > 90
          const near = Math.abs(i - sel) === 1
          const pick = () => {
            setSel(i)
            setN(n + 1)
            if (s.a >= 2.2) setBig(true)
          }
          return (
            <g
              key={s.name}
              className={'hom19__seg' + (i === sel ? ' is-on' : near ? ' is-near' : '')}
              role="button"
              tabIndex={0}
              aria-label={s.name}
              aria-pressed={i === sel}
              onClick={pick}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
            >
              <path d={`M${p1.x},${p1.y}A${R2},${R2} 0 0 1 ${p2.x},${p2.y}L${p3.x},${p3.y}A${R1},${R1} 0 0 0 ${p4.x},${p4.y}Z`} />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor={flip ? 'end' : 'start'}
                dominantBaseline="central"
                transform={`rotate(${flip ? 180 - mid : -mid} ${lp.x} ${lp.y})`}
              >
                {s.name}
              </text>
            </g>
          )
        })}
        <text className="hom19__c" x={CX} y={CY - 70} textAnchor="middle">
          {tx('corteccia', 'somatosensory')}
        </text>
        <text className="hom19__c" x={CX} y={CY - 52} textAnchor="middle">
          {tx('somatosensoriale', 'cortex')}
        </text>
      </svg>
      </div>
      <Controls>
        <div className="readouts">
          <Readout label={tx('parte del corpo', 'body part')} tone="accent" value={BODY[sel].name} />
          <Readout
            label={tx('zone adiacenti sulla corteccia', 'adjacent zones on the cortex')}
            value={[BODY[sel - 1]?.name, BODY[sel + 1]?.name].filter(Boolean).join(' · ')}
            sub={tx('parti vicine anche nel corpo', 'parts also close in the body')}
          />
          <Readout
            label={tx('area occupata', 'area occupied')}
            value={BODY[sel].a >= 2.2 ? tx('ampia', 'large') : BODY[sel].a >= 1.2 ? tx('media', 'medium') : tx('piccola', 'small')}
            sub={BODY[sel].a === maxA ? tx('la più ampia', 'the largest') : undefined}
          />
        </div>
      </Controls>
      <p className="wnote">
        {tx(
          'Schema della sezione di corteccia: l’ordine delle parti è quello della figura, le ampiezze delle zone sono indicative.',
          'Diagram of the section of cortex: the order of the parts is that of the figure, the widths of the zones are indicative.',
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca più zone lungo la corteccia: neuroni adiacenti rappresentano parti vicine del corpo.',
              'Click several zones along the cortex: adjacent neurons represent nearby parts of the body.',
            ),
            done: n >= 3,
          },
          {
            label: tx('Trova una delle parti più sensibili: occupa un’area più ampia.', 'Find one of the most sensitive parts: it occupies a larger area.'),
            done: big,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 19.7: l'addestramento di una SOM */

function Net({ w }: { w: Float32Array }) {
  const { x, y } = usePlot()
  const N = SOM_N
  let d = ''
  const px = (i: number) => `${x(w[2 * i]).toFixed(1)},${y(w[2 * i + 1]).toFixed(1)}`
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) d += (c === 0 ? 'M' : 'L') + px(r * N + c)
  for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) d += (r === 0 ? 'M' : 'L') + px(r * N + c)
  return (
    <g>
      <path d={d} className="som19__net" />
      {Array.from({ length: N * N }, (_, i) => (
        <circle key={i} className="som19__u" cx={x(w[2 * i])} cy={y(w[2 * i + 1])} r={2} />
      ))}
    </g>
  )
}

export function SomTraining() {
  const [k, setK] = useState(2)
  const [zero, setZero] = useState(false)
  const [play, setPlay] = useState(false)
  const snaps = useMemo(() => trainSom(zero), [zero])
  const seen = useLatch({ end: k === SOM_STEPS.length - 1, zero })
  const LAST = SOM_STEPS.length - 1
  // l'animazione avanza finché non arriva all'ultima iterazione salvata
  const playing = play && k < LAST
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setK((q) => Math.min(LAST, q + 1)), 900)
    return () => clearInterval(id)
  }, [playing, LAST])
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label={tx('iterazione', 'iteration')}
          value={k}
          onChange={(v) => {
            setK(v)
            setPlay(false)
          }}
          options={SOM_STEPS.map((s, i) => ({ value: i, label: s.toLocaleString(LOCALE) }))}
        />
        <Toggle label={tx('vicinato di raggio zero', 'neighborhood of radius zero')} checked={zero} onChange={setZero} />
      </div>
      <div className="som19">
        <Plot xDomain={[0, 1]} yDomain={[0, 1]} equal aspect={1} minH={260} maxH={430} margin={{ l: 12, r: 12, t: 12, b: 12 }}>
          <Axes hideX hideY grid={false} />
          <Net w={snaps[k]} />
        </Plot>
      </div>
      <Controls>
        <Btn
          icon={playing ? 'pause' : 'play'}
          variant="soft"
          onClick={() => {
            if (playing) setPlay(false)
            else {
              if (k === LAST) setK(0)
              setPlay(true)
            }
          }}
        >
          {playing ? tx('Ferma', 'Stop') : tx('Segui l’addestramento', 'Follow the training')}
        </Btn>
        <Legend
          items={[
            {
              label: tx(
                `vettori di riferimento (mappa ${SOM_N} × ${SOM_N}), collegati secondo la griglia`,
                `reference vectors (${SOM_N} × ${SOM_N} map), connected according to the grid`,
              ),
              color: 'var(--c-blue)',
            },
          ]}
        />
      </Controls>
      <p className="wnote">
        {zero
          ? tx(
              'Con vicinato di raggio zero si aggiorna solo il vincitore: è il K-means on-line. I prototipi coprono comunque il quadrato, ma la griglia resta aggrovigliata: non c’è ordine topologico.',
              'With a neighborhood of radius zero only the winner is updated: it is on-line K-means. The prototypes still cover the square, but the grid stays tangled: there is no topological order.',
            )
          : tx(
              'Una SOM vera, addestrata su input uniformi nel quadrato: il vicinato sulla griglia, ampio all’inizio e poi sempre più stretto, distende la mappa in modo ordinato.',
              'A real SOM, trained on uniform inputs in the square: the neighborhood on the grid, wide at the beginning and then narrower and narrower, unfolds the map in an orderly way.',
            )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Segui l’addestramento fino a 100.000 iterazioni: la mappa parte concentrata in un punto e si distende sul quadrato.',
              'Follow the training up to 100,000 iterations: the map starts concentrated in one point and unfolds over the square.',
            ),
            done: seen.end,
          },
          {
            label: tx(
              'Attiva il vicinato di raggio zero e riguarda le iterazioni: senza fase cooperativa l’ordine non emerge.',
              'Turn on the neighborhood of radius zero and go through the iterations again: without the cooperative stage the order does not emerge.',
            ),
            done: seen.zero,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 19.8 e 19.9: benessere e povertà nel mondo */

const COLS = 13
const ROWS = 9
/** codici dei paesi nelle unità della mappa 13×9, letti dalla figura originale: chiave «riga,colonna» */
const COUNTRIES: Record<string, string[]> = {
  '0,0': ['BEL'],
  '0,1': ['SWE'],
  '0,2': ['ITA'],
  '0,3': ['YUG'],
  '0,6': ['CHN', 'TUR'],
  '0,7': ['IDN'],
  '0,8': ['MDG'],
  '0,10': ['NPL', 'BGD'],
  '0,12': ['SLE', 'MLI'],
  '1,0': ['AUT', 'FRA', 'DEU'],
  '1,1': ['NLD'],
  '1,2': ['JPN'],
  '1,5': ['POL', 'HUN', 'PRT'],
  '1,11': ['PAK'],
  '2,2': ['ESP'],
  '2,3': ['GRC'],
  '2,6': ['THA'],
  '2,7': ['MAR'],
  '2,9': ['IND'],
  '2,11': ['SEN'],
  '2,12': ['TZA', 'MWI'],
  '3,0': ['GBR', 'DNK', 'NOR'],
  '3,1': ['FIN'],
  '3,2': ['IRL'],
  '3,4': ['URY'],
  '3,5': ['ARG'],
  '3,6': ['ECU'],
  '3,8': ['EGY'],
  '3,10': ['ZAR'],
  '4,3': ['KOR'],
  '4,7': ['TUN'],
  '4,9': ['GHA'],
  '4,10': ['NGA'],
  '4,12': ['ETH'],
  '5,0': ['CAN', 'USA'],
  '5,2': ['ISR'],
  '5,5': ['PER', 'COL'],
  '5,8': ['ZWE'],
  '6,1': ['AUS'],
  '6,3': ['MUS'],
  '6,6': ['PRY', 'IRN'],
  '6,8': ['BWA'],
  '6,9': ['KEN'],
  '6,10': ['BEN', 'CIV'],
  '6,12': ['RWA'],
  '7,0': ['NZL'],
  '7,3': ['CHL'],
  '7,4': ['PAN'],
  '8,1': ['SGP', 'HKG'],
  '8,3': ['CRI', 'VEN'],
  '8,5': ['JAM', 'MYS'],
  '8,7': ['LKA', 'PHL', 'DOM'],
  '8,9': ['BOL', 'SLV', 'BRA'],
  '8,11': ['GTM'],
  '8,12': ['ZMB', 'CMR'],
}
/** posizione continua (in colonne e righe) del centro di un'unità: le righe pari sono spostate di mezza cella */
const pos = (r: number, c: number) => ({ u: c + (r % 2 === 0 ? 0.5 : 0), v: r })

/** zone scure (confini tra cluster) e chiare (cluster) della U-matrix, lette a occhio dalla figura: [colonna, riga, intensità, raggio] */
const DARK: [number, number, number, number][] = [
  [6.3, 2.6, 0.95, 0.8],
  [6.6, 3.5, 0.5, 0.9],
  [7.3, 4.4, 0.5, 0.9],
  [4.5, 4.2, 0.7, 0.8],
  [4.0, 5.3, 0.55, 0.9],
  [5.0, 3.3, 0.45, 0.8],
  [9.6, 4.9, 0.95, 0.75],
  [11.6, 5.3, 0.95, 0.75],
  [12.2, 3.9, 0.85, 0.75],
  [8.9, 0.9, 0.6, 0.9],
  [7.0, 0.6, 0.45, 0.8],
  [2.4, 6.9, 0.45, 1.2],
  [11.4, 7.2, 0.45, 1.0],
  [12.6, 6.4, 0.5, 0.8],
  [6.2, 7.2, 0.25, 1.2],
  [1.8, 1.6, -0.28, 2.0],
  [5.4, 1.4, -0.16, 1.0],
  [10.6, 1.6, -0.12, 1.5],
  [4.3, 7.4, -0.2, 0.9],
  [12.3, 8.0, -0.2, 0.8],
  [1.0, 5.0, -0.12, 1.2],
]
function darkness(r: number, c: number) {
  const { u, v } = pos(r, c)
  let d = 0.24
  for (const [cu, cv, s, rad] of DARK) d += 0.85 * s * Math.exp(-((u - cu) ** 2 + (v - cv) ** 2) / (2 * (0.72 * rad) ** 2))
  return Math.max(0.04, Math.min(1, d))
}
/** colori della seconda figura, letti a occhio: ancore [colonna, riga, tinta in gradi] interpolate (media circolare) */
const HUES: [number, number, number][] = [
  [1, 1, 42],
  [1, 4, 55],
  [0.5, 6, 75],
  [2, 8, 95],
  [4.5, 6.5, 120],
  [5, 1, 8],
  [6, 2.5, 355],
  [8, 1, 310],
  [11, 1.5, 285],
  [10, 3.5, 290],
  [8, 4, 275],
  [6.5, 4.6, 150],
  [7.5, 6.5, 170],
  [8.5, 8, 185],
  [10, 6.5, 225],
  [11.5, 8, 215],
  [12.3, 5, 268],
]
function hue(r: number, c: number) {
  const { u, v } = pos(r, c)
  let sx = 0
  let sy = 0
  for (const [cu, cv, h] of HUES) {
    const w = 1 / (0.08 + ((u - cu) ** 2 + (v - cv) ** 2) ** 1.5)
    sx += w * Math.cos((h * Math.PI) / 180)
    sy += w * Math.sin((h * Math.PI) / 180)
  }
  return Math.round(((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360)
}
function neighbours(r: number, c: number): [number, number][] {
  const shift = r % 2 === 0 ? 0 : -1
  const cand: [number, number][] = [
    [r, c - 1],
    [r, c + 1],
    [r - 1, c + shift],
    [r - 1, c + shift + 1],
    [r + 1, c + shift],
    [r + 1, c + shift + 1],
  ]
  return cand.filter(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS)
}

export function WelfareMap({ mode }: { mode: 'umatrix' | 'colors' }) {
  const [sel, setSel] = useState<string | null>(null)
  const [n, setN] = useState(0)
  const S = 25
  const W = Math.sqrt(3) * S
  const cx = (r: number, c: number) => 6 + (pos(r, c).u + 0.5) * W
  const cy = (r: number) => 6 + S + r * 1.5 * S
  const hex = (x: number, y: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30)
      return `${(x + S * Math.cos(a)).toFixed(1)},${(y + S * Math.sin(a)).toFixed(1)}`
    }).join(' ')
  const selRC = sel ? (sel.split(',').map(Number) as [number, number]) : null
  const nb = selRC ? neighbours(selRC[0], selRC[1]) : []
  const nbKeys = new Set(nb.map(([r, c]) => `${r},${c}`))
  const nbCountries = nb.flatMap(([r, c]) => COUNTRIES[`${r},${c}`] ?? [])
  return (
    <div>
      <div className="pipe16__scroll">
        <svg
          className={`wel19 wel19--${mode}`}
          viewBox={`0 0 ${Math.ceil(12 + (COLS + 0.5) * W)} ${Math.ceil(12 + 2 * S + (ROWS - 1) * 1.5 * S)}`}
          style={{ minWidth: 560 }}
          role="img"
          aria-label={tx('Mappa SOM 13 per 9 degli indicatori di benessere di 77 paesi', '13 by 9 SOM map of the welfare indicators of 77 countries')}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS)
            const c = i % COLS
            const key = `${r},${c}`
            const names = COUNTRIES[key]
            const dk = darkness(r, c)
            const x = cx(r, c)
            const y = cy(r)
            const fill =
              mode === 'umatrix' ? `color-mix(in srgb, var(--um-dark) ${Math.round(dk * 82)}%, var(--um-light))` : `hsl(${hue(r, c)} 62% 54%)`
            const pick = () => {
              setSel(key)
              setN(n + 1)
            }
            return (
              <g
                key={key}
                className={'wel19__cell' + (sel === key ? ' is-on' : nbKeys.has(key) ? ' is-near' : '') + (mode === 'umatrix' && dk > 0.55 ? ' is-dark' : '')}
                role={names ? 'button' : undefined}
                tabIndex={names ? 0 : undefined}
                aria-label={names ? names.join(', ') : undefined}
                onClick={names ? pick : undefined}
                onKeyDown={names ? (e) => (e.key === 'Enter' || e.key === ' ') && pick() : undefined}
              >
                <polygon points={hex(x, y)} fill={fill} />
                {names?.map((nm, q) => (
                  <text key={nm} x={x} y={y + 3.6 + (q - (names.length - 1) / 2) * 10.5} textAnchor="middle">
                    {nm}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      <Controls>
        {sel ? (
          <span className="verdict verdict--info">
            {COUNTRIES[sel].join(', ')} — {tx('nelle unità vicine', 'in the neighboring units')}:{' '}
            {nbCountries.length ? nbCountries.join(', ') : tx('nessun paese', 'no country')}.
          </span>
        ) : (
          <p className="wnote">
            {tx(
              'Clicca un’unità con dei paesi per vedere quali paesi stanno nelle unità adiacenti della mappa.',
              'Click a unit with countries to see which countries lie in the adjacent units of the map.',
            )}
          </p>
        )}
      </Controls>
      <p className="wnote">
        {mode === 'umatrix'
          ? tx(
              'Grigio chiaro = vettori di riferimento vicini (un cluster di paesi simili); grigio scuro = vettori lontani (un confine tra cluster). Le posizioni dei paesi sono lette dalla figura originale; le sfumature sono ricostruite a occhio.',
              'Light gray = close reference vectors (a cluster of similar countries); dark gray = distant vectors (a boundary between clusters). The positions of the countries are read from the original figure; the shades are reconstructed by eye.',
            )
          : tx(
              'Colori simili indicano paesi con indicatori simili: dal giallo-arancio dei paesi industrializzati al viola-blu dei paesi più poveri. I colori sono ricostruiti a occhio dalla figura originale.',
              'Similar colors indicate countries with similar indicators: from the yellow-orange of the industrialized countries to the purple-blue of the poorest countries. The colors are reconstructed by eye from the original figure.',
            )}
      </p>
      <Tasks
        items={[
          {
            label:
              mode === 'umatrix'
                ? tx(
                    'Clicca alcune unità in una zona chiara, poi una vicina a una zona scura: i paesi simili sono raggruppati, le zone scure separano i gruppi.',
                    'Click a few units in a light area, then one near a dark area: similar countries are grouped together, the dark areas separate the groups.',
                  )
                : tx(
                    'Clicca alcune unità: i paesi delle unità adiacenti hanno colori simili, cioè indicatori simili.',
                    'Click a few units: the countries of adjacent units have similar colors, that is similar indicators.',
                  ),
            done: n >= 3,
          },
        ]}
      />
    </div>
  )
}
