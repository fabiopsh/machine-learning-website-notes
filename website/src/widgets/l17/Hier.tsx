import { useState, type ReactNode } from 'react'
import { Arrow, Axes, Dot, Label, Plot } from '../../components/plot/Plot'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Segmented } from '../../components/ui/Controls'
import { rng } from '../../lib/math'

/* ------------------------------------------------------------------ piccoli disegni delle feature (generati, non fotografie) */

/** bordo: righe parallele con un certo orientamento */
function Edge({ a, n = 3 }: { a: number; n?: number }) {
  return (
    <g transform={`rotate(${a})`}>
      {Array.from({ length: n }, (_, i) => {
        const y = (i - (n - 1) / 2) * 6
        return <line key={i} className="ft17__ln" x1={-9} x2={9} y1={y} y2={y} />
      })}
    </g>
  )
}
const CORNERS: ReactNode[] = [
  <path key="a" className="ft17__ln" d="M-8,8V-8H8" />,
  <circle key="b" className="ft17__ln" r={7} />,
  <path key="c" className="ft17__ln" d="M-9,6Q0,-12 9,6" />,
]
const PARTS: ReactNode[] = [
  // ruota
  <g key="a">
    <circle className="ft17__ln" r={8} />
    <circle className="ft17__ln" r={2.5} />
    <path className="ft17__ln" d="M0,-8V8M-8,0H8" />
  </g>,
  // volto
  <g key="b">
    <ellipse className="ft17__ln" rx={6.5} ry={8.5} />
    <path className="ft17__ln" d="M-3,-2h0.1M3,-2h0.1M-3,4Q0,6 3,4" />
  </g>,
  // zampa / arto
  <path key="c" className="ft17__ln" d="M-6,-9V2Q-6,9 1,9H7M-1,-9V1" />,
]

type Unit = { layer: number; i: number }
const LAYER_INFO = [
  { name: 'Strato visibile', sub: 'pixel di input', text: 'I pixel dell’immagine: la rappresentazione più grezza, un vettore di intensità.' },
  { name: '1° strato nascosto', sub: 'bordi', text: 'Le prime unità rilevano bordi (linee orizzontali, verticali…) combinando i pixel: proprio come farebbe un semplice filtro convolutivo lineare.' },
  { name: '2° strato nascosto', sub: 'angoli e contorni', text: 'I bordi formano motivi: angoli e contorni, ottenuti combinando i bordi dello strato precedente.' },
  { name: '3° strato nascosto', sub: 'parti di oggetti', text: 'I motivi si assemblano in parti di oggetti (la ruota per l’auto, il volto o la mano per la persona…).' },
  { name: 'Output', sub: 'identità dell’oggetto', text: 'Le parti formano oggetti: sulla nuova rappresentazione la classificazione nell’ultimo strato è semplice.' },
]
const OUT = ['auto', 'persona', 'animale']

