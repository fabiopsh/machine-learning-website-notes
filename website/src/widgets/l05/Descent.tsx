import { useMemo, useState } from 'react'
import { Arrow, Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { floorOf, Surface3D, type Overlay, type V3 } from '../common/Surface3D'

/**
 * Il problema di regressione dell'esercizio svolto: 5 punti, modello h(x) = w₁x + w₀.
 * Qui l'errore è la media dei quadrati (LMS, cioè Δw/l), così i numeri restano piccoli.
 */
export const XS = [1, 2, 3, 4, 5]
export const YS = [2.1, 3.9, 6.1, 8.4, 9.8]
const l = XS.length

export function mse(w0: number, w1: number) {
  let s = 0
  for (let p = 0; p < l; p++) s += (YS[p] - w1 * XS[p] - w0) ** 2
  return s / l
}
/** gradiente della media degli errori quadratici: (∂E/∂w₀, ∂E/∂w₁) */
export function grad(w0: number, w1: number): [number, number] {
  let g0 = 0
  let g1 = 0
  for (let p = 0; p < l; p++) {
    const d = YS[p] - w1 * XS[p] - w0
    g0 += -2 * d
    g1 += -2 * d * XS[p]
  }
  return [g0 / l, g1 / l]
}
const W1_OPT = 1.99
const W0_OPT = 0.09

/* ------------------------------------------------------------------ Fig. 5.6 */

// modello a un solo peso, h(x) = w x: E(w) è una parabola
const E1 = (w: number) => mse(0, w)
const G1 = (w: number) => grad(0, w)[1]
const W_MIN = 22.16 / 11

export function Descent1D() {
  const [w0, setW0] = useState(4)
  const [eta, setEta] = useState(0.015)
  const [steps, setSteps] = useState(0)
  const path = useMemo(() => {
    const out = [w0]
    for (let t = 0; t < steps; t++) out.push(out[t] - eta * G1(out[t]))
    return out
  }, [w0, eta, steps])
  const cur = path[path.length - 1]
  const inView = (w: number) => w > -0.9 && w < 4.9
  const overshoot = path.some((w, i) => i > 0 && (w - W_MIN) * (path[i - 1] - W_MIN) < 0)
  const diverge = !inView(cur) || Math.abs(cur - W_MIN) > Math.abs(w0 - W_MIN) + 0.5
  const seen = useLatch({ four: steps >= 4 && !overshoot, over: overshoot && !diverge, div: diverge && steps > 0 })
  const reset = () => setSteps(0)
  return (
    <div>
      <Plot xDomain={[-0.8, 4.8]} yDomain={[0, 75]} aspect={0.52} margin={{ b: 44 }}>
        <Axes xTicks={[0, 1, 2, 3, 4]} yTicks={[0, 25, 50, 75]} xLabel="w" yLabel="E(w)" />
        <FnPath f={E1} color="var(--ink)" width={2.4} />
        {path.filter(inView).map((w, i) => (
          <Tangent key={i} w={w} />
        ))}
        {path
          .slice(1)
          .map((w, i) =>
            inView(w) && inView(path[i]) ? (
              <Arrow key={i} from={{ x: path[i], y: 3 }} to={{ x: w, y: 3 }} color="var(--c-green)" width={1.6} head={7} />
            ) : null,
          )}
        {path.filter(inView).map((w, i) => (
          <g key={i}>
            <Dot x={w} y={E1(w)} r={i === path.length - 1 ? 5 : 3.5} color="var(--c-red)" />
            {i < 6 && (
              <Label x={w} y={0} dy={30} anchor="middle" className="plot-label--math">
                {`w${sub(i)}`}
              </Label>
            )}
          </g>
        ))}
        <Handle
          x={w0}
          y={0}
          axis="x"
          label={tx('peso iniziale', 'initial weight')}
          onMove={(p) => {
            setW0(p.x)
            reset()
          }}
          bounds={{ x: [-0.6, 4.6] }}
        />
      </Plot>
      <div className="controls">
        <Slider
          label={
            <>
              {tx('learning rate', 'learning rate')} <Tex>{'\\eta'}</Tex>
            </>
          }
          min={0.002}
          max={0.1}
          step={0.001}
          value={eta}
          onChange={(v) => {
            setEta(v)
            reset()
          }}
          format={(v) => fmt(v, 3)}
          width={260}
        />
        <Btn icon="step" variant="soft" onClick={() => setSteps((s) => Math.min(40, s + 1))}>
          {tx('Un passo', 'One step')}
        </Btn>
        <Btn icon="play" onClick={() => setSteps((s) => Math.min(40, s + 10))}>
          {tx('Dieci passi', 'Ten steps')}
        </Btn>
        <Btn icon="reset" onClick={reset} title={tx('Ricomincia', 'Reset')} />
      </div>
      <div className="readouts">
        <Readout label={tx('passi', 'steps')} value={String(steps)} />
        <Readout label={<Tex>{'w_t'}</Tex>} value={inView(cur) ? fmt(cur, 3) : tx('fuori scala', 'out of bounds')} />
        <Readout label={<Tex>{'E(w_t)'}</Tex>} tone="red" value={inView(cur) ? fmt(E1(cur), 3) : '—'} />
        <Readout
          label={<Tex>{'\\partial E/\\partial w'}</Tex>}
          value={inView(cur) ? fmt(G1(cur), 2) : '—'}
          sub={`${tx('minimo in', 'minimum at')} w = ${fmt(W_MIN, 3)}`}
        />
      </div>
      <Tasks
        items={[
          { label: tx('Fai almeno quattro passi con η piccolo: i passi si accorciano man mano che la pendenza cala.', 'Take at least four steps with small η: steps get shorter as the slope decreases.'), done: seen.four },
          { label: tx('Alza η finché il peso scavalca il minimo e oscilla da una parte all’altra.', 'Increase η until the weight overshoots the minimum and oscillates back and forth.'), done: seen.over },
          { label: tx('Con η troppo grande la discesa diverge: l’errore cresce a ogni passo.', 'With η too large, descent diverges: error increases at every step.'), done: seen.div },
        ]}
      />
    </div>
  )
}

const sub = (i: number) => '₀₁₂₃₄₅₆₇₈₉'[i] ?? String(i)

/** tangente alla curva nel punto w (tratteggiata, come nella figura originale) */
function Tangent({ w }: { w: number }) {
  const g = G1(w)
  const e = E1(w)
  const dx = 0.9
  return (
    <Polyline
      pts={[
        { x: w - dx, y: e - g * dx },
        { x: w + dx, y: e + g * dx },
      ]}
      color="var(--ink-3)"
      width={1.2}
      dash="4 4"
    />
  )
}

/* ------------------------------------------------------------------ Fig. 5.7 */

const R0: [number, number] = [-3, 3]
const R1: [number, number] = [0, 4]
const ZR: [number, number] = [0, 90]
const GAP = 0.35
const LEVELS = [0.5, 2, 5, 10, 20, 35, 55, 80]

export function ErrorSurface() {
  const [w, setW] = useState<[number, number]>([-2, 3.2])
  const [stepsTaken, setStepsTaken] = useState(0)
  const [g0, g1] = grad(w[0], w[1])
  const E = mse(w[0], w[1])
  const moved = useLatch({ m: w[0] !== -2 || w[1] !== 3.2 }).m
  const seen = useLatch({ moved: moved && stepsTaken === 0, step: stepsTaken > 0, min: E < 0.06 })

  const overlays = useMemo<Overlay[]>(() => {
    const zf = floorOf(ZR, GAP)
    const n = Math.hypot(g0, g1) || 1
    // freccia di lunghezza fissa nel piano dei pesi (conta la direzione), appoggiata sulla superficie
    const t0 = clamp(w[0] - (g0 / n) * 1.4, R0)
    const t1 = clamp(w[1] - (g1 / n) * 1.4, R1)
    const tip: V3 = [t0, t1, mse(t0, t1)]
    return [
      { kind: 'line', a: [w[0], w[1], zf], b: [w[0], w[1], E], color: 'var(--ink-3)', width: 1.2, dash: [4, 4] },
      { kind: 'arrow', a: [w[0], w[1], E], b: tip, color: 'var(--c-green)', width: 3 },
      { kind: 'point', p: [w[0], w[1], zf], color: 'var(--ink-2)', r: 3.5 },
      { kind: 'point', p: [W0_OPT, W1_OPT, mse(W0_OPT, W1_OPT)], color: 'var(--ink)', r: 3 },
      { kind: 'point', p: [w[0], w[1], E], color: 'var(--accent)', r: 6 },
    ]
  }, [w, g0, g1, E])

  const step = () => {
    const eta = 0.06
    const [a, b] = grad(w[0], w[1])
    setW([clamp(w[0] - eta * a, R0), clamp(w[1] - eta * b, R1)])
    setStepsTaken((s) => s + 1)
  }

  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <Tex>{'-\\nabla E(\\mathbf{w})'}</Tex>, color: 'var(--c-green)' },
            { label: tx('retta h(x) = w₁x + w₀', 'line h(x) = w₁x + w₀'), color: 'var(--c-red)' },
            { label: tx('dati dell’esercizio', 'exercise data'), color: 'var(--c-blue)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <Surface3D
          f={mse}
          x={R0}
          y={R1}
          z={ZR}
          n={36}
          levels={LEVELS}
          overlays={overlays}
          floorGap={GAP}
          zScale={0.7}
          aspect={0.9}
          initial={{ yaw: -0.9, pitch: 0.55 }}
          axisLabels={['w₀', 'w₁', 'E']}
          ariaLabel={tx("Superficie d’errore E(w0, w1): un paraboloide", "Error surface E(w0, w1): a paraboloid")}
        />
        <div className="wside">
          <Plot xDomain={[0, 6]} yDomain={[0, 13]} aspect={0.7} minH={180} maxH={260} margin={{ l: 32, r: 10, t: 10, b: 28 }}>
            <Axes xTicks={[0, 1, 2, 3, 4, 5, 6]} yTicks={[0, 4, 8, 12]} xLabel="x" yLabel="y" />
            {XS.map((x, i) => (
               <Polyline
                key={i}
                pts={[
                  { x, y: YS[i] },
                  { x, y: w[1] * x + w[0] },
                ]}
                color="var(--c-green)"
                width={1.6}
              />
            ))}
            <FnPath f={(x) => w[1] * x + w[0]} color="var(--c-red)" width={2.2} />
            {XS.map((x, i) => (
              <Dot key={i} x={x} y={YS[i]} color="var(--c-blue)" />
            ))}
          </Plot>
          <div className="readouts">
            <Readout label={<Tex>{'E(\\mathbf{w})'}</Tex>} tone="accent" value={fmt(E, 3)} sub={tx('media dei quadrati dei residui', 'mean squared residuals')} />
            <Readout label={<Tex>{'-\\nabla E'}</Tex>} tone="green" value={`(${fmt(-g0, 1)}; ${fmt(-g1, 1)})`} />
          </div>
        </div>
      </div>
      <div className="controls">
        <Slider
          label={<Tex>{'w_0'}</Tex>}
          min={R0[0]}
          max={R0[1]}
          step={0.01}
          value={w[0]}
          onChange={(v) => setW([v, w[1]])}
          format={(v) => fmt(v)}
          width={200}
        />
        <Slider
          label={<Tex>{'w_1'}</Tex>}
          min={R1[0]}
          max={R1[1]}
          step={0.01}
          value={w[1]}
          onChange={(v) => setW([w[0], v])}
          format={(v) => fmt(v)}
          width={200}
        />
        <Btn icon="step" variant="soft" onClick={step}>
          {tx('Passo lungo −∇E', 'Step along −∇E')}
        </Btn>
        <Btn onClick={() => setW([W0_OPT, W1_OPT])}>{tx('Minimo: 1,99x + 0,09', `Minimum: ${fmt(1.99)}x + ${fmt(0.09)}`)}</Btn>
      </div>
      <Tasks
        items={[
          { label: tx('Muovi w₀ e w₁: ogni punto del piano è una retta diversa, con il suo errore.', 'Move w₀ and w₁: every point in the plane is a different line, with its own error.'), done: seen.moved },
          { label: tx('Premi «Passo lungo −∇E»: la freccia verde è la bussola che porta verso il fondo.', 'Press “Step along −∇E”: the green arrow points downhill toward the bottom.'), done: seen.step },
          { label: tx('Raggiungi il fondo del paraboloide: è la retta dell’esercizio svolto.', 'Reach the bottom of the paraboloid: that is the fitted line from the worked exercise.'), done: seen.min },
        ]}
      />
    </div>
  )
}

