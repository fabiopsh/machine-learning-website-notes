import { useState } from 'react'
import { Axes, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { normCdf, normPdf } from '../../lib/math'

export function GaussianExplorer() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [t, setT] = useState(-1.2)
  const [hover, setHover] = useState<number | null>(null)
  const [seen, setSeen] = useState({ std196: false, wide: false, shift: false })
  const area = normCdf((t - mu) / sigma)
  const std = Math.abs(mu) < 0.05 && Math.abs(sigma - 1) < 0.03
  const at196 = std && Math.abs(t + 1.96) < 0.04

  const update = (next: Partial<{ mu: number; sigma: number; t: number }>) => {
    if (next.mu !== undefined) setMu(next.mu)
    if (next.sigma !== undefined) setSigma(next.sigma)
    if (next.t !== undefined) setT(next.t)
    const m = next.mu ?? mu
    const s = next.sigma ?? sigma
    const tt = next.t ?? t
    setSeen((v) => ({
      std196: v.std196 || (Math.abs(m) < 0.05 && Math.abs(s - 1) < 0.03 && Math.abs(tt + 1.96) < 0.04),
      wide: v.wide || s > 1.8,
      shift: v.shift || Math.abs(m) > 1.2,
    }))
  }

  return (
    <div>
      <Plot
        xDomain={[-4.5, 4.5]}
        yDomain={[0, 0.7]}
        aspect={0.42}
        minH={240}
        onPointerMove={(p) => setHover(p.x)}
        onPointerLeave={() => setHover(null)}
        overlay={({ x, y }) =>
          hover !== null && hover > -4.5 && hover < 4.5 ? (
            <div className="ptip" style={{ left: x(hover), top: y(normPdf(hover, mu, sigma)) }}>
              f(<b>{fmt(hover)}</b>) = <b>{fmt(normPdf(hover, mu, sigma), 3)}</b>
            </div>
          ) : null
        }
      >
        <Axes xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[0, 0.2, 0.4, 0.6]} xLabel="x" yLabel="f(x)" />
        <Tail mu={mu} sigma={sigma} t={t} />
        <SigmaMarks mu={mu} sigma={sigma} />
        <FnPath f={(v) => normPdf(v, mu, sigma)} color="var(--c-blue)" width={2.5} />
        <Label x={t} y={0} dy={-8} dx={-6} anchor="end" className="plot-label--strong">
          {fmt(area * 100, 1)}%
        </Label>
        <Handle x={t} y={0} axis="x" label={tx('soglia', 'threshold')} onMove={(p) => update({ t: p.x })} bounds={{ x: [-4.4, 4.4] }} />
        {hover !== null && (
          <Polyline
            pts={[
              { x: hover, y: 0 },
              { x: hover, y: normPdf(hover, mu, sigma) },
            ]}
            color="var(--ink-4)"
            width={1}
            dash="3 3"
          />
        )}
      </Plot>
      <div className="wmath gauss__formula">
        <Tex display>{`f(x) = \\frac{1}{${fmt(sigma).replace(',', '{,}')}\\sqrt{2\\pi}}\\, e^{-(x ${mu >= 0 ? '-' : '+'} ${fmt(Math.abs(mu)).replace(',', '{,}')})^2 / (2 \\cdot ${fmt(sigma * sigma).replace(',', '{,}')})}`}</Tex>
      </div>
      <Controls>
        <Slider label={<Tex>{'\\mu'}</Tex>} min={-2.5} max={2.5} step={0.05} value={mu} onChange={(v) => update({ mu: v })} format={(v) => fmt(v)} />
        <Slider label={<Tex>{'\\sigma'}</Tex>} min={0.6} max={2.5} step={0.01} value={sigma} onChange={(v) => update({ sigma: v })} format={(v) => fmt(v)} />
        <Readout label={tx(<>area a sinistra della soglia</>, <>area to the left of the threshold</>)} tone="accent" value={`${fmt(area * 100, 2)}%`} sub={tx(`soglia x = ${fmt(t)}`, `threshold x = ${fmt(t)}`)} />
        <Btn
          icon="reset"
          onClick={() => {
            update({ mu: 0, sigma: 1, t: -1.96 })
          }}
          variant="soft"
        >
          {tx('Normale standard, soglia −1,96', 'Standard normal, threshold −1.96')}
        </Btn>
      </Controls>
      {at196 && (
        <p className="wnote" style={{ marginTop: 10 }}>
          {tx(
            <>
              Esatto: per la normale standard l’area a sinistra di −1,96 vale circa il <strong>2,5%</strong>.
            </>,
            <>
              Exactly: for the standard normal the area to the left of −1.96 is about <strong>2.5%</strong>.
            </>,
          )}
        </p>
      )}
      <Tasks
        items={[
          {
            label: tx(
              'Torna alla normale standard (μ = 0, σ = 1) con la soglia in −1,96: l’area vale il 2,5%.',
              'Go back to the standard normal (μ = 0, σ = 1) with the threshold at −1.96: the area is 2.5%.',
            ),
            done: seen.std196,
          },
          {
            label: tx(
              'Aumenta σ: la campana si allarga e si abbassa, perché l’area totale resta sempre 1.',
              'Increase σ: the bell gets wider and lower, because the total area always remains 1.',
            ),
            done: seen.wide,
          },
          { label: tx('Sposta μ: la curva trasla senza cambiare forma.', 'Move μ: the curve shifts without changing shape.'), done: seen.shift },
        ]}
      />
    </div>
  )
}

function Tail({ mu, sigma, t }: { mu: number; sigma: number; t: number }) {
  const { x, y, clipId } = usePlot()
  const a = -4.5
  const N = 120
  let d = `M${x(a)},${y(0)}`
  for (let i = 0; i <= N; i++) {
    const v = a + ((t - a) * i) / N
    d += `L${x(v).toFixed(1)},${y(normPdf(v, mu, sigma)).toFixed(1)}`
  }
  d += `L${x(t)},${y(0)}Z`
  return <path d={d} fill="var(--accent)" opacity={0.16} clipPath={`url(#${clipId})`} />
}

function SigmaMarks({ mu, sigma }: { mu: number; sigma: number }) {
  const { x, y } = usePlot()
  const top = normPdf(mu, mu, sigma)
  return (
    <g>
      <line x1={x(mu)} x2={x(mu)} y1={y(0)} y2={y(top)} stroke="var(--ink-4)" strokeDasharray="3 4" />
      <line x1={x(mu + sigma)} x2={x(mu + sigma)} y1={y(0)} y2={y(normPdf(mu + sigma, mu, sigma))} stroke="var(--ink-4)" strokeDasharray="2 3" />
      <text className="plot-label plot-label--math" x={x(mu)} y={y(top) - 8} textAnchor="middle">
        μ
      </text>
      <text className="plot-label plot-label--math" x={x(mu + sigma) + 4} y={y(normPdf(mu + sigma, mu, sigma)) - 6}>
        μ+σ
      </text>
    </g>
  )
}
