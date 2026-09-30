import { useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { separate } from '../l05/Separability'

type P = { x: number; y: number }
type Line = { w1: number; w2: number; w0: number }

/* ------------------------------------------------------------------ dicotomie in miniatura */

const BOX: [number, number] = [0, 3]

/** Retta per una dicotomia: quella a margine massimo, oppure (etichette tutte uguali) una retta a lato dei punti. */
function lineFor(pts: P[], lab: number[]): Line | null {
  if (lab.every((v) => v === lab[0])) {
    const xs = pts.map((p) => p.x)
    return lab[0] === 1 ? { w1: 1, w2: 0, w0: -(Math.min(...xs) - 0.35) } : { w1: 1, w2: 0, w0: -(Math.max(...xs) + 0.35) }
  }
  return separate(pts, lab).line
}

/** Segmento della retta w·x + w0 = 0 dentro il riquadro, più il punto medio (per la freccia di w). */
function clipLine(l: Line): [P, P] | null {
  const out: P[] = []
  const [a, b] = BOX
  const add = (p: P) => {
    if (
      p.x >= a - 1e-9 &&
      p.x <= b + 1e-9 &&
      p.y >= a - 1e-9 &&
      p.y <= b + 1e-9 &&
      !out.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-6)
    )
      out.push(p)
  }
  if (Math.abs(l.w2) > 1e-9) for (const x of [a, b]) add({ x, y: (-l.w0 - l.w1 * x) / l.w2 })
  if (Math.abs(l.w1) > 1e-9) for (const y of [a, b]) add({ x: (-l.w0 - l.w2 * y) / l.w1, y })
  return out.length >= 2 ? [out[0], out[1]] : null
}

function Mini({ pts, lab, line, bad, size = 96 }: { pts: P[]; lab: number[]; line?: Line | null; bad?: boolean; size?: number }) {
  const s = (v: number) => 6 + ((v - BOX[0]) / (BOX[1] - BOX[0])) * (size - 12)
  const sy = (v: number) => size - s(v)
  const seg = line ? clipLine(line) : null
  let arrow = null
  if (line && seg) {
    const mx = (seg[0].x + seg[1].x) / 2
    const my = (seg[0].y + seg[1].y) / 2
    const n = Math.hypot(line.w1, line.w2)
    const ex = mx + (line.w1 / n) * 0.45
    const ey = my + (line.w2 / n) * 0.45
    arrow = (
      <g className="vc12__w">
        <line x1={s(mx)} y1={sy(my)} x2={s(ex)} y2={sy(ey)} />
        <circle cx={s(ex)} cy={sy(ey)} r={2.2} />
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {seg && <line className="vc12__line" x1={s(seg[0].x)} y1={sy(seg[0].y)} x2={s(seg[1].x)} y2={sy(seg[1].y)} />}
      {arrow}
      {pts.map((p, i) => (
        <circle key={i} cx={s(p.x)} cy={sy(p.y)} r={5} className={lab[i] ? 'vc12__pt is-pos' : 'vc12__pt'} />
      ))}
      {bad && <path className="vc12__x" d={`M${size - 16},6 l9,9 m0,-9 l-9,9`} />}
    </svg>
  )
}

const labelings = (n: number) => Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1))
const signs = (lab: number[]) => lab.map((v) => (v ? '+' : '−')).join('')

const LEG_POS = { label: <>etichetta +1</>, color: 'var(--c-blue)', kind: 'dot' as const }
const LEG_NEG = { label: <>etichetta −1 (vuoto)</>, color: 'var(--ink-3)', kind: 'dot' as const }

/* ------------------------------------------------------------------ Fig. 12.1 */

const PTS_N: Record<number, P[]> = {
  1: [{ x: 1.5, y: 1.5 }],
  2: [
    { x: 0.9, y: 1.2 },
    { x: 2.1, y: 1.8 },
  ],
  3: [
    { x: 0.6, y: 1.9 },
    { x: 1.6, y: 0.7 },
    { x: 2.4, y: 2.2 },
  ],
  4: [
    { x: 0.6, y: 1.9 },
    { x: 1.6, y: 0.6 },
    { x: 2.4, y: 2.2 },
    { x: 1.5, y: 2.6 },
  ],
}

