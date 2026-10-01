import { useMemo, useState } from 'react'
import { Axes, Dot, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, polyfit, polyval, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { contourSegments, segsToPath } from '../common/contours'

/* ------------------------------------------------------------------ Fig. 9.1 */

/**
 * 100 training set di 20 punti estratti dalla stessa funzione (sin 2πx più rumore gaussiano, come nella
 * lezione 4) e polinomi di grado M = 0…11 come complessità crescente. Errore di test su 400 punti nuovi.
 */
const MMAX = 11
const NSETS = 100
const BV = (() => {
  const r = rng(909)
  const f = (x: number) => Math.sin(2 * Math.PI * x)
  const xt = Array.from({ length: 400 }, (_, i) => i / 399)
  const yt = xt.map((x) => f(x) + 0.3 * gauss(r))
  const tr: number[][] = []
  const te: number[][] = []
  for (let s = 0; s < NSETS; s++) {
    const xs = Array.from({ length: 20 }, (_, i) => (i + 0.2 + 0.6 * r()) / 20)
    const ys = xs.map((x) => f(x) + 0.3 * gauss(r))
    const a: number[] = []
    const b: number[] = []
    for (let M = 0; M <= MMAX; M++) {
      const w = polyfit(xs, ys, M)
      a.push(xs.reduce((s2, x, i) => s2 + (ys[i] - polyval(w, x)) ** 2, 0) / xs.length)
      b.push(xt.reduce((s2, x, i) => s2 + (yt[i] - polyval(w, x)) ** 2, 0) / xt.length)
    }
    tr.push(a)
    te.push(b)
  }
  const mean = (m: number[][], M: number) => m.reduce((s2, row) => s2 + row[M], 0) / m.length
  return {
    tr,
    te,
    mTr: Array.from({ length: MMAX + 1 }, (_, M) => mean(tr, M)),
    mTe: Array.from({ length: MMAX + 1 }, (_, M) => mean(te, M)),
  }
})()
const YMAX = 1.2
const clip = (v: number) => Math.min(YMAX, v)

export function BiasVariance() {
  const [M, setM] = useState(9)
  const [sel, setSel] = useState<number | null>(null)
  const col = BV.te.map((row) => row[M])
  const order = col.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
  const lucky = order[0][1]
  const unlucky = order[order.length - 1][1]
  const seen = useLatch({ low: M <= 1, spread: M >= 10 && sel !== null })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('errore di training (100 training set)', 'training error (100 training sets)'), color: 'var(--c-blue)' },
            { label: tx('errore di test', 'test error'), color: 'var(--c-orange)' },
            ...(sel !== null
              ? [
                  {
                    label:
                      sel === lucky
                        ? tx('il training set più fortunato', 'the luckiest training set')
                        : tx('il più sfortunato', 'the unluckiest'),
                    color: 'var(--ink)',
                  },
                ]
              : []),
          ]}
        />
      </div>
      <Plot xDomain={[0, MMAX]} yDomain={[0, YMAX]} aspect={0.55} margin={{ b: 40 }}>
        <Axes
          xTicks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
          yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2]}
          yFormat={(v) => fmt(v, 1)}
          xLabel={tx('complessità del modello (grado M)', 'model complexity (degree M)')}
          yLabel={tx('errore', 'error')}
        />
        <Curves rows={BV.tr} color="var(--c-blue)" />
        <Curves rows={BV.te} color="var(--c-orange)" />
        <Polyline pts={BV.mTr.map((y, x) => ({ x, y: clip(y) }))} color="var(--c-blue)" width={3} />
        <Polyline pts={BV.mTe.map((y, x) => ({ x, y: clip(y) }))} color="var(--c-orange)" width={3} />
        {sel !== null && <Polyline pts={BV.te[sel].map((y, x) => ({ x, y: clip(y) }))} color="var(--ink)" width={2} dash="5 3" />}
        <Label x={0.2} y={1.13} className="plot-label--muted">
          {tx('← alto bias, bassa varianza', '← high bias, low variance')}
        </Label>
        <RightLabel />
        <Polyline
          pts={[
            { x: M, y: 0 },
            { x: M, y: YMAX },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Handle x={M} y={0} axis="x" label={tx('complessità del modello', 'model complexity')} onMove={(p) => setM(Math.round(Math.max(0, Math.min(MMAX, p.x))))} />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout
            label={tx(
              <>
                errore di test con <Tex>{`M = ${M}`}</Tex>
              </>,
              <>
                test error with <Tex>{`M = ${M}`}</Tex>
              </>,
            )}
            tone="orange"
            value={`${fmt(order[0][0], 2)} – ${fmt(order[order.length - 1][0], 2)}`}
            sub={tx('dal training set più fortunato al più sfortunato', 'from the luckiest training set to the unluckiest')}
          />
          <Readout label={tx('media', 'mean')} value={fmt(BV.mTe[M], 2)} />
        </div>
        <Btn onClick={() => setSel(lucky)}>{tx('Il più fortunato', 'The luckiest')}</Btn>
        <Btn onClick={() => setSel(unlucky)}>{tx('Il più sfortunato', 'The unluckiest')}</Btn>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Porta la complessità a M = 0 o 1: le curve di test sono vicine tra loro (bassa varianza) ma alte (alto bias).',
              'Set the complexity to M = 0 or 1: the test curves are close to each other (low variance) but high (high bias).',
            ),
            done: seen.low,
          },
          {
            label: tx(
              'Con M ≥ 10 confronta il training set più fortunato con il più sfortunato: stesso modello, errori molto diversi.',
              'With M ≥ 10 compare the luckiest training set with the unluckiest: same model, very different errors.',
            ),
            done: seen.spread,
          },
        ]}
      />
    </div>
  )
}

