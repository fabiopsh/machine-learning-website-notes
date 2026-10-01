import { useState, type ReactNode } from 'react'
import { Axes, Dot, Handle, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Legend, Readout, Segmented, Toggle } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ schema a stadi (16.7 e 16.10) */

type Stage = {
  id: string
  label: string
  kind: 'image' | 'maps' | 'dense' | 'out' | 'dots'
  /** numero di mappe (o di unità) e lato in pixel */
  n?: number
  size?: number
  group?: string
  title: string
  text: string
  classes?: string[]
}

const OFF = 7

/** ascisse di blocchi affiancati di larghezza data, e ascissa finale */
function place(widths: number[], gap: number, start: number) {
  const xs: number[] = []
  let x = start
  for (const w of widths) {
    xs.push(x)
    x += w + gap
  }
  return { xs, end: x }
}

/** larghezza riservata a uno stadio: la forma oppure, se più larga, la sua etichetta */
const labelWidth = (label: string) => Math.max(...label.split('\n').map((l) => l.length)) * 6.3
const slotWidth = (s: Stage) => Math.max(stageWidth(s), s.kind === 'dots' ? 0 : labelWidth(s.label))

function stageWidth(s: Stage) {
  if (s.kind === 'maps') return (s.size ?? 40) + ((s.n ?? 1) - 1) * OFF
  if (s.kind === 'image') return s.size ?? 80
  if (s.kind === 'dots') return 22
  if (s.kind === 'out') return s.classes ? 86 : 22
  return 16
}

