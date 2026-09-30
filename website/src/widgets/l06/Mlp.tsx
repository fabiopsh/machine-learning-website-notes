import { useState } from 'react'
import { Axes, FnPath, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { fullEdges, NetSvg, sigmoid, type NetEdge, type NetNode, type NodeId } from './NetSvg'

/* ------------------------------------------------------------------ Fig. 6.12 */

// pesi di una piccola rete 2-3-1 (unità nascoste e di uscita logistiche)
const WJ = [
  [1.5, -2, 1], // w_j0, w_j1, w_j2 per j = 1
  [-1, 2.5, 1.5],
  [0.5, 1, -2.5],
]
const WK = [-1, 2, -1.5, 1.8] // w_k0, w_k1, w_k2, w_k3

export function TwoViews() {
  const [x, setX] = useState([0.6, -0.4])
  const [hot, setHot] = useState<number | null>(null)
  const nets = WJ.map((w) => w[0] + w[1] * x[0] + w[2] * x[1])
  const oj = nets.map((v) => sigmoid(v))
  const netk = WK[0] + oj.reduce((s, v, j) => s + WK[j + 1] * v, 0)
  const h = sigmoid(netk)
  const nodes: NetNode[] = [
    { id: '0:0', x: 110, y: 250, label: 'x₁', kind: 'input', value: x[0] },
    { id: '0:1', x: 250, y: 250, label: 'x₂', kind: 'input', value: x[1] },
    ...oj.map((v, j) => ({ id: `1:${j}` as NodeId, x: 60 + j * 120, y: 145, label: `j${'₁₂₃'[j]}`, kind: 'hidden' as const, value: v })),
    { id: '2:0', x: 180, y: 40, label: 'k', kind: 'output', value: h },
  ]
  const edges: NetEdge[] = [
    ...WJ.flatMap((w, j) => [0, 1].map((i) => ({ from: `0:${i}` as NodeId, to: `1:${j}` as NodeId, w: w[i + 1] }))),
    ...WK.slice(1).map((w, j) => ({ from: `1:${j}` as NodeId, to: '2:0' as NodeId, w })),
  ]
  const hotSet = new Set<string>()
  if (hot !== null) {
    hotSet.add(`1:${hot}`)
    hotSet.add(`0:0>1:${hot}`)
    hotSet.add(`0:1>1:${hot}`)
    hotSet.add(`1:${hot}>2:0`)
  }
  const [hovered, setHovered] = useState(false)
  const seen = useLatch({ hover: hovered, moved: x[0] !== 0.6 || x[1] !== -0.4 })
  const enter = (j: number | null) => {
    setHot(j)
    if (j !== null) setHovered(true)
  }
  return (
    <div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">A · una rete di unità</div>
          <NetSvg
            W={420}
            H={290}
            nodes={nodes}
            edges={edges}
            r={22}
            hot={hotSet}
            ariaLabel="Rete con due input, tre unità nascoste e un’uscita"
            onNodeEnter={(id) => enter(id && id.startsWith('1:') ? Number(id.slice(2)) : null)}
          >
            <text x={416} y={254} className="net__side" textAnchor="end">
              input i
            </text>
            <text x={416} y={149} className="net__side" textAnchor="end">
              nascoste j
            </text>
            <text x={230} y={44} className="net__side">
              uscita k
            </text>
          </NetSvg>
        </div>
        <div>
          <div className="htf__title">B · una funzione flessibile</div>
          <div className="wmath two6__formula">
            <Tex>{'h(\\mathbf{x}) = f_k\\Big(\\sum_j w_{kj}\\, f_j\\big(\\sum_i w_{ji}\\, x_i\\big)\\Big)'}</Tex>
          </div>
          <table className="hyp__table two6__table">
            <thead>
              <tr>
                <th>j</th>
                <th>
                  <Tex>{'net_j'}</Tex>
                </th>
                <th>
                  <Tex>{'f_j(net_j)'}</Tex>
                </th>
                <th>
                  <Tex>{'w_{kj}'}</Tex>
                </th>
              </tr>
            </thead>
            <tbody>
              {oj.map((v, j) => (
                <tr key={j} className={hot === j ? 'is-hot' : undefined} onPointerEnter={() => enter(j)} onPointerLeave={() => enter(null)}>
                  <td className="hyp__num">{j + 1}</td>
                  <td className="hyp__num">{fmt(nets[j], 2)}</td>
                  <td className="hyp__num">{fmt(v, 3)}</td>
                  <td className="hyp__num">{fmt(WK[j + 1], 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="readouts">
            <Readout label={<Tex>{'net_k = \\sum_j w_{kj} f_j + w_{k0}'}</Tex>} value={fmt(netk, 3)} />
            <Readout label={<Tex>{'h(\\mathbf{x}) = f_k(net_k)'}</Tex>} tone="accent" value={fmt(h, 3)} />
          </div>
        </div>
      </div>
      <div className="controls">
        <Slider
          label={<Tex>{'x_1'}</Tex>}
          min={-2}
          max={2}
          step={0.05}
          value={x[0]}
          onChange={(v) => setX([v, x[1]])}
          format={(v) => fmt(v)}
          width={200}
        />
        <Slider
          label={<Tex>{'x_2'}</Tex>}
          min={-2}
          max={2}
          step={0.05}
          value={x[1]}
          onChange={(v) => setX([x[0], v])}
          format={(v) => fmt(v)}
          width={200}
        />
      </div>
      <Tasks
        items={[
          {
            label: (
              <>
                Passa su un’unità nascosta (o su una riga della tabella): è un termine <Tex>{'f_j(\\cdot)'}</Tex> della funzione.
              </>
            ),
            done: seen.hover,
          },
          { label: 'Cambia l’input: i valori scorrono dalla rete alla formula, strato dopo strato.', done: seen.moved },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.13 */

type Arch = 'two' | 'three'
const STEPS = [
  'Si carica il pattern x nello strato di input.',
  'Si calcolano le uscite del primo strato nascosto.',
  'Poi del secondo strato nascosto, e così via.',
  'Si calcolano le uscite dello strato di uscita: h(x).',
  'Ora si può calcolare l’errore (delta) in uscita.',
]

export function Architectures() {
  const [arch, setArch] = useState<Arch>('two')
  const [phase, setPhase] = useState(-1)
  const sizes = arch === 'two' ? [2, 3, 1] : [2, 3, 3, 1]
  const W = 380
  const H = arch === 'two' ? 250 : 330
  const pos: NetNode[] = []
  sizes.forEach((n, l) => {
    const y = H - 34 - (l * (H - 68)) / (sizes.length - 1)
    for (let i = 0; i < n; i++) {
      pos.push({
        id: `${l}:${i}`,
        x: n === 1 ? W / 2 : 90 + (i * (W - 180)) / (n - 1),
        y,
        kind: l === 0 ? 'input' : l === sizes.length - 1 ? 'output' : 'hidden',
      })
    }
  })
  const edges: NetEdge[] = [...fullEdges(sizes)]
  if (arch === 'three') {
    // connessioni che saltano uno strato
    edges.push({ from: '0:0', to: '2:0', dash: true }, { from: '0:1', to: '2:2', dash: true }, { from: '1:1', to: '3:0', dash: true })
  }
  // strato attivo per la fase corrente
  const nL = sizes.length
  const layerOf = (ph: number) => (ph <= 0 ? 0 : ph === 1 ? 1 : ph === 2 ? (nL > 3 ? 2 : -1) : ph >= 3 ? nL - 1 : -1)
  const active = phase < 0 ? -2 : layerOf(phase)
  const hot = new Set<string>()
  if (active >= 0) {
    pos.filter((n) => n.id.startsWith(`${active}:`)).forEach((n) => hot.add(n.id))
    if (active > 0) edges.filter((e) => e.to.startsWith(`${active}:`)).forEach((e) => hot.add(`${e.from}>${e.to}`))
  }
  const nodes = pos.map((n) => ({
    ...n,
    value: phase >= 0 && Number(n.id.split(':')[0]) <= Math.max(active, phase >= 3 ? nL - 1 : active) && phase >= 0 ? 0.55 : undefined,
  }))
  const next = () => setPhase((p) => (p >= 4 ? -1 : p === 1 && nL <= 3 ? 3 : p + 1))
  const seen = useLatch({ out: phase === 4, three: arch === 'three' && phase === 2 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          value={arch}
          onChange={(v) => {
            setArch(v)
            setPhase(-1)
          }}
          options={[
            { value: 'two', label: 'Due strati, completamente connessa' },
            { value: 'three', label: 'Tre strati, con altre connessioni' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <NetSvg W={W} H={H} nodes={nodes} edges={edges} r={18} hot={hot} dimOthers={phase >= 0} ariaLabel="Architettura di un MLP" />
        <div className="wside">
          <ol className="arch6__steps">
            {STEPS.map((s, i) => (
              <li key={i} className={`${i === phase ? 'is-on' : ''}${i === 2 && nL <= 3 ? ' is-skip' : ''}`}>
                {s}
              </li>
            ))}
          </ol>
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={next}>
              {phase < 0 ? 'Carica un pattern' : phase >= 4 ? 'Ricomincia' : 'Passo successivo'}
            </Btn>
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Segui l’elaborazione feedforward passo passo fino al calcolo del delta in uscita.', done: seen.out },
          { label: 'Nella rete a tre strati, arriva al secondo strato nascosto.', done: seen.three },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.14 */

const H6 = [
  [-2, 4, 0],
  [-2, 0, 4],
  [3, -3, -3],
]
const O6 = [
  [5, -5, 0],
  [-1.5, -1.5, 3],
  [-5, 5, 0],
]
const logit = (p: number) => Math.log(p / (1 - p))
const hid6 = (x: number[]) => H6.map((w) => sigmoid(w[0] + w[1] * x[0] + w[2] * x[1]))
// bias delle uscite scelti in modo che con x = (0,5; 0,5) le uscite siano 0,2; 0,7; 0,1
const B6 = (() => {
  const h = hid6([0.5, 0.5])
  return [0.2, 0.7, 0.1].map((t, k) => logit(t) - O6[k].reduce((s, w, j) => s + w * h[j], 0))
})()

export function MultiOutput() {
  const [x, setX] = useState([0.5, 0.5])
  const h = hid6(x)
  const o = O6.map((w, k) => sigmoid(B6[k] + w.reduce((s, v, j) => s + v * h[j], 0)))
  const best = o.indexOf(Math.max(...o))
  const moved = useLatch({ m: x[0] !== 0.5 || x[1] !== 0.5 }).m
  const seen = useLatch({ c1: moved && best === 0, c3: moved && best === 2 })
  const nodes: NetNode[] = [
    { id: '0:0', x: 130, y: 250, label: 'x₁', kind: 'input', value: x[0] },
    { id: '0:1', x: 250, y: 250, label: 'x₂', kind: 'input', value: x[1] },
    ...h.map((v, j) => ({ id: `1:${j}` as NodeId, x: 90 + j * 100, y: 160, kind: 'hidden' as const, value: v })),
    ...o.map((v, k) => ({ id: `2:${k}` as NodeId, x: 90 + k * 100, y: 70, kind: 'output' as const, value: v, label: fmt(v, 1) })),
  ]
  const edges = fullEdges([2, 3, 3])
  return (
    <div>
      <div className="wgrid wgrid--even">
        <NetSvg W={380} H={290} nodes={nodes} edges={edges} r={20} hot={new Set([`2:${best}`])} ariaLabel="Rete con tre unità di uscita">
          {o.map((_, k) => (
            <g key={k} transform={`translate(${90 + k * 100} 12)`}>
              <text textAnchor="middle" y={14} className={`multi6__val${k === best ? ' is-best' : ''}`}>
                classe {k + 1}
              </text>
            </g>
          ))}
        </NetSvg>
        <div className="wside">
          <ul className="multi6__bars">
            {o.map((v, k) => (
              <li key={k} className={k === best ? 'is-best' : undefined}>
                <span>classe {k + 1}</span>
                <span className="multi6__bar">
                  <span style={{ width: `${v * 100}%` }} />
                </span>
                <b>{fmt(v, 2)}</b>
              </li>
            ))}
          </ul>
          <Slider
            label={<Tex>{'x_1'}</Tex>}
            min={0}
            max={1}
            step={0.01}
            value={x[0]}
            onChange={(v) => setX([v, x[1]])}
            format={(v) => fmt(v)}
          />
          <Slider
            label={<Tex>{'x_2'}</Tex>}
            min={0}
            max={1}
            step={0.01}
            value={x[1]}
            onChange={(v) => setX([x[0], v])}
            format={(v) => fmt(v)}
          />
          <p className="wnote">La classe predetta è quella con l’uscita più alta (evidenziata).</p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Cambia l’input finché vince la classe 1.', done: seen.c1 },
          { label: 'Poi fai vincere la classe 3.', done: seen.c3 },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.15 */

type Target = 'sin' | 'bump'
const TARGETS: Record<Target, { f: (x: number) => number; name: string }> = {
  sin: { f: (x) => Math.sin(2 * Math.PI * x), name: 'sin(2πx)' },
  bump: { f: (x) => Math.exp(-((x - 0.5) ** 2) / 0.02) - 0.5 * x, name: 'una gobba' },
}

/** costruzione «a gradini»: ogni unità nascosta è un gradino morbido, l'uscita lineare ne somma i salti */
function approx(f: (x: number) => number, N: number, a: number) {
  const t = Array.from({ length: N + 1 }, (_, j) => j / N)
  const units = Array.from({ length: N }, (_, j) => ({ c: (t[j] + t[j + 1]) / 2, w: f(t[j + 1]) - f(t[j]) }))
  const w0 = f(0)
  const h = (x: number) => w0 + units.reduce((s, u) => s + u.w * sigmoid(x - u.c, a), 0)
  return { h, units, w0 }
}

export function UniversalApprox() {
  const [target, setTarget] = useState<Target>('sin')
  const [N, setN] = useState(3)
  const [s, setS] = useState(6) // a = 2^s
  const [showUnits, setShowUnits] = useState(false)
  const a = 2 ** s
  const f = TARGETS[target].f
  const { h, units, w0 } = approx(f, N, a)
  let err = 0
  for (let i = 0; i <= 400; i++) err = Math.max(err, Math.abs(f(i / 400) - h(i / 400)))
  const seen = useLatch({ many: N >= 20 && err < 0.15, units: showUnits, bump: target === 'bump' && N >= 15 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: `funzione da approssimare: ${TARGETS[target].name}`, color: 'var(--c-green)' },
            { label: `rete con ${N} unità nascoste`, color: 'var(--c-red)' },
            ...(showUnits ? [{ label: 'contributo di ogni unità', color: 'var(--ink-4)' }] : []),
          ]}
        />
        <Segmented
          size="sm"
          value={target}
          onChange={setTarget}
          options={[
            { value: 'sin', label: 'seno' },
            { value: 'bump', label: 'gobba' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 1]} yDomain={[-1.4, 1.4]} aspect={0.5}>
        <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-1, 0, 1]} xLabel="x" />
        {showUnits && units.map((u, j) => <FnPath key={j} f={(x) => u.w * sigmoid(x - u.c, a)} color="var(--ink-4)" width={1} />)}
        <FnPath f={f} color="var(--c-green)" width={2.6} />
        <FnPath f={h} color="var(--c-red)" width={2.2} samples={600} />
      </Plot>
      <div className="controls">
        <Slider label="unità nascoste" min={1} max={40} step={1} value={N} onChange={setN} width={240} />
        <Slider
          label={
            <>
              pendenza delle sigmoidi <Tex>a</Tex>
            </>
          }
          min={3}
          max={9}
          step={0.1}
          value={s}
          onChange={setS}
          format={() => fmt(a, 0)}
          width={240}
        />
        <Toggle label="mostra le singole unità" checked={showUnits} onChange={setShowUnits} />
      </div>
      <div className="readouts">
        <Readout label="errore massimo |f − h|" tone="red" value={fmt(err, 3)} />
        <Readout label="bias dell’uscita" value={fmt(w0, 2)} sub={<Tex>{'h(x) = w_0 + \\sum_j w_j\\, \\sigma(a(x - c_j))'}</Tex>} />
      </div>
      <Tasks
        items={[
          { label: 'Aumenta le unità nascoste fino a un errore massimo sotto 0,15.', done: seen.many },
          { label: 'Mostra le singole unità: ognuna è un gradino morbido, la rete ne somma i salti.', done: seen.units },
          { label: 'Prova la gobba con almeno 15 unità: funziona per qualunque funzione continua.', done: seen.bump },
        ]}
      />
    </div>
  )
}
