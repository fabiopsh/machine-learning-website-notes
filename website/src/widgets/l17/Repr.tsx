import { useState } from 'react'
import { Axes, Plot, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Controls, Readout, Segmented, Slider } from '../../components/ui/Controls'
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
      <svg className="ae17" viewBox={`0 0 ${W} 230`} role="img" aria-label="Autoencoder: input, strato nascosto, ricostruzione">
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
          input x
        </text>
        <text className="ae17__t" x={370} y={218} textAnchor="middle">
          ricostruzione r
        </text>
        <text className="ae17__t" x={260} y={24} textAnchor="middle">
          codice h
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
            encoder {svgScript('W', '1')}
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
            decoder {svgScript('W', '1')}′
          </text>
        </g>
      </svg>
      <div className="wpanel">
        <div className="wpanel__title">
          {kind === 'under' ? 'Undercomplete' : kind === 'over' ? 'Overcomplete' : 'Strato nascosto grande quanto l’input'}
        </div>
        {kind === 'under' &&
          'Lo strato nascosto è più piccolo dell’input: il vincolo architetturale forza la rete a catturare le feature più salienti.'}
        {kind === 'over' &&
          'Lo strato nascosto è più grande dell’input: serve una regolarizzazione che imponga sparsità, robustezza al rumore o altre proprietà, oltre alla banale capacità di copiare.'}
        {kind === 'eq' && 'Con tante unità nascoste quante sono gli input la rete può limitarsi a copiare.'}
        <div className="wmath">
          <Tex>{hot === 'dec' ? '\\mathbf{r} = g(\\mathbf{h})' : hot === 'enc' ? '\\mathbf{h} = f(\\mathbf{x})' : '\\mathbf{h} = f(\\mathbf{x}), \\qquad \\mathbf{r} = g(\\mathbf{h})'}</Tex>
        </div>
      </div>
      <Controls>
        <Slider label="unità nello strato nascosto" min={2} max={9} step={1} value={k} onChange={setK} width={260} />
        <div className="readouts">
          <Readout label="input" value={String(NIN)} />
          <Readout label="codice" tone="accent" value={String(k)} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Riduci lo strato nascosto sotto 5 unità: l’autoencoder diventa undercomplete.', done: seen.under },
          { label: 'Riportalo sopra 5: è overcomplete (come nella figura originale, con 7 unità).', done: seen.under && seen.over },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.8: localista e distribuita */

