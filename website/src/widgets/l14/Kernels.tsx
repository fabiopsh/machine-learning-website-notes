import { useMemo, useState, useSyncExternalStore } from 'react'
import { Axes, Dot, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'
import { bayesP1, model, X as HX, Y as HY } from '../l05/htf'
import { g, isSv, polyK, rbfK, trainSvc, type Svc, type Vec } from '../l13/solver'

/* ------------------------------------------------------------------ dati del problema a due classi (lezione 5) */

const HTF = model('mix')
const TR_X: Vec[] = HTF.train.map((p) => [p.x, p.y])
const TR_D = HTF.train.map((p) => (p.c ? 1 : -1))
const TS_X: Vec[] = HTF.test.map((p) => [p.x, p.y])
const TS_D = HTF.test.map((p) => (p.c ? 1 : -1))
const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'

// il kernel polinomiale lavora sulle coordinate dimezzate (valori più piccoli, problema meglio condizionato)
const POLY_SCALE = 0.5
const gammaToSigma = (gm: number) => Math.sqrt(1 / (2 * gm))

type Kind = 'poly' | 'rbf'

function fitHtf(kind: Kind, C: number, par: number) {
  const s = kind === 'poly' ? POLY_SCALE : 1
  const X = TR_X.map((x) => [x[0] * s, x[1] * s])
  const m = trainSvc(X, TR_D, C, kind === 'poly' ? polyK(par) : rbfK(gammaToSigma(par)))
  const f = (x: number, y: number) => g(m, [x * s, y * s])
  const err = (XX: Vec[], dd: number[]) => XX.filter((x, i) => Math.sign(f(x[0], x[1])) !== dd[i]).length / XX.length
  return { m, f, trErr: err(TR_X, TR_D), tsErr: err(TS_X, TS_D) }
}

const BAYES_PATH_SEGS = contourSegments((a, b) => bayesP1('mix', a, b), HX, HY, 0.5, 90)

function Paths({ f }: { f: (x: number, y: number) => number }) {
  const { x, y } = usePlot()
  const segs = useMemo(() => [0, 1, -1].map((lv) => contourSegments(f, HX, HY, lv, 70)), [f])
  return (
    <g>
      <path d={segsToPath(BAYES_PATH_SEGS, x, y)} className="svm14__bayes" />
      <path d={segsToPath(segs[1], x, y)} className="svm14__margin" />
      <path d={segsToPath(segs[2], x, y)} className="svm14__margin" />
      <path d={segsToPath(segs[0], x, y)} className="svm14__boundary" />
    </g>
  )
}

function Regions({ f }: { f: (x: number, y: number) => number }) {
  const { x, y } = usePlot()
  const n = 46
  const cells = useMemo(() => {
    const out: { cx: number; cy: number; s: number }[] = []
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const cx = HX[0] + ((i + 0.5) * (HX[1] - HX[0])) / n
        const cy = HY[0] + ((j + 0.5) * (HY[1] - HY[0])) / n
        out.push({ cx, cy, s: f(cx, cy) })
      }
    return out
  }, [f])
  const w = Math.abs(x(HX[0] + (HX[1] - HX[0]) / n) - x(HX[0]))
  const h = Math.abs(y(HY[0]) - y(HY[0] + (HY[1] - HY[0]) / n))
  return (
    <g className="svm14__cells">
      {cells.map((c, i) => (
        <rect key={i} x={x(c.cx) - w / 2} y={y(c.cy) - h / 2} width={w + 0.5} height={h + 0.5} className={c.s > 0 ? 'is-1' : 'is-0'} />
      ))}
    </g>
  )
}

function Points({ m }: { m: Svc }) {
  return (
    <g>
      {HTF.train.map((p, i) => (
        <Dot key={i} x={p.x} y={p.y} r={3.6} color={p.c ? C1 : C0} hollow />
      ))}
      {HTF.train.map((p, i) => (isSv(m, i) ? <Dot key={`s${i}`} x={p.x} y={p.y} r={2.6} color="var(--ink)" /> : null))}
    </g>
  )
}

