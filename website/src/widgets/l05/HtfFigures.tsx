import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { marchCell } from '../common/Surface3D'
import {
  bayesP1,
  GX,
  GY,
  gridAvg,
  gridX,
  gridY,
  K_STEPS,
  L,
  mixCenters,
  model,
  setK,
  setScenario,
  useHtf,
  X,
  Y,
  type Pt,
  type Scenario,
} from './htf'

const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'

const classLegend = [
  { label: 'classe 1', color: C1, kind: 'dot' as const },
  { label: 'classe 0', color: C0, kind: 'dot' as const },
]

function ScenarioSwitch({ value }: { value: Scenario }) {
  return (
    <Segmented
      size="sm"
      value={value}
      onChange={setScenario}
      options={[
        { value: 'mix', label: 'Scenario 2: miscele di 10 gaussiane' },
        { value: 'gauss', label: 'Scenario 1: una gaussiana per classe' },
      ]}
    />
  )
}

/** i punti di training, cerchi vuoti come nella figura originale */
function Points({ pts, r = 3.4 }: { pts: Pt[]; r?: number }) {
  const { x, y } = usePlot()
  return (
    <g className="htf__pts">
      {pts.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={r} fill="none" stroke={p.c ? C1 : C0} strokeWidth={1.5} />
      ))}
    </g>
  )
}

/** sfondo a puntini colorati secondo la classe predetta in ogni nodo della griglia (come nelle figure di HTF) */
function RegionDots({ cls }: { cls: (i: number, j: number) => 0 | 1 }) {
  const { x, y, clipId } = usePlot()
  const r = 1.1
  let d1 = ''
  let d0 = ''
  for (let j = 0; j < GY; j++)
    for (let i = 0; i < GX; i++) {
      const px = x(gridX(i)).toFixed(1)
      const py = y(gridY(j)).toFixed(1)
      const dot = `M${px},${py}m-${r},0a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 -${2 * r},0`
      if (cls(i, j)) d1 += dot
      else d0 += dot
    }
  return (
    <g clipPath={`url(#${clipId})`} className="htf__dots">
      <path d={d1} fill={C1} />
      <path d={d0} fill={C0} />
    </g>
  )
}

/** confine di decisione da valori sulla griglia (marching squares al livello 0) */
function GridBoundary({ val, color = 'var(--ink)', dash }: { val: (i: number, j: number) => number; color?: string; dash?: string }) {
  const { x, y, clipId } = usePlot()
  const segs: [[number, number], [number, number]][] = []
  for (let j = 0; j < GY - 1; j++)
    for (let i = 0; i < GX - 1; i++)
      segs.push(...marchCell(gridX(i), gridX(i + 1), gridY(j), gridY(j + 1), val(i, j), val(i + 1, j), val(i + 1, j + 1), val(i, j + 1), 0))
  return (
    <path
      d={segsToPath(segs, x, y)}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeDasharray={dash}
      strokeLinejoin="round"
      clipPath={`url(#${clipId})`}
    />
  )
}

function BayesBoundary({ sc }: { sc: Scenario }) {
  const { x, y, clipId } = usePlot()
  const d = useMemo(
    () =>
      segsToPath(
        contourSegments((a, b) => bayesP1(sc, a, b), X, Y, 0.5, 90),
        x,
        y,
      ),
    [sc, x, y],
  )
  return <path d={d} fill="none" stroke="var(--c-violet)" strokeWidth={2} strokeDasharray="6 4" clipPath={`url(#${clipId})`} />
}

function MapPlot({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <Plot
      xDomain={X}
      yDomain={Y}
      equal
      aspect={0.8}
      minH={small ? 200 : 240}
      maxH={small ? 360 : 440}
      margin={{ l: 30, r: 10, t: 10, b: 26 }}
    >
      <Axes xTicks={[-2, 0, 2]} yTicks={[-2, 0, 2]} grid={false} />
      {children}
    </Plot>
  )
}

const pct = (v: number) => `${fmt(v * 100, 1)}%`

/* ------------------------------------------------------------------ Fig. 5.1 */

export function HtfData() {
  const { scenario } = useHtf()
  const m = model(scenario)
  const [centers, setCenters] = useState(false)
  const seen = useLatch({ gauss: scenario === 'gauss', mix: scenario === 'mix' && centers })
  return (
    <div>
      <div className="wbar">
        <Legend items={classLegend} />
        <ScenarioSwitch value={scenario} />
      </div>
      <MapPlot>
        <Points pts={m.train} />
        {centers && scenario === 'mix' && <Centers />}
      </MapPlot>
      <div className="controls">
        <Toggle label="mostra i centri delle gaussiane (scenario 2)" checked={centers} onChange={setCenters} />
      </div>
      <Tasks
        items={[
          { label: 'Nello scenario 2 accendi i centri: ogni classe è fatta di 10 piccoli gruppi.', done: seen.mix },
          { label: 'Passa allo scenario 1: due nuvole gaussiane che si sovrappongono.', done: seen.gauss },
        ]}
      />
    </div>
  )
}

