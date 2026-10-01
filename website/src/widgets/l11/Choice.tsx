import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Dot, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Segmented, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ tabella comune */

type Row = { name: ReactNode; tr: number; cv: number; trLabel?: string; cvLabel?: string }

function Table({ head, cvHead, rows, chosen }: { head: ReactNode; cvHead: ReactNode; rows: Row[]; chosen: number }) {
  const max = Math.max(...rows.flatMap((r) => [r.tr, r.cv]))
  return (
    <div className="ch11__wrap">
      <table className="ch11">
        <thead>
          <tr>
            <th>{head}</th>
            <th>training</th>
            <th>{cvHead}</th>
            <th>{tx('scelta', 'choice')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i === chosen ? 'is-chosen' : undefined}>
              <th>{r.name}</th>
              <td>
                <span className="ch11__cell">
                  <span className="ch11__bar ch11__bar--tr" style={{ width: `${(r.tr / max) * (r.trLabel ? 58 : 100)}%` }} />
                  {r.trLabel && <span className="ch11__val">{r.trLabel}</span>}
                </span>
              </td>
              <td>
                <span className="ch11__cell">
                  <span className="ch11__bar ch11__bar--cv" style={{ width: `${(r.cv / max) * (r.cvLabel ? 58 : 100)}%` }} />
                  {r.cvLabel && <span className="ch11__val">{r.cvLabel}</span>}
                </span>
              </td>
              <td className="ch11__pick">{i === chosen ? <span className="ch11__mark">{tx('scelto', 'chosen')}</span> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const argmin = (v: number[]) => v.indexOf(Math.min(...v))

/** Tabelle 11.1 e 11.2: valori letti dalle figure delle slide (scala arbitraria), scelta con un criterio. */
function CriterionTable({ rows, head, what }: { rows: Row[]; head: ReactNode; what: string }) {
  const [crit, setCrit] = useState<'cv' | 'tr'>('cv')
  const iCv = argmin(rows.map((r) => r.cv))
  const iTr = argmin(rows.map((r) => r.tr))
  const chosen = crit === 'cv' ? iCv : iTr
  const seen = useLatch({ tr: crit === 'tr' })
  return (
    <div>
      <div className="wbar">
        <Segmented
          label={tx('scegli in base a', 'choose by')}
          value={crit}
          onChange={setCrit}
          options={[
            { value: 'cv', label: tx('errore di 10-fold CV', '10-fold CV error') },
            { value: 'tr', label: tx('errore di training', 'training error') },
          ]}
        />
        <Legend
          items={[
            { label: tx('errore di training', 'training error'), color: 'var(--c-blue)', kind: 'square' },
            { label: tx('errore di validazione (10-fold CV)', 'validation error (10-fold CV)'), color: 'var(--c-orange)', kind: 'square' },
          ]}
        />
      </div>
      <Table head={head} cvHead="10-fold CV" rows={rows} chosen={chosen} />
      {crit === 'cv' ? (
        <div className="verdict verdict--good">
          {tx(
            <span>
              Scelta corretta: {rows[iCv].name}, il miglior errore di validazione. Si riaddestra {what} su tutti i dati.
            </span>,
            <span>
              Correct choice: {rows[iCv].name}, the best validation error. Retrain {what} on all the data.
            </span>,
          )}
        </div>
      ) : (
        <div className="verdict verdict--bad">
          {tx(
            <span>
              Con l’errore di training vince {rows[iTr].name}, che si adatta di più ai dati di training, ma il suo errore di CV è{' '}
              {fmt(rows[iTr].cv / rows[iCv].cv, 1)} volte quello di {rows[iCv].name}: l’errore di training non dice come andrà sui dati nuovi.
            </span>,
            <span>
              With the training error {rows[iTr].name} wins, since it fits the training data more closely, but its CV error is{' '}
              {fmt(rows[iTr].cv / rows[iCv].cv, 1)} times that of {rows[iCv].name}: the training error does not tell how the model will do on new data.
            </span>,
          )}
        </div>
      )}
      <Tasks
        items={[
          {
            label: tx(
              'Scegli in base all’errore di training: quale riga vince, e com’è il suo errore di validazione?',
              'Choose by the training error: which row wins, and what is its validation error like?',
            ),
            done: seen.tr,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 11.1 */

const F = (i: number) => <Tex>{`f_${i}`}</Tex>

export function ModelsTable() {
  const tr = [155, 115, 90, 40, 27, 13]
  const cv = [295, 117, 90, 142, 180, 219]
  const rows = tr.map((t, i) => ({ name: F(i + 1), tr: t, cv: cv[i] }))
  return <CriterionTable rows={rows} head={tx('modello', 'model')} what={tx('il modello', 'the model')} />
}

/* ------------------------------------------------------------------ Fig. 11.2 */

export function UnitsTable() {
  const tr = [160, 120, 93, 38, 25, 12]
  const cv = [312, 122, 93, 148, 190, 230]
  const rows = tr.map((t, i) => ({ name: tx(`${i} unità`, i === 1 ? '1 unit' : `${i} units`), tr: t, cv: cv[i] }))
  return <CriterionTable rows={rows} head={tx('rete con', 'network')} what={tx('la rete', 'the network')} />
}

/* ------------------------------------------------------------------ Fig. 11.3 */

/**
 * K-NN per la regressione su 40 punti (sin 2πx con rumore): errore di training (il punto stesso è tra i
 * vicini, quindi K = 1 dà zero) ed errore di leave-one-out (il punto è tolto), calcolati davvero.
 */
const PTS = (() => {
  const r = rng(1217)
  const n = 40
  const xs = Array.from({ length: n }, (_, i) => (i + 0.1 + 0.8 * r()) / n)
  return xs.map((x) => ({ x, t: Math.sin(2 * Math.PI * x) + 0.45 * gauss(r) }))
})()

function knn(x: number, K: number, skip: number) {
  const d = PTS.map((p, i) => ({ i, d: Math.abs(p.x - x) }))
    .filter((q) => q.i !== skip)
    .sort((a, b) => a.d - b.d || a.i - b.i)
  return d.slice(0, K).reduce((s, q) => s + PTS[q.i].t, 0) / K
}
const KMAX = 20
const ERR = Array.from({ length: KMAX }, (_, j) => {
  const K = j + 1
  return {
    K,
    tr: PTS.reduce((s, p) => s + (p.t - knn(p.x, K, -1)) ** 2, 0) / PTS.length,
    loo: PTS.reduce((s, p, i) => s + (p.t - knn(p.x, K, i)) ** 2, 0) / PTS.length,
  }
})

export function KnnLoo() {
  const [vals, setVals] = useState<'lin' | 'exp'>('lin')
  const [all, setAll] = useState(false)
  const tried = vals === 'lin' ? [1, 2, 3, 4, 5, 6] : [1, 2, 4, 8, 16]
  const rows = useMemo(
    () =>
      tried.map((K) => {
        const e = ERR[K - 1]
        return { name: `K = ${K}`, tr: e.tr, cv: e.loo, trLabel: fmt(e.tr, 3), cvLabel: fmt(e.loo, 3) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vals],
  )
  const chosen = argmin(rows.map((r) => r.cv))
  const Kc = tried[chosen]
  const gBest = ERR.reduce((a, b) => (b.loo < a.loo ? b : a))
  const seen = useLatch({ exp: vals === 'exp', all })
  return (
    <div>
      <div className="wbar">
        <Segmented
          label={tx(
            <>
              valori di <Tex>K</Tex> provati
            </>,
            <>
              values of <Tex>K</Tex> tried
            </>,
          )}
          value={vals}
          onChange={setVals}
          options={[
            { value: 'lin', label: '1, 2, …, 6' },
            { value: 'exp', label: '1, 2, 4, 8, 16' },
          ]}
        />
        <Legend
          items={[
            { label: tx('errore di training', 'training error'), color: 'var(--c-blue)', kind: 'square' },
            { label: tx('errore di leave-one-out', 'leave-one-out error'), color: 'var(--c-orange)', kind: 'square' },
          ]}
        />
      </div>
      <Table head="K-NN" cvHead="leave-one-out" rows={rows} chosen={chosen} />
      <div className="wgrid">
        <Plot xDomain={[0.5, KMAX + 0.5]} yDomain={[0, 0.4]} aspect={0.42} margin={{ b: 40 }}>
          <Axes
            xTicks={[1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
            yTicks={[0, 0.1, 0.2, 0.3, 0.4]}
            yFormat={(v) => fmt(v, 1)}
            xLabel="K"
            yLabel={tx('errore di leave-one-out', 'leave-one-out error')}
          />
          {all && <Polyline pts={ERR.map((e) => ({ x: e.K, y: e.loo }))} color="var(--c-orange)" width={2} />}
          {tried.map((K) => (
            <Dot key={K} x={K} y={ERR[K - 1].loo} r={K === Kc ? 6.5 : 4.5} color={K === Kc ? 'var(--accent)' : 'var(--c-orange)'} />
          ))}
        </Plot>
        <div className="wside">
          <Toggle
            label={tx(
              <>
                mostra tutti i <Tex>K</Tex> da 1 a 20
              </>,
              <>
                show all <Tex>K</Tex> from 1 to 20
              </>,
            )}
            checked={all}
            onChange={setAll}
          />
          <div className="wnote">
            {tx(`Scelto K = ${Kc} tra i valori provati.`, `K = ${Kc} chosen among the values tried.`)}{' '}
            {all &&
              (gBest.K === Kc
                ? tx('È anche il minimo su tutti i K da 1 a 20.', 'It is also the minimum over all K from 1 to 20.')
                : tx(
                    `Su tutti i K da 1 a 20 il minimo è a K = ${gBest.K}: l’ottimo trovato era solo locale.`,
                    `Over all K from 1 to 20 the minimum is at K = ${gBest.K}: the optimum found was only local.`,
                  ))}
          </div>
          <div className="wnote">
            {tx(
              `Per il K-NN la leave-one-out costa ${PTS.length} predizioni per ogni K: non c’è un modello da addestrare.`,
              `For K-NN, leave-one-out costs ${PTS.length} predictions for each K: there is no model to train.`,
            )}
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Prova i valori a crescita esponenziale: trovano un K diverso?',
              'Try the exponentially growing values: do they find a different K?',
            ),
            done: seen.exp,
          },
          {
            label: tx(
              'Mostra tutti i K da 1 a 20: la relazione tra K ed errore è irregolare.',
              'Show all K from 1 to 20: the relationship between K and the error is irregular.',
            ),
            done: seen.all,
          },
        ]}
      />
    </div>
  )
}