const pct = (v: number) => `${fmt(v * 100, 1)}%`

/* ------------------------------------------------------------------ Fig. 14.1 e 14.2 */

export function HtfSvm({ kind }: { kind: Kind }) {
  const [lc, setLc] = useState(0)
  const [par, setPar] = useState(kind === 'poly' ? 4 : 1)
  const C = 10 ** lc
  const fit = useMemo(() => fitHtf(kind, C, par), [kind, C, par])
  const nSv = fit.m.alpha.filter((a) => a > 1e-6).length
  const seen = useLatch({
    par: kind === 'poly' ? par !== 4 : par !== 1,
    c: lc >= 2,
  })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'classe 1', color: C1, kind: 'dot' },
            { label: 'classe 0', color: C0, kind: 'dot' },
            { label: 'support vector', color: 'var(--ink)', kind: 'dot' },
            { label: 'confine della SVM', color: 'var(--ink)' },
            {
              label: (
                <>
                  margine (<Tex>{'g = \\pm 1'}</Tex>)
                </>
              ),
              color: 'var(--ink-3)',
              kind: 'dash',
            },
            { label: 'confine di Bayes', color: 'var(--c-violet)', kind: 'dash' },
          ]}
        />
      </div>
      <Plot xDomain={HX} yDomain={HY} equal aspect={0.88} maxH={480} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
        <Regions f={fit.f} />
        <Axes hideX hideY grid={false} />
        <Paths f={fit.f} />
        <Points m={fit.m} />
      </Plot>
      <div className="controls">
        {kind === 'poly' ? (
          <Segmented
            label={
              <>
                grado <Tex>p</Tex> del polinomio
              </>
            }
            value={par}
            onChange={setPar}
            options={[2, 3, 4, 5, 6].map((v) => ({ value: v, label: String(v) }))}
          />
        ) : (
          <Segmented
            label={<Tex>{'\\gamma = 1/(2\\sigma^2)'}</Tex>}
            value={par}
            onChange={setPar}
            options={[0.1, 0.5, 1, 5, 20].map((v) => ({ value: v, label: fmt(v, v < 1 ? 1 : 0) }))}
          />
        )}
        <Slider
          label={
            <>
              iperparametro <Tex>C</Tex>
            </>
          }
          min={-1}
          max={3}
          step={0.1}
          value={lc}
          onChange={setLc}
          format={(v) => fmt(10 ** v, v < 0 ? 1 : 0)}
        />
      </div>
      <div className="readouts">
        <Readout label="errore di training" tone="blue" value={pct(fit.trErr)} />
        <Readout label="errore di test" tone="orange" value={pct(fit.tsErr)} sub="su 4000 punti nuovi" />
        <Readout label="errore di Bayes" tone="violet" value={pct(HTF.bayesErr)} />
        <Readout label="support vector" tone="accent" value={pct(nSv / TR_X.length)} sub={`${nSv} su ${TR_X.length}`} />
      </div>
      <Tasks
        items={[
          kind === 'poly'
            ? { label: 'Cambia il grado del polinomio: il confine si piega di più o di meno.', done: seen.par }
            : { label: 'Prova γ = 20 (kernel strettissimi): il confine circonda i singoli punti e l’errore di test sale.', done: seen.par },
          { label: 'Alza C oltre 100: meno errori di training tollerati, ma il test non migliora.', done: seen.c },
        ]}
      />
    </div>
  )
}

export const PolySvm = () => <HtfSvm kind="poly" />
export const RbfSvm = () => <HtfSvm kind="rbf" />

/* ------------------------------------------------------------------ Fig. 14.3 */

const GAMMAS = [5, 1, 0.5, 0.1]
const LCS = Array.from({ length: 19 }, (_, i) => -1 + i * 0.25) // log10 C da −1 a 3,5

type Curves = { rows: number[][]; done: boolean }

