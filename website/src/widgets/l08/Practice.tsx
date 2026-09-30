import { useState } from 'react'
import { Axes, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Toggle } from '../../components/ui/Controls'
import { lessonHref } from '../../lib/router'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { trainer, useTrainer, type Run } from './mlp'

/* ------------------------------------------------------------------ Fig. 8.1 */

type MapNode = {
  id: string
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  lesson?: string
  sec?: string
  done?: boolean
  here?: boolean
  info: string
}
const NODES: MapNode[] = [
  {
    id: 'perc',
    x: 80,
    y: 30,
    w: 120,
    h: 34,
    lines: ['Perceptron'],
    lesson: '06',
    sec: 'il-perceptron',
    done: true,
    info: 'Il Perceptron di Rosenblatt: l’unità a soglia, una sola unità.',
  },
  {
    id: 'adal',
    x: 240,
    y: 30,
    w: 100,
    h: 34,
    lines: ['Adaline'],
    lesson: '06',
    sec: 'apprendimento-per-una-singola-unità',
    done: true,
    info: 'Adaline: unità lineare durante il training, addestrata con LMS.',
  },
  {
    id: 'lms',
    x: 330,
    y: 74,
    w: 84,
    h: 30,
    lines: ['LMS'],
    lesson: '05',
    sec: 'il-problema-di-apprendimento',
    done: true,
    info: 'LMS: il modello lineare delle lezioni precedenti.',
  },
  {
    id: 'mp',
    x: 18,
    y: 136,
    w: 100,
    h: 58,
    lines: ['MLP:', 'McCulloch', 'e Pitts'],
    lesson: '06',
    sec: 'le-reti-di-mcculloch-e-pitts-1943',
    done: true,
    info: 'Le reti di McCulloch e Pitts: reti di perceptron che rappresentano funzioni booleane.',
  },
  {
    id: 'plearn',
    x: 132,
    y: 136,
    w: 124,
    h: 86,
    lines: ['Apprendimento:', 'algoritmo del', 'Perceptron e', 'teorema di', 'convergenza'],
    lesson: '06',
    sec: 'lalgoritmo-di-apprendimento-del-perceptron',
    done: true,
    info: 'L’algoritmo del Perceptron e il teorema di convergenza.',
  },
  {
    id: 'nonlin',
    x: 272,
    y: 136,
    w: 104,
    h: 44,
    lines: ['Uscita non', 'lineare (f)'],
    lesson: '06',
    sec: 'funzioni-di-attivazione-sigmoidali',
    done: true,
    info: 'Funzioni di attivazione sigmoidali: la soglia diventa differenziabile.',
  },
  {
    id: 'mlp',
    x: 272,
    y: 200,
    w: 104,
    h: 62,
    lines: ['MLP:', 'rete', 'feedforward'],
    lesson: '06',
    sec: 'le-reti-neurali-il-multi-layer-perceptron',
    done: true,
    info: 'Il Multi-Layer Perceptron.',
  },
  {
    id: 'bp',
    x: 408,
    y: 136,
    w: 130,
    h: 44,
    lines: ['Apprendimento:', 'backprop'],
    lesson: '07',
    done: true,
    info: 'La backpropagation: il gradiente per ogni peso della rete.',
  },
  {
    id: 'heur',
    x: 418,
    y: 208,
    w: 110,
    h: 44,
    lines: ['Euristiche', 'per la BP'],
    lesson: '08',
    here: true,
    info: 'Questa lezione: le questioni pratiche dell’addestramento.',
  },
  {
    id: 'cc',
    x: 574,
    y: 144,
    w: 100,
    h: 30,
    lines: ['CasCor'],
    lesson: '08',
    sec: 'cascade-correlation',
    info: 'Il Cascade Correlation: un approccio costruttivo, più avanti in questa lezione.',
  },
  {
    id: 'reg',
    x: 560,
    y: 262,
    w: 124,
    h: 30,
    lines: ['Regolarizzazione'],
    lesson: '08',
    sec: 'regolarizzazione-',
    info: 'La regolarizzazione, più avanti in questa lezione.',
  },
  {
    id: 'cnn',
    x: 250,
    y: 306,
    w: 118,
    h: 44,
    lines: ['Applicazioni:', 'esempio CNN'],
    lesson: '16',
    info: 'Le reti convoluzionali (lezione 16).',
  },
  {
    id: 'deep',
    x: 404,
    y: 296,
    w: 138,
    h: 58,
    lines: ['Introduzione ai', 'paradigmi recenti', '(deep, random)'],
    lesson: '17',
    info: 'Deep learning e reti randomizzate (lezioni 17 e 18), dopo la validazione e le SVM.',
  },
]
const EDGES: [string, string][] = [
  ['perc', 'mp'],
  ['perc', 'plearn'],
  ['adal', 'lms'],
  ['adal', 'nonlin'],
  ['lms', 'bp'],
  ['nonlin', 'mlp'],
  ['mlp', 'bp'],
  ['nonlin', 'bp'],
  ['bp', 'heur'],
  ['bp', 'cc'],
  ['heur', 'reg'],
  ['mlp', 'cnn'],
  ['mlp', 'deep'],
  ['heur', 'deep'],
]

