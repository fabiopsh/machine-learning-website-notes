import { useState } from 'react'
import { Axes, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

type P = { x: number; y: number }
const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'

/**
 * Separabilità di pochi punti: si provano 720 direzioni u e si cerca una soglia che lasci
 * tutti gli «1» da una parte e tutti gli «0» dall'altra. Restituisce la retta col margine più largo.
 */
export function separate(pts: P[], labels: number[]) {
  if (labels.every((v) => v === labels[0])) return { ok: true, line: null as null | { w1: number; w2: number; w0: number } }
  let best: { gap: number; w1: number; w2: number; w0: number } | null = null
  for (let t = 0; t < 720; t++) {
    const a = (t / 720) * 2 * Math.PI
    const u = [Math.cos(a), Math.sin(a)]
    const pr = pts.map((p) => p.x * u[0] + p.y * u[1])
    const lo1 = Math.min(...pr.filter((_, i) => labels[i] === 1))
    const hi0 = Math.max(...pr.filter((_, i) => labels[i] === 0))
    const gap = lo1 - hi0
    if (gap > 1e-6 && (!best || gap > best.gap)) best = { gap, w1: u[0], w2: u[1], w0: -(lo1 + hi0) / 2 }
  }
  return best ? { ok: true, line: { w1: best.w1, w2: best.w2, w0: best.w0 } } : { ok: false, line: null }
}

function lineIn(w1: number, w2: number, w0: number, X: [number, number], Y: [number, number]): P[] {
  if (Math.abs(w2) > Math.abs(w1)) return [X[0] - 3, X[1] + 3].map((x) => ({ x, y: (-w0 - w1 * x) / w2 }))
  return [Y[0] - 3, Y[1] + 3].map((y) => ({ x: (-w0 - w2 * y) / w1, y }))
}

function Pt({ p, c, bad, label, onClick }: { p: P; c: number; bad?: boolean; label?: string; onClick?: () => void }) {
  const { x, y } = usePlot()
  return (
    <g
      transform={`translate(${x(p.x)} ${y(p.y)})`}
      className={`lsep__pt${bad ? ' is-bad' : ''}${onClick ? ' sep__click' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `punto ${label}: etichetta ${c}, clic per cambiarla` : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {bad && <circle r={16} className="lsep__ring" />}
      <circle r={12} fill={c ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={2} />
      <text y={4.5} textAnchor="middle">
        {c}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.12 */

const BOOL: P[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
]
const AND = [0, 0, 0, 1]
const BX: [number, number] = [-0.5, 1.7]

export function AndSeparable() {
  const [A, setA] = useState<P>({ x: 0.5, y: -0.4 })
  const [B, setB] = useState<P>({ x: 0.6, y: 1.6 })
  const [bits, setBits] = useState([1, 1, 0, 1])
  // retta per A e B, orientata in modo che (1,1) stia dal lato positivo se possibile
  let w1 = B.y - A.y
  let w2 = -(B.x - A.x)
  let w0 = -(w1 * A.x + w2 * A.y)
  if (w1 + w2 + w0 < 0) {
    w1 = -w1
    w2 = -w2
    w0 = -w0
  }
  const h = (p: P) => (w1 * p.x + w2 * p.y + w0 >= 0 ? 1 : 0)
  const wrong = BOOL.filter((p, i) => h(p) !== AND[i]).length
  const moved = useLatch({ m: A.x !== 0.5 || B.x !== 0.6 || A.y !== -0.4 || B.y !== 1.6 }).m
  const conj = bits[0] + bits[1] + 0 * bits[2] + bits[3]
  const [solved, setSolved] = useState(false)
  const seen = useLatch({ sep: moved && wrong === 0, conj: bits.join('') !== '1101' })
  const setNotes = () => {
    // x₁ + x₂ = 1,5
    setA({ x: 0.5, y: 1 })
    setB({ x: 1.5, y: 0 })
    setSolved(true)
  }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'AND = 1', color: C1, kind: 'dot' },
            { label: 'AND = 0', color: C0, kind: 'dot' },
            { label: 'retta di separazione', color: 'var(--c-red)' },
          ]}
        />
        <Btn onClick={setNotes}>Soluzione degli appunti: x₁ + x₂ ≥ 1,5</Btn>
      </div>
      <div className="wgrid">
        <Plot xDomain={BX} yDomain={BX} equal aspect={0.9} maxH={360}>
          <Axes xTicks={[0, 1]} yTicks={[0, 1]} xLabel="x₁" yLabel="x₂" />
          <Polyline pts={lineIn(w1, w2, w0, BX, BX)} color="var(--c-red)" width={2.4} />
          {BOOL.map((p, i) => (
            <Pt key={i} p={p} c={AND[i]} bad={h(p) !== AND[i]} />
          ))}
          <Handle x={A.x} y={A.y} label="primo punto della retta" onMove={setA} />
          <Handle x={B.x} y={B.y} label="secondo punto della retta" onMove={setB} />
        </Plot>
        <div className="wside">
          <table className="hyp__table">
            <thead>
              <tr>
                <th>
                  <Tex>{'x_1 x_2'}</Tex>
                </th>
                <th>AND</th>
                <th>retta</th>
              </tr>
            </thead>
            <tbody>
              {BOOL.map((p, i) => (
                <tr key={i} className={h(p) !== AND[i] ? 'is-bad' : undefined}>
                  <td className="hyp__num">
                    {p.x}
                    {p.y}
                  </td>
                  <td className="hyp__num">{AND[i]}</td>
                  <td className="hyp__num">{h(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Readout
            label="errori"
            value={`${wrong} su 4`}
            tone={wrong ? undefined : 'accent'}
            sub={solved && wrong === 0 ? 'la retta x₁ + x₂ = 1,5' : undefined}
          />
          <div className="wpanel">
            <div className="wpanel__title">
              La congiunzione <Tex>{'x_1 \\wedge x_2 \\wedge x_4'}</Tex>
            </div>
            <div className="sep__bits">
              {bits.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sep__bit${b ? ' is-on' : ''}`}
                  onClick={() => setBits(bits.map((v, j) => (j === i ? 1 - v : v)))}
                >
                  x{'₁₂₃₄'[i]} = {b}
                </button>
              ))}
            </div>
            <div className="wmath">
              <Tex>{`1\\cdot ${bits[0]} + 1\\cdot ${bits[1]} + 0\\cdot ${bits[2]} + 1\\cdot ${bits[3]} = ${conj} ${conj >= 2.5 ? '\\ge' : '<'} 2{,}5`}</Tex>
            </div>
            <p className="wnote">
              Uscita {conj >= 2.5 ? 1 : 0}: vale 1 solo se <Tex>{'x_1, x_2, x_4'}</Tex> sono tutti 1 (<Tex>{'x_3'}</Tex> ha peso 0).
            </p>
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Trascina la retta finché separa (1, 1) dagli altri tre punti.', done: seen.sep },
          { label: 'Nel riquadro della congiunzione cambia un bit: basta uno 0 tra x₁, x₂, x₄ per avere uscita 0.', done: seen.conj },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 5.13 */

