import { useMemo, useState, type ReactNode } from 'react'
import { Arrow, Axes, Dot, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { subDigits, svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { floorOf, Surface3D, type Overlay, type V3 } from '../common/Surface3D'
import { fullEdges, NetSvg, sigmoid, type NetEdge, type NetNode, type NodeId } from '../l06/NetSvg'

const sub = (n: number) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d])
const n2 = (v: number, d = 3) => fmt(v, d).replace(',', '{,}').replace('−', '-')

/* ------------------------------------------------------------------ Fig. 7.1 */

const SIZES = [4, 5, 4]

export function BpNetwork() {
  const [sel, setSel] = useState({ i: 3, j: 4, k: 2 })
  const W = 440
  const H = 300
  const nodes: NetNode[] = []
  SIZES.forEach((n, l) => {
    const y = [255, 150, 60][l]
    for (let a = 0; a < n; a++) {
      const id = `${l}:${a}` as NodeId
      const letter = l === 0 ? 'i' : l === 1 ? 'j' : 'k'
      const isSel = (l === 0 && a === sel.i) || (l === 1 && a === sel.j) || (l === 2 && a === sel.k)
      nodes.push({
        id,
        x: 120 + (a * 300) / (n - 1),
        y,
        kind: l === 0 ? 'input' : l === 1 ? 'hidden' : 'output',
        label: isSel ? letter : undefined,
      })
    }
  })
  const hot = new Set([`0:${sel.i}`, `1:${sel.j}`, `2:${sel.k}`, `0:${sel.i}>1:${sel.j}`, `1:${sel.j}>2:${sel.k}`])
  const [moved, setMoved] = useState(false)
  const seen = useLatch({ moved })
  const pick = (id: string) => {
    const [l, a] = id.split(':').map(Number)
    setSel((s) => (l === 0 ? { ...s, i: a } : l === 1 ? { ...s, j: a } : { ...s, k: a }))
    setMoved(true)
  }
  return (
    <div>
      <div className="wgrid">
        <div className="bp7__net">
          <NetSvg
            W={W}
            H={H}
            nodes={nodes}
            edges={fullEdges(SIZES)}
            r={15}
            hot={hot}
            ariaLabel={tx('MLP con input i, unità nascoste j e unità di uscita k', 'MLP with inputs i, hidden units j and output units k')}
            onNodeClick={pick}
          >
            {nodes
              .filter((n) => n.kind === 'output')
              .map((n, a) => (
                <g key={n.id}>
                  <line x1={n.x} y1={n.y - 15} x2={n.x} y2={22} className="net__out" markerEnd="url(#net-arrow)" />
                  <text x={n.x} y={13} textAnchor="middle" className="bp7__lbl">
                    {subDigits(`o${sub(a + 1)} → d${sub(a + 1)}`)}
                  </text>
                </g>
              ))}
            <text x={4} y={154} className="net__side">
              {tx('nascoste j', 'hidden j')}
            </text>
            <text x={4} y={259} className="net__side">
              input i
            </text>
            <text x={4} y={64} className="net__side">
              {tx('uscita k', 'output k')}
            </text>
          </NetSvg>
        </div>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{tx('I pesi evidenziati', 'The highlighted weights')}</div>
            <p className="wnote">
              <Tex>{`w_{ji} = w_{${sel.j + 1}${sel.i + 1}}`}</Tex>
              {tx(
                <>
                  : dall’input {sel.i + 1} verso l’unità nascosta {sel.j + 1}.
                </>,
                <>
                  : from input {sel.i + 1} to hidden unit {sel.j + 1}.
                </>,
              )}
            </p>
            <p className="wnote">
              <Tex>{`w_{kj} = w_{${sel.k + 1}${sel.j + 1}}`}</Tex>
              {tx(
                <>
                  : dall’unità nascosta {sel.j + 1} verso l’uscita {sel.k + 1}, che si confronta con il target{' '}
                </>,
                <>
                  : from hidden unit {sel.j + 1} to output {sel.k + 1}, which is compared with the target{' '}
                </>,
              )}
              <Tex>{`d_{${sel.k + 1}}`}</Tex>.
            </p>
          </div>
          <p className="wnote">
            {tx(
              'Clicca un’unità di uno strato per cambiare i, j o k. Il primo indice di ogni peso è l’unità che riceve.',
              'Click a unit of a layer to change i, j or k. The first index of each weight is the receiving unit.',
            )}
          </p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              <>
                Scegli un’altra unità nascosta j: cambiano sia <Tex>{'w_{ji}'}</Tex> sia <Tex>{'w_{kj}'}</Tex>.
              </>,
              <>
                Choose another hidden unit j: both <Tex>{'w_{ji}'}</Tex> and <Tex>{'w_{kj}'}</Tex> change.
              </>,
            ),
            done: seen.moved,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 7.2 */

const R: [number, number] = [-2.5, 2.5]
const g = (x: number, y: number, cx: number, cy: number, s: number) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s))
const E = (x: number, y: number) =>
  2.6 -
  1.9 * g(x, y, -1.2, 0.9, 0.6) -
  2.2 * g(x, y, 1.1, -1.0, 0.55) -
  1.3 * g(x, y, 1.2, 1.3, 0.4) -
  1.0 * g(x, y, -1.3, -1.3, 0.45) +
  0.08 * (x * x + y * y)