export function CourseZoom() {
  const [sel, setSel] = useState('heur')
  const node = NODES.find((n) => n.id === sel)!
  const byId = new Map(NODES.map((n) => [n.id, n]))
  const [clicked, setClicked] = useState(0)
  const seen = useLatch({ two: clicked >= 2 })
  const pick = (id: string) => {
    setSel(id)
    setClicked((c) => c + 1)
  }
  return (
    <div>
      <div className="zoom8__scroll">
        <svg viewBox="0 0 700 370" className="zoom8" role="img" aria-label="Mappa della parte del corso sulle reti neurali">
          <defs>
            <marker
              id="zoom8-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0,0L10,5L0,10Z" className="zoom8__head" />
            </marker>
          </defs>
          <rect x={8} y={14} width={420} height={96} rx={12} className="zoom8__area" />
          <text x={18} y={102} className="zoom8__area-lbl">
            una unità
          </text>
          <rect x={8} y={118} width={684} height={246} rx={12} className="zoom8__area" />
          <text x={684} y={136} textAnchor="end" className="zoom8__area-lbl">
            reti neurali
          </text>
          {EDGES.map(([a, b]) => {
            const A = byId.get(a)!
            const B = byId.get(b)!
            const x1 = A.x + A.w / 2
            const y1 = A.y + A.h
            const x2 = B.x + B.w / 2
            const y2 = B.y
            const horiz = Math.abs(A.y - B.y) < 40
            return (
              <line
                key={a + b}
                x1={horiz ? A.x + A.w : x1}
                y1={horiz ? A.y + A.h / 2 : y1}
                x2={horiz ? B.x : x2}
                y2={horiz ? B.y + B.h / 2 : y2}
                className="zoom8__edge"
                markerEnd="url(#zoom8-arrow)"
              />
            )
          })}
          {NODES.map((n) => (
            <g
              key={n.id}
              className={`zoom8__node${n.id === sel ? ' is-sel' : ''}${n.here ? ' is-here' : ''}${n.done ? ' is-done' : ''}`}
              onClick={() => pick(n.id)}
              role="button"
              tabIndex={0}
              aria-label={n.lines.join(' ')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(n.id)}
            >
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} />
              {n.lines.map((l, i) => (
                <text key={i} x={n.x + n.w / 2} y={n.y + n.h / 2 + (i - (n.lines.length - 1) / 2) * 14 + 4} textAnchor="middle">
                  {l}
                </text>
              ))}
              {n.done && (
                <g transform={`translate(${n.x + n.w} ${n.y})`}>
                  <circle r={8} className="zoom8__badge" />
                  <path d="M-3.5,0l2.5,2.5l4.5,-5" className="zoom8__check" />
                </g>
              )}
            </g>
          ))}
          <text x={534} y={235} className="zoom8__here">
            ← siamo qui
          </text>
        </svg>
      </div>
      <div className="zoom8__info">
        <span>{node.info}</span>
        {node.lesson && (
          <a className="chip chip--link" href={lessonHref(node.lesson, node.sec)}>
            vai alla lezione {node.lesson}
          </a>
        )}
      </div>
      <Tasks
        items={[
          { label: 'Clicca un paio di blocchi: la spunta indica gli argomenti già visti, ognuno porta alla sua sezione.', done: seen.two },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ MONK (8.11–8.13) */

/**
 * I dati sono generati dalle regole ufficiali del benchmark (UCI):
 * 6 attributi con 2, 3 o 4 valori (432 combinazioni); MONK-2: esattamente due attributi valgono 1;
 * MONK-3: (a5 = 3 e a4 = 1) oppure (a5 ≠ 4 e a2 ≠ 3), con il 5% di etichette di training sbagliate.
 * Training di 169 (MONK-2) e 122 (MONK-3) esempi estratti; il test è l'intero insieme di 432.
 */
const VALS = [3, 3, 2, 3, 4, 2]
const ALL: number[][] = []
for (let a = 1; a <= 3; a++)
  for (let b = 1; b <= 3; b++)
    for (let c = 1; c <= 2; c++)
      for (let d = 1; d <= 3; d++) for (let e = 1; e <= 4; e++) for (let f = 1; f <= 2; f++) ALL.push([a, b, c, d, e, f])
const oneHot = (a: number[]) => a.flatMap((v, i) => Array.from({ length: VALS[i] }, (_, k) => (v === k + 1 ? 1 : 0)))
const raw = (a: number[]) => a.map((v, i) => (v - 1) / (VALS[i] - 1))
const m2 = (a: number[]) => (a.filter((v) => v === 1).length === 2 ? 1 : 0)
const m3 = (a: number[]) => ((a[4] === 3 && a[3] === 1) || (a[4] !== 4 && a[1] !== 3) ? 1 : 0)

function split(n: number, noise: number, seed: number, rule: (a: number[]) => number) {
  const r = rng(seed)
  const idx = ALL.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  const tr = idx.slice(0, n)
  const flip = new Set(tr.slice(0, noise))
  return { tr, y: tr.map((i) => (flip.has(i) ? 1 - rule(ALL[i]) : rule(ALL[i]))) }
}
const S2 = split(169, 0, 22, m2)
const S3 = split(122, 6, 33, m3)
const data = (s: { tr: number[]; y: number[] }, rule: (a: number[]) => number, enc: (a: number[]) => number[]) => ({
  X: s.tr.map((i) => enc(ALL[i])),
  Y: s.y.map((v) => [v]),
  Xv: ALL.map(enc),
  Yv: ALL.map((a) => [rule(a)]),
})
const monk2 = trainer({ ...data(S2, m2, oneHot), H: 2, eta: 0.1, alpha: 0.5, lambda: 0, out: 'sig', seed: 1, init: 0.3 }, 6000, 20, true)
const monk3 = trainer({ ...data(S3, m3, oneHot), H: 4, eta: 0.1, alpha: 0.5, lambda: 1e-4, out: 'sig', seed: 1, init: 0.3 }, 8000, 20, true)

function Curves({ run, kind, yMax }: { run: Run; kind: 'mse' | 'acc'; yMax: number }) {
  const rows = kind === 'mse' ? run.hist : (run.acc ?? [])
  const yMin = kind === 'mse' ? 0 : 0.5
  const total = run.total
  return (
    <Plot xDomain={[0, total]} yDomain={[yMin, yMax]} aspect={0.5} margin={{ l: 46, b: 40 }}>
      <Axes
        xTicks={5}
        xFormat={(v) => v.toLocaleString('it-IT')}
        yTicks={kind === 'mse' ? 5 : [0.5, 0.6, 0.7, 0.8, 0.9, 1]}
        yFormat={(v) => (kind === 'mse' ? fmt(v, 2) : fmt(v * 100, 0) + '%')}
        xLabel="epoche"
        yLabel={kind === 'mse' ? 'MSE' : 'accuratezza'}
      />
      <Polyline pts={rows.map((r) => ({ x: r[0], y: Math.min(yMax, r[1]) }))} color="var(--c-blue)" width={2.2} />
      <Polyline pts={rows.map((r) => ({ x: r[0], y: Math.min(yMax, r[2]) }))} color="var(--c-orange)" width={2.2} dash="6 4" />
    </Plot>
  )
}

const last = <T,>(a: T[] | undefined) => (a && a.length ? a[a.length - 1] : undefined)
function Prog({ run }: { run: Run }) {
  return run.done < run.total ? <span className="l8__prog">addestramento: epoca {run.done.toLocaleString('it-IT')}</span> : null
}

export function Monk2Mse() {
  const run = useTrainer(monk2)
  const [H, setH] = useState(2)
  const [enc, setEnc] = useState(true)
  const [seed, setSeed] = useState(1)
  const restart = (p: { H?: number; enc?: boolean; seed?: number }) => {
    const e = p.enc ?? enc
    monk2.restart({ ...data(S2, m2, e ? oneHot : raw), H: p.H ?? H, seed: p.seed ?? seed })
  }
  const a = last(run.acc)
  const seen = useLatch({ raw: !enc && run.done === run.total, seed: seed > 1 && run.done === run.total })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'MSE di training', color: 'var(--c-blue)' },
            { label: 'MSE di test', color: 'var(--c-orange)', kind: 'dash' },
          ]}
        />
        <Prog run={run} />
      </div>
      <Curves run={run} kind="mse" yMax={0.26} />
      <div className="controls">
        <Segmented
          label="unità nascoste"
          size="sm"
          value={H}
          onChange={(v) => {
            setH(v)
            restart({ H: v })
          }}
          options={[1, 2, 3, 5].map((v) => ({ value: v, label: String(v) }))}
        />
        <Toggle
          label="codifica one-hot degli input (17 unità)"
          checked={enc}
          onChange={(v) => {
            setEnc(v)
            restart({ enc: v })
          }}
        />
        <Btn
          icon="reset"
          onClick={() => {
            setSeed(seed + 1)
            restart({ seed: seed + 1 })
          }}
        >
          Altra inizializzazione
        </Btn>
      </div>
      <div className="readouts">
        <Readout label="accuratezza di training" tone="blue" value={a ? fmt(a[1] * 100, 1) + '%' : '—'} />
        <Readout label="accuratezza di test" tone="orange" value={a ? fmt(a[2] * 100, 1) + '%' : '—'} />
        <Readout
          label="impostazioni"
          value={<Tex>{'\\eta = 0{,}1,\\ \\alpha = 0{,}5'}</Tex>}
          sub="batch, gradiente diviso per il numero di pattern"
        />
      </div>
      <Tasks
        items={[
          { label: 'Togli la codifica one-hot (6 input numerici): la rete non arriva più al 100%.', done: seen.raw },
          { label: 'Prova un’altra inizializzazione: con così poche unità il percorso cambia.', done: seen.seed },
        ]}
      />
    </div>
  )
}