const TX: [number, number] = [-0.2, 3.2]
const TY: [number, number] = [-0.2, 2.4]
const START3: P[] = [
  { x: 0.5, y: 0.5 },
  { x: 2.4, y: 0.7 },
  { x: 1.3, y: 1.9 },
]
const LABELINGS = Array.from({ length: 8 }, (_, k) => [(k >> 2) & 1, (k >> 1) & 1, k & 1])

export function Shattering() {
  const [pts, setPts] = useState<P[]>(START3)
  const [sel, setSel] = useState(5) // 1-0-1
  const [xor, setXor] = useState([0, 1, 1, 0])
  const results = LABELINGS.map((lab) => separate(pts, lab))
  const nOk = results.filter((r) => r.ok).length
  const cur = results[sel]
  const res4 = separate(BOOL, xor)
  const all4 = Array.from({ length: 16 }, (_, k) => separate(BOOL, [(k >> 3) & 1, (k >> 2) & 1, (k >> 1) & 1, k & 1]).ok).filter(
    Boolean,
  ).length
  const isXor = xor.join('') === '0110'
  const [aligned, setAligned] = useState(false)
  const seen = useLatch({ aligned: nOk < 8, other: !isXor && res4.ok, xnor: xor.join('') === '1001' })
  const align = () => {
    setPts([
      { x: 0.4, y: 1 },
      { x: 2.6, y: 1 },
      { x: 1.5, y: 1 },
    ])
    setSel(5)
    setAligned(true)
  }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'etichetta 1', color: C1, kind: 'dot' },
            { label: 'etichetta 0', color: C0, kind: 'dot' },
            { label: 'retta che separa', color: 'var(--c-red)' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">Tre punti: tutte le 2³ etichettature</div>
          <Plot xDomain={TX} yDomain={TY} equal aspect={0.72} minH={200} maxH={300} margin={{ l: 14, r: 10, t: 10, b: 14 }}>
            <Axes hideX hideY grid={false} />
            {cur.line && <Polyline pts={lineIn(cur.line.w1, cur.line.w2, cur.line.w0, TX, TY)} color="var(--c-red)" width={2.4} />}
            {pts.map((p, i) => (
              <Pt key={i} p={p} c={LABELINGS[sel][i]} />
            ))}
            {pts.map((p, i) => (
              <Handle
                key={`h${i}`}
                x={p.x}
                y={p.y}
                r={5}
                label={`punto ${i + 1}`}
                onMove={(q) => setPts(pts.map((o, j) => (j === i ? q : o)))}
              />
            ))}
          </Plot>
          <div className="sep__thumbs" role="radiogroup" aria-label="Etichettature dei tre punti">
            {LABELINGS.map((lab, k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={k === sel}
                className={`sep__thumb${k === sel ? ' is-on' : ''}${results[k].ok ? '' : ' is-no'}`}
                onClick={() => setSel(k)}
              >
                <Thumb pts={pts} lab={lab} line={results[k].line} />
                <span>{lab.join('')}</span>
              </button>
            ))}
          </div>
          <div className="sep__row">
            <Readout label="etichettature separabili" value={`${nOk} su 8`} tone={nOk === 8 ? 'accent' : 'red'} />
            <Btn onClick={align}>Allinea i tre punti</Btn>
          </div>
        </div>
        <div>
          <div className="htf__title">Quattro punti: lo XOR</div>
          <Plot xDomain={BX} yDomain={BX} equal aspect={0.9} minH={200} maxH={300} margin={{ l: 26, r: 10, t: 10, b: 24 }}>
            <Axes xTicks={[0, 1]} yTicks={[0, 1]} />
            {res4.line && <Polyline pts={lineIn(res4.line.w1, res4.line.w2, res4.line.w0, BX, BX)} color="var(--c-red)" width={2.4} />}
            {BOOL.map((p, i) => (
              <Pt key={i} p={p} c={xor[i]} label={`${p.x}${p.y}`} onClick={() => setXor(xor.map((v, j) => (j === i ? 1 - v : v)))} />
            ))}
          </Plot>
          <p className={`verdict ${res4.ok ? 'verdict--good' : 'verdict--bad'}`}>
            {res4.ok ? 'separabile con una retta' : 'nessuna retta separa questa etichettatura'}
          </p>
          <p className="wnote">
            Clicca i punti per cambiarne l’etichetta. Delle 16 etichettature dei quattro punti, {all4} sono separabili: fanno eccezione lo
            XOR e il suo complemento.
          </p>
          <Btn onClick={() => setXor([0, 1, 1, 0])}>Rimetti lo XOR</Btn>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: 'Allinea i tre punti (anche a mano): l’etichettatura 1-0-1, con lo 0 in mezzo, non è più separabile.',
            done: seen.aligned || aligned,
          },
          { label: 'Cambia un’etichetta dello XOR: l’etichettatura diventa separabile.', done: seen.other },
          { label: 'Trova l’altra etichettatura dei quattro punti che nessuna retta separa (1-0-0-1).', done: seen.xnor },
        ]}
      />
    </div>
  )
}

function Thumb({ pts, lab, line }: { pts: P[]; lab: number[]; line: { w1: number; w2: number; w0: number } | null }) {
  const W = 64
  const H = 46
  const sx = (v: number) => ((v - TX[0]) / (TX[1] - TX[0])) * W
  const sy = (v: number) => H - ((v - TY[0]) / (TY[1] - TY[0])) * H
  const seg = line ? lineIn(line.w1, line.w2, line.w0, TX, TY) : null
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      {seg && <line x1={sx(seg[0].x)} y1={sy(seg[0].y)} x2={sx(seg[1].x)} y2={sy(seg[1].y)} stroke="var(--c-red)" strokeWidth={1.6} />}
      {pts.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.2} fill={lab[i] ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={1} />
      ))}
      {!line && !lab.every((v) => v === lab[0]) && (
        <path d={`M${W - 12},4 l8,8 m0,-8 l-8,8`} stroke="var(--c-red)" strokeWidth={1.8} strokeLinecap="round" />
      )}
    </svg>
  )
}
