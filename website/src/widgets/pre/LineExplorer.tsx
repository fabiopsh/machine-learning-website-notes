import { useState } from 'react'
import { Axes, Dot, FnPath, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Controls, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'

const texNum = (v: number) => fmt(Math.abs(v)).replace(',', '{,}')

/** La retta y = m·x + q: pendenza e intercetta regolabili, con il «gradino» che mostra la pendenza. */
export function LineExplorer() {
  const [m, setM] = useState(1)
  const [q, setQ] = useState(0)
  const seen = useLatch({ flat: m === 0, down: m < 0, shift: Math.abs(q) >= 1 })
  const f = (x: number) => m * x + q

  return (
    <div>
      <Plot xDomain={[-4, 4]} yDomain={[-4, 4]} aspect={0.62} minH={260} ariaLabel={tx('Grafico di una retta', 'Plot of a straight line')}>
        <Axes xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} xLabel="x" yLabel="y" origin />
        <FnPath f={f} color="var(--c-red)" width={2.5} />
        {/* il gradino: avanti di 1, su (o giù) di m */}
        <Polyline
          pts={[
            { x: 1, y: f(1) },
            { x: 2, y: f(1) },
            { x: 2, y: f(2) },
          ]}
          color="var(--c-green)"
          width={2}
          dash="5 4"
        />
        <Label x={1.5} y={f(1)} dy={m >= 0 ? 16 : -8} anchor="middle">
          +1
        </Label>
        {m !== 0 && (
          <Label x={2} y={(f(1) + f(2)) / 2} dx={8} dy={4}>
            {`${m > 0 ? '+' : '−'}${fmt(Math.abs(m))}`}
          </Label>
        )}
        <Dot x={0} y={q} color="var(--c-blue)" r={5} />
        <Label x={0} y={q} dx={-10} dy={-8} anchor="end" className="plot-label--strong">
          {`q = ${fmt(q)}`}
        </Label>
      </Plot>
      <div className="wmath">
        <Tex display>{`y = ${m < 0 ? '-' : ''}${texNum(m)}\\,x ${q < 0 ? '-' : '+'} ${texNum(q)}`}</Tex>
      </div>
      <Controls>
        <Slider label={<Tex>{'m'}</Tex>} min={-3} max={3} step={0.25} value={m} onChange={setM} format={(v) => fmt(v)} />
        <Slider label={<Tex>{'q'}</Tex>} min={-3} max={3} step={0.25} value={q} onChange={setQ} format={(v) => fmt(v)} />
        <Readout
          label={tx('pendenza', 'slope')}
          tone="green"
          value={fmt(m)}
          sub={m > 0 ? tx('la retta sale', 'the line goes up') : m < 0 ? tx('la retta scende', 'the line goes down') : tx('la retta è piatta', 'the line is flat')}
        />
      </Controls>
      <Tasks
        items={[
          { label: tx(<>Porta <Tex>{'m'}</Tex> a 0: la retta diventa orizzontale.</>, <>Set <Tex>{'m'}</Tex> to 0: the line becomes horizontal.</>), done: seen.flat },
          { label: tx(<>Rendi <Tex>{'m'}</Tex> negativo: la retta scende.</>, <>Make <Tex>{'m'}</Tex> negative: the line goes down.</>), done: seen.down },
          {
            label: tx(
              <>Cambia <Tex>{'q'}</Tex>: la retta si sposta in su o in giù senza cambiare inclinazione.</>,
              <>Change <Tex>{'q'}</Tex>: the line moves up or down without changing its tilt.</>,
            ),
            done: seen.shift,
          },
        ]}
      />
    </div>
  )
}