function Centers() {
  const { x, y } = usePlot()
  return (
    <g className="htf__centers">
      {([1, 0] as const).flatMap((c) =>
        mixCenters[c].map((p, i) => (
          <path
            key={`${c}-${i}`}
            transform={`translate(${x(p.x)} ${y(p.y)})`}
            d="M-5,-5L5,5M-5,5L5,-5"
            stroke={c ? C1 : C0}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        )),
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 5.11 */

export function HtfLinear() {
  const { scenario } = useHtf()
  const m = model(scenario)
  const [bayes, setBayes] = useState(false)
  const { w0, w1, w2 } = m.lin
  const seen = useLatch({ gauss: scenario === 'gauss', bayes })
  const cls = (i: number, j: number) => (w0 + w1 * gridX(i) + w2 * gridY(j) > 0.5 ? 1 : 0) as 0 | 1
  // la retta wᵀx = 0,5 tra i bordi del riquadro
  const line = [X[0] - 1, X[1] + 1].map((a) => ({ x: a, y: (0.5 - w0 - w1 * a) / w2 }))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...classLegend,
            { label: 'confine lineare', color: 'var(--ink)' },
            ...(bayes ? [{ label: 'confine di Bayes', color: 'var(--c-violet)', kind: 'dash' as const }] : []),
          ]}
        />
        <ScenarioSwitch value={scenario} />
      </div>
      <div className="wgrid">
        <MapPlot>
          <RegionDots cls={cls} />
          <Polyline pts={line} color="var(--ink)" width={2} />
          {bayes && <BayesBoundary sc={scenario} />}
          <Points pts={m.train} />
        </MapPlot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">Regressione sui target 0/1</div>
            <div className="wmath">
              <Tex>{`\\hat y = ${f(w0)} ${sg(w1)} ${f(Math.abs(w1))}\\,x_1 ${sg(w2)} ${f(Math.abs(w2))}\\,x_2`}</Tex>
            </div>
            <p className="wnote">
              Classe 1 se <Tex>{'\\mathbf{x}^T\\mathbf{w} > 0{,}5'}</Tex>, classe 0 altrimenti.
            </p>
          </div>
          <div className="readouts">
            <Readout label="errore di training" value={pct(m.lin.errTrain)} />
            <Readout label="errore di test" value={pct(m.lin.errTest)} sub={`su ${m.test.length} punti nuovi`} />
          </div>
          <Toggle label="confronta con il confine ottimo (Bayes)" checked={bayes} onChange={setBayes} />
          <p className="wnote">
            Errore di Bayes (il minimo possibile): <b>{pct(m.bayesErr)}</b>.
          </p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Passa allo scenario 1: la sovrapposizione delle classi è inevitabile e la retta è quasi ottima.', done: seen.gauss },
          { label: 'Accendi il confine di Bayes e confrontalo con la retta nei due scenari.', done: seen.bayes },
        ]}
      />
    </div>
  )
}

const f = (v: number) => fmt(v).replace(',', '{,}').replace('−', '-')
const sg = (v: number) => (v >= 0 ? '+' : '-')

/* ------------------------------------------------------------------ Fig. 5.17 */

function KSlider({ k, width = 260 }: { k: number; width?: number }) {
  const i = Math.max(0, K_STEPS.indexOf(k))
  return (
    <Slider
      label={<Tex>k</Tex>}
      min={0}
      max={K_STEPS.length - 1}
      step={1}
      value={i}
      onChange={(v) => setK(K_STEPS[v])}
      format={() => String(k)}
      width={width}
      marks={[
        { value: 0, label: '1' },
        { value: K_STEPS.indexOf(15), label: '15' },
        { value: K_STEPS.length - 1, label: 'l' },
      ]}
    />
  )
}

function KnnPanel({ k, sc, title }: { k: number; sc: Scenario; title: string }) {
  const m = model(sc)
  return (
    <div className="htf__panel">
      <div className="htf__title">{title}</div>
      <MapPlot small>
        <RegionDots cls={(i, j) => (gridAvg(m, i, j, k) > 0.5 ? 1 : 0)} />
        <GridBoundary val={(i, j) => gridAvg(m, i, j, k) - 0.5 - 1e-9} />
        <Points pts={m.train} r={3} />
      </MapPlot>
      <div className="readouts">
        <Readout label="errore di training" value={pct(m.errTrain[k])} />
        <Readout label="errore di test" value={pct(m.errTest[k])} />
      </div>
    </div>
  )
}

