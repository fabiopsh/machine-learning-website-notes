import { useMemo, useState } from 'react'
import { Axes, FnPath, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, mean, normPdf, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/** Stima di densità: la loss −ln h(x_p) premia le densità alte proprio dove stanno i dati. */
export function DensityML() {
  const data = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 9 }, () => 0.6 + gauss(r) * 0.9)
  }, [])
  const muML = mean(data)
  const sML = Math.sqrt(mean(data.map((v) => (v - muML) ** 2)))
  const [mu, setMu] = useState(-1.2)
  const [s, setS] = useState(1.6)
  const loss = data.map((v) => -Math.log(normPdf(v, mu, s)))
  const L = loss.reduce((a, b) => a + b, 0)
  const Lml = data.reduce((a, v) => a - Math.log(normPdf(v, muML, sML)), 0)

  const seen = useLatch({ ml: L - Lml < 0.05, narrow: s < 0.5 })

  return (
    <div>
      <Plot xDomain={[-3.5, 4.5]} yDomain={[0, 1]} aspect={0.42} minH={220}>
        <Axes xTicks={[-3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[0, 0.5, 1]} xLabel="x" yLabel="h(x)" />
        <FnPath f={(v) => normPdf(v, mu, s)} color="var(--c-blue)" width={2.4} />
        {data.map((v, i) => (
          <Polyline
            key={i}
            pts={[
              { x: v, y: 0 },
              { x: v, y: normPdf(v, mu, s) },
            ]}
            color="var(--c-orange)"
            width={2}
          />
        ))}
        <Ticks data={data} />
      </Plot>
      <div className="wmath" style={{ textAlign: 'center', marginTop: 6 }}>
        <Tex>{`\\sum_p -\\ln h(x_p) = ${fmt(L, 2).replace(',', '{,}').replace('−', '-')}`}</Tex>
      </div>
      <Controls>
        <Slider label={<Tex>{'\\mu'}</Tex>} min={-2.5} max={3} step={0.01} value={mu} onChange={setMu} format={(v) => fmt(v)} />
        <Slider label={<Tex>{'\\sigma'}</Tex>} min={0.3} max={2.5} step={0.01} value={s} onChange={setS} format={(v) => fmt(v)} />
        <Readout label={tx('loss totale (−ln)', 'total loss (−ln)')} tone="accent" value={fmt(L, 2)} sub={tx(`minimo: ${fmt(Lml, 2)}`, `minimum: ${fmt(Lml, 2)}`)} />
        <Btn
          icon="sparkle"
          variant="soft"
          onClick={() => {
            setMu(+muML.toFixed(3))
            setS(+sML.toFixed(3))
          }}
        >
          {tx('Massima verosimiglianza', 'Maximum likelihood')}
        </Btn>
      </Controls>
      <Tasks
        items={[
          { label: tx('Sposta μ e σ finché la loss totale è minima: la campana si centra sui dati.', 'Adjust μ and σ until total loss is minimal: the bell curve centers on the data.'), done: seen.ml },
          { label: tx('Stringi molto σ: alcuni punti finiscono dove h(x) ≈ 0 e il loro −ln esplode.', 'Make σ very small: some points fall where h(x) ≈ 0 and their −ln explodes.'), done: seen.narrow },
        ]}
      />
    </div>
  )
}

function Ticks({ data }: { data: number[] }) {
  const { x, y } = usePlot()
  return (
    <g>
      {data.map((v, i) => (
        <circle key={i} cx={x(v)} cy={y(0)} r={4.5} fill="var(--c-orange)" stroke="var(--plot-bg)" strokeWidth={2} />
      ))}
    </g>
  )
}