export function Monk2Acc() {
  const run = useTrainer(monk2)
  const a = last(run.acc)
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'accuratezza di training', color: 'var(--c-blue)' },
            { label: 'accuratezza di test', color: 'var(--c-orange)', kind: 'dash' },
          ]}
        />
        <Prog run={run} />
      </div>
      <Curves run={run} kind="acc" yMax={1.02} />
      <div className="readouts">
        <Readout label="training" tone="blue" value={a ? fmt(a[1] * 100, 1) + '%' : '—'} />
        <Readout label="test" tone="orange" value={a ? fmt(a[2] * 100, 1) + '%' : '—'} />
      </div>
      <p className="wnote">Stessa rete della figura 8.11: le impostazioni scelte lì valgono anche qui.</p>
    </div>
  )
}

const LAMS = [0, 1e-4, 3e-4, 1e-3]

export function Monk3() {
  const run = useTrainer(monk3)
  const [lam, setLam] = useState(1e-4)
  const a = last(run.acc)
  const h = run.hist
  const iMin = h.reduce((b, r, i) => (r[2] < h[b][2] ? i : b), 0)
  const seen = useLatch({ zero: lam === 0 && run.done === run.total, big: lam >= 1e-3 && run.done === run.total })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'MSE di training', color: 'var(--c-blue)' },
            { label: 'MSE di test', color: 'var(--c-orange)', kind: 'dash' },
          ]}
        />
        <Prog run={run} />
      </div>
      <Curves run={run} kind="mse" yMax={0.16} />
      <div className="controls">
        <Segmented
          label="λ (weight decay a ogni epoca)"
          size="sm"
          value={lam}
          onChange={(v) => {
            setLam(v)
            monk3.restart({ lambda: v })
          }}
          options={LAMS.map((v, i) => ({ value: v, label: <Tex>{['0', '10^{-4}', '3 \\cdot 10^{-4}', '10^{-3}'][i]}</Tex> }))}
        />
      </div>
      <div className="readouts">
        <Readout label="accuratezza di training" tone="blue" value={a ? fmt(a[1] * 100, 1) + '%' : '—'} />
        <Readout label="accuratezza di test" tone="orange" value={a ? fmt(a[2] * 100, 1) + '%' : '—'} />
        <Readout
          label="minimo del test"
          value={`epoca ${h[iMin][0].toLocaleString('it-IT')}`}
          sub={`MSE ${fmt(h[iMin][2], 3)}, alla fine ${fmt(h[h.length - 1][2], 3)}`}
        />
      </div>
      <Tasks
        items={[
          { label: 'Togli la regolarizzazione (λ = 0) e confronta la parte finale delle due curve.', done: seen.zero },
          {
            label: (
              <>
                Prova <Tex>{'\\lambda = 10^{-3}'}</Tex>: la rete non scende più sul training (underfitting).
              </>
            ),
            done: seen.big,
          },
        ]}
      />
    </div>
  )
}
