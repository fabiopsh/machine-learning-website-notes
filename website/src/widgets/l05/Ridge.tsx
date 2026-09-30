import { useMemo, useSyncExternalStore } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { polyval, ridgePolyfit } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { rms, target, testSet, trainingSet } from '../l04/polyStore'

/**
 * Polinomio di grado 9 sui 10 punti della lezione 4, con la penalità di Tikhonov λ‖w‖².
 * ln λ è condiviso dalle figure 5.14 e 5.15. −∞ vuol dire λ = 0 (nessuna regolarizzazione).
 */
const M = 9
const LN_MIN = -40
let lnL = -18
const listeners = new Set<() => void>()
const setLn = (v: number) => {
  lnL = v
  listeners.forEach((f) => f())
}
function useLn() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => lnL,
    () => lnL,
  )
}

const TR = trainingSet(10, 0)
const TS = testSet(0)
const lambdaOf = (ln: number) => (ln === -Infinity ? 0 : Math.exp(ln))
const fitAt = (ln: number) => ridgePolyfit(TR.xs, TR.ts, M, lambdaOf(ln))

const fmtLn = (v: number) => (v === -Infinity ? '−∞' : fmt(v, 0))

function Presets({ ln }: { ln: number }) {
  return (
    <Segmented
      size="sm"
      value={ln === -Infinity ? 'inf' : ln === -18 ? '-18' : ln === 0 ? '0' : 'x'}
      onChange={(v) => setLn(v === 'inf' ? -Infinity : Number(v))}
      options={[
        { value: 'inf', label: 'ln λ = −∞' },
        { value: '-18', label: '−18' },
        { value: '0', label: '0' },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ Fig. 5.14 */

export function RidgeFit() {
  const ln = useLn()
  const w = useMemo(() => fitAt(ln), [ln])
  const tr = rms(w, TR)
  const te = rms(w, TS)
  const norm = Math.sqrt(w.reduce((s, v) => s + v * v, 0))
  const moved = useLatch({ m: ln !== -18 }).m
  const seen = useLatch({ none: ln === -Infinity, high: ln >= -1, back: moved && ln === -18 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <Tex>{'\\sin(2\\pi x)'}</Tex>, color: 'var(--c-green)' },
            { label: 'dati di training', color: 'var(--c-blue)', kind: 'dot' },
            { label: 'polinomio di grado 9 regolarizzato', color: 'var(--c-red)' },
          ]}
        />
        <Presets ln={ln} />
      </div>
      <div className="wgrid">
        <Plot xDomain={[0, 1]} yDomain={[-1.6, 1.6]} aspect={0.72}>
          <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
          <FnPath f={target} color="var(--c-green)" width={2.4} />
          <FnPath f={(x) => polyval(w, x)} color="var(--c-red)" width={2.4} samples={500} />
          {TR.xs.map((x, i) => (
            <Dot key={i} x={x} y={TR.ts[i]} color="var(--c-blue)" hollow />
          ))}
          <Label x={0.97} y={1.35} anchor="end" className="plot-label--math plot-label--strong">
            ln λ = {fmtLn(ln)}
          </Label>
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label="errore RMS di training" tone="blue" value={fmt(tr, 3)} />
            <Readout label="errore RMS di test" tone="orange" value={fmt(te, 3)} />
            <Readout
              label={<Tex>{'\\|\\mathbf{w}\\|'}</Tex>}
              value={norm > 1e5 ? norm.toExponential(1).replace('.', ',') : fmt(norm, 2)}
              sub={`λ = ${ln === -Infinity ? '0' : lambdaOf(ln).toExponential(1).replace('.', ',')}`}
            />
          </div>
          <Coefs w={w} />
        </div>
      </div>
      <div className="controls">
        <Slider
          label={<>ln λ</>}
          min={LN_MIN}
          max={0}
          step={1}
          value={ln === -Infinity ? LN_MIN : ln}
          onChange={setLn}
          format={() => fmtLn(ln)}
          width={320}
          marks={[
            { value: LN_MIN, label: '−40' },
            { value: -18, label: '−18' },
            { value: 0, label: '0' },
          ]}
        />
      </div>
      <Tasks
        items={[
          { label: 'Togli la regolarizzazione (ln λ = −∞): il polinomio interpola i punti e oscilla, con pesi enormi.', done: seen.none },
          { label: 'Porta ln λ a 0: la curva diventa quasi piatta (underfitting).', done: seen.high },
          { label: 'Torna a ln λ = −18: curva liscia vicina al seno, peggiore sul training ma migliore sul test.', done: seen.back },
        ]}
      />
    </div>
  )
}

function Coefs({ w }: { w: number[] }) {
  const max = 7
  return (
    <div className="wpanel coef">
      <div className="wpanel__title">
        Coefficienti <Tex>{'\\mathbf{w}^*'}</Tex>
      </div>
      <ul className="coef__list">
        {w.map((v, j) => {
          const mag = Math.log10(Math.abs(v) + 1)
          return (
            <li key={j}>
              <span className="coef__name">
                <Tex>{`w_{${j}}^*`}</Tex>
              </span>
              <span className="coef__bar">
                <span className={v < 0 ? 'is-neg' : undefined} style={{ width: `${Math.min(100, (mag / max) * 100)}%` }} />
              </span>
              <span className="coef__val">{Math.abs(v) >= 1e5 ? v.toExponential(1).replace('.', ',').replace('-', '−') : fmt(v, 2)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 5.15 */

const GRID = Array.from({ length: 81 }, (_, i) => LN_MIN + (i * -LN_MIN) / 80)

export function RidgeRms() {
  const ln = useLn()
  const curves = useMemo(() => {
    const tr: { x: number; y: number }[] = []
    const te: { x: number; y: number }[] = []
    for (const g of GRID) {
      const w = fitAt(g)
      tr.push({ x: g, y: rms(w, TR) })
      te.push({ x: g, y: Math.min(1.2, rms(w, TS)) })
    }
    return { tr, te }
  }, [])
  const best = curves.te.reduce((a, b) => (b.y < a.y ? b : a))
  const x = ln === -Infinity ? LN_MIN : ln
  const w = fitAt(ln)
  const moved = useLatch({ m: ln !== -18 }).m
  const seen = useLatch({ left: moved && x <= -34, right: x >= -4, best: moved && Math.abs(x - best.x) <= 1 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'training', color: 'var(--c-blue)' },
            { label: 'test', color: 'var(--c-orange)' },
          ]}
        />
        <Presets ln={ln} />
      </div>
      <Plot xDomain={[LN_MIN, 0]} yDomain={[0, 1.2]} aspect={0.5} margin={{ b: 40 }}>
        <Axes xTicks={[-40, -35, -30, -25, -20, -15, -10, -5, 0]} yTicks={[0, 0.5, 1]} xLabel="ln λ" yLabel="E_RMS" />
        <Polyline pts={curves.tr} color="var(--c-blue)" width={2.4} />
        <Polyline pts={curves.te} color="var(--c-orange)" width={2.4} />
        <GoodZone x={best.x} y={best.y} />
        <Label x={-39} y={1.1} className="plot-label--muted">
          λ piccolo → overfitting
        </Label>
        <Label x={-1} y={1.1} anchor="end" className="plot-label--muted">
          λ grande → underfitting
        </Label>
        <Polyline
          pts={[
            { x, y: 0 },
            { x, y: 1.2 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Handle
          x={x}
          y={Math.min(1.2, rms(w, TS))}
          axis="x"
          label="ln lambda"
          onMove={(p) => setLn(Math.round(p.x))}
          bounds={{ x: [LN_MIN, 0] }}
        />
      </Plot>
      <div className="readouts">
        <Readout label="ln λ" value={fmtLn(ln)} />
        <Readout label="training" tone="blue" value={fmt(rms(w, TR), 3)} />
        <Readout label="test" tone="orange" value={fmt(rms(w, TS), 3)} sub={`minimo del test vicino a ln λ = ${fmt(best.x, 0)}`} />
      </div>
      <Tasks
        items={[
          { label: 'Sposta ln λ tutto a sinistra: errore di training quasi zero, test alto (overfitting).', done: seen.left },
          { label: 'Sposta ln λ verso 0: salgono entrambi gli errori (underfitting).', done: seen.right },
          { label: 'Cerca il minimo dell’errore di test: è il buon compromesso.', done: seen.best },
        ]}
      />
    </div>
  )
}

function GoodZone({ x: xv, y: yv }: { x: number; y: number }) {
  const { x, y } = usePlot()
  return (
    <g>
      <ellipse cx={x(xv)} cy={y(yv)} rx={46} ry={22} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="4 4" />
      <text x={x(xv)} y={y(yv) - 28} textAnchor="middle" className="plot-label">
        buon compromesso
      </text>
    </g>
  )
}