/** su schermi stretti l'etichetta di destra scende di una riga, per non toccare quella di sinistra */
function RightLabel() {
  const { w } = usePlot()
  return (
    <Label x={MMAX - 0.2} y={w < 560 ? 1.03 : 1.13} anchor="end" className="plot-label--muted">
      {tx('basso bias, alta varianza →', 'low bias, high variance →')}
    </Label>
  )
}

function Curves({ rows, color }: { rows: number[][]; color: string }) {
  const { x, y, clipId } = usePlot()
  const d = rows.map((row) => 'M' + row.map((v, M) => `${x(M).toFixed(1)},${y(clip(v)).toFixed(1)}`).join('L')).join('')
  return <path d={d} fill="none" stroke={color} strokeWidth={0.8} opacity={0.22} clipPath={`url(#${clipId})`} />
}

/* ------------------------------------------------------------------ Fig. 9.3 */

const NVAR = 1000
type Rows = number[][] // [pattern][variabile] in {0,1}

function makeData(l: number, seed: number) {
  const r = rng(seed)
  const X: Rows = Array.from({ length: l }, () => Array.from({ length: NVAR }, () => (r() < 0.5 ? 1 : 0)))
  const y = Array.from({ length: l }, () => (r() < 0.5 ? 1 : 0))
  // tre test set di pattern davvero nuovi (10 ciascuno)
  const fresh = [0, 1, 2].map(() => {
    const Xn: Rows = Array.from({ length: 10 }, () => Array.from({ length: NVAR }, () => (r() < 0.5 ? 1 : 0)))
    return { X: Xn, y: Xn.map(() => (r() < 0.5 ? 1 : 0)) }
  })
  // stima su molti pattern nuovi: per una variabile casuale conta solo quante volte coincide con un target casuale
  let hit = 0
  for (let p = 0; p < 1000; p++) if (r() < 0.5 === r() < 0.5) hit++
  return { X, y, fresh, big: hit / 1000 }
}
const accOf = (X: Rows, y: number[], j: number, idx: number[]) => idx.filter((p) => X[p][j] === y[p]).length / idx.length

