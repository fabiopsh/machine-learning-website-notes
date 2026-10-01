import { useMemo, useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, normPdf, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/**
 * Un classificatore binario che assegna un punteggio a ogni esempio:
 * sopra la soglia dice "positivo". Da soglia e punteggi nascono la matrice
 * di confusione, le misure di accuratezza e, al variare della soglia, la curva ROC.
 */

const N = 400

function sample(sep: number, prev: number) {
  const r = rng(9)
  const nPos = Math.round(N * prev)
  const pos = Array.from({ length: nPos }, () => sep / 2 + gauss(r))
  const neg = Array.from({ length: N - nPos }, () => -sep / 2 + gauss(r))
  return { pos, neg }
}

function counts(pos: number[], neg: number[], t: number) {
  const TP = pos.filter((s) => s >= t).length
  const FN = pos.length - TP
  const FP = neg.filter((s) => s >= t).length
  const TN = neg.length - FP
  return { TP, FN, FP, TN }
}

function rocCurve(pos: number[], neg: number[]) {
  const all = [...pos.map((s) => ({ s, y: 1 })), ...neg.map((s) => ({ s, y: 0 }))].sort((a, b) => b.s - a.s)
  const P = pos.length || 1
  const Nn = neg.length || 1
  const pts = [{ x: 0, y: 0 }]
  let tp = 0
  let fp = 0
  for (const e of all) {
    if (e.y) tp++
    else fp++
    pts.push({ x: fp / Nn, y: tp / P })
  }
  let auc = 0
  for (let i = 1; i < pts.length; i++) auc += (pts[i].x - pts[i - 1].x) * (pts[i].y + pts[i - 1].y) * 0.5
  return { pts, auc }
}

const pctS = (v: number) => (Number.isFinite(v) ? `${fmt(v * 100, 1)}%` : '—')

export function ConfusionROC() {
  const [sep, setSep] = useState(2)
  const [bal, setBal] = useState<'bal' | 'imb'>('bal')
  const [t, setT] = useState(0.3)
  const prev = bal === 'bal' ? 0.5 : 0.99
  const { pos, neg } = useMemo(() => sample(sep, prev), [sep, prev])
  const c = counts(pos, neg, t)
  const total = N
  const acc = (c.TP + c.TN) / total
  const sens = c.TP / (c.TP + c.FN)
  const spec = c.TN / (c.FP + c.TN)
  const prec = c.TP / (c.TP + c.FP)
  const fpr = 1 - spec
  const roc = useMemo(() => rocCurve(pos, neg), [pos, neg])

  const seen = useLatch({ random: sep < 0.15, perfect: sep > 3.6, trivial: bal === 'imb' && c.FN === 0 && c.TN === 0 })

  const dx: [number, number] = [-5, 5]

  return (
    <div className="croc">
      <div className="wbar">
        <Legend
          items={[
            { label: tx('punteggi dei positivi reali', 'scores of the actual positives'), color: 'var(--c-blue)', kind: 'area' },
            { label: tx('punteggi dei negativi reali', 'scores of the actual negatives'), color: 'var(--c-orange)', kind: 'area' },
          ]}
        />
        <Segmented
          size="sm"
          value={bal}
          onChange={setBal}
          options={[
            { value: 'bal', label: tx('classi bilanciate', 'balanced classes') },
            { value: 'imb', label: tx('99% positivi', '99% positives') },
          ]}
        />
      </div>

      <Plot xDomain={dx} yDomain={[0, 0.45]} aspect={0.3} minH={170} maxH={240} margin={{ l: 14, r: 14, t: 10, b: 30 }}>
        <Axes xTicks={[-4, -2, 0, 2, 4]} yTicks={[]} hideY xLabel={tx('punteggio del classificatore', 'classifier score')} />
        <Area f={(v) => normPdf(v, -sep / 2) * (bal === 'bal' ? 1 : 0.35)} color="var(--c-orange)" from={t} />
        <Area f={(v) => normPdf(v, sep / 2)} color="var(--c-blue)" from={t} />
        <FnPath f={(v) => normPdf(v, -sep / 2) * (bal === 'bal' ? 1 : 0.35)} color="var(--c-orange)" width={2} />
        <FnPath f={(v) => normPdf(v, sep / 2)} color="var(--c-blue)" width={2} />
        <Polyline
          pts={[
            { x: t, y: 0 },
            { x: t, y: 0.45 },
          ]}
          color="var(--ink-2)"
          width={1.4}
          dash="4 3"
        />
        <Label x={t} y={0.42} dx={6} className="plot-label--strong">
          {tx('soglia → «positivo»', 'threshold → “positive”')}
        </Label>
        <Handle x={Math.max(dx[0], Math.min(dx[1], t))} y={0} axis="x" label={tx('soglia di decisione', 'decision threshold')} onMove={(p) => setT(p.x)} />
      </Plot>
      {bal === 'imb' && (
        <p className="wnote">
          {tx(
            'Con il 99% di positivi i negativi sono pochissimi: la loro curva è disegnata più bassa, in proporzione.',
            'With 99% positives the negatives are very few: their curve is drawn lower, in proportion.',
          )}
        </p>
      )}

      <div className="croc__grid">
        <div className="croc__left">
          <table className="cm">
            <thead>
              <tr>
                <th className="cm__corner">{tx('reale \\ predetto', 'actual \\ predicted')}</th>
                <th>{tx('positivo', 'positive')}</th>
                <th>{tx('negativo', 'negative')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{tx('positivo', 'positive')}</th>
                <td className="cm__cell cm__cell--good">
                  <span className="cm__n">{c.TP}</span>
                  <span className="cm__k">{tx('TP · veri positivi', 'TP · true positives')}</span>
                </td>
                <td className="cm__cell cm__cell--bad">
                  <span className="cm__n">{c.FN}</span>
                  <span className="cm__k">{tx('FN · falsi negativi', 'FN · false negatives')}</span>
                </td>
              </tr>
              <tr>
                <th>{tx('negativo', 'negative')}</th>
                <td className="cm__cell cm__cell--bad">
                  <span className="cm__n">{c.FP}</span>
                  <span className="cm__k">{tx('FP · falsi positivi (falsi allarmi)', 'FP · false positives (false alarms)')}</span>
                </td>
                <td className="cm__cell cm__cell--good">
                  <span className="cm__n">{c.TN}</span>
                  <span className="cm__k">{tx('TN · veri negativi', 'TN · true negatives')}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ul className="croc__metrics">
            <li>
              <span>
                {tx('accuratezza', 'accuracy')} <Tex>{tx('\\frac{TP+TN}{\\text{totale}}', '\\frac{TP+TN}{\\text{total}}')}</Tex>
              </span>
              <b>{pctS(acc)}</b>
            </li>
            <li>
              <span>
                {tx('sensibilità', 'sensitivity')} <Tex>{'\\frac{TP}{TP+FN}'}</Tex>
              </span>
              <b>{pctS(sens)}</b>
            </li>
            <li>
              <span>
                {tx('specificità', 'specificity')} <Tex>{'\\frac{TN}{FP+TN}'}</Tex>
              </span>
              <b>{pctS(spec)}</b>
            </li>
            <li>
              <span>
                {tx('precisione', 'precision')} <Tex>{'\\frac{TP}{TP+FP}'}</Tex>
              </span>
              <b>{pctS(prec)}</b>
            </li>
          </ul>
        </div>
        <div className="croc__right">
          <Plot xDomain={[0, 1]} yDomain={[0, 1]} aspect={1} maxH={330} equal margin={{ l: 40, r: 12, t: 10, b: 36 }}>
            <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} xLabel={tx('FP rate (1 − specificità)', 'FP rate (1 − specificity)')} yLabel="TP rate" />
            <RocFill pts={roc.pts} />
            <Polyline
              pts={[
                { x: 0, y: 0 },
                { x: 1, y: 1 },
              ]}
              color="var(--ink-4)"
              width={1.2}
              dash="4 4"
            />
            <Label x={0.62} y={0.5} className="plot-label--muted">
              {tx('scelta casuale', 'random choice')}
            </Label>
            <Polyline pts={roc.pts} color="var(--c-violet)" width={2.4} />
            <Dot x={fpr} y={sens} r={6} color="var(--accent)" />
          </Plot>
          <div className="croc__auc">
            AUC <b>{fmt(roc.auc, 3)}</b>
            <span>
              {roc.auc > 0.97
                ? tx('quasi ideale', 'almost ideal')
                : roc.auc < 0.56
                  ? tx('come tirare a caso', 'like guessing at random')
                  : tx('meglio del caso', 'better than chance')}
            </span>
          </div>
        </div>
      </div>

      <div className="controls">
        <Slider
          label={tx('separazione tra le due classi', 'separation between the two classes')}
          min={0}
          max={4}
          step={0.05}
          value={sep}
          onChange={setSep}
          format={(v) => (v < 0.15 ? tx('nessuna', 'none') : v > 3.4 ? tx('netta', 'sharp') : fmt(v, 1))}
        />
        <Btn variant="soft" onClick={() => setT(-99)}>
          {tx('Classificatore banale: sempre «positivo»', 'Trivial classifier: always “positive”')}
        </Btn>
        <Btn icon="reset" onClick={() => setT(0.3)}>
          {tx('Soglia di partenza', 'Initial threshold')}
        </Btn>
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Porta la separazione a zero: la curva ROC si schiaccia sulla diagonale (AUC ≈ 0,5).',
              'Bring the separation to zero: the ROC curve flattens onto the diagonal (AUC ≈ 0.5).',
            ),
            done: seen.random,
          },
          {
            label: tx(
              'Aumenta la separazione al massimo: la curva sale verso l’angolo in alto a sinistra.',
              'Increase the separation to the maximum: the curve rises toward the top-left corner.',
            ),
            done: seen.perfect,
          },
          {
            label: tx(
              'Con il 99% di positivi, usa il classificatore banale: accuratezza altissima senza aver imparato nulla.',
              'With 99% positives, use the trivial classifier: very high accuracy without having learned anything.',
            ),
            done: seen.trivial,
          },
        ]}
      />
    </div>
  )
}

function Area({ f, color, from }: { f: (x: number) => number; color: string; from: number }) {
  const { x, y, clipId } = usePlot()
  const a = Math.max(from, x.domain[0])
  const b = x.domain[1]
  if (a >= b) return null
  let d = `M${x(a)},${y(0)}`
  for (let i = 0; i <= 80; i++) {
    const v = a + ((b - a) * i) / 80
    d += `L${x(v).toFixed(1)},${y(f(v)).toFixed(1)}`
  }
  d += `L${x(b)},${y(0)}Z`
  return <path d={d} fill={color} opacity={0.14} clipPath={`url(#${clipId})`} />
}

function RocFill({ pts }: { pts: { x: number; y: number }[] }) {
  const { x, y } = usePlot()
  const d = `M${x(0)},${y(0)}` + pts.map((p) => `L${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join('') + `L${x(1)},${y(0)}Z`
  return <path d={d} fill="var(--c-violet)" opacity={0.08} />
}