const gradE = (x: number, y: number): [number, number] => {
  const h = 1e-4
  return [(E(x + h, y) - E(x - h, y)) / (2 * h), (E(x, y + h) - E(x, y - h)) / (2 * h)]
}
const ZR: [number, number] = [0, 3.4]
const LEVELS = [0.5, 0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6]

function descend(start: [number, number], steps: number) {
  const pts: [number, number][] = [start]
  let p = start
  for (let t = 0; t < steps; t++) {
    const [a, b] = gradE(p[0], p[1])
    p = [Math.max(R[0], Math.min(R[1], p[0] - 0.12 * a)), Math.max(R[0], Math.min(R[1], p[1] - 0.12 * b))]
    pts.push(p)
  }
  return pts
}

export function NonConvexSurface() {
  const [z, setZ] = useState<[number, number]>([0.1, 0.6])
  const [steps, setSteps] = useState(0)
  const trail = useMemo(() => descend(z, steps), [z, steps])
  const end = trail[trail.length - 1]
  const [ga, gb] = gradE(end[0], end[1])
  const gn = Math.hypot(ga, gb)
  const [ends, setEnds] = useState<string[]>([])
  const key = gn < 0.02 ? `${Math.round(end[0])},${Math.round(end[1])}` : null
  if (key && !ends.includes(key)) setEnds([...ends, key])
  const seen = useLatch({ min: gn < 0.02 && steps > 0, two: ends.length >= 2 })
  const overlays = useMemo<Overlay[]>(() => {
    const zf = floorOf(ZR, 0.3)
    const list: Overlay[] = [
      { kind: 'line', a: [end[0], end[1], zf], b: [end[0], end[1], E(end[0], end[1])], color: 'var(--ink-3)', width: 1.2, dash: [4, 4] },
    ]
    if (trail.length > 1)
      list.push({ kind: 'polyline', pts: trail.map(([a, b]) => [a, b, E(a, b)] as V3), color: 'var(--accent)', width: 2.2 })
    list.push({ kind: 'point', p: [end[0], end[1], E(end[0], end[1])], color: 'var(--accent)', r: 6 })
    return list
  }, [trail, end])
  const k = 0.35 / Math.max(0.35, gn)
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <Tex>{'\\nabla E'}</Tex>, color: 'var(--c-orange)' },
            { label: <Tex>{'-\\nabla E'}</Tex>, color: 'var(--c-green)' },
            { label: tx('percorso della discesa', 'descent path'), color: 'var(--accent)' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <Surface3D
          f={E}
          x={R}
          y={R}
          z={ZR}
          n={44}
          levels={LEVELS}
          overlays={overlays}
          floorGap={0.3}
          aspect={0.9}
          axisLabels={['w₁', 'w₂', 'E']}
          ariaLabel={tx('Superficie d’errore non convessa con più minimi', 'Non-convex error surface with several minima')}
        />
        <Plot xDomain={R} yDomain={R} equal aspect={1} maxH={360} margin={{ l: 30, r: 10, t: 10, b: 28 }}>
          <Axes xTicks={[-2, -1, 0, 1, 2]} yTicks={[-2, -1, 0, 1, 2]} xLabel="w₁" yLabel="w₂" />
          <Levels />
          {trail.length > 1 && <Polyline pts={trail.map(([a, b]) => ({ x: a, y: b }))} color="var(--accent)" width={2} />}
          {gn > 0.02 && (
            <>
              <Arrow
                from={{ x: end[0], y: end[1] }}
                to={{ x: end[0] + k * ga * 1.6, y: end[1] + k * gb * 1.6 }}
                color="var(--c-orange)"
                width={2.2}
              />
              <Arrow
                from={{ x: end[0], y: end[1] }}
                to={{ x: end[0] - k * ga * 1.6, y: end[1] - k * gb * 1.6 }}
                color="var(--c-green)"
                width={2.2}
              />
            </>
          )}
          {steps > 0 && <Dot x={end[0]} y={end[1]} r={4.5} color="var(--ink)" />}
          <Handle
            x={z[0]}
            y={z[1]}
            label={tx('punto di partenza Z', 'starting point Z')}
            onMove={(p) => {
              setZ([p.x, p.y])
              setSteps(0)
            }}
          />
        </Plot>
      </div>
      <div className="controls">
        <Btn icon="step" variant="soft" onClick={() => setSteps((s) => s + 1)}>
          {tx('Un passo', 'One step')}
        </Btn>
        <Btn icon="play" onClick={() => setSteps((s) => s + 40)}>
          {tx('Quaranta passi', 'Forty steps')}
        </Btn>
        <Btn icon="reset" onClick={() => setSteps(0)} title={tx('Ricomincia da Z', 'Restart from Z')} />
        <div className="readouts">
          <Readout label={tx('E nel punto', 'E at the point')} tone="accent" value={fmt(E(end[0], end[1]), 3)} />
          <Readout
            label="‖∇E‖"
            value={fmt(gn, 3)}
            sub={gn < 0.02 ? tx('minimo raggiunto', 'minimum reached') : tx(`${steps} passi`, steps === 1 ? '1 step' : `${steps} steps`)}
          />
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx('Scendi fino a un minimo (il gradiente si annulla).', 'Descend to a minimum (the gradient vanishes).'),
            done: seen.min,
          },
          {
            label: tx(
              'Sposta il punto di partenza Z e raggiungi un minimo diverso: la superficie non è convessa.',
              'Move the starting point Z and reach a different minimum: the surface is not convex.',
            ),
            done: seen.two,
          },
        ]}
      />
    </div>
  )
}