export function RandomTarget() {
  const [l, setL] = useState(20)
  const [seed, setSeed] = useState(1)
  const [correct, setCorrect] = useState(false)
  const D = useMemo(() => makeData(l, seed * 131 + l), [l, seed])
  const all = D.y.map((_, p) => p)
  const nTs = Math.round(l / 4)
  const tsIdx = all.slice(l - nTs)
  const accs = useMemo(() => {
    const idx = D.y.map((_, p) => p).slice(0, correct ? D.y.length - Math.round(D.y.length / 4) : D.y.length)
    return Array.from({ length: NVAR }, (_, j) => accOf(D.X, D.y, j, idx))
  }, [D, correct])
  const best = accs.indexOf(Math.max(...accs))
  const freshAcc = D.fresh.map((t) =>
    accOf(
      t.X,
      t.y,
      best,
      t.y.map((_, p) => p),
    ),
  )
  const tsAcc = accOf(D.X, D.y, best, tsIdx)
  const [regen, setRegen] = useState(0)
  const seen = useLatch({ regen: regen >= 1, perfect: accs[best] === 1, correct })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('valore 1', 'value 1'), color: 'var(--c-blue)', kind: 'dot' },
            { label: tx('valore 0', 'value 0'), color: 'var(--c-orange)', kind: 'dot' },
          ]}
        />
        <Segmented
          size="sm"
          value={correct ? 'ok' : 'bad'}
          onChange={(v) => setCorrect(v === 'ok')}
          options={[
            { value: 'bad', label: tx('selezione su tutti i dati', 'selection on all the data') },
            { value: 'ok', label: tx('test separato prima', 'test set aside first') },
          ]}
        />
      </div>
      <div className="rt9">
        <div className="rt9__rows">
          <span className="rt9__lbl">target</span>
          {D.y.map((v, p) => (
            <span key={p} className={`rt9__cell${v ? ' is-1' : ''}${correct && p >= l - nTs ? ' is-ts' : ''}`} />
          ))}
          <span className="rt9__lbl">
            {tx('variabile', 'variable')} <Tex>{`x_{${best + 1}}`}</Tex>
          </span>
          {D.y.map((v, p) => (
            <span
              key={p}
              className={`rt9__cell${D.X[p][best] ? ' is-1' : ''}${D.X[p][best] !== v ? ' is-miss' : ''}${correct && p >= l - nTs ? ' is-ts' : ''}`}
            />
          ))}
        </div>
        <p className="wnote">
          {correct
            ? tx(
                `Gli ultimi ${nTs} pattern (riquadrati) sono il test set, messo da parte prima di scegliere la variabile.`,
                `The last ${nTs} patterns (boxed) are the test set, set aside before choosing the variable.`,
              )
            : tx(
                'La variabile è scelta guardando tutti i pattern: è quella che coincide con il target più volte, tra 1000 variabili casuali.',
                'The variable is chosen by looking at all the patterns: it is the one that coincides with the target most often, among 1000 random variables.',
              )}{' '}
          {tx(
            'Le celle segnate in basso sono i pattern su cui la variabile sbaglia.',
            'The cells marked at the bottom are the patterns on which the variable is wrong.',
          )}
        </p>
      </div>
      <div className="wgrid">
        <Histogram accs={accs} best={accs[best]} />
        <div className="wside">
          <div className="readouts">
            <Readout
              label={
                correct
                  ? tx('accuratezza sui dati di selezione', 'accuracy on the selection data')
                  : tx('accuratezza su TR, VL e TS', 'accuracy on TR, VL and TS')
              }
              tone="accent"
              value={`${fmt(accs[best] * 100, 0)}%`}
            />
            {correct ? (
              <Readout
                label={tx('sul test separato prima', 'on the test set aside first')}
                tone="orange"
                value={`${fmt(tsAcc * 100, 0)}%`}
                sub={tx(`${nTs} pattern`, `${nTs} patterns`)}
              />
            ) : (
              <Readout
                label={tx('su tre test set nuovi (10 pattern)', 'on three new test sets (10 patterns)')}
                tone="orange"
                value={freshAcc.map((a) => fmt(a * 100, 0) + '%').join(' · ')}
                sub={tx(`su 1000 pattern nuovi: ${fmt(D.big * 100, 0)}%`, `on 1000 new patterns: ${fmt(D.big * 100, 0)}%`)}
              />
            )}
          </div>
          <Slider label={tx('numero di pattern', 'number of patterns')} min={10} max={30} step={1} value={l} onChange={setL} width={240} />
          <Btn
            icon="reset"
            onClick={() => {
              setSeed(seed + 1)
              setRegen((n) => n + 1)
            }}
          >
            {tx('Nuovi dati casuali', 'New random data')}
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Genera nuovi dati: la variabile scelta cambia, ma sembra sempre buona; sui test nuovi resta vicina al 50%.',
              'Generate new data: the chosen variable changes, but it always looks good; on the new test sets it stays close to 50%.',
            ),
            done: seen.regen,
          },
          {
            label: tx(
              'Riduci i pattern a 10–12 finché compare una variabile che «indovina» il 100%.',
              'Reduce the patterns to 10–12 until a variable appears that “guesses” 100%.',
            ),
            done: seen.perfect,
          },
          {
            label: tx(
              'Passa a «test separato prima»: ora la stima sul test è onesta, intorno al 50%.',
              'Switch to “test set aside first”: now the estimate on the test set is honest, around 50%.',
            ),
            done: seen.correct,
          },
        ]}
      />
    </div>
  )
}

