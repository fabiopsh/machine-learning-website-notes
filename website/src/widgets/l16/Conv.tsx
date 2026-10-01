import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { N, digit, shift, type Img } from './digits'

/* ------------------------------------------------------------------ Fig. 16.1: le cifre */

const LEVELS = [0.2, 0.45, 0.7, 0.92]

/** una cifra 16×16: un <path> per livello di grigio */
function DigitSvg({ img, diff }: { img: Img; diff?: boolean[] }) {
  const paths = LEVELS.map((lv, k) => {
    const hi = LEVELS[k + 1] ?? 2
    let d = ''
    img.forEach((v, i) => {
      if (v >= lv - 0.12 && v < hi - 0.12) d += `M${i % N},${Math.floor(i / N)}h1v1h-1z`
    })
    return d
  })
  let dd = ''
  diff?.forEach((b, i) => {
    if (b) dd += `M${(i % N) + 0.08},${Math.floor(i / N) + 0.08}h0.84v0.84h-0.84z`
  })
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="zip16__svg" aria-hidden="true">
      {paths.map((d, k) => d && <path key={k} d={d} className="zip16__ink" opacity={LEVELS[k]} />)}
      {dd && <path d={dd} className="zip16__diff" />}
    </svg>
  )
}

const ROWS = 5

