import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Legend, Readout, Segmented } from '../../components/ui/Controls'
import { Tex } from '../../components/prose/Tex'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { GX, GY, gridX, gridY, model, X as HX, Y as HY } from '../l05/htf'
import { marchCell } from '../common/Surface3D'
import { segsToPath } from '../common/contours'
import { forward, trainer, useTrainer, type NetW, type Run } from './mlp'

/* ------------------------------------------------------------------ dati di regressione (8.6, 8.8, 8.9) */

const SC = 4 // l'input x ∈ [0, 1] entra nella rete come (2x − 1)·SC
const target = (x: number) => Math.sin(2 * Math.PI * x)
const REG = (() => {
  const r = rng(52)
  const xs = Array.from({ length: 12 }, (_, i) => i / 11)
  const ys = xs.map((x) => target(x) + 0.3 * gauss(r))
  const xv = Array.from({ length: 300 }, () => r())
  const yv = xv.map((x) => target(x) + 0.3 * gauss(r))
  const enc = (x: number) => [(2 * x - 1) * SC]
  return { xs, ys, X: xs.map(enc), Y: ys.map((y) => [y]), Xv: xv.map(enc), Yv: yv.map((y) => [y]) }
})()
const EPOCHS = 30000
const regCfg = (lambda: number) => ({
  X: REG.X,
  Y: REG.Y,
  Xv: REG.Xv,
  Yv: REG.Yv,
  H: 40,
  eta: 0.05,
  alpha: 0.9,
  lambda,
  out: 'lin' as const,
  seed: 3,
  init: 0.7,
})
const plain = trainer(regCfg(0), EPOCHS, -0.02, false, true)
const decayed = trainer(regCfg(0.01), EPOCHS, -0.02)

const outAt = (net: NetW, x: number) => forward(net, [(2 * x - 1) * SC], 'lin').o[0]

function Progress({ run }: { run: Run }) {
  return run.done < run.total ? <span className="l8__prog">addestramento: epoca {run.done.toLocaleString('it-IT')}</span> : null
}

/* ------------------------------------------------------------------ Fig. 8.6 */

const LOGMAX = Math.log10(EPOCHS)
const lx = (e: number) => Math.log10(Math.max(1, e))

export function EarlyStopping() {
  const run = useTrainer(plain)
  const [stop, setStop] = useState(Math.log10(3000))
  const h = run.hist
  const iStop = h.reduce((best, r, i) => (Math.abs(lx(r[0]) - stop) < Math.abs(lx(h[best][0]) - stop) ? i : best), 0)
  const iBest = h.reduce((b, r, i) => (r[2] < h[b][2] ? i : b), 0)
  const net = run.nets?.[iStop] ?? run.net
  const moved = useLatch({ m: stop !== Math.log10(3000) }).m
  const seen = useLatch({
    good: moved && run.done === run.total && Math.abs(iStop - iBest) <= 12,
    over: moved && run.done === run.total && lx(h[iStop][0]) > 4.2,
  })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'errore sul training set', color: 'var(--c-blue)' },
            { label: 'errore sul validation set', color: 'var(--c-orange)' },
          ]}
        />
        <Progress run={run} />
      </div>
      <div className="wgrid">
        <Plot xDomain={[0, LOGMAX]} yDomain={[0, 0.3]} aspect={0.62} margin={{ b: 40 }}>
          <Axes
            xTicks={[0, 1, 2, 3, 4]}
            xFormat={(v) => String(10 ** v).replace(/(\d)(?=(\d{3})+$)/g, '$1.')}
            yTicks={[0, 0.1, 0.2, 0.3]}
            yFormat={(v) => fmt(v, 1)}
            xLabel="epoche (scala log)"
            yLabel="MSE"
          />
          <Zone x={lx(h[iBest][0])} />
          <Polyline pts={h.map((r) => ({ x: lx(r[0]), y: Math.min(0.3, r[1]) }))} color="var(--c-blue)" width={2.2} />
          <Polyline pts={h.map((r) => ({ x: lx(r[0]), y: Math.min(0.3, r[2]) }))} color="var(--c-orange)" width={2.2} />
          <Label x={LOGMAX - 0.05} y={0.27} anchor="end" className="plot-label--muted">
            overtrained
          </Label>
          <Polyline
            pts={[
              { x: stop, y: 0 },
              { x: stop, y: 0.3 },
            ]}
            color="var(--ink-3)"
            width={1}
            dash="3 4"
          />
          <Handle
            x={stop}
            y={0}
            axis="x"
            label="epoca in cui fermarsi"
            onMove={(p) => setStop(Math.max(0, Math.min(LOGMAX, p.x)))}
            bounds={{ x: [0, LOGMAX] }}
          />
        </Plot>
        <div className="wside">
          <Plot xDomain={[0, 1]} yDomain={[-1.8, 1.8]} aspect={0.75} minH={170} maxH={240} margin={{ l: 30, r: 8, t: 8, b: 24 }}>
            <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} />
            <FnPath f={target} color="var(--c-green)" width={2} />
            <FnPath f={(x) => outAt(net, x)} color="var(--c-red)" width={2.2} samples={300} />
            {REG.xs.map((x, i) => (
              <Dot key={i} x={x} y={REG.ys[i]} color="var(--c-blue)" hollow />
            ))}
          </Plot>
          <div className="readouts">
            <Readout label="epoca" value={h[iStop][0].toLocaleString('it-IT')} />
            <Readout label="training" tone="blue" value={fmt(h[iStop][1], 3)} />
            <Readout label="validazione" tone="orange" value={fmt(h[iStop][2], 3)} />
          </div>
          <p className="wnote">A sinistra le curve; qui l’uscita della rete (rosso) all’epoca scelta, con la funzione vera (verde).</p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Porta il cursore nella zona in cui l’errore di validazione è minimo: è il punto in cui fermarsi.', done: seen.good },
          { label: 'Portalo alla fine: training quasi zero, validazione alta, la curva insegue il rumore (overtrained).', done: seen.over },
        ]}
      />
    </div>
  )
}

