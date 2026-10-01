import { useRef, useState } from 'react'
import { Tasks } from '../../components/prose/Figure'
import { Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'

/**
 * Fig. 4.7: hold-out. La barra divide il dataset in TR / VL / TS (trascina i divisori);
 * lo schema mostra chi usa cosa, lato sviluppatore e lato cliente.
 */

type Part = 'tr' | 'vl' | 'ts' | 'new' | null

const INFO: Record<Exclude<Part, null>, string> = {
  tr: tx(
    'Training set: usato per eseguire l’algoritmo di apprendimento (model training).',
    'Training set: used to run the learning algorithm (model training).',
  ),
  vl: tx(
    'Validation set: usato per scegliere il modello migliore, ad esempio regolando gli iperparametri (model selection).',
    'Validation set: used to choose the best model, for example by tuning the hyperparameters (model selection).',
  ),
  ts: tx(
    'Test set: usato solo alla fine, sul modello scelto, per stimarne l’errore (model assessment). Mai per scegliere.',
    'Test set: used only at the end, on the chosen model, to estimate its error (model assessment). Never to choose.',
  ),
  new: tx(
    'Nuovi dati, lato cliente: il modello rilasciato li usa per fare inferenza (predizioni).',
    'New data, client side: the deployed model uses them to do inference (predictions).',
  ),
}

export function DataSplit() {
  const [a, setA] = useState(0.5) // fine TR
  const [b, setB] = useState(0.72) // fine VL
  const [hot, setHot] = useState<Part>(null)
  const [cheat, setCheat] = useState(false)
  const [seen, setSeen] = useState({ drag: false, cheat: false })
  const bar = useRef<HTMLDivElement>(null)

  const drag = (which: 'a' | 'b') => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const r = bar.current!.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width))
      if (which === 'a') setA(Math.max(0.15, Math.min(t, b - 0.08)))
      else setB(Math.min(0.92, Math.max(t, a + 0.08)))
      setSeen((s) => ({ ...s, drag: true }))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const key = (which: 'a' | 'b') => (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowLeft' ? -0.01 : e.key === 'ArrowRight' ? 0.01 : 0
    if (!d) return
    e.preventDefault()
    if (which === 'a') setA((v) => Math.max(0.15, Math.min(v + d, b - 0.08)))
    else setB((v) => Math.min(0.92, Math.max(v + d, a + 0.08)))
  }

  const pct = (v: number) => `${Math.round(v * 100)}%`
  const cls = (p: Part) => (hot === p ? ' is-hot' : hot ? ' is-dim' : '')

  return (
    <div className="split">
      <div className="split__barwrap">
        <div className="split__bar" ref={bar}>
          <div className={`split__seg split__seg--tr${cls('tr')}`} style={{ width: pct(a) }} onMouseEnter={() => setHot('tr')} onMouseLeave={() => setHot(null)}>
            <b>TR</b> {pct(a)}
          </div>
          <div className={`split__seg split__seg--vl${cls('vl')}`} style={{ width: pct(b - a) }} onMouseEnter={() => setHot('vl')} onMouseLeave={() => setHot(null)}>
            <b>VL</b> {pct(b - a)}
          </div>
          <div className={`split__seg split__seg--ts${cls('ts')}`} style={{ width: pct(1 - b) }} onMouseEnter={() => setHot('ts')} onMouseLeave={() => setHot(null)}>
            <b>TS</b> {pct(1 - b)}
          </div>
          <button className="split__knob" style={{ left: pct(a) }} onPointerDown={drag('a')} onKeyDown={key('a')} aria-label={tx('Confine tra training e validation', 'Boundary between training and validation')} />
          <button className="split__knob" style={{ left: pct(b) }} onPointerDown={drag('b')} onKeyDown={key('b')} aria-label={tx('Confine tra validation e test', 'Boundary between validation and test')} />
        </div>
        <div className="split__legend">
          <span>
            development / design set (TR + VL): <b>{pct(b)}</b>
          </span>
          <span>
            {tx('tenuto da parte', 'set aside')}: <b>{pct(1 - b)}</b>
          </span>
        </div>
      </div>

      <svg viewBox="0 0 720 330" className="split__svg" role="img" aria-label={tx('Ruolo di training, validation e test set', 'Role of training, validation and test set')}>
        <defs>
          <marker id="sp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10z" className="split__head" />
          </marker>
          <marker id="sp-arr-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10z" className="split__head--bad" />
          </marker>
        </defs>
        <rect x={130} y={10} width={580} height={236} rx={22} className="split__dev" />
        <text x={690} y={36} textAnchor="end" className="split__zone">
          {tx('lato sviluppatore', 'developer side')}
        </text>
        <text x={16} y={296} className="split__zone">
          {tx('lato cliente', 'client side')}
        </text>

        <Cyl x={20} y={104} label="Dataset" kind="all" />
        <Cyl x={170} y={34} label="TR" kind="tr" cls={cls('tr')} onHover={setHot} />
        <Cyl x={170} y={116} label="VL" kind="vl" cls={cls('vl')} onHover={setHot} />
        <Cyl x={170} y={196} label="TS" kind="ts" cls={cls('ts')} onHover={setHot} />
        <Cyl x={170} y={270} label={tx('Nuovi dati', 'New data')} kind="new" cls={cls('new')} onHover={setHot} wide />

        <path d="M96,128 L166,58" className="split__data" markerEnd="url(#sp-arr)" />
        <path d="M96,134 L166,140" className="split__data" markerEnd="url(#sp-arr)" />
        <path d="M96,140 L166,218" className="split__data" markerEnd="url(#sp-arr)" />

        <Box x={330} y={30} label={tx('Addestramento', 'Training')} sub="model training" />
        <Box x={330} y={112} label={tx('Scelta del modello', 'Choosing the model')} sub="model selection" />
        <Box x={330} y={192} label={tx('Modello rilasciato', 'Released model')} sub="deployed model" />

        <path d="M240,58 L326,58" className={`split__data${cls('tr')}`} markerEnd="url(#sp-arr)" />
        <path d="M240,140 L326,140" className={`split__data${cls('vl')}`} markerEnd="url(#sp-arr)" />
        <path d="M240,220 L326,220" className={`split__data split__data--ts${cls('ts')}`} markerEnd="url(#sp-arr)" />
        <path d="M280,294 C 300,294 310,240 326,232" className={`split__data split__data--new${cls('new')}`} markerEnd="url(#sp-arr)" />

        <path d="M410,82 L410,108" className="split__flow" markerEnd="url(#sp-arr)" />
        <path d="M490,128 C 530,118 530,70 494,62" className="split__flow" markerEnd="url(#sp-arr)" />
        <path d="M410,164 L410,188" className="split__flow" markerEnd="url(#sp-arr)" />

        <path d="M494,212 L560,190" className={`split__data split__data--ts${cls('ts')}`} markerEnd="url(#sp-arr)" />
        <text x={566} y={186} className="split__out">
          {tx('stima dell’errore', 'error estimate')}
        </text>
        <text x={566} y={202} className="split__out split__out--sub">
          (model assessment)
        </text>
        <path d="M494,232 L560,268" className={`split__data split__data--new${cls('new')}`} markerEnd="url(#sp-arr)" />
        <text x={566} y={276} className="split__out split__out--new">
          {tx('predizioni', 'predictions')}
        </text>

        {cheat && (
          <g className="split__cheat">
            <path d="M240,212 C 290,190 290,160 326,150" markerEnd="url(#sp-arr-bad)" />
            <text x={250} y={176}>
              {tx('✗ TS usato per scegliere', '✗ TS used to choose')}
            </text>
          </g>
        )}
      </svg>

      <div className="split__info" aria-live="polite">
        {cheat ? (
          <span className="verdict verdict--bad">
            {tx(
              'Se il test set serve a scegliere il modello, la stima finale non è più affidabile: è ottimistica.',
              'If the test set is used to choose the model, the final estimate is no longer reliable: it is optimistic.',
            )}
          </span>
        ) : hot ? (
          INFO[hot]
        ) : (
          tx(
            'Passa sui cilindri per vedere chi usa cosa. Trascina i divisori della barra per cambiare le proporzioni.',
            'Hover over the cylinders to see who uses what. Drag the dividers of the bar to change the proportions.',
          )
        )}
      </div>
      <div className="controls">
        <Toggle
          label={tx('errore da evitare: usare il TS anche per la model selection', 'mistake to avoid: using the TS for model selection too')}
          checked={cheat}
          onChange={(v) => {
            setCheat(v)
            setSeen((s) => ({ ...s, cheat: true }))
          }}
        />
      </div>
      <Tasks
        items={[
          {
            label: tx(
              'Trascina i divisori: ad esempio, tieni da parte il 25–30% dei dati come test set.',
              'Drag the dividers: for example, set aside 25–30% of the data as the test set.',
            ),
            done: seen.drag,
          },
          {
            label: tx(
              'Attiva l’errore da evitare e leggi perché infrange la regola d’oro.',
              'Turn on the mistake to avoid and read why it breaks the golden rule.',
            ),
            done: seen.cheat,
          },
        ]}
      />
    </div>
  )
}

