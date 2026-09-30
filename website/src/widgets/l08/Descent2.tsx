import { useMemo, useState, type ReactNode } from 'react'
import { Arrow, Axes, Dot, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { svgScript } from '../../components/plot/svgText'

/**
 * Un problema di regressione lineare con l = 40 esempi e due parametri (θ₀, θ₁):
 * la superficie dell'errore medio è un paraboloide allungato e inclinato, come nelle figure delle slide.
 */
const L = 40
const DATA = (() => {
  const r = rng(808)
  const xs = Array.from({ length: L }, () => r() * 4)
  const ys = xs.map((x) => 1.5 + 0.8 * x + 0.6 * gauss(r))
  return { xs, ys }
})()
const E = (t0: number, t1: number) => {
  let s = 0
  for (let p = 0; p < L; p++) s += (DATA.ys[p] - t0 - t1 * DATA.xs[p]) ** 2
  return s / L
}
/** gradiente dell'errore medio su un sottoinsieme di indici */
function grad(t: [number, number], idx: number[]): [number, number] {
  let g0 = 0
  let g1 = 0
  for (const p of idx) {
    const d = DATA.ys[p] - t[0] - t[1] * DATA.xs[p]
    g0 -= 2 * d
    g1 -= 2 * d * DATA.xs[p]
  }
  return [g0 / idx.length, g1 / idx.length]
}
const OPT = (() => {
  const mx = DATA.xs.reduce((a, b) => a + b) / L
  const my = DATA.ys.reduce((a, b) => a + b) / L
  let sxy = 0
  let sxx = 0
  for (let p = 0; p < L; p++) {
    sxy += (DATA.xs[p] - mx) * (DATA.ys[p] - my)
    sxx += (DATA.xs[p] - mx) ** 2
  }
  const t1 = sxy / sxx
  return { t0: my - t1 * mx, t1, E: E(my - t1 * mx, t1) }
})()
const T0: [number, number] = [-1.5, 3.5]
const T1: [number, number] = [-0.6, 2.2]
const LEVELS = [0.45, 0.6, 0.9, 1.4, 2.2, 3.5, 5.5, 8.5, 13]
const START: [number, number] = [-1, -0.4]
const ALL = Array.from({ length: L }, (_, i) => i)

function shuffle(r: () => number) {
  const a = ALL.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** percorso con mini-batch di dimensione mb (mb = L: batch; mb = 1: on-line) */
function path(start: [number, number], eta: number, mb: number, epochs: number, seed: number, shuffleOn = true) {
  const r = rng(seed)
  let t = start
  const pts: [number, number][] = [t]
  for (let e = 0; e < epochs; e++) {
    const order = shuffleOn ? shuffle(r) : ALL
    for (let s = 0; s < L; s += mb) {
      const g = grad(t, order.slice(s, s + mb))
      t = [t[0] - eta * g[0], t[1] - eta * g[1]]
      pts.push(t)
      if (Math.abs(t[0]) > 1e4) return pts
    }
  }
  return pts
}

function Levels() {
  const { x, y } = usePlot()
  const paths = useMemo(() => LEVELS.map((lv) => segsToPath(contourSegments(E, T0, T1, lv, 90), x, y)), [x, y])
  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--c-violet)" strokeWidth={1} opacity={0.45} />
      ))}
    </g>
  )
}

const inBox = (p: [number, number]) => p[0] > T0[0] - 2 && p[0] < T0[1] + 2 && p[1] > T1[0] - 2 && p[1] < T1[1] + 2
const toPts = (a: [number, number][]) => a.filter(inBox).map(([x, y]) => ({ x, y }))

function ContourPlot({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <Plot xDomain={T0} yDomain={T1} aspect={0.62} minH={small ? 180 : 220} maxH={small ? 280 : 360} margin={{ l: 34, r: 10, t: 10, b: 30 }}>
      <Axes xTicks={[-1, 0, 1, 2, 3]} yTicks={[0, 1, 2]} xLabel="θ₀" yLabel="θ₁" />
      <Levels />
      <Dot x={OPT.t0} y={OPT.t1} r={3.5} color="var(--ink)" />
      {children}
    </Plot>
  )
}

