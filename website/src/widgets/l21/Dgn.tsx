import { useState, type ReactNode } from 'react'
import { Axes, Dot, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

type XY = [number, number]

/** distanze (numero di archi) da un nodo a tutti gli altri */
function distances(n: number, edges: [number, number][], from: number) {
  const d = new Array(n).fill(Infinity)
  d[from] = 0
  const queue = [from]
  while (queue.length) {
    const v = queue.shift()!
    for (const [a, b] of edges) {
      const u = a === v ? b : b === v ? a : -1
      if (u >= 0 && d[u] === Infinity) {
        d[u] = d[v] + 1
        queue.push(u)
      }
    }
  }
  return d as number[]
}

/* ------------------------------------------------------------------ Fig. 21.7 e 21.8: il contesto attraverso gli strati */

const PL_N: XY[] = [
  [30, -22],
  [12, 22],
  [110, 0],
  [190, 0],
  [270, 0],
  [350, 0],
]
const PL_E: [number, number][] = [
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
]

export function ContextPlanes({ variant }: { variant: 'context' | 'layers' }) {
  const six = variant === 'layers'
  const N = six ? 6 : 5
  const edges = PL_E.filter(([a, b]) => a < N && b < N)
  const [v, setV] = useState(3)
  const [layer, setLayer] = useState(3)
  const [mode, setMode] = useState<'nn4g' | 'gcn'>('nn4g')
  const [picks, setPicks] = useState(0)
  const seen = useLatch({ l2: layer !== 3, gcn: mode === 'gcn' })
  const dist = distances(N, edges, v)
  const nb = edges.flatMap(([a, b]) => (a === v ? [b] : b === v ? [a] : []))
  const oy = (l: number) => 268 - (l - 1) * 100
  const ox = (l: number) => 50 + (l - 1) * 34
  const pos = (i: number, l: number): XY => [ox(l) + 40 + PL_N[i][0] * (six ? 0.92 : 1.05), oy(l) + PL_N[i][1]]
  const pw = six ? 400 : 370
  const top = variant === 'context' ? 3 : layer
  // archi di dipendenza: lo stato di v allo strato l usa gli stati dei vicini negli strati precedenti
  const deps: { from: XY; to: XY }[] = []
  for (let l = 2; l <= 3; l++) {
    if (variant === 'layers' && l !== layer) continue
    const lows = variant === 'layers' && mode === 'nn4g' ? Array.from({ length: l - 1 }, (_, j) => j + 1) : [l - 1]
    for (const j of lows) for (const u of nb) deps.push({ from: pos(v, l), to: pos(u, j) })
  }
  const ctxCount = dist.filter((d) => d <= top - 1).length
  return (
    <div>
      {variant === 'layers' && (
        <div className="wbar">
          <Segmented
            size="sm"
            label={tx('stato da calcolare', 'state to compute')}
            value={layer}
            onChange={setLayer}
            options={[1, 2, 3].map((l) => ({ value: l, label: <Tex>{`h_v^{(${l})}`}</Tex> }))}
          />
          <Segmented
            size="sm"
            label={tx('modello', 'model')}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'nn4g', label: 'NN4G' },
              { value: 'gcn', label: 'GCN' },
            ]}
          />
        </div>
      )}
      <div className="pipe16__scroll">
        <svg className="pl21" viewBox="0 0 590 330" style={{ minWidth: 500 }} role="img" aria-label={tx('Lo stesso grafo su tre strati sovrapposti: il contesto di un nodo cresce di strato in strato', 'The same graph on three stacked layers: the context of a node grows from layer to layer')}>
          {[1, 2, 3].map((l) => (
            <g key={l}>
              <path className={'pl21__plane' + (variant === 'layers' && l === layer ? ' is-on' : '')} d={`M${ox(l)},${oy(l) + 40}h${pw}l34,-80h${-pw}z`} />
              <text className="pl21__t" x={ox(l) + pw - 10} y={oy(l) + 33} textAnchor="end">
                {variant === 'context' ? tx(`iterazione ${l}`, `iteration ${l}`) : tx(`strato ${l}`, `layer ${l}`)}
              </text>
            </g>
          ))}
          {[1, 2, 3].map((l) => {
            const radius = l - 1
            const shown = variant === 'context' || l <= layer
            return (
              <g key={l} opacity={shown ? 1 : 0.35}>
                {edges.map(([a, b], i) => {
                  const A = pos(a, l)
                  const B = pos(b, l)
                  const inCtx = variant === 'context' && dist[a] <= radius && dist[b] <= radius
                  return <line key={i} className={'pl21__e' + (inCtx ? ' is-ctx' : '')} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
                })}
              </g>
            )
          })}
          {deps.map((d, i) => (
            <line key={i} className="pl21__dep" x1={d.from[0]} y1={d.from[1]} x2={d.to[0]} y2={d.to[1]} />
          ))}
          {[1, 2, 3].map((l) => {
            const radius = l - 1
            return (
              <g key={l}>
                {Array.from({ length: N }, (_, i) => {
                  const p = pos(i, l)
                  const inCtx = variant === 'context' ? dist[i] <= radius : l < layer && nb.includes(i) && (mode === 'nn4g' || l === layer - 1)
                  const isV = i === v && (variant === 'context' || l === layer)
                  return (
                    <circle
                      key={i}
                      className={'pl21__n' + (isV ? ' is-v' : inCtx ? ' is-ctx' : '')}
                      cx={p[0]}
                      cy={p[1]}
                      r={10}
                      role="button"
                      tabIndex={l === 3 ? 0 : -1}
                      aria-label={tx(`nodo ${i + 1}`, `node ${i + 1}`)}
                      onClick={() => {
                        setV(i)
                        setPicks(picks + 1)
                      }}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setV(i)}
                    />
                  )
                })}
                {(variant === 'context' || l === layer) && (
                  <text className="pl21__h" x={pos(v, l)[0]} y={pos(v, l)[1] - 17} textAnchor="middle">
                    {svgScript('h', 'v')}
                    <tspan dy="-8" fontSize="0.72em">
                      ({l})
                    </tspan>
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      {variant === 'context' ? (
        <Controls>
          <div className="readouts">
            <Readout
              label={tx(<>contesto di <Tex>{'h_v^{(3)}'}</Tex></>, <>context of <Tex>{'h_v^{(3)}'}</Tex></>)}
              tone="accent"
              value={tx('raggio 2', 'radius 2')}
              sub={tx(`${ctxCount} nodi su ${N}`, `${ctxCount} of ${N} nodes`)}
            />
            <Readout
              label={tx(<>contesto di <Tex>{'h_v^{(2)}'}</Tex></>, <>context of <Tex>{'h_v^{(2)}'}</Tex></>)}
              value={tx('raggio 1', 'radius 1')}
              sub={tx(`${dist.filter((d) => d <= 1).length} nodi`, `${dist.filter((d) => d <= 1).length} nodes`)}
            />
            <Readout
              label={tx(<>contesto di <Tex>{'h_v^{(1)}'}</Tex></>, <>context of <Tex>{'h_v^{(1)}'}</Tex></>)}
              value={tx('raggio 0', 'radius 0')}
              sub={tx('solo il nodo', 'only the node')}
            />
          </div>
          <Legend
            items={[
              { label: tx('il nodo v', 'the node v'), color: 'var(--c-red)', kind: 'dot' },
              { label: tx('il suo contesto a quello strato', 'its context at that layer'), color: 'var(--c-blue)', kind: 'dot' },
              { label: tx('stati dei vicini usati dallo strato sopra', 'neighbor states used by the layer above'), color: 'var(--ink-2)', kind: 'dash' },
            ]}
          />
        </Controls>
      ) : (
        <div className="wpanel">
          <div className="wpanel__title">
            <Tex>{`h_v^{(${layer})}`}</Tex> {tx('dipende da', 'depends on')}
          </div>
          {layer === 1
            ? tx('Solo dall’etichetta del nodo v.', 'Only the label of node v.')
            : mode === 'nn4g'
              ? tx(
                  `L’etichetta di v e gli stati dei vicini di v in tutti gli strati precedenti (${Array.from({ length: layer - 1 }, (_, j) => j + 1).join(' e ')}): non è ricorsivo.`,
                  `The label of v and the states of the neighbors of v in all the previous layers (${Array.from({ length: layer - 1 }, (_, j) => j + 1).join(' and ')}): it is not recursive.`,
                )
              : tx(
                  `Lo stato di v e gli stati dei vicini di v nello strato precedente (${layer - 1}).`,
                  `The state of v and the states of the neighbors of v in the previous layer (${layer - 1}).`,
                )}
        </div>
      )}
      <Tasks
        items={
          variant === 'context'
            ? [
                {
                  label: tx(
                    'Clicca un altro nodo: il suo contesto si allarga di un passo a ogni iterazione.',
                    'Click another node: its context widens by one step at every iteration.',
                  ),
                  done: picks >= 1,
                },
                {
                  label: tx(
                    'Scegli un nodo all’estremità: dopo tre iterazioni il suo contesto non copre ancora tutto il grafo.',
                    'Choose a node at the end: after three iterations its context still does not cover the whole graph.',
                  ),
                  done: picks >= 1 && ctxCount < N,
                },
              ]
            : [
                {
                  label: tx(
                    'Cambia lo stato da calcolare: ogni iterazione del message passing è un nuovo strato.',
                    'Change the state to compute: every iteration of message passing is a new layer.',
                  ),
                  done: seen.l2,
                },
                {
                  label: tx(
                    'Confronta NN4G e GCN: NN4G usa gli stati di tutti gli strati precedenti, una GCN solo quelli dello strato sotto.',
                    'Compare NN4G and GCN: NN4G uses the states of all the previous layers, a GCN only those of the layer below.',
                  ),
                  done: seen.gcn,
                },
              ]
        }
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.9: GraphESN */

const GE_N: XY[] = [
  [96, 24],
  [150, 78],
  [206, 124],
  [96, 132],
  [34, 190],
  [150, 180],
]
const GE_E: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [3, 5],
  [4, 5],
]
const GE_L = [0.8, -0.5, 0.3, 0.6, -0.9, 0.1]
/** autovalore massimo della matrice di adiacenza (iterazione delle potenze) */
const LAMBDA = (() => {
  let x = GE_N.map(() => 1)
  let lam = 1
  for (let k = 0; k < 200; k++) {
    const y = x.map((_, v) => GE_E.reduce((s, [a, b]) => s + (a === v ? x[b] : b === v ? x[a] : 0), 0))
    lam = Math.hypot(...y) / Math.hypot(...x)
    x = y.map((q) => q / Math.hypot(...y))
  }
  return lam
})()
const stepEsn = (h: number[], w: number) => h.map((_, v) => Math.tanh(GE_L[v] + w * GE_E.reduce((s, [a, b]) => s + (a === v ? h[b] : b === v ? h[a] : 0), 0)))
const maxDiff = (a: number[], b: number[]) => Math.max(...a.map((x, i) => Math.abs(x - b[i])))
const stateColor = (h: number) => `color-mix(in srgb, var(--c-orange) ${Math.round(((h + 1) / 2) * 100)}%, var(--c-blue))`
const EPS = 1e-4

export function GraphEsn() {
  const [w, setW] = useState(0.3)
  const [hist, setHist] = useState<number[][]>([GE_N.map(() => 0)])
  const [seed, setSeed] = useState(0)
  const h = hist[hist.length - 1]
  const diffs = hist.slice(1).map((x, i) => maxDiff(x, hist[i]))
  const conv = diffs.length > 0 && diffs[diffs.length - 1] < EPS
  const contractive = w * LAMBDA < 1
  const one = () => setHist([...hist, stepEsn(h, w)])
  const run = () => {
    const out = [...hist]
    for (let k = 0; k < 60; k++) {
      const nx = stepEsn(out[out.length - 1], w)
      out.push(nx)
      if (maxDiff(nx, out[out.length - 2]) < EPS) break
    }
    setHist(out)
  }
  const reset = (init: number[]) => setHist([init])
  const seen = useLatch({ conv, big: !contractive })
  return (
    <div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">
            {conv
              ? tx('Embedding a punto fisso', 'Fixed-point embedding')
              : hist.length === 1
                ? tx('Grafo di input', 'Input graph')
                : tx('Calcolo iterativo degli stati', 'Iterative computation of the states')}
          </div>
          <svg className="ge21" viewBox="0 0 250 220" role="img" aria-label={tx('Grafo con gli stati dei nodi calcolati iterativamente', 'Graph with the node states computed iteratively')}>
            {GE_E.map(([a, b], i) => (
              <line key={i} className="ge21__e" x1={GE_N[a][0]} y1={GE_N[a][1]} x2={GE_N[b][0]} y2={GE_N[b][1]} />
            ))}
            {GE_N.map(([x, y], i) => (
              <g key={i}>
                <circle className="ge21__n" cx={x} cy={y} r={15} style={hist.length > 1 ? { fill: stateColor(h[i]) } : undefined} />
                <text className="ge21__v" x={x + 20} y={y - 10}>
                  {fmt(h[i], 2)}
                </text>
              </g>
            ))}
          </svg>
          <div className="readouts">
            <Readout label={tx('iterazioni', 'iterations')} tone="accent" value={String(hist.length - 1)} />
            <Readout
              label={
                <>
                  global pooling <Tex>{'X(\\mathbf{h}(g))'}</Tex>
                </>
              }
              value={fmt(h.reduce((s, x) => s + x, 0), 3)}
              sub={conv ? tx('va al readout lineare addestrato', 'goes to the trained linear readout') : tx('somma degli stati', 'sum of the states')}
            />
          </div>
        </div>
        <div>
          <div className="htf__title">{tx('Variazione massima degli stati a ogni iterazione', 'Maximum change of the states at every iteration')}</div>
          <Plot xDomain={[0, Math.max(12, diffs.length)]} yDomain={[0, 1]} aspect={0.62} minH={190} maxH={260} margin={{ l: 40, b: 36 }}>
            <Axes xTicks={5} yTicks={[0, 0.5, 1]} xLabel={tx('iterazione', 'iteration')} />
            <Polyline pts={diffs.map((d, i) => ({ x: i + 1, y: Math.min(1, d) }))} color="var(--c-violet)" width={2.2} />
            {diffs.map((d, i) => (
              <Dot key={i} x={i + 1} y={Math.min(1, d)} color="var(--c-violet)" r={3.4} />
            ))}
          </Plot>
          <span className={'verdict ' + (conv ? 'verdict--good' : 'verdict--info')}>
            {conv
              ? tx(`Punto fisso raggiunto dopo ${hist.length - 1} iterazioni.`, `Fixed point reached after ${hist.length - 1} iterations.`)
              : tx('Gli stati stanno ancora cambiando.', 'The states are still changing.')}
          </span>
        </div>
      </div>
      <Controls>
        <Btn icon="step" variant="soft" onClick={one}>
          {tx('Un’iterazione', 'One iteration')}
        </Btn>
        <Btn icon="play" onClick={run} disabled={conv}>
          {tx('Fino a convergenza', 'Until convergence')}
        </Btn>
        <Btn
          icon="reset"
          onClick={() => {
            const r = rng(2109 + seed * 7)
            reset(GE_N.map(() => 2 * r() - 1))
            setSeed(seed + 1)
          }}
        >
          {tx('Stato iniziale casuale', 'Random initial state')}
        </Btn>
        <Slider
          label={
            <>
              {tx('peso ricorrente', 'recurrent weight')} <Tex>{'\\hat w'}</Tex>
            </>
          }
          min={0.05}
          max={1}
          step={0.05}
          value={w}
          onChange={(x) => {
            setW(x)
            reset(GE_N.map(() => 0))
          }}
          format={(x) => fmt(x, 2)}
          width={190}
        />
      </Controls>
      <p className="wnote">
        {tx('Stati scalari, calcolati davvero con', 'Scalar states, actually computed with')}{' '}
        <Tex>{'h_v \\leftarrow \\tanh\\big(l_v + \\hat w \\sum_{u \\in \\mathcal{N}(v)} h_u\\big)'}</Tex>
        {tx(', senza addestrare nulla.', ', without training anything.')}{' '}
        {contractive
          ? tx('Con questo peso la dinamica è contrattiva', 'With this weight the dynamics is contractive')
          : tx('Con questo peso la dinamica non è garantita contrattiva', 'With this weight the dynamics is not guaranteed to be contractive')}{' '}
        (<Tex>{`\\hat w \\cdot \\|A\\| = ${fmt(w * LAMBDA, 2)}`}</Tex>):{' '}
        {contractive
          ? tx('il punto fisso non dipende dallo stato iniziale.', 'the fixed point does not depend on the initial state.')
          : tx('il punto raggiunto può dipendere dallo stato iniziale.', 'the point reached may depend on the initial state.')}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Itera fino a convergenza: gli stati smettono di cambiare, e il punto fisso è l’embedding del grafo.',
              'Iterate until convergence: the states stop changing, and the fixed point is the embedding of the graph.',
            ),
            done: seen.conv,
          },
          {
            label: tx(
              'Riparti da uno stato iniziale casuale: con una dinamica contrattiva si arriva agli stessi valori.',
              'Restart from a random initial state: with a contractive dynamics the same values are reached.',
            ),
            done: seed >= 1 && conv,
          },
          {
            label: tx(
              'Alza il peso ricorrente finché la dinamica non è più contrattiva e ripeti la prova.',
              'Raise the recurrent weight until the dynamics is no longer contractive and repeat the test.',
            ),
            done: seen.big,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.10: problemi aperti */

const ISSUES = [
  {
    id: 'eff',
    title: tx('Efficienza', 'Efficiency'),
    text: tx(
      'Scalare l’addestramento a grafi molto grandi, ad esempio oltre 100.000 nodi.',
      'Scaling training to very large graphs, for example beyond 100,000 nodes.',
    ),
  },
  {
    id: 'under',
    title: 'Under-reaching',
    text: tx(
      'I modelli profondi possono non riuscire a sfruttare le interazioni a lungo raggio tra i nodi del grafo.',
      'Deep models may fail to exploit the long-range interactions between the nodes of the graph.',
    ),
  },
  {
    id: 'expr',
    title: tx('Espressività', 'Expressiveness'),
    text: tx(
      'I modelli possono non riuscire a imparare rappresentazioni dei nodi significative (il collo di bottiglia).',
      'Models may fail to learn meaningful node representations (the bottleneck).',
    ),
  },
] as const
const DEPTH = 4
/** nuvola di punti per l'icona del grafo molto grande */
const CLOUD = (() => {
  const r = rng(2110)
  return Array.from({ length: 60 }, () => [8 + r() * 84, 6 + r() * 44])
})()

export function OpenIssues() {
  const [sel, setSel] = useState<(typeof ISSUES)[number]['id']>('under')
  const [L, setL] = useState(2)
  const seen = useLatch({ reach: L >= DEPTH, small: L === 1 })
  const X = (k: number) => 520 - k * 112
  const Y = (k: number, i: number) => 16 + ((i + 0.5) * 208) / 2 ** k
  const icon: Record<string, ReactNode> = {
    eff: (
      <svg viewBox="0 0 100 56" className="oi21__icon" aria-hidden="true">
        {CLOUD.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} />
        ))}
      </svg>
    ),
    under: (
      <svg viewBox="0 0 100 56" className="oi21__icon" aria-hidden="true">
        <path d="M12,40H88" className="oi21__ln" />
        <path d="M14,34Q50,-8 86,34" className="oi21__far" />
        {[12, 31, 50, 69, 88].map((x) => (
          <circle key={x} cx={x} cy={40} r={4} />
        ))}
      </svg>
    ),
    expr: (
      <svg viewBox="0 0 100 56" className="oi21__icon" aria-hidden="true">
        {[8, 22, 36, 50].map((y) => (
          <path key={y} className="oi21__far" d={`M10,${y}C40,${y} 46,28 70,28H90`} />
        ))}
        {[8, 22, 36, 50].map((y) => (
          <circle key={y} cx={10} cy={y} r={4} />
        ))}
        <circle cx={90} cy={28} r={5} />
      </svg>
    ),
  }
  return (
    <div>
      <div className="oi21">
        {ISSUES.map((q) => (
          <button key={q.id} type="button" className={`oi21__card oi21__card--${q.id}` + (sel === q.id ? ' is-on' : '')} aria-pressed={sel === q.id} onClick={() => setSel(q.id)}>
            {icon[q.id]}
            <b>{q.title}</b>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
      <div className="pipe16__scroll">
        <svg className="oi21__tree" viewBox="0 0 590 240" style={{ minWidth: 480 }} role="img" aria-label={tx('Il campo recettivo di un nodo al crescere degli strati', 'The receptive field of a node as the layers grow')}>
          {Array.from({ length: DEPTH }, (_, k) =>
            Array.from({ length: 2 ** (k + 1) }, (_, i) => (
              <line key={`${k}-${i}`} className={'oi21__e' + (k + 1 <= L ? ' is-on' : '')} x1={X(k + 1)} y1={Y(k + 1, i)} x2={X(k)} y2={Y(k, Math.floor(i / 2))} />
            )),
          )}
          {Array.from({ length: DEPTH + 1 }, (_, k) =>
            Array.from({ length: 2 ** k }, (_, i) => {
              const far = k === DEPTH && i === 0
              return <circle key={`${k}-${i}`} className={'oi21__n' + (k === 0 ? ' is-v' : k <= L ? ' is-on' : '') + (far ? ' is-far' : '')} cx={X(k)} cy={Y(k, i)} r={k === 0 ? 11 : 6} />
            }),
          )}
          <text className="oi21__t" x={X(0)} y={Y(0, 0) - 18} textAnchor="middle">
            v
          </text>
          <text className="oi21__t" x={X(DEPTH) - 14} y={Y(DEPTH, 0) + 4} textAnchor="end">
            u
          </text>
          <text className="oi21__cap" x={582} y={Y(0, 0) + 54} textAnchor="end">
            {tx('un solo embedding', 'a single embedding')}
          </text>
        </svg>
      </div>
      <Controls>
        <Slider label={tx('strati di message passing L', 'message passing layers L')} min={1} max={DEPTH} step={1} value={L} onChange={setL} width={230} />
        <div className="readouts">
          <Readout
            label={tx('campo recettivo di v', 'receptive field of v')}
            tone="accent"
            value={tx(`${2 ** (L + 1) - 1} nodi`, `${2 ** (L + 1) - 1} nodes`)}
            sub={tx('raddoppia a ogni strato', 'doubles at every layer')}
          />
          <Readout
            label={tx('il nodo lontano u', 'the distant node u')}
            value={L >= DEPTH ? tx('raggiunto', 'reached') : tx('non raggiunto', 'not reached')}
            sub={tx(`dista ${DEPTH} archi da v`, `${DEPTH} edges away from v`)}
          />
        </div>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            Un esempio su un grafo ad albero: con pochi strati v non vede u (under-reaching); con molti strati lo vede, ma l’informazione di
            tutti i nodi del campo recettivo deve stare in un embedding di dimensione fissa (il collo di bottiglia).
          </>,
          <>
            An example on a tree-shaped graph: with few layers v does not see u (under-reaching); with many layers it does, but the
            information of all the nodes of the receptive field has to fit in a fixed-size embedding (the bottleneck).
          </>,
        )}
      </p>
      <Tasks
        items={[
          { label: tx('Riduci gli strati a 1: v vede solo i vicini diretti.', 'Reduce the layers to 1: v sees only its direct neighbors.'), done: seen.small },
          {
            label: tx(
              'Porta gli strati a 4 per raggiungere u: il campo recettivo è cresciuto fino a 31 nodi.',
              'Bring the layers to 4 to reach u: the receptive field has grown to 31 nodes.',
            ),
            done: seen.reach,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.11: omofilia ed eterofilia */

const HM_N: XY[] = [
  [205, 22],
  [78, 52],
  [150, 56],
  [228, 84],
  [44, 118],
  [108, 114],
  [176, 116],
  [18, 178],
  [84, 172],
  [146, 162],
  [224, 150],
  [196, 206],
  [262, 196],
  [60, 232],
  [126, 216],
  [164, 262],
  [232, 252],
]
const HM_E: [number, number][] = [
  [1, 2],
  [2, 0],
  [0, 3],
  [2, 3],
  [1, 4],
  [1, 5],
  [5, 6],
  [6, 3],
  [4, 7],
  [4, 8],
  [5, 8],
  [7, 8],
  [8, 9],
  [9, 10],
  [3, 10],
  [10, 11],
  [10, 12],
  [11, 12],
  [11, 16],
  [12, 16],
  [9, 14],
  [14, 13],
  [14, 15],
]
const HM_COL = ['var(--c-magenta)', 'var(--c-yellow)', 'var(--c-green)']
const HIGH = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 1]
const LOW = [0, 2, 2, 2, 0, 0, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 1]

export function Homophily() {
  const [cls, setCls] = useState(HIGH)
  const [edits, setEdits] = useState(0)
  const same = HM_E.filter(([a, b]) => cls[a] === cls[b]).length
  const hom = same / HM_E.length
  // quanti nodi hanno la classe più frequente tra i propri vicini
  const agree = HM_N.filter((_, v) => {
    const nb = HM_E.flatMap(([a, b]) => (a === v ? [b] : b === v ? [a] : []))
    const cnt = [0, 1, 2].map((c) => nb.filter((u) => cls[u] === c).length)
    return cnt[cls[v]] === Math.max(...cnt)
  }).length
  // energia di Dirichlet delle etichette one-hot: ogni arco tra classi diverse conta ‖e_a − e_b‖² = 2, nei due versi
  const energy = 4 * (HM_E.length - same)
  const seen = useLatch({ low: hom < 0.35 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          value={cls === HIGH ? 'high' : cls === LOW ? 'low' : 'custom'}
          onChange={(k) => k !== 'custom' && setCls(k === 'high' ? HIGH : LOW)}
          options={[
            { value: 'high', label: tx('alta omofilia', 'high homophily') },
            { value: 'low', label: tx('bassa omofilia', 'low homophily') },
          ]}
        />
        <Legend
          items={[
            { label: tx('arco tra nodi della stessa classe', 'edge between nodes of the same class'), color: 'var(--ink-2)' },
            { label: tx('arco tra classi diverse', 'edge between different classes'), color: 'var(--c-red)', kind: 'dash' },
          ]}
        />
      </div>
      <div className="wgrid">
        <svg className="hm21" viewBox="0 0 284 284" role="img" aria-label={tx('Grafo con nodi di tre classi', 'Graph with nodes of three classes')}>
          {HM_E.map(([a, b], i) => (
            <line key={i} className={'hm21__e' + (cls[a] === cls[b] ? '' : ' is-het')} x1={HM_N[a][0]} y1={HM_N[a][1]} x2={HM_N[b][0]} y2={HM_N[b][1]} />
          ))}
          {HM_N.map(([x, y], i) => (
            <circle
              key={i}
              className="hm21__n"
              cx={x}
              cy={y}
              r={11}
              style={{ fill: HM_COL[cls[i]] }}
              role="button"
              tabIndex={0}
              aria-label={tx(`nodo ${i + 1}, classe ${cls[i] + 1}: clicca per cambiarla`, `node ${i + 1}, class ${cls[i] + 1}: click to change it`)}
              onClick={() => {
                setCls(cls.map((c, j) => (j === i ? (c + 1) % 3 : c)))
                setEdits(edits + 1)
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCls(cls.map((c, j) => (j === i ? (c + 1) % 3 : c)))}
            />
          ))}
        </svg>
        <div className="wside">
          <div className="readouts">
            <Readout
              label={tx('omofilia', 'homophily')}
              tone="accent"
              value={fmt(hom, 2)}
              sub={tx(`${same} archi su ${HM_E.length} uniscono nodi della stessa classe`, `${same} of ${HM_E.length} edges join nodes of the same class`)}
            />
            <Readout
              label={tx('nodi in accordo con i vicini', 'nodes agreeing with their neighbors')}
              value={tx(`${agree} su ${HM_N.length}`, `${agree} of ${HM_N.length}`)}
              sub={tx('la loro classe è la più frequente tra i vicini', 'their class is the most frequent among the neighbors')}
            />
            <Readout
              label={tx('energia di Dirichlet delle etichette', 'Dirichlet energy of the labels')}
              value={String(energy)}
              sub={tx('alta = segnale ad alta frequenza', 'high = high-frequency signal')}
            />
          </div>
          <span className={'verdict ' + (hom >= 0.6 ? 'verdict--good' : hom < 0.35 ? 'verdict--bad' : 'verdict--warn')}>
            {hom >= 0.6
              ? tx('Grafo omofilo: i vicini sono una buona indicazione della classe.', 'Homophilic graph: the neighbors are a good indication of the class.')
              : hom < 0.35
                ? tx(
                    'Grafo eterofilo: le predizioni basate sui vicini immediati sono fuorvianti.',
                    'Heterophilic graph: predictions based on the immediate neighbors are misleading.',
                  )
                : tx('Omofilia intermedia.', 'Intermediate homophily.')}
          </span>
          <p className="wnote">{tx('Clicca un nodo per cambiarne la classe.', 'Click a node to change its class.')}</p>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Passa alla bassa omofilia: quasi tutti gli archi uniscono classi diverse, e pochi nodi sono in accordo con i vicini.',
              'Switch to low homophily: almost all the edges join different classes, and few nodes agree with their neighbors.',
            ),
            done: seen.low,
          },
          {
            label: tx(
              'Cambia la classe di qualche nodo e osserva come variano omofilia ed energia.',
              'Change the class of a few nodes and observe how homophily and energy vary.',
            ),
            done: edits >= 2,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 21.12: kernel di convoluzione */

type Part = { name: string; icon: ReactNode }
const wheel = (
  <g>
    <circle r={9} />
    <path d="M-9,0H9M0,-9V9M-6.4,-6.4L6.4,6.4M-6.4,6.4L6.4,-6.4" />
  </g>
)
const gear = (
  <g>
    <circle r={6.5} />
    <circle r={10} strokeDasharray="3.5 2.8" />
    <circle r={1.8} />
  </g>
)
const BIKE: Part[] = [
  { name: tx('ruota', 'wheel'), icon: wheel },
  { name: tx('ingranaggi', 'gears'), icon: gear },
  { name: tx('catena', 'chain'), icon: <rect x={-11} y={-5} width={22} height={10} rx={5} strokeDasharray="2.5 2" /> },
  { name: tx('manubrio', 'handlebar'), icon: <path d="M-10,-5Q-10,3 0,3Q10,3 10,-5M0,3V9" /> },
  { name: tx('sella', 'saddle'), icon: <path d="M-10,-2Q0,-7 10,-1Q2,3 -10,-2M0,1V9" /> },
]
const CAR: Part[] = [
  {
    name: tx('pneumatico', 'tire'),
    icon: (
      <g>
        <circle r={10} />
        <circle r={5} />
      </g>
    ),
  },
  { name: tx('paraurti', 'bumper'), icon: <path d="M-11,-3H11V3H-11ZM-7,3V7M7,3V7" /> },
  {
    name: tx('volante', 'steering wheel'),
    icon: (
      <g>
        <circle r={10} />
        <path d="M0,0V10M0,0L-8.6,-5M0,0L8.6,-5" />
      </g>
    ),
  },
  {
    name: tx('motore', 'engine'),
    icon: (
      <g>
        <rect x={-10} y={-6} width={20} height={13} rx={2} />
        <path d="M-6,-6V-10M0,-6V-10M6,-6V-10" />
      </g>
    ),
  },
  { name: tx('ingranaggi', 'gears'), icon: gear },
]
/** similarità illustrative tra sotto-strutture: righe = bicicletta, colonne = auto */
const KS = [
  [0.9, 0, 0.3, 0, 0.2],
  [0.1, 0, 0.1, 0.4, 1],
  [0, 0, 0, 0.3, 0.4],
  [0, 0.2, 0.6, 0, 0],
  [0, 0.1, 0, 0, 0],
]
const KTOT = KS.flat().reduce((s, v) => s + v, 0)

export function ConvKernel() {
  const [sel, setSel] = useState(0)
  const [seenP, setSeenP] = useState<Record<number, boolean>>({})
  const yOf = (i: number) => 44 + i * 46
  const row = KS[sel]
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="ck21" viewBox="0 0 640 290" style={{ minWidth: 540 }} role="img" aria-label={tx('Kernel di convoluzione: due oggetti scomposti in sotto-strutture confrontate tra loro', 'Convolution kernel: two objects decomposed into substructures that are compared with each other')}>
          {/* bicicletta */}
          <g className="ck21__obj" transform="translate(64 136)">
            <circle cx={-24} cy={12} r={15} />
            <circle cx={24} cy={12} r={15} />
            <path d="M-24,12L-6,-12H16L24,12M-6,-12L4,12H-24M16,-12L12,-22H20M-6,-12L-9,-19H-2" />
          </g>
          <text className="ck21__t" x={64} y={190} textAnchor="middle">
            {tx('oggetto x', 'object x')}
          </text>
          {/* auto */}
          <g className="ck21__obj" transform="translate(576 136)">
            <path d="M-40,10V-2Q-38,-6 -26,-7L-16,-20H12L24,-7Q40,-5 40,2V10Z" />
            <circle cx={-22} cy={12} r={8} />
            <circle cx={22} cy={12} r={8} />
          </g>
          <text className="ck21__t" x={576} y={190} textAnchor="middle">
            {tx('oggetto x′', 'object x′')}
          </text>
          <path className="ck21__arrow" d="M112,136H150m-9,-6l9,6l-9,6" />
          <path className="ck21__arrow" d="M528,136H490m9,-6l-9,6l9,6" />
          <rect className="ck21__set" x={150} y={14} width={124} height={244} rx={12} />
          <rect className="ck21__set" x={366} y={14} width={124} height={244} rx={12} />
          {row.map((k, j) =>
            k > 0 ? <line key={j} className="ck21__k" x1={274} y1={yOf(sel)} x2={366} y2={yOf(j)} style={{ strokeWidth: 0.8 + k * 6, opacity: 0.35 + k * 0.6 }} /> : null,
          )}
          {BIKE.map((p, i) => (
            <g
              key={p.name}
              className={'ck21__part' + (i === sel ? ' is-on' : '')}
              transform={`translate(180 ${yOf(i)})`}
              role="button"
              tabIndex={0}
              aria-label={p.name}
              aria-pressed={i === sel}
              onClick={() => {
                setSel(i)
                setSeenP((s) => ({ ...s, [i]: true }))
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(i)}
            >
              <rect className="ck21__bg" x={-24} y={-20} width={112} height={40} rx={8} />
              {p.icon}
              <text x={18} y={4}>
                {p.name}
              </text>
            </g>
          ))}
          {CAR.map((p, j) => (
            <g key={p.name} className={'ck21__part ck21__part--r' + (row[j] > 0 ? ' is-hit' : '')} transform={`translate(396 ${yOf(j)})`}>
              <rect className="ck21__bg" x={-24} y={-20} width={112} height={40} rx={8} />
              {p.icon}
              <text x={18} y={4}>
                {p.name}
              </text>
            </g>
          ))}
          <text className="ck21__K" x={320} y={18} textAnchor="middle">
            {svgScript('K', 'S', 'sup')}
          </text>
          <text className="ck21__t" x={212} y={278} textAnchor="middle">
            {tx('sotto-strutture S(x)', 'substructures S(x)')}
          </text>
          <text className="ck21__t" x={428} y={278} textAnchor="middle">
            {tx('sotto-strutture S(x′)', 'substructures S(x′)')}
          </text>
        </svg>
      </div>
      <Controls>
        <div className="readouts">
          <Readout
            label={tx(`«${BIKE[sel].name}» contro le parti di x′`, `“${BIKE[sel].name}” against the parts of x′`)}
            tone="accent"
            value={row.map((k) => fmt(k, 1)).join(' · ')}
            sub={tx('kernel tra sotto-strutture', 'kernel between substructures')}
          />
          <Readout
            label={
              <>
                {tx('kernel tra i due oggetti', 'kernel between the two objects')} <Tex>{"k(x, x')"}</Tex>
              </>
            }
            value={fmt(KTOT, 1)}
            sub={tx('qui: la somma dei kernel tra tutte le coppie di parti', 'here: the sum of the kernels between all pairs of parts')}
          />
        </div>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            Gli oggetti e le loro parti sono disegni schematici (nella figura originale, una bicicletta e un’auto con le loro parti); i valori
            di similarità tra le parti sono inventati per l’esempio.
          </>,
          <>
            The objects and their parts are schematic drawings (in the original figure, a bicycle and a car with their parts); the similarity
            values between the parts are made up for the example.
          </>,
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca le sotto-strutture della bicicletta: ognuna è confrontata con tutte quelle dell’auto, e il kernel tra i due oggetti combina questi confronti.',
              'Click the substructures of the bicycle: each one is compared with all those of the car, and the kernel between the two objects combines these comparisons.',
            ),
            done: Object.keys(seenP).length >= 2,
          },
        ]}
      />
    </div>
  )
}
