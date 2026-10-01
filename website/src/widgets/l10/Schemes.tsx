import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Dot, FnPath, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { polyval } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'
import { ALL, DATA, THETAS, argmin, avg, cvErrors, fit, foldsOf, pick, remp, shuffled, std } from './cv'

/* ------------------------------------------------------------------ mattoni comuni */

type Role = 'tr' | 'vl' | 'ts' | 'in' | 'gap' | 'fold'

function Seg({
  role,
  grow = 1,
  children,
  on,
  onClick,
}: {
  role: Role
  grow?: number
  children?: ReactNode
  on?: boolean
  onClick?: () => void
}) {
  const cls = `cv10__seg cv10__seg--${role}${on ? ' is-on' : ''}`
  if (onClick)
    return (
      <button type="button" className={cls} style={{ flexGrow: grow }} onClick={onClick}>
        {children && <span>{children}</span>}
      </button>
    )
  return (
    <span className={cls} style={{ flexGrow: grow }}>
      {children && <span>{children}</span>}
    </span>
  )
}

/** Unisce i blocchi adiacenti con lo stesso ruolo (TR TR → un solo TR largo il doppio). */
function merge(roles: Role[]) {
  const out: { role: Role; grow: number; first: number }[] = []
  roles.forEach((r, i) => {
    const last = out[out.length - 1]
    if (last && last.role === r && r === 'tr') last.grow += 1
    else out.push({ role: r, grow: 1, first: i })
  })
  return out
}

const D = (k: number | string) => <Tex>{`D_{${k}}`}</Tex>
const Dbar = (k: number | string) => <Tex>{`\\bar D_{${k}}`}</Tex>
const errFmt = (e: number) => (e > 5 ? '> 5' : fmt(e, 2))

const LEG_TR = { label: 'training', color: 'var(--c-blue)', kind: 'dot' as const }
const LEG_VL = { label: tx('validazione', 'validation'), color: 'var(--c-orange)', kind: 'dot' as const }
const LEG_TS = { label: 'test', color: 'var(--c-green)', kind: 'dot' as const }
const LEG_H = { label: tx('modello', 'model'), color: 'var(--c-red)' }

function Fit({ w, tr, vl = [], ts = [] }: { w: number[] | null; tr: number[]; vl?: number[]; ts?: number[] }) {
  return (
    <Plot xDomain={[0, 1]} yDomain={[-1.8, 1.8]} aspect={0.62}>
      <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="t" />
      {w && <FnPath f={(x) => polyval(w, x)} color="var(--c-red)" width={2.2} samples={300} />}
      {tr.map((i) => (
        <Dot key={i} x={DATA[i].x} y={DATA[i].t} r={4.5} color="var(--c-blue)" />
      ))}
      {vl.map((i) => (
        <Dot key={i} x={DATA[i].x} y={DATA[i].t} r={5.5} color="var(--c-orange)" />
      ))}
      {ts.map((i) => (
        <Dot key={i} x={DATA[i].x} y={DATA[i].t} r={5.5} color="var(--c-green)" />
      ))}
    </Plot>
  )
}