function Histogram({ accs, best }: { accs: number[]; best: number }) {
  const bins = new Map<number, number>()
  for (const a of accs) bins.set(Math.round(a * 100), (bins.get(Math.round(a * 100)) ?? 0) + 1)
  const keys = [...bins.keys()].sort((a, b) => a - b)
  const max = Math.max(...bins.values())
  return (
    <div>
      <div className="htf__title">{tx('Accuratezza delle 1000 variabili', 'Accuracy of the 1000 variables')}</div>
      <Plot xDomain={[0, 100]} yDomain={[0, max * 1.1]} aspect={0.45} minH={150} maxH={220} margin={{ l: 36, b: 34 }}>
        <Axes xTicks={[0, 25, 50, 75, 100]} xFormat={(v) => `${v}%`} yTicks={3} xLabel={tx('accuratezza sul target', 'accuracy on the target')} />
        <Bars keys={keys} bins={bins} best={Math.round(best * 100)} />
        <BestMark best={best * 100} top={max} />
      </Plot>
    </div>
  )
}

function BestMark({ best, top }: { best: number; top: number }) {
  const { x, y } = usePlot()
  return (
    <g className="rt9__mark">
      <line x1={x(best)} x2={x(best)} y1={y(0)} y2={y(top * 0.55)} />
      <text x={x(best)} y={y(top * 0.55) - 6} textAnchor="middle">
        {tx('la scelta', 'the choice')}
      </text>
    </g>
  )
}