function Levels() {
  const { x, y } = usePlot()
  const paths = useMemo(() => LEVELS.map((L) => segsToPath(contourSegments(E, R, R, L, 80), x, y)), [x, y])
  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--c-blue)" strokeWidth={1} opacity={0.5} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 7.3 */


type Focus = 'wkj' | 'dj' | 'wji'
const FOCUS: Record<Focus, { tex: string; hot: string[]; note: ReactNode }> = {
  wkj: {
    tex: '\\Delta w_{kj} = \\eta\\,\\delta_k\\, o_j',
    hot: ['j', 'k', 'jk'],
    note: tx(
      <>
        Servono solo il delta dell’unità k (che riceve) e l’uscita <Tex>{'o_j'}</Tex> dell’unità j (che invia).
      </>,
      <>
        Only the delta of unit k (the receiver) and the output <Tex>{'o_j'}</Tex> of unit j (the sender) are needed.
      </>,
    ),
  },
  dj: {
    tex: "\\delta_j = \\Big(\\sum_k \\delta_k\\, w_{kj}\\Big)\\, f'_j(net_j)",
    hot: ['j', 'k', 'k2', 'k3', 'jk', 'jk2', 'jk3'],
    note: tx(
      'L’unità j raccoglie i delta delle unità sopra di lei, pesati con gli stessi pesi usati in avanti.',
      'Unit j collects the deltas of the units above it, weighted by the same weights used in the forward pass.',
    ),
  },
  wji: {
    tex: '\\Delta w_{ji} = \\eta\\,\\delta_j\\, o_i',
    hot: ['i', 'j', 'ij'],
    note: tx(
      <>
        Servono solo il delta di j e l’uscita <Tex>{'o_i'}</Tex> dell’unità di input i: ancora quantità adiacenti al peso.
      </>,
      <>
        Only the delta of j and the output <Tex>{'o_i'}</Tex> of the input unit i are needed: again quantities adjacent to the weight.
      </>,
    ),
  },
}