const CONCEPTS = ['cane', 'gatto', 'tigre']
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
          <span className="ld17__name">{CONCEPTS[i]}</span>
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
          label="confronta"
          value={p}
          onChange={(v) => {
            setP(v)
            setSeenP((s) => ({ ...s, [v]: true }))
          }}
          options={PAIRS.map(([a, b], i) => ({ value: i, label: `${CONCEPTS[a]} – ${CONCEPTS[b]}` }))}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">Localista (one-hot)</div>
          <Units rows={ONEHOT} pair={pair} />
          <div className="readouts">
            <Readout
              label="distanza"
              value={<Tex>{'\\sqrt{2} \\approx 1{,}41'}</Tex>}
              sub="sempre la stessa, tra concetti diversi"
            />
          </div>
        </div>
        <div>
          <div className="htf__title">Distribuita</div>
          <Units rows={DIST} pair={pair} showVals />
          <div className="readouts">
            <Readout label="distanza" tone="accent" value={fmt(dist(DIST[pair[0]], DIST[pair[1]]), 2)} sub="riflette il significato" />
          </div>
        </div>
      </div>
      <p className="wnote">
        Ogni cerchio è un’unità: vuoto = 0, pieno = 1, grigio = un valore intermedio (come 0,6). Qui non si classifica, si rappresenta.
        I valori della rappresentazione distribuita sono illustrativi.
      </p>
      <Tasks
        items={[
          {
            label: 'Confronta le tre coppie: nella rappresentazione one-hot la distanza non cambia mai, in quella distribuita gatto e tigre sono i più vicini.',
            done: !!seenP[1] && !!seenP[2],
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.9: attributi condivisi */

const OBJ = [
  { name: 'auto rossa', car: 1, red: 1 },
  { name: 'bici rossa', car: 0, red: 1 },
  { name: 'auto blu', car: 1, red: 0 },
  { name: 'bici blu', car: 0, red: 0 },
]

export function Disentangle() {
  const [hold, setHold] = useState(3)
  const [n, setN] = useState(0)
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label="oggetto mai visto in addestramento"
          value={hold}
          onChange={(v) => {
            setHold(v)
            setN(n + 1)
          }}
          options={OBJ.map((o, i) => ({ value: i, label: o.name }))}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">Rappresentazione localista</div>
          <table className="dis17">
            <thead>
              <tr>
                <th />
                {OBJ.map((_, j) => (
                  <th key={j} className={j === hold ? 'is-new' : undefined}>
                    <Tex>{`u_${j + 1}`}</Tex>
                  </th>
                ))}
                <th>mi piace?</th>
              </tr>
            </thead>
            <tbody>
              {OBJ.map((o, i) => (
                <tr key={i} className={i === hold ? 'is-hold' : undefined}>
                  <th>{o.name}</th>
                  {OBJ.map((_, j) => (
                    <td key={j} className={j === hold ? 'is-new' : undefined}>
                      {i === j ? 1 : 0}
                    </td>
                  ))}
                  <td className="dis17__ans">{i === hold ? '?' : o.red ? 'sì' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="wnote">
            L’unità <Tex>{`u_${hold + 1}`}</Tex> non è mai stata attiva in addestramento: «{OBJ[hold].name}» è un caso del tutto nuovo, e non
            c’è modo di rispondere.
          </p>
        </div>
        <div>
          <div className="htf__title">Rappresentazione distribuita</div>
          <table className="dis17">
            <thead>
              <tr>
                <th />
                <th>auto (bici)</th>
                <th className="is-shared">rosso (blu)</th>
                <th>mi piace?</th>
              </tr>
            </thead>
            <tbody>
              {OBJ.map((o, i) => (
                <tr key={i} className={i === hold ? 'is-hold' : undefined}>
                  <th>{o.name}</th>
                  <td>{o.car}</td>
                  <td className="is-shared">{o.red}</td>
                  <td className="dis17__ans">
                    {o.red ? 'sì' : 'no'}
                    {i === hold ? ' (previsto)' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="wnote">
            La colonna del «rosso» è condivisa tra oggetti diversi: dagli altri tre casi si impara che mi piacciono gli oggetti rossi, e la
            risposta per «{OBJ[hold].name}» segue ({OBJ[hold].red ? 'mi piace, perché è rossa' : 'non mi piace, perché non è rossa'}).
          </p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Cambia l’oggetto mai visto: con la rappresentazione distribuita la risposta si ricava sempre dagli altri tre, con quella localista mai.',
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
          <div className="htf__title">Paesi e lingue</div>
          <Plot xDomain={[-35, -25]} yDomain={[-14.4, -6]} aspect={0.9} minH={240} maxH={340} margin={{ l: 34, r: 12 }}>
            <Axes xTicks={[-34, -32, -30, -28, -26]} yTicks={[-14, -12, -10, -8, -6]} />
            <Words words={COUNTRIES} sel={sel} onSel={pick} near={near} />
          </Plot>
        </div>
        <div>
          <div className="htf__title">Anni</div>
          <Plot xDomain={[35, 38]} yDomain={[17, 22]} aspect={0.9} minH={240} maxH={340} margin={{ l: 34, r: 12 }}>
            <Axes xTicks={[35, 36, 37, 38]} yTicks={[17, 18, 19, 20, 21, 22]} />
            <Words words={YEARS} sel={sel} onSel={pick} near={near} />
          </Plot>
        </div>
      </div>
      <div className="controls">
        {cur ? (
          <span className="verdict verdict--info">
            Le parole più vicine a «{cur[0]}»: {nearest.map((q) => q.w[0]).join(', ')}.
          </span>
        ) : (
          <p className="wnote">Clicca una parola per vedere le sue tre vicine più prossime nello spazio appreso.</p>
        )}
      </div>
      <Tasks
        items={[
          { label: 'Clicca il nome di un paese: i suoi vicini sono altri paesi o lingue.', done: picked.c },
          { label: 'Clicca un anno: i suoi vicini sono altri anni. Nessuno ha detto al modello che cosa sia un paese o un anno.', done: picked.y },
        ]}
      />
    </div>
  )
}
