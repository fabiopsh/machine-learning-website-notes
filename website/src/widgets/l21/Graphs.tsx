import { useState, type CSSProperties } from 'react'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

type XY = [number, number]
type G = { n: XY[]; e: [number, number][] }

/* ------------------------------------------------------------------ Fig. 21.1: esempi di grafi */

function Mini({ g }: { g: G }) {
  return (
    <svg viewBox="0 0 100 64" className="ex21__g" aria-hidden="true">
      {g.e.map(([a, b], i) => (
        <line key={i} x1={g.n[a][0]} y1={g.n[a][1]} x2={g.n[b][0]} y2={g.n[b][1]} />
      ))}
      {g.n.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4.2} />
      ))}
    </svg>
  )
}

const hexa = (cx: number, cy: number, r: number): XY[] =>
  Array.from({ length: 6 }, (_, i) => [cx + r * Math.cos((i * Math.PI) / 3), cy + r * Math.sin((i * Math.PI) / 3)])

const EXAMPLES: { name: string; nodes: string; edges: string; g: G }[] = [
  {
    name: tx('Astrazioni di immagini', 'Image abstractions'),
    nodes: tx('parti dell’immagine', 'parts of the image'),
    edges: tx('relazioni tra le parti', 'relations between the parts'),
    g: { n: [[50, 8], [30, 28], [70, 28], [18, 52], [40, 52], [62, 52], [84, 52]], e: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]] },
  },
  {
    name: tx('Reti per la comprensione di scene', 'Networks for scene understanding'),
    nodes: tx('oggetti e attributi della scena', 'objects and attributes of the scene'),
    edges: tx('relazioni tra oggetti', 'relations between objects'),
    g: { n: [[14, 14], [50, 10], [86, 16], [28, 44], [64, 40], [88, 54], [44, 58]], e: [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [4, 5], [3, 6], [2, 4]] },
  },
  {
    name: 'Social network',
    nodes: tx('persone', 'people'),
    edges: tx('relazioni (amico, collega, familiare…)', 'relations (friend, colleague, family member…)'),
    g: { n: [[12, 32], [38, 14], [38, 50], [66, 8], [66, 28], [66, 46], [90, 20], [90, 54]], e: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6], [5, 7], [2, 4]] },
  },
  {
    name: tx('Reti di trasporto', 'Transportation networks'),
    nodes: tx('tratti di strada', 'road segments'),
    edges: tx(
      'collegamenti tra i tratti (es. la previsione del traffico su Google Maps, di DeepMind)',
      'connections between the segments (e.g. traffic prediction on Google Maps, by DeepMind)',
    ),
    g: { n: [[10, 14], [40, 14], [70, 14], [92, 14], [10, 46], [40, 46], [70, 46], [92, 50]], e: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5], [2, 6], [0, 4]] },
  },
  {
    name: tx('Piccole molecole (drug design)', 'Small molecules (drug design)'),
    nodes: tx('atomi', 'atoms'),
    edges: tx('legami chimici', 'chemical bonds'),
    g: { n: [...hexa(40, 32, 17), [76, 32], [90, 16], [90, 48]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [6, 8]] },
  },
  {
    name: tx('Reti biologiche (proteine)', 'Biological networks (proteins)'),
    nodes: tx('proteine', 'proteins'),
    edges: tx('interazioni', 'interactions'),
    g: {
      n: [[50, 8], [20, 20], [80, 20], [12, 46], [50, 34], [88, 46], [34, 58], [68, 58]],
      e: [[0, 1], [0, 2], [0, 4], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [3, 6], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [1, 2]],
    },
  },
  {
    name: tx('Analisi sintattica del linguaggio', 'Syntactic analysis of language'),
    nodes: tx('costituenti e parole della frase', 'constituents and words of the sentence'),
    edges: tx('la struttura dell’albero di parsing', 'the structure of the parse tree'),
    g: { n: [[50, 6], [26, 22], [70, 22], [12, 42], [34, 42], [58, 42], [84, 42], [48, 58], [70, 58]], e: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [5, 7], [5, 8]] },
  },
  {
    name: tx('Termini logici', 'Logical terms'),
    nodes: tx('simboli del termine', 'symbols of the term'),
    edges: tx('gli argomenti di ogni simbolo', 'the arguments of each symbol'),
    g: { n: [[50, 8], [28, 28], [72, 28], [50, 44], [16, 54], [84, 50], [38, 58]], e: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 5], [1, 6], [2, 6]] },
  },
  {
    name: 'Knowledge graph',
    nodes: tx('entità (persone, opere, luoghi…)', 'entities (people, works, places…)'),
    edges: tx('relazioni con un nome (ha dipinto, si trova a…)', 'named relations (painted, is located in…)'),
    g: { n: [[14, 12], [48, 26], [84, 10], [20, 52], [58, 56], [90, 44]], e: [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [4, 5], [3, 4]] },
  },
  {
    name: tx('Modellazione di reti cerebrali', 'Modeling of brain networks'),
    nodes: tx('aree del cervello', 'areas of the brain'),
    edges: tx('connessioni tra le aree', 'connections between the areas'),
    g: { n: [[22, 24], [44, 12], [70, 14], [88, 32], [30, 46], [56, 34], [74, 52]], e: [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [4, 5], [5, 6], [3, 6], [3, 5]] },
  },
]

