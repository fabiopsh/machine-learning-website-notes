import { useMemo, useState } from 'react'
import { Arrow, Axes, Dot, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { d2, voronoiCell, winner, type P } from './engine'

/* ------------------------------------------------------------------ Fig. 19.2: diagramma di Voronoi */

const BOX: [number, number, number, number] = [0, 0, 10, 8]

function sites(k: number): P[] {
  const r = rng(1902)
  const out: P[] = []
  let guard = 0
  while (out.length < 30 && guard++ < 5000) {
    const p = { x: 0.5 + r() * 9, y: 0.5 + r() * 7 }
    if (out.every((o) => d2(o, p) > 1.3)) out.push(p)
  }
  return out.slice(0, k)
}

function CellPaths({ S, hot }: { S: P[]; hot: number }) {
  const { x, y } = usePlot()
  const cells = useMemo(() => S.map((_, i) => voronoiCell(S, i, BOX)), [S])
  return (
    <g>
      {cells.map((poly, i) => (
        <path
          key={i}
          className={'vor19__cell' + (i % 2 ? ' is-dark' : '') + (i === hot ? ' is-hot' : '')}
          d={'M' + poly.map((p) => `${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join('L') + 'Z'}
        />
      ))}
      {S.map((p, i) => (
        <circle key={i} className={'vor19__site' + (i === hot ? ' is-hot' : '')} cx={x(p.x)} cy={y(p.y)} r={i === hot ? 6 : 4.5} />
      ))}
    </g>
  )
}

export function VoronoiCells() {
  const [k, setK] = useState(22)
  const [q, setQ] = useState<P>({ x: 4.2, y: 4.6 })
  const S = useMemo(() => sites(k), [k])
  const w = winner(q, S)
  const [visited, setVisited] = useState<number[]>([])
  if (!visited.includes(w) && visited.length < 6) setVisited([...visited, w])
  const seen = useLatch({ few: k <= 8 })
  return (
    <div>
      <div className="wgrid">
        <Plot xDomain={[0, 10]} yDomain={[0, 8]} equal aspect={0.8} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
          <Axes hideX hideY grid={false} />
          <CellPaths S={S} hot={w} />
          <Polyline pts={[q, S[w]]} color="var(--accent)" width={1.6} dash="4 3" />
          <Handle x={q.x} y={q.y} label={tx('vettore x', 'vector x')} onMove={setQ} />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label={tx('vettori di riferimento', 'reference vectors')} value={String(k)} sub={tx('il codebook', 'the codebook')} />
            <Readout
              label={
                <>
                  {tx('distorsione', 'distortion')} <Tex>{'\\|\\mathbf{x} - \\mathbf{w}_{i^*}\\|^2'}</Tex>
                </>
              }
              tone="accent"
              value={fmt(d2(q, S[w]), 2)}
            />
          </div>
          <Slider label={tx('numero di vettori di riferimento', 'number of reference vectors')} min={3} max={30} step={1} value={k} onChange={setK} width={230} />
          <p className="wnote">
            {tx(
              <>
                Il vettore <Tex>{'\\mathbf{x}'}</Tex> (trascinabile) è descritto dal vettore di riferimento vincente, quello della cella in cui
                cade.
              </>,
              <>
                The vector <Tex>{'\\mathbf{x}'}</Tex> (draggable) is described by the winning reference vector, the one of the cell it falls
                in.
              </>,
            )}
          </p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Trascina x attraverso almeno quattro celle: a ogni confine cambia il vettore vincente.',
              'Drag x across at least four cells: at each boundary the winning vector changes.',
            ),
            done: visited.length >= 4,
          },
          {
            label: tx(
              'Riduci il codebook a 8 vettori o meno: le celle si allargano e la distorsione tipica cresce.',
              'Reduce the codebook to 8 vectors or fewer: the cells widen and the typical distortion grows.',
            ),
            done: seen.few,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 19.3: quantizzazione in 1D */

function levels(k: number) {
  const r = rng(193)
  const wd = Array.from({ length: 16 }, () => 0.5 + r())
  const use = wd.slice(0, k)
  const tot = use.reduce((a, b) => a + b, 0)
  const cuts = [0]
  for (const v of use) cuts.push(cuts[cuts.length - 1] + v / tot)
  return { cuts, cents: use.map((_, i) => (cuts[i] + cuts[i + 1]) / 2) }
}

function Line1D({ cuts, cents, hot }: { cuts: number[]; cents: number[]; hot: number }) {
  const { x, y } = usePlot()
  return (
    <g>
      <rect className="q19__hot" x={x(cuts[hot])} y={y(0.5)} width={x(cuts[hot + 1]) - x(cuts[hot])} height={y(-0.5) - y(0.5)} />
      <line className="q19__axis" x1={x(0)} x2={x(1)} y1={y(0)} y2={y(0)} />
      {cuts.map((c, i) => (
        <line key={i} className="q19__cut" x1={x(c)} x2={x(c)} y1={y(0.5)} y2={y(-0.5)} />
      ))}
      {cents.map((c, i) => (
        <rect key={i} className={'q19__cent' + (i === hot ? ' is-hot' : '')} x={x(c) - 5} y={y(0) - 5} width={10} height={10} rx={2} />
      ))}
      <path className="q19__brace" d={`M${x(cuts[hot])},${y(0.72)}H${x(cuts[hot + 1])}`} />
    </g>
  )
}

export function Quant1D() {
  const [k, setK] = useState(7)
  const [v, setV] = useState(0.265)
  const { cuts, cents } = useMemo(() => levels(k), [k])
  let hot = 0
  cents.forEach((c, i) => {
    if (Math.abs(v - c) < Math.abs(v - cents[hot])) hot = i
  })
  const err = v - cents[hot]
  const [moved, setMoved] = useState(false)
  const seen = useLatch({ many: k >= 14 })
  return (
    <div>
      <Plot xDomain={[-0.02, 1.02]} yDomain={[-1, 1.15]} aspect={0.24} minH={120} maxH={170} margin={{ l: 8, r: 8, t: 4, b: 4 }}>
        <Line1D cuts={cuts} cents={cents} hot={hot} />
        <Label x={(cuts[hot] + cuts[hot + 1]) / 2} y={0.86} anchor="middle" className="plot-label--muted">
          {tx('cella di Voronoi', 'Voronoi cell')}
        </Label>
        <Polyline
          pts={[
            { x: v, y: -0.28 },
            { x: cents[hot], y: -0.28 },
          ]}
          color="var(--c-green)"
          width={3}
        />
        <Handle
          x={v}
          y={0}
          axis="x"
          label={tx('valore continuo', 'continuous value')}
          bounds={{ x: [0, 1] }}
          onMove={(p) => {
            setV(p.x)
            setMoved(true)
          }}
        />
      </Plot>
      <Controls>
        <Slider label={tx('numero di simboli (centroidi)', 'number of symbols (centroids)')} min={2} max={16} step={1} value={k} onChange={setK} width={230} />
        <div className="readouts">
          <Readout label={tx('valore', 'value')} tone="accent" value={fmt(v, 3)} />
          <Readout label={tx('simbolo', 'symbol')} value={tx(`n. ${hot + 1}`, `no. ${hot + 1}`)} sub={tx(`centroide ${fmt(cents[hot], 3)}`, `centroid ${fmt(cents[hot], 3)}`)} />
          <Readout label={tx('errore di quantizzazione', 'quantization error')} tone="green" value={fmt(Math.abs(err), 3)} />
        </div>
      </Controls>
      <Tasks
        items={[
          {
            label: tx(
              'Trascina il valore lungo la retta: dentro una cella il simbolo non cambia, cambia solo l’errore (il tratto verde).',
              'Drag the value along the line: inside a cell the symbol does not change, only the error does (the green segment).',
            ),
            done: moved,
          },
          {
            label: tx(
              'Porta i simboli a 14 o più: le celle si restringono e l’errore di quantizzazione diminuisce.',
              'Bring the symbols to 14 or more: the cells shrink and the quantization error decreases.',
            ),
            done: seen.many,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 19.4: K-means */

const KDATA: P[] = (() => {
  const r = rng(1904)
  const pts: P[] = []
  const blob = (n: number, cx: number, cy: number, sx: number, sy: number) => {
    for (let i = 0; i < n; i++) pts.push({ x: cx + gauss(r) * sx, y: cy + gauss(r) * sy })
  }
  blob(24, 2.4, 6.4, 0.6, 0.55)
  blob(26, 5.9, 6.5, 0.75, 0.5)
  blob(32, 4.3, 3.3, 0.7, 0.75)
  return pts
})()
const KCOL = ['var(--c-red)', 'var(--c-blue)', 'var(--c-green)']
const INIT: P[] = [
  { x: 2.9, y: 5.0 },
  { x: 4.5, y: 7.9 },
  { x: 6.3, y: 4.1 },
]

type Phase = 'init' | 'assign' | 'update'
const PHASE_TEXT: Record<Phase, string> = {
  init: tx('Inizializzazione: K = 3 prototipi. I punti non sono ancora assegnati.', 'Initialization: K = 3 prototypes. The points are not assigned yet.'),
  assign: tx('Assegnazione: ogni punto va al prototipo più vicino (il vincitore).', 'Assignment: each point goes to the nearest prototype (the winner).'),
  update: tx(
    'Aggiornamento: ogni prototipo si sposta nella media dei punti del suo cluster.',
    'Update: each prototype moves to the mean of the points of its cluster.',
  ),
}

function Square({ p, color, ghost }: { p: P; color: string; ghost?: boolean }) {
  const { x, y } = usePlot()
  return (
    <rect
      x={x(p.x) - 8}
      y={y(p.y) - 8}
      width={16}
      height={16}
      rx={2}
      fill={ghost ? 'var(--ink-4)' : color}
      stroke="var(--ink)"
      strokeWidth={ghost ? 1 : 1.6}
      opacity={ghost ? 0.7 : 1}
    />
  )
}

export function KMeans() {
  const [c, setC] = useState<P[]>(INIT)
  const [prev, setPrev] = useState<P[] | null>(null)
  const [phase, setPhase] = useState<Phase>('init')
  const [steps, setSteps] = useState(0)
  const [seed, setSeed] = useState(0)
  const [done, setDone] = useState(false)
  const assign = KDATA.map((p) => winner(p, c))
  const E = KDATA.reduce((s, p, i) => s + d2(p, c[assign[i]]), 0)
  const next = () => {
    setSteps(steps + 1)
    if (phase === 'init' || phase === 'update') {
      setPhase('assign')
      setPrev(null)
      return
    }
    const nc = c.map((q, k) => {
      const mine = KDATA.filter((_, i) => assign[i] === k)
      return mine.length ? { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length } : q
    })
    const still = nc.every((q, k) => d2(q, c[k]) < 1e-6)
    if (still) setDone(true)
    setPrev(c)
    setC(nc)
    setPhase('update')
  }
  const reset = (pts: P[]) => {
    setC(pts)
    setPrev(null)
    setPhase('init')
    setDone(false)
  }
  const randomInit = () => {
    const r = rng(77 + seed * 13)
    // K pattern estratti a caso
    reset([0, 1, 2].map(() => KDATA[Math.floor(r() * KDATA.length)]))
    setSeed(seed + 1)
  }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('prototipi', 'prototypes'), color: 'var(--ink)', kind: 'square' },
            { label: tx('punti (colore = cluster)', 'points (color = cluster)'), color: 'var(--ink-3)', kind: 'dot' },
          ]}
        />
      </div>
      <Plot xDomain={[0.5, 8]} yDomain={[1, 8.6]} equal aspect={0.7} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
        <Axes hideX hideY grid={false} />
        {KDATA.map((p, i) => (
          <Dot key={i} x={p.x} y={p.y} r={4.2} color={phase === 'init' ? 'var(--ink-4)' : KCOL[assign[i]]} />
        ))}
        {prev && prev.map((p, k) => <Arrow key={`a${k}`} from={p} to={c[k]} color="var(--ink)" width={1.4} head={7} />)}
        {prev && prev.map((p, k) => <Square key={`p${k}`} p={p} color={KCOL[k]} ghost />)}
        {c.map((p, k) => (
          <Square key={k} p={p} color={KCOL[k]} />
        ))}
        {c.map((p, k) => (
          <Label key={`l${k}`} x={p.x} y={p.y} dx={13} dy={-10} className="plot-label--math">
            {svgScript('c', String(k + 1))}
          </Label>
        ))}
      </Plot>
      <div className="wpanel">
        <div className="wpanel__title">{done ? tx('Convergenza', 'Convergence') : tx(`Passo ${steps}`, `Step ${steps}`)}</div>
        {done
          ? tx(
              'I prototipi non si spostano più e nessun punto cambia cluster: l’algoritmo si ferma (in un minimo, in generale locale).',
              'The prototypes no longer move and no point changes cluster: the algorithm stops (in a minimum, in general a local one).',
            )
          : PHASE_TEXT[phase]}
      </div>
      <Controls>
        <Btn icon="step" variant="soft" onClick={next} disabled={done}>
          {phase === 'assign' ? tx('Aggiorna i prototipi', 'Update the prototypes') : tx('Assegna i punti', 'Assign the points')}
        </Btn>
        <Btn icon="reset" onClick={() => reset(INIT)}>
          {tx('Ricomincia', 'Restart')}
        </Btn>
        <Btn onClick={randomInit}>{tx('Inizializzazione casuale', 'Random initialization')}</Btn>
        <div className="readouts">
          <Readout label={tx('errore di quantizzazione E', 'quantization error E')} tone="accent" value={phase === 'init' ? '—' : fmt(E, 1)} />
        </div>
      </Controls>
      <Tasks
        items={[
          {
            label: tx(
              'Esegui i passi uno alla volta: assegnazione, aggiornamento, nuova assegnazione… L’errore E non aumenta mai.',
              'Run the steps one at a time: assignment, update, new assignment… The error E never increases.',
            ),
            done: steps >= 4,
          },
          { label: tx('Arriva alla convergenza.', 'Reach convergence.'), done },
          {
            label: tx(
              'Prova più inizializzazioni casuali: il risultato può cambiare (minimi locali).',
              'Try several random initializations: the result can change (local minima).',
            ),
            done: seed >= 2,
          },
        ]}
      />
    </div>
  )
}