function Cyl({
  x,
  y,
  label,
  kind,
  cls = '',
  onHover,
  wide,
}: {
  x: number
  y: number
  label: string
  kind: 'all' | 'tr' | 'vl' | 'ts' | 'new'
  cls?: string
  onHover?: (p: Part) => void
  wide?: boolean
}) {
  const w = wide ? 110 : 70
  const h = 48
  return (
    <g
      className={`split__cyl split__cyl--${kind}${cls}`}
      transform={`translate(${x} ${y})`}
      onMouseEnter={() => onHover?.(kind === 'all' ? null : kind)}
      onMouseLeave={() => onHover?.(null)}
    >
      <path d={`M0,8 v${h - 8} a${w / 2},8 0 0 0 ${w},0 v${-(h - 8)}`} />
      <ellipse cx={w / 2} cy={8} rx={w / 2} ry={8} />
      <text x={w / 2} y={h / 2 + 12} textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function Box({ x, y, label, sub }: { x: number; y: number; label: string; sub: string }) {
  return (
    <g className="split__box" transform={`translate(${x} ${y})`}>
      <rect width={164} height={52} rx={10} />
      <text x={82} y={23} textAnchor="middle">
        {label}
      </text>
      <text x={82} y={40} textAnchor="middle" className="split__boxsub">
        {sub}
      </text>
    </g>
  )
}
