import { useMemo, useState } from 'react'
import { Axes, FnPath, Handle, Plot } from '../components/plot/Plot'
import { fmt } from '../components/plot/scale'
import { Slider } from '../components/ui/Controls'
import { Tex } from '../components/prose/Tex'
import { tx } from '../lib/i18n'
import { polyfit, polyval, sse } from '../lib/math'

/** Piccolo laboratorio in copertina: trascina i dati e cambia la complessità del modello. */
const START = [
  { x: 0.04, y: 0.3 },
  { x: 0.17, y: 0.86 },
  { x: 0.3, y: 0.95 },
  { x: 0.45, y: 0.12 },
  { x: 0.58, y: -0.55 },
  { x: 0.72, y: -0.92 },
  { x: 0.86, y: -0.5 },
  { x: 0.97, y: 0.18 },
]

export function HeroFit() {
  const [pts, setPts] = useState(START)
  const [M, setM] = useState(3)
  const w = useMemo(
    () =>
      polyfit(
        pts.map((p) => p.x),
        pts.map((p) => p.y),
        M,
      ),
    [pts, M],
  )
  const E = sse(
    w,
    pts.map((p) => p.x),
    pts.map((p) => p.y),
  )
  return (
    <div className="herofit">
      <Plot xDomain={[0, 1]} yDomain={[-1.6, 1.6]} aspect={0.7} minH={260} maxH={380} margin={{ l: 30, b: 28, r: 12, t: 12 }}>
        <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} />
        <FnPath f={(x) => polyval(w, x)} color="var(--c-orange)" width={2.5} />
        {pts.map((p, i) => (
          <Handle
            key={i}
            x={p.x}
            y={p.y}
            r={5.5}
            color="var(--c-blue)"
            label={`${tx('dato', 'data point')} ${i + 1}`}
            bounds={{ x: [0.01, 0.99], y: [-1.5, 1.5] }}
            onMove={(q) => setPts((ps) => ps.map((pp, j) => (j === i ? q : pp)))}
          />
        ))}
      </Plot>
      <div className="herofit__foot">
        <Slider
          label={
            <>
              {tx('grado del polinomio', 'polynomial degree')} <Tex>M</Tex>
            </>
          }
          min={0}
          max={7}
          step={1}
          value={M}
          onChange={setM}
        />
        <div className="herofit__err">
          <span>{tx('errore sui dati', 'error on the data')}</span>
          <strong>{fmt(E, 3)}</strong>
        </div>
      </div>
      <p className="herofit__hint">
        {tx(
          <>
            Trascina i punti blu. Con <Tex>M = 7</Tex> la curva passa per tutti: è davvero la migliore?
          </>,
          <>
            Drag the blue points. With <Tex>M = 7</Tex> the curve goes through all of them: is it really the best?
          </>,
        )}
      </p>
    </div>
  )
}
