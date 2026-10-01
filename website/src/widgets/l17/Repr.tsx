import { useState } from 'react'
import { Axes, Plot, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Controls, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ Fig. 17.7: autoencoder */

const NIN = 5

export function Autoencoder() {
  const [k, setK] = useState(7)
  const [hot, setHot] = useState<'enc' | 'dec' | null>(null)
  const seen = useLatch({ under: k < NIN, over: k > NIN })
  const W = 520
  const xs = (n: number, cx: number) => Array.from({ length: n }, (_, i) => cx + (i - (n - 1) / 2) * 30)
  const xin = xs(NIN, 150)
  const xh = xs(k, 260)
  const xr = xs(NIN, 370)
  const kind = k < NIN ? 'under' : k > NIN ? 'over' : 'eq'
  return (
    <div>
      <svg className="ae17" viewBox={`0 0 ${W} 230`} role="img" aria-label={tx('Autoencoder: input, strato nascosto, ricostruzione', 'Autoencoder: input, hidden layer, reconstruction')}>
        <g className={'ae17__edges' + (hot === 'enc' ? ' is-hot' : '')}>
          {xin.map((a, i) => xh.map((b, j) => <line key={`${i}-${j}`} x1={a} y1={170} x2={b} y2={66} />))}
        </g>
        <g className={'ae17__edges' + (hot === 'dec' ? ' is-hot' : '')}>
          {xh.map((a, i) => xr.map((b, j) => <line key={`${i}-${j}`} x1={a} y1={66} x2={b} y2={170} />))}
        </g>
        {xin.map((x, i) => (
          <circle key={i} className="ae17__u ae17__u--x" cx={x} cy={184} r={11} />
        ))}
        {xr.map((x, i) => (
          <circle key={i} className="ae17__u ae17__u--r" cx={x} cy={184} r={11} />
        ))}
        {xh.map((x, i) => (
          <circle key={i} className="ae17__u ae17__u--h" cx={x} cy={52} r={11} />
        ))}
        <text className="ae17__t" x={150} y={218} textAnchor="middle">
          {tx('input x', 'input x')}
        </text>
        <text className="ae17__t" x={370} y={218} textAnchor="middle">
          {tx('ricostruzione r', 'reconstruction r')}
        </text>
        <text className="ae17__t" x={260} y={24} textAnchor="middle">
          {tx('codice h', 'code h')}
        </text>
        <g
          className={'ae17__w' + (hot === 'enc' ? ' is-hot' : '')}
          tabIndex={0}
          onPointerEnter={() => setHot('enc')}
          onPointerLeave={() => setHot(null)}
          onFocus={() => setHot('enc')}
          onBlur={() => setHot(null)}
        >
          <rect x={52} y={104} width={98} height={26} rx={8} />
          <text x={101} y={121.5} textAnchor="middle">
            {tx('encoder', 'encoder')} {svgScript('W', '1')}
          </text>
        </g>
        <g
          className={'ae17__w' + (hot === 'dec' ? ' is-hot' : '')}
          tabIndex={0}
          onPointerEnter={() => setHot('dec')}
          onPointerLeave={() => setHot(null)}
          onFocus={() => setHot('dec')}
          onBlur={() => setHot(null)}
        >
          <rect x={372} y={104} width={102} height={26} rx={8} />
          <text x={423} y={121.5} textAnchor="middle">
            {tx('decoder', 'decoder')} {svgScript('W', '1')}′
          </text>
        </g>
      </svg>
      <div className="wpanel">
        <div className="wpanel__title">
          {kind === 'under' ? tx('Undercomplete', 'Undercomplete') : kind === 'over' ? tx('Overcomplete', 'Overcomplete') : tx('Strato nascosto grande quanto l’input', 'Hidden layer the same size as input')}
        </div>
        {kind === 'under' &&
          tx(
            'Lo strato nascosto è più piccolo dell’input: il vincolo architetturale forza la rete a catturare le feature più salienti.',
            'The hidden layer is smaller than the input: the architectural constraint forces the network to capture the most salient features.',
          )}
        {kind === 'over' &&
          tx(
            'Lo strato nascosto è più grande dell’input: serve una regolarizzazione che imponga sparsità, robustezza al rumore o altre proprietà, oltre alla banale capacità di copiare.',
            'The hidden layer is larger than the input: regularization is needed to enforce sparsity, noise robustness, or other properties beyond merely copying.',
          )}
        {kind === 'eq' && tx('Con tante unità nascoste quante sono gli input la rete può limitarsi a copiare.', 'With as many hidden units as inputs, the network can simply copy.')}
        <div className="wmath">
          <Tex>{hot === 'dec' ? '\\mathbf{r} = g(\\mathbf{h})' : hot === 'enc' ? '\\mathbf{h} = f(\\mathbf{x})' : '\\mathbf{h} = f(\\mathbf{x}), \\qquad \\mathbf{r} = g(\\mathbf{h})'}</Tex>
        </div>
      </div>
      <Controls>
        <Slider label={tx('unità nello strato nascosto', 'units in hidden layer')} min={2} max={9} step={1} value={k} onChange={setK} width={260} />
        <div className="readouts">
          <Readout label="input" value={String(NIN)} />
          <Readout label={tx('codice', 'code')} tone="accent" value={String(k)} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: tx('Riduci lo strato nascosto sotto 5 unità: l’autoencoder diventa undercomplete.', 'Reduce the hidden layer below 5 units: the autoencoder becomes undercomplete.'), done: seen.under },
          { label: tx('Riportalo sopra 5: è overcomplete (come nella figura originale, con 7 unità).', 'Bring it back above 5: it is overcomplete (as in the original figure, with 7 units).'), done: seen.under && seen.over },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.8: localista e distribuita */

const CONCEPTS = ['cane', 'gatto', 'tigre']
const CONCEPTS_EN = ['dog', 'cat', 'tiger']
/** attivazioni illustrative: gatto e tigre condividono più feature tra loro che con il cane */
const DIST = [
  [0.9, 0.2, 0.7, 0.1, 0.6],
  [0.8, 0.9, 0.3, 0.2, 0.6],
  [0.7, 0.9, 0.2, 0.9, 0.5],
]
const ONEHOT = [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
]
const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))

