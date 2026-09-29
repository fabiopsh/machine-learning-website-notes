import { useMemo, useState } from 'react'
import { Axes, Dot, FnPath, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { polyval } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { fit, reseed, resetOriginal, rms, setL, setM, target, testSet, trainingSet, usePoly } from './polyStore'

const Y: [number, number] = [-1.6, 1.6]

function Samples({ xs, ts, r = 4.5 }: { xs: number[]; ts: number[]; r?: number }) {
  return (
    <>
      {xs.map((x, i) => (
        <Dot key={i} x={x} y={ts[i]} r={r} color="var(--c-blue)" hollow />
      ))}
    </>
  )
}

const legend = [
  { label: <Tex>{'\\sin(2\\pi x)'}</Tex>, color: 'var(--c-green)' },
  { label: 'dati di training (con rumore)', color: 'var(--c-blue)', kind: 'dot' as const },
]

/* ------------------------------------------------------------------ Fig. 4.1 */

export function SineTarget() {
  const { seed } = usePoly()
  const d = trainingSet(10, seed)
  return (
    <div>
      <div className="wbar">
        <Legend items={legend} />
        <span className="poly__btns">
          <Btn icon="reset" onClick={reseed}>
            Nuovo rumore
          </Btn>
          {seed !== 0 && (
            <Btn onClick={resetOriginal} variant="soft">
              Dati della figura originale
            </Btn>
          )}
        </span>
      </div>
      <Plot xDomain={[0, 1]} yDomain={Y} aspect={0.5}>
        <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
        <FnPath f={target} color="var(--c-green)" width={2.4} />
        <Residuals xs={d.xs} ts={d.ts} />
        <Samples xs={d.xs} ts={d.ts} />
      </Plot>
      <p className="wnote">
        I segmenti grigi sono il rumore: la distanza di ogni campione dalla curva vera. Premi «Nuovo rumore» per estrarre un altro
        training set dalla stessa funzione (le altre figure di questa sezione si aggiornano).
      </p>
    </div>
  )
}

function Residuals({ xs, ts }: { xs: number[]; ts: number[] }) {
  return (
    <>
      {xs.map((x, i) => (
        <Polyline
          key={i}
          pts={[
            { x, y: ts[i] },
            { x, y: target(x) },
          ]}
          color="var(--ink-4)"
          width={1.2}
        />
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ Fig. 4.2 */

function verdictOf(tr: number, te: number) {
  if (tr > 0.3) return { cls: 'verdict--warn', text: 'Underfitting: il modello è troppo semplice' }
  if (te > 2 * tr + 0.15) return { cls: 'verdict--bad', text: 'Overfitting: impara anche il rumore' }
  return { cls: 'verdict--good', text: 'Buon compromesso' }
}

export function PolyFit() {
  const { M, seed } = usePoly()
  const [grid, setGrid] = useState(false)
  const d = trainingSet(10, seed)
  const w = useMemo(() => fit(10, seed, M), [seed, M])
  const tr = rms(w, d)
  const te = rms(w, testSet(seed))
  const v = verdictOf(tr, te)

  // i suggerimenti si spuntano solo dopo un'azione dello studente (al primo render M = 3)
  const moved = useLatch({ moved: M !== 3 }).moved
  const seen = useLatch({ under: M <= 1, over: M === 9, good: moved && M === 3, grid })

  return (
    <div>
      <div className="wbar">
        <Legend items={[...legend, { label: 'polinomio di grado M', color: 'var(--c-red)' }]} />
        <Segmented
          size="sm"
          value={grid ? 'grid' : 'one'}
          onChange={(k) => setGrid(k === 'grid')}
          options={[
            { value: 'one', label: 'Un grado' },
            { value: 'grid', label: 'Confronta 0 · 1 · 3 · 9' },
          ]}
        />
      </div>
      {grid ? (
        <div className="poly__grid">
          {[0, 1, 3, 9].map((m) => {
            const wm = fit(10, seed, m)
            return (
              <button key={m} className={`poly__cell${m === M ? ' is-on' : ''}`} onClick={() => setM(m)}>
                <Plot xDomain={[0, 1]} yDomain={Y} aspect={0.7} minH={150} maxH={230} margin={{ l: 26, r: 8, t: 8, b: 22 }}>
                  <Axes xTicks={[0, 1]} yTicks={[-1, 0, 1]} />
                  <FnPath f={target} color="var(--c-green)" width={2} />
                  <FnPath f={(x) => polyval(wm, x)} color="var(--c-red)" width={2} samples={400} />
                  <Samples xs={d.xs} ts={d.ts} r={3.5} />
                  <Label x={0.97} y={1.35} anchor="end" className="plot-label--math plot-label--strong">
                    M = {m}
                  </Label>
                </Plot>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="wgrid">
          <Plot xDomain={[0, 1]} yDomain={Y} aspect={0.72}>
            <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
            <FnPath f={target} color="var(--c-green)" width={2.4} />
            <FnPath f={(x) => polyval(w, x)} color="var(--c-red)" width={2.4} samples={500} />
            <Samples xs={d.xs} ts={d.ts} />
            <Label x={0.97} y={1.35} anchor="end" className="plot-label--math plot-label--strong">
              M = {M}
            </Label>
          </Plot>
          <div className="wside">
            <div className="readouts">
              <Readout label="errore RMS di training" tone="blue" value={fmt(tr, 3)} />
              <Readout label="errore RMS di test" tone="orange" value={fmt(te, 3)} />
            </div>
            <span className={`verdict ${v.cls}`}>{v.text}</span>
            <CoefBars w={w} />
          </div>
        </div>
      )}
      <div className="controls">
        <Slider
          label={
            <>
              grado del polinomio <Tex>M</Tex>
            </>
          }
          min={0}
          max={9}
          step={1}
          value={M}
          onChange={setM}
          width={300}
          marks={[0, 1, 3, 9].map((m) => ({ value: m, label: String(m) }))}
        />
      </div>
      <Tasks
        items={[
          { label: 'Con M = 0 o M = 1 il modello non riesce a seguire il seno: underfitting.', done: seen.under },
          { label: 'Con M = 3 la curva approssima bene la funzione vera.', done: seen.good },
          { label: 'Con M = 9 l’errore di training è zero… e guarda i coefficienti.', done: seen.over },
          { label: 'Confronta i quattro gradi affiancati, come nella figura originale.', done: seen.grid },
        ]}
      />
    </div>
  )
}

/** I coefficienti ottimi w*, con barre in scala logaritmica: a M = 9 esplodono. */
function CoefBars({ w }: { w: number[] }) {
  const max = 7 // 10^7
  return (
    <div className="wpanel coef">
      <div className="wpanel__title">
        Coefficienti ottimi <Tex>{'\\mathbf{w}^*'}</Tex>
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
              <span className="coef__val">{fmtBig(v)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function fmtBig(v: number) {
  const a = Math.abs(v)
  const s = a >= 1000 ? Math.round(v).toLocaleString('it-IT') : v.toFixed(2).replace('.', ',')
  return s.replace('-', '−')
}

/* ------------------------------------------------------------------ Fig. 4.3 */

export function RmsCurve() {
  const { M, seed } = usePoly()
  const [hover, setHover] = useState<number | null>(null)
  const d = trainingSet(10, seed)
  const ts = testSet(seed)
  const rows = useMemo(
    () =>
      Array.from({ length: 10 }, (_, m) => {
        const w = fit(10, seed, m)
        return { m, tr: rms(w, d), te: rms(w, ts) }
      }),
    [seed, d, ts],
  )
  const cap = 1
  const show = hover ?? M
  const r = rows[show]
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'training', color: 'var(--c-blue)' },
            { label: 'test', color: 'var(--c-orange)' },
          ]}
        />
        <span className="wnote">
          Clicca su un grado per selezionarlo: <strong>M = {M}</strong>
        </span>
      </div>
      <Plot
        xDomain={[-0.5, 9.5]}
        yDomain={[0, cap]}
        aspect={0.5}
        onPointerMove={(p) => setHover(Math.max(0, Math.min(9, Math.round(p.x))))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(p) => setM(Math.max(0, Math.min(9, Math.round(p.x))))}
        overlay={({ x, y }) => (
          <div className="ptip" style={{ left: x(show), top: y(Math.min(cap, Math.max(r.tr, r.te))) }}>
            M = <b>{show}</b> · training <b>{fmt(r.tr, 3)}</b> · test <b>{fmt(r.te, 3)}</b>
          </div>
        )}
      >
        <Band m={M} />
        <Axes xTicks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} yTicks={[0, 0.5, 1]} xLabel="M" yLabel="errore RMS" />
        <Polyline pts={rows.map((q) => ({ x: q.m, y: Math.min(cap * 1.02, q.tr) }))} color="var(--c-blue)" width={2} />
        <Polyline pts={rows.map((q) => ({ x: q.m, y: Math.min(cap * 1.02, q.te) }))} color="var(--c-orange)" width={2} />
        {rows.map((q) => (
          <Dot key={`a${q.m}`} x={q.m} y={Math.min(cap, q.tr)} r={4.5} color="var(--c-blue)" />
        ))}
        {rows.map((q) => (
          <Dot key={`b${q.m}`} x={q.m} y={Math.min(cap, q.te)} r={4.5} color="var(--c-orange)" />
        ))}
        {rows
          .filter((q) => q.te > cap)
          .map((q) => (
            <Label key={q.m} x={q.m} y={cap} dy={-8} anchor="middle" className="plot-label--strong">
              ↑ {fmt(q.te, 1)}
            </Label>
          ))}
        <Label x={0} y={0.06} className="plot-label--muted">
          underfitting
        </Label>
        <Label x={9.3} y={0.06} anchor="end" className="plot-label--muted">
          overfitting
        </Label>
      </Plot>
    </div>
  )
}

function Band({ m }: { m: number }) {
  const { x, y } = usePlot()
  return <rect x={x(m - 0.4)} y={y(1)} width={x(0.8) - x(0)} height={y(0) - y(1)} fill="var(--accent)" opacity={0.08} rx={6} />
}

/* ------------------------------------------------------------------ Fig. 4.4 */

export function MoreData() {
  const { seed } = usePoly()
  const [l, setLocalL] = useState(15)
  const d = trainingSet(l, seed)
  const w = useMemo(() => fit(l, seed, 9), [l, seed])
  const tr = rms(w, d)
  const te = rms(w, testSet(seed))
  const seen = useLatch({ l100: l === 100 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          value={l}
          onChange={(v) => {
            setLocalL(v)
            setL(v)
          }}
          options={[10, 15, 100].map((v) => ({ value: v, label: `l = ${v}` }))}
        />
        <Legend items={[...legend, { label: 'polinomio di grado 9', color: 'var(--c-red)' }]} />
      </div>
      <Plot xDomain={[0, 1]} yDomain={Y} aspect={0.5}>
        <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
        <FnPath f={target} color="var(--c-green)" width={2.4} />
        <FnPath f={(x) => polyval(w, x)} color="var(--c-red)" width={2.4} samples={500} />
        <Samples xs={d.xs} ts={d.ts} r={l > 50 ? 3.5 : 4.5} />
        <Label x={0.97} y={1.35} anchor="end" className="plot-label--math plot-label--strong">
          l = {l}
        </Label>
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label="errore RMS di training" tone="blue" value={fmt(tr, 3)} />
          <Readout label="errore RMS di test" tone="orange" value={fmt(te, 3)} />
        </div>
      </div>
      <Tasks items={[{ label: 'Passa da l = 10 a l = 100: lo stesso polinomio di grado 9 smette di oscillare.', done: seen.l100 }]} />
    </div>
  )
}