const clamp = (v: number, r: [number, number]) => Math.min(r[1], Math.max(r[0], v))

/* ------------------------------------------------------------------ Fig. 5.8 */

type Run = { batch: [number, number][]; online: [number, number][][] }

function runPaths(start: [number, number], eta: number, epochs: number, seed: number): Run {
  const batch: [number, number][] = [start]
  let w = start
  for (let e = 0; e < epochs; e++) {
    const [a, b] = grad(w[0], w[1])
    w = [w[0] - eta * a, w[1] - eta * b]
    batch.push(w)
  }
  const online = [0, 1].map((k) => {
    const r = rng(seed * 7 + k * 101 + 3)
    const pts: [number, number][] = [start]
    let v = start
    for (let e = 0; e < epochs; e++) {
      // ordine dei pattern rimescolato a ogni epoca
      const order = [0, 1, 2, 3, 4].sort(() => r() - 0.5)
      for (const p of order) {
        const d = YS[p] - v[1] * XS[p] - v[0]
        v = [v[0] + eta * 2 * d, v[1] + eta * 2 * d * XS[p]]
        pts.push(v)
      }
    }
    return pts
  })
  return { batch, online }
}

export function BatchOnline() {
  const [start, setStart] = useState<[number, number]>([-2.4, 3.6])
  const [eta, setEta] = useState(0.012)
  const [epochs, setEpochs] = useState(40)
  const [seed, setSeed] = useState(1)
  const run = useMemo(() => runPaths(start, eta, epochs, seed), [start, eta, epochs, seed])
  const inBox = (p: [number, number]) => p[0] > R0[0] - 1 && p[0] < R0[1] + 1 && p[1] > R1[0] - 1 && p[1] < R1[1] + 1
  const last = (a: [number, number][]) => a[a.length - 1]
  const eB = mse(...last(run.batch))
  const eO = mse(...last(run.online[0]))
  const [shuffled, setShuffled] = useState(false)
  const seen = useLatch({ many: epochs >= 120, shuffle: shuffled, big: eta >= 0.034 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'batch', color: 'var(--c-blue)' },
            { label: tx('on-line (un ordine dei pattern)', 'online (one pattern order)'), color: 'var(--c-violet)' },
            { label: tx('on-line (un altro ordine)', 'online (another order)'), color: 'var(--c-orange)' },
          ]}
        />
      </div>
      <Plot xDomain={R0} yDomain={R1} aspect={0.6} margin={{ l: 34, b: 34 }}>
        <Axes xTicks={[-3, -2, -1, 0, 1, 2, 3]} yTicks={[0, 1, 2, 3, 4]} xLabel="w₀" yLabel="w₁" />
        <LevelCurves />
        {run.online.map((pts, k) => (
          <Polyline
            key={k}
            pts={pts.filter(inBox).map(([a, b]) => ({ x: a, y: b }))}
            color={k ? 'var(--c-orange)' : 'var(--c-violet)'}
            width={1.3}
            opacity={0.75}
          />
        ))}
        <Polyline pts={run.batch.filter(inBox).map(([a, b]) => ({ x: a, y: b }))} color="var(--c-blue)" width={2.4} />
        <Dot x={W0_OPT} y={W1_OPT} r={4} color="var(--ink)" />
        <Handle x={start[0]} y={start[1]} label={tx('pesi iniziali', 'initial weights')} onMove={(p) => setStart([p.x, p.y])} />
      </Plot>
      <div className="controls">
        <Slider
          label={<Tex>{'\\eta'}</Tex>}
          min={0.004}
          max={0.038}
          step={0.001}
          value={eta}
          onChange={setEta}
          format={(v) => fmt(v, 3)}
          width={200}
        />
        <Slider label={tx('epoche', 'epochs')} min={1} max={200} step={1} value={epochs} onChange={setEpochs} width={200} />
        <Btn
          icon="reset"
          onClick={() => {
            setSeed((s) => s + 1)
            setShuffled(true)
          }}
        >
          {tx('Nuovo ordine dei pattern', 'Shuffle pattern order')}
        </Btn>
      </div>
      <div className="readouts">
        <Readout label={tx('aggiornamenti batch', 'batch updates')} tone="blue" value={String(epochs)} sub={`${tx('E finale', 'final E')} ${fmt(eB, 3)}`} />
        <Readout
          label={tx('aggiornamenti on-line', 'online updates')}
          tone="violet"
          value={String(epochs * l)}
          sub={Number.isFinite(eO) ? `${tx('E finale', 'final E')} ${fmt(eO, 3)}` : tx('diverge', 'diverges')}
        />
      </div>
      <Tasks
        items={[
          { label: tx('Aumenta le epoche: il batch scende regolare lungo la valle, l’on-line a zig-zag ma più in fretta.', 'Increase epochs: batch descends smoothly along the valley, online zigzags but faster.'), done: seen.many },
          { label: tx('Cambia l’ordine dei pattern: il percorso on-line cambia, quello batch no.', 'Change pattern order: the online path changes, while the batch path does not.'), done: seen.shuffle },
          { label: tx('Alza η: l’on-line diventa instabile prima del batch (serve un η più piccolo).', 'Increase η: online becomes unstable sooner than batch (it requires a smaller η).'), done: seen.big },
        ]}
      />
    </div>
  )
}