function Units({ rows, pair, showVals }: { rows: number[][]; pair: [number, number]; showVals?: boolean }) {
  return (
    <div className="ld17__rows">
      {rows.map((r, i) => (
        <div key={i} className={'ld17__row' + (pair.includes(i) ? ' is-on' : '')}>
          <span className="ld17__name">{tx(CONCEPTS[i], CONCEPTS_EN[i])}</span>
          {r.map((v, j) => (
            <span key={j} className="ld17__u" title={fmt(v, 1)}>
              <i style={{ opacity: v }} />
              {showVals && <small>{fmt(v, 1)}</small>}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 2],
]

export function LocalDistributed() {
  const [p, setP] = useState(0)
  const [seenP, setSeenP] = useState<Record<number, boolean>>({})
  const pair = PAIRS[p]
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label={tx('confronta', 'compare')}
          value={p}
          onChange={(v) => {
            setP(v)
            setSeenP((s) => ({ ...s, [v]: true }))
          }}
          options={PAIRS.map(([a, b], i) => ({ value: i, label: `${tx(CONCEPTS[a], CONCEPTS_EN[a])} – ${tx(CONCEPTS[b], CONCEPTS_EN[b])}` }))}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Localista (one-hot)', 'Localist (one-hot)')}</div>
          <Units rows={ONEHOT} pair={pair} />
          <div className="readouts">
            <Readout
              label={tx('distanza', 'distance')}
              value={<Tex>{'\\sqrt{2} \\approx 1{,}41'}</Tex>}
              sub={tx('sempre la stessa, tra concetti diversi', 'always the same between different concepts')}
            />
          </div>
        </div>
        <div>
          <div className="htf__title">{tx('Distribuita', 'Distributed')}</div>
          <Units rows={DIST} pair={pair} showVals />
          <div className="readouts">
            <Readout label={tx('distanza', 'distance')} tone="accent" value={fmt(dist(DIST[pair[0]], DIST[pair[1]]), 2)} sub={tx('riflette il significato', 'reflects meaning')} />
          </div>
        </div>
      </div>
      <p className="wnote">
        {tx(
          'Ogni cerchio è un’unità: vuoto = 0, pieno = 1, grigio = un valore intermedio (come 0,6). Qui non si classifica, si rappresenta. I valori della rappresentazione distribuita sono illustrativi.',
          'Each circle is a unit: empty = 0, filled = 1, gray = an intermediate value (such as 0.6). Here we do not classify, we represent. The values of the distributed representation are illustrative.',
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Confronta le tre coppie: nella rappresentazione one-hot la distanza non cambia mai, in quella distribuita gatto e tigre sono i più vicini.',
              'Compare the three pairs: in the one-hot representation distance never changes, in the distributed one cat and tiger are closest.',
            ),
            done: !!seenP[1] && !!seenP[2],
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.9: attributi condivisi */

const OBJ = [
  { name: 'auto rossa', nameEn: 'red car', car: 1, red: 1 },
  { name: 'bici rossa', nameEn: 'red bike', car: 0, red: 1 },
  { name: 'auto blu', nameEn: 'blue car', car: 1, red: 0 },
  { name: 'bici blu', nameEn: 'blue bike', car: 0, red: 0 },
]

export function Disentangle() {
  const [hold, setHold] = useState(3)
  const [n, setN] = useState(0)
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label={tx('oggetto mai visto in addestramento', 'object unseen in training')}
          value={hold}
          onChange={(v) => {
            setHold(v)
            setN(n + 1)
          }}
          options={OBJ.map((o, i) => ({ value: i, label: tx(o.name, o.nameEn) }))}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Rappresentazione localista', 'Localist representation')}</div>
          <table className="dis17">
            <thead>
              <tr>
                <th />
                {OBJ.map((_, j) => (
                  <th key={j} className={j === hold ? 'is-new' : undefined}>
                    <Tex>{`u_${j + 1}`}</Tex>
                  </th>
                ))}
                <th>{tx('mi piace?', 'like it?')}</th>
              </tr>
            </thead>
            <tbody>
              {OBJ.map((o, i) => (
                <tr key={i} className={i === hold ? 'is-hold' : undefined}>
                  <th>{tx(o.name, o.nameEn)}</th>
                  {OBJ.map((_, j) => (
                    <td key={j} className={j === hold ? 'is-new' : undefined}>
                      {i === j ? 1 : 0}
                    </td>
                  ))}
                  <td className="dis17__ans">{i === hold ? '?' : o.red ? tx('sì', 'yes') : tx('no', 'no')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="wnote">
            {tx(
              <>
                L’unità <Tex>{`u_${hold + 1}`}</Tex> non è mai stata attiva in addestramento: «{OBJ[hold].name}» è un caso del tutto nuovo, e non c’è modo di rispondere.
              </>,
              <>
                Unit <Tex>{`u_${hold + 1}`}</Tex> was never active during training: “{OBJ[hold].nameEn}” is a completely new case, and there is no way to answer.
              </>,
            )}
          </p>
        </div>
        <div>
          <div className="htf__title">{tx('Rappresentazione distribuita', 'Distributed representation')}</div>
          <table className="dis17">
            <thead>
              <tr>
                <th />
                <th>{tx('auto (bici)', 'car (bike)')}</th>
                <th className="is-shared">{tx('rosso (blu)', 'red (blue)')}</th>
                <th>{tx('mi piace?', 'like it?')}</th>
              </tr>
            </thead>
            <tbody>
              {OBJ.map((o, i) => (
                <tr key={i} className={i === hold ? 'is-hold' : undefined}>
                  <th>{tx(o.name, o.nameEn)}</th>
                  <td>{o.car}</td>
                  <td className="is-shared">{o.red}</td>
                  <td className="dis17__ans">
                    {o.red ? tx('sì', 'yes') : tx('no', 'no')}
                    {i === hold ? tx(' (previsto)', ' (predicted)') : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="wnote">
            {tx(
              <>
                La colonna del «rosso» è condivisa tra oggetti diversi: dagli altri tre casi si impara che mi piacciono gli oggetti rossi, e la risposta per «{OBJ[hold].name}» segue ({OBJ[hold].red ? 'mi piace, perché è rossa' : 'non mi piace, perché non è rossa'}).
              </>,
              <>
                The “red” column is shared across different objects: from the other three cases we learn that I like red objects, and the answer for “{OBJ[hold].nameEn}” follows ({OBJ[hold].red ? 'like it, because it is red' : 'dislike it, because it is not red'}).
              </>,
            )}
          </p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Cambia l’oggetto mai visto: con la rappresentazione distribuita la risposta si ricava sempre dagli altri tre, con quella localista mai.',
              'Change the unseen object: with the distributed representation the answer is always inferred from the other three, with the localist one never.',
            ),
            done: n >= 2,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.10: word embedding */

type W = [string, number, number]
/** posizioni lette dalla figura originale (proiezione 2D di uno spazio di embedding appreso) */
const COUNTRIES: W[] = [
  ['France', -31.5, -6.6],
  ['China', -31, -7.1],
  ['Russian', -30.2, -7.45],
  ['French', -33.9, -7.9],
  ['English', -33.1, -8.35],
  ['Germany', -30.6, -10.35],
  ['Iraq', -28.4, -10.35],
  ['Ontario', -30.4, -10.75],
  ['Europe', -31.4, -11.05],
  ['EU', -33.2, -11.2],
  ['Union', -32.3, -11.55],
  ['Africa', -31.2, -11.9],
  ['African', -29.9, -11.45],
  ['Assembly', -33.1, -11.95],
  ['Japan', -26, -11.45],
  ['European', -31.6, -12.35],
  ['British', -29.6, -12.55],
  ['North', -27.8, -12.75],
  ['Canada', -27.1, -13.0],
  ['Canadian', -25.9, -13.35],
  ['South', -28, -13.9],
]
const YEARS: W[] = [
  ['2009', 36.5, 20.95],
  ['2008', 36.9, 20.7],
  ['2004', 35.7, 20.1],
  ['2003', 35.68, 19.85],
  ['2007', 37.3, 19.95],
  ['2001', 37, 19.75],
  ['2006', 36.45, 19.5],
  ['2005', 36.3, 19],
  ['2000', 37.1, 19.1],
  ['1999', 36.9, 18.85],
  ['1995', 35.7, 18.4],
  ['2002', 36.35, 18.4],
  ['1997', 36.8, 18.3],
  ['1998', 37.1, 18.02],
  ['1996', 37.42, 18.25],
]

function Words({ words, sel, onSel, near }: { words: W[]; sel: string | null; onSel: (w: string) => void; near: Set<string> }) {
  const { x, y } = usePlot()
  return (
    <g>
      {words.map(([w, wx, wy]) => (
        <text
          key={w}
          className={'we17__w' + (sel === w ? ' is-sel' : near.has(w) ? ' is-near' : '')}
          x={x(wx)}
          y={y(wy)}
          textAnchor="middle"
          role="button"
          tabIndex={0}
          onClick={() => onSel(w)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSel(w)}
        >
          {w}
        </text>
      ))}
    </g>
  )
}

export function WordEmbedding() {
  const [sel, setSel] = useState<string | null>(null)
  const all = [...COUNTRIES, ...YEARS]
  const cur = all.find((w) => w[0] === sel)
  const group = cur ? (COUNTRIES.includes(cur) ? COUNTRIES : YEARS) : []
  const nearest = cur
    ? group
        .filter((w) => w !== cur)
        .map((w) => ({ w, d: Math.hypot(w[1] - cur[1], w[2] - cur[2]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
    : []
  const near = new Set(nearest.map((q) => q.w[0]))
  const [picked, setPicked] = useState({ c: false, y: false })
  const pick = (w: string) => {
    setSel(w)
    setPicked((p) => ({ c: p.c || COUNTRIES.some((q) => q[0] === w), y: p.y || YEARS.some((q) => q[0] === w) }))
  }
  return (
    <div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Paesi e lingue', 'Countries and languages')}</div>
          <Plot xDomain={[-35, -25]} yDomain={[-14.4, -6]} aspect={0.9} minH={240} maxH={340} margin={{ l: 34, r: 12 }}>
            <Axes xTicks={[-34, -32, -30, -28, -26]} yTicks={[-14, -12, -10, -8, -6]} />
            <Words words={COUNTRIES} sel={sel} onSel={pick} near={near} />
          </Plot>
        </div>
        <div>
          <div className="htf__title">{tx('Anni', 'Years')}</div>
          <Plot xDomain={[35, 38]} yDomain={[17, 22]} aspect={0.9} minH={240} maxH={340} margin={{ l: 34, r: 12 }}>
            <Axes xTicks={[35, 36, 37, 38]} yTicks={[17, 18, 19, 20, 21, 22]} />
            <Words words={YEARS} sel={sel} onSel={pick} near={near} />
          </Plot>
        </div>
      </div>
      <div className="controls">
        {cur ? (
          <span className="verdict verdict--info">
            {tx(`Le parole più vicine a «${cur[0]}»: ${nearest.map((q) => q.w[0]).join(', ')}.`, `Words closest to “${cur[0]}”: ${nearest.map((q) => q.w[0]).join(', ')}.`)}
          </span>
        ) : (
          <p className="wnote">{tx('Clicca una parola per vedere le sue tre vicine più prossime nello spazio appreso.', 'Click a word to see its three nearest neighbors in the learned space.')}</p>
        )}
      </div>
      <Tasks
        items={[
          { label: tx('Clicca il nome di un paese: i suoi vicini sono altri paesi o lingue.', 'Click a country name: its neighbors are other countries or languages.'), done: picked.c },
          { label: tx('Clicca un anno: i suoi vicini sono altri anni. Nessuno ha detto al modello che cosa sia un paese o un anno.', 'Click a year: its neighbors are other years. Nobody told the model what a country or a year is.'), done: picked.y },
        ]}
      />
    </div>
  )
}