export function Dichotomies() {
  const [n, setN] = useState(3)
  const labs = labelings(n)
  const seen = useLatch({ four: n === 4, one: n === 1 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          label={
            <>
              numero di punti <Tex>N</Tex>
            </>
          }
          value={n}
          onChange={setN}
          options={[1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }))}
        />
        <Legend items={[LEG_POS, LEG_NEG]} />
      </div>
      <div className={`vc12__grid${n === 4 ? ' vc12__grid--dense' : ''}`}>
        {labs.map((lab, k) => (
          <div key={k} className="vc12__cell">
            <Mini pts={PTS_N[n]} lab={lab} size={n === 4 ? 78 : 96} />
            <span>{signs(lab)}</span>
          </div>
        ))}
      </div>
      <div className="readouts">
        <Readout label="dicotomie possibili" tone="accent" value={<Tex>{`2^{${n}} = ${2 ** n}`}</Tex>} />
      </div>
      <Tasks
        items={[
          { label: 'Passa a N = 4: ogni punto in più raddoppia le dicotomie.', done: seen.four },
          { label: 'Torna a N = 1: le dicotomie sono solo due, + e −.', done: seen.one },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 12.2 */

const START3 = PTS_N[3]

export function ShatterLines() {
  const [pts, setPts] = useState<P[]>(START3)
  const [sel, setSel] = useState(5)
  const labs = labelings(3)
  const lines = labs.map((lab) => lineFor(pts, lab))
  const ok = lines.filter(Boolean).length
  const cur = lines[sel]
  const seen = useLatch({ lost: ok < 8, sel: sel !== 5 })
  return (
    <div>
      <div className="wbar">
        <Legend items={[LEG_POS, LEG_NEG, { label: 'retta; la freccia indica il lato +1', color: 'var(--c-red)' }]} />
      </div>
      <div className="wgrid">
        <div className="vc12__big">
          <Plot xDomain={BOX} yDomain={BOX} equal aspect={1} maxH={300} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
            <Axes hideX hideY grid={false} />
            {cur && <BigLine l={cur} />}
            {pts.map((p, i) => (
              <Dot key={i} x={p.x} y={p.y} r={11} color={labs[sel][i] ? 'var(--c-blue)' : 'var(--ink-2)'} hollow={!labs[sel][i]} />
            ))}
            {pts.map((p, i) => (
              <Handle
                key={`h${i}`}
                x={p.x}
                y={p.y}
                r={3.5}
                label={`punto ${i + 1}`}
                onMove={(q) => setPts(pts.map((o, j) => (j === i ? q : o)))}
              />
            ))}
          </Plot>
        </div>
        <div className="wside">
          <div className="vc12__grid vc12__grid--side" role="radiogroup" aria-label="Dicotomie dei tre punti">
            {labs.map((lab, k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={k === sel}
                className={`vc12__cell vc12__cell--btn${k === sel ? ' is-on' : ''}${lines[k] ? '' : ' is-no'}`}
                onClick={() => setSel(k)}
              >
                <Mini pts={pts} lab={lab} line={lines[k]} bad={!lines[k]} size={72} />
                <span>{signs(lab)}</span>
              </button>
            ))}
          </div>
          <Readout label="dicotomie rappresentate da una retta" value={`${ok} su 8`} />
          <div className={`verdict ${ok === 8 ? 'verdict--good' : 'verdict--warn'}`}>
            <span>
              {ok === 8
                ? 'Le rette frammentano questi 3 punti.'
                : 'Questa configurazione non è frammentata, ma basta che una configurazione di 3 punti lo sia.'}
            </span>
          </div>
          <Btn
            onClick={() =>
              setPts([
                { x: 0.5, y: 1.5 },
                { x: 1.5, y: 1.5 },
                { x: 2.5, y: 1.5 },
              ])
            }
          >
            Allinea i punti
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Clicca le dicotomie una per una: per ognuna c’è una retta.', done: seen.sel },
          { label: 'Allinea i tre punti: la dicotomia con quello centrale diverso non è più separabile.', done: seen.lost },
        ]}
      />
    </div>
  )
}

function BigLine({ l }: { l: Line }) {
  const seg = clipLine(l)
  if (!seg) return null
  const mx = (seg[0].x + seg[1].x) / 2
  const my = (seg[0].y + seg[1].y) / 2
  const n = Math.hypot(l.w1, l.w2)
  return (
    <>
      <Polyline pts={seg} color="var(--c-red)" width={2.4} />
      <Polyline
        pts={[
          { x: mx, y: my },
          { x: mx + (l.w1 / n) * 0.4, y: my + (l.w2 / n) * 0.4 },
        ]}
        color="var(--c-red)"
        width={2}
      />
      <Dot x={mx + (l.w1 / n) * 0.4} y={my + (l.w2 / n) * 0.4} r={3.5} color="var(--c-red)" />
    </>
  )
}

/* ------------------------------------------------------------------ Fig. 12.3 */

const START4: P[] = [
  { x: 0.9, y: 2.5 },
  { x: 2.3, y: 1.8 },
  { x: 0.8, y: 1.2 },
  { x: 1.9, y: 0.5 },
]

const cross = (o: P, a: P, b: P) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

/** Punti sul bordo dell'inviluppo convesso (Andrew). */
function hull(pts: P[]) {
  const idx = pts.map((_, i) => i).sort((i, j) => pts[i].x - pts[j].x || pts[i].y - pts[j].y)
  const lower: number[] = []
  for (const i of idx) {
    while (lower.length >= 2 && cross(pts[lower[lower.length - 2]], pts[lower[lower.length - 1]], pts[i]) <= 0) lower.pop()
    lower.push(i)
  }
  const upper: number[] = []
  for (const i of [...idx].reverse()) {
    while (upper.length >= 2 && cross(pts[upper[upper.length - 2]], pts[upper[upper.length - 1]], pts[i]) <= 0) upper.pop()
    upper.push(i)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

export function FourPoints() {
  const [pts, setPts] = useState<P[]>(START4)
  const labs = labelings(4)
  const sepOk = labs.map((lab) => separate(pts, lab).ok)
  const bad = labs.filter((_, k) => !sepOk[k])
  const H = hull(pts)
  const convex = H.length === 4
  // etichettatura mostrata: quella non separabile con il primo punto a +1
  const show = bad.find((l) => l[0] === 1) ?? bad[0]
  const inner = convex ? -1 : ([0, 1, 2, 3].find((i) => !H.includes(i)) ?? -1)
  const seen = useLatch({ inner: !convex && inner >= 0, convex })
  const segs: [P, P][] = []
  if (show) {
    const pos = [0, 1, 2, 3].filter((i) => show[i] === 1)
    const neg = [0, 1, 2, 3].filter((i) => show[i] === 0)
    if (pos.length === 2 && neg.length === 2) {
      segs.push([pts[pos[0]], pts[pos[1]]], [pts[neg[0]], pts[neg[1]]])
    } else {
      const out = [0, 1, 2, 3].filter((i) => i !== inner)
      for (let a = 0; a < 3; a++) segs.push([pts[out[a]], pts[out[(a + 1) % 3]]])
    }
  }
  return (
    <div>
      <div className="wbar">
        <Legend items={[LEG_POS, LEG_NEG, { label: 'segmenti che si incrociano', color: 'var(--c-violet)' }]} />
      </div>
      <div className="wgrid">
        <div className="vc12__big">
          <Plot xDomain={BOX} yDomain={BOX} equal aspect={1} maxH={320} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
            <Axes hideX hideY grid={false} />
            {segs.map((s, i) => (
              <Polyline key={i} pts={s} color="var(--c-violet)" width={2} dash={convex ? undefined : '5 4'} />
            ))}
            {pts.map((p, i) => (
              <Dot key={i} x={p.x} y={p.y} r={11} color={show && show[i] ? 'var(--c-blue)' : 'var(--ink-2)'} hollow={!(show && show[i])} />
            ))}
            {pts.map((p, i) => (
              <Handle
                key={`h${i}`}
                x={p.x}
                y={p.y}
                r={3.5}
                label={`punto ${i + 1}`}
                onMove={(q) => setPts(pts.map((o, j) => (j === i ? q : o)))}
              />
            ))}
          </Plot>
        </div>
        <div className="wside">
          <Readout label="etichettature separabili da una retta" value={`${16 - bad.length} su 16`} />
          <div className="wpanel">
            <div className="wpanel__title">{convex ? 'Quadrilatero convesso' : 'Un punto dentro il triangolo degli altri'}</div>
            <p className="wnote">
              {convex
                ? 'Le due diagonali si incrociano: mettendo nella stessa classe gli estremi di ciascuna diagonale si ottiene lo XOR, che nessuna retta separa.'
                : 'Il punto interno con classe diversa dagli altri tre: ogni retta che lascia da una parte i tre vertici lascia dalla stessa parte anche il triangolo, e quindi il punto interno.'}
            </p>
          </div>
          <div className="vc12__grid vc12__grid--side">
            {bad.map((lab, k) => (
              <div key={k} className="vc12__cell">
                <Mini pts={pts} lab={lab} bad size={64} />
                <span>{signs(lab)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Trascina un punto dentro il triangolo formato dagli altri tre: cambia il caso, ma resta un’etichettatura impossibile.',
            done: seen.inner,
          },
          {
            label:
              'Riporta i punti a formare un quadrilatero convesso: le etichettature impossibili sono di nuovo lo XOR e il suo complemento.',
            done: seen.convex && seen.inner,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ SRM (12.4, 12.5) */

// errore di training illustrativo, decrescente con la VC-dim; VC-confidence di Vapnik (loss 0/1, δ = 0,05)
const rempV = (h: number) => 0.03 + 0.6 * Math.exp(-h / 12)
const epsV = (h: number, l: number) => Math.sqrt((h * (Math.log((2 * l) / h) + 1) - Math.log(0.05 / 4)) / l)
const VCS = [4, 8, 16, 32, 64, 128]
const LS = [200, 1000, 5000, 20000]

function srm(l: number) {
  const rows = VCS.map((h) => ({ h, e: rempV(h), c: epsV(h, l) }))
  const b = rows.map((r) => r.e + r.c)
  return { rows, best: b.indexOf(Math.min(...b)) }
}

const Hi = (i: number) => <Tex>{`H_${i + 1}`}</Tex>

/** Struttura annidata come ellissi concentriche cliccabili (H1 la più interna). */
function Nested({ sel, onSel }: { sel: number; onSel: (i: number) => void }) {
  const W = 360
  const HH = 120
  return (
    <svg className="srm12__nest" viewBox={`0 0 ${W} ${HH}`} role="radiogroup" aria-label="Struttura annidata di spazi delle ipotesi">
      {VCS.map((_, j) => {
        const i = VCS.length - 1 - j
        const rx = 30 + i * 22
        const ry = 18 + i * 7.5
        return (
          <g
            key={i}
            role="radio"
            aria-checked={i === sel}
            tabIndex={0}
            className={`srm12__set${i === sel ? ' is-on' : ''}`}
            onClick={() => onSel(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSel(i)}
          >
            <ellipse cx={40 + rx} cy={HH / 2} rx={rx} ry={ry} />
            <text x={40 + 2 * rx - 14} y={HH / 2 + 5} textAnchor="middle">
              {svgScript('H', String(i + 1), 'sub')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function SrmStructure() {
  const [li, setLi] = useState(0)
  const [sel, setSel] = useState(2)
  const l = LS[li]
  const { rows, best } = srm(l)
  const lg = (h: number) => Math.log2(h)
  const r = rows[sel]
  const seen = useLatch({ more: li > 0 && best !== 2, pick: sel !== 2 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            {
              label: (
                <>
                  errore empirico <Tex>{'R_{emp}'}</Tex>
                </>
              ),
              color: 'var(--c-blue)',
            },
            {
              label: (
                <>
                  VC-confidence <Tex>{'\\varepsilon'}</Tex>
                </>
              ),
              color: 'var(--c-orange)',
            },
            { label: <>bound sul rischio vero</>, color: 'var(--c-violet)' },
          ]}
        />
      </div>
      <Plot xDomain={[1.6, 7.4]} yDomain={[0, 1.3]} aspect={0.5} margin={{ b: 40 }}>
        <Axes
          xTicks={VCS.map(lg)}
          xFormat={(v) => String(Math.round(2 ** v))}
          yTicks={[0, 0.5, 1]}
          xLabel="VC-dim (scala logaritmica)"
          yLabel="errore"
        />
        {rows.map((q, i) => (
          <Polyline
            key={i}
            pts={[
              { x: lg(q.h), y: 0 },
              { x: lg(q.h), y: 1.3 },
            ]}
            color={i === sel ? 'var(--accent)' : 'var(--ink-4)'}
            width={i === sel ? 1.6 : 1}
            dash="3 4"
          />
        ))}
        <FnPath f={(x) => rempV(2 ** x)} color="var(--c-blue)" width={2.2} />
        <FnPath f={(x) => epsV(2 ** x, l)} color="var(--c-orange)" width={2.2} />
        <FnPath f={(x) => rempV(2 ** x) + epsV(2 ** x, l)} color="var(--c-violet)" width={2.8} />
        {rows.map((q, i) => (
          <Dot key={i} x={lg(q.h)} y={q.e + q.c} r={i === best ? 6 : 4} color="var(--c-violet)" hollow={i !== best} />
        ))}
        <SetLabels />
        <Label x={lg(rows[best].h)} y={rows[best].e + rows[best].c} dy={-14} anchor="middle" className="plot-label--strong">
          minimo del bound
        </Label>
      </Plot>
      <div className="wgrid">
        <Nested sel={sel} onSel={setSel} />
        <div className="wside">
          <Segmented
            label={
              <>
                numero di dati <Tex>l</Tex>
              </>
            }
            size="sm"
            value={li}
            onChange={setLi}
            options={LS.map((v, i) => ({ value: i, label: v.toLocaleString('it-IT') }))}
          />
          <div className="readouts">
            <Readout label={<>{Hi(sel)}: VC-dim</>} value={String(r.h)} />
            <Readout label={<Tex>{'R_{emp}'}</Tex>} tone="blue" value={fmt(r.e, 2)} />
            <Readout label={<Tex>{'\\varepsilon'}</Tex>} tone="orange" value={fmt(r.c, 2)} />
            <Readout label="bound" tone="violet" value={fmt(r.e + r.c, 2)} />
          </div>
          <div className="wnote">La SRM sceglie {Hi(best)}. Clicca un insieme della struttura per leggerne i valori.</div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Clicca un insieme più grande: l’errore empirico scende, ma la VC-confidence sale di più.', done: seen.pick },
          {
            label: (
              <>
                Aumenta i dati <Tex>l</Tex>: la VC-confidence si abbassa e la SRM può permettersi uno spazio più ricco.
              </>
            ),
            done: seen.more,
          },
        ]}
      />
    </div>
  )
}

function SetLabels() {
  const { x, y } = usePlot()
  return (
    <g>
      {VCS.map((h, i) => (
        <text key={h} x={x(Math.log2(h))} y={y(1.3) + 14} textAnchor="middle" className="plot-label plot-label--math">
          {svgScript('H', String(i + 1), 'sub')}
        </text>
      ))}
    </g>
  )
}

export function SrmTable() {
  const [li, setLi] = useState(0)
  const { rows, best } = srm(LS[li])
  const max = Math.max(...rows.map((r) => r.e + r.c))
  const seen = useLatch({ more: best !== 2 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          label={
            <>
              numero di dati <Tex>l</Tex>
            </>
          }
          value={li}
          onChange={setLi}
          options={LS.map((v, i) => ({ value: i, label: v.toLocaleString('it-IT') }))}
        />
        <Legend
          items={[
            { label: 'errore di training', color: 'var(--c-blue)', kind: 'square' },
            { label: 'VC-confidence', color: 'var(--c-orange)', kind: 'square' },
          ]}
        />
      </div>
      <div className="ch11__wrap">
        <table className="ch11 srm12__table">
          <thead>
            <tr>
              <th>spazio</th>
              <th>training</th>
              <th>VC-confidence</th>
              <th>bound probabile su R</th>
              <th>scelta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === best ? 'is-chosen' : undefined}>
                <th>{Hi(i)}</th>
                <td>
                  <span className="ch11__bar ch11__bar--tr" style={{ width: `${(r.e / max) * 100}%` }} />
                </td>
                <td>
                  <span className="ch11__bar ch11__bar--cv" style={{ width: `${(r.c / max) * 100}%` }} />
                </td>
                <td>
                  <span className="srm12__stack">
                    <span className="ch11__bar ch11__bar--tr" style={{ width: `${(r.e / max) * 100}%` }} />
                    <span className="ch11__bar ch11__bar--cv" style={{ width: `${(r.c / max) * 100}%` }} />
                  </span>
                  <span className="ch11__val">{fmt(r.e + r.c, 2)}</span>
                </td>
                <td className="ch11__pick">{i === best ? <span className="ch11__mark">scelto</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Tasks items={[{ label: 'Aumenta il numero di dati: la scelta si sposta verso uno spazio con VC-dim più alta.', done: seen.more }]} />
    </div>
  )
}
