import { useMemo, useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Slider, Toggle } from '../../components/ui/Controls'
import { tx, LOCALE } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ Fig. 4.5: curva di apprendimento */

// andamenti tipici (illustrativi) al crescere della complessità c ∈ [0, 1]
const trainC = (c: number) => 0.06 + 0.62 * Math.exp(-4.2 * c)
const testC = (c: number) => 0.2 + 0.52 * Math.exp(-4.6 * c) + 0.3 * Math.max(0, c - 0.45) ** 1.6

export function ComplexityCurve() {
  const [c, setC] = useState(0.45)
  const zone = c < 0.28 ? 'under' : c > 0.62 ? 'over' : 'ok'
  const seen = useLatch({ under: zone === 'under', over: zone === 'over' })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: tx('errore sul training set', 'training set error'), color: 'var(--c-blue)' },
            { label: tx('errore sul test set', 'test set error'), color: 'var(--c-orange)' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 1]} yDomain={[0, 0.8]} aspect={0.5}>
        <Zones />
        <Axes xTicks={[]} yTicks={[]} xLabel={tx('complessità del modello', 'model complexity')} yLabel={tx('errore', 'error')} />
        <FnPath f={trainC} color="var(--c-blue)" width={2.4} />
        <FnPath f={testC} color="var(--c-orange)" width={2.4} />
        <Polyline
          pts={[
            { x: c, y: 0 },
            { x: c, y: 0.8 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Dot x={c} y={trainC(c)} r={4.5} color="var(--c-blue)" />
        <Dot x={c} y={testC(c)} r={4.5} color="var(--c-orange)" />
        <Handle x={c} y={0} axis="x" label={tx('complessità', 'complexity')} onMove={(p) => setC(Math.max(0.02, Math.min(0.98, p.x)))} />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label={tx('training', 'training')} tone="blue" value={fmt(trainC(c), 2)} />
          <Readout label={tx('test', 'test')} tone="orange" value={fmt(testC(c), 2)} />
          <Readout label={tx('divario test − training', 'test − training gap')} value={fmt(testC(c) - trainC(c), 2)} />
        </div>
        <span className={`verdict ${zone === 'ok' ? 'verdict--good' : zone === 'under' ? 'verdict--warn' : 'verdict--bad'}`}>
          {zone === 'under'
            ? tx('Underfitting: entrambi gli errori sono alti', 'Underfitting: both errors are high')
            : zone === 'over'
              ? tx('Overfitting: il training scende, il test risale', 'Overfitting: training drops, test goes back up')
              : tx('Zona di miglior generalizzazione', 'Best generalization region')}
        </span>
      </div>
      <Tasks
        items={[
          { label: tx('Porta il cursore a sinistra: entrambi gli errori sono alti.', 'Drag the slider to the left: both errors are high.'), done: seen.under },
          { label: tx('Portalo a destra: l’errore di training continua a scendere, quello di test no.', 'Drag it to the right: training error keeps decreasing, test error does not.'), done: seen.over },
        ]}
      />
    </div>
  )
}

function Zones() {
  const { x, y } = usePlot()
  return (
    <g>
      <text x={x(0.03)} y={y(0.03)} className="plot-label plot-label--muted">
        underfitting
      </text>
      <text x={x(0.97)} y={y(0.03)} textAnchor="end" className="plot-label plot-label--muted">
        overfitting
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 4.6: VC-bound e SRM */

// errore di training illustrativo: decresce con la VC-dim
const remp = (h: number) => 0.04 + 0.62 * Math.exp(-h / 15)
// VC-confidence nella forma classica di Vapnik (loss 0/1): vedi lezione 12
const eps = (h: number, l: number, delta: number) => Math.sqrt((h * (Math.log((2 * l) / h) + 1) - Math.log(delta / 4)) / l)

export function VCBound() {
  const [lExp, setLExp] = useState(3) // l = 10^lExp
  const [delta, setDelta] = useState(0.05)
  const [h, setH] = useState(60)
  const [marks, setMarks] = useState(false)
  const [marksSeen, setMarksSeen] = useState(false)
  const l = Math.round(10 ** lExp)
  const bound = (v: number) => remp(v) + eps(v, l, delta)
  const best = useMemo(() => {
    let bh = 1
    let bv = Infinity
    for (let v = 1; v <= 150; v += 0.5) {
      const b = remp(v) + eps(v, l, delta)
      if (b < bv) {
        bv = b
        bh = v
      }
    }
    return { h: bh, v: bv }
  }, [l, delta])
  const zone = h < best.h * 0.6 ? 'under' : h > best.h * 1.6 ? 'over' : 'ok'

  const seen = useLatch({ more: lExp >= 3.9, min: Math.abs(h - best.h) < 3 })

  const hRight = Math.min(140, best.h * 2.6)

  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <>{tx('errore di training', 'training error')} <Tex>{'R_{emp}'}</Tex></>, color: 'var(--c-blue)' },
            { label: <>{tx('VC-confidence', 'VC-confidence')} <Tex>{'\\varepsilon'}</Tex></>, color: 'var(--c-orange)' },
            { label: <>{tx('bound su', 'bound on')} <Tex>R</Tex>{tx(' = somma', ' = sum')}</>, color: 'var(--c-violet)' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 150]} yDomain={[0, 1.3]} aspect={0.52}>
        <Axes xTicks={[0, 25, 50, 75, 100, 125, 150]} yTicks={[0, 0.5, 1]} xLabel="VC-dim" yLabel={tx('errore', 'error')} />
        <FnPath f={remp} color="var(--c-blue)" width={2.2} from={1} />
        <FnPath f={(v) => eps(v, l, delta)} color="var(--c-orange)" width={2.2} from={1} />
        <FnPath f={bound} color="var(--c-violet)" width={2.8} from={1} />
        <Polyline
          pts={[
            { x: best.h, y: 0 },
            { x: best.h, y: best.v },
          ]}
          color="var(--c-violet)"
          width={1.2}
          dash="4 4"
        />
        <Dot x={best.h} y={best.v} r={5} color="var(--c-violet)" />
        <Label x={best.h} y={best.v} dy={-12} dx={8} className="plot-label--strong">
          {tx('miglior compromesso', 'best trade-off')}
        </Label>
        {marks && (
          <>
            <Dot x={hRight} y={bound(hRight)} r={5} color="var(--ink)" />
            <Label x={hRight} y={bound(hRight)} dx={8} dy={-8} className="plot-label--math plot-label--strong">
              h
            </Label>
            <Label x={best.h} y={best.v} dx={-8} dy={-10} anchor="end" className="plot-label--math plot-label--strong">
              h′
            </Label>
          </>
        )}
        <Polyline
          pts={[
            { x: h, y: 0 },
            { x: h, y: 1.3 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Handle x={h} y={0} axis="x" label="VC-dimension" onMove={(p) => setH(Math.max(1, Math.min(148, p.x)))} />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label={<Tex>{'R_{emp}'}</Tex>} tone="blue" value={fmt(remp(h), 3)} />
          <Readout label={<Tex>{'\\varepsilon'}</Tex>} tone="orange" value={fmt(eps(h, l, delta), 3)} />
          <Readout label={<>{tx('bound su', 'bound on')} <Tex>R</Tex></>} tone="violet" value={fmt(bound(h), 3)} />
        </div>
        <span className={`verdict ${zone === 'ok' ? 'verdict--good' : zone === 'under' ? 'verdict--warn' : 'verdict--bad'}`}>
          {zone === 'under' ? (
            <>
              {tx('VC-dim bassa:', 'Low VC-dim:')} <Tex>{'\\varepsilon'}</Tex> {tx('piccolo ma', 'small but')} <Tex>{'R_{emp}'}</Tex> {tx('alto (underfitting)', 'high (underfitting)')}
            </>
          ) : zone === 'over' ? (
            <>
              {tx('VC-dim alta:', 'High VC-dim:')} <Tex>{'R_{emp}'}</Tex> {tx('basso ma', 'low but')} <Tex>{'\\varepsilon'}</Tex> {tx('cresce (overfitting)', 'grows (overfitting)')}
            </>
          ) : (
            tx('Vicino al minimo del bound', 'Near the minimum of the bound')
          )}
        </span>
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              {tx('numero di dati', 'sample size')} <Tex>l</Tex>
            </>
          }
          min={2}
          max={4}
          step={0.01}
          value={lExp}
          onChange={setLExp}
          format={() => l.toLocaleString(LOCALE)}
        />
        <Slider
          label={
            <>
              {tx('confidenza', 'confidence')} <Tex>\delta</Tex>
            </>
          }
          min={0.01}
          max={0.3}
          step={0.01}
          value={delta}
          onChange={setDelta}
          format={(v) => `${fmt(v)} (${tx('prob.', 'prob.')} ${Math.round((1 - v) * 100)}%)`}
        />
        <Toggle
          label={
            <>
              {tx('mostra', 'show')} <Tex>h</Tex> {tx('e', 'and')} <Tex>h'</Tex> {tx('(esercizio)', '(exercise)')}
            </>
          }
          checked={marks}
          onChange={(v) => {
            setMarks(v)
            setMarksSeen(true)
          }}
        />
      </div>
      <Tasks
        items={[
          { label: tx('Trascina la VC-dim fino al minimo della curva viola.', 'Drag the VC-dim to the minimum of the purple curve.'), done: seen.min },
          { label: tx('Aumenta i dati l: la VC-confidence si abbassa e il minimo si sposta verso modelli più complessi.', 'Increase sample size l: the VC-confidence drops and the minimum shifts toward more complex models.'), done: seen.more },
          { label: tx('Mostra h e h′ per l’esercizio sulla definizione di overfitting.', 'Show h and h′ for the exercise on the definition of overfitting.'), done: marksSeen },
        ]}
      />
    </div>
  )
}
