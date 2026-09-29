import { useEffect, useMemo, useState } from 'react'
import { Axes, Dot, FnPath, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Segmented } from '../../components/ui/Controls'
import { gauss, polyfit, polyval, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/**
 * Fig. 4.8: K-fold cross-validation su un piccolo dataset (l = 20, dal seno con rumore).
 * A turno ogni fold fa da validazione; l'errore finale è la media dei k errori.
 */

const L = 20
const DATA = (() => {
  const r = rng(404)
  const xs = Array.from({ length: L }, () => r())
  const idx = xs.map((_, i) => i).sort(() => r() - 0.5)
  return idx.map((i) => ({ x: xs[i], t: Math.sin(2 * Math.PI * xs[i]) + 0.3 * gauss(r) }))
})()

function folds(k: number) {
  // assegnazione round-robin: fold di dimensione quasi uguale
  return DATA.map((_, i) => i % k)
}

function cv(k: number, M: number) {
  const f = folds(k)
  const errs: number[] = []
  for (let j = 0; j < k; j++) {
    const tr = DATA.filter((_, i) => f[i] !== j)
    const vl = DATA.filter((_, i) => f[i] === j)
    const w = polyfit(
      tr.map((p) => p.x),
      tr.map((p) => p.t),
      M,
    )
    errs.push(vl.reduce((s, p) => s + (p.t - polyval(w, p.x)) ** 2, 0) / vl.length)
  }
  return errs
}

export function KFold() {
  const [k, setK] = useState(4)
  const [M, setMRaw] = useState(3)
  const [mTouched, setMTouched] = useState(false)
  const setM = (m: number) => {
    setMRaw(m)
    setMTouched(true)
  }
  const [fold, setFold] = useState({ cur: 0, visited: [0] })
  const cur = fold.cur
  const goTo = (n: number) => setFold((f) => ({ cur: n, visited: f.visited.includes(n) ? f.visited : [...f.visited, n] }))
  const [play, setPlay] = useState(false)
  const errs = useMemo(() => cv(k, M), [k, M])
  const mean = errs.reduce((a, b) => a + b, 0) / errs.length
  const f = folds(k)
  const j = Math.min(cur, k - 1)
  const tr = DATA.filter((_, i) => f[i] !== j)
  const w = useMemo(
    () =>
      polyfit(
        tr.map((p) => p.x),
        tr.map((p) => p.t),
        M,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [k, M, j],
  )
  const byM = useMemo(() => [1, 2, 3, 4, 5, 6, 7].map((m) => ({ m, e: cv(k, m).reduce((a, b) => a + b, 0) / k })), [k])
  const bestM = byM.reduce((a, b) => (b.e < a.e ? b : a)).m

  useEffect(() => {
    if (!play) return
    const t = window.setInterval(
      () => setFold((f) => {
        const n = (f.cur + 1) % k
        return { cur: n, visited: f.visited.includes(n) ? f.visited : [...f.visited, n] }
      }),
      1100,
    )
    return () => window.clearInterval(t)
  }, [play, k])

  const seen = useLatch({ loo: k === L, sel: mTouched && M === bestM })

  const visibleFolds = Math.min(k, 10)

  return (
    <div className="kfold">
      <div className="wbar">
        <Segmented
          label={<>numero di fold <Tex>k</Tex></>}
          value={k}
          onChange={(v) => {
            setK(v)
            setFold({ cur: 0, visited: [0] })
          }}
          options={[
            { value: 2, label: '2' },
            { value: 4, label: '4' },
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: L, label: 'leave-one-out' },
          ]}
        />
        <Segmented
          label={<>modello: polinomio di grado <Tex>M</Tex></>}
          size="sm"
          value={M}
          onChange={setM}
          options={[1, 2, 3, 4, 5, 6, 7].map((m) => ({ value: m, label: String(m) }))}
        />
      </div>

      <div className="kfold__rows" role="list">
        {Array.from({ length: visibleFolds }, (_, row) => (
          <button
            key={row}
            role="listitem"
            className={`kfold__row${row === j ? ' is-cur' : ''}`}
            onClick={() => {
              goTo(row)
              setPlay(false)
            }}
          >
            <span className="kfold__blocks">
              {Array.from({ length: k }, (_, b) => (
                <span key={b} className={`kfold__blk${b === row ? ' is-val' : ''}`}>
                  {k <= 10 ? (
                    <span>
                      D<sub>{b + 1}</sub>
                    </span>
                  ) : null}
                </span>
              ))}
            </span>
            <span className="kfold__err">
              <Tex>{`E_{${row + 1}}`}</Tex> = {fmt(errs[row], 3)}
            </span>
          </button>
        ))}
        {k > 10 && <div className="wnote">… e così via per tutti i {k} fold: ognuno contiene un solo esempio.</div>}
      </div>

      <div className="wgrid">
        <Plot xDomain={[0, 1]} yDomain={[-1.8, 1.8]} aspect={0.55}>
          <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
          <FnPath f={(x) => polyval(w, x)} color="var(--c-red)" width={2.2} samples={300} />
          {DATA.map((p, i) => (
            <Dot key={i} x={p.x} y={p.t} r={f[i] === j ? 6 : 4.5} color={f[i] === j ? 'var(--c-orange)' : 'var(--c-blue)'} hollow={f[i] !== j} />
          ))}
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label={<>fold di validazione</>} value={`${j + 1} di ${k}`} sub={`${DATA.length - tr.length} esempi in validazione, ${tr.length} in training`} />
            <Readout label={<>errore di cross-validation <Tex>{'\\frac{1}{k}\\sum_i E_i'}</Tex></>} tone="accent" value={fmt(mean, 3)} />
          </div>
          <div className="kfold__byM">
            <div className="wpanel__title">Errore di CV al variare di M</div>
            {byM.map((q) => (
              <button key={q.m} className={`kfold__mrow${q.m === M ? ' is-on' : ''}`} onClick={() => setM(q.m)}>
                <span>M = {q.m}</span>
                <span className="kfold__mbar">
                  <span className={q.e > 0.6 ? 'is-over' : undefined} style={{ width: `${Math.min(100, (q.e / 0.6) * 100)}%` }} />
                </span>
                <span className="kfold__mval">{q.e > 0.6 ? '> 0,6' : fmt(q.e, 3)}</span>
              </button>
            ))}
          </div>
          <div className="gradx__btns" style={{ marginLeft: 0 }}>
            <Btn icon={play ? 'pause' : 'play'} variant="soft" onClick={() => setPlay((p) => !p)}>
              {play ? 'Ferma' : 'Scorri i fold'}
            </Btn>
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Scorri tutti i fold: ogni esempio finisce in validazione esattamente una volta.', done: fold.visited.length >= Math.min(k, 4) },
          { label: 'Prova leave-one-out: k = l, ogni fold contiene un solo esempio (e il costo sale).', done: seen.loo },
          { label: 'Scegli il grado M con l’errore di CV più basso: è una model selection.', done: seen.sel },
        ]}
      />
    </div>
  )
}