function DownArrow({ children }: { children?: ReactNode }) {
  return (
    <div className="cv10__down">
      <svg viewBox="0 0 24 30" width="20" height="26" aria-hidden="true">
        <path d="M12 2v24M4 18l8 8 8-8" />
      </svg>
      {children && <span>{children}</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 10.1 */

/** Model selection con K-fold CV, passo per passo: per ogni θ un'intera CV, poi la scelta e il riaddestramento. */
export function CvSelection() {
  const [K, setK] = useState(3)
  const [s, setS] = useState(-1)
  const N = THETAS.length * K
  const CHOOSE = N
  const RETRAIN = N + 1
  const errs = useMemo(() => THETAS.map((M) => cvErrors(ALL, K, M)), [K])
  const means = errs.map(avg)
  const best = argmin(means)
  const F = foldsOf(ALL, K)
  const cur = s >= 0 && s < N ? { m: Math.floor(s / K), k: s % K } : null

  let w: number[] | null = null
  let tr = ALL
  let vl: number[] = []
  if (cur) {
    vl = F[cur.k]
    tr = ALL.filter((i) => !vl.includes(i))
    w = fit(pick(tr), THETAS[cur.m])
  } else if (s === RETRAIN) w = fit(DATA, THETAS[best])

  const seen = useLatch({ oneTheta: s >= K - 1, chosen: s >= CHOOSE, retrained: s === RETRAIN })

  let status: ReactNode
  if (s < 0)
    status = tx(
      <>Premi «Passo»: per ogni valore di θ (il grado M del polinomio) si esegue un’intera K-fold CV.</>,
      <>Press “Step”: for each value of θ (the degree M of the polynomial) a whole K-fold CV is run.</>,
    )
  else if (cur)
    status = tx(
      <>
        θ = M {THETAS[cur.m]}, fold {cur.k + 1} di {K}: training su {Dbar(cur.k + 1)} ({tr.length} punti), stima su {D(cur.k + 1)} (
        {vl.length} punti): <Tex>{'R_{emp}'}</Tex> = {errFmt(errs[cur.m][cur.k])}
      </>,
      <>
        θ = M {THETAS[cur.m]}, fold {cur.k + 1} of {K}: training on {Dbar(cur.k + 1)} ({tr.length} points), estimate on{' '}
        {D(cur.k + 1)} ({vl.length} points): <Tex>{'R_{emp}'}</Tex> = {errFmt(errs[cur.m][cur.k])}
      </>,
    )
  else if (s === CHOOSE)
    status = tx(
      <>
        Scelta: <Tex>{'\\theta^*'}</Tex> = M {THETAS[best]}, la media più bassa su tutte le CV ({fmt(means[best], 3)}).
      </>,
      <>
        Choice: <Tex>{'\\theta^*'}</Tex> = M {THETAS[best]}, the lowest mean over all the CVs ({fmt(means[best], 3)}).
      </>,
    )
  else
    status = tx(
      <>
        Riaddestramento su tutti gli {DATA.length} dati con M = {THETAS[best]}: questo è il modello restituito <Tex>{'h^*(D_l)'}</Tex>.
      </>,
      <>
        Retraining on all {DATA.length} data points with M = {THETAS[best]}: this is the returned model <Tex>{'h^*(D_l)'}</Tex>.
      </>,
    )

  return (
    <div className="cv10">
      <div className="wbar">
        <Segmented
          label={tx(
            <>
              numero di fold <Tex>K</Tex>
            </>,
            <>
              number of folds <Tex>K</Tex>
            </>,
          )}
          value={K}
          onChange={(v) => {
            setK(v)
            setS(-1)
          }}
          options={[
            { value: 3, label: '3' },
            { value: 4, label: '4' },
          ]}
        />
        <div className="cv10__btns">
          <Btn icon="step" variant="soft" onClick={() => setS((v) => Math.min(RETRAIN, v + 1))} disabled={s === RETRAIN}>
            {tx('Passo', 'Step')}
          </Btn>
          <Btn icon="play" variant="ghost" onClick={() => setS(RETRAIN)} disabled={s === RETRAIN}>
            {tx('Fino alla fine', 'Run to the end')}
          </Btn>
          <Btn icon="reset" variant="ghost" onClick={() => setS(-1)} disabled={s < 0}>
            {tx('Ricomincia', 'Restart')}
          </Btn>
        </div>
      </div>
      <div className="verdict verdict--info cv10__status">
        <span>{status}</span>
      </div>

      <div className="wgrid wgrid--even">
        <div className="cv10__rows">
          {F.map((_, row) => (
            <div key={row} className={`cv10__bar${cur?.k === row ? ' is-cur' : ''}`}>
              {F.map((__, b) => (
                <Seg key={b} role={b === row ? 'vl' : 'tr'}>
                  {D(b + 1)}
                </Seg>
              ))}
            </div>
          ))}
          <DownArrow>
            {tx('con', 'with')} <Tex>{'\\theta^*'}</Tex>
          </DownArrow>
          <div className={`cv10__bar${s === RETRAIN ? ' is-cur' : ''}`}>
            <Seg role="tr">{tx('(ri)addestramento su tutti i dati', '(re)training on all the data')}</Seg>
          </div>
        </div>
        <div>
          <Legend items={cur ? [LEG_TR, LEG_VL, LEG_H] : s === RETRAIN ? [LEG_TR, LEG_H] : [LEG_TR]} />
          <Fit w={s === CHOOSE ? null : w} tr={tr} vl={vl} />
        </div>
      </div>

      <div className="cv10__table-wrap">
        <table className="cv10__table">
          <thead>
            <tr>
              <th>
                <Tex>{'\\theta'}</Tex>
              </th>
              {F.map((_, k) => (
                <th key={k}>{D(k + 1)}</th>
              ))}
              <th>{tx('media', 'mean')}</th>
            </tr>
          </thead>
          <tbody>
            {THETAS.map((M, m) => (
              <tr key={M} className={s >= CHOOSE && m === best ? 'is-best' : undefined}>
                <th>M = {M}</th>
                {errs[m].map((e, k) => {
                  const i = m * K + k
                  return (
                    <td key={k} className={i === s ? 'is-cur' : undefined}>
                      {s >= i ? errFmt(e) : '·'}
                    </td>
                  )
                })}
                <td className="cv10__mean">{s >= m * K + K - 1 ? errFmt(means[m]) : '·'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tasks
        items={[
          {
            label: tx(
              'Completa tutti i fold per un valore di θ: la sua stima è la media dei K errori.',
              'Complete all the folds for one value of θ: its estimate is the mean of the K errors.',
            ),
            done: seen.oneTheta,
          },
          {
            label: tx(
              'Arriva alla scelta di θ*: vince la media più bassa, non il singolo fold migliore.',
              'Reach the choice of θ*: the lowest mean wins, not the best single fold.',
            ),
            done: seen.chosen,
          },
          {
            label: tx(
              'Fai l’ultimo passo: il modello restituito è riaddestrato su tutti i dati.',
              'Take the last step: the returned model is retrained on all the data.',
            ),
            done: seen.retrained,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 10.2 */

const KO = 4

function holdoutRows(shuffle: number) {
  return foldsOf(ALL, KO).map((ts, k) => {
    const rest = shuffled(
      ALL.filter((i) => !ts.includes(i)),
      700 + 31 * shuffle + k,
    )
    const vl = rest.slice(0, 6)
    const tr = rest.slice(6)
    const e = THETAS.map((M) => remp(fit(pick(tr), M), pick(vl)))
    const b = argmin(e)
    const w = fit(pick([...tr, ...vl]), THETAS[b])
    // posizione del VL tra i tre quarti non di test (come nella figura: a sinistra, in mezzo o a destra)
    const slot = (shuffle * 2 + k * 5 + 1) % 3
    const others = [0, 1, 2, 3].filter((q) => q !== k)
    const roles: Role[] = [0, 1, 2, 3].map((q) => (q === k ? 'ts' : q === others[slot] ? 'vl' : 'tr'))
    return { ts, tr, vl, b, w, test: remp(w, pick(ts)), roles }
  })
}

/** K-fold CV esterna per il test, con hold-out TR/VL interno per la model selection. */
export function CvHoldout() {
  const [shuffle, setShuffle] = useState(0)
  const [sel, setSel] = useState(0)
  const rows = useMemo(() => holdoutRows(shuffle), [shuffle])
  const r = rows[sel]
  const tests = rows.map((q) => q.test)
  const chosen = rows.map((q) => THETAS[q.b])
  const distinct = new Set(chosen).size
  const seen = useLatch({ other: sel !== 0, shuffled: shuffle >= 1 })
  return (
    <div className="cv10">
      <div className="wbar">
        <Legend items={[LEG_TR, LEG_VL, LEG_TS, LEG_H]} />
        <Btn icon="reset" variant="soft" onClick={() => setShuffle((v) => v + 1)}>
          {tx('Rimescola TR e VL', 'Reshuffle TR and VL')}
        </Btn>
      </div>
      <div className="wgrid wgrid--even">
        <div className="cv10__rows">
          {rows.map((q, k) => (
            <button key={k} type="button" className={`cv10__line${k === sel ? ' is-sel' : ''}`} onClick={() => setSel(k)}>
              <span className="cv10__bar">
                {merge(q.roles).map((g) => (
                  <Seg key={g.first} role={g.role} grow={g.grow}>
                    {g.role === 'ts' ? D(k + 1) : g.role === 'vl' ? 'VL' : 'TR'}
                  </Seg>
                ))}
              </span>
              <span className="cv10__res">
                M = {THETAS[q.b]} · {fmt(q.test, 2)}
              </span>
            </button>
          ))}
          <div className="wnote">
            {tx(
              <>In ogni riga: M scelto sul VL, poi errore di test su {D('k')} del modello riaddestrato su TR e VL.</>,
              <>In each row: M chosen on the VL, then test error on {D('k')} of the model retrained on TR and VL.</>,
            )}
          </div>
        </div>
        <Fit w={r.w} tr={r.tr} vl={r.vl} ts={r.ts} />
      </div>
      <div className="readouts">
        <Readout
          label={tx('stima del rischio (media ± dev. std. sui fold)', 'risk estimate (mean ± std. dev. over the folds)')}
          tone="accent"
          value={`${fmt(avg(tests), 3)} ± ${fmt(std(tests), 3)}`}
        />
        <Readout
          label={tx('M scelto nelle quattro righe', 'M chosen in the four rows')}
          value={chosen.join(', ')}
          sub={distinct > 1 ? tx(`${distinct} modelli diversi`, `${distinct} different models`) : tx('stavolta lo stesso M', 'this time the same M')}
        />
      </div>
      <div className={`verdict ${distinct > 1 ? 'verdict--warn' : 'verdict--info'}`}>
        <span>
          {distinct > 1
            ? tx(
                'Righe diverse scelgono modelli diversi: nessun modello finale, solo una stima del rischio della classe di modelli.',
                'Different rows choose different models: no final model, only an estimate of the risk of the class of models.',
              )
            : tx(
                'Anche se stavolta ogni riga sceglie lo stesso M, nulla lo garantisce: la procedura stima il rischio della classe di modelli.',
                'Even though this time every row chooses the same M, nothing guarantees it: the procedure estimates the risk of the class of models.',
              )}
        </span>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca un’altra riga: il fold di test (verde) cambia, e con lui TR, VL e il modello.',
              'Click another row: the test fold (green) changes, and with it TR, VL and the model.',
            ),
            done: seen.other,
          },
          {
            label: tx(
              'Rimescola TR e VL: la divisione è arbitraria e il modello scelto in una riga può cambiare.',
              'Reshuffle TR and VL: the split is arbitrary and the model chosen in a row can change.',
            ),
            done: seen.shuffled,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 10.3 */

/** Double (nested) K-fold CV: per ogni fold esterno, una K-fold CV interna sceglie M. */
export function DoubleCv() {
  const [Ki, setKi] = useState(3)
  const [sel, setSel] = useState(0)
  const [visited, setVisited] = useState([0])
  const outer = useMemo(
    () =>
      foldsOf(ALL, KO).map((ts) => {
        const tr = ALL.filter((i) => !ts.includes(i))
        const ce = THETAS.map((M) => avg(cvErrors(tr, Ki, M)))
        const b = argmin(ce)
        const w = fit(pick(tr), THETAS[b])
        return { ts, tr, ce, b, test: remp(w, pick(ts)) }
      }),
    [Ki],
  )
  const o = outer[sel]
  const tests = outer.map((q) => q.test)
  const chosen = outer.map((q) => THETAS[q.b])
  const cmax = Math.max(...o.ce.filter((v) => v < 5), 0.5)
  const seen = useLatch({ all: visited.length === KO, ki: Ki !== 3 })
  return (
    <div className="cv10">
      <div className="wbar">
        <Segmented
          label={tx(
            <>
              fold interni <Tex>{"K'"}</Tex>
            </>,
            <>
              inner folds <Tex>{"K'"}</Tex>
            </>,
          )}
          value={Ki}
          onChange={setKi}
          options={[
            { value: 3, label: '3' },
            { value: 4, label: '4' },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div className="cv10__rows">
          <div className="wpanel__title">{tx('Ciclo esterno: stima del rischio', 'Outer loop: risk estimation')}</div>
          {outer.map((q, k) => (
            <button
              key={k}
              type="button"
              className={`cv10__line${k === sel ? ' is-sel' : ''}`}
              onClick={() => {
                setSel(k)
                setVisited((v) => (v.includes(k) ? v : [...v, k]))
              }}
            >
              <span className="cv10__bar">
                {[0, 1, 2, 3].map((b) => (
                  <Seg key={b} role={b === k ? 'ts' : 'tr'}>
                    {b === k ? D(k + 1) : null}
                  </Seg>
                ))}
              </span>
              <span className="cv10__res">
                M = {THETAS[q.b]} · {fmt(q.test, 2)}
              </span>
            </button>
          ))}
          <div className="readouts">
            <Readout
              label={tx('stima del rischio della classe', 'risk estimate of the class')}
              tone="accent"
              value={`${fmt(avg(tests), 3)} ± ${fmt(std(tests), 3)}`}
            />
            <Readout label={tx('M scelto per fold', 'M chosen per fold')} value={chosen.join(', ')} />
          </div>
        </div>
        <div className="wpanel cv10__inner">
          <div className="wpanel__title">
            {tx(
              <>
                Ciclo interno sullo split {sel + 1}: K-fold CV su {Dbar(sel + 1)}
              </>,
              <>
                Inner loop on split {sel + 1}: K-fold CV on {Dbar(sel + 1)}
              </>,
            )}
          </div>
          <div className="cv10__rows cv10__rows--sm">
            {Array.from({ length: Ki }, (_, row) => (
              <div key={row} className="cv10__bar">
                {Array.from({ length: Ki }, (__, b) => (
                  <Seg key={b} role={b === row ? 'vl' : 'tr'} />
                ))}
              </div>
            ))}
          </div>
          <div className="cv10__byM">
            {THETAS.map((M, m) => (
              <div key={M} className={`cv10__mrow${m === o.b ? ' is-on' : ''}`}>
                <span>M = {M}</span>
                <span className="cv10__mbar">
                  <span style={{ width: `${Math.min(100, (o.ce[m] / cmax) * 100)}%` }} />
                </span>
                <span className="cv10__mval">{errFmt(o.ce[m])}</span>
              </div>
            ))}
          </div>
          <div className="wnote">
            {tx(
              <>
                Errore medio di validazione della CV interna. Vince M = {THETAS[o.b]}: si riaddestra su {Dbar(sel + 1)} e si testa su{' '}
                {D(sel + 1)}, errore {fmt(o.test, 3)}.
              </>,
              <>
                Mean validation error of the inner CV. M = {THETAS[o.b]} wins: the model is retrained on {Dbar(sel + 1)} and tested on{' '}
                {D(sel + 1)}, error {fmt(o.test, 3)}.
              </>,
            )}
          </div>
        </div>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca tutti e quattro gli split esterni: ognuno fa la propria model selection.',
              'Click all four outer splits: each one performs its own model selection.',
            ),
            done: seen.all,
          },
          {
            label: tx(
              <>
                Cambia <Tex>{"K'"}</Tex>: i fold interni possono essere diversi da quelli esterni.
              </>,
              <>
                Change <Tex>{"K'"}</Tex>: the inner folds can differ from the outer ones.
              </>,
            ),
            done: seen.ki,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 10.4 */

type Info = 'ots' | 'otr' | 'itr' | 'ivl' | null

const INFO: Record<Exclude<Info, null>, string> = {
  ots: tx(
    'Test del resampling esterno: serve solo a stimare le prestazioni, dopo che gli iperparametri sono stati regolati.',
    'Test of the outer resampling: it serves only to estimate the performance, after the hyperparameters have been tuned.',
  ),
  otr: tx(
    'Training del resampling esterno: al suo interno il resampling interno regola gli iperparametri; con quelli si riaddestra su tutto il blocco.',
    'Training of the outer resampling: inside it the inner resampling tunes the hyperparameters; with those, the model is retrained on the whole block.',
  ),
  itr: tx(
    'Training del resampling interno: qui si addestra ogni configurazione di iperparametri.',
    'Training of the inner resampling: every hyperparameter configuration is trained here.',
  ),
  ivl: tx(
    'Il «test set» del resampling interno è in realtà un validation set: serve a scegliere gli iperparametri, non a stimare il rischio.',
    'The “test set” of the inner resampling is actually a validation set: it serves to choose the hyperparameters, not to estimate the risk.',
  ),
}

/** Vista alternativa: resampling esterno (stima) e interno (regolazione), 3 split esterni su 6 blocchi. */
export function NestedResampling() {
  const [open, setOpen] = useState(0)
  const [info, setInfo] = useState<Info>(null)
  const seen = useLatch({ ivl: info === 'ivl', other: open !== 0 })
  const testOf = (k: number) => [4 - 2 * k, 5 - 2 * k]
  return (
    <div className="nr10">
      <div className="wbar">
        <Legend
          items={[
            { label: tx('training esterno', 'outer training'), color: 'var(--split-tr)', kind: 'square' },
            { label: tx('test esterno', 'outer test'), color: 'var(--split-ts)', kind: 'square' },
            { label: tx('training interno', 'inner training'), color: 'var(--nr10-in)', kind: 'square' },
            {
              label: tx(
                <>
                  <s>test interno</s> validation set
                </>,
                <>
                  <s>inner test</s> validation set
                </>,
              ),
              color: 'var(--split-vl)',
              kind: 'square',
            },
          ]}
        />
      </div>
      <div className="nr10__head">
        <span>
          {tx(
            <>
              <b>Resampling esterno</b> (barre alte): stima le prestazioni
            </>,
            <>
              <b>Outer resampling</b> (tall bars): estimates the performance
            </>,
          )}
        </span>
        <span>
          {tx(
            <>
              <b>Resampling interno</b> (barre sottili): regola gli iperparametri
            </>,
            <>
              <b>Inner resampling</b> (thin bars): tunes the hyperparameters
            </>,
          )}
        </span>
      </div>
      <div className="nr10__grid">
        <div className="nr10__splits">
          {[0, 1, 2].map((k) => {
            const ts = testOf(k)
            const trb = [0, 1, 2, 3, 4, 5].filter((b) => !ts.includes(b))
            return (
              <div key={k} className={`nr10__split${open === k ? ' is-open' : ''}`}>
                <div className="nr10__outer">
                  <span className="cv10__bar">
                    {[0, 1, 2, 3, 4, 5].map((b) => (
                      <Seg
                        key={b}
                        role={ts.includes(b) ? 'ts' : 'tr'}
                        on={info === (ts.includes(b) ? 'ots' : 'otr') && open === k}
                        onClick={() => {
                          setOpen(k)
                          setInfo(ts.includes(b) ? 'ots' : 'otr')
                        }}
                      />
                    ))}
                  </span>
                  <span className="nr10__use">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M18 6a8 8 0 1 1-9.5-1.5M8.5 4.5l-1 4 4 .5" />
                    </svg>
                    {tx('usa i parametri regolati', 'uses the tuned parameters')}
                  </span>
                </div>
                {open === k ? (
                  <div className="nr10__inner">
                    {trb.map((_, row) => (
                      <span key={row} className="cv10__bar cv10__bar--thin">
                        {[0, 1, 2, 3, 4, 5].map((b) =>
                          ts.includes(b) ? (
                            <Seg key={b} role="gap" />
                          ) : (
                            <Seg
                              key={b}
                              role={b === trb[trb.length - 1 - row] ? 'vl' : 'in'}
                              on={info === (b === trb[trb.length - 1 - row] ? 'ivl' : 'itr')}
                              onClick={() => setInfo(b === trb[trb.length - 1 - row] ? 'ivl' : 'itr')}
                            />
                          ),
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button type="button" className="nr10__more" onClick={() => setOpen(k)}>
                    {tx('mostra il resampling interno', 'show the inner resampling')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="verdict verdict--info">{info ? INFO[info] : tx('Clicca un blocco per vederne il ruolo.', 'Click a block to see its role.')}</div>
      <Tasks
        items={[
          {
            label: tx(
              'Clicca un blocco giallo del resampling interno: che cosa fa davvero?',
              'Click a yellow block of the inner resampling: what does it really do?',
            ),
            done: seen.ivl,
          },
          {
            label: tx(
              'Apri il resampling interno di un altro split esterno: usa solo i suoi dati di training.',
              'Open the inner resampling of another outer split: it uses only its own training data.',
            ),
            done: seen.other,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 10.5 */

const NCONF = 9

/** Nested CV come diagramma di flusso, con selezione interna per hold-out o per K-fold CV. */
export function NestedFlow() {
  const [mode, setMode] = useState<'ho' | 'cv'>('cv')
  const [kout, setKout] = useState(5)
  const [kinn, setKinn] = useState(4)
  const [sel, setSel] = useState<number | 'last'>('last')
  const shownOut = kout <= 4 ? Array.from({ length: kout }, (_, i) => i) : [0, 1, -1, kout - 1]
  const shownIn = kinn <= 4 ? Array.from({ length: kinn }, (_, i) => i) : [0, 1, -1, kinn - 1]
  const perSel = NCONF * (mode === 'ho' ? 1 : kinn) + 1
  const seen = useLatch({ ho: mode === 'ho', row: sel !== 'last' })
  const selRow = sel === 'last' ? kout - 1 : sel
  const outFold = (i: number) =>
    i === kout - 1 ? (
      <Tex>{'\\text{fold}_{k_{out}}'}</Tex>
    ) : (
      <>
        fold<sub>{i + 1}</sub>
      </>
    )
  const inFold = (i: number) =>
    i === kinn - 1 ? (
      <Tex>{'\\text{fold}_{k_{inn}}'}</Tex>
    ) : (
      <>
        fold<sub>{i + 1}</sub>
      </>
    )
  return (
    <div className="nf10">
      <div className="wbar">
        <Segmented
          label={tx('model selection interna', 'inner model selection')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ho', label: 'hold-out' },
            { value: 'cv', label: tx('K-fold CV interna', 'inner K-fold CV') },
          ]}
        />
      </div>
      <div className="nf10__ctl">
        <Slider
          label={<Tex>{'k_{out}'}</Tex>}
          min={3}
          max={10}
          step={1}
          value={kout}
          onChange={setKout}
          format={(v) => String(v)}
          width={200}
        />
        {mode === 'cv' && (
          <Slider
            label={<Tex>{'k_{inn}'}</Tex>}
            min={3}
            max={10}
            step={1}
            value={kinn}
            onChange={setKinn}
            format={(v) => String(v)}
            width={200}
          />
        )}
      </div>

      <div className="nf10__flow">
        <div className="nf10__box nf10__box--data">Dataset</div>
        <DownArrow>split</DownArrow>
        <div className="cv10__bar nf10__folds">
          {shownOut.map((i) => (
            <Seg key={i} role="fold">
              {i < 0 ? '…' : outFold(i)}
            </Seg>
          ))}
        </div>
        <div className="nf10__rep">
          <div className="nf10__rows">
            {shownOut.map((i) =>
              i < 0 ? (
                <div key="dots" className="nf10__dots">
                  ⋮
                </div>
              ) : (
                <button
                  key={i}
                  type="button"
                  className={`cv10__bar nf10__row${i === selRow ? ' is-sel' : ''}`}
                  onClick={() => setSel(i === kout - 1 ? 'last' : i)}
                >
                  {shownOut.map((j) =>
                    j === i ? (
                      <Seg key={j} role="ts">
                        Test
                      </Seg>
                    ) : (
                      <Seg key={j} role="tr" />
                    ),
                  )}
                </button>
              ),
            )}
          </div>
          <div className="nf10__note">
            <span>
              {tx(
                <>
                  ripeti <Tex>{'k_{out}'}</Tex> volte
                </>,
                <>
                  repeat <Tex>{'k_{out}'}</Tex> times
                </>,
              )}
            </span>
            <b>Model assessment</b>
            <span>{tx('media dei risultati di test', 'mean of the test results')}</span>
          </div>
        </div>
        <DownArrow>
          <b>Model selection</b>: {tx('trova i migliori iperparametri', 'find the best hyperparameters')}
        </DownArrow>
        <div className="cv10__bar nf10__trout">
          <Seg role="tr">
            <Tex>{'\\text{Train}_{out}'}</Tex> ={' '}
            {tx(`dataset della selezione (riga ${selRow + 1})`, `selection dataset (row ${selRow + 1})`)}
          </Seg>
        </div>
        <div className="nf10__branches">
          <div className={`nf10__branch${mode === 'ho' ? ' is-on' : ''}`}>
            <div className="nf10__bname">hold-out</div>
            <div className="cv10__bar">
              <Seg role="tr" grow={3}>
                <Tex>{'\\text{Train}_{inn}'}</Tex>
              </Seg>
              <Seg role="vl">Valid.</Seg>
            </div>
            <div className="wnote">
              {tx(
                'sceglie gli iperparametri secondo la prestazione di validazione',
                'chooses the hyperparameters according to the validation performance',
              )}
            </div>
          </div>
          <div className="nf10__or">{tx('oppure', 'or')}</div>
          <div className={`nf10__branch${mode === 'cv' ? ' is-on' : ''}`}>
            <div className="nf10__bname">{tx('K-fold CV interna', 'inner K-fold CV')}</div>
            <div className="cv10__bar">
              {shownIn.map((i) => (
                <Seg key={i} role="fold">
                  {i < 0 ? '…' : inFold(i)}
                </Seg>
              ))}
            </div>
            <div className="nf10__rows nf10__rows--in">
              {shownIn.map((i) =>
                i < 0 ? (
                  <div key="dots" className="nf10__dots">
                    ⋮
                  </div>
                ) : (
                  <div key={i} className="cv10__bar cv10__bar--thin">
                    {shownIn.map((j) => (
                      <Seg key={j} role={j === i ? 'vl' : 'tr'} />
                    ))}
                  </div>
                ),
              )}
            </div>
            <div className="wnote">
              {tx(
                <>
                  ripeti <Tex>{'k_{inn}'}</Tex> volte; sceglie secondo la <b>media</b> di validazione
                </>,
                <>
                  repeat <Tex>{'k_{inn}'}</Tex> times; chooses according to the validation <b>mean</b>
                </>,
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="readouts">
        <Readout
          label={tx(
            `addestramenti per ogni riga esterna (${NCONF} configurazioni)`,
            `training runs for each outer row (${NCONF} configurations)`,
          )}
          value={String(perSel)}
          sub={
            mode === 'ho'
              ? tx(`${NCONF} + 1 riaddestramento`, `${NCONF} + 1 retraining`)
              : tx(`${NCONF} × ${kinn} + 1 riaddestramento`, `${NCONF} × ${kinn} + 1 retraining`)
          }
        />
        <Readout
          label={tx('addestramenti in tutto', 'training runs in total')}
          tone="accent"
          value={String(kout * perSel)}
          sub={tx(`${kout} righe esterne`, `${kout} outer rows`)}
        />
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Passa alla selezione interna con hold-out: costa meno, ma dipende da una sola divisione.',
              'Switch to the inner selection with hold-out: it costs less, but it depends on a single split.',
            ),
            done: seen.ho,
          },
          {
            label: tx(
              <>
                Clicca un’altra riga esterna: la model selection si ripete con il suo <Tex>{'\\text{Train}_{out}'}</Tex>.
              </>,
              <>
                Click another outer row: the model selection is repeated with its own <Tex>{'\\text{Train}_{out}'}</Tex>.
              </>,
            ),
            done: seen.row,
          },
        ]}
      />
    </div>
  )
}
