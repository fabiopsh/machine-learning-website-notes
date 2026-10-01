import { useEffect, useMemo, useState } from 'react'
import { getLesson } from '../../content/lessons'
import { lessonHref } from '../../lib/router'
import { Btn } from '../../components/ui/Controls'
import { Icon } from '../../components/ui/Icon'
import { tx } from '../../lib/i18n'

/**
 * La mappa del corso (Fig. 1.2) ricostruita: i nodi si esplorano al passaggio,
 * "Percorri" la attraversa nell'ordine approssimativo delle lezioni.
 */

type Node = {
  id: string
  label: string[]
  x: number
  y: number
  w: number
  h: number
  order?: number
  struck?: boolean
  desc: string
  lessons: string[]
}

const NODES: Node[] = [
  {
    id: 'intro',
    label: ['INTRO'],
    x: 495,
    y: 40,
    w: 200,
    h: 46,
    order: 1,
    desc: tx(
      'Introduzione: dati, task, modello, algoritmo di apprendimento, validazione — nel quadro dell’approssimazione di funzioni.',
      'Introduction: data, task, model, learning algorithm, validation — within the framework of function approximation.',
    ),
    lessons: ['01', '03', '04'],
  },
  {
    id: 'concept',
    label: ['Concept', 'learning'],
    x: 120,
    y: 214,
    w: 176,
    h: 62,
    order: 2,
    struck: true,
    desc: tx(
      'Concept learning e bias induttivo (spazio delle ipotesi discreto). Nella mappa è barrato: del concept learning si tiene ciò che serve a introdurre il bias induttivo.',
      'Concept learning and inductive bias (discrete hypothesis space). It is struck through in the map: of concept learning, only what is needed to introduce the inductive bias is kept.',
    ),
    lessons: ['03'],
  },
  {
    id: 'indbias',
    label: ['Ind. Bias'],
    x: 120,
    y: 330,
    w: 160,
    h: 44,
    order: 2,
    desc: tx(
      'Il bias induttivo: le assunzioni senza le quali non c’è generalizzazione. Fa parte della teoria.',
      'The inductive bias: the assumptions without which there is no generalization. It is part of the theory.',
    ),
    lessons: ['03'],
  },
  {
    id: 'linear',
    label: ['Linear', 'models', '(LTU-LMS)'],
    x: 385,
    y: 250,
    w: 168,
    h: 106,
    order: 3,
    desc: tx(
      'Modelli lineari (LTU, LMS): spazio delle ipotesi continuo. Sono il “mattone” da cui si costruiscono le reti neurali.',
      'Linear models (LTU, LMS): continuous hypothesis space. They are the “building block” from which neural networks are built.',
    ),
    lessons: ['05'],
  },
  {
    id: 'knn',
    label: ['K-nn'],
    x: 600,
    y: 224,
    w: 150,
    h: 54,
    order: 4,
    desc: tx('K-nearest neighbors: un modello basato sulla memoria.', 'K-nearest neighbors: a memory-based model.'),
    lessons: ['05'],
  },
  {
    id: 'nn',
    label: ['Neural Networks'],
    x: 445,
    y: 458,
    w: 370,
    h: 54,
    order: 5,
    desc: tx(
      'Reti neurali: il cuore denso e consequenziale del corso, costruite a partire dai modelli lineari.',
      'Neural networks: the dense and consequential heart of the course, built from linear models.',
    ),
    lessons: ['06', '07', '08'],
  },
  {
    id: 'som',
    label: ['SOM'],
    x: 770,
    y: 318,
    w: 130,
    h: 48,
    order: 11,
    desc: tx('Self-Organizing Map (in estensione, dopo il Deep Learning).', 'Self-Organizing Map (as an extension, after Deep Learning).'),
    lessons: ['19'],
  },
  {
    id: 'rnn',
    label: ['RNN'],
    x: 770,
    y: 388,
    w: 130,
    h: 48,
    order: 12,
    desc: tx(
      'Reti neurali ricorrenti (in estensione, dopo il Deep Learning).',
      'Recurrent neural networks (as an extension, after Deep Learning).',
    ),
    lessons: ['20'],
  },
  {
    id: 'deep',
    label: ['Deep L.'],
    x: 780,
    y: 458,
    w: 150,
    h: 48,
    order: 10,
    desc: tx('Deep Learning (e, in estensione, SOM e RNN).', 'Deep Learning (and, as extensions, SOM and RNN).'),
    lessons: ['16', '17', '18'],
  },
  {
    id: 'bayes',
    label: ['Bayesian Networks'],
    x: 1105,
    y: 458,
    w: 250,
    h: 48,
    order: 13,
    struck: true,
    desc: tx(
      'Reti bayesiane: il ramo probabilistico, rimosso dal programma.',
      'Bayesian networks: the probabilistic branch, removed from the syllabus.',
    ),
    lessons: [],
  },
  {
    id: 'valid',
    label: ['Validation & SLT'],
    x: 445,
    y: 563,
    w: 350,
    h: 54,
    order: 6,
    desc: tx(
      'Validazione e Statistical Learning Theory: come stimare e controllare la generalizzazione.',
      'Validation and Statistical Learning Theory: how to estimate and control generalization.',
    ),
    lessons: ['04', '09', '10', '11', '12'],
  },
  {
    id: 'biasvar',
    label: ['Bias/Variance'],
    x: 815,
    y: 563,
    w: 240,
    h: 48,
    order: 9,
    desc: tx('La decomposizione bias/varianza (parte teorica).', 'The bias/variance decomposition (theoretical part).'),
    lessons: ['15'],
  },
  {
    id: 'svm',
    label: ['SVM'],
    x: 445,
    y: 662,
    w: 150,
    h: 50,
    order: 7,
    desc: tx(
      'Support Vector Machines: nascono dalla SLT e controllano direttamente la complessità.',
      'Support Vector Machines: they stem from SLT and control complexity directly.',
    ),
    lessons: ['13', '14'],
  },
  {
    id: 'apps',
    label: ['Applications/Project'],
    x: 490,
    y: 760,
    w: 330,
    h: 54,
    order: 8,
    desc: tx(
      'Applicazioni e progetto: un sistema di ML completo si costruisce con le tecniche di validazione.',
      'Applications and project: a complete ML system is built with validation techniques.',
    ),
    lessons: [],
  },
  {
    id: 'advanced',
    label: ['Advanced topics'],
    x: 890,
    y: 760,
    w: 290,
    h: 54,
    order: 14,
    desc: tx('Argomenti avanzati: apprendimento su dati strutturati.', 'Advanced topics: learning on structured data.'),
    lessons: ['21'],
  },
]

