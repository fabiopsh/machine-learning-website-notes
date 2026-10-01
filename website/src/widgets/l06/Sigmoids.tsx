import { useState } from 'react'
import { Axes, Dot, FnPath, Handle, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'
import { sigmoid } from './NetSvg'

/* ------------------------------------------------------------------ Fig. 6.10 */

const REF = [
  { a: 0.5, color: 'var(--c-green)' },
  { a: 1, color: 'var(--c-red)' },
  { a: 2, color: 'var(--c-blue)' },
]

export function Sigmoids() {
  const [s, setS] = useState(0) // a = 2^s
  const a = 2 ** s
  const seen = useLatch({ flat: a <= 0.13, step: a >= 30 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            ...REF.map((r) => ({ label: `a = ${fmt(r.a, 1)}`, color: r.color })),
            { label: `${tx('il tuo', 'your')} a = ${fmt(a, 2)}`, color: 'var(--c-violet)', kind: 'dash' as const },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <div>
          <div className="htf__title">{tx('Logistica, valori in [0, 1]', 'Logistic, values in [0, 1]')}</div>
          <Plot xDomain={[-10, 10]} yDomain={[-0.05, 1.05]} aspect={0.72} minH={200} maxH={300} margin={{ l: 36, r: 10, t: 10, b: 30 }}>
            <Axes xTicks={[-10, -5, 0, 5, 10]} yTicks={[0, 0.5, 1]} xLabel="x" />
            {REF.map((r) => (
              <FnPath key={r.a} f={(x) => sigmoid(x, r.a)} color={r.color} width={2} />
            ))}
            <FnPath f={(x) => sigmoid(x, a)} color="var(--c-violet)" width={2.4} dash="6 4" samples={600} />
            <Tangent a={a} />
          </Plot>
        </div>
        <div>
          <div className="htf__title">{tx('Tangente iperbolica, valori in [−1, +1]', 'Hyperbolic tangent, values in [−1, +1]')}</div>
          <Plot xDomain={[-10, 10]} yDomain={[-1.1, 1.1]} aspect={0.72} minH={200} maxH={300} margin={{ l: 36, r: 10, t: 10, b: 30 }}>
            <Axes xTicks={[-10, -5, 0, 5, 10]} yTicks={[-1, 0, 1]} xLabel="x" origin />
            <FnPath f={(x) => Math.tanh(x / 2)} color="var(--c-red)" width={2} />
            <FnPath f={(x) => 2 * sigmoid(x, a) - 1} color="var(--c-violet)" width={2.4} dash="6 4" samples={600} />
          </Plot>
        </div>
      </div>
      <div className="controls">
        <Slider
          label={
            <>
              {tx('pendenza ', 'slope ')}<Tex>a</Tex>
            </>
          }
          min={-4}
          max={6}
          step={0.05}
          value={s}
          onChange={setS}
          format={() => fmt(a, 2)}
          width={280}
        />
        <Btn onClick={() => setS(-4)}>a → 0</Btn>
        <Btn onClick={() => setS(6)}>a → ∞</Btn>
        <Readout label={tx('pendenza in 0', 'slope at 0')} value={fmt(a / 4, 3)} sub={tx('a/4 per la logistica', 'a/4 for logistic')} />
      </div>
      <Tasks
        items={[
          { label: tx('Porta a verso 0: la sigmoide diventa quasi piatta, cioè quasi lineare.', 'Bring a towards 0: the sigmoid becomes nearly flat, i.e., quasi-linear.'), done: seen.flat },
          { label: tx('Porta a verso ∞: diventa un gradino, cioè la LTU.', 'Bring a towards ∞: it becomes a step function, i.e., the LTU.'), done: seen.step },
        ]}
      />
    </div>
  )
}

/** tangente in 0 alla logistica: la zona semi-lineare */
function Tangent({ a }: { a: number }) {
  const k = a / 4
  const half = Math.min(10, 0.5 / k)
  return (
    <Polyline
      pts={[
        { x: -half, y: 0.5 - k * half },
        { x: half, y: 0.5 + k * half },
      ]}
      color="var(--ink-3)"
      width={1.4}
      dash="5 4"
    />
  )
}

/* ------------------------------------------------------------------ Fig. 6.11 */

const f = (x: number) => sigmoid(x)
const f1 = (x: number) => f(x) * (1 - f(x))
const f2 = (x: number) => f1(x) * (1 - 2 * f(x))

export function SigmoidDerivatives() {
  const [net, setNet] = useState(2.5)
  const moved = useLatch({ m: net !== 2.5 }).m
  const seen = useLatch({ zero: moved && Math.abs(net) < 0.15, sat: moved && Math.abs(net) > 4.5 })
  const sat = f1(net) < 0.05
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: <Tex>{'f_\\sigma'}</Tex>, color: 'var(--ink)' },
            { label: <Tex>{"f'_\\sigma"}</Tex>, color: 'var(--c-red)' },
            { label: <Tex>{"f''_\\sigma"}</Tex>, color: 'var(--c-green)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={[-6, 6]} yDomain={[-0.15, 1.05]} aspect={0.62}>
          <Axes xTicks={[-6, -4, -2, 0, 2, 4, 6]} yTicks={[0, 0.25, 0.5, 0.75, 1]} xLabel="net" origin />
          <Zone />
          <FnPath f={f} color="var(--ink)" width={2.4} />
          <FnPath f={f1} color="var(--c-red)" width={2.4} />
          <FnPath f={f2} color="var(--c-green)" width={2.2} />
          <Polyline
            pts={[
              { x: net, y: -0.15 },
              { x: net, y: 1.05 },
            ]}
            color="var(--ink-4)"
            width={1}
            dash="3 3"
          />
          <Dot x={net} y={f(net)} color="var(--ink)" r={4.5} />
          <Dot x={net} y={f1(net)} color="var(--c-red)" r={4.5} />
          <Dot x={net} y={f2(net)} color="var(--c-green)" r={4} />
          <Handle x={net} y={-0.15} axis="x" label={tx('input netto', 'net input')} onMove={(p) => setNet(Math.round(p.x * 20) / 20)} />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label={<Tex>{'f_\\sigma(net)'}</Tex>} value={fmt(f(net), 3)} />
            <Readout label={<Tex>{"f'_\\sigma = f(1-f)"}</Tex>} tone="red" value={fmt(f1(net), 3)} />
            <Readout label={<Tex>{"f''_\\sigma"}</Tex>} tone="green" value={fmt(f2(net), 3)} />
          </div>
          <div className="wpanel">
            <div className="wpanel__title">{tx('Quanto è grande la correzione', 'Magnitude of correction')}</div>
            <div className="sig6__bar">
              <span style={{ width: `${(f1(net) / 0.25) * 100}%` }} />
            </div>
            <p className="wnote">
              {tx('Il delta contiene ', 'Delta contains ')}<Tex>{"f'_\\sigma(net)"}</Tex>:{' '}
              {sat
                ? tx('unità satura, i pesi cambiano lentissimamente.', 'saturated unit, weights change very slowly.')
                : Math.abs(net) < 1
                  ? tx('zona quasi lineare, delta grandi.', 'quasi-linear region, large deltas.')
                  : tx('correzione intermedia.', 'intermediate correction.')}
            </p>
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: tx('Porta net a 0: la derivata è massima (vale 0,25), la zona quasi lineare.', 'Bring net to 0: derivative is maximum (0.25), quasi-linear region.'), done: seen.zero },
          { label: tx('Porta net lontano da 0: la derivata è quasi nulla, l’unità è satura.', 'Move net away from 0: derivative is near zero, unit is saturated.'), done: seen.sat },
        ]}
      />
    </div>
  )
}

function Zone() {
  const { x, y, m, ih } = usePlot()
  const lo = 2.94 // f' < 0,05 per |net| > circa 2,94
  return (
    <g className="sig6__zone">
      <rect x={x(-6)} y={m.t} width={x(-lo) - x(-6)} height={ih} />
      <rect x={x(lo)} y={m.t} width={x(6) - x(lo)} height={ih} />
      <text x={x(-4.5)} y={y(0.95)} textAnchor="middle" className="plot-label plot-label--muted">
        {tx('saturazione', 'saturation')}
      </text>
      <text x={x(4.5)} y={y(0.3)} textAnchor="middle" className="plot-label plot-label--muted">
        {tx('saturazione', 'saturation')}
      </text>
    </g>
  )
}