function LevelCurves() {
  const { x, y } = usePlot()
  const paths = useMemo(() => LEVELS.map((L) => segsToPath(contourSegments(mse, R0, R1, L, 80), x, y)), [x, y])
  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--ink-3)" strokeWidth={1.1} opacity={0.6} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.9 */

function curve(eta: number, epochs = 60): number[] {
  let v: [number, number] = [0, 1.5]
  const out = [mse(v[0], v[1])]
  const r = rng(5)
  for (let e = 0; e < epochs; e++) {
    const order = [0, 1, 2, 3, 4].sort(() => r() - 0.5)
    for (const p of order) {
      const d = YS[p] - v[1] * XS[p] - v[0]
      v = [v[0] + eta * 2 * d, v[1] + eta * 2 * d * XS[p]]
    }
    out.push(mse(v[0], v[1]))
  }
  return out
}

const REF = [
  { eta: 0.0006, color: 'var(--c-green)', name: 'verde', enName: 'green' },
  { eta: 0.036, color: 'var(--c-blue)', name: 'blu', enName: 'blue' },
  { eta: 0.004, color: 'var(--c-red)', name: 'rossa', enName: 'red' },
]

export function LearningCurves() {
  const refs = useMemo(() => REF.map((r) => curve(r.eta)), [])
  const [eta, setEta] = useState(0.0015)
  const mine = useMemo(() => curve(eta), [eta])
  const moved = useLatch({ m: eta !== 0.0015 }).m
  const seen = useLatch({ slow: moved && eta <= 0.0008, good: moved && eta >= 0.003 && eta <= 0.008, bad: eta >= 0.033 })
  const pts = (c: number[]) => c.map((v, i) => ({ x: i, y: Math.min(v, 3.6) }))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...REF.map((r) => ({ label: tx(`curva ${r.name}`, `${r.enName} curve`), color: r.color })),
            { label: tx('il tuo η', 'your η'), color: 'var(--c-violet)', kind: 'dash' as const },
          ]}
        />
      </div>
      <Plot xDomain={[0, 60]} yDomain={[0, 3.5]} aspect={0.48} margin={{ b: 40 }}>
        <Axes xTicks={[0, 10, 20, 30, 40, 50, 60]} yTicks={[0, 1, 2, 3]} xLabel={tx('epoche', 'epochs')} yLabel={tx('errore', 'error')} />
        {refs.map((c, i) => (
          <Polyline key={i} pts={pts(c)} color={REF[i].color} width={2.2} />
        ))}
        <Polyline pts={pts(mine)} color="var(--c-violet)" width={2} dash="6 4" />
      </Plot>
      <div className="controls">
        <Slider
          label={
            <>
              {tx('il tuo learning rate', 'your learning rate')} <Tex>{'\\eta'}</Tex>
            </>
          }
          min={0.0002}
          max={0.038}
          step={0.0002}
          value={eta}
          onChange={setEta}
          format={(v) => fmt(v, 4)}
          width={280}
        />
      </div>
      <p className="wnote">
        {tx(
          `Stesso problema (la retta dell’esercizio), stessa partenza, discesa on-line: cambia solo η. Le tre curve hanno η = ${fmt(REF[0].eta, 4)} (verde), ${fmt(REF[2].eta, 3)} (rossa) e ${fmt(REF[1].eta, 3)} (blu).`,
          `Same problem (the exercise line), same starting point, online descent: only η varies. The three curves have η = ${fmt(REF[0].eta, 4)} (green), ${fmt(REF[2].eta, 3)} (red), and ${fmt(REF[1].eta, 3)} (blue).`,
        )}
      </p>
      <Tasks
        items={[
          { label: tx('Scegli un η minuscolo: la tua curva scende piano come quella verde.', 'Choose a tiny η: your curve descends slowly like the green one.'), done: seen.slow },
          { label: tx('Trova un η che scende in fretta e si stabilizza, come la rossa.', 'Find an η that descends quickly and stabilizes, like the red one.'), done: seen.good },
          { label: tx('Alza η fin quasi al massimo: compaiono picchi e oscillazioni, come nella blu.', 'Raise η close to maximum: spikes and oscillations appear, like the blue curve.'), done: seen.bad },
        ]}
      />
    </div>
  )
}