function Bars({ keys, bins, best }: { keys: number[]; bins: Map<number, number>; best: number }) {
  const { x, y } = usePlot()
  const w = Math.max(3, (x(100) - x(0)) / 60)
  return (
    <g>
      {keys.map((k) => (
        <rect
          key={k}
          x={x(k) - w / 2}
          y={y(bins.get(k)!)}
          width={w}
          height={y(0) - y(bins.get(k)!)}
          className={k === best ? 'rt9__bar is-best' : 'rt9__bar'}
        />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 9.4 */

const g2 = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) =>
  Math.exp(-((x - cx) ** 2) / (2 * sx * sx) - (y - cy) ** 2 / (2 * sy * sy))
/** prestazione (alta = buona), come nella figura delle slide */
const perf2 = (a: number, b: number) =>
  0.5 +
  0.45 * g2(a, b, 0.4, 0.5, 0.09, 0.16) +
  0.38 * g2(a, b, 0.75, 0.5, 0.07, 0.13) -
  0.4 * g2(a, b, 0.08, 0.5, 0.07, 0.13) -
  0.22 * g2(a, b, 0.4, 0.13, 0.12, 0.06)
/** variante in cui conta solo x₁: un picco stretto */
const perf1 = (a: number) => 0.4 + 0.55 * g2(a, 0, 0.43, 0, 0.035, 1)
const LEVELS = [0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]

function points(kind: 'grid' | 'rand', n: number, seed: number): [number, number][] {
  if (kind === 'grid') {
    const k = Math.round(Math.sqrt(n))
    const out: [number, number][] = []
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) out.push([(i + 0.5) / k, (j + 0.5) / k])
    return out
  }
  const r = rng(seed)
  return Array.from({ length: n }, () => [r(), r()])
}

function SearchPanel({ kind, n, seed, only1, title }: { kind: 'grid' | 'rand'; n: number; seed: number; only1: boolean; title: string }) {
  const pts = useMemo(() => points(kind, n, seed), [kind, n, seed])
  const f = (a: number, b: number) => (only1 ? perf1(a) : perf2(a, b))
  const vals = pts.map(([a, b]) => f(a, b))
  const bi = vals.indexOf(Math.max(...vals))
  const distinct = new Set(pts.map((p) => p[0].toFixed(4))).size
  return (
    <div className="htf__panel">
      <div className="htf__title">{title}</div>
      <Plot xDomain={[0, 1]} yDomain={[0, 1]} equal aspect={1} minH={200} maxH={320} margin={{ l: 34, r: 16, t: 30, b: 30 }}>
        <Axes
          xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          xLabel={<>{svgScript('x', '1')}</>}
          yLabel={<>{svgScript('x', '2')}</>}
        />
        <Contours f={f} />
        <Rugs pts={pts} />
        {pts.map(([a, b], i) => (
          <Cross key={i} x={a} y={b} />
        ))}
        <Dot x={pts[bi][0]} y={pts[bi][1]} r={6} color="var(--accent)" />
      </Plot>
      <div className="readouts">
        <Readout
          label={tx(
            <>
              valori distinti di <Tex>{'x_1'}</Tex>
            </>,
            <>
              distinct values of <Tex>{'x_1'}</Tex>
            </>,
          )}
          value={String(distinct)}
        />
        <Readout label={tx('miglior prestazione trovata', 'best performance found')} tone="accent" value={fmt(vals[bi], 3)} />
      </div>
    </div>
  )
}

function Contours({ f }: { f: (a: number, b: number) => number }) {
  const { x, y, clipId } = usePlot()
  const paths = useMemo(() => LEVELS.map((lv) => ({ lv, d: segsToPath(contourSegments(f, [0, 1], [0, 1], lv, 70), x, y) })), [f, x, y])
  return (
    <g clipPath={`url(#${clipId})`}>
      {paths.map(({ lv, d }) => (
        <path
          key={lv}
          d={d}
          fill="none"
          stroke={lv > 0.5 ? 'var(--c-blue)' : 'var(--c-orange)'}
          strokeWidth={1.2}
          opacity={0.35 + Math.abs(lv - 0.5) * 1.2}
        />
      ))}
    </g>
  )
}

function Cross({ x: xv, y: yv }: { x: number; y: number }) {
  const { x, y } = usePlot()
  return <path d={`M${x(xv) - 3},${y(yv) - 3}l6,6m0,-6l-6,6`} stroke="var(--ink-2)" strokeWidth={1.2} />
}

/** tacche verdi sugli assi: i valori provati di ciascun iperparametro */
function Rugs({ pts }: { pts: [number, number][] }) {
  const { x, y, m, iw } = usePlot()
  return (
    <g className="gr9__rug">
      {pts.map(([a], i) => (
        <line key={`a${i}`} x1={x(a)} x2={x(a)} y1={m.t - 28} y2={m.t - 20} />
      ))}
      {pts.map(([, b], i) => (
        <line key={`b${i}`} x1={m.l + iw + 2} x2={m.l + iw + 10} y1={y(b)} y2={y(b)} />
      ))}
    </g>
  )
}

export function GridRandom() {
  const [n, setN] = useState(100)
  const [seed, setSeed] = useState(3)
  const [only1, setOnly1] = useState(false)
  const seen = useLatch({ only1, small: n === 25 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('risultati buoni', 'good results'), color: 'var(--c-blue)' },
            { label: tx('risultati scarsi', 'poor results'), color: 'var(--c-orange)' },
            { label: tx('valori provati', 'values tried'), color: 'var(--c-green)' },
            { label: tx('la prova migliore', 'the best trial'), color: 'var(--accent)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <SearchPanel
          kind="grid"
          n={n}
          seed={seed}
          only1={only1}
          title={`Grid search (${Math.round(Math.sqrt(n))} × ${Math.round(Math.sqrt(n))})`}
        />
        <SearchPanel kind="rand" n={n} seed={seed} only1={only1} title={tx(`Random search (${n} prove)`, `Random search (${n} trials)`)} />
      </div>
      <div className="controls">
        <Segmented
          label={tx('prove disponibili', 'available trials')}
          value={n}
          onChange={setN}
          options={[25, 49, 100].map((v) => ({ value: v, label: String(v) }))}
        />
        <Toggle
          label={tx(
            <>
              conta solo <Tex>{'x_1'}</Tex>
            </>,
            <>
              only <Tex>{'x_1'}</Tex> matters
            </>,
          )}
          checked={only1}
          onChange={setOnly1}
        />
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          {tx('Nuove prove casuali', 'New random trials')}
        </Btn>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Fai contare solo x₁: la griglia prova appena 10 valori di x₁ e rischia di mancare il picco, la ricerca casuale ne prova 100.',
              'Make only x₁ matter: the grid tries just 10 values of x₁ and risks missing the peak, random search tries 100.',
            ),
            done: seen.only1,
          },
          {
            label: tx(
              'Riduci le prove a 25: con lo stesso budget la griglia ha solo 5 valori per iperparametro.',
              'Reduce the trials to 25: with the same budget the grid has only 5 values per hyperparameter.',
            ),
            done: seen.small,
          },
        ]}
      />
    </div>
  )
}