type Edge = {
  from: string
  to: string
  d: string
  kind?: 'main' | 'thin' | 'dash'
  noArrow?: boolean
  label?: { x: number; y: number; text: string }
}

const EDGES: Edge[] = [
  { from: 'intro', to: 'concept', d: 'M495,63 V95 H120 V181', label: { x: 128, y: 86, text: tx('H discreto', 'Discrete H') } },
  { from: 'intro', to: 'linear', d: 'M495,95 L410,194', kind: 'main', label: { x: 350, y: 128, text: tx('H continuo', 'Continuous H') } },
  { from: 'intro', to: 'knn', d: 'M495,95 L585,195' },
  { from: 'intro', to: 'bayes', d: 'M495,95 H1105 V432', label: { x: 1098, y: 86, text: tx('Probabilistico', 'Probabilistic') } },
  { from: 'intro', to: 'indbias', d: 'M394,40 C 260,40 180,140 150,306', kind: 'dash' },
  { from: 'linear', to: 'nn', d: 'M430,304 V429', kind: 'main' },
  { from: 'linear', to: 'svm', d: 'M340,304 V398 H225 V662 H368', kind: 'thin' },
  { from: 'knn', to: 'nn', d: 'M600,252 V429' },
  { from: 'nn', to: 'som', d: 'M631,458 H675 V318 H703' },
  { from: 'nn', to: 'rnn', d: 'M675,388 H703' },
  { from: 'nn', to: 'deep', d: 'M675,458 H703' },
  { from: 'nn', to: 'valid', d: 'M445,486 V534', kind: 'main' },
  { from: 'valid', to: 'svm', d: 'M445,591 V635', kind: 'main' },
  { from: 'svm', to: 'apps', d: 'M445,688 V731' },
  { from: 'nn', to: 'apps', d: 'M259,458 H250 V760 H323', kind: 'main' },
  { from: 'valid', to: 'apps', d: 'M269,563 H250', kind: 'main', noArrow: true },
  { from: 'ext', to: 'nn', d: 'M1090,640 C 900,590 700,520 632,480', kind: 'dash' },
  { from: 'ext', to: 'deep', d: 'M1110,610 C 1000,540 900,500 858,478', kind: 'dash' },
  { from: 'ext', to: 'advanced', d: 'M1120,700 C 1100,740 1070,760 1037,760', kind: 'dash' },
]

