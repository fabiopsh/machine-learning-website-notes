import { useMemo, useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Legend, Readout, Slider, Toggle } from '../../components/ui/Controls'
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
            { label: 'errore sul training set', color: 'var(--c-blue)' },
            { label: 'errore sul test set', color: 'var(--c-orange)' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 1]} yDomain={[0, 0.8]} aspect={0.5}>
        <Zones />
        <Axes xTicks={[]} yTicks={[]} xLabel="complessità del modello" yLabel="errore" />
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
        <Handle x={c} y={0} axis="x" label="complessità" onMove={(p) => setC(Math.max(0.02, Math.min(0.98, p.x)))} />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label="training" tone="blue" value={fmt(trainC(c), 2)} />
          <Readout label="test" tone="orange" value={fmt(testC(c), 2)} />
          <Readout label="divario test − training" value={fmt(testC(c) - trainC(c), 2)} />
        </div>
        <span className={`verdict ${zone === 'ok' ? 'verdict--good' : zone === 'under' ? 'verdict--warn' : 'verdict--bad'}`}>
          {zone === 'under' ? 'Underfitting: entrambi gli errori sono alti' : zone === 'over' ? 'Overfitting: il training scende, il test risale' : 'Zona di miglior generalizzazione'}
        </span>
      </div>
      <Tasks
        items={[
          { label: 'Porta il cursore a sinistra: entrambi gli errori sono alti.', done: seen.under },
          { label: 'Portalo a destra: l’errore di training continua a scendere, quello di test no.', done: seen.over },
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
            { label: <>errore di training <Tex>{'R_{emp}'}</Tex></>, color: 'var(--c-blue)' },
            { label: <>VC-confidence <Tex>{'\\varepsilon'}</Tex></>, color: 'var(--c-orange)' },
            { label: <>bound su <Tex>R</Tex> = somma</>, color: 'var(--c-violet)' },
          ]}
        />
      </div>
      <Plot xDomain={[0, 150]} yDomain={[0, 1.3]} aspect={0.52}>
        <Axes xTicks={[0, 25, 50, 75, 100, 125, 150]} yTicks={[0, 0.5, 1]} xLabel="VC-dim" yLabel="errore" />
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
          miglior compromesso
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
          <Readout label={<>bound su <Tex>R</Tex></>} tone="violet" value={fmt(bound(h), 3)} />
        </div>
        <span className={`verdict ${zone === 'ok' ? 'verdict--good' : zone === 'under' ? 'verdict--warn' : 'verdict--bad'}`}>
          {zone === 'under' ? (
            <>
              VC-dim bassa: <Tex>{'\\varepsilon'}</Tex> piccolo ma <Tex>{'R_{emp}'}</Tex> alto (underfitting)
            </>
          ) : zone === 'over' ? (
            <>
              VC-dim alta: <Tex>{'R_{emp}'}</Tex> basso ma <Tex>{'\\varepsilon'}</Tex> cresce (overfitting)
            </>
          ) : (
            'Vicino al minimo del bound'
          )}
        </span>
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              numero di dati <Tex>l</Tex>
            </>
          }
          min={2}
          max={4}
          step={0.01}
          value={lExp}
          onChange={setLExp}
          format={() => l.toLocaleString('it-IT')}
        />
        <Slider
          label={
            <>
              confidenza <Tex>\delta</Tex>
            </>
          }
          min={0.01}
          max={0.3}
          step={0.01}
          value={delta}
          onChange={setDelta}
          format={(v) => `${fmt(v)} (prob. ${Math.round((1 - v) * 100)}%)`}
        />
        <Toggle
          label={
            <>
              mostra <Tex>h</Tex> e <Tex>h'</Tex> (esercizio)
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
          { label: 'Trascina la VC-dim fino al minimo della curva viola.', done: seen.min },
          { label: 'Aumenta i dati l: la VC-confidence si abbassa e il minimo si sposta verso modelli più complessi.', done: seen.more },
          { label: 'Mostra h e h′ per l’esercizio sulla definizione di overfitting.', done: marksSeen },
        ]}
      />
    </div>
  )
}