/* ------------------------------------------------------------------ Fig. 8.2 */

export function SgdBatch() {
  const [eta, setEta] = useState(0.05)
  const [epochs, setEpochs] = useState(8)
  const [seed, setSeed] = useState(1)
  const [shuf, setShuf] = useState(true)
  const b = useMemo(() => path(START, eta, L, epochs * 5, seed), [eta, epochs, seed])
  const s = useMemo(() => path(START, eta, 1, epochs, seed, shuf), [eta, epochs, seed, shuf])
  const moved = useLatch({ m: eta !== 0.05 }).m
  const seen = useLatch({ hi: moved && eta >= 0.09, seed: seed > 1, noshuf: !shuf })
  const eB = E(...b[b.length - 1])
  const eS = E(...s[s.length - 1])
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'percorso', color: 'var(--c-red)' },
            { label: 'curve di livello dell’errore', color: 'var(--c-violet)' },
            { label: 'minimo', color: 'var(--ink)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div className="htf__panel">
          <div className="htf__title">Discesa batch ({epochs * 5} epoche)</div>
          <ContourPlot small>
            <Polyline pts={toPts(b)} color="var(--c-red)" width={2} />
            {toPts(b).map((p, i) => (i % 5 === 0 ? <Dot key={i} x={p.x} y={p.y} r={2.4} color="var(--c-red)" /> : null))}
          </ContourPlot>
          <Readout label="errore finale" value={Number.isFinite(eB) ? fmt(eB, 3) : 'diverge'} sub={`${b.length - 1} aggiornamenti`} />
        </div>
        <div className="htf__panel">
          <div className="htf__title">Discesa stocastica ({epochs} epoche)</div>
          <ContourPlot small>
            <Polyline pts={toPts(s)} color="var(--c-red)" width={1.2} />
          </ContourPlot>
          <Readout label="errore finale" value={Number.isFinite(eS) ? fmt(eS, 3) : 'diverge'} sub={`${s.length - 1} aggiornamenti`} />
        </div>
      </div>
      <div className="controls">
        <Slider
          label={<Tex>{'\\eta'}</Tex>}
          min={0.005}
          max={0.12}
          step={0.005}
          value={eta}
          onChange={setEta}
          format={(v) => fmt(v, 3)}
          width={200}
        />
        <Slider label="epoche della stocastica" min={1} max={30} step={1} value={epochs} onChange={setEpochs} width={200} />
        <Btn icon="reset" onClick={() => setSeed((v) => v + 1)}>
          Altro ordine casuale
        </Btn>
        <Toggle label="mescola a ogni epoca (shuffling)" checked={shuf} onChange={setShuf} />
      </div>
      <p className="wnote">
        Stessa partenza e stesso η; la discesa batch fa un aggiornamento per epoca, quella stocastica uno per esempio (40 per epoca).
      </p>
      <Tasks
        items={[
          { label: 'Alza η: la discesa stocastica diventa un zig-zag ampio attorno al minimo.', done: seen.hi },
          { label: 'Cambia l’ordine casuale: il percorso stocastico cambia, quello batch no.', done: seen.seed },
          { label: 'Spegni lo shuffling: l’ordine fisso dei pattern si ripete a ogni epoca.', done: seen.noshuf },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 8.3 */

const MBS = [1, 2, 4, 5, 8, 10, 20, 40]

export function MiniBatch() {
  const [mb, setMb] = useState(10)
  const [k, setK] = useState(0) // aggiornamenti eseguiti
  const perEpoch = L / mb
  const pts = useMemo(() => path(START, 0.05, mb, 3, 5, false), [mb])
  const shown = pts.slice(0, k + 1)
  const cur = k % perEpoch
  const seen = useLatch({ one: mb === 1, all: mb === L, epoch: k >= perEpoch && mb > 1 && mb < L })
  return (
    <div>
      <div className="mb8__bar" role="img" aria-label={`Un’epoca di ${L} esempi divisa in ${perEpoch} mini-batch`}>
        {Array.from({ length: perEpoch }, (_, b) => (
          <div key={b} className={`mb8__chunk${b === cur && k > 0 ? ' is-on' : ''}${b < cur ? ' is-done' : ''}`} style={{ flex: mb }}>
            {perEpoch <= 10 ? `mb${b + 1}` : ''}
          </div>
        ))}
      </div>
      <div className="mb8__brace">Epoca di l = {L} esempi</div>
      <div className="wgrid">
        <ContourPlot>
          <Polyline pts={toPts(shown)} color="var(--c-red)" width={1.8} />
          {shown.length > 0 && <Dot x={shown[shown.length - 1][0]} y={shown[shown.length - 1][1]} r={4.5} color="var(--accent)" />}
        </ContourPlot>
        <div className="wside">
          <Segmented
            label="dimensione del mini-batch mb"
            value={mb}
            onChange={(v) => {
              setMb(v)
              setK(0)
            }}
            options={MBS.map((v) => ({ value: v, label: String(v) }))}
          />
          <div className="readouts">
            <Readout
              label="aggiornamenti per epoca"
              tone="accent"
              value={String(perEpoch)}
              sub={mb === 1 ? 'on-line' : mb === L ? 'batch' : 'mini-batch'}
            />
            <Readout label="aggiornamenti fatti" value={String(k)} sub={`epoca ${Math.floor(k / perEpoch) + 1}`} />
          </div>
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={() => setK((v) => Math.min(pts.length - 1, v + 1))}>
              Un aggiornamento
            </Btn>
            <Btn onClick={() => setK((v) => Math.min(pts.length - 1, v + perEpoch))}>Un’epoca</Btn>
            <Btn icon="reset" onClick={() => setK(0)} title="Ricomincia" />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Con mb = 1 ogni esempio è un mini-batch: è la versione on-line.', done: seen.one },
          { label: 'Con mb = l c’è un solo aggiornamento per epoca: è la versione batch.', done: seen.all },
          { label: 'Con un mini-batch intermedio completa un’epoca intera.', done: seen.epoch },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 8.4 */

const REF = [
  { eta: 0.3, name: 'molto alto', color: 'var(--c-yellow)' },
  { eta: 0.0004, name: 'molto basso', color: 'var(--ink-3)' },
  { eta: 0.004, name: 'basso', color: 'var(--c-blue)' },
  { eta: 0.1, name: 'alto', color: 'var(--c-green)' },
  { eta: 0.02, name: 'buono', color: 'var(--c-red)' },
]
const EP = 120
function curve(eta: number, mb: number, seed = 1) {
  const pts = path(START, eta, mb, EP, seed)
  const per = L / mb
  const out: { x: number; y: number }[] = []
  for (let e = 0; e <= EP; e++) {
    const t = pts[Math.min(pts.length - 1, e * per)]
    const v = E(t[0], t[1]) - OPT.E
    out.push({ x: e, y: Number.isFinite(v) ? Math.log10(Math.max(1e-4, Math.min(1e3, v))) : 3 })
    if (!Number.isFinite(v) || v > 1e3) break
  }
  return out
}

export function EtaCurves() {
  const refs = useMemo(() => REF.map((r) => curve(r.eta, 10)), [])
  const [eta, setEta] = useState(0.001)
  const [view, setView] = useState<'epochs' | 'noisy'>('epochs')
  const mine = useMemo(() => curve(eta, 10), [eta])
  const noisy = useMemo(() => {
    const pts = path(START, 0.12, 2, 5, 3)
    return pts.map((t, i) => ({ x: i, y: E(t[0], t[1]) }))
  }, [])
  const moved = useLatch({ m: eta !== 0.001 }).m
  const seen = useLatch({ good: moved && eta >= 0.015 && eta <= 0.03, noisy: view === 'noisy' })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={
            view === 'epochs'
              ? [
                  ...REF.map((r) => ({ label: r.name, color: r.color })),
                  { label: 'il tuo η', color: 'var(--c-violet)', kind: 'dash' as const },
                ]
              : [{ label: 'errore dopo ogni aggiornamento', color: 'var(--c-green)' }]
          }
        />
        <Segmented
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'epochs', label: 'curve per epoca' },
            { value: 'noisy', label: 'una curva irregolare' },
          ]}
        />
      </div>
      {view === 'epochs' ? (
        <Plot xDomain={[0, EP]} yDomain={[-3.2, 2.2]} aspect={0.5} margin={{ l: 52, b: 40 }}>
          <Axes
            xTicks={[0, 20, 40, 60, 80, 100, 120]}
            yTicks={[-3, -2, -1, 0, 1, 2]}
            yFormat={(v) => fmt(10 ** v, Math.max(0, -v))}
            xLabel="epoche"
            yLabel={<>E − {svgScript('E', 'min')}</>}
          />
          {refs.map((c, i) => (
            <Polyline key={i} pts={c} color={REF[i].color} width={2.2} />
          ))}
          <Polyline pts={mine} color="var(--c-violet)" width={2} dash="6 4" />
        </Plot>
      ) : (
        <Plot xDomain={[0, noisy.length]} yDomain={[0, 3]} aspect={0.5} margin={{ l: 40, b: 40 }}>
          <Axes xTicks={5} yTicks={[0, 1, 2, 3]} xLabel="aggiornamenti (mini-batch di 2, η alto)" yLabel="errore" />
          <Polyline pts={noisy.map((p) => ({ x: p.x, y: Math.min(3, p.y) }))} color="var(--c-green)" width={1.2} />
        </Plot>
      )}
      <div className="controls">
        <Slider
          label={
            <>
              il tuo learning rate <Tex>{'\\eta'}</Tex>
            </>
          }
          min={0.0002}
          max={0.3}
          step={0.0002}
          value={eta}
          onChange={setEta}
          format={(v) => fmt(v, 4)}
          width={280}
        />
      </div>
      <p className="wnote">
        Mini-batch di 10 esempi sul problema delle figure 8.2 e 8.3; sull’asse verticale l’errore di training oltre il minimo, in scala
        logaritmica. Valori di η: {REF.map((r) => `${r.name} ${fmt(r.eta, 4)}`).join(', ')}.
      </p>
      <Tasks
        items={[
          { label: 'Trova un η che scende in fretta e arriva più in basso degli altri (la curva buona).', done: seen.good },
          { label: 'Guarda la curva irregolare: batch piccoli ed η alto, da evitare.', done: seen.noisy },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 8.5 */

// quadratica mal condizionata e ruotata: un «canyon»
const TH = -Math.PI / 5
const LA = [0.004, 0.25]
const Q = (w: [number, number]) => {
  const u = Math.cos(TH) * w[0] + Math.sin(TH) * w[1]
  const v = -Math.sin(TH) * w[0] + Math.cos(TH) * w[1]
  return 0.5 * (LA[0] * u * u + LA[1] * v * v)
}
const gQ = (w: [number, number]): [number, number] => {
  const u = Math.cos(TH) * w[0] + Math.sin(TH) * w[1]
  const v = -Math.sin(TH) * w[0] + Math.cos(TH) * w[1]
  const gu = LA[0] * u
  const gv = LA[1] * v
  return [Math.cos(TH) * gu - Math.sin(TH) * gv, Math.sin(TH) * gu + Math.cos(TH) * gv]
}
const CX: [number, number] = [-32, 24]
const QLEVELS = [0.2, 1, 3, 6, 10, 16, 24, 34]

function heavyBall(start: [number, number], eta: number, alpha: number, steps: number, nesterov: boolean) {
  let w = start
  let d: [number, number] = [0, 0]
  const pts: [number, number][] = [w]
  for (let s = 0; s < steps; s++) {
    const at: [number, number] = nesterov ? [w[0] + alpha * d[0], w[1] + alpha * d[1]] : w
    const g = gQ(at)
    d = [-eta * g[0] + alpha * d[0], -eta * g[1] + alpha * d[1]]
    w = [w[0] + d[0], w[1] + d[1]]
    pts.push(w)
  }
  return pts
}
const stepsTo = (pts: [number, number][], eps = 0.05) => {
  const i = pts.findIndex((p) => Q(p) < eps)
  return i < 0 ? null : i
}

export function MomentumCanyon() {
  const [start, setStart] = useState<[number, number]>([-26, 22])
  const [eta, setEta] = useState(7)
  const [alpha, setAlpha] = useState(0.8)
  const [nest, setNest] = useState(false)
  const [steps, setSteps] = useState(40)
  const plainP = useMemo(() => heavyBall(start, eta, 0, steps, false), [start, eta, steps])
  const momP = useMemo(() => heavyBall(start, eta, alpha, steps, nest), [start, eta, alpha, steps, nest])
  const sp = stepsTo(heavyBall(start, eta, 0, 2000, false))
  const sm = stepsTo(heavyBall(start, eta, alpha, 2000, nest))
  const moved = useLatch({ m: alpha !== 0.8 }).m
  const seen = useLatch({ zero: moved && alpha === 0, nest, fast: sm !== null && sp !== null && sm * 3 < sp })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: `con momentum (α = ${fmt(alpha, 2)})`, color: 'var(--c-red)' },
            { label: 'gradiente puro', color: 'var(--ink)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={CX} yDomain={CX} equal aspect={0.95} maxH={400}>
          <Axes xTicks={[-30, -20, -10, 0, 10, 20]} yTicks={[-30, -20, -10, 0, 10, 20]} />
          <QLevels />
          <Polyline pts={plainP.map(([x, y]) => ({ x, y }))} color="var(--ink)" width={1.4} />
          {plainP
            .slice(0, 12)
            .map((p, i) =>
              i + 1 < plainP.length ? (
                <Arrow
                  key={i}
                  from={{ x: p[0], y: p[1] }}
                  to={{ x: plainP[i + 1][0], y: plainP[i + 1][1] }}
                  color="var(--ink)"
                  width={1.4}
                  head={7}
                />
              ) : null,
            )}
          <Polyline pts={momP.map(([x, y]) => ({ x, y }))} color="var(--c-red)" width={2.4} />
          {momP.map((p, i) => (
            <Dot key={i} x={p[0]} y={p[1]} r={2.8} color="var(--c-red)" />
          ))}
          <Handle x={start[0]} y={start[1]} label="pesi iniziali" onMove={(p) => setStart([p.x, p.y])} />
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wmath">
              <Tex>{'\\Delta\\mathbf{w}_{new} = -\\eta\\,\\nabla E + \\alpha\\,\\Delta\\mathbf{w}_{old}'}</Tex>
            </div>
          </div>
          <Slider label={<Tex>{'\\eta'}</Tex>} min={1} max={8} step={0.1} value={eta} onChange={setEta} format={(v) => fmt(v, 1)} />
          <Slider
            label={<Tex>{'\\alpha'}</Tex>}
            min={0}
            max={0.95}
            step={0.05}
            value={alpha}
            onChange={setAlpha}
            format={(v) => fmt(v, 2)}
          />
          <Slider label="passi mostrati" min={5} max={120} step={1} value={steps} onChange={setSteps} />
          <Toggle label="Nesterov momentum" checked={nest} onChange={setNest} />
          <div className="readouts">
            <Readout label="passi per arrivare al fondo" tone="red" value={sm === null ? '> 2000' : String(sm)} sub="con momentum" />
            <Readout label="senza momentum" value={sp === null ? '> 2000' : String(sp)} />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Con i valori iniziali il momentum arriva al fondo in molti meno passi del gradiente puro.', done: seen.fast },
          { label: 'Porta α a 0: il percorso rosso coincide con quello nero, a zig-zag tra le pareti.', done: seen.zero },
          { label: 'Attiva il Nesterov momentum e confronta i passi necessari.', done: seen.nest },
        ]}
      />
    </div>
  )
}

function QLevels() {
  const { x, y } = usePlot()
  const paths = useMemo(
    () =>
      QLEVELS.map((lv) =>
        segsToPath(
          contourSegments((a, b) => Q([a, b]), CX, CX, lv, 90),
          x,
          y,
        ),
      ),
    [x, y],
  )
  return (
    <g>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--c-violet)" strokeWidth={1.1} opacity={0.5} />
      ))}
    </g>
  )
}
