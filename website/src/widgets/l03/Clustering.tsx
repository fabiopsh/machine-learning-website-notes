import { useMemo, useState } from 'react'
import { Axes, Dot, Handle, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Toggle } from '../../components/ui/Controls'
import { gauss, rng } from '../../lib/math'

type P = { x: number; y: number }

function makeData(): P[] {
  const r = rng(11)
  const pts: P[] = []
  for (let i = 0; i < 14; i++) pts.push({ x: 1.6 + gauss(r) * 0.55, y: 2.1 + gauss(r) * 0.5 })
  for (let i = 0; i < 14; i++) pts.push({ x: 5.4 + gauss(r) * 0.5, y: 1.3 + gauss(r) * 0.45 })
  return pts
}

const COLORS = ['var(--c-blue)', 'var(--c-orange)']

/**
 * Due centroidi trascinabili: ogni punto va al centroide più vicino.
 * Con `showLoss` compare la distorsione quadratica (la loss del clustering).
 */
export function Clustering({ showLoss = false }: { showLoss?: boolean }) {
  const data = useMemo(() => makeData(), [])
  const [c, setC] = useState<P[]>([
    { x: 3.2, y: 3.4 },
    { x: 4.4, y: 0.4 },
  ])
  const [links, setLinks] = useState(showLoss)
  const [steps, setSteps] = useState(0)
  const [moved, setMoved] = useState(false)

  const assign = data.map((p) => {
    const d = c.map((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2)
    return d[0] <= d[1] ? 0 : 1
  })
  const dist = data.map((p, i) => (p.x - c[assign[i]].x) ** 2 + (p.y - c[assign[i]].y) ** 2)
  const J = dist.reduce((a, b) => a + b, 0)

  const recenter = () => {
    setC((cur) =>
      cur.map((q, k) => {
        const mine = data.filter((_, i) => assign[i] === k)
        if (!mine.length) return q
        return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length }
      }),
    )
    setSteps((s) => s + 1)
  }

  return (
    <div>
      <Plot xDomain={[0, 7]} yDomain={[-0.5, 4]} aspect={0.52} equal>
        <Axes xTicks={[0, 1, 2, 3, 4, 5, 6, 7]} yTicks={[0, 1, 2, 3, 4]} xLabel="x₁" yLabel="x₂" />
        {links &&
          data.map((p, i) => (
            <Polyline key={`l${i}`} pts={[p, c[assign[i]]]} color={COLORS[assign[i]]} width={1} opacity={0.4} />
          ))}
        {data.map((p, i) => (
          <Dot key={i} x={p.x} y={p.y} r={4.5} color={COLORS[assign[i]]} />
        ))}
        {c.map((q, k) => (
          <Handle
            key={k}
            x={q.x}
            y={q.y}
            r={8}
            color={COLORS[k]}
            label={`centroide ${k + 1}`}
            onMove={(p) => {
              setC((cur) => cur.map((qq, j) => (j === k ? p : qq)))
              setMoved(true)
            }}
          />
        ))}
      </Plot>
      <div className="controls">
        {showLoss ? (
          <Readout
            label={
              <>
                distorsione totale <Tex>{'\\sum_p \\|\\mathbf{x}_p - h(\\mathbf{x}_p)\\|^2'}</Tex>
              </>
            }
            tone="accent"
            value={fmt(J, 2)}
          />
        ) : (
          <Readout label="punti per cluster" value={`${assign.filter((a) => a === 0).length} · ${assign.filter((a) => a === 1).length}`} />
        )}
        <Toggle label="collega i punti al loro centroide" checked={links} onChange={setLinks} />
        <Btn icon="step" variant="soft" onClick={recenter}>
          Sposta i centroidi al centro del gruppo
        </Btn>
      </div>
      {showLoss && (
        <Tasks
          items={[
            { label: 'Trascina un centroide lontano dai suoi punti: la distorsione cresce.', done: moved },
            { label: 'Premi più volte il pulsante: la distorsione scende finché i centroidi non si fermano.', done: steps >= 2 },
          ]}
        />
      )}
    </div>
  )
}