/** Le curve si calcolano a pezzi (un valore di C per fotogramma), la prima volta che la figura è visibile. */
const curves = (() => {
  let snap: Curves = { rows: GAMMAS.map(() => []), done: false }
  const listeners = new Set<() => void>()
  let raf = 0
  let k = 0
  const step = () => {
    const gi = Math.floor(k / LCS.length)
    const ci = k % LCS.length
    const e = fitHtf('rbf', 10 ** LCS[ci], GAMMAS[gi]).tsErr
    const rows = snap.rows.map((r, i) => (i === gi ? [...r, e] : r))
    k++
    snap = { rows, done: k >= GAMMAS.length * LCS.length }
    listeners.forEach((f) => f())
    raf = snap.done ? 0 : requestAnimationFrame(step)
  }
  return {
    subscribe(cb: () => void) {
      listeners.add(cb)
      if (!raf && !snap.done) raf = requestAnimationFrame(step)
      return () => {
        listeners.delete(cb)
        if (!listeners.size && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      }
    },
    get: () => snap,
  }
})()

function Panel({ gm, row, lc }: { gm: number; row: number[]; lc: number }) {
  const best = row.length === LCS.length ? row.indexOf(Math.min(...row)) : -1
  const ci = Math.round((lc - LCS[0]) / 0.25)
  return (
    <div className="cg14__panel">
      <div className="cg14__title">
        <Tex>{`\\gamma = ${fmt(gm, gm < 1 ? 1 : 0)}`}</Tex>
      </div>
      <Plot xDomain={[-1.1, 3.6]} yDomain={[0.17, 0.3]} aspect={0.95} minH={150} maxH={220} margin={{ l: 34, r: 8, t: 8, b: 26 }}>
        <Axes
          xTicks={[-1, 1, 3]}
          xFormat={(v) => (v === -1 ? '0,1' : v === 1 ? '10' : '1000')}
          yTicks={[0.2, 0.25, 0.3]}
          yFormat={(v) => fmt(v, 2)}
        />
        <Polyline
          pts={[
            { x: -1.1, y: HTF.bayesErr },
            { x: 3.6, y: HTF.bayesErr },
          ]}
          color="var(--c-violet)"
          width={1.2}
          dash="4 4"
        />
        <Polyline
          pts={[
            { x: lc, y: 0.17 },
            { x: lc, y: 0.3 },
          ]}
          color="var(--accent)"
          width={1.2}
        />
        <Polyline pts={row.map((e, i) => ({ x: LCS[i], y: e }))} color="var(--c-orange)" width={2.2} />
        {best >= 0 && <Dot x={LCS[best]} y={row[best]} r={5} color="var(--c-orange)" />}
        {row[ci] !== undefined && <Dot x={lc} y={row[ci]} r={4} color="var(--accent)" />}
      </Plot>
      <div className="cg14__val">{row[ci] !== undefined ? `test ${pct(row[ci])}` : '…'}</div>
    </div>
  )
}

export function CGamma() {
  const snap = useSyncExternalStore(curves.subscribe, curves.get)
  const [lc, setLc] = useState(0)
  const at = snap.done ? GAMMAS.map((_, i) => snap.rows[i][Math.round((lc - LCS[0]) / 0.25)]) : []
  const bestG = at.length ? GAMMAS[at.indexOf(Math.min(...at))] : null
  const seen = useLatch({ low: snap.done && lc <= -0.5, high: snap.done && lc >= 3 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'errore di test', color: 'var(--c-orange)' },
            { label: 'errore di Bayes', color: 'var(--c-violet)', kind: 'dash' },
            {
              label: (
                <>
                  il <Tex>C</Tex> scelto
                </>
              ),
              color: 'var(--accent)',
            },
          ]}
        />
        {!snap.done && <span className="wnote">addestramento delle SVM in corso…</span>}
      </div>
      <div className="cg14__grid">
        {GAMMAS.map((gm, i) => (
          <Panel key={gm} gm={gm} row={snap.rows[i]} lc={lc} />
        ))}
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              iperparametro <Tex>C</Tex> (scala logaritmica)
            </>
          }
          min={-1}
          max={3.5}
          step={0.25}
          value={lc}
          onChange={setLc}
          format={(v) => fmt(10 ** v, v < 0 ? 1 : 0)}
        />
        <Readout
          label={
            <>
              con questo <Tex>C</Tex> il miglior <Tex>\gamma</Tex> è
            </>
          }
          tone="accent"
          value={bestG === null ? '…' : fmt(bestG, bestG < 1 ? 1 : 0)}
        />
      </div>
      <Tasks
        items={[
          { label: 'Porta C verso 0,1: vince il kernel più stretto (γ = 5), con la regolarizzazione massima.', done: seen.low },
          { label: 'Porta C a 1000: ora conviene un kernel largo (γ piccolo).', done: seen.high },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 14.4 */

type Shape = 'oct' | 'cross' | 'bar' | 'trap' | 'tri' | 'rhomb'
type Obj = { shape: Shape; x: number; y: number; s: number; rot: number }

const OBJS: Obj[] = [
  { shape: 'oct', x: 40, y: 45, s: 1, rot: 0 },
  { shape: 'oct', x: 150, y: 165, s: 0.8, rot: 10 },
  { shape: 'cross', x: 150, y: 40, s: 0.9, rot: 20 },
  { shape: 'cross', x: 140, y: 225, s: 0.8, rot: 0 },
  { shape: 'bar', x: 55, y: 110, s: 1, rot: -30 },
  { shape: 'bar', x: 215, y: 150, s: 1, rot: 45 },
  { shape: 'trap', x: 120, y: 105, s: 0.9, rot: -30 },
  { shape: 'trap', x: 230, y: 230, s: 0.85, rot: 0 },
  { shape: 'tri', x: 210, y: 75, s: 0.9, rot: 0 },
  { shape: 'tri', x: 45, y: 280, s: 0.9, rot: 200 },
  { shape: 'rhomb', x: 70, y: 200, s: 1.2, rot: 15 },
  { shape: 'rhomb', x: 170, y: 290, s: 1.1, rot: 0 },
]
const SHAPES: Shape[] = ['oct', 'cross', 'bar', 'trap', 'tri', 'rhomb']
const SHAPE_NAME: Record<Shape, string> = {
  oct: 'ottagoni',
  cross: 'croci',
  bar: 'barre',
  trap: 'trapezi',
  tri: 'triangoli',
  rhomb: 'rombi',
}

function ShapePath({ o }: { o: Obj }) {
  const k = 18 * o.s
  const t = `translate(${o.x} ${o.y}) rotate(${o.rot}) scale(${k / 18})`
  const cls = `ko14__obj ko14__obj--${o.shape}`
  switch (o.shape) {
    case 'oct':
      return <polygon className={cls} transform={t} points="-7,-17 7,-17 17,-7 17,7 7,17 -7,17 -17,7 -17,-7" />
    case 'cross':
      return <polygon className={cls} transform={t} points="-5,-15 5,-15 5,-5 15,-5 15,5 5,5 5,15 -5,15 -5,5 -15,5 -15,-5 -5,-5" />
    case 'bar':
      return <rect className={cls} transform={t} x={-26} y={-9} width={52} height={18} rx={6} />
    case 'trap':
      return <polygon className={cls} transform={t} points="-14,-16 14,-16 9,16 -9,16" />
    case 'tri':
      return <polygon className={cls} transform={t} points="-16,-12 16,-12 0,16" />
    default:
      return <polygon className={cls} transform={t} points="0,-24 16,0 0,24 -16,0" />
  }
}

type KernelKind = 'shape' | 'size' | 'same'

/** Posizione di ogni oggetto nello spazio delle feature indotto dal kernel scelto. */
function featurePos(kk: KernelKind, i: number) {
  const o = OBJS[i]
  const t = SHAPES.indexOf(o.shape)
  const twin = OBJS.findIndex((q, j) => q.shape === o.shape && j !== i) > i ? 0 : 1
  if (kk === 'shape') {
    const cx = 60 + (t % 3) * 95
    const cy = 70 + Math.floor(t / 3) * 150
    return { x: cx + (twin ? 9 : -7), y: cy + (twin ? 8 : -6) }
  }
  if (kk === 'size') {
    // solo la grandezza conta: oggetti di forme diverse si mescolano
    return { x: 40 + ((o.s - 0.8) / 0.4) * 230, y: 90 + (i % 4) * 40 }
  }
  return { x: 155 + (i % 3) * 2, y: 150 + (i % 2) * 2 }
}

export function KernelObjects() {
  const [kk, setKk] = useState<KernelKind>('shape')
  const [sel, setSel] = useState(2)
  const seen = useLatch({ bad: kk !== 'shape', sel: sel !== 2 })
  const W = 640
  const H = 320
  const FX = 330
  const pos = OBJS.map((_, i) => featurePos(kk, i))
  const p = pos[sel]
  const o = OBJS[sel]
  return (
    <div>
      <div className="wbar">
        <Segmented
          label="kernel (misura di similarità)"
          value={kk}
          onChange={setKk}
          options={[
            { value: 'shape', label: 'forma' },
            { value: 'size', label: 'grandezza' },
            { value: 'same', label: 'tutti uguali' },
          ]}
        />
      </div>
      <svg className="ko14" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Oggetti nello spazio originale e nello spazio delle feature">
        <text className="ko14__cap" x={10} y={H - 8}>
          spazio originale
        </text>
        <text className="ko14__cap" x={FX + 10} y={H - 8}>
          spazio delle feature (vettoriale)
        </text>
        <g className="ko14__axes">
          <line x1={FX + 40} y1={H - 40} x2={FX + 40} y2={20} />
          <line x1={FX + 40} y1={H - 40} x2={W - 10} y2={H - 30} />
          <line x1={FX + 40} y1={H - 40} x2={W - 30} y2={H - 150} />
        </g>
        {kk === 'shape' &&
          SHAPES.map((_, t) => (
            <ellipse
              key={t}
              className="ko14__group"
              cx={FX + 60 + (t % 3) * 95 + 1}
              cy={70 + Math.floor(t / 3) * 150 + 1}
              rx={26}
              ry={22}
            />
          ))}
        <path
          className="ko14__arrow"
          d={`M${o.x + 20},${o.y - 10} C${(o.x + FX + p.x) / 2},${Math.max(30, Math.min(o.y, p.y) - 70)} ${(o.x + FX + p.x) / 2},${Math.max(30, p.y - 40)} ${FX + p.x - 6},${p.y - 4}`}
        />
        <text className="ko14__phi" x={(o.x + FX + p.x) / 2} y={Math.max(22, Math.min(o.y, p.y) - 44)} textAnchor="middle">
          φ
        </text>
        {OBJS.map((q, i) => (
          <g
            key={i}
            className={`ko14__pick${i === sel ? ' is-on' : ''}`}
            onClick={() => setSel(i)}
            role="button"
            tabIndex={0}
            aria-label={`oggetto ${i + 1}: ${SHAPE_NAME[q.shape]}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(i)}
          >
            <ShapePath o={q} />
          </g>
        ))}
        {pos.map((q, i) => (
          <circle
            key={i}
            className={`ko14__dot ko14__dot--${OBJS[i].shape}${i === sel ? ' is-on' : ''}`}
            r={i === sel ? 6 : 4.5}
            style={{ transform: `translate(${FX + q.x}px, ${q.y}px)` }}
          />
        ))}
      </svg>
      <div className={`verdict ${kk === 'shape' ? 'verdict--good' : 'verdict--bad'}`}>
        <span>
          {kk === 'shape'
            ? 'Buon kernel: gli oggetti simili per il task (stessa forma) finiscono vicini, in gruppi compatti.'
            : kk === 'size'
              ? 'Kernel che non c’entra con il task: avvicina oggetti della stessa grandezza, di forme diverse.'
              : 'Kernel inutile: tutti gli oggetti risultano ugualmente simili e nello spazio delle feature non si distinguono.'}
        </span>
      </div>
      <Tasks
        items={[
          { label: 'Clicca un altro oggetto per seguire la sua immagine φ nello spazio delle feature.', done: seen.sel },
          { label: 'Cambia kernel: con una similarità che non riguarda il task i gruppi spariscono.', done: seen.bad },
        ]}
      />
    </div>
  )
}