export function GraphExamples() {
  const [sel, setSel] = useState(4)
  const [n, setN] = useState(0)
  const ex = EXAMPLES[sel]
  return (
    <div>
      <div className="ex21">
        {EXAMPLES.map((e, i) => (
          <button
            key={e.name}
            type="button"
            className={'ex21__card' + (i === sel ? ' is-on' : '')}
            aria-pressed={i === sel}
            onClick={() => {
              setSel(i)
              setN(n + 1)
            }}
          >
            <Mini g={e.g} />
            <span>{e.name}</span>
          </button>
        ))}
      </div>
      <div className="wpanel">
        <div className="wpanel__title">{ex.name}</div>
        {tx(`Nodi: ${ex.nodes}. Archi: ${ex.edges}.`, `Nodes: ${ex.nodes}. Edges: ${ex.edges}.`)}
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca alcuni esempi: in ognuno i dati non sono elementi isolati, ma elementi con relazioni.',
              'Click a few examples: in each one the data are not isolated elements, but elements with relations.',
            ),
            done: n >= 3,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.2: lo scenario */

type Row = { id: string; title: string; opts: { id: string; label: string; sub: string; focus?: boolean; text: string }[] }
const ROWS: Row[] = [
  {
    id: 'dom',
    title: tx('Dominio di input', 'Input domain'),
    opts: [
      {
        id: 'flat',
        label: tx('Piatto', 'Flat'),
        sub: tx('vettori (es. reti feedforward)', 'vectors (e.g. feedforward networks)'),
        text: tx(
          'Un’etichetta vettoriale per ogni esempio: le reti feedforward delle prime lezioni.',
          'A vector label for every example: the feedforward networks of the first lectures.',
        ),
      },
      {
        id: 'seq',
        label: tx('Sequenze', 'Sequences'),
        sub: 'RNN',
        text: tx('Elementi con un ordine seriale: le reti ricorrenti.', 'Elements with a serial order: recurrent networks.'),
      },
      {
        id: 'str',
        label: tx('Strutture', 'Structures'),
        sub: tx('alberi e grafi', 'trees and graphs'),
        focus: true,
        text: tx('Elementi con relazioni generali: alberi e grafi.', 'Elements with general relations: trees and graphs.'),
      },
    ],
  },
  {
    id: 'lay',
    title: tx('Stratificazione', 'Layering'),
    opts: [
      { id: 'sh', label: 'Shallow', sub: tx('pochi strati', 'few layers'), text: tx('Modelli superficiali.', 'Shallow models.') },
      {
        id: 'deep',
        label: 'Deep',
        sub: tx('per feedforward e RNN', 'for feedforward and RNNs'),
        focus: true,
        text: tx(
          'Rappresentazione dell’input su più livelli di astrazione. Gli approcci «deep and wide» hanno però un alto costo computazionale.',
          'Representation of the input on several levels of abstraction. “Deep and wide” approaches, however, have a high computational cost.',
        ),
      },
    ],
  },
  {
    id: 'eff',
    title: tx('Efficienza', 'Efficiency'),
    opts: [
      {
        id: 'e2e',
        label: tx('Addestrate end-to-end', 'Trained end-to-end'),
        sub: tx('tutti i pesi appresi con Δw', 'all weights learned with Δw'),
        text: tx('Reti addestrate completamente end-to-end.', 'Networks trained fully end-to-end.'),
      },
      {
        id: 'rnd',
        label: tx('Randomizzate / incrementali', 'Randomized / incremental'),
        sub: tx('pesi casuali o costruzione a passi', 'random weights or stepwise construction'),
        focus: true,
        text: tx('Le reti randomizzate o incrementali offrono l’efficienza.', 'Randomized or incremental networks offer efficiency.'),
      },
    ],
  },
]

export function Scenario() {
  const [sel, setSel] = useState<Record<string, string>>({ dom: 'flat', lay: 'sh', eff: 'e2e' })
  const [last, setLast] = useState('dom')
  const focus = ROWS.every((r) => r.opts.find((o) => o.id === sel[r.id])?.focus)
  const seen = useLatch({ focus })
  const row = ROWS.find((r) => r.id === last)!
  const cur = row.opts.find((o) => o.id === sel[last])!
  return (
    <div>
      <div className="sc21">
        {ROWS.map((r) => (
          <div key={r.id} className="sc21__row">
            <div className="sc21__head">{r.title}</div>
            <div className="sc21__opts" style={{ '--n': r.opts.length } as CSSProperties}>
              {r.opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={'sc21__opt' + (sel[r.id] === o.id ? ' is-on' : '') + (o.focus ? ' is-focus' : '')}
                  aria-pressed={sel[r.id] === o.id}
                  onClick={() => {
                    setSel({ ...sel, [r.id]: o.id })
                    setLast(r.id)
                  }}
                >
                  <b>{o.label}</b>
                  <small>{o.sub}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="sc21__focus">
          <span>Focus</span>
          <span className="sc21__tip" />
        </div>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          {row.title}: {cur.label}
        </div>
        {cur.text}
      </div>
      <Controls>
        <span className={'verdict ' + (focus ? 'verdict--good' : 'verdict--info')}>
          {focus
            ? tx(
                'È il focus della lezione: approcci «profondi ed efficienti» per i domini strutturati.',
                'This is the focus of the lecture: “deep and efficient” approaches for structured domains.',
              )
            : tx(
                'Le caselle con il bordo arancione sono quelle verso cui si muove la lezione.',
                'The boxes with the orange border are the ones the lecture moves toward.',
              )}
        </span>
      </Controls>
      <Tasks
        items={[
          {
            label: tx(
              'Scegli in ogni riga la casella del focus: strutture, deep, randomizzate o incrementali.',
              'In every row choose the focus box: structures, deep, randomized or incremental.',
            ),
            done: seen.focus,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.3: un grafo etichettato */

const LG_N: { l: string; x: number; y: number; vec: number[] }[] = [
  { l: 'd', x: 200, y: 44, vec: [1, 0, 1, 0.7] },
  { l: 'b', x: 120, y: 130, vec: [0, 1, 0, 0.2] },
  { l: 'c', x: 280, y: 130, vec: [1, 1, 0, 0.5] },
  { l: 'a', x: 64, y: 222, vec: [0, 0, 1, 0.9] },
  { l: 'a', x: 200, y: 222, vec: [0, 0, 1, 0.9] },
]
/** archi: [da, a, orientamento] — 'none' non orientato, 'one' da → a, 'both' nei due versi */
const LG_E: [number, number, 'none' | 'one' | 'both'][] = [
  [0, 1, 'none'],
  [0, 2, 'none'],
  [1, 3, 'one'],
  [1, 4, 'both'],
  [2, 4, 'none'],
]
const CYCLE = new Set(['0-1', '1-4', '2-4', '0-2'])

export function LabeledGraph() {
  const [sel, setSel] = useState<{ kind: 'node' | 'edge'; i: number }>({ kind: 'node', i: 0 })
  const [cyc, setCyc] = useState(false)
  const [seenK, setSeenK] = useState({ node: false, edge: false })
  const A = LG_N.map((_, i) =>
    LG_N.map((__, j) => (LG_E.some(([a, b, o]) => (a === i && b === j) || (b === i && a === j && o !== 'one')) ? 1 : 0)),
  )
  const pick = (kind: 'node' | 'edge', i: number) => {
    setSel({ kind, i })
    setSeenK((s) => ({ ...s, [kind]: true }))
  }
  const R = 19
  const edgeSel = sel.kind === 'edge' ? LG_E[sel.i] : null
  const cellHot = (i: number, j: number) =>
    sel.kind === 'node' ? i === sel.i || j === sel.i : !!edgeSel && ((edgeSel[0] === i && edgeSel[1] === j) || (edgeSel[1] === i && edgeSel[0] === j))
  return (
    <div>
      <div className="wgrid">
        <svg className="lg21" viewBox="0 0 360 262" role="img" aria-label={tx('Grafo etichettato con nodi d, b, c, a, a', 'Labeled graph with nodes d, b, c, a, a')}>
          <defs>
            <marker id="lg21a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10z" className="ru20__head" />
            </marker>
          </defs>
          {LG_E.map(([a, b, o], i) => {
            const A0 = LG_N[a]
            const B0 = LG_N[b]
            const d = Math.hypot(B0.x - A0.x, B0.y - A0.y)
            const ux = (B0.x - A0.x) / d
            const uy = (B0.y - A0.y) / d
            const on = sel.kind === 'edge' && sel.i === i
            const inC = cyc && CYCLE.has(`${a}-${b}`)
            return (
              <g key={i} className={'lg21__e' + (on ? ' is-on' : '') + (inC ? ' is-cyc' : '')} onClick={() => pick('edge', i)} role="button" tabIndex={0} aria-label={tx(`arco ${A0.l}–${B0.l}`, `edge ${A0.l}–${B0.l}`)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick('edge', i)}>
                <line className="lg21__hit" x1={A0.x} y1={A0.y} x2={B0.x} y2={B0.y} />
                <line
                  x1={A0.x + ux * (R + 2)}
                  y1={A0.y + uy * (R + 2)}
                  x2={B0.x - ux * (R + 3)}
                  y2={B0.y - uy * (R + 3)}
                  markerEnd={o !== 'none' ? 'url(#lg21a)' : undefined}
                  markerStart={o === 'both' ? 'url(#lg21a)' : undefined}
                />
              </g>
            )
          })}
          {LG_N.map((nd, i) => (
            <g
              key={i}
              className={'lg21__n' + (sel.kind === 'node' && sel.i === i ? ' is-on' : '')}
              onClick={() => pick('node', i)}
              role="button"
              tabIndex={0}
              aria-label={tx(`nodo ${nd.l}`, `node ${nd.l}`)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick('node', i)}
            >
              <circle cx={nd.x} cy={nd.y} r={R} />
              <text x={nd.x} y={nd.y + 5.5} textAnchor="middle">
                {nd.l}
              </text>
            </g>
          ))}
        </svg>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">
              {sel.kind === 'node' ? tx('Nodo (vertice) v', 'Node (vertex) v') : tx('Arco (link)', 'Edge (link)')}
            </div>
            {sel.kind === 'node' ? (
              <>
                {tx('Ha un’etichetta vettoriale:', 'It has a vector label:')}
                <div className="wmath">
                  <Tex>{`\\mathbf{l}(v) = \\mathbf{l}_${LG_N[sel.i].l} = [${LG_N[sel.i].vec.map((v) => fmt(v, Number.isInteger(v) ? 0 : 1)).join(tx(';\\ ', ',\\ '))}]`}</Tex>
                </div>
              </>
            ) : (
              tx(
                <>
                  Collega {LG_N[edgeSel![0]].l} e {LG_N[edgeSel![1]].l}
                  {edgeSel![2] === 'one' ? ', orientato' : edgeSel![2] === 'both' ? ', percorribile nei due versi' : ', non orientato'}. Può avere a sua
                  volta un’etichetta vettoriale (ad esempio una posizione).
                </>,
                <>
                  It connects {LG_N[edgeSel![0]].l} and {LG_N[edgeSel![1]].l}
                  {edgeSel![2] === 'one' ? ', directed' : edgeSel![2] === 'both' ? ', traversable in both directions' : ', undirected'}. It can in turn
                  have a vector label (for example a position).
                </>,
              )
            )}
          </div>
          <table className="lg21__A">
            <caption>
              {tx('Matrice di adiacenza', 'Adjacency matrix')} <Tex>{'A'}</Tex>
            </caption>
            <thead>
              <tr>
                <th />
                {LG_N.map((nd, j) => (
                  <th key={j}>{nd.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {A.map((row, i) => (
                <tr key={i}>
                  <th>{LG_N[i].l}</th>
                  {row.map((v, j) => (
                    <td key={j} className={(cellHot(i, j) ? 'is-hot' : '') + (v ? ' is-1' : '')}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Toggle label={tx('evidenzia il ciclo', 'highlight the cycle')} checked={cyc} onChange={setCyc} />
        </div>
      </div>
      <p className="wnote">
        {tx(
          'Due nodi diversi possono avere la stessa etichetta (qui «a»). Le etichette dei nodi diversi da d sono inventate per l’esempio.',
          'Two different nodes can have the same label (here “a”). The labels of the nodes other than d are made up for the example.',
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca un nodo e poi un arco: entrambi possono portare un’etichetta vettoriale.',
              'Click a node and then an edge: both can carry a vector label.',
            ),
            done: seenK.node && seenK.edge,
          },
          { label: tx('Evidenzia il ciclo: il grafo non è un albero.', 'Highlight the cycle: the graph is not a tree.'), done: cyc },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.4: trasduzioni su grafi */

const TG: G = { n: [[70, 34], [124, 84], [34, 120], [86, 160], [26, 214]], e: [[0, 1], [2, 1], [1, 3], [4, 3]] }
const EMB = (() => {
  const r = rng(2104)
  return TG.n.map(() => Array.from({ length: 5 }, () => Math.round(r() * 100) / 100))
})()
const HG = EMB[0].map((_, k) => EMB.reduce((s, h) => s + h[k], 0) / EMB.length)
const tint = (v: number) => `color-mix(in srgb, var(--c-orange) ${Math.round(v * 100)}%, var(--c-blue))`

function Bar({ h, x, y }: { h: number[]; x: number; y: number }) {
  return (
    <g>
      {h.map((v, k) => (
        <rect key={k} className="tg21__cell" x={x + k * 13} y={y} width={13} height={16} style={{ fill: tint(v) }} />
      ))}
    </g>
  )
}

export function GraphTransduction() {
  const [task, setTask] = useState<'node' | 'graph'>('node')
  const [hov, setHov] = useState(1)
  const seen = useLatch({ graph: task === 'graph' })
  const draw = (ox: number, kind: 'in' | 'emb' | 'out') => (
    <g transform={`translate(${ox} 0)`}>
      {TG.e.map(([a, b], i) => (
        <line key={i} className="tg21__e" x1={TG.n[a][0]} y1={TG.n[a][1]} x2={TG.n[b][0]} y2={TG.n[b][1]} />
      ))}
      {TG.n.map(([x, y], i) => {
        const cls = EMB[i][0] > 0.5 ? 1 : 0
        return (
          <g key={i} onPointerEnter={() => setHov(i)} onClick={() => setHov(i)}>
            <circle
              className={'tg21__n' + (hov === i && kind !== 'out' ? ' is-on' : '')}
              cx={x}
              cy={y}
              r={15}
              style={kind === 'emb' ? { fill: tint(EMB[i][0]) } : kind === 'out' ? { fill: cls ? 'var(--c-blue)' : 'var(--c-green)' } : undefined}
            />
            {kind === 'out' && (
              <text className="tg21__y" x={x} y={y + 4.5} textAnchor="middle">
                {cls}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label={tx('compito', 'task')}
          value={task}
          onChange={setTask}
          options={[
            { value: 'node', label: tx('a livello di nodo', 'node-level') },
            { value: 'graph', label: tx('a livello di grafo', 'graph-level') },
          ]}
        />
      </div>
      <div className="pipe16__scroll">
        <svg className="tg21" viewBox="0 0 640 286" style={{ minWidth: 560 }} role="img" aria-label={tx('Trasduzione su grafi: grafo di input, embedding dei nodi, uscita', 'Transduction on graphs: input graph, node embedding, output')}>
          <defs>
            <marker id="tg21a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0L10,5L0,10z" className="ru20__head" />
            </marker>
          </defs>
          {draw(10, 'in')}
          <line className="tg21__arrow" x1={160} y1={120} x2={224} y2={120} markerEnd="url(#tg21a)" />
          <text className="tg21__T" x={192} y={108} textAnchor="middle">
            {svgScript('T', 'enc')}
          </text>
          {draw(232, 'emb')}
          <Bar h={EMB[hov]} x={232 + 112} y={196} />
          <text className="tg21__t" x={232 + 144} y={232} textAnchor="middle">
            {tx(<>{svgScript('h', 'v')} del nodo scelto</>, <>{svgScript('h', 'v')} of the chosen node</>)}
          </text>
          {task === 'node' ? (
            <>
              <line className="tg21__arrow" x1={392} y1={120} x2={452} y2={120} markerEnd="url(#tg21a)" />
              <text className="tg21__T" x={422} y={108} textAnchor="middle">
                {svgScript('T', 'out')}
              </text>
              {draw(462, 'out')}
              <text className="tg21__t" x={462 + 150} y={126}>
                {svgScript('y', 'v')}
              </text>
            </>
          ) : (
            <>
              <line className="tg21__arrow" x1={392} y1={120} x2={444} y2={120} markerEnd="url(#tg21a)" />
              <text className="tg21__T" x={418} y={108} textAnchor="middle">
                R
              </text>
              <Bar h={HG} x={452} y={112} />
              <text className="tg21__t" x={484} y={148} textAnchor="middle">
                {svgScript('h', 'g')}
              </text>
              <line className="tg21__arrow" x1={524} y1={120} x2={574} y2={120} markerEnd="url(#tg21a)" />
              <text className="tg21__T" x={549} y={108} textAnchor="middle">
                {svgScript('T', 'out')}
              </text>
              <circle className="tg21__n" cx={598} cy={120} r={15} style={{ fill: 'var(--c-yellow)' }} />
              <text className="tg21__t" x={598} y={156} textAnchor="middle">
                {svgScript('y', 'g')}
              </text>
            </>
          )}
          <text className="tg21__cap" x={80} y={262} textAnchor="middle">
            {tx('grafo di input etichettato', 'labeled input graph')}
          </text>
          <text className="tg21__cap" x={312} y={262} textAnchor="middle">
            {tx('embedding dei nodi (spazio latente)', 'node embedding (latent space)')}
          </text>
          <text className="tg21__cap" x={540} y={262} textAnchor="middle">
            {task === 'node'
              ? tx('un’uscita per ogni nodo', 'an output for every node')
              : tx('un’uscita per l’intero grafo', 'an output for the whole graph')}
          </text>
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          {task === 'node' ? tx('Struttura → struttura', 'Structure → structure') : tx('Struttura → scalare/elemento', 'Structure → scalar/element')}
        </div>
        {task === 'node'
          ? tx(
              'Trasduzione isomorfa input-output: compiti a livello di nodo, ad esempio la classificazione dei nodi. L’uscita ha la stessa struttura del grafo di input.',
              'Input-output isomorphic transduction: node-level tasks, for example node classification. The output has the same structure as the input graph.',
            )
          : tx(
              'Compiti a livello di grafo (regressione o classificazione di grafi): una funzione di readout R riassume gli embedding dei nodi in un embedding del grafo, da cui si calcola l’uscita.',
              'Graph-level tasks (graph regression or classification): a readout function R summarizes the node embeddings into a graph embedding, from which the output is computed.',
            )}
      </div>
      <p className="wnote">
        {tx(
          'I valori degli embedding sono inventati per l’esempio (il colore dei nodi è la prima componente).',
          'The embedding values are made up for the example (the color of the nodes is the first component).',
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Passa sui nodi dell’embedding: ogni nodo ha il proprio vettore di stato.',
              'Hover over the nodes of the embedding: every node has its own state vector.',
            ),
            done: hov !== 1,
          },
          {
            label: tx(
              'Passa al compito a livello di grafo: il readout R produce un solo embedding per tutto il grafo.',
              'Switch to the graph-level task: the readout R produces a single embedding for the whole graph.',
            ),
            done: seen.graph,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.5: message passing */

const MP_N: XY[] = [
  [70, 56],
  [206, 34],
  [150, 128],
  [290, 110],
  [56, 196],
  [196, 214],
  [340, 196],
]
const MP_E: [number, number][] = [
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 4],
  [2, 5],
  [3, 6],
  [5, 6],
]
const MP_COL = ['var(--c-yellow)', 'var(--c-green)', 'var(--c-red)', 'var(--c-blue)', 'var(--c-violet)', 'var(--c-orange)', 'var(--c-magenta)']
const neigh = (v: number) => MP_E.flatMap(([a, b]) => (a === v ? [b] : b === v ? [a] : []))
const INIT: number[][] = MP_N.map((_, i) => MP_N.map((__, j) => (i === j ? 1 : 0)))

/** lo stato di un nodo come miscela dell'informazione dei nodi di partenza: una barra a segmenti colorati */
function Mix({ m, x, y, h = 38, w = 11 }: { m: number[]; x: number; y: number; h?: number; w?: number }) {
  const starts = m.map((_, i) => m.slice(0, i).reduce((s, v) => s + v, 0))
  return (
    <g>
      {m.map((v, i) => (v > 1e-6 ? <rect key={i} x={x} y={y + starts[i] * h} width={w} height={v * h} style={{ fill: MP_COL[i] }} /> : null))}
      <rect className="mp21__bar" x={x} y={y} width={w} height={h} />
    </g>
  )
}

export function MessagePassing() {
  const [m, setM] = useState(INIT)
  const [v, setV] = useState(2)
  const [phase, setPhase] = useState(0)
  const [iter, setIter] = useState(0)
  const nb = neigh(v)
  const agg = (u: number) => {
    const ns = neigh(u)
    return m[u].map((_, k) => ns.reduce((s, q) => s + m[q][k], 0) / ns.length)
  }
  const next = () => {
    if (phase < 2) {
      setPhase(phase + 1)
      return
    }
    // aggiornamento di tutti i nodi insieme: media tra il proprio stato e l'aggregato dei vicini
    setM(
      m.map((mu, u) => {
        const a = agg(u)
        return mu.map((x, k) => (x + a[k]) / 2)
      }),
    )
    setPhase(0)
    setIter(iter + 1)
  }
  const reached = m[v].filter((x) => x > 1e-6).length
  const pool = MP_N.map((_, k) => m.reduce((s, mu) => s + mu[k], 0) / m.length)
  const btn = [
    tx('1 · I vicini inviano i messaggi', '1 · The neighbors send the messages'),
    tx('2 · Il nodo aggrega i messaggi', '2 · The node aggregates the messages'),
    tx('3 · Tutti i nodi aggiornano lo stato', '3 · All nodes update their state'),
  ][phase]
  return (
    <div>
      <div className="wgrid">
        <svg className="mp21" viewBox="0 -18 400 278" role="img" aria-label={tx('Message passing su un grafo: messaggi dai vicini, aggregazione, aggiornamento', 'Message passing on a graph: messages from the neighbors, aggregation, update')}>
          <defs>
            <marker id="mp21a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0L10,5L0,10z" className="mp21__head" />
            </marker>
          </defs>
          {MP_E.map(([a, b], i) => (
            <line key={i} className="mp21__e" x1={MP_N[a][0]} y1={MP_N[a][1]} x2={MP_N[b][0]} y2={MP_N[b][1]} />
          ))}
          {phase >= 1 &&
            nb.map((u) => {
              const dx = MP_N[v][0] - MP_N[u][0]
              const dy = MP_N[v][1] - MP_N[u][1]
              const d = Math.hypot(dx, dy)
              return (
                <line
                  key={u}
                  className="mp21__msg"
                  x1={MP_N[u][0] + (dx / d) * 22 + (dy / d) * 7}
                  y1={MP_N[u][1] + (dy / d) * 22 - (dx / d) * 7}
                  x2={MP_N[v][0] - (dx / d) * 24 + (dy / d) * 7}
                  y2={MP_N[v][1] - (dy / d) * 24 - (dx / d) * 7}
                  markerEnd="url(#mp21a)"
                />
              )
            })}
          {MP_N.map(([x, y], i) => (
            <g
              key={i}
              className={'mp21__n' + (i === v ? ' is-v' : nb.includes(i) ? ' is-nb' : '')}
              role="button"
              tabIndex={0}
              aria-label={tx(`nodo ${i + 1}`, `node ${i + 1}`)}
              onClick={() => {
                setV(i)
                setPhase(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setV(i)
                  setPhase(0)
                }
              }}
            >
              <ellipse cx={x} cy={y} rx={20} ry={13} />
              <Mix m={m[i]} x={x - 5.5} y={y - 44} />
            </g>
          ))}
          {phase === 2 && (
            <g>
              <Mix m={agg(v)} x={MP_N[v][0] + 26} y={MP_N[v][1] - 44} />
              <text className="mp21__t" x={MP_N[v][0] + 42} y={MP_N[v][1] - 22}>
                {tx('messaggi aggregati', 'aggregated messages')}
              </text>
            </g>
          )}
          <text className="mp21__lbl" x={MP_N[v][0]} y={MP_N[v][1] + 30} textAnchor="middle">
            v
          </text>
        </svg>
        <div className="wside">
          <div className="readouts">
            <Readout label={tx('iterazioni complete', 'complete iterations')} tone="accent" value={String(iter)} />
            <Readout
              label={tx('nodi la cui informazione è in v', 'nodes whose information is in v')}
              value={tx(`${reached} su ${MP_N.length}`, `${reached} of ${MP_N.length}`)}
            />
          </div>
          <div>
            <div className="wpanel__title">{tx('Global pooling: la media degli stati', 'Global pooling: the mean of the states')}</div>
            <svg viewBox="0 0 160 14" preserveAspectRatio="none" className="mp21__pool" aria-hidden="true">
              {pool.map((p, i) => (
                <rect key={i} x={pool.slice(0, i).reduce((s, q) => s + q, 0) * 160} y={0} width={p * 160} height={14} style={{ fill: MP_COL[i] }} />
              ))}
            </svg>
            <p className="wnote">
              {tx(
                'Un’uscita per l’intero grafo: non dipende dall’ordine dei nodi.',
                'An output for the whole graph: it does not depend on the order of the nodes.',
              )}
            </p>
          </div>
        </div>
      </div>
      <Controls>
        <Btn icon="step" variant="soft" onClick={next}>
          {btn}
        </Btn>
        <Btn
          icon="reset"
          onClick={() => {
            setM(INIT)
            setPhase(0)
            setIter(0)
          }}
          disabled={iter === 0 && phase === 0}
        >
          {tx('Ricomincia', 'Restart')}
        </Btn>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            La barra sopra ogni nodo è il suo stato: i colori dicono da quali nodi proviene l’informazione che contiene (all’inizio, solo dal
            nodo stesso). Qui l’aggregazione è la media dei vicini, che non dipende dal loro ordine. Clicca un nodo per scegliere v.
          </>,
          <>
            The bar above every node is its state: the colors tell which nodes the information it contains comes from (at the beginning, only
            from the node itself). Here the aggregation is the mean of the neighbors, which does not depend on their order. Click a node to
            choose v.
          </>,
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Esegui le tre fasi di un’iterazione: messaggi, aggregazione, aggiornamento.',
              'Run the three phases of an iteration: messages, aggregation, update.',
            ),
            done: iter >= 1,
          },
          {
            label: tx(
              'Continua a iterare: nello stato di v arriva l’informazione di nodi sempre più lontani, fino a tutto il grafo.',
              'Keep iterating: the information of more and more distant nodes reaches the state of v, up to the whole graph.',
            ),
            done: reached === MP_N.length,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.6: griglia e grafo */

const CG: G = {
  n: [[40, 36], [112, 22], [70, 96], [150, 84], [200, 40], [28, 150], [104, 166], [176, 150], [222, 110]],
  e: [[0, 2], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6], [3, 7], [6, 7], [4, 8], [7, 8], [1, 4]],
}

export function CnnVsGraph() {
  const [px, setPx] = useState<[number, number]>([2, 2])
  const [nd, setNd] = useState(2)
  const [clicks, setClicks] = useState({ g: 0, n: 0 })
  const S = 46
  const gx = (c: number) => 22 + c * S
  const nbG = CG.e.flatMap(([a, b]) => (a === nd ? [b] : b === nd ? [a] : []))
  const order = (r: number, c: number) => {
    const k = (r - px[0] + 1) * 3 + (c - px[1] + 1)
    return k > 4 ? k : k + 1
  }
  const inWin = (r: number, c: number) => Math.abs(r - px[0]) <= 1 && Math.abs(c - px[1]) <= 1 && !(r === px[0] && c === px[1])
  return (
    <div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Griglia regolare (CNN)', 'Regular grid (CNN)')}</div>
          <svg className="cg21" viewBox="0 0 230 230" role="img" aria-label={tx('Griglia regolare: un pixel con i suoi otto vicini ordinati', 'Regular grid: a pixel with its eight ordered neighbors')}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line className="cg21__e" x1={gx(0)} y1={gx(i)} x2={gx(4)} y2={gx(i)} />
                <line className="cg21__e" x1={gx(i)} y1={gx(0)} x2={gx(i)} y2={gx(4)} />
              </g>
            ))}
            <rect className="cg21__win" x={gx(px[1] - 1) - 20} y={gx(px[0] - 1) - 20} width={2 * S + 40} height={2 * S + 40} rx={16} />
            {Array.from({ length: 25 }, (_, k) => {
              const r = Math.floor(k / 5)
              const c = k % 5
              const center = r === px[0] && c === px[1]
              const w = inWin(r, c)
              return (
                <g
                  key={k}
                  className={'cg21__n' + (center ? ' is-v' : w ? ' is-nb' : '')}
                  role="button"
                  tabIndex={0}
                  aria-label={tx(`pixel riga ${r + 1}, colonna ${c + 1}`, `pixel row ${r + 1}, column ${c + 1}`)}
                  onClick={() => {
                    setPx([Math.max(1, Math.min(3, r)), Math.max(1, Math.min(3, c))])
                    setClicks((q) => ({ ...q, g: q.g + 1 }))
                  }}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPx([Math.max(1, Math.min(3, r)), Math.max(1, Math.min(3, c))])}
                >
                  {w && <line className="cg21__link" x1={gx(px[1])} y1={gx(px[0])} x2={gx(c)} y2={gx(r)} />}
                  <circle cx={gx(c)} cy={gx(r)} r={11} />
                  {w && (
                    <text x={gx(c)} y={gx(r) + 4} textAnchor="middle">
                      {order(r, c)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="readouts">
            <Readout
              label={tx('vicini del pixel', 'neighbors of the pixel')}
              value="8"
              sub={tx('in numero fisso, ordinati: ognuno ha il suo peso', 'fixed in number, ordered: each has its own weight')}
            />
          </div>
        </div>
        <div>
          <div className="htf__title">{tx('Grafo', 'Graph')}</div>
          <svg className="cg21" viewBox="0 0 250 190" role="img" aria-label={tx('Grafo: un nodo con vicini non ordinati e in numero variabile', 'Graph: a node with unordered neighbors, variable in number')}>
            {CG.e.map(([a, b], i) => {
              const hot = (a === nd && nbG.includes(b)) || (b === nd && nbG.includes(a))
              return <line key={i} className={hot ? 'cg21__link' : 'cg21__e'} x1={CG.n[a][0]} y1={CG.n[a][1]} x2={CG.n[b][0]} y2={CG.n[b][1]} />
            })}
            {CG.n.map(([x, y], i) => (
              <g
                key={i}
                className={'cg21__n' + (i === nd ? ' is-v' : nbG.includes(i) ? ' is-nb' : '')}
                role="button"
                tabIndex={0}
                aria-label={tx(`nodo ${i + 1}`, `node ${i + 1}`)}
                onClick={() => {
                  setNd(i)
                  setClicks((q) => ({ ...q, n: q.n + 1 }))
                }}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setNd(i)}
              >
                <circle cx={x} cy={y} r={11} />
              </g>
            ))}
          </svg>
          <div className="readouts">
            <Readout
              label={tx('vicini del nodo', 'neighbors of the node')}
              tone="accent"
              value={String(nbG.length)}
              sub={tx('in numero variabile, senza un ordine: pesi condivisi', 'variable in number, with no order: shared weights')}
            />
          </div>
        </div>
      </div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('il nodo visitato', 'the visited node'), color: 'var(--c-red)', kind: 'dot' },
            { label: tx('i suoi vicini (il campo recettivo)', 'its neighbors (the receptive field)'), color: 'var(--c-blue)', kind: 'dot' },
          ]}
        />
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Sposta il pixel sulla griglia: la finestra ha sempre gli stessi otto vicini, nelle stesse posizioni.',
              'Move the pixel on the grid: the window always has the same eight neighbors, in the same positions.',
            ),
            done: clicks.g >= 2,
          },
          {
            label: tx(
              'Clicca nodi diversi del grafo: il numero di vicini cambia da nodo a nodo e non c’è un ordine tra loro.',
              'Click different nodes of the graph: the number of neighbors changes from node to node and there is no order among them.',
            ),
            done: clicks.n >= 3,
          },
        ]}
      />
    </div>
  )
}
