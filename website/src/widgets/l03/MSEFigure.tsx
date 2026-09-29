import { useState } from 'react'
import { Axes, Dot, FnPath, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Toggle } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

const PTS = [
  { x: 1, y: 6 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
  { x: 4, y: 10 },
]
const XA = 0.3
const XB = 4.7
// retta ottima ai minimi quadrati per questi punti: y = 1,4x + 3,5
const OPT = { w1: 1.4, w0: 3.5 }

/** Fig. 3.11: l'MSE come media dei quadrati delle distanze verticali. */
export function MSEFigure() {
  const [ya, setYa] = useState(4.4)
  const [yb, setYb] = useState(9.4)
  const [squares, setSquares] = useState(false)
  const [seen, setSeen] = useState({ sq: false, drag: false })
  const w1 = (yb - ya) / (XB - XA)
  const w0 = ya - w1 * XA
  const res = PTS.map((p) => p.y - (w1 * p.x + w0))
  const E = res.reduce((s, r) => s + r * r, 0) / PTS.length
  const Emin = PTS.reduce((s, p) => s + (p.y - (OPT.w1 * p.x + OPT.w0)) ** 2, 0) / PTS.length

  const reached = useLatch({ min: E - Emin < 0.02 })

  return (
    <div>
      <div className="wgrid">
        <Plot xDomain={[0, 5]} yDomain={[3, 11]} aspect={0.95} maxH={420}>
          <Axes xTicks={[0, 1, 2, 3, 4, 5]} yTicks={[4, 5, 6, 7, 8, 9, 10]} xLabel="x" yLabel="y" />
          {squares && <Squares w1={w1} w0={w0} />}
          <FnPath f={(x) => w1 * x + w0} color="var(--c-blue)" width={2.4} />
          {PTS.map((p, i) => (
            <Polyline
              key={i}
              pts={[
                { x: p.x, y: p.y },
                { x: p.x, y: w1 * p.x + w0 },
              ]}
              color="var(--c-green)"
              width={2.2}
            />
          ))}
          {PTS.map((p, i) => (
            <Dot key={i} x={p.x} y={p.y} r={5.5} color="var(--c-red)" />
          ))}
          <Handle
            x={XA}
            y={ya}
            axis="y"
            label="estremo sinistro della retta"
            onMove={(p) => {
              setYa(p.y)
              setSeen((s) => ({ ...s, drag: true }))
            }}
          />
          <Handle
            x={XB}
            y={yb}
            axis="y"
            label="estremo destro della retta"
            onMove={(p) => {
              setYb(p.y)
              setSeen((s) => ({ ...s, drag: true }))
            }}
          />
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">La retta</div>
            <div className="wmath">
              <Tex>{`h_{\\mathbf{w}}(x) = ${fmt(w1).replace(',', '{,}')}\\,x ${w0 >= 0 ? '+' : '-'} ${fmt(Math.abs(w0)).replace(',', '{,}')}`}</Tex>
            </div>
          </div>
          <div className="wpanel">
            <div className="wpanel__title">Il calcolo</div>
            <div className="wmath mse__calc">
              <Tex>{`E(\\mathbf{w}) = \\tfrac{1}{4}\\big(${res.map((r) => `${r < 0 ? '(' : ''}${fmt(r).replace(',', '{,}').replace('−', '-')}${r < 0 ? ')' : ''}^2`).join(' + ')}\\big)`}</Tex>
            </div>
          </div>
          <Readout label="MSE" tone="accent" value={fmt(E, 3)} sub={`il minimo possibile è ${fmt(Emin, 3)}`} />
          <Toggle
            label="disegna i quadrati degli errori"
            checked={squares}
            onChange={(v) => {
              setSquares(v)
              setSeen((s) => ({ ...s, sq: true }))
            }}
          />
          <Btn
            icon="sparkle"
            variant="soft"
            onClick={() => {
              setYa(OPT.w1 * XA + OPT.w0)
              setYb(OPT.w1 * XB + OPT.w0)
            }}
          >
            Retta a errore minimo
          </Btn>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Trascina gli estremi della retta e guarda come cambiano i segmenti verdi.', done: seen.drag },
          { label: 'Accendi i quadrati: l’MSE è la media delle loro aree.', done: seen.sq },
          { label: 'Porta l’MSE al minimo (a mano o con il pulsante).', done: reached.min },
        ]}
      />
    </div>
  )
}

function Squares({ w1, w0 }: { w1: number; w0: number }) {
  const { x, y } = usePlot()
  return (
    <g>
      {PTS.map((p, i) => {
        const yl = w1 * p.x + w0
        const side = Math.abs(y(p.y) - y(yl))
        const top = Math.min(y(p.y), y(yl))
        return <rect key={i} x={x(p.x)} y={top} width={side} height={side} fill="var(--c-green)" opacity={0.14} stroke="var(--c-green)" strokeOpacity={0.5} />
      })}
    </g>
  )
}