export function Hierarchy() {
  const [sel, setSel] = useState<Unit>({ layer: 2, i: 0 })
  const [seen, setSeen] = useState<Record<number, boolean>>({})
  const X = [150, 250, 350]
  const Y = (l: number) => 392 - l * 88
  const R = 27
  const info = LAYER_INFO[sel.layer]
  const pick = (u: Unit) => {
    setSel(u)
    setSeen((s) => ({ ...s, [u.layer]: true }))
  }
  return (
    <div className="wgrid">
      <svg className="hier17" viewBox="0 0 520 432" role="img" aria-label="Rete profonda: dai pixel ai bordi, agli angoli e contorni, alle parti di oggetti, all’identità">
        {[0, 1, 2, 3].map((l) =>
          X.map((x1, i) =>
            X.map((x2, j) => {
              const hot = sel.layer === l + 1 && sel.i === j
              const dx = x2 - x1
              const dy = Y(l + 1) - Y(l)
              const len = Math.hypot(dx, dy)
              return (
                <line
                  key={`${l}-${i}-${j}`}
                  className={'hier17__edge' + (hot ? ' is-hot' : '')}
                  x1={x1 + (dx / len) * R}
                  y1={Y(l) + (dy / len) * R}
                  x2={x2 - (dx / len) * R}
                  y2={Y(l + 1) - (dy / len) * R}
                />
              )
            }),
          ),
        )}
        {[0, 1, 2, 3, 4].map((l) =>
          X.map((x, i) => {
            const on = sel.layer === l && sel.i === i
            const feeds = sel.layer === l + 1
            return (
              <g
                key={`${l}-${i}`}
                className={'hier17__unit' + (on ? ' is-on' : '') + (feeds ? ' is-feed' : '')}
                transform={`translate(${x} ${Y(l)})`}
                role="button"
                tabIndex={0}
                aria-label={`${LAYER_INFO[l].name}, unità ${i + 1}`}
                aria-pressed={on}
                onClick={() => pick({ layer: l, i })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick({ layer: l, i })}
              >
                <circle r={R} />
                {l === 0 && <rect className={`ft17__px ft17__px--${i}`} x={-13} y={-13} width={26} height={26} rx={2} />}
                {l === 1 && <Edge a={[0, 90, 45][i]} />}
                {l === 2 && CORNERS[i]}
                {l === 3 && PARTS[i]}
                {l === 4 && (
                  <text className="hier17__out" textAnchor="middle" y={4}>
                    {OUT[i]}
                  </text>
                )}
              </g>
            )
          }),
        )}
        {LAYER_INFO.map((ly, l) => (
          <g key={l} className={'hier17__lab' + (sel.layer === l ? ' is-on' : '')}>
            <text x={398} y={Y(l) - 3}>
              {ly.name}
            </text>
            <text x={398} y={Y(l) + 13} className="hier17__sub">
              ({ly.sub})
            </text>
          </g>
        ))}
        <text className="hier17__sub" x={98} y={Y(0) + 4} textAnchor="end">
          immagine →
        </text>
      </svg>
      <div className="wside">
        <div className="wpanel">
          <div className="wpanel__title">
            {info.name}: {info.sub}
          </div>
          {info.text}
          {sel.layer > 0 && <p className="wnote">Le linee evidenziate sono le unità dello strato precedente che questa unità combina.</p>}
        </div>
        <Tasks
          items={[
            { label: 'Clicca un’unità del 1° strato nascosto: un bordo è una combinazione di pixel.', done: !!seen[1] },
            { label: 'Sali al 3° strato: una parte di oggetto è fatta di angoli e contorni, fatti a loro volta di bordi.', done: !!seen[3] },
            { label: 'Clicca un’uscita: l’identità dell’oggetto si decide sulle parti, non sui pixel.', done: !!seen[4] },
          ]}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.2: feature di basso, medio e alto livello */

function Patch({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="-12 -12 24 24" className="ft17__patch" aria-hidden="true">
      {children}
    </svg>
  )
}

const FACE_PARTS: ReactNode[] = [
  <path key="0" className="ft17__ln" d="M-8,0Q0,-7 8,0Q0,6 -8,0M0,-1.5a1.6,1.6 0 1 0 0.1,0" />, // occhio
  <path key="1" className="ft17__ln" d="M-8,-2Q0,-8 8,-3" />, // sopracciglio
  <path key="2" className="ft17__ln" d="M1,-9L-3,4Q0,7 4,4" />, // naso
  <path key="3" className="ft17__ln" d="M-8,-1Q0,7 8,-1M-8,-1Q0,2 8,-1" />, // bocca
  <path key="4" className="ft17__ln" d="M-3,-8Q7,-7 3,2Q2,7 -3,8" />, // orecchio
  <path key="5" className="ft17__ln" d="M-8,3Q0,-6 8,3" />, // palpebra
  <path key="6" className="ft17__ln" d="M-7,-6Q-2,6 7,7" />, // guancia / mento
  <path key="7" className="ft17__ln" d="M-8,-3Q0,5 8,-3" />, // sorriso
]

function Face({ k }: { k: number }) {
  const r = rng(170 + k * 13)
  const w = 6.5 + r() * 2
  const h = 8.5 + r() * 1.5
  const eye = 2.4 + r() * 1.2
  const smile = 1 + r() * 3
  return (
    <g>
      <ellipse className="ft17__ln" rx={w} ry={h} />
      <path className="ft17__ln" d={`M${-eye - 1},-2h1.4M${eye - 0.4},-2h1.4M0,-1V2.2M-3,5Q0,${5 + smile} 3,5`} />
    </g>
  )
}

const LEVELS = [
  {
    id: 'raw',
    name: 'Dati grezzi',
    text: 'L’immagine di input (nella figura originale, la fotografia di un volto): solo intensità dei pixel.',
  },
  { id: 'low', name: 'Feature di basso livello', text: 'I primi strati estraggono bordi con orientamenti diversi.' },
  { id: 'mid', name: 'Feature di livello medio', text: 'Gli strati intermedi combinano i bordi in parti del volto: occhi, naso, bocca…' },
  { id: 'high', name: 'Feature di alto livello', text: 'Gli ultimi strati combinano le parti in volti interi.' },
] as const

export function FaceFeatures() {
  const [lv, setLv] = useState(1)
  const [seen, setSeen] = useState<Record<number, boolean>>({})
  const r = rng(1702)
  const noise = Array.from({ length: 64 }, () => r())
  const cells = (l: number): ReactNode[] => {
    if (l === 0) return []
    if (l === 1) return Array.from({ length: 16 }, (_, i) => <Edge key={i} a={(i * 180) / 16} n={2 + (i % 2)} />)
    if (l === 2) return Array.from({ length: 16 }, (_, i) => FACE_PARTS[(i * 3) % FACE_PARTS.length])
    return Array.from({ length: 16 }, (_, i) => <Face key={i} k={i} />)
  }
  // blocchi della rete: [numero di unità] per colonna, e a quale livello appartengono
  const NET = [
    { n: 5, lv: 0 },
    { n: 4, lv: 1 },
    { n: 4, lv: 1 },
    { n: 3, lv: 2 },
    { n: 3, lv: 2 },
    { n: 5, lv: 3 },
    { n: 3, lv: 3 },
    { n: 3, lv: 3 },
  ]
  return (
    <div>
      <div className="lvl17">
        {LEVELS.map((L, l) => (
          <button
            key={L.id}
            type="button"
            className={'lvl17__card' + (lv === l ? ' is-on' : '')}
            aria-pressed={lv === l}
            onClick={() => {
              setLv(l)
              setSeen((s) => ({ ...s, [l]: true }))
            }}
          >
            <span className="lvl17__name">{L.name}</span>
            {l === 0 ? (
              <span className="lvl17__raw">
                {noise.map((v, i) => (
                  <i key={i} style={{ opacity: 0.12 + v * 0.7 }} />
                ))}
              </span>
            ) : (
              <span className="lvl17__grid">
                {cells(l).map((c, i) => (
                  <Patch key={i}>{c}</Patch>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
      <svg className="dnn17" viewBox="0 0 640 150" role="img" aria-label="Rete profonda: dall’input al risultato">
        <text className="dnn17__t" x={8} y={79}>
          Input
        </text>
        {NET.map((c, k) => {
          const x = 78 + k * 66
          return (
            <g key={k} className={'dnn17__col' + (c.lv === lv ? ' is-on' : '')}>
              {k + 1 < NET.length &&
                Array.from({ length: c.n }, (_, i) =>
                  Array.from({ length: NET[k + 1].n }, (_, j) => (
                    <line
                      key={`${i}-${j}`}
                      x1={x}
                      y1={75 + (i - (c.n - 1) / 2) * 26}
                      x2={x + 66}
                      y2={75 + (j - (NET[k + 1].n - 1) / 2) * 26}
                    />
                  )),
                )}
              {Array.from({ length: c.n }, (_, i) => (
                <circle key={i} cx={x} cy={75 + (i - (c.n - 1) / 2) * 26} r={10} />
              ))}
            </g>
          )
        })}
        <text className="dnn17__t" x={632} y={79} textAnchor="end">
          Risultato
        </text>
      </svg>
      <div className="wgrid">
        <div className="wpanel">
          <div className="wpanel__title">{LEVELS[lv].name}</div>
          {LEVELS[lv].text}
        </div>
        <div className="wpanel">
          <div className="wpanel__title">I numeri dell’applicazione (dalla slide)</div>
          Obiettivo: identificare un volto. Dati di training: 10–100 milioni di immagini. Architettura: circa 10 strati, 1 miliardo di
          parametri. Addestramento: circa 30 exaflop, circa 30 giorni di GPU.
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Clicca i tre livelli di feature, dal basso all’alto: nella rete si accendono gli strati che li calcolano.',
            done: !!seen[1] && !!seen[2] && !!seen[3],
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.3: operazioni sulle rappresentazioni */

function FaceGlyph({ woman, glasses }: { woman: boolean; glasses: boolean }) {
  return (
    <svg viewBox="-22 -24 44 48" className="fg17" aria-hidden="true">
      {woman ? <path className="fg17__hair" d="M-17,16V-6Q-17,-22 0,-22Q17,-22 17,-6V16H10V-4H-10V16Z" /> : <path className="fg17__hair" d="M-13,-8Q-13,-21 0,-21Q13,-21 13,-8Q0,-14 -13,-8Z" />}
      <ellipse className="fg17__head" cx={0} cy={2} rx={11.5} ry={14} />
      {glasses ? (
        <g className="fg17__gl">
          <rect x={-10} y={-4} width={8.4} height={6} rx={2} />
          <rect x={1.6} y={-4} width={8.4} height={6} rx={2} />
          <path d="M-1.6,-1.5H1.6" />
        </g>
      ) : (
        <path className="fg17__eye" d="M-6,-1h1.6M4.4,-1h1.6" />
      )}
      <path className="fg17__eye" d={woman ? 'M-4,8Q0,11.5 4,8' : 'M-3.5,9H3.5'} />
    </svg>
  )
}

type Ex = {
  id: string
  label: string
  /** a − b + c ≈ d */
  names: [string, string, string, string]
  axes: [string, string]
  note: string
}
const EXS: Ex[] = [
  {
    id: 'occhiali',
    label: 'occhiali',
    names: ['uomo con occhiali', 'uomo', 'donna', 'donna con occhiali'],
    axes: ['genere', 'occhiali'],
    note: 'La differenza tra «uomo con occhiali» e «uomo» cattura il concetto di occhiali, che si può sommare a «donna».',
  },
  {
    id: 're',
    label: 're e regina',
    names: ['re', 'maschio', 'femmina', 'regina'],
    axes: ['genere', 'monarchia'],
    note: 'La differenza tra «re» e «maschio» cattura il concetto di monarchia.',
  },
  {
    id: 'capitali',
    label: 'capitali',
    names: ['Parigi', 'Francia', 'Polonia', 'Varsavia'],
    axes: ['paese', 'capitale'],
    note: 'La differenza tra «Parigi» e «Francia» cattura il concetto di capitale.',
  },
]
// posizioni illustrative nello spazio delle rappresentazioni: a = (0,1), b = (0,0), c = (1,0), d ≈ (1,1)
const PA = { x: 0.6, y: 2.4 }
const PB = { x: 0.7, y: 0.7 }
const PC = { x: 2.5, y: 0.9 }
const PD = { x: 2.45, y: 2.55 }

export function VectorArithmetic() {
  const [k, setK] = useState(0)
  const [seen, setSeen] = useState<Record<number, boolean>>({})
  const ex = EXS[k]
  const res = { x: PA.x - PB.x + PC.x, y: PA.y - PB.y + PC.y }
  const faces = k === 0
  const glyphs = [
    { woman: false, glasses: true },
    { woman: false, glasses: false },
    { woman: true, glasses: false },
    { woman: true, glasses: true },
  ]
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label="esempio"
          value={k}
          onChange={(v) => {
            setK(v)
            setSeen((s) => ({ ...s, [v]: true }))
          }}
          options={EXS.map((e, i) => ({ value: i, label: e.label }))}
        />
      </div>
      <div className="va17__eq">
        {ex.names.map((nm, i) => (
          <span key={i} className="va17__term">
            {i > 0 && <span className="va17__op">{['', '−', '+', '≈'][i]}</span>}
            <span className="va17__box">
              {faces && <FaceGlyph {...glyphs[i]} />}
              <span>{faces ? nm : <Tex>{`\\text{Rep}(\\text{${nm}})`}</Tex>}</span>
            </span>
          </span>
        ))}
      </div>
      <Plot xDomain={[0, 3.4]} yDomain={[0, 3.2]} aspect={0.5} minH={220} maxH={320} margin={{ l: 30, b: 46 }}>
        <Axes xTicks={[]} yTicks={[]} xLabel={`una direzione: ${ex.axes[0]}`} yLabel={`un’altra: ${ex.axes[1]}`} grid={false} />
        <Arrow from={PB} to={PA} color="var(--c-green)" />
        <Arrow from={PC} to={res} color="var(--c-green)" />
        <Dot x={PA.x} y={PA.y} color="var(--c-blue)" r={5} />
        <Dot x={PB.x} y={PB.y} color="var(--c-blue)" r={5} />
        <Dot x={PC.x} y={PC.y} color="var(--c-blue)" r={5} />
        <Dot x={PD.x} y={PD.y} color="var(--c-orange)" r={5} />
        <Dot x={res.x} y={res.y} color="var(--c-green)" r={4} hollow />
        <Label x={PA.x} y={PA.y} dx={10} dy={-8}>
          {ex.names[0]}
        </Label>
        <Label x={PB.x} y={PB.y} dx={10} dy={16}>
          {ex.names[1]}
        </Label>
        <Label x={PC.x} y={PC.y} dx={10} dy={16}>
          {ex.names[2]}
        </Label>
        <Label x={PD.x} y={PD.y} dx={10} dy={-8} className="plot-label--strong">
          {ex.names[3]}
        </Label>
      </Plot>
      <p className="wnote">
        {ex.note} Le frecce verdi sono la stessa differenza, applicata a due punti di partenza diversi: il risultato (cerchio vuoto) cade
        vicino alla rappresentazione attesa (arancione). Le posizioni sono illustrative.
      </p>
      <Tasks
        items={[
          {
            label: 'Guarda anche gli esempi con le parole: la stessa operazione tra vettori funziona per «re − maschio + femmina» e per le capitali.',
            done: !!seen[1] && !!seen[2],
          },
        ]}
      />
    </div>
  )
}
