import { useState } from 'react'
import { Arrow, Axes, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { tx } from '../../lib/i18n'
import { lerp } from '../../lib/math'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Segmented, Slider } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { NetSvg, type NetEdge, type NetNode } from './NetSvg'

type P = { x: number; y: number }
const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'
const step = (v: number) => (v > 0 ? 1 : 0)

function lineIn(w1: number, w2: number, w0: number, X: [number, number]): P[] {
  if (Math.abs(w2) > 1e-9) return [X[0] - 2, X[1] + 2].map((x) => ({ x, y: (-w0 - w1 * x) / w2 }))
  if (Math.abs(w1) > 1e-9) return [X[0] - 2, X[1] + 2].map((y) => ({ x: -w0 / w1, y }))
  return []
}

function Bit({ p, c, bad, hot, onClick }: { p: P; c: number; bad?: boolean; hot?: boolean; onClick?: () => void }) {
  const { x, y } = usePlot()
  return (
    <g
      transform={`translate(${x(p.x)} ${y(p.y)})`}
      className={`lsep__pt${bad ? ' is-bad' : ''}${onClick ? ' sep__click' : ''}${hot ? ' bool6__hot' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `input (${p.x}, ${p.y})` : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {bad && <circle r={16} className="lsep__ring" />}
      {hot && <circle r={17} className="bool6__halo" />}
      <circle r={12} fill={c ? C1 : C0} stroke="var(--plot-bg)" strokeWidth={2} />
      <text y={4.5} textAnchor="middle">
        {c}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 6.5 */

type Fn = 'and' | 'or' | 'not'
const TABLES: Record<Fn, { x: number[]; y: number }[]> = {
  and: [
    { x: [0, 0], y: 0 },
    { x: [0, 1], y: 0 },
    { x: [1, 0], y: 0 },
    { x: [1, 1], y: 1 },
  ],
  or: [
    { x: [0, 0], y: 0 },
    { x: [0, 1], y: 1 },
    { x: [1, 0], y: 1 },
    { x: [1, 1], y: 1 },
  ],
  not: [
    { x: [0, 0], y: 1 },
    { x: [1, 0], y: 0 },
  ],
}
const PRESET: Record<Fn, [number, number, number]> = { and: [1, 1, -1.5], or: [1, 1, -0.5], not: [1, 0, 0] }
const BX: [number, number] = [-0.5, 1.6]

export function BoolPerceptron() {
  const [fn, setFn] = useState<Fn>('and')
  const [[w1, w2, w0], setW] = useState<[number, number, number]>(PRESET.and)
  const rows = TABLES[fn]
  const net = (r: { x: number[] }) => w0 + w1 * r.x[0] + (fn === 'not' ? 0 : w2 * r.x[1])
  const wrong = rows.filter((r) => step(net(r)) !== r.y).length
  const choose = (f: Fn) => {
    setFn(f)
    setW(PRESET[f])
  }
  const seen = useLatch({
    or: fn === 'or' && wrong === 0,
    not: fn === 'not' && wrong === 0,
    and: fn === 'and' && wrong === 0 && w0 !== -1.5,
  })
  const nodes: NetNode[] = [
    { id: '0:0', x: 34, y: 105, label: 'x₁', kind: 'input' },
    ...(fn === 'not' ? [] : [{ id: '0:1' as const, x: 34, y: 38, label: 'x₂', kind: 'input' as const }]),
    { id: '0:2', x: 34, y: 172, label: '1', kind: 'bias' },
    { id: '1:0', x: 190, y: 105, label: 'Σ', kind: 'output' },
  ]
  const edges: NetEdge[] = [
    { from: '0:0', to: '1:0', w: w1, label: `w₁ = ${fmt(w1, 1)}` },
    ...(fn === 'not' ? [] : [{ from: '0:1' as const, to: '1:0' as const, w: w2, label: `w₂ = ${fmt(w2, 1)}` }]),
    { from: '0:2', to: '1:0', w: w0, label: `w₀ = ${fmt(w0, 1)}` },
  ]
  return (
    <div>
      <div className="wbar">
        <Segmented
          value={fn}
          onChange={choose}
          options={[
            { value: 'and', label: 'AND' },
            { value: 'or', label: 'OR' },
            { value: 'not', label: 'NOT' },
          ]}
        />
        <Legend
          items={[
            { label: 'target 1', color: C1, kind: 'dot' },
            { label: 'target 0', color: C0, kind: 'dot' },
            { label: 'net = 0', color: 'var(--c-red)' },
          ]}
        />
      </div>
      <div className="bool6">
        <div className="bool6__left">
          <NetSvg W={250} H={210} nodes={nodes} edges={edges} r={18} ariaLabel={tx('Perceptron con i suoi pesi', 'Perceptron with its weights')} className="bool6__net">
            <line x1={210} y1={105} x2={244} y2={105} className="net__out" markerEnd="url(#net-arrow)" />
          </NetSvg>
          <table className="hyp__table bool6__table">
            <thead>
              <tr>
                <th>{fn === 'not' ? <Tex>{'x_1'}</Tex> : <Tex>{'x_1\\,x_2'}</Tex>}</th>
                <th>net</th>
                <th>out</th>
                <th>f(x)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const o = step(net(r))
                return (
                  <tr key={i} className={o !== r.y ? 'is-bad' : undefined}>
                    <td className="hyp__num">{fn === 'not' ? r.x[0] : `${r.x[0]}${r.x[1]}`}</td>
                    <td className="hyp__num">{fmt(net(r), 1)}</td>
                    <td className="hyp__num">{o}</td>
                    <td className="hyp__num">{r.y}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Plot
          xDomain={BX}
          yDomain={fn === 'not' ? [-0.6, 0.6] : BX}
          equal
          aspect={fn === 'not' ? 0.5 : 1}
          minH={fn === 'not' ? 120 : 200}
          maxH={260}
          margin={{ l: 22, r: 8, t: 8, b: 22 }}
        >
          <Axes xTicks={[0, 1]} yTicks={fn === 'not' ? [] : [0, 1]} hideY={fn === 'not'} />
          <Polyline pts={fn === 'not' ? lineIn(w1, 0, w0, BX) : lineIn(w1, w2, w0, BX)} color="var(--c-red)" width={2.2} />
          {rows.map((r, i) => (
            <Bit key={i} p={{ x: r.x[0], y: fn === 'not' ? 0 : r.x[1] }} c={r.y} bad={step(net(r)) !== r.y} />
          ))}
        </Plot>
      </div>
      <div className="controls">
        <Slider
          label={<Tex>{'w_1'}</Tex>}
          min={-2}
          max={2}
          step={0.1}
          value={w1}
          onChange={(v) => setW([v, w2, w0])}
          format={(v) => fmt(v, 1)}
          width={170}
        />
        {fn !== 'not' && (
          <Slider
            label={<Tex>{'w_2'}</Tex>}
            min={-2}
            max={2}
            step={0.1}
            value={w2}
            onChange={(v) => setW([w1, v, w0])}
            format={(v) => fmt(v, 1)}
            width={170}
          />
        )}
        <Slider
          label={<Tex>{'w_0'}</Tex>}
          min={-2}
          max={2}
          step={0.1}
          value={w0}
          onChange={(v) => setW([w1, w2, v])}
          format={(v) => fmt(v, 1)}
          width={170}
        />
        {fn !== 'not' && (
          <Btn icon="reset" onClick={() => setW(PRESET[fn])}>
            {tx('Pesi degli appunti', 'Lecture weights')}
          </Btn>
        )}
      </div>
      <Tasks
        items={[
          { label: tx('Con l’AND, trova altri pesi che funzionano (cambia almeno w₀).', 'With AND, find other weights that work (change at least w₀).'), done: seen.and },
          { label: tx('Passa all’OR: con w₁ = w₂ = 1 basta alzare il bias a −0,5.', 'Switch to OR: with w₁ = w₂ = 1, simply raising the bias to −0.5 suffices.'), done: seen.or },
          { label: tx('Esercizio: trova i pesi del NOT (una sola variabile).', 'Exercise: find the weights for NOT (single variable).'), done: seen.not },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.6 */

const PTS: P[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
]
const XOR = [0, 1, 1, 0]
const hid = (p: P) => ({ x: step(p.x + p.y - 1.5), y: step(p.x + p.y - 0.5) })
const outOf = (h: P) => step(-h.x + h.y - 0.5)
const XX: [number, number] = [-0.45, 1.55]

export function XorNetwork() {
  const [sel, setSel] = useState(2)
  const [t, setT] = useState(0)
  const p = PTS[sel]
  const h = hid(p)
  const o = outOf(h)
  const moved = useLatch({ m: sel !== 2 }).m
  const seen = useLatch({ ten: sel === 2 && t >= 0.95, both: moved && sel === 1, sep: t >= 0.95 })
  const nodes: NetNode[] = [
    { id: '0:0', x: 140, y: 250, label: 'x₁', kind: 'input', value: p.x },
    { id: '0:1', x: 300, y: 250, label: 'x₂', kind: 'input', value: p.y },
    { id: '1:0', x: 140, y: 145, label: 'h₁', kind: 'hidden', value: h.x },
    { id: '1:1', x: 300, y: 145, label: 'h₂', kind: 'hidden', value: h.y },
    { id: '2:0', x: 220, y: 45, label: 'o', kind: 'output', value: o },
  ]
  const edges: NetEdge[] = [
    { from: '0:0', to: '1:0', w: 1, label: '1', at: 0.3 },
    { from: '0:1', to: '1:0', w: 1, label: '1', at: 0.3 },
    { from: '0:0', to: '1:1', w: 1, label: '1', at: 0.3 },
    { from: '0:1', to: '1:1', w: 1, label: '1', at: 0.3 },
    { from: '1:0', to: '2:0', w: -1, label: '−1' },
    { from: '1:1', to: '2:0', w: 1, label: '1' },
  ]
  const at = (q: P) => {
    const hq = hid(q)
    return { x: lerp(q.x, hq.x, t), y: lerp(q.y, hq.y, t) }
  }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'XOR = 1', color: C1, kind: 'dot' },
            { label: 'XOR = 0', color: C0, kind: 'dot' },
            { label: t < 0.5 ? tx('rette di h₁ (AND) e h₂ (OR)', 'lines for h₁ (AND) and h₂ (OR)') : tx('retta dell’uscita', 'output line'), color: 'var(--c-red)' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <NetSvg W={440} H={290} nodes={nodes} edges={edges} r={22} ariaLabel={tx('Rete a due strati per lo XOR', 'Two-layer network for XOR')} className="xor6__net">
          <text x={110} y={150} textAnchor="end" className="net__side">
            AND · w₀ = {tx('−1,5', '−1.5')}
          </text>
          <text x={330} y={150} textAnchor="start" className="net__side">
            OR · w₀ = {tx('−0,5', '−0.5')}
          </text>
          <text x={250} y={34} textAnchor="start" className="net__side">
            w₀ = {tx('−0,5', '−0.5')}
          </text>
        </NetSvg>
        <div>
          <Plot xDomain={XX} yDomain={XX} equal aspect={1} maxH={300} margin={{ l: 30, r: 10, t: 10, b: 30 }}>
            <Axes xTicks={[0, 1]} yTicks={[0, 1]} xLabel={t < 0.5 ? 'x₁' : 'h₁'} yLabel={t < 0.5 ? 'x₂' : 'h₂'} />
            {t < 0.5 ? (
              <g opacity={1 - t * 2}>
                <Polyline pts={lineIn(1, 1, -1.5, XX)} color="var(--c-red)" width={2} dash="6 4" />
                <Polyline pts={lineIn(1, 1, -0.5, XX)} color="var(--c-red)" width={2} dash="6 4" />
              </g>
            ) : (
              <g opacity={(t - 0.5) * 2}>
                <Polyline pts={lineIn(-1, 1, -0.5, XX)} color="var(--c-red)" width={2.4} />
              </g>
            )}
            {sel !== undefined && t > 0.02 && t < 0.98 && <Arrow from={p} to={at(p)} color="var(--ink-4)" width={1.2} head={7} />}
            {PTS.map((q, i) => (
              <Bit key={i} p={at(q)} c={XOR[i]} hot={i === sel} onClick={() => setSel(i)} />
            ))}
          </Plot>
          <Slider
            label={tx('spazio degli input → spazio nascosto', 'input space → hidden space')}
            min={0}
            max={1}
            step={0.01}
            value={t}
            onChange={setT}
            format={(v) => (v < 0.5 ? tx('input', 'input') : tx('nascosto', 'hidden'))}
          />
        </div>
      </div>
      <p className="wnote">
        {tx(
          `Input (${p.x}, ${p.y}) → h₁ = ${h.x}, h₂ = ${h.y} → uscita ${o}. Clicca un punto per sceglierlo.`,
          `Input (${p.x}, ${p.y}) → h₁ = ${h.x}, h₂ = ${h.y} → output ${o}. Click a point to select it.`,
        )}
      </p>
      <Tasks
        items={[
          { label: tx('Con il punto (1, 0) porta il cursore allo spazio nascosto: diventa h₁ = 0, h₂ = 1.', 'With the point (1, 0), move the slider to hidden space: it becomes h₁ = 0, h₂ = 1.'), done: seen.ten },
          { label: tx('Scegli (0, 1): finisce nello stesso punto (0, 1) dello spazio nascosto.', 'Select (0, 1): it ends up at the same point (0, 1) in hidden space.'), done: seen.both },
          { label: tx('Nello spazio (h₁, h₂) una sola retta separa i positivi dai negativi.', 'In (h₁, h₂) space, a single line separates positives from negatives.'), done: seen.sep },
        ]}
      />
    </div>
  )
}