function Pipeline({
  stages,
  groups,
  initial,
  aria,
}: {
  stages: Stage[]
  groups?: { id: string; label: string }[]
  initial: string
  aria: string
}) {
  const [sel, setSel] = useState(initial)
  const [n, setN] = useState(0)
  const [seenGroup, setSeenGroup] = useState<Record<string, boolean>>({})
  const GAP = 18
  const MID = 118
  const { xs, end } = place(stages.map(slotWidth), GAP, 14)
  // x, w: la forma (centrata nel proprio spazio); sx, sw: lo spazio riservato
  const pos = stages.map((s, i) => ({ x: xs[i] + (slotWidth(s) - stageWidth(s)) / 2, w: stageWidth(s), sx: xs[i], sw: slotWidth(s) }))
  const W = end - GAP + 14
  const H = groups ? 262 : 226
  const cur = stages.find((s) => s.id === sel) ?? stages[0]
  const pick = (s: Stage) => {
    setSel(s.id)
    setN(n + 1)
    if (s.group) setSeenGroup((g) => ({ ...g, [s.group!]: true }))
  }
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="pipe16" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 620) }} role="img" aria-label={aria}>
          {stages.slice(0, -1).map((s, i) => {
            const a = pos[i]
            const b = pos[i + 1]
            return <line key={s.id} className="pipe16__link" x1={a.x + a.w + 4} y1={MID} x2={b.x - 4} y2={MID} />
          })}
          {stages.map((s, i) => {
            const p = pos[i]
            const on = s.id === sel
            const dim = cur.group && s.group && s.group !== cur.group
            let body: ReactNode
            if (s.kind === 'image') {
              const sz = s.size ?? 80
              body = (
                <g>
                  <rect className="pipe16__img" x={p.x} y={MID - sz / 2} width={sz} height={sz} rx={4} />
                  <rect className="pipe16__win" x={p.x + sz * 0.55} y={MID + sz * 0.08} width={sz * 0.26} height={sz * 0.26} />
                </g>
              )
            } else if (s.kind === 'maps') {
              const sz = s.size ?? 40
              const k = s.n ?? 1
              const y0 = MID - (sz + (k - 1) * OFF) / 2
              body = (
                <g>
                  {Array.from({ length: k }, (_, q) => (
                    <rect key={q} className="pipe16__map" x={p.x + q * OFF} y={y0 + q * OFF} width={sz} height={sz} rx={3} />
                  ))}
                </g>
              )
            } else if (s.kind === 'dense' || (s.kind === 'out' && !s.classes)) {
              const k = s.n ?? 6
              const h = Math.min(18, 150 / k)
              body = (
                <g>
                  {Array.from({ length: k }, (_, q) => (
                    <rect
                      key={q}
                      className={s.kind === 'out' ? 'pipe16__unit pipe16__unit--out' : 'pipe16__unit'}
                      x={p.x + 1}
                      y={MID - (k * h) / 2 + q * h + 1.5}
                      width={14}
                      height={h - 3}
                      rx={3}
                    />
                  ))}
                </g>
              )
            } else if (s.kind === 'out' && s.classes) {
              body = (
                <g>
                  {s.classes.map((c, q) => (
                    <g key={q}>
                      {c !== '…' && <rect className="pipe16__unit pipe16__unit--out" x={p.x + 1} y={MID - 62 + q * 24} width={14} height={14} rx={3} />}
                      <text className="pipe16__cls" x={p.x + 22} y={MID - 51 + q * 24}>
                        {c}
                      </text>
                    </g>
                  ))}
                </g>
              )
            } else {
              body = (
                <text className="pipe16__dots" x={p.x + p.w / 2} y={MID + 5} textAnchor="middle">
                  …
                </text>
              )
            }
            if (s.kind === 'dots')
              return (
                <g key={s.id} opacity={dim ? 0.45 : 1}>
                  {body}
                </g>
              )
            const lines = s.label.split('\n')
            return (
              <g
                key={s.id}
                className={'pipe16__stage' + (on ? ' is-on' : '')}
                opacity={dim ? 0.45 : 1}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={s.title}
                onClick={() => pick(s)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(s)}
              >
                <rect className="pipe16__hit" x={p.sx - 5} y={18} width={p.sw + 10} height={H - (groups ? 62 : 24)} rx={10} />
                {body}
                {lines.map((ln, q) => (
                  <text key={q} className="pipe16__lbl" x={p.x + p.w / 2} y={206 + q * 13 - (lines.length - 1) * 6} textAnchor="middle">
                    {ln}
                  </text>
                ))}
              </g>
            )
          })}
          {groups?.map((g) => {
            const idx = stages.map((s, i) => (s.group === g.id ? i : -1)).filter((i) => i >= 0)
            const x1 = pos[idx[0]].sx - 2
            const last = pos[idx[idx.length - 1]]
            const x2 = last.sx + last.sw + 2
            const xm = (x1 + x2) / 2
            const hot = cur.group === g.id
            return (
              <g key={g.id} className={'pipe16__brace' + (hot ? ' is-on' : '')}>
                <path d={`M${x1},226 q0,10 10,10 H${xm - 10} q10,0 10,10 q0,-10 10,-10 H${x2 - 10} q10,0 10,-10`} />
                <text x={xm} y={259} textAnchor="middle">
                  {g.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">{cur.title}</div>
        {cur.text}
      </div>
      <Tasks
        items={
          groups
            ? [
                { label: 'Clicca un blocco della parte di feature learning (convoluzioni e pooling).', done: !!seenGroup.feat },
                { label: 'Clicca un blocco della parte di classificazione (strati densi e softmax).', done: !!seenGroup.cls },
              ]
            : [{ label: 'Clicca gli stadi uno dopo l’altro, dall’input all’output, e segui come cambiano numero e dimensione delle mappe.', done: n >= 3 }]
        }
      />
    </div>
  )
}

const CNN_STAGES: Stage[] = [
  {
    id: 'in',
    label: 'Input',
    kind: 'image',
    size: 84,
    title: 'Input',
    text: 'L’immagine di input. Il riquadro è una finestra di input: il campo recettivo locale di un’unità del primo strato.',
  },
  {
    id: 'c1',
    label: 'Convoluzioni',
    kind: 'maps',
    n: 4,
    size: 70,
    title: 'Convoluzioni',
    text: 'Ogni feature map è prodotta da un filtro: la stessa unità, con connessioni locali e pesi condivisi, che scorre su tutta l’immagine. Filtri diversi producono feature map diverse.',
  },
  {
    id: 's1',
    label: 'Sotto-\ncampionamento',
    kind: 'maps',
    n: 4,
    size: 38,
    title: 'Sotto-campionamento',
    text: 'Il pooling riduce ogni feature map: un valore (la media o il massimo) per un insieme rettangolare di pixel. Il numero di mappe non cambia.',
  },
  {
    id: 'c2',
    label: 'Convoluzioni',
    kind: 'maps',
    n: 8,
    size: 30,
    title: 'Convoluzioni (secondo strato)',
    text: 'Le stesse operazioni applicate alle mappe precedenti: le unità rappresentano aree via via più grandi dell’immagine originale. Il numero di filtri (feature map) può crescere negli strati più alti.',
  },
  {
    id: 's2',
    label: 'Sotto-\ncampionamento',
    kind: 'maps',
    n: 8,
    size: 14,
    title: 'Sotto-campionamento (secondo strato)',
    text: 'Un’altra riduzione: la dimensione della rappresentazione diminuisce a ogni strato, come in una piramide.',
  },
  {
    id: 'fc',
    label: 'Completamente\nconnesso',
    kind: 'dense',
    n: 7,
    title: 'Strati completamente connessi',
    text: 'Dopo convoluzioni e sotto-campionamenti alternati, le mappe finali sono collegate a strati completamente connessi.',
  },
  { id: 'out', label: 'Output', kind: 'out', n: 2, title: 'Output', text: 'Le unità di uscita della rete.' },
]

export function CnnPipeline() {
  return (
    <Pipeline
      stages={CNN_STAGES}
      initial="c1"
      aria="Una CNN completa: input, convoluzioni, sotto-campionamento, convoluzioni, sotto-campionamento, strati completamente connessi, output"
    />
  )
}

const ALEX_STAGES: Stage[] = [
  { id: 'in', label: 'Input', kind: 'image', size: 76, title: 'Input', text: 'L’immagine da classificare (nella figura originale, un’auto).' },
  {
    id: 'c1',
    label: 'Convoluzione\n+ ReLU',
    kind: 'maps',
    n: 5,
    size: 64,
    group: 'feat',
    title: 'Convoluzione + ReLU',
    text: 'Feature learning: i filtri convoluzionali, seguiti da unità ReLU (neuroni non saturanti), estraggono le feature dall’immagine.',
  },
  {
    id: 'p1',
    label: 'Pooling',
    kind: 'maps',
    n: 5,
    size: 40,
    group: 'feat',
    title: 'Pooling',
    text: 'Feature learning: il pooling riduce la dimensione delle feature map.',
  },
  {
    id: 'c2',
    label: 'Convoluzione\n+ ReLU',
    kind: 'maps',
    n: 7,
    size: 34,
    group: 'feat',
    title: 'Convoluzione + ReLU',
    text: 'Feature learning: un altro blocco di convoluzione, applicato alle mappe ridotte.',
  },
  { id: 'p2', label: 'Pooling', kind: 'maps', n: 7, size: 18, group: 'feat', title: 'Pooling', text: 'Feature learning: un’altra riduzione.' },
  { id: 'dots', label: '', kind: 'dots', group: 'feat', title: '', text: '' },
  {
    id: 'flat',
    label: 'Flatten',
    kind: 'dense',
    n: 10,
    group: 'cls',
    title: 'Flatten',
    text: 'Classificazione: le mappe finali vengono «srotolate» in un unico vettore, che fa da input agli strati densi.',
  },
  {
    id: 'fc',
    label: 'Completamente\nconnesso',
    kind: 'dense',
    n: 10,
    group: 'cls',
    title: 'Strato completamente connesso',
    text: 'Classificazione: strati densi (completamente connessi) sulle feature apprese.',
  },
  {
    id: 'soft',
    label: 'Softmax',
    kind: 'out',
    group: 'cls',
    classes: ['auto', 'camion', 'furgone', '…', 'bicicletta'],
    title: 'Softmax',
    text: 'Classificazione: l’uscita softmax assegna una probabilità a ogni classe (auto, camion, furgone, …, bicicletta).',
  },
]

export function AlexLike() {
  return (
    <Pipeline
      stages={ALEX_STAGES}
      groups={[
        { id: 'feat', label: 'FEATURE LEARNING' },
        { id: 'cls', label: 'CLASSIFICAZIONE' },
      ]}
      initial="in"
      aria="Architettura tipo AlexNet: blocchi di convoluzione più ReLU e pooling, poi flatten, strati completamente connessi e softmax"
    />
  )
}

/* ------------------------------------------------------------------ Fig. 16.8: il cono */

type Layer = { name: string; n: number; kind: 'in' | 'conv' | 'pool' | 'fc' | 'out' }
const LAYERS: Layer[] = [
  { name: 'Immagine', n: 32, kind: 'in' },
  { name: 'Convoluzione', n: 32, kind: 'conv' },
  { name: 'Pooling', n: 16, kind: 'pool' },
  { name: 'Convoluzione', n: 16, kind: 'conv' },
  { name: 'Pooling', n: 8, kind: 'pool' },
  { name: 'Compl. connesso', n: 6, kind: 'fc' },
  { name: 'Compl. connesso', n: 6, kind: 'fc' },
  { name: 'Predizioni', n: 4, kind: 'out' },
]
const PROBS = [
  { c: 'cane', p: 0.01 },
  { c: 'gatto', p: 0.04 },
  { c: 'barca', p: 0.94 },
  { c: 'uccello', p: 0.02 },
]

/** intervallo di unità dello strato precedente da cui dipende l'intervallo [lo, hi] dello strato l */
function back(l: number, lo: number, hi: number): [number, number] {
  const k = LAYERS[l].kind
  const prev = LAYERS[l - 1].n
  if (k === 'conv') return [Math.max(0, lo - 1), Math.min(prev - 1, hi + 1)]
  if (k === 'pool') return [2 * lo, 2 * hi + 1]
  return [0, prev - 1]
}

export function ReceptiveCone() {
  const [sel, setSel] = useState<[number, number]>([1, 15])
  const ranges: [number, number][] = []
  ranges[sel[0]] = [sel[1], sel[1]]
  for (let l = sel[0]; l >= 1; l--) ranges[l - 1] = back(l, ranges[l][0], ranges[l][1])
  const rf = ranges[0][1] - ranges[0][0] + 1
  const TOP = 44
  const HH = 256
  const X0 = 34
  const DX = 74
  const CW = 16
  const cx = (l: number) => X0 + l * DX
  const cellH = (l: number) => (LAYERS[l].kind === 'fc' ? 22 : LAYERS[l].kind === 'out' ? 30 : HH / LAYERS[l].n)
  const colTop = (l: number) => TOP + (HH - cellH(l) * LAYERS[l].n) / 2
  const yOf = (l: number, i: number) => colTop(l) + i * cellH(l)
  const seen = useLatch({ pool: sel[0] === 4, fc: sel[0] >= 5 })
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="cone16" viewBox="0 0 680 330" style={{ minWidth: 600 }} role="img" aria-label="Campo recettivo delle unità ai vari strati di una CNN">
          {LAYERS.map((ly, l) => (
            <text key={l} className="cone16__name" x={cx(l) + CW / 2} y={l % 2 === 0 ? 16 : 30} textAnchor="middle">
              {ly.name}
            </text>
          ))}
          {/* il cono: trapezi tra strati consecutivi, dall'unità scelta fino all'immagine */}
          {ranges.map((rg, l) => {
            if (l === sel[0] || !ranges[l + 1]) return null
            const nx = ranges[l + 1]
            return (
              <path
                key={l}
                className="cone16__cone"
                d={`M${cx(l) + CW},${yOf(l, rg[0])}L${cx(l + 1)},${yOf(l + 1, nx[0])}V${yOf(l + 1, nx[1] + 1)}L${cx(l) + CW},${yOf(l, rg[1] + 1)}Z`}
              />
            )
          })}
          {LAYERS.map((ly, l) =>
            Array.from({ length: ly.n }, (_, i) => {
              const inR = ranges[l] && i >= ranges[l][0] && i <= ranges[l][1]
              const isSel = sel[0] === l && sel[1] === i
              const h = cellH(l)
              return (
                <rect
                  key={`${l}-${i}`}
                  className={`cone16__u cone16__u--${ly.kind}` + (inR ? ' is-in' : '') + (isSel ? ' is-sel' : '')}
                  x={cx(l)}
                  y={yOf(l, i) + (h > 12 ? 2 : 0.5)}
                  width={CW}
                  height={h - (h > 12 ? 4 : 1)}
                  rx={h > 12 ? 4 : 1.5}
                  onClick={l > 0 ? () => setSel([l, i]) : undefined}
                />
              )
            }),
          )}
          {PROBS.map((p, i) => (
            <text key={p.c} className="cone16__cls" x={cx(7) + CW + 8} y={yOf(7, i) + 19}>
              {p.c} ({fmt(p.p, 2)})
            </text>
          ))}
        </svg>
      </div>
      <div className="controls">
        <div className="readouts">
          <Readout label="unità scelta" tone="accent" value={LAYERS[sel[0]].name.toLowerCase()} sub={`strato ${sel[0]} di 7`} />
          <Readout label="campo recettivo" value={`${rf} pixel`} sub="su 32 (in una sezione dell’immagine)" />
        </div>
      </div>
      <p className="wnote">
        Ogni colonna è una sezione di uno strato. Qui le convoluzioni hanno un kernel largo 3 e il pooling raggruppa 2 unità. Clicca
        un’unità: sono evidenziate tutte le unità e i pixel da cui dipende.
      </p>
      <Tasks
        items={[
          { label: 'Clicca un’unità del secondo pooling: è collegata indirettamente a una zona dell’immagine molto più ampia di un’unità del primo strato.', done: seen.pool },
          { label: 'Clicca un’unità di uno strato completamente connesso o un’uscita: vede tutta l’immagine.', done: seen.fc },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.9: le dimensioni */

type Vol = { id: string; name: string[]; side: number; depth: number; units?: number; win?: number; title: string; text: string }
const VOLS: Vol[] = [
  {
    id: 'in',
    name: ['Input'],
    side: 36,
    depth: 3,
    win: 11,
    title: 'Input: 36 × 36 × 3',
    text: 'Un’immagine a colori: 36 × 36 pixel per 3 canali (RGB). La finestra 11 × 11 è il campo recettivo di un’unità del primo strato convoluzionale.',
  },
  {
    id: 'c1',
    name: ['Strato', 'convoluzionale 1'],
    side: 26,
    depth: 9,
    win: 3,
    title: 'Strato convoluzionale 1: 26 × 26 × 9',
    text: 'Un kernel 11 × 11 che scorre su un input 36 × 36 ha 36 − 11 + 1 = 26 posizioni per lato. La profondità del volume (9) è il numero di neuroni, cioè di feature map.',
  },
  {
    id: 'p1',
    name: ['Max pooling 1'],
    side: 12,
    depth: 9,
    win: 7,
    title: 'Max pooling 1: 12 × 12 × 9',
    text: 'Il pooling (finestra 3 × 3) riduce ogni mappa da 26 × 26 a 12 × 12; la profondità resta 9. La finestra 7 × 7 è il campo recettivo delle unità dello strato successivo.',
  },
  {
    id: 'c2',
    name: ['Strato', 'convoluzionale 2'],
    side: 6,
    depth: 3,
    win: 3,
    title: 'Strato convoluzionale 2: 6 × 6 × 3',
    text: 'Un kernel 7 × 7 su mappe 12 × 12: 12 − 7 + 1 = 6 posizioni per lato, con 3 feature map.',
  },
  {
    id: 'p2',
    name: ['Max pooling 2'],
    side: 2,
    depth: 3,
    title: 'Max pooling 2: 2 × 2 × 3',
    text: 'Il secondo pooling (finestra 3 × 3) riduce le mappe a 2 × 2: restano 2 · 2 · 3 = 12 valori.',
  },
  { id: 'fc', name: ['Completamente', 'connesso'], side: 0, depth: 0, units: 5, title: 'Strato completamente connesso', text: 'Cinque unità, ciascuna collegata a tutti i valori dell’ultimo pooling.' },
  { id: 'out', name: ['Output'], side: 0, depth: 0, units: 2, title: 'Strato di output', text: 'Due unità di uscita, collegate a tutte le unità dello strato completamente connesso.' },
]

export function Dimensions() {
  const [sel, setSel] = useState('c1')
  const [n, setN] = useState(0)
  const K = 2.5
  const DK = 3.2
  const MID = 150
  const dims = VOLS.map((v) => ({ s: v.units ? 26 : Math.max(9, v.side * K), d: v.units ? 0 : v.depth * DK }))
  const slot = dims.map((q, i) => Math.max(q.s + q.d, 84, labelWidth(VOLS[i].name.join('\n'))))
  const { xs, end } = place(slot, 16, 16)
  const lay = dims.map((q, i) => ({ x: xs[i] + (slot[i] - q.s - q.d) / 2, sx: xs[i], sw: slot[i], ...q }))
  const W = end - 10
  const cur = VOLS.find((v) => v.id === sel)!
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="dim16" viewBox={`0 0 ${W} 300`} style={{ minWidth: 600 }} role="img" aria-label="Una CNN con le dimensioni di ogni strato">
          {VOLS.map((v, i) => {
            const p = lay[i]
            const on = v.id === sel
            const top = MID - p.s / 2
            const pick = () => {
              setSel(v.id)
              setN(n + 1)
            }
            return (
              <g
                key={v.id}
                className={'dim16__vol' + (on ? ' is-on' : '')}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={v.title}
                onClick={pick}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
              >
                <rect className="dim16__hit" x={p.sx - 4} y={30} width={p.sw + 8} height={250} rx={10} />
                {v.units ? (
                  <g>
                    <rect className="dim16__col" x={p.x} y={MID - v.units * 15 - 4} width={26} height={v.units * 30 + 8} rx={6} />
                    {Array.from({ length: v.units }, (_, q) => (
                      <circle key={q} className={v.id === 'out' ? 'dim16__unit dim16__unit--out' : 'dim16__unit'} cx={p.x + 13} cy={MID - (v.units ?? 0) * 15 + 15 + q * 30} r={9} />
                    ))}
                  </g>
                ) : (
                  <g>
                    {/* parallelepipedo: faccia posteriore, spigoli, faccia anteriore */}
                    <path
                      className="dim16__back"
                      d={`M${p.x},${top}l${p.d},${-p.d * 0.5}h${p.s}v${p.s}l${-p.d},${p.d * 0.5}`}
                    />
                    <path className="dim16__edge" d={`M${p.x + p.s},${top}l${p.d},${-p.d * 0.5}`} />
                    <rect className="dim16__front" x={p.x} y={top} width={p.s} height={p.s} />
                    {v.win && (
                      <rect className="dim16__win" x={p.x + p.s * 0.3} y={top + p.s * 0.35} width={Math.min(p.s * 0.6, v.win * K)} height={Math.min(p.s * 0.6, v.win * K)} />
                    )}
                    <text className="dim16__num" x={p.x + p.s / 2} y={top + p.s + 16} textAnchor="middle">
                      {v.side} × {v.side} × {v.depth}
                    </text>
                  </g>
                )}
                {v.name.map((ln, q) => (
                  <text key={q} className="dim16__name" x={p.x + (p.s + p.d) / 2} y={258 + q * 14} textAnchor="middle">
                    {ln}
                  </text>
                ))}
              </g>
            )
          })}
          {VOLS.slice(0, -1).map((v, i) => {
            const a = lay[i]
            const b = lay[i + 1]
            return <line key={v.id} className="pipe16__link" x1={a.x + a.s + a.d + 5} y1={MID} x2={b.x - 5} y2={MID} />
          })}
          {[
            [0, '11 × 11'],
            [1, 'pool 3 × 3'],
            [2, '7 × 7'],
            [3, 'pool 3 × 3'],
          ].map(([i, t]) => {
            const a = lay[i as number]
            const b = lay[(i as number) + 1]
            return (
              <text key={i} className="dim16__op" x={(a.sx + a.sw + b.sx) / 2} y={52} textAnchor="middle">
                {t}
              </text>
            )
          })}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">{cur.title}</div>
        {cur.text}
      </div>
      <Tasks items={[{ label: 'Clicca gli strati in ordine e segui come cambiano larghezza, altezza e profondità del volume.', done: n >= 3 }]} />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.11: le cinque reti di LeCun */

type NetDef = { name: string; conn: number; weights: number; layers: { label: string; maps: number; w: number }[]; note: string; local?: boolean; shared?: boolean }
const NETS: NetDef[] = [
  {
    name: 'Net-1',
    conn: 2570,
    weights: 2570,
    layers: [
      { label: '16 × 16', maps: 1, w: 110 },
      { label: '10', maps: 1, w: 70 },
    ],
    note: 'Nessuno strato nascosto: l’immagine 16 × 16 è collegata direttamente alle 10 uscite.',
  },
  {
    name: 'Net-2',
    conn: 3214,
    weights: 3214,
    layers: [
      { label: '16 × 16', maps: 1, w: 110 },
      { label: '12', maps: 1, w: 86 },
      { label: '10', maps: 1, w: 70 },
    ],
    note: 'Completamente connessa, con uno strato nascosto di 12 unità.',
  },
  {
    name: 'Net-3',
    conn: 1226,
    weights: 1226,
    local: true,
    layers: [
      { label: '16 × 16', maps: 1, w: 110 },
      { label: '8 × 8', maps: 1, w: 74 },
      { label: '4 × 4', maps: 1, w: 46 },
      { label: '10', maps: 1, w: 70 },
    ],
    note: 'Connessioni locali: ogni unità nascosta vede solo una piccola zona (3 × 3) dello strato precedente. Le mappe si riducono da uno strato all’altro (local averaging / sotto-campionamento, es. media o max pooling).',
  },
  {
    name: 'Net-4',
    conn: 2266,
    weights: 1132,
    local: true,
    shared: true,
    layers: [
      { label: '16 × 16', maps: 1, w: 110 },
      { label: '8 × 8 × 2', maps: 2, w: 66 },
      { label: '4 × 4', maps: 1, w: 46 },
      { label: '10', maps: 1, w: 70 },
    ],
    note: 'Connessioni locali e pesi condivisi: il primo strato nascosto è fatto di due feature map 8 × 8. Le connessioni sono il doppio dei pesi.',
  },
  {
    name: 'Net-5',
    conn: 5194,
    weights: 1060,
    local: true,
    shared: true,
    layers: [
      { label: '16 × 16', maps: 1, w: 110 },
      { label: '8 × 8 × 2', maps: 2, w: 66 },
      { label: '4 × 4 × 4', maps: 4, w: 38 },
      { label: '10', maps: 1, w: 70 },
    ],
    note: 'Connessioni locali e pesi condivisi su due strati: due feature map 8 × 8 e quattro 4 × 4. Ha più connessioni di tutte, ma il minor numero di pesi.',
  },
]
const CMAX = 5194

export function LeCunNets() {
  const [k, setK] = useState(0)
  const net = NETS[k]
  const seen = useLatch({ n4: k === 3, n5: k === 4 })
  const H = 250
  const CX = 150
  const nL = net.layers.length
  const yOf = (i: number) => H - 30 - (i * (H - 70)) / (nL - 1)
  const boxH = (i: number) => (i === nL - 1 || (nL === 3 && i === 1) ? 10 : net.layers[i].w * 0.42)
  return (
    <div>
      <div className="wbar">
        <Segmented value={k} onChange={setK} options={NETS.map((n, i) => ({ value: i, label: n.name }))} />
      </div>
      <div className="wgrid wgrid--even">
        <svg className="lcn16" viewBox={`0 0 300 ${H}`} role="img" aria-label={`Architettura di ${net.name}`}>
          {net.layers.map((ly, i) => {
            if (i === nL - 1) return null
            const up = net.layers[i + 1]
            const y1 = yOf(i) - boxH(i) / 2
            const y2 = yOf(i + 1) + boxH(i + 1) / 2
            const gap = 10
            const tot = (m: number, w: number) => m * w + (m - 1) * gap
            const local = net.local && i < nL - 2
            return Array.from({ length: up.maps }, (_, q) => {
              const ux = CX - tot(up.maps, up.w) / 2 + q * (up.w + gap)
              const lq = Math.min(q, ly.maps - 1)
              const lx = CX - tot(ly.maps, ly.w) / 2 + lq * (ly.w + gap)
              return local ? (
                <g key={`${i}-${q}`}>
                  <rect className="lcn16__field" x={lx + ly.w * 0.5} y={y1 + boxH(i) * 0.3} width={ly.w * 0.26} height={boxH(i) * 0.4} />
                  <path
                    className="lcn16__edge"
                    d={`M${lx + ly.w * 0.5},${y1 + boxH(i) * 0.3}L${ux + up.w * 0.45},${y2 - boxH(i + 1) * 0.35}M${lx + ly.w * 0.76},${y1 + boxH(i) * 0.3}L${ux + up.w * 0.45},${y2 - boxH(i + 1) * 0.35}`}
                  />
                  <circle className="lcn16__dot" cx={ux + up.w * 0.45} cy={y2 - boxH(i + 1) * 0.35} r={2.6} />
                </g>
              ) : (
                <path key={`${i}-${q}`} className="lcn16__edge" d={`M${lx},${y1}L${ux},${y2}M${lx + ly.w},${y1}L${ux + up.w},${y2}`} />
              )
            })
          })}
          {net.layers.map((ly, i) => {
            const gap = 10
            const tot = ly.maps * ly.w + (ly.maps - 1) * gap
            return (
              <g key={i}>
                {Array.from({ length: ly.maps }, (_, q) => (
                  <rect key={q} className="lcn16__box" x={CX - tot / 2 + q * (ly.w + gap)} y={yOf(i) - boxH(i) / 2} width={ly.w} height={boxH(i)} rx={3} />
                ))}
                <text className="lcn16__lbl" x={CX + tot / 2 + 12} y={yOf(i) + 4}>
                  {ly.label}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">
              {net.name}
              {net.local ? ' · connessioni locali' : ''}
              {net.shared ? ' · pesi condivisi' : ''}
            </div>
            {net.note}
          </div>
          <div className="lcb16">
            {NETS.map((n, i) => (
              <button key={n.name} type="button" className={'lcb16__row' + (i === k ? ' is-on' : '')} onClick={() => setK(i)}>
                <span className="lcb16__name">{n.name}</span>
                <span className="lcb16__bars">
                  <span className="lcb16__bar lcb16__bar--c" style={{ width: `${(n.conn / CMAX) * 100}%` }} />
                  <span className="lcb16__bar lcb16__bar--w" style={{ width: `${(n.weights / CMAX) * 100}%` }} />
                </span>
                <span className="lcb16__num">
                  {n.conn}
                  <br />
                  {n.weights}
                </span>
              </button>
            ))}
          </div>
          <Legend
            items={[
              { label: 'connessioni', color: 'var(--c-blue)', kind: 'square' },
              { label: 'pesi', color: 'var(--c-orange)', kind: 'square' },
            ]}
          />
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Guarda Net-4: con i pesi condivisi le connessioni (2266) sono il doppio dei pesi (1132).', done: seen.n4 },
          { label: 'Guarda Net-5: è la rete con più connessioni e con meno pesi.', done: seen.n5 },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.12: curve di LeCun */

/** percentuali lette dalla figura originale: [epoca, % corretti sul test] */
const CURVES: { name: string; color: string; pts: [number, number][] }[] = [
  {
    name: 'Net-1',
    color: 'var(--c-red)',
    pts: [[1, 56], [2, 79], [3, 80], [4, 79.2], [5, 80], [7, 79.2], [10, 78.3], [15, 76.1], [20, 74.8], [25, 73.8], [30, 72] ],
  },
  {
    name: 'Net-2',
    color: 'var(--c-green)',
    pts: [[1, 55], [2, 73], [3, 81], [4, 84], [5, 85.2], [7, 86.2], [10, 86], [15, 86.5], [20, 86.3], [25, 86.2], [30, 86] ],
  },
  {
    name: 'Net-3',
    color: 'var(--c-blue)',
    pts: [[1, 55], [2, 73], [3, 81], [4, 83.9], [5, 84], [7, 85], [10, 86], [15, 86.3], [20, 86.8], [25, 87.3], [30, 88.5] ],
  },
  {
    name: 'Net-4',
    color: 'var(--c-orange)',
    pts: [[1, 55], [2, 73], [3, 81], [4, 84], [5, 87.3], [7, 89.6], [10, 91.2], [15, 92.9], [20, 93.3], [25, 93.4], [30, 94] ],
  },
  {
    name: 'Net-5',
    color: 'var(--c-violet)',
    pts: [[1, 85], [2, 92], [3, 93], [5, 96], [7, 96.6], [10, 96.5], [15, 97.6], [20, 98], [25, 98], [30, 98.4] ],
  },
]

function interp(pts: [number, number][], e: number) {
  if (e <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++)
    if (e <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      return y0 + ((y1 - y0) * (e - x0)) / (x1 - x0)
    }
  return pts[pts.length - 1][1]
}

export function LeCunCurves() {
  const [e, setE] = useState(30)
  const [only, setOnly] = useState(false)
  const seen = useLatch({ early: e <= 5, only })
  const shown = only ? CURVES.filter((c) => c.name === 'Net-1' || c.name === 'Net-5') : CURVES
  return (
    <div>
      <div className="wbar">
        <Legend items={shown.map((c) => ({ label: c.name, color: c.color }))} />
        <Toggle label="solo Net-1 e Net-5" checked={only} onChange={setOnly} />
      </div>
      <Plot xDomain={[0, 30]} yDomain={[60, 100]} aspect={0.58} margin={{ b: 40 }}>
        <Axes xTicks={[0, 5, 10, 15, 20, 25, 30]} yTicks={[60, 70, 80, 90, 100]} xLabel="epoche di training" yLabel="% corretti sul test" />
        {shown.map((c) => (
          <Polyline key={c.name} pts={[{ x: c.pts[0][0] - 0.25, y: 40 }, ...c.pts.map(([x, y]) => ({ x, y }))]} color={c.color} width={2.2} />
        ))}
        {shown.map((c) => (
          <Label key={c.name} x={30} y={c.pts[c.pts.length - 1][1]} dx={-6} dy={c.name === 'Net-2' ? 15 : -8} anchor="end">
            {c.name}
          </Label>
        ))}
        <Polyline
          pts={[
            { x: e, y: 60 },
            { x: e, y: 100 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        {shown.map((c) => (
          <Dot key={c.name} x={e} y={Math.max(60, interp(c.pts, e))} color={c.color} r={4} />
        ))}
        <Handle x={e} y={60} axis="x" label="epoca" onMove={(p) => setE(Math.max(1, Math.round(p.x)))} />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label="epoca" tone="accent" value={String(e)} />
          {shown.map((c) => (
            <Readout key={c.name} label={c.name} value={`${fmt(interp(c.pts, e), 1)}%`} />
          ))}
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Trascina l’epoca verso l’inizio: Net-5 è la migliore fin dalle prime epoche.', done: seen.early },
          { label: 'Confronta solo Net-1 e Net-5: la rete senza strati nascosti peggiora sul test andando avanti con le epoche.', done: seen.only },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.13: predizioni top-5 */

type Pred = { it: string; label: string; preds: [string, number][] }
/** etichette e lunghezze delle barre lette dalla figura originale (le probabilità sono approssimate) */
const PREDS: Pred[] = [
  { it: 'orchidea', label: 'fragrant orchid', preds: [['coelogyne', 0.37], ['dendrobium', 0.2], ['cymbid', 0.16], ['phaius', 0.03], ['stanhopea', 0.02]] },
  { it: 'albero', label: 'huisache', preds: [['huisache', 0.38], ['silver maple', 0.15], ['pin oak', 0.08], ['sycamore', 0.05], ['red beech', 0.04]] },
  { it: 'poncho', label: 'poncho', preds: [['poncho', 0.72], ['pullover', 0.1], ['cardigan', 0.05], ['chain mail', 0.02], ['stole', 0.01]] },
  { it: 'scooter', label: 'motor scooter', preds: [['motor scooter', 0.55], ['go-kart', 0.11], ['moped', 0.11], ['bumper car', 0.09], ['golfcart', 0.02]] },
  { it: 'sedia', label: 'armchair', preds: [['armchair', 0.56], ['folding chair', 0.28], ['swivel chair', 0.01], ['apron', 0.005], ['lentil', 0.003]] },
  { it: 'orchidea', label: 'fly orchid', preds: [['fly orchid', 0.99], ['helleborine', 0.004], ['bee orchid', 0.002], ['lizard orchid', 0.001], ['spider orchid', 0.001]] },
  { it: 'stivale', label: 'boot', preds: [['boot', 0.99], ['sock', 0.002], ['jean', 0.001], ['ice skate', 0.001], ['shin guard', 0.001]] },
  { it: 'medusa', label: 'jellyfish', preds: [['jellyfish', 0.99], ['coral', 0.002], ['polyp', 0.001], ['isopod', 0.001], ['sea anemone', 0.001]] },
]

export function Top5() {
  const [sel, setSel] = useState<number | null>(null)
  const [wrong, setWrong] = useState(false)
  const rank = (p: Pred) => p.preds.findIndex(([c]) => c === p.label)
  const cur = sel !== null ? PREDS[sel] : null
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'la classe corretta', color: 'var(--c-red)', kind: 'square' },
            { label: 'le altre predizioni', color: 'var(--c-blue)', kind: 'square' },
          ]}
        />
      </div>
      <div className="top16">
        {PREDS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={'top16__card' + (sel === i ? ' is-on' : '')}
            aria-pressed={sel === i}
            onClick={() => {
              setSel(i)
              if (rank(p) < 0) setWrong(true)
            }}
          >
            <span className="top16__true">
              {p.label}
              <small>{p.it}</small>
            </span>
            {p.preds.map(([c, v]) => (
              <span key={c} className="top16__row">
                <span className={'top16__bar' + (c === p.label ? ' is-true' : '')} style={{ width: `${Math.max(1.5, v * 100)}%` }} />
                <span className="top16__name">{c}</span>
              </span>
            ))}
          </button>
        ))}
      </div>
      <div className="controls">
        {cur ? (
          <span className={'verdict ' + (rank(cur) === 0 ? 'verdict--good' : rank(cur) > 0 ? 'verdict--info' : 'verdict--bad')}>
            {rank(cur) === 0
              ? `«${cur.label}»: la classe corretta è la prima predizione.`
              : rank(cur) > 0
                ? `«${cur.label}»: la classe corretta è tra le cinque predizioni, ma non la prima.`
                : `«${cur.label}»: la classe corretta non è tra le cinque predizioni più probabili.`}
          </span>
        ) : (
          <p className="wnote">Sopra ogni riquadro c’è la classe corretta dell’immagine; sotto, le cinque classi che la rete ritiene più probabili. Clicca un riquadro.</p>
        )}
      </div>
      <Tasks items={[{ label: 'Trova l’immagine per cui la classe corretta non compare tra le cinque predizioni.', done: wrong }]} />
    </div>
  )
}
