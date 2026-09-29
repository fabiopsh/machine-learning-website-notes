import { useState } from 'react'
import { Axes, FnPath, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tex } from '../../components/prose/Tex'
import { Legend, Toggle } from '../../components/ui/Controls'
import { polyfit, polyval } from '../../lib/math'

/** Fig. 3.6: tra le infinite funzioni compatibili con i dati, quale scegliere? */

const PTS = [
  { x: 2.5, y: 0.25 },
  { x: 4, y: 0.35 },
  { x: 5.5, y: 0.8 },
  { x: 7, y: 1.35 },
  { x: 8.5, y: 0.35 },
  { x: 10, y: 2.3 },
]
const DIP = 4
const W_BLUE = polyfit(
  PTS.map((p) => p.x),
  PTS.map((p) => p.y),
  PTS.length - 1,
)
const red = (x: number) => 0.2 * x - 0.4
const blue = (x: number) => polyval(W_BLUE, x)
const greenPts = PTS.filter((_, i) => i !== DIP)
const green = (x: number) => {
  for (let i = 0; i < greenPts.length - 1; i++) {
    const a = greenPts[i]
    const b = greenPts[i + 1]
    if (x >= a.x && x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x)
  }
  return NaN
}

const H = [
  { key: 'red', name: 'ipotesi lineare', f: red, color: 'var(--c-red)' },
  { key: 'green', name: 'spezzata', f: green, color: 'var(--c-green)' },
  { key: 'blue', name: 'polinomio che passa per tutti i punti', f: blue, color: 'var(--c-blue)' },
] as const

const mse = (f: (x: number) => number) => PTS.reduce((s, p) => s + (p.y - f(p.x)) ** 2, 0) / PTS.length

export function HypothesesChoice() {
  const [show, setShow] = useState<Record<string, boolean>>({ red: true, green: true, blue: true })
  const [hx, setHx] = useState<number | null>(null)
  return (
    <div>
      <div className="wbar">
        <Legend items={H.filter((h) => show[h.key]).map((h) => ({ label: h.name, color: h.color }))} />
      </div>
      <Plot
        xDomain={[0, 11]}
        yDomain={[-0.4, 2.8]}
        aspect={0.5}
        onPointerMove={(p) => setHx(p.x)}
        onPointerLeave={() => setHx(null)}
        overlay={({ x, y }) =>
          hx !== null && hx > 1.5 && hx < 10.5 ? (
            <div className="ptip" style={{ left: x(hx), top: y(2.6) }}>
              x = <b>{fmt(hx, 1)}</b>
              {H.filter((h) => show[h.key]).map((h) => (
                <span key={h.key}>
                  {' '}
                  · <span style={{ color: h.color }}>●</span>{' '}
                  <b>{fmt(h.f(hx), 2)}</b>
                </span>
              ))}
            </div>
          ) : null
        }
      >
        <Axes xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[0, 1, 2]} xLabel="x" yLabel="f(x)" />
        {hx !== null && (
          <Polyline
            pts={[
              { x: hx, y: -0.4 },
              { x: hx, y: 2.8 },
            ]}
            color="var(--ink-4)"
            width={1}
            dash="3 3"
          />
        )}
        {show.red && <FnPath f={red} color="var(--c-red)" width={2.4} />}
        {show.green && <FnPath f={green} color="var(--c-green)" width={2.4} from={2.5} to={10} />}
        {show.blue && <FnPath f={blue} color="var(--c-blue)" width={2.4} from={1.8} to={10.3} />}
        <Crosses />
        <Label x={10} y={2.3} dx={-10} dy={-12} anchor="end" className="plot-label--muted">
          punto in cui conosciamo f(x)
        </Label>
      </Plot>
      <div className="hchoice__rows">
        {H.map((h) => (
          <div key={h.key} className="hchoice__row">
            <Toggle label={h.name} checked={show[h.key]} onChange={(v) => setShow((s) => ({ ...s, [h.key]: v }))} />
            <span className="hchoice__err">
              errore sui dati <b>{fmt(mse(h.f), 3)}</b>
            </span>
          </div>
        ))}
      </div>
      <p className="wnote">
        La curva blu ha errore <strong>zero</strong> sui dati noti, ma tra un punto e l’altro fa quello che vuole. Quale delle tre
        daresti in mano a qualcuno che deve predire <Tex>{'f(x)'}</Tex> in un punto nuovo?
      </p>
    </div>
  )
}

function Crosses() {
  const { x, y } = usePlot()
  return (
    <g>
      {PTS.map((p, i) => (
        <g key={i} transform={`translate(${x(p.x)} ${y(p.y)})`}>
          <path d="M-5,-5L5,5M-5,5L5,-5" stroke="var(--plot-bg)" strokeWidth={5} strokeLinecap="round" />
          <path d="M-5,-5L5,5M-5,5L5,-5" stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}
