import { useEffect, useState } from 'react'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented, Slider } from '../../components/ui/Controls'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ pezzi comuni: una sequenza di nodi */

const STEP = 96
const X0 = 60
const sx = (i: number) => X0 + i * STEP

/** nodi di input l₁…lₙ collegati dall'ordine seriale (le frecce puntano al predecessore, come nelle slide) */
function Chain({ n, y, hot, onPick, cls = 'sq20__in' }: { n: number; y: number; hot?: (i: number) => boolean; onPick?: (i: number) => void; cls?: string }) {
  return (
    <g>
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={i} className="sq20__link">
          <line x1={sx(i + 1) - 18} y1={y} x2={sx(i) + 24} y2={y} />
          <path d={`M${sx(i) + 18},${y}l8,-4.5v9z`} />
        </g>
      ))}
      {Array.from({ length: n }, (_, i) => (
        <g
          key={i}
          className={cls + (hot?.(i) ? ' is-hot' : '')}
          onClick={onPick ? () => onPick(i) : undefined}
          role={onPick ? 'button' : undefined}
          tabIndex={onPick ? 0 : undefined}
          onKeyDown={onPick ? (e) => (e.key === 'Enter' || e.key === ' ') && onPick(i) : undefined}
        >
          <circle cx={sx(i)} cy={y} r={17} />
          <text x={sx(i)} y={y + 5} textAnchor="middle">
            {svgScript('l', String(i + 1))}
          </text>
        </g>
      ))}
    </g>
  )
}

const VECS = (() => {
  const r = rng(2001)
  return Array.from({ length: 7 }, (_, i) => (i === 0 ? [1, 0, 1, 0.7] : [r() < 0.5 ? 0 : 1, r() < 0.5 ? 0 : 1, r() < 0.5 ? 0 : 1, Math.round(r() * 10) / 10]))
})()

/* ------------------------------------------------------------------ Fig. 20.1 */