export function Locality() {
  const [focus, setFocus] = useState<Focus>('wkj')
  const F = FOCUS[focus]
  const on = (k: string) => (F.hot.includes(k) ? ' is-hot' : '')
  const seen = useLatch({ dj: focus === 'dj', wji: focus === 'wji' })
  return (
    <div>
      <div className="wbar">
        <Segmented
          value={focus}
          onChange={setFocus}
          options={[
            {
              value: 'wkj',
              label: (
                <>
                  {tx('aggiornare', 'update')} <Tex>{'w_{kj}'}</Tex>
                </>
              ),
            },
            {
              value: 'dj',
              label: (
                <>
                  {tx('calcolare', 'compute')} <Tex>{'\\delta_j'}</Tex>
                </>
              ),
            },
            {
              value: 'wji',
              label: (
                <>
                  {tx('aggiornare', 'update')} <Tex>{'w_{ji}'}</Tex>
                </>
              ),
            },
          ]}
        />
      </div>
      <div className="wgrid">
        <svg viewBox="0 0 360 300" className="loc7" role="img" aria-label={tx('Porzione di rete: unità i, j e k con i pesi w_ji e w_kj', 'Portion of the network: units i, j and k with the weights w_ji and w_kj')}>
          {[
            ['ij', 70, 250, 180, 150],
            ['i2j', 180, 250, 180, 150],
            ['i3j', 290, 250, 180, 150],
            ['jk', 180, 150, 70, 50],
            ['jk2', 180, 150, 180, 50],
            ['jk3', 180, 150, 290, 50],
          ].map(([k, x1, y1, x2, y2]) => (
            <line key={k as string} x1={x1} y1={y1} x2={x2} y2={y2} className={`loc7__edge${on(k as string)}`} />
          ))}
          {[
            ['i', 70, 250, 'i'],
            ['i2', 180, 250, ''],
            ['i3', 290, 250, ''],
            ['j', 180, 150, 'j'],
            ['k', 70, 50, 'k'],
            ['k2', 180, 50, ''],
            ['k3', 290, 50, ''],
          ].map(([k, x, y, l]) => (
            <g key={k as string} transform={`translate(${x} ${y})`} className={`loc7__node${on(k as string)}`}>
              <circle r={24} />
              <text y={6} textAnchor="middle">
                {l as string}
              </text>
            </g>
          ))}
          <text x={108} y={205} className="loc7__lbl">
            {svgScript('w', 'ji')}
          </text>
          <text x={100} y={100} className="loc7__lbl">
            {svgScript('w', 'kj')}
          </text>
          <text x={40} y={286} className="loc7__lbl">
            {svgScript('o', 'i')}
          </text>
          <text x={214} y={160} className="loc7__lbl">
            {svgScript('o', 'j')}
          </text>
          {focus !== 'wji' && (
            <text x={100} y={30} className="loc7__lbl loc7__lbl--d">
              {svgScript('δ', 'k')}
            </text>
          )}
          {focus !== 'wkj' && (
            <text x={214} y={134} className="loc7__lbl loc7__lbl--d">
              {svgScript('δ', 'j')}
            </text>
          )}
        </svg>
        <div className="wside">
          <div className="wpanel">
            <div className="wmath">
              <Tex>{F.tex}</Tex>
            </div>
            <p className="wnote">{F.note}</p>
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              <>
                Guarda cosa serve per calcolare <Tex>{'\\delta_j'}</Tex>: le unità sopra j e i pesi che le collegano.
              </>,
              <>
                See what is needed to compute <Tex>{'\\delta_j'}</Tex>: the units above j and the weights that connect them.
              </>,
            ),
            done: seen.dj,
          },
          {
            label: tx(
              <>
                Passa a <Tex>{'w_{ji}'}</Tex>: di nuovo solo unità e pesi adiacenti.
              </>,
              <>
                Switch to <Tex>{'w_{ji}'}</Tex>: again only adjacent units and weights.
              </>,
            ),
            done: seen.wji,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 7.4 */

type Net = { wh: number[][]; wo: number[][] } // wh[j] = [w_j0, w_j1, w_j2]; wo[k] = [w_k0, w_k1..w_k3]
const X4 = [1, 0.5]
const D4 = [0.9, 0.1]
const ETA4 = 0.8
function initNet(): Net {
  const r = rng(707)
  const w = () => (r() - 0.5) * 1.6
  return { wh: [0, 1, 2].map(() => [w(), w(), w()]), wo: [0, 1].map(() => [w(), w(), w(), w()]) }
}
function forward(n: Net) {
  const netj = n.wh.map((w) => w[0] + w[1] * X4[0] + w[2] * X4[1])
  const oj = netj.map((v) => sigmoid(v))
  const netk = n.wo.map((w) => w[0] + w.slice(1).reduce((s, v, j) => s + v * oj[j], 0))
  const ok = netk.map((v) => sigmoid(v))
  const Ep = 0.5 * ok.reduce((s, o, k) => s + (D4[k] - o) ** 2, 0)
  const dk = ok.map((o, k) => (D4[k] - o) * o * (1 - o))
  const dj = oj.map((o, j) => dk.reduce((s, d, k) => s + d * n.wo[k][j + 1], 0) * o * (1 - o))
  return { netj, oj, netk, ok, Ep, dk, dj }
}
function update(n: Net): Net {
  const f = forward(n)
  return {
    wo: n.wo.map((w, k) => w.map((v, u) => v + ETA4 * f.dk[k] * (u === 0 ? 1 : f.oj[u - 1]))),
    wh: n.wh.map((w, j) => w.map((v, u) => v + ETA4 * f.dj[j] * (u === 0 ? 1 : X4[u - 1]))),
  }
}
const PHASES: ReactNode[] = [
  tx(
    'Calcolo in avanti: le uscite di tutte le unità, strato per strato.',
    'Forward computation: the outputs of all the units, layer by layer.',
  ),
  <>
    {tx('Errori e delta nello strato di uscita:', 'Errors and deltas in the output layer:')}{' '}
    <Tex>{"\\delta_k = (d_k - o_k)\\, f'_k(net_k)"}</Tex>.
  </>,
  <>
    {tx('Propagazione all’indietro:', 'Backward propagation:')}{' '}
    <Tex>{"\\delta_j = \\big(\\sum_k \\delta_k\\, w_{kj}\\big)\\, f'_j(net_j)"}</Tex>.
  </>,
  <>
    {tx('Aggiornamento dei pesi (bias compresi):', 'Update of the weights (biases included):')}{' '}
    <Tex>{'w_{tu} \\leftarrow w_{tu} + \\eta\\, \\delta_t\\, o_u'}</Tex>.
  </>,
]

export function BackpropFlow() {
  const [net, setNet] = useState<Net>(initNet)
  const [phase, setPhase] = useState(-1)
  const [cycles, setCycles] = useState(0)
  const [prevE, setPrevE] = useState<number | null>(null)
  const f = forward(net)
  const next = () => {
    if (phase < 3) setPhase(phase + 1)
    if (phase === 2) {
      setPrevE(f.Ep)
      setNet(update(net))
      setCycles((c) => c + 1)
    }
    if (phase === 3) setPhase(0)
  }
  const many = () => {
    let n = net
    setPrevE(f.Ep)
    for (let t = 0; t < 50; t++) n = update(n)
    setNet(n)
    setCycles((c) => c + 50)
    setPhase(0)
  }
  const seen = useLatch({ back: phase >= 2, one: cycles >= 1, many: cycles >= 50 })
  const nodes: NetNode[] = [
    { id: '0:0', x: 150, y: 270, label: 'x₁', kind: 'input' },
    { id: '0:1', x: 290, y: 270, label: 'x₂', kind: 'input' },
    ...[0, 1, 2].map((j) => ({ id: `1:${j}` as NodeId, x: 100 + j * 120, y: 165, label: `j${sub(j + 1)}`, kind: 'hidden' as const })),
    ...[0, 1].map((k) => ({ id: `2:${k}` as NodeId, x: 160 + k * 120, y: 60, label: `k${sub(k + 1)}`, kind: 'output' as const })),
  ]
  const edges: NetEdge[] = [
    ...[0, 1, 2].flatMap((j) => [0, 1].map((i) => ({ from: `0:${i}` as NodeId, to: `1:${j}` as NodeId, w: net.wh[j][i + 1] }))),
    ...[0, 1].flatMap((k) => [0, 1, 2].map((j) => ({ from: `1:${j}` as NodeId, to: `2:${k}` as NodeId, w: net.wo[k][j + 1] }))),
  ]
  const pos = new Map(nodes.map((n) => [n.id, n]))
  const hot = new Set<string>()
  if (phase === 0) nodes.forEach((n) => hot.add(n.id))
  if (phase === 1) [0, 1].forEach((k) => hot.add(`2:${k}`))
  if (phase === 2) [0, 1, 2].forEach((j) => hot.add(`1:${j}`))
  if (phase === 3) edges.forEach((e) => hot.add(`${e.from}>${e.to}`))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('uscite o (in avanti)', 'outputs o (forward)'), color: 'var(--ink)' },
            { label: tx('delta (all’indietro)', 'deltas (backward)'), color: 'var(--c-red)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid">
        <NetSvg W={440} H={310} nodes={nodes} edges={edges} r={20} hot={hot} ariaLabel={tx('Retropropagazione dei delta in una rete 2-3-2', 'Backpropagation of the deltas in a 2-3-2 network')}>
          {phase >= 2 &&
            [0, 1].flatMap((k) =>
              [0, 1, 2].map((j) => {
                const a = pos.get(`2:${k}`)!
                const b = pos.get(`1:${j}`)!
                return (
                  <line
                    key={`${k}${j}`}
                    x1={a.x + 6}
                    y1={a.y + 18}
                    x2={b.x + 6}
                    y2={b.y - 22}
                    className="bp7__back"
                    markerEnd="url(#bp-arrow)"
                  />
                )
              }),
            )}
          <defs>
            <marker
              id="bp-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0,0L10,5L0,10Z" className="bp7__backhead" />
            </marker>
          </defs>
          {phase >= 0 &&
            nodes.map((n) => {
              const [l, a] = n.id.split(':').map(Number)
              const o = l === 0 ? X4[a] : l === 1 ? f.oj[a] : f.ok[a]
              return (
                <text key={n.id} x={n.x} y={n.y + 36} textAnchor="middle" className="bp7__val">
                  o = {fmt(o, 2)}
                </text>
              )
            })}
          {phase >= 1 &&
            [0, 1].map((k) => (
              <g key={k} transform={`translate(${pos.get(`2:${k}`)!.x + 34} ${pos.get(`2:${k}`)!.y - 18})`} className="bp7__delta">
                <circle r={17} />
                <text y={4} textAnchor="middle">
                  {fmt(f.dk[k], 3)}
                </text>
              </g>
            ))}
          {phase >= 2 &&
            [0, 1, 2].map((j) => (
              <g key={j} transform={`translate(${pos.get(`1:${j}`)!.x - 36} ${pos.get(`1:${j}`)!.y - 14})`} className="bp7__delta">
                <circle r={17} />
                <text y={4} textAnchor="middle">
                  {fmt(f.dj[j], 3)}
                </text>
              </g>
            ))}
          {[0, 1].map((k) => (
            <text key={k} x={pos.get(`2:${k}`)!.x} y={18} textAnchor="middle" className="bp7__lbl">
              {subDigits(`d${sub(k + 1)} = ${fmt(D4[k], 1)}`)}
            </text>
          ))}
        </NetSvg>
        <div className="wside">
          <ol className="arch6__steps">
            {PHASES.map((p, i) => (
              <li key={i} className={i === phase ? 'is-on' : undefined}>
                {p}
              </li>
            ))}
            <li className={phase === 3 ? 'is-on' : undefined}>
              {tx('Si ricomincia, fino al criterio di arresto.', 'Start again, until the stopping criterion is met.')}
            </li>
          </ol>
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={next}>
              {phase < 0
                ? tx('Calcolo in avanti', 'Forward pass')
                : phase === 3
                  ? tx('Nuovo ciclo', 'New cycle')
                  : tx('Passo successivo', 'Next step')}
            </Btn>
            <Btn icon="play" onClick={many}>
              {tx('50 cicli', '50 cycles')}
            </Btn>
            <Btn
              icon="reset"
              onClick={() => {
                setNet(initNet())
                setPhase(-1)
                setCycles(0)
                setPrevE(null)
              }}
              title={tx('Pesi iniziali', 'Initial weights')}
            />
          </div>
          <div className="readouts">
            <Readout
              label={<Tex>{'E_p'}</Tex>}
              tone="accent"
              value={fmt(f.Ep, 4)}
              sub={prevE !== null ? tx(`prima: ${fmt(prevE, 4)}`, `before: ${fmt(prevE, 4)}`) : `η = ${fmt(ETA4, 1)}`}
            />
            <Readout label={tx('cicli', 'cycles')} value={String(cycles)} />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Avanza fino alla propagazione all’indietro: i delta delle uscite scendono verso le unità nascoste.',
              'Advance to the backward propagation: the deltas of the outputs move down to the hidden units.',
            ),
            done: seen.back,
          },
          {
            label: tx(
              <>
                Completa un ciclo con l’aggiornamento dei pesi: <Tex>{'E_p'}</Tex> diminuisce.
              </>,
              <>
                Complete a cycle with the update of the weights: <Tex>{'E_p'}</Tex> decreases.
              </>,
            ),
            done: seen.one,
          },
          { label: tx('Esegui 50 cicli: le uscite si avvicinano ai target.', 'Run 50 cycles: the outputs approach the targets.'), done: seen.many },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 7.5 (aggiunta) */