export function KnnRegions() {
  const { scenario, k } = useHtf()
  const moved = useLatch({ m: k !== 15 }).m
  const seen = useLatch({ small: moved && k <= 3, big: k >= 101, back: moved && k === 15 })
  return (
    <div>
      <div className="wbar">
        <Legend items={[...classLegend, { label: 'confine di decisione', color: 'var(--ink)' }]} />
        <ScenarioSwitch value={scenario} />
      </div>
      <div className="wgrid wgrid--even">
        <KnnPanel k={1} sc={scenario} title="1-nearest neighbor" />
        <KnnPanel k={k} sc={scenario} title={`${k}-nearest neighbors`} />
      </div>
      <div className="controls">
        <KSlider k={k} />
      </div>
      <Tasks
        items={[
          { label: 'Nel pannello di sinistra (k = 1) l’errore di training è zero: ogni punto è il vicino di sé stesso.', done: seen.small },
          { label: 'Porta k verso l: il confine si appiattisce fino a una sola classe per tutto il piano.', done: seen.big },
          { label: 'Torna a k = 15: confine più regolare, qualche errore sul training.', done: seen.back },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 5.19 e 5.20 */

const LOGL = Math.log10(L)
const pos = (k: number) => Math.log10(L / k)
const nearestK = (p: number) => {
  const kk = L / 10 ** p
  return K_STEPS.reduce((a, b) => (Math.abs(Math.log(b / kk)) < Math.abs(Math.log(a / kk)) ? b : a))
}

export function KnnCurves({ variant }: { variant: 'u' | 'htf' }) {
  const { scenario, k } = useHtf()
  const m = model(scenario)
  const ks = Array.from({ length: L }, (_, i) => i + 1)
  const tr = ks.map((kk) => ({ x: pos(kk), y: m.errTrain[kk] }))
  const te = ks.map((kk) => ({ x: pos(kk), y: m.errTest[kk] }))
  const best = K_STEPS.reduce((a, b) => (m.errTest[b] < m.errTest[a] ? b : a))
  const yMax = variant === 'u' ? 0.55 : 0.4
  const moved = useLatch({ m: k !== 15 }).m
  const seen = useLatch({ one: moved && k === 1, all: k === L, best: moved && k === best })
  const dofTicks = [1, 2, 3, 5, 8, 12, 18, 29, 67, 200]
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'errore di training', color: 'var(--c-blue)' },
            { label: 'errore di test', color: 'var(--c-orange)' },
            ...(variant === 'htf'
              ? [
                  { label: 'modello lineare', color: 'var(--c-red)', kind: 'dot' as const },
                  { label: 'errore di Bayes', color: 'var(--c-violet)' },
                ]
              : []),
          ]}
        />
        {variant === 'htf' && <ScenarioSwitch value={scenario} />}
      </div>
      <Plot xDomain={[-0.05, LOGL + 0.05]} yDomain={[0, yMax]} aspect={0.5} margin={{ t: variant === 'htf' ? 30 : 16, b: 40 }}>
        <Axes
          xTicks={variant === 'u' ? [200, 45, 15, 5, 1].map(pos) : dofTicks.map((d) => Math.log10(d))}
          xFormat={(v) => String(Math.round(variant === 'u' ? L / 10 ** v : 10 ** v))}
          yTicks={variant === 'u' ? [0, 0.1, 0.2, 0.3, 0.4, 0.5] : [0, 0.1, 0.2, 0.3, 0.4]}
          yFormat={(v) => fmt(v, 2)}
          xLabel={variant === 'u' ? `k (da k = l = ${L} a k = 1)` : 'gradi di libertà l/k'}
          yLabel="errore"
        />
        {variant === 'htf' && <TopKTicks />}
        {variant === 'htf' && (
          <Polyline
            pts={[
              { x: -1, y: m.bayesErr },
              { x: 5, y: m.bayesErr },
            ]}
            color="var(--c-violet)"
            width={1.6}
          />
        )}
        <Polyline pts={tr} color="var(--c-blue)" width={2.2} />
        <Polyline pts={te} color="var(--c-orange)" width={2.2} />
        {variant === 'htf' && <LinearMarks m={m} />}
        {variant === 'u' && (
          <>
            <Label x={0.1} y={yMax * 0.9} className="plot-label--muted">
              underfitting (rigido)
            </Label>
            <Label x={LOGL - 0.05} y={yMax * 0.9} anchor="end" className="plot-label--muted">
              overfitting (flessibile)
            </Label>
            <BestRing x={pos(best)} y={m.errTest[best]} />
          </>
        )}
        <Polyline
          pts={[
            { x: pos(k), y: 0 },
            { x: pos(k), y: yMax },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Handle x={pos(k)} y={m.errTest[k]} axis="x" label="valore di k" onMove={(p) => setK(nearestK(p.x))} bounds={{ x: [0, LOGL] }} />
      </Plot>
      <div className="readouts">
        <Readout label="k" value={String(k)} sub={`l/k ≈ ${fmt(L / k, 1)} parametri effettivi`} />
        <Readout label="errore di training" tone="blue" value={pct(m.errTrain[k])} />
        <Readout label="errore di test" tone="orange" value={pct(m.errTest[k])} />
        {variant === 'htf' ? (
          <Readout label="modello lineare (test)" tone="red" value={pct(m.lin.errTest)} sub={`Bayes: ${pct(m.bayesErr)}`} />
        ) : (
          <Readout label="minimo dell’errore di test" value={`k = ${best}`} />
        )}
      </div>
      <Tasks
        items={[
          { label: 'Trascina il cursore fino a k = 1: training a zero, test in risalita (overfitting).', done: seen.one },
          { label: 'Porta k fino a l: il modello risponde sempre con la stessa classe (underfitting).', done: seen.all },
          { label: `Cerca il k con l’errore di test più basso (qui k = ${best}).`, done: seen.best },
        ]}
      />
    </div>
  )
}

function TopKTicks() {
  const { x, m, w } = usePlot()
  if (w < 520) return null
  return (
    <g className="htf__top">
      {[151, 83, 45, 25, 15, 9, 5, 3, 1].map((kk) => (
        <text key={kk} x={x(pos(kk))} y={m.t - 10} textAnchor="middle" className="axes__tick">
          {kk}
        </text>
      ))}
    </g>
  )
}

function LinearMarks({ m }: { m: ReturnType<typeof model> }) {
  const { x, y } = usePlot()
  const px = x(Math.log10(3))
  return (
    <g>
      <rect x={px - 5} y={y(m.lin.errTrain) - 5} width={10} height={10} fill="var(--c-blue)" stroke="var(--plot-bg)" strokeWidth={1.5} />
      <rect x={px - 5} y={y(m.lin.errTest) - 5} width={10} height={10} fill="var(--c-orange)" stroke="var(--plot-bg)" strokeWidth={1.5} />
      <text x={px + 10} y={Math.min(y(m.lin.errTrain), y(m.lin.errTest)) - 6} className="plot-label">
        lineare (3 parametri)
      </text>
    </g>
  )
}

function BestRing({ x: xv, y: yv }: { x: number; y: number }) {
  const { x, y } = usePlot()
  return <ellipse cx={x(xv)} cy={y(yv)} rx={28} ry={20} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="4 4" />
}

/* ------------------------------------------------------------------ Fig. 5.21 */

export function BayesVsKnn() {
  const { scenario, k } = useHtf()
  const m = model(scenario)
  const bayesGrid = useMemo(() => {
    const g = new Float64Array(GX * GY)
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) g[j * GX + i] = bayesP1(scenario, gridX(i), gridY(j))
    return g
  }, [scenario])
  const [overlay, setOverlay] = useState(false)
  const seen = useLatch({ overlay, gauss: scenario === 'gauss' })
  return (
    <div>
      <div className="wbar">
        <Legend items={[...classLegend, { label: 'confine di Bayes', color: 'var(--c-violet)', kind: 'dash' }]} />
        <ScenarioSwitch value={scenario} />
      </div>
      <div className="wgrid wgrid--even">
        <div className="htf__panel">
          <div className="htf__title">Classificatore ottimo di Bayes</div>
          <MapPlot small>
            <RegionDots cls={(i, j) => (bayesGrid[j * GX + i] > 0.5 ? 1 : 0)} />
            <BayesBoundary sc={scenario} />
            <Points pts={m.train} r={3} />
          </MapPlot>
          <div className="readouts">
            <Readout label="errore di Bayes (test)" tone="violet" value={pct(m.bayesErr)} />
          </div>
        </div>
        <div className="htf__panel">
          <div className="htf__title">{k}-nearest neighbors</div>
          <MapPlot small>
            <RegionDots cls={(i, j) => (gridAvg(m, i, j, k) > 0.5 ? 1 : 0)} />
            <GridBoundary val={(i, j) => gridAvg(m, i, j, k) - 0.5 - 1e-9} />
            {overlay && <BayesBoundary sc={scenario} />}
            <Points pts={m.train} r={3} />
          </MapPlot>
          <div className="readouts">
            <Readout label="errore di test" tone="orange" value={pct(m.errTest[k])} />
          </div>
        </div>
      </div>
      <div className="controls">
        <KSlider k={k} />
        <Toggle label="sovrapponi il confine di Bayes al K-NN" checked={overlay} onChange={setOverlay} />
      </div>
      <Tasks
        items={[
          { label: 'Sovrapponi il confine di Bayes: con k = 15 il K-NN lo segue da vicino.', done: seen.overlay },
          { label: 'Passa allo scenario 1: qui il confine ottimo è quasi una retta.', done: seen.gauss },
        ]}
      />
    </div>
  )
}
