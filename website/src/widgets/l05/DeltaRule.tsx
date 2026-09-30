import { useState } from 'react'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Segmented, Slider } from '../../components/ui/Controls'

/**
 * Fig. 5.10 — la delta rule su una LTU con tre input (w₀ = 0).
 * Valori della figura: x = (1, 0, 1), w = (−0,2; 0,5; −0,2), target +1.
 * Con η = 0,3/1,4 un solo passo porta w₁ e w₃ a +0,1, come nelle slide.
 */

const X0 = [1, 0, 1]
const W0 = [-0.2, 0.5, -0.2]
const ETA0 = 0.3 / 1.4

const dot = (w: number[], x: number[]) => w.reduce((s, v, i) => s + v * x[i], 0)
const sign = (v: number) => (v >= 0 ? 1 : -1)

export function DeltaRule() {
  const [x, setX] = useState(X0)
  const [w, setW] = useState(W0)
  const [prev, setPrev] = useState<number[] | null>(null)
  const [y, setY] = useState<1 | -1>(1)
  const [eta, setEta] = useState(ETA0)
  const [log, setLog] = useState({ steps: 0, toggled: false, target: false })

  const net = dot(w, x)
  const out = sign(net)
  const delta = y - net
  const ok = out === y

  const step = () => {
    setPrev(w)
    setW(w.map((wj, j) => wj + eta * delta * x[j]))
    setLog((l) => ({ ...l, steps: l.steps + 1 }))
  }
  const reset = () => {
    setX(X0)
    setW(W0)
    setPrev(null)
    setY(1)
    setEta(ETA0)
  }
  const toggle = (j: number) => {
    setX(x.map((v, i) => (i === j ? 1 - v : v)))
    setPrev(null)
    setLog((l) => ({ ...l, toggled: true }))
  }

  const Y_IN = [58, 130, 202]
  return (
    <div className="delta">
      <div className="delta__scroll">
        <svg viewBox="0 0 660 262" className="delta__svg" role="img" aria-label="Unità a soglia con tre input, i pesi e l’uscita">
          <text x={46} y={22} className="delta__head" textAnchor="middle">
            input
          </text>
          <text x={210} y={22} className="delta__head" textAnchor="middle">
            pesi (w₀ = 0)
          </text>
          {Y_IN.map((yy, j) => {
            const changed = prev && Math.abs(prev[j] - w[j]) > 1e-9
            return (
              <g key={j}>
                <line x1={78} y1={yy} x2={330} y2={130} className={`delta__edge${x[j] ? ' is-on' : ''}`} />
                <g
                  className="delta__in"
                  onClick={() => toggle(j)}
                  role="button"
                  tabIndex={0}
                  aria-label={`input x${j + 1} = ${x[j]}, clic per cambiarlo`}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(j)}
                >
                  <rect x={20} y={yy - 22} width={52} height={44} rx={10} className={x[j] ? 'is-on' : undefined} />
                  <text x={46} y={yy + 6} textAnchor="middle">
                    {x[j]}
                  </text>
                  <text x={10} y={yy + 5} textAnchor="end" className="delta__sub">
                    x{'₁₂₃'[j]}
                  </text>
                </g>
                <g transform={`translate(${210} ${yy + (130 - yy) * 0.45 - 12})`}>
                  <rect x={-44} y={-15} width={88} height={30} rx={15} className={`delta__w${changed ? ' is-changed' : ''}`} />
                  <text y={5} textAnchor="middle" className="delta__wtxt">
                    {fmtW(w[j])}
                  </text>
                  {changed && prev && (
                    <text y={-22} textAnchor="middle" className="delta__old">
                      era {fmtW(prev[j])}
                    </text>
                  )}
                </g>
              </g>
            )
          })}
          <rect x={330} y={92} width={170} height={76} rx={14} className="delta__node" />
          <text x={415} y={126} textAnchor="middle" className="delta__node-t">
            h(x) = sign(wᵀx)
          </text>
          <text x={415} y={150} textAnchor="middle" className="delta__sub">
            wᵀx = {fmt(net, 2)}
          </text>
          <line x1={500} y1={130} x2={566} y2={130} className="delta__edge is-on" />
          <path d="M566,124 L578,130 L566,136 Z" className="delta__arrow" />
          <text x={612} y={137} textAnchor="middle" className={`delta__out${ok ? ' is-ok' : ' is-bad'}`}>
            {out > 0 ? '+1' : '−1'}
          </text>
          <text x={612} y={166} textAnchor="middle" className="delta__sub">
            target {y > 0 ? '+1' : '−1'}
          </text>
          <text x={612} y={186} textAnchor="middle" className={`delta__verdict${ok ? ' is-ok' : ' is-bad'}`}>
            {ok ? 'corretto' : 'sbagliato'}
          </text>
        </svg>
      </div>

      <div className="wgrid">
        <div className="wpanel">
          <div className="wpanel__title">Un passo della delta rule</div>
          <div className="wmath">
            <Tex>{`\\delta = y - \\mathbf{w}^T\\mathbf{x} = ${n(y)} - (${n(net)}) = ${n(delta)}`}</Tex>
          </div>
          <div className="wmath">
            <Tex>{`\\Delta w_j = \\eta\\,\\delta\\,x_j:\\quad ${x.map((xj) => n(eta * delta * xj)).join(';\\ ')}`}</Tex>
          </div>
          <p className="wnote">Gli input a 0 non cambiano il loro peso; con un errore positivo i pesi degli input attivi crescono.</p>
        </div>
        <div className="wside">
          <Segmented
            label="target y"
            size="sm"
            value={y}
            onChange={(v) => {
              setY(v)
              setPrev(null)
              setLog((l) => ({ ...l, target: true }))
            }}
            options={[
              { value: 1, label: '+1' },
              { value: -1, label: '−1' },
            ]}
          />
          <Slider label={<Tex>{'\\eta'}</Tex>} min={0.05} max={0.5} step={0.001} value={eta} onChange={setEta} format={(v) => fmt(v, 3)} />
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={step}>
              Applica la delta rule
            </Btn>
            <Btn icon="reset" onClick={reset} title="Valori della figura" />
          </div>
          <Readout
            label="uscita"
            tone={ok ? 'green' : 'red'}
            value={out > 0 ? '+1' : '−1'}
            sub={ok ? 'classificato bene' : 'errore di classificazione'}
          />
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Applica la delta rule una volta: w₁ e w₃ diventano +0,1 e l’uscita diventa +1.', done: log.steps > 0 },
          { label: 'Clicca un input per metterlo a 0 o a 1: solo i pesi degli input attivi vengono corretti.', done: log.toggled },
          { label: 'Cambia il target in −1 e correggi di nuovo: ora i pesi scendono.', done: log.target && log.steps > 1 },
        ]}
      />
    </div>
  )
}

const fmtW = (v: number) => (v > 0 ? '+' : '') + fmt(v, 2)
const n = (v: number) => fmt(v, 2).replace(',', '{,}').replace('−', '-')