function Zone({ x: xv }: { x: number }) {
  const { x, y } = usePlot()
  return (
    <g>
      <ellipse cx={x(xv)} cy={y(0.1)} rx={42} ry={24} fill="none" stroke="var(--c-blue)" strokeWidth={1.2} strokeDasharray="4 4" />
      <text x={x(xv)} y={y(0.1) + 42} textAnchor="middle" className="plot-label">
        zona buona per fermarsi
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 8.8 */

const LAMS = [0.001, 0.003, 0.01, 0.03]

function FitPanel({ run, title }: { run: Run; title: ReactNode }) {
  return (
    <div className="htf__panel">
      <div className="htf__title">{title}</div>
      <Plot xDomain={[0, 1]} yDomain={[-1.8, 1.8]} aspect={0.8} minH={190} maxH={300} margin={{ l: 30, r: 8, t: 8, b: 24 }}>
        <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} />
        <FnPath f={target} color="var(--c-green)" width={1.6} dash="5 4" />
        <FnPath f={(x) => outAt(run.net, x)} color="var(--c-red)" width={2.4} samples={300} />
        {REG.xs.map((x, i) => (
          <Dot key={i} x={x} y={REG.ys[i]} color="var(--c-blue)" />
        ))}
      </Plot>
      <div className="readouts">
        <Readout label="training" tone="blue" value={fmt(run.hist[run.hist.length - 1][1], 3)} />
        <Readout label="validazione" tone="orange" value={fmt(run.hist[run.hist.length - 1][2], 3)} />
      </div>
      <Progress run={run} />
    </div>
  )
}

export function RegRegression() {
  const r0 = useTrainer(plain)
  const r1 = useTrainer(decayed)
  const [lam, setLam] = useState(0.01)
  const choose = (v: number) => {
    setLam(v)
    decayed.restart({ lambda: v })
  }
  const seen = useLatch({ big: lam >= 0.03 && r1.done === r1.total, small: lam <= 0.001 && r1.done === r1.total })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'dati di training', color: 'var(--c-blue)', kind: 'dot' },
            { label: 'funzione vera', color: 'var(--c-green)', kind: 'dash' },
            { label: 'uscita della rete', color: 'var(--c-red)' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <FitPanel
          run={r0}
          title={
            <>
              Senza regolarizzazione (<Tex>{'\\lambda = 0'}</Tex>)
            </>
          }
        />
        <FitPanel
          run={r1}
          title={
            <>
              Regolarizzata (<Tex>{`\\lambda = ${fmt(lam, 3).replace(',', '{,}')}`}</Tex>)
            </>
          }
        />
      </div>
      <div className="controls">
        <Segmented
          label="λ della rete a destra"
          value={lam}
          onChange={choose}
          options={LAMS.map((v) => ({ value: v, label: fmt(v, 3) }))}
        />
      </div>
      <Tasks
        items={[
          { label: 'Prova λ = 0,03: la curva diventa troppo piatta (underfitting).', done: seen.big },
          { label: 'Prova λ = 0,001: la penalità è troppo debole e riaffiorano le oscillazioni.', done: seen.small },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 8.9 */

const wAbs = (net: NetW) => [...net.W1.flatMap((w) => w.slice(1)), ...net.W2[0].slice(1)]

/** la rete 1-40-1 con ogni connessione colorata per segno e intensità (|w| / max) */
function WeightNet({ net, max, title }: { net: NetW; max?: number; title: ReactNode }) {
  const W = 420
  const H = 230
  const n = net.W1.length
  const hx = (j: number) => 20 + (j * (W - 40)) / (n - 1)
  const all = wAbs(net)
  const mx = Math.max(...all.map(Math.abs), 1e-9)
  const ref = max ?? mx
  const small = all.filter((v) => Math.abs(v) < 0.1).length / all.length
  const col = (v: number) => (v >= 0 ? 'var(--c-blue)' : 'var(--c-orange)')
  const op = (v: number) => Math.min(1, 0.05 + Math.abs(v) / ref)
  return (
    <div className="htf__panel">
      <div className="htf__title">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w8__net" role="img" aria-label="Pesi della rete colorati per segno e intensità">
        {net.W1.map((w, j) => (
          <line key={`a${j}`} x1={W / 2} y1={H - 22} x2={hx(j)} y2={H / 2} stroke={col(w[1])} strokeWidth={1.4} opacity={op(w[1])} />
        ))}
        {net.W2[0].slice(1).map((v, j) => (
          <line key={`b${j}`} x1={hx(j)} y1={H / 2} x2={W / 2} y2={22} stroke={col(v)} strokeWidth={1.4} opacity={op(v)} />
        ))}
        {net.W1.map((_, j) => (
          <circle key={j} cx={hx(j)} cy={H / 2} r={4} className="w8__unit" />
        ))}
        <circle cx={W / 2} cy={H - 22} r={9} className="w8__io" />
        <circle cx={W / 2} cy={22} r={9} className="w8__io" />
        <text x={W / 2 + 16} y={H - 18} className="net__side">
          input
        </text>
        <text x={W / 2 + 16} y={26} className="net__side">
          uscita
        </text>
      </svg>
      <div className="readouts">
        <Readout label="peso massimo |w|" value={fmt(mx, 2)} />
        <Readout label="pesi con |w| < 0,1" value={`${fmt(small * 100, 0)}%`} />
      </div>
    </div>
  )
}

export function WeightsViz() {
  const r0 = useTrainer(plain)
  const r1 = useTrainer(decayed)
  const [scale, setScale] = useState<'own' | 'same'>('own')
  const seen = useLatch({ same: scale === 'same' })
  const m0 = Math.max(...wAbs(r0.net).map(Math.abs))
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'peso positivo', color: 'var(--c-blue)' },
            { label: 'peso negativo', color: 'var(--c-orange)' },
          ]}
        />
        <Segmented
          size="sm"
          value={scale}
          onChange={setScale}
          options={[
            { value: 'own', label: 'intensità relativa' },
            { value: 'same', label: 'stessa scala' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <WeightNet
          net={r0.net}
          max={scale === 'same' ? m0 : undefined}
          title={
            <>
              Rete addestrata con <Tex>{'\\lambda = 0'}</Tex>
            </>
          }
        />
        <WeightNet net={r1.net} max={scale === 'same' ? m0 : undefined} title="Rete regolarizzata" />
      </div>
      <Tasks
        items={[
          {
            label: 'Passa a «stessa scala»: con la regolarizzazione quasi tutti i pesi sbiadiscono, cioè sono vicini a zero.',
            done: seen.same,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 8.7 */

const HTF = model('mix')
const mu = [0, 1].map((d) => HTF.train.reduce((s, p) => s + (d ? p.y : p.x), 0) / HTF.train.length)
const sd = [0, 1].map((d) => Math.sqrt(HTF.train.reduce((s, p) => s + ((d ? p.y : p.x) - mu[d]) ** 2, 0) / HTF.train.length))
const std = (x: number, y: number) => [(x - mu[0]) / sd[0], (y - mu[1]) / sd[1]]
const HX_ = HTF.train.map((p) => std(p.x, p.y))
const HY_ = HTF.train.map((p) => [p.c])
const TX_ = HTF.test.map((p) => std(p.x, p.y))
const TY_ = HTF.test.map((p) => [p.c])
const clsCfg = (lambda: number) => ({
  X: HX_,
  Y: HY_,
  Xv: TX_,
  Yv: TY_,
  H: 10,
  eta: 1,
  alpha: 0.9,
  lambda,
  out: 'sig' as const,
  seed: 7,
  init: 0.7,
})
const cls0 = trainer(clsCfg(0), 6000, 60, true)
const cls1 = trainer(clsCfg(0.002), 6000, 60, true)

function ClsPanel({ run, title }: { run: Run; title: string }) {
  const net = run.net
  const vals = useMemo(() => {
    const v = new Float64Array(GX * GY)
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) v[j * GX + i] = forward(net, std(gridX(i), gridY(j)), 'sig').o[0] - 0.5
    return v
  }, [net])
  const last = run.acc?.[run.acc.length - 1]
  return (
    <div className="htf__panel">
      <div className="htf__title">{title}</div>
      <Plot xDomain={HX} yDomain={HY} equal aspect={0.8} minH={200} maxH={340} margin={{ l: 26, r: 8, t: 8, b: 22 }}>
        <Axes xTicks={[-2, 0, 2]} yTicks={[-2, 0, 2]} grid={false} />
        <Dots vals={vals} />
        <Boundary vals={vals} />
        {HTF.train.map((p, i) => (
          <DotRing key={i} x={p.x} y={p.y} c={p.c} />
        ))}
      </Plot>
      <div className="readouts">
        <Readout label="errore di training" value={last ? fmt((1 - last[1]) * 100, 1) + '%' : '—'} />
        <Readout
          label="errore di test"
          tone="orange"
          value={last ? fmt((1 - last[2]) * 100, 1) + '%' : '—'}
          sub={`Bayes: ${fmt(HTF.bayesErr * 100, 1)}%`}
        />
      </div>
      <Progress run={run} />
    </div>
  )
}

function Dots({ vals }: { vals: Float64Array }) {
  const { x, y, clipId } = usePlot()
  let d1 = ''
  let d0 = ''
  const r = 1.1
  for (let j = 0; j < GY; j++)
    for (let i = 0; i < GX; i++) {
      const dot = `M${x(gridX(i)).toFixed(1)},${y(gridY(j)).toFixed(1)}m-${r},0a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 -${2 * r},0`
      if (vals[j * GX + i] > 0) d1 += dot
      else d0 += dot
    }
  return (
    <g clipPath={`url(#${clipId})`} className="htf__dots">
      <path d={d1} fill="var(--c-blue)" />
      <path d={d0} fill="var(--c-orange)" />
    </g>
  )
}

function Boundary({ vals }: { vals: Float64Array }) {
  const { x, y, clipId } = usePlot()
  const segs: [[number, number], [number, number]][] = []
  const v = (i: number, j: number) => vals[j * GX + i]
  for (let j = 0; j < GY - 1; j++)
    for (let i = 0; i < GX - 1; i++)
      segs.push(...marchCell(gridX(i), gridX(i + 1), gridY(j), gridY(j + 1), v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1), 0))
  return <path d={segsToPath(segs, x, y)} fill="none" stroke="var(--ink)" strokeWidth={1.8} clipPath={`url(#${clipId})`} />
}

function DotRing({ x: xv, y: yv, c }: { x: number; y: number; c: number }) {
  const { x, y } = usePlot()
  return <circle cx={x(xv)} cy={y(yv)} r={3} fill="none" stroke={c ? 'var(--c-blue)' : 'var(--c-orange)'} strokeWidth={1.4} />
}

export function WeightDecayClassifier() {
  const r0 = useTrainer(cls0)
  const r1 = useTrainer(cls1)
  const [again, setAgain] = useState(false)
  const seen = useLatch({ again: again && r0.done === r0.total })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'classe 1', color: 'var(--c-blue)', kind: 'dot' },
            { label: 'classe 0', color: 'var(--c-orange)', kind: 'dot' },
            { label: 'confine della rete', color: 'var(--ink)' },
          ]}
        />
        <Btn
          icon="reset"
          onClick={() => {
            cls0.restart({})
            cls1.restart({})
            setAgain(true)
          }}
        >
          Riaddestra dall’inizio
        </Btn>
      </div>
      <div className="wgrid wgrid--even">
        <ClsPanel run={r0} title="Rete da 10 unità, senza weight decay" />
        <ClsPanel run={r1} title="Rete da 10 unità, con weight decay" />
      </div>
      <Tasks items={[{ label: 'Riaddestra e guarda i confini formarsi: senza weight decay diventano frastagliati.', done: seen.again }]} />
    </div>
  )
}