export function NumericExample() {
  const [x, setX] = useState(1)
  const [wji, setWji] = useState(0.5)
  const [wkj, setWkj] = useState(1)
  const [d, setD] = useState(1)
  const [eta, setEta] = useState(0.1)
  const [applied, setApplied] = useState(0)
  const netj = wji * x
  const oj = sigmoid(netj)
  const ok = wkj * oj
  const dk = d - ok
  const dj = dk * wkj * oj * (1 - oj)
  const dwkj = eta * dk * oj
  const dwji = eta * dj * x
  const E = 0.5 * (d - ok) ** 2
  const apply = () => {
    setWkj(wkj + dwkj)
    setWji(wji + dwji)
    setApplied((a) => a + 1)
  }
  const reset = () => {
    setX(1)
    setWji(0.5)
    setWkj(1)
    setD(1)
    setEta(0.1)
    setApplied(0)
  }
  const seen = useLatch({ one: applied >= 1, close: applied >= 1 && Math.abs(d - ok) < 0.05 })
  const rows: [string, number, string][] = [
    ['net_j = w_{ji}\\,x', netj, 'forward'],
    ['o_j = \\sigma(net_j)', oj, 'forward'],
    ['o_k = w_{kj}\\,o_j', ok, tx('forward (uscita lineare)', 'forward (linear output)')],
    ['\\delta_k = (d - o_k)\\cdot 1', dk, tx('delta di uscita', 'output delta')],
    ["\\delta_j = \\delta_k\\, w_{kj}\\, \\sigma'(net_j)", dj, tx('delta nascosto', 'hidden delta')],
    ['\\Delta w_{kj} = \\eta\\,\\delta_k\\,o_j', dwkj, tx('aggiornamento', 'update')],
    ['\\Delta w_{ji} = \\eta\\,\\delta_j\\,x', dwji, tx('aggiornamento', 'update')],
  ]
  return (
    <div>
      <div className="wgrid">
        <table className="hyp__table num7">
          <thead>
            <tr>
              <th>{tx('quantità', 'quantity')}</th>
              <th>{tx('valore', 'value')}</th>
              <th>{tx('fase', 'phase')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([t, v, ph]) => (
              <tr key={t}>
                <td>
                  <Tex>{t}</Tex>
                </td>
                <td className="hyp__num">{fmt(v, 4)}</td>
                <td className="num7__ph">{ph}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="wside">
          <Slider label={<Tex>{'w_{ji}'}</Tex>} min={-2} max={2} step={0.01} value={wji} onChange={setWji} format={(v) => fmt(v, 3)} />
          <Slider label={<Tex>{'w_{kj}'}</Tex>} min={-2} max={2} step={0.01} value={wkj} onChange={setWkj} format={(v) => fmt(v, 3)} />
          <Slider label={<Tex>{'x'}</Tex>} min={-2} max={2} step={0.1} value={x} onChange={setX} format={(v) => fmt(v, 1)} />
          <Slider label={<Tex>{'d'}</Tex>} min={-1} max={2} step={0.1} value={d} onChange={setD} format={(v) => fmt(v, 1)} />
          <Slider label={<Tex>{'\\eta'}</Tex>} min={0.01} max={1} step={0.01} value={eta} onChange={setEta} format={(v) => fmt(v, 2)} />
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={apply}>
              {tx('Applica l’aggiornamento', 'Apply the update')}
            </Btn>
            <Btn icon="reset" onClick={reset} title={tx('Valori degli appunti', 'Values of the notes')} />
          </div>
          <Readout
            label={<Tex>{'E = \\tfrac12 (d - o_k)^2'}</Tex>}
            tone="accent"
            value={fmt(E, 4)}
            sub={tx(`aggiornamenti applicati: ${applied}`, `updates applied: ${applied}`)}
          />
        </div>
      </div>
      <p className="wnote">
        {tx('Con i valori iniziali (quelli dell’esempio) si ritrovano', 'With the initial values (those of the example) one recovers')}{' '}
        <Tex>{`\\Delta w_{kj} \\approx ${n2(0.0235, 4)}`}</Tex> {tx('e', 'and')}{' '}
        <Tex>{`\\Delta w_{ji} \\approx ${n2(0.0089, 4)}`}</Tex>.
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Applica l’aggiornamento una volta: entrambi i pesi aumentano e l’uscita sale verso il target.',
              'Apply the update once: both weights increase and the output rises toward the target.',
            ),
            done: seen.one,
          },
          {
            label: tx(
              <>
                Continua ad applicarlo finché <Tex>{'o_k'}</Tex> dista meno di 0,05 dal target.
              </>,
              <>
                Keep applying it until <Tex>{'o_k'}</Tex> is less than 0.05 away from the target.
              </>,
            ),
            done: seen.close,
          },
        ]}
      />
    </div>
  )
}