const PATH_ORDER = ['intro', 'concept', 'indbias', 'linear', 'knn', 'nn', 'valid', 'svm', 'apps', 'biasvar', 'deep', 'som', 'rnn', 'bayes', 'advanced']

function linked(id: string) {
  const s = new Set<string>()
  for (const e of EDGES) {
    if (e.from === id) s.add(e.to)
    if (e.to === id) s.add(e.from)
  }
  return s
}

export function CourseMap() {
  const [hover, setHover] = useState<string | null>(null)
  const [sel, setSel] = useState<string>('intro')
  const [playing, setPlaying] = useState(false)
  const active = hover ?? sel
  const node = NODES.find((n) => n.id === active)
  const near = useMemo(() => linked(active), [active])

  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setSel((cur) => {
        const i = PATH_ORDER.indexOf(cur)
        if (i === PATH_ORDER.length - 1) {
          setPlaying(false)
          return cur
        }
        return PATH_ORDER[i + 1]
      })
    }, 1500)
    return () => window.clearInterval(t)
  }, [playing])

  const edgeState = (e: Edge) => (e.from === active || e.to === active ? ' is-hot' : active && active !== 'ext' ? ' is-dim' : '')

  return (
    <div className="cmap">
      <div className="cmap__scroll">
        <svg viewBox="0 0 1250 800" className="cmap__svg" role="group" aria-label={tx('Mappa del corso', 'Course map')}>
          <defs>
            <marker id="cm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="cmap__arrowhead" />
            </marker>
            <marker id="cm-arr-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="cmap__arrowhead cmap__arrowhead--hot" />
            </marker>
          </defs>

          {/* area "Theory" */}
          <path className="cmap__theory" d="M22,298 H236 V520 H1000 V620 H22 Z" />
          <text className="cmap__theory-label" x={36} y={606}>
            {tx('Teoria', 'Theory')}
          </text>

          {EDGES.map((e, i) => (
            <path
              key={i}
              d={e.d}
              className={`cmap__edge cmap__edge--${e.kind ?? 'normal'}${edgeState(e)}`}
              markerEnd={e.noArrow ? undefined : `url(#${edgeState(e) === ' is-hot' ? 'cm-arr-hot' : 'cm-arr'})`}
            />
          ))}
          {EDGES.filter((e) => e.label).map((e, i) => (
            <text key={i} className="cmap__elabel" x={e.label!.x} y={e.label!.y} textAnchor={e.label!.text === tx('Probabilistico', 'Probabilistic') ? 'end' : 'start'}>
              {e.label!.text}
            </text>
          ))}

          {/* "Extended" */}
          <g
            className={`cmap__ext${active === 'ext' ? ' is-active' : ''}`}
            onMouseEnter={() => setHover('ext')}
            onMouseLeave={() => setHover(null)}
          >
            <path d={starPath(1150, 660, 104, 70, 11)} />
            <text x={1150} y={666} textAnchor="middle">
              Extended
            </text>
          </g>

          {NODES.map((n) => {
            const isActive = n.id === active
            const isNear = near.has(n.id)
            const avail = n.lessons.some((l) => getLesson(l)?.load)
            return (
              <g
                key={n.id}
                className={`cmap__node${isActive ? ' is-active' : ''}${isNear ? ' is-near' : ''}${n.struck ? ' is-struck' : ''}${avail ? ' is-avail' : ''}`}
                transform={`translate(${n.x - n.w / 2} ${n.y - n.h / 2})`}
                tabIndex={0}
                role="button"
                aria-label={`${n.label.join(' ')}${n.order ? tx(`, ordine ${n.order}`, `, order ${n.order}`) : ''}`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setSel(n.id)}
                onClick={() => {
                  setPlaying(false)
                  setSel(n.id)
                }}
              >
                <rect width={n.w} height={n.h} rx={10} />
                {n.label.map((line, i) => (
                  <text
                    key={i}
                    x={n.w / 2}
                    y={n.h / 2 + (i - (n.label.length - 1) / 2) * 26 + 8}
                    textAnchor="middle"
                    className={i === 2 ? 'cmap__small' : undefined}
                  >
                    {line}
                  </text>
                ))}
                {n.struck && <line x1={8} y1={n.h - 8} x2={n.w - 8} y2={8} className="cmap__strike" />}
                {n.order && (
                  <g transform={`translate(${n.w} 0)`}>
                    <circle r={15} className="cmap__badge" />
                    <text y={5} textAnchor="middle" className="cmap__badge-num">
                      {n.order}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="cmap__info" aria-live="polite">
        {node ? (
          <>
            <div className="cmap__info-head">
              {node.order && <span className="cmap__info-num">{node.order}</span>}
              <span className="cmap__info-title">{node.label.join(' ')}</span>
            </div>
            <p>{node.desc}</p>
            {node.lessons.length > 0 && (
              <div className="cmap__lessons">
                {node.lessons.map((id) => {
                  const l = getLesson(id)
                  if (!l) return null
                  return l.load ? (
                    <a key={id} href={lessonHref(id)} className="chip chip--link">
                      <span className="chip__num">{id}</span> {l.title} <Icon name="arrowRight" size={13} />
                    </a>
                  ) : (
                    <span key={id} className="chip chip--muted" title={tx('In preparazione', 'Coming soon')}>
                      <span className="chip__num">{id}</span> {l.title}
                    </span>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="cmap__info-head">
              <span className="cmap__info-title">Extended</span>
            </div>
            <p>
              {tx(
                'Le estensioni del nucleo: collegano le reti neurali al Deep Learning e agli argomenti avanzati.',
                'The extensions of the core: they connect neural networks to Deep Learning and to the advanced topics.',
              )}
            </p>
          </>
        )}
        <div className="cmap__actions">
          <Btn
            icon={playing ? 'pause' : 'play'}
            variant="soft"
            onClick={() => {
              if (!playing && sel === PATH_ORDER[PATH_ORDER.length - 1]) setSel('intro')
              setPlaying((p) => !p)
            }}
          >
            {playing ? tx('Pausa', 'Pause') : tx('Percorri la mappa', 'Walk through the map')}
          </Btn>
        </div>
      </div>
    </div>
  )
}

function starPath(cx: number, cy: number, rx: number, ry: number, spikes: number) {
  let d = ''
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes - Math.PI / 2
    const k = i % 2 === 0 ? 1 : 0.72
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`
  }
  return d + 'Z'
}