export function Transductions() {
  const [n, setN] = useState(5)
  const [sel, setSel] = useState(0)
  const [task, setTask] = useState<'class' | 'trans'>('class')
  const [picked, setPicked] = useState(false)
  const seen = useLatch({ len: n !== 5, trans: task === 'trans' })
  const W = X0 * 2 + (n - 1) * STEP
  const cur = Math.min(sel, n - 1)
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          label="task"
          value={task}
          onChange={setTask}
          options={[
            { value: 'class', label: 'classificazione: uscita alla fine' },
            { value: 'trans', label: 'trasduzione: uscita a ogni passo' },
          ]}
        />
      </div>
      <div className="pipe16__scroll">
        <svg className="sq20" viewBox={`0 0 ${Math.max(W, 520)} 190`} style={{ minWidth: Math.min(Math.max(W, 520), 560) }} role="img" aria-label="Una sequenza di vettori e l’uscita del task">
          <Chain
            n={n}
            y={40}
            hot={(i) => i === cur}
            onPick={(i) => {
              setSel(i)
              setPicked(true)
            }}
          />
          {Array.from({ length: n }, (_, i) =>
            task === 'trans' || i === n - 1 ? (
              <g key={i}>
                <line className="sq20__down" x1={sx(i)} y1={62} x2={sx(i)} y2={108} />
                <circle className="sq20__out" cx={sx(i)} cy={126} r={13} />
              </g>
            ) : null,
          )}
          <g className="sq20__time">
            <line x1={X0 - 20} y1={166} x2={sx(n - 1) + 6} y2={166} />
            <path d={`M${sx(n - 1) + 18},166l-13,-6v12z`} />
            <text x={X0 - 20} y={184}>
              t = 0
            </text>
            <text x={sx(n - 1) + 18} y={184} textAnchor="end">
              t = ora
            </text>
            <text x={(X0 + sx(n - 1)) / 2} y={184} textAnchor="middle">
              tempo
            </text>
          </g>
        </svg>
      </div>
      <Controls>
        <Slider label="lunghezza della sequenza" min={3} max={7} step={1} value={n} onChange={setN} width={200} />
        <div className="readouts">
          <Readout label={<>elemento scelto</>} tone="accent" value={<Tex>{`\\mathbf{l}_{${cur + 1}} = [${VECS[cur].map((v) => fmt(v, Number.isInteger(v) ? 0 : 1)).join(';\\ ')}]`}</Tex>} sub="ogni elemento è un vettore" />
          <Readout label="uscite" value={task === 'class' ? '1' : String(n)} sub={task === 'class' ? 'un valore per l’intera sequenza' : 'una per ogni passo di input'} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Clicca un elemento della sequenza: è un vettore, non un singolo numero.', done: picked },
          { label: 'Cambia la lunghezza: il modello deve funzionare per sequenze di qualunque lunghezza.', done: seen.len },
          { label: 'Passa alla trasduzione: ogni passo di input ha la sua uscita (un vettore, a valori discreti o continui).', done: seen.trans },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.2 */

type Kind = 'class' | 'iso' | 'next' | 'gen'
const KINDS: { id: Kind; label: string; text: string; full: boolean[] }[] = [
  {
    id: 'class',
    label: 'classificazione',
    text: 'Classificazione di sequenze: una sola uscita, alla fine della sequenza.',
    full: [false, false, false, true],
  },
  {
    id: 'iso',
    label: 'trasduzione IO isomorfa',
    text: 'Trasduzione input-output isomorfa: un’uscita per ogni elemento di input.',
    full: [true, true, true, true],
  },
  {
    id: 'next',
    label: 'passo successivo',
    text: 'Predizione del passo successivo: l’uscita al passo t è l’input del passo t + 1. La predizione autoregressiva usa una sola sequenza, che fa sia da input sia da target.',
    full: [true, true, true, true],
  },
  {
    id: 'gen',
    label: 'generazione',
    text: 'Generazione di sequenze: dopo l’input, il modello produce una sequenza di uscite, una dopo l’altra.',
    full: [false, true, true, true],
  },
]

export function TransductionTypes() {
  const [k, setK] = useState<Kind>('class')
  const [seenK, setSeenK] = useState<Record<string, boolean>>({})
  const cur = KINDS.find((q) => q.id === k)!
  const N = 4
  const gen = k === 'gen'
  return (
    <div>
      <div className="wbar">
        <Segmented
          size="sm"
          value={k}
          onChange={(v) => {
            setK(v)
            setSeenK((s) => ({ ...s, [v]: true }))
          }}
          options={KINDS.map((q) => ({ value: q.id, label: q.label }))}
        />
      </div>
      <div className="pipe16__scroll">
        <svg className="sq20" viewBox="0 0 560 300" style={{ minWidth: 520 }} role="img" aria-label={cur.text}>
          <text className="sq20__cap" x={X0 - 20} y={18}>
            tempo →
          </text>
          <Chain n={N} y={52} cls="sq20__in sq20__in--plain" />
          {Array.from({ length: N }, (_, i) => {
            const show = k === 'class' ? i === N - 1 : gen ? i >= 1 : true
            if (!show) return null
            return (
              <g key={i}>
                {(!gen || i === 1) && <line className="sq20__down" x1={sx(i)} y1={74} x2={sx(i)} y2={110} />}
                <circle className="sq20__out" cx={sx(i)} cy={128} r={13} />
                {gen && i > 1 && <line className="sq20__down" x1={sx(i - 1) + 16} y1={128} x2={sx(i) - 16} y2={128} />}
                {k === 'next' && i < N - 1 && <line className="sq20__auto" x1={sx(i) + 10} y1={118} x2={sx(i + 1) - 12} y2={66} />}
              </g>
            )
          })}
          {gen && (
            <text className="sq20__cap" x={sx(0)} y={132} textAnchor="middle">
              …
            </text>
          )}
          <text className="sq20__cap" x={X0 - 20} y={186}>
            La stessa trasduzione, in forma generale: nodi pieni = uscite richieste, vuoti = uscite assenti
          </text>
          <Chain n={N} y={216} cls="sq20__in sq20__in--plain" />
          {Array.from({ length: N }, (_, i) => (
            <g key={i}>
              <line className="sq20__down" x1={sx(i)} y1={238} x2={sx(i)} y2={262} />
              <circle className={'sq20__out' + (cur.full[i] ? '' : ' is-empty')} cx={sx(i)} cy={278} r={11} />
              {k === 'next' && i < N - 1 && <line className="sq20__auto" x1={sx(i) + 9} y1={270} x2={sx(i + 1) - 12} y2={230} />}
            </g>
          ))}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">{cur.label}</div>
        {cur.text}
      </div>
      <Tasks
        items={[
          {
            label: 'Guarda tutti e quattro i tipi: cambiano solo le posizioni in cui è richiesta un’uscita (nodi pieni).',
            done: !!seenK.iso && !!seenK.next && !!seenK.gen,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.3: IDNN */

export function Idnn() {
  const [win, setWin] = useState(3)
  const [pos, setPos] = useState(0)
  const [play, setPlay] = useState(false)
  const N = 5
  const last = N - win
  const p = Math.min(pos, last)
  const playing = play && p < last
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos((q) => q + 1), 800)
    return () => clearInterval(id)
  }, [playing])
  const seen = useLatch({ end: p === last && last > 0, win: win !== 3 })
  const out = p + win - 1
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="sq20" viewBox="0 0 520 230" style={{ minWidth: 500 }} role="img" aria-label="IDNN: una finestra scorrevole sulla sequenza, elaborata da un MLP">
          <rect className="sq20__win" x={sx(p) - 30} y={12} width={(win - 1) * STEP + 60} height={56} rx={12} />
          <Chain n={N} y={40} hot={(i) => i >= p && i < p + win} />
          <path className="sq20__funnel" d={`M${sx(p) - 26},74L${sx(out) - 34},116H${sx(out) + 34}L${sx(p + win - 1) + 26},74Z`} />
          <rect className="sq20__mlp" x={sx(out) - 34} y={116} width={68} height={30} rx={8} />
          <text className="sq20__mlpt" x={sx(out)} y={136} textAnchor="middle">
            MLP
          </text>
          <line className="sq20__down" x1={sx(out)} y1={146} x2={sx(out)} y2={172} />
          {Array.from({ length: N }, (_, i) => (
            <g key={i} className={'sq20__o' + (i === out ? ' is-hot' : i < win - 1 ? ' is-none' : '')}>
              <circle cx={sx(i)} cy={194} r={17} />
              {i >= win - 1 && (
                <text x={sx(i)} y={199} textAnchor="middle">
                  {svgScript('o', String(i + 1))}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <Controls>
        <Slider
          label="dimensione della finestra"
          min={1}
          max={4}
          step={1}
          value={win}
          onChange={(v) => {
            setWin(v)
            setPos(0)
          }}
          width={190}
        />
        <Btn
          icon={playing ? 'pause' : 'play'}
          variant="soft"
          onClick={() => {
            if (playing) setPlay(false)
            else {
              if (p === last) setPos(0)
              setPlay(true)
            }
          }}
        >
          {playing ? 'Ferma' : 'Fai scorrere la finestra'}
        </Btn>
        <div className="readouts">
          <Readout label="input dell’MLP" tone="accent" value={`${win} elementi`} sub="il numero di pesi cresce con la finestra" />
          <Readout label="memoria" value={`${win - 1} passi indietro`} sub="finita, fissata in anticipo" />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Fai scorrere la finestra fino in fondo: a ogni posizione l’MLP vede solo gli elementi nella finestra.', done: seen.end },
          { label: 'Cambia la dimensione della finestra: cambiano l’input dell’MLP (quindi i suoi pesi) e la prima uscita disponibile.', done: seen.win },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.4: unità ricorrente */

const sigm = (v: number) => 1 / (1 + Math.exp(-v))

export function RecurrentUnit() {
  const [w, setW] = useState(0.5)
  const [wr, setWr] = useState(0.5)
  const [act, setAct] = useState<'lin' | 'sig'>('lin')
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 1])
  const [flip, setFlip] = useState(false)
  const f = act === 'lin' ? (v: number) => v : sigm
  const states: number[] = []
  bits.forEach((b, i) => states.push(f(w * b + wr * (i ? states[i - 1] : 0))))
  const ones = bits.reduce<number[]>((a, b, i) => [...a, (i ? a[i - 1] : 0) + b], [])
  const counts = act === 'lin' && states.every((s, i) => Math.abs(s - ones[i]) < 1e-9)
  const seen = useLatch({ ok: counts, ok2: counts && flip })
  return (
    <div>
      <div className="wgrid wgrid--even">
        <svg className="ru20 ru20--wide" viewBox="0 0 390 230" role="img" aria-label="Unità ricorrente con self-loop e ritardo unitario">
          <defs>
            <marker id="ru20a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10z" className="ru20__head" />
            </marker>
          </defs>
          <line className="ru20__arrow" x1={120} y1={184} x2={120} y2={132} markerEnd="url(#ru20a)" />
          <line className="ru20__arrow" x1={120} y1={84} x2={120} y2={34} markerEnd="url(#ru20a)" />
          <path className="ru20__loop" d="M138,92C210,60 244,110 232,150" markerEnd="url(#ru20a)" />
          <path className="ru20__loop" d="M214,170C180,170 150,150 136,128" markerEnd="url(#ru20a)" />
          <circle className="ru20__unit" cx={120} cy={108} r={24} />
          <text className="ru20__f" x={120} y={114} textAnchor="middle">
            f
          </text>
          <rect className="ru20__in" x={88} y={186} width={64} height={30} rx={4} />
          <text className="ru20__t" x={120} y={206} textAnchor="middle">
            l(t)
          </text>
          <rect className="ru20__q" x={214} y={152} width={36} height={34} rx={4} />
          <text className="ru20__t" x={232} y={174} textAnchor="middle">
            {svgScript('q', '−1', 'sup')}
          </text>
          <text className="ru20__t" x={132} y={30}>
            x(t)
          </text>
          <text className="ru20__m" x={98} y={162} textAnchor="end">
            w = {fmt(w, 1)}
          </text>
          <text className="ru20__m ru20__m--new" x={232} y={206} textAnchor="middle">
            ŵ = {fmt(wr, 1)}
          </text>
          <text className="ru20__s" x={258} y={164}>
            x(t − 1)
          </text>
          <text className="ru20__s" x={258} y={180}>
            stato / contesto
          </text>
          <text className="ru20__s" x={196} y={78}>
            self-loop
          </text>
        </svg>
        <div>
          <table className="ru20__tab">
            <thead>
              <tr>
                <th>
                  <Tex>{'t'}</Tex>
                </th>
                {bits.map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>
                  <Tex>{'l(t)'}</Tex>
                </th>
                {bits.map((b, i) => (
                  <td key={i}>
                    <button
                      type="button"
                      className={'ru20__bit' + (b ? ' is-1' : '')}
                      onClick={() => {
                        setBits(bits.map((v, j) => (j === i ? 1 - v : v)))
                        setFlip(true)
                      }}
                      aria-label={`input al passo ${i + 1}: ${b}`}
                    >
                      {b}
                    </button>
                  </td>
                ))}
              </tr>
              <tr>
                <th>
                  <Tex>{'x(t)'}</Tex>
                </th>
                {states.map((s, i) => (
                  <td key={i} className="ru20__x">
                    {fmt(s, Number.isInteger(s) ? 0 : 2)}
                  </td>
                ))}
              </tr>
              <tr>
                <th>«1» finora</th>
                {ones.map((s, i) => (
                  <td key={i} className="ru20__ones">
                    {s}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <span className={'verdict ' + (counts ? 'verdict--good' : 'verdict--info')}>
            {counts ? 'Lo stato è il numero di «1» ricevuti finora.' : 'Lo stato non coincide con il conteggio degli «1».'}
          </span>
          <div className="wmath">
            <Tex>{`x(t) = f\\big(${fmt(w, 1)}\\,l(t) + ${fmt(wr, 1)}\\,x(t-1)\\big), \\quad x(0) = 0`}</Tex>
          </div>
        </div>
      </div>
      <Controls>
        <Slider label={<Tex>{'w'}</Tex>} min={-1} max={2} step={0.1} value={w} onChange={setW} format={(v) => fmt(v, 1)} width={150} />
        <Slider label={<Tex>{'\\hat w'}</Tex>} min={-1} max={2} step={0.1} value={wr} onChange={setWr} format={(v) => fmt(v, 1)} width={150} />
        <Segmented
          size="sm"
          label={
            <>
              attivazione <Tex>{'f'}</Tex>
            </>
          }
          value={act}
          onChange={setAct}
          options={[
            { value: 'lin', label: 'lineare' },
            { value: 'sig', label: 'sigmoide' },
          ]}
        />
      </Controls>
      <p className="wnote">
        Bias <Tex>{'\\theta = 0'}</Tex>. La parte nuova rispetto a un neurone normale è il termine <Tex>{'\\hat w\\,x(t-1)'}</Tex>.
      </p>
      <Tasks
        items={[
          { label: 'Risolvi l’esercizio: trova w e ŵ (con unità lineare) per cui lo stato conta gli «1» ricevuti.', done: seen.ok },
          { label: 'Con quei pesi cambia la sequenza di input: lo stato continua a contare, qualunque sia la sequenza.', done: seen.ok2 },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 20.5: sistema a transizione di stato */

export function StateSystem() {
  const [t, setT] = useState(3)
  const seen = useLatch({ one: t === 1, all: t === 5 })
  const N = 5
  return (
    <div>
      <div className="ss20">
        <div className="pipe16__scroll">
          <svg className="sq20" viewBox="0 0 520 150" style={{ minWidth: 440 }} role="img" aria-label="Formazione dello stato nel tempo: lo stato al tempo t codifica la sotto-sequenza fino a t">
            {Array.from({ length: N }, (_, i) => N - 1 - i).map((i) =>
              i < t ? (
                <rect
                  key={i}
                  className={'sq20__nest' + (i === t - 1 ? ' is-hot' : '')}
                  x={sx(0) - 24 - (i + 1) * 4}
                  y={64 - 24 - (i + 1) * 4}
                  width={i * STEP + 48 + (i + 1) * 8}
                  height={48 + (i + 1) * 8}
                  rx={10}
                />
              ) : null,
            )}
            <Chain n={N} y={64} hot={(i) => i < t} />
            {Array.from({ length: N }, (_, i) => (
              <text key={i} className={'sq20__xt' + (i === t - 1 ? ' is-hot' : '')} x={sx(i)} y={20} textAnchor="middle">
                x({i + 1})
              </text>
            ))}
            <text className="sq20__cap" x={sx(0) - 30} y={136}>
              x({t}) codifica la sotto-sequenza{' '}
              {Array.from({ length: t }, (_, i) => `l${i + 1}`).join(' ')}
            </text>
          </svg>
        </div>
        <svg className="ru20 ru20--small" viewBox="0 0 200 210" role="img" aria-label="Modello grafico: input l, stato x con auto-anello di ritardo, uscita y">
          <defs>
            <marker id="ss20a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10z" className="ru20__head" />
            </marker>
          </defs>
          <line className="ru20__arrow" x1={80} y1={182} x2={80} y2={140} markerEnd="url(#ss20a)" />
          <line className="ru20__arrow" x1={80} y1={98} x2={80} y2={70} markerEnd="url(#ss20a)" />
          <line className="ru20__arrow" x1={80} y1={30} x2={80} y2={8} markerEnd="url(#ss20a)" />
          <path className="ru20__arrow ru20__arrow--thin" d="M74,186C30,150 30,80 68,60" markerEnd="url(#ss20a)" />
          <path className="ru20__loop" d="M98,108C130,90 160,100 160,112" markerEnd="url(#ss20a)" />
          <path className="ru20__loop" d="M160,146C150,166 118,160 98,134" markerEnd="url(#ss20a)" />
          <circle className="ru20__unit" cx={80} cy={50} r={19} />
          <circle className="ru20__unit" cx={80} cy={120} r={19} />
          <rect className="ru20__q" x={144} y={114} width={34} height={32} rx={4} />
          <text className="ru20__t" x={161} y={135} textAnchor="middle">
            {svgScript('q', '−1', 'sup')}
          </text>
          <text className="ru20__t" x={80} y={204} textAnchor="middle">
            l
          </text>
          <text className="ru20__t" x={52} y={124} textAnchor="middle">
            x
          </text>
          <text className="ru20__t" x={96} y={14}>
            y
          </text>
        </svg>
      </div>
      <Controls>
        <Slider label={<>istante <Tex>{'t'}</Tex></>} min={1} max={5} step={1} value={t} onChange={setT} width={220} />
        <Legend items={[{ label: 'la sotto-sequenza riassunta dallo stato', color: 'var(--accent)', kind: 'area' }]} />
      </Controls>
      <Tasks
        items={[
          { label: 'Porta t a 1: lo stato codifica il solo primo elemento.', done: seen.one },
          { label: 'Porta t a 5: lo stato, di dimensione fissa, riassume tutta la sequenza.', done: seen.all },
        ]}
      />
    </div>
  )
}
