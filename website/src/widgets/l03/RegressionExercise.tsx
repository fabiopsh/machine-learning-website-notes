import { useState } from 'react'
import { Axes, Dot, FnPath, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'

const PTS = [
  { x: 1, y: 2.1 },
  { x: 2, y: 3.9 },
  { x: 3, y: 6.1 },
  { x: 4, y: 8.4 },
  { x: 5, y: 9.8 },
]

// minimi quadrati in forma chiusa (regressione lineare semplice)
const mx = PTS.reduce((s, p) => s + p.x, 0) / PTS.length
const my = PTS.reduce((s, p) => s + p.y, 0) / PTS.length
const LS_W1 = PTS.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / PTS.reduce((s, p) => s + (p.x - mx) ** 2, 0)
const LS_W0 = my - LS_W1 * mx

const mse = (w1: number, w0: number) => PTS.reduce((s, p) => s + (p.y - (w1 * p.x + w0)) ** 2, 0) / PTS.length

/** L'esercizio di regressione: cerca tu la retta, poi guarda cosa trova l'algoritmo. */
export function RegressionExercise() {
  const [w1, setW1] = useState(1)
  const [w0, setW0] = useState(1.5)
  const E = mse(w1, w0)
  const E2x = mse(2, 0)

  const seen = useLatch({ twox: Math.abs(w1 - 2) < 0.01 && Math.abs(w0) < 0.01, better: E < E2x - 1e-4 })

  return (
    <div>
      <div className="wgrid">
        <Plot xDomain={[0, 6]} yDomain={[0, 12]} aspect={0.72}>
          <Axes xTicks={[0, 1, 2, 3, 4, 5, 6]} yTicks={[0, 2, 4, 6, 8, 10, 12]} xLabel="x" yLabel="f(x)" />
          <FnPath f={(x) => w1 * x + w0} color="var(--c-red)" width={2.4} />
          {PTS.map((p, i) => (
            <Polyline
              key={i}
              pts={[
                { x: p.x, y: p.y },
                { x: p.x, y: w1 * p.x + w0 },
              ]}
              color="var(--c-green)"
              width={2}
            />
          ))}
          {PTS.map((p, i) => (
            <Dot key={i} x={p.x} y={p.y} r={5} color="var(--ink)" />
          ))}
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">{tx('L’ipotesi', 'The hypothesis')}</div>
            <div className="wmath">
              <Tex>{`h_{\\mathbf{w}}(x) = w_1 x + w_0 = ${fmt(w1).replace(',', '{,}')}\\,x ${w0 >= 0 ? '+' : '-'} ${fmt(Math.abs(w0)).replace(',', '{,}')}`}</Tex>
            </div>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>x</th>
                <th>{tx('dato', 'target')}</th>
                <th>h(x)</th>
                <th>{tx('errore', 'error')}</th>
              </tr>
            </thead>
            <tbody>
              {PTS.map((p) => {
                const hx = w1 * p.x + w0
                return (
                  <tr key={p.x}>
                    <td>{p.x}</td>
                    <td>{fmt(p.y, 1)}</td>
                    <td>{fmt(hx, 2)}</td>
                    <td className={Math.abs(p.y - hx) < 0.45 ? 'is-small' : undefined}>{fmt(p.y - hx, 2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Readout label={tx('errore quadratico medio', 'mean squared error')} tone="accent" value={fmt(E, 3)} sub={`${tx('con', 'with')} f(x) = 2x: ${fmt(E2x, 3)}`} />
        </div>
      </div>
      <Controls>
        <Slider label={<Tex>{'w_1'}</Tex>} min={-1} max={4} step={0.01} value={w1} onChange={setW1} format={(v) => fmt(v)} />
        <Slider label={<Tex>{'w_0'}</Tex>} min={-4} max={4} step={0.01} value={w0} onChange={setW0} format={(v) => fmt(v)} />
        <Btn
          variant="soft"
          onClick={() => {
            setW1(2)
            setW0(0)
          }}
        >
          {tx('Prova', 'Try')} <Tex>{'f(x) = 2x'}</Tex>
        </Btn>
        <Btn
          icon="sparkle"
          onClick={() => {
            setW1(+LS_W1.toFixed(4))
            setW0(+LS_W0.toFixed(4))
          }}
        >
          {tx('La retta che minimizza l’errore', 'The line minimizing error')}
        </Btn>
      </Controls>
      <Tasks
        items={[
          { label: tx('Prova l’ipotesi spontanea f(x) = 2x: gli errori sono piccoli su tutti i punti.', 'Try the natural hypothesis f(x) = 2x: errors are small across all points.'), done: seen.twox },
          { label: tx('Trova una retta con errore ancora più basso di f(x) = 2x.', 'Find a line with an even lower error than f(x) = 2x.'), done: seen.better },
        ]}
      />
    </div>
  )
}