export function ZipDigits() {
  const bank = useMemo(() => Array.from({ length: ROWS }, (_, r) => Array.from({ length: 10 }, (_, d) => digit(d, r))), [])
  const [sel, setSel] = useState<[number, number]>([0, 3])
  const [off, setOff] = useState<[number, number]>([0, 0])
  const [picked, setPicked] = useState(false)
  const base = bank[sel[0]][sel[1]]
  const moved = shift(base, off[0], off[1])
  const diff = base.map((v, i) => Math.abs(v - moved[i]) > 0.25)
  const nDiff = diff.filter(Boolean).length
  const ink = base.filter((v) => v > 0.25).length
  const seen = useLatch({ shift: off[0] !== 0 || off[1] !== 0, two: Math.abs(off[0]) + Math.abs(off[1]) >= 2 })
  const move = (dx: number, dy: number) => setOff([Math.max(-3, Math.min(3, off[0] + dx)), Math.max(-3, Math.min(3, off[1] + dy))])
  return (
    <div>
      <div className="zip16__grid">
        {bank.map((row, r) =>
          row.map((img, d) => (
            <button
              key={`${r}-${d}`}
              type="button"
              className={'zip16__cell' + (sel[0] === r && sel[1] === d ? ' is-on' : '')}
              aria-label={`cifra ${d}, riga ${r + 1}`}
              aria-pressed={sel[0] === r && sel[1] === d}
              onClick={() => {
                setSel([r, d])
                setOff([0, 0])
                setPicked(true)
              }}
            >
              <DigitSvg img={img} />
            </button>
          )),
        )}
      </div>
      <div className="zip16__lab">
        <div className="zip16__big">
          <DigitSvg img={moved} diff={diff} />
        </div>
        <div className="wside">
          <div className="readouts">
            <Readout label="input della rete" value="256" sub="un valore per pixel (16 × 16)" />
            <Readout label="pixel che cambiano" tone="accent" value={`${nDiff}`} sub={`la cifra ne occupa ${ink}`} />
          </div>
          <div className="zip16__pad" role="group" aria-label="Sposta la cifra">
            <Btn onClick={() => move(-1, 0)} title="sposta a sinistra">
              ←
            </Btn>
            <Btn onClick={() => move(0, -1)} title="sposta in alto">
              ↑
            </Btn>
            <Btn onClick={() => move(0, 1)} title="sposta in basso">
              ↓
            </Btn>
            <Btn onClick={() => move(1, 0)} title="sposta a destra">
              →
            </Btn>
            <Btn icon="reset" onClick={() => setOff([0, 0])} disabled={off[0] === 0 && off[1] === 0}>
              Rimetti a posto
            </Btn>
          </div>
          <p className="wnote">
            Spostamento: {off[0]} pixel in orizzontale, {off[1]} in verticale. I pixel riquadrati sono quelli che hanno cambiato valore
            rispetto alla cifra di partenza.
          </p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Scegli una cifra dalla griglia.', done: picked },
          {
            label: 'Spostala di un pixel: per noi è la stessa cifra, ma per una rete con un input per pixel molti dei 256 valori sono cambiati.',
            done: seen.shift,
          },
          { label: 'Spostala di due o più pixel e guarda quanti input cambiano.', done: seen.two },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.2: convoluzione 1D */

const XS = [1, 3, 2, 5, 4]

export function Conv1D() {
  const [w, setW] = useState([0.5, 1, -0.5])
  const [t, setT] = useState(2)
  const [changed, setChanged] = useState(false)
  const out = (k: number) => w[0] * XS[k - 2] + w[1] * XS[k - 1] + w[2] * XS[k]
  const seen = useLatch({ t3: t === 3, t4: t === 4 })
  const X0 = 70
  const DX = 105
  const cx = (i: number) => X0 + (i - 1) * DX
  const setWi = (i: number, v: number) => {
    setW(w.map((x, j) => (j === i ? v : x)))
    setChanged(true)
  }
  const term = (i: number) => `${w[i] < 0 ? `(${fmt(w[i], 1)})` : fmt(w[i], 1)} \\cdot ${XS[t - 2 + i]}`
  return (
    <div>
      <div className="c1d16__scroll">
        <svg className="c1d16" viewBox="0 0 560 300" role="img" aria-label="Convoluzione 1D: un’unità con tre pesi scorre sulla sequenza di input">
          <text className="c1d16__cap" x={cx(t)} y={22} textAnchor="middle">
            finestra scorrevole
          </text>
          <rect className="c1d16__win" x={cx(t - 1) - 34} y={34} width={2 * DX + 68} height={64} rx={12} />
          {[1, 2, 3, 4].map((i) => (
            <line key={i} className="c1d16__stream" x1={cx(i) + 22} y1={66} x2={cx(i + 1) - 22} y2={66} />
          ))}
          {[1, 2, 3, 4].map((i) => (
            <line key={`o${i}`} className="c1d16__stream" x1={cx(i) + 22} y1={258} x2={cx(i + 1) - 22} y2={258} />
          ))}
          {[0, 1, 2].map((i) => {
            const x1 = cx(t - 1 + i)
            const mx = (x1 + cx(t)) / 2
            return (
              <g key={i}>
                <line className="c1d16__edge" x1={x1} y1={88} x2={cx(t)} y2={150} />
                <rect className="c1d16__wbox" x={mx + (i - 1) * 16 - 19} y={108} width={38} height={20} rx={6} />
                <text className="c1d16__w" x={mx + (i - 1) * 16} y={122.5} textAnchor="middle">
                  {svgScript('w', String(i + 1))}
                </text>
              </g>
            )
          })}
          <line className="c1d16__edge" x1={cx(t)} y1={188} x2={cx(t)} y2={236} />
          {[1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle className={'c1d16__x' + (Math.abs(i - t) <= 1 ? ' is-in' : '')} cx={cx(i)} cy={66} r={22} />
              <text className="c1d16__lbl" x={cx(i)} y={62} textAnchor="middle">
                {svgScript('x', String(i))}
              </text>
              <text className="c1d16__val" x={cx(i)} y={79} textAnchor="middle">
                {XS[i - 1]}
              </text>
            </g>
          ))}
          <circle className="c1d16__unit" cx={cx(t)} cy={168} r={20} />
          <text className="c1d16__sigma" x={cx(t)} y={174} textAnchor="middle">
            Σ
          </text>
          {[2, 3, 4].map((i) => (
            <g key={i} className="c1d16__pick" onClick={() => setT(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setT(i)}>
              <circle className={'c1d16__o' + (i === t ? ' is-on' : '')} cx={cx(i)} cy={258} r={22} />
              <text className="c1d16__lbl" x={cx(i)} y={254} textAnchor="middle">
                {svgScript('o', String(i))}
              </text>
              <text className="c1d16__val" x={cx(i)} y={271} textAnchor="middle">
                {fmt(out(i), 1)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">L’uscita nella posizione t = {t}</div>
        <div className="wmath">
          <Tex>{`o_${t} = w_1 x_${t - 1} + w_2 x_${t} + w_3 x_${t + 1} = ${term(0)} + ${term(1)} + ${term(2)} = ${fmt(out(t), 1)}`}</Tex>
        </div>
      </div>
      <Controls>
        <Segmented
          label="posizione dell’unità"
          value={t}
          onChange={setT}
          options={[2, 3, 4].map((v) => ({ value: v, label: <Tex>{`t = ${v}`}</Tex> }))}
        />
        {[0, 1, 2].map((i) => (
          <Slider
            key={i}
            label={<Tex>{`w_${i + 1}`}</Tex>}
            min={-1}
            max={1}
            step={0.1}
            value={w[i]}
            onChange={(v) => setWi(i, v)}
            format={(v) => fmt(v, 1)}
            width={130}
          />
        ))}
      </Controls>
      <Tasks
        items={[
          { label: 'Sposta l’unità in t = 3 e poi in t = 4: legge una finestra diversa, ma con gli stessi tre pesi.', done: seen.t3 && seen.t4 },
          { label: 'Cambia un peso: cambiano tutte le uscite insieme, perché il peso è condiviso tra le posizioni.', done: changed },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.3 e 16.5: convoluzione 2D */

const IMG = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
]
const KER = [
  [1, 0, -1],
  [2, 0, -2],
  [1, 0, -1],
]
const SZ = 5
const PAD = 1
const padded = (r: number, c: number) => (r >= PAD && r < SZ + PAD && c >= PAD && c < SZ + PAD ? IMG[r - PAD][c - PAD] : 0)

function convAt(r: number, c: number, stride: number) {
  let s = 0
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += padded(r * stride + i, c * stride + j) * KER[i][j]
  return s
}

function Cells({ cols, children, cls = '' }: { cols: number; children: ReactNode; cls?: string }) {
  return (
    <div className={'cg16 ' + cls} style={{ '--cols': cols } as CSSProperties}>
      {children}
    </div>
  )
}

export function Conv2D({ stride: stride0 = 1, pickStride = false }: { stride?: number; pickStride?: boolean }) {
  const [stride, setStride] = useState(stride0)
  const [pos, setPos] = useState(0)
  const [play, setPlay] = useState(false)
  const [steps, setSteps] = useState(0)
  const [seenOther, setSeenOther] = useState(false)
  const on = stride === 1 ? SZ : 3
  const total = on * on
  const p = Math.min(pos, total - 1)
  const r = Math.floor(p / on)
  const c = p % on
  useEffect(() => {
    if (!play) return
    const id = setInterval(() => {
      setPos((q) => (q + 1) % total)
      setSteps((n) => n + 1)
    }, 650)
    return () => clearInterval(id)
  }, [play, total])
  const inWin = (i: number, j: number) => i >= r * stride && i < r * stride + 3 && j >= c * stride && j < c * stride + 3
  const terms: string[] = []
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const v = padded(r * stride + i, c * stride + j)
      if (v !== 0 && KER[i][j] !== 0) terms.push(`${v} \\cdot ${KER[i][j] < 0 ? `(${KER[i][j]})` : KER[i][j]}`)
    }
  const val = convAt(r, c, stride)
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'immagine di input', color: 'var(--c-blue)', kind: 'square' },
            { label: 'padding (zeri)', color: 'var(--ink-4)', kind: 'square' },
            { label: 'feature map', color: 'var(--c-green)', kind: 'square' },
          ]}
        />
        {pickStride && (
          <Segmented
            size="sm"
            label="stride"
            value={stride}
            onChange={(v) => {
              setStride(v)
              setPos(0)
              setSeenOther(true)
            }}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
            ]}
          />
        )}
      </div>
      <div className="c2d16">
        <div>
          <div className="htf__title">Input 5 × 5 con padding</div>
          <Cells cols={SZ + 2 * PAD} cls="cg16--in">
            {Array.from({ length: (SZ + 2) * (SZ + 2) }, (_, k) => {
              const i = Math.floor(k / (SZ + 2))
              const j = k % (SZ + 2)
              const isPad = i < PAD || i >= SZ + PAD || j < PAD || j >= SZ + PAD
              return (
                <span key={k} className={'cg16__c' + (isPad ? ' is-pad' : ' is-img') + (inWin(i, j) ? ' is-win' : '')}>
                  {padded(i, j)}
                </span>
              )
            })}
          </Cells>
        </div>
        <div>
          <div className="htf__title">Kernel 3 × 3</div>
          <Cells cols={3} cls="cg16--ker">
            {KER.flat().map((v, k) => (
              <span key={k} className="cg16__c is-ker">
                {fmt(v, 0)}
              </span>
            ))}
          </Cells>
        </div>
        <div>
          <div className="htf__title">
            Feature map {on} × {on}
          </div>
          <Cells cols={on} cls="cg16--out">
            {Array.from({ length: total }, (_, k) => (
              <button
                key={k}
                type="button"
                className={'cg16__c is-out' + (k === p ? ' is-cur' : '')}
                onClick={() => {
                  setPos(k)
                  setPlay(false)
                  setSteps((n) => n + 1)
                }}
                aria-label={`uscita riga ${Math.floor(k / on) + 1}, colonna ${(k % on) + 1}`}
              >
                {fmt(convAt(Math.floor(k / on), k % on, stride), 0)}
              </button>
            ))}
          </Cells>
        </div>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">
          Uscita in riga {r + 1}, colonna {c + 1}
        </div>
        <div className="wmath">
          <Tex>{`${terms.length ? terms.join(' + ') : '0'} = ${val}`}</Tex>
        </div>
        <p className="wnote">Somma dei prodotti tra i 9 valori sotto il kernel e i 9 pesi (i prodotti nulli sono omessi).</p>
      </div>
      <Controls>
        <Btn icon={play ? 'pause' : 'play'} variant="soft" onClick={() => setPlay(!play)}>
          {play ? 'Ferma' : 'Fai scorrere il kernel'}
        </Btn>
        <Btn
          icon="step"
          onClick={() => {
            setPlay(false)
            setPos((p + 1) % total)
            setSteps(steps + 1)
          }}
        >
          Avanti di un passo
        </Btn>
      </Controls>
      <Tasks
        items={
          pickStride
            ? [
                { label: 'Fai avanzare il kernel: si sposta di due pixel alla volta, saltando una posizione.', done: steps >= 2 },
                { label: 'Confronta con stride 1: la feature map passa da 5 × 5 a 3 × 3.', done: seenOther },
              ]
            : [
                { label: 'Fai scorrere il kernel: è sempre lo stesso neurone, con gli stessi 9 pesi, in posizioni diverse.', done: steps >= 3 },
                { label: 'Clicca una cella della feature map per vedere da quale zona dell’immagine dipende.', done: steps >= 1 && !play },
              ]
        }
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.4: esempio simbolico */

const LET = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
const KLET = ['w', 'x', 'y', 'z']

export function ConvExample() {
  const [cur, setCur] = useState(0)
  const [n, setN] = useState(0)
  const r = Math.floor(cur / 3)
  const c = cur % 3
  const expr = (k: number) => {
    const rr = Math.floor(k / 3)
    const cc = k % 3
    return [0, 1, 2, 3].map((q) => LET[(rr + Math.floor(q / 2)) * 4 + cc + (q % 2)] + KLET[q])
  }
  return (
    <div>
      <div className="cex16">
        <div>
          <div className="htf__title">Input 3 × 4</div>
          <Cells cols={4} cls="cg16--sym">
            {LET.map((s, k) => {
              const i = Math.floor(k / 4)
              const j = k % 4
              const win = i >= r && i <= r + 1 && j >= c && j <= c + 1
              return (
                <span key={k} className={'cg16__c is-img' + (win ? ' is-win' : '')}>
                  <i>{s}</i>
                </span>
              )
            })}
          </Cells>
        </div>
        <div>
          <div className="htf__title">Kernel 2 × 2</div>
          <Cells cols={2} cls="cg16--sym">
            {KLET.map((s) => (
              <span key={s} className="cg16__c is-ker">
                <i>{s}</i>
              </span>
            ))}
          </Cells>
        </div>
        <div className="cex16__out">
          <div className="htf__title">Output 2 × 3</div>
          <div className="cex16__grid">
            {Array.from({ length: 6 }, (_, k) => (
              <button
                key={k}
                type="button"
                className={'cex16__cell' + (k === cur ? ' is-cur' : '')}
                onClick={() => {
                  setCur(k)
                  setN(n + 1)
                }}
                onPointerEnter={() => setCur(k)}
              >
                <Tex>{expr(k).join(' + ')}</Tex>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Passa sulle celle dell’output (o cliccale): ognuna è la somma dei prodotti del kernel con una porzione 2 × 2 dell’input.',
            done: n >= 1 || cur !== 0,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 16.6: max pooling */

const POOL0 = [1, 0, 2, 3, 4, 6, 6, 8, 3, 1, 1, 0, 1, 2, 2, 4]
const blockOf = (k: number) => Math.floor(Math.floor(k / 4) / 2) * 2 + Math.floor((k % 4) / 2)

export function MaxPool() {
  const [vals, setVals] = useState(POOL0)
  const [mode, setMode] = useState<'max' | 'mean'>('max')
  const [edits, setEdits] = useState(0)
  const blocks = [0, 1, 2, 3].map((b) => vals.filter((_, k) => blockOf(k) === b))
  const outs = blocks.map((b) => (mode === 'max' ? Math.max(...b) : b.reduce((s, v) => s + v, 0) / 4))
  const seen = useLatch({ mean: mode === 'mean' })
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label="operazione"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'max', label: 'massimo' },
            { value: 'mean', label: 'media' },
          ]}
        />
      </div>
      <div className="pool16">
        <div>
          <div className="htf__title">Feature map originale 4 × 4</div>
          <Cells cols={4} cls="cg16--pool">
            {vals.map((v, k) => {
              const b = blockOf(k)
              const isMax = mode === 'max' && v === outs[b] && vals.findIndex((x, q) => blockOf(q) === b && x === outs[b]) === k
              return (
                <button
                  key={k}
                  type="button"
                  className={`cg16__c is-b${b}` + (isMax ? ' is-max' : '')}
                  onClick={() => {
                    setVals(vals.map((x, q) => (q === k ? (x + 1) % 10 : x)))
                    setEdits(edits + 1)
                  }}
                  aria-label={`valore ${v}, clicca per aumentarlo`}
                >
                  {v}
                </button>
              )
            })}
          </Cells>
        </div>
        <div className="pool16__arrow" aria-hidden="true">
          →
        </div>
        <div>
          <div className="htf__title">Feature map ridotta 2 × 2</div>
          <Cells cols={2} cls="cg16--pool">
            {outs.map((v, b) => (
              <span key={b} className={`cg16__c is-b${b}`}>
                {fmt(v, mode === 'max' ? 0 : 2)}
              </span>
            ))}
          </Cells>
        </div>
      </div>
      <Controls>
        <Btn
          icon="reset"
          onClick={() => {
            setVals(POOL0)
          }}
          disabled={vals === POOL0}
        >
          Valori della figura
        </Btn>
        <p className="wnote">Filtro 2 × 2 con stride 2: un valore di uscita per ogni blocco colorato. Clicca un numero per aumentarlo.</p>
      </Controls>
      <Tasks
        items={[
          { label: 'Aumenta un valore che non è il massimo del suo blocco: l’uscita del max pooling non cambia.', done: edits >= 1 },
          { label: 'Passa alla media: ora ogni valore del blocco conta.', done: seen.mean },
        ]}
      />
    </div>
  )
}
