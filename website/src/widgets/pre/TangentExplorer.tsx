import { useState } from 'react'
import { Axes, FnPath, Handle, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Controls, Legend, Readout, Segmented } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { useLatch } from '../../lib/useLatch'

type Kind = 'quad' | 'cubic' | 'sin'

const FUNCS: Record<Kind, { f: (x: number) => number; d: (x: number) => number; tex: string; dtex: string }> = {
  quad: { f: (x) => x * x, d: (x) => 2 * x, tex: 'f(x) = x^2', dtex: "f'(x) = 2x" },
  cubic: { f: (x) => (x * x * x) / 3 - x, d: (x) => x * x - 1, tex: 'f(x) = \\tfrac{1}{3}x^3 - x', dtex: "f'(x) = x^2 - 1" },
  sin: { f: (x) => 2 * Math.sin(x), d: (x) => 2 * Math.cos(x), tex: 'f(x) = 2\\sin x', dtex: "f'(x) = 2\\cos x" },
}

const OPTIONS: { value: Kind; label: string }[] = [
  { value: 'quad', label: tx('parabola', 'parabola') },
  { value: 'cubic', label: tx('cubica', 'cubic') },
  { value: 'sin', label: tx('onda', 'wave') },
]

/** La derivata come pendenza della retta tangente: punto trascinabile su tre funzioni. */
export function TangentExplorer() {
  const [kind, setKind] = useState<Kind>('quad')
  const [a, setA] = useState(1)
  const { f, d, tex, dtex } = FUNCS[kind]
  const slope = d(a)
  const seen = useLatch({ zero: Math.abs(slope) < 0.08, down: slope < -0.5, other: kind !== 'quad' })
  const tangent = (x: number) => f(a) + slope * (x - a)

  return (
    <div>
      <div className="wbar">
        <Segmented label={tx('funzione', 'function')} value={kind} options={OPTIONS} onChange={setKind} size="sm" />
        <Legend
          items={[
            { label: tx('funzione', 'function'), color: 'var(--c-blue)', kind: 'line' },
            { label: tx('retta tangente', 'tangent line'), color: 'var(--c-red)', kind: 'line' },
          ]}
        />
      </div>
      <Plot xDomain={[-3.2, 3.2]} yDomain={[-3.5, 5]} aspect={0.56} minH={260} ariaLabel={tx('Funzione e retta tangente', 'Function and tangent line')}>
        <Axes xTicks={[-3, -2, -1, 0, 1, 2, 3]} yTicks={[-2, 0, 2, 4]} xLabel="x" yLabel="f(x)" origin />
        <FnPath f={f} color="var(--c-blue)" width={2.5} />
        <FnPath f={tangent} color="var(--c-red)" width={2} from={a - 1.3} to={a + 1.3} />
        <Handle x={a} y={f(a)} axis="x" label={tx('punto', 'point')} onMove={(p) => setA(Math.round(p.x * 50) / 50)} bounds={{ x: [-3, 3] }} />
      </Plot>
      <div className="wmath">
        <Tex display>{`${tex} \\qquad ${dtex}`}</Tex>
      </div>
      <Controls>
        <Readout label={<Tex>{'x'}</Tex>} tone="accent" value={fmt(a)} />
        <Readout label={<Tex>{'f(x)'}</Tex>} tone="blue" value={fmt(f(a))} />
        <Readout
          label={tx(<>derivata <Tex>{"f'(x)"}</Tex></>, <>derivative <Tex>{"f'(x)"}</Tex></>)}
          tone="red"
          value={fmt(slope)}
          sub={
            Math.abs(slope) < 0.08
              ? tx('piatta: punto stazionario', 'flat: stationary point')
              : slope > 0
                ? tx('positiva: la funzione sale', 'positive: the function goes up')
                : tx('negativa: la funzione scende', 'negative: the function goes down')
          }
        />
      </Controls>
      <Tasks
        items={[
          {
            label: tx('Trascina il punto dove la funzione scende: la derivata diventa negativa.', 'Drag the point to where the function goes down: the derivative becomes negative.'),
            done: seen.down,
          },
          {
            label: tx('Trova un punto in cui la tangente è orizzontale: lì la derivata vale zero.', 'Find a point where the tangent is horizontal: there the derivative is zero.'),
            done: seen.zero,
          },
          {
            label: tx('Cambia funzione: la cubica ha un massimo e un minimo, l’onda ne ha tanti.', 'Change the function: the cubic has a maximum and a minimum, the wave has many.'),
            done: seen.other,
          },
        ]}
      />
    </div>
  )
}
