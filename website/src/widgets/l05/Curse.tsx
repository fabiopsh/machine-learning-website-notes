import { useState } from 'react'
import { Axes, Dot, FnPath, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Legend, Segmented, Slider } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

/**
 * Fig. 5.23 — dati uniformi nel cubo unitario: per catturare una frazione r del volume
 * serve un sottocubo di lato r^(1/n); viceversa un lato s cattura la frazione sⁿ.
 */
const DIMS = [
  { n: 1, color: 'var(--c-green)' },
  { n: 2, color: 'var(--c-blue)' },
  { n: 3, color: 'var(--c-violet)' },
  { n: 10, color: 'var(--c-red)' },
]

function pctStr(v: number) {
  if (v >= 0.01) return fmt(v * 100, 1) + '%'
  if (v >= 1e-4) return fmt(v * 100, 3) + '%'
  return fmt(v * 100, 4) + '%'
}

export function Curse() {
  const [mode, setMode] = useState<'frac' | 'side'>('frac')
  const [r, setR] = useState(0.25)
  const [s, setS] = useState(0.5)
  const side3 = mode === 'frac' ? r ** (1 / 3) : s
  const seen = useLatch({
    ten: mode === 'frac' && Math.abs(r - 0.1) < 0.005,
    three: mode === 'side' && Math.abs(s - 0.3) < 0.005,
    one: mode === 'frac' && Math.abs(r - 0.01) < 0.002,
  })
  return (
    <div>
      <div className="wbar">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'frac', label: 'Scegli la frazione di dati' },
            { value: 'side', label: 'Scegli il lato' },
          ]}
        />
        <Legend items={DIMS.map((d) => ({ label: `n = ${d.n}`, color: d.color }))} />
      </div>
      <div className="wgrid wgrid--even">
        <Cube side={side3} />
        <Plot xDomain={[0, 1]} yDomain={[0, 1]} aspect={0.9} maxH={340} margin={{ l: 40, b: 40 }}>
          <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} xLabel="frazione del volume r" yLabel="lato" />
          {DIMS.map((d) => (
            <FnPath key={d.n} f={(x) => x ** (1 / d.n)} color={d.color} width={2.2} from={0.0005} samples={400} />
          ))}
          {mode === 'frac' ? (
            <>
              <Polyline
                pts={[
                  { x: r, y: 0 },
                  { x: r, y: 1 },
                ]}
                color="var(--accent)"
                width={1.2}
                dash="4 4"
              />
              {DIMS.map((d) => (
                <Dot key={d.n} x={r} y={r ** (1 / d.n)} r={4.5} color={d.color} />
              ))}
            </>
          ) : (
            <>
              <Polyline
                pts={[
                  { x: 0, y: s },
                  { x: 1, y: s },
                ]}
                color="var(--accent)"
                width={1.2}
                dash="4 4"
              />
              {DIMS.map((d) => (
                <Dot key={d.n} x={s ** d.n} y={s} r={4.5} color={d.color} />
              ))}
            </>
          )}
          {/* sotto la diagonale non passa nessuna curva */}
          <Label x={0.97} y={0.1} anchor="end" className="plot-label--muted">
            {svgScript('lato = r', '1/n', 'sup')}
          </Label>
        </Plot>
      </div>
      <div className="controls">
        {mode === 'frac' ? (
          <Slider
            label="frazione dei dati da catturare r"
            min={0.001}
            max={1}
            step={0.001}
            value={r}
            onChange={setR}
            format={(v) => pctStr(v)}
            width={320}
            marks={[
              { value: 0.01, label: '1%' },
              { value: 0.1, label: '10%' },
              { value: 1, label: '100%' },
            ]}
          />
        ) : (
          <Slider
            label="lato del sottocubo s"
            min={0.05}
            max={1}
            step={0.01}
            value={s}
            onChange={setS}
            format={(v) => fmt(v)}
            width={320}
            marks={[
              { value: 0.3, label: '0,3' },
              { value: 1, label: '1' },
            ]}
          />
        )}
      </div>
      <table className="hyp__table curse__table">
        <thead>
          <tr>
            <th>dimensione</th>
            {DIMS.map((d) => (
              <th key={d.n}>n = {d.n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{mode === 'frac' ? `lato (frazione del range) per il ${pctStr(r)} dei dati` : `dati catturati dal lato ${fmt(s)}`}</td>
            {DIMS.map((d) => (
              <td key={d.n} className="hyp__num">
                {mode === 'frac' ? fmt(r ** (1 / d.n)) : pctStr(s ** d.n)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <Tasks
        items={[
          { label: 'Chiedi il 10% dei dati: in 2D basta un lato di 0,32, in 10D serve 0,8 (l’80% del range).', done: seen.ten },
          { label: 'Chiedi l’1%: in 10D servono ancora 0,63 del range di ogni coordinata.', done: seen.one },
          { label: 'Passa a «Scegli il lato» e fissalo a 0,3: 30%, 9%, 2,7% e in 10D circa lo 0,0006%.', done: seen.three },
        ]}
      />
    </div>
  )
}

/** cubo unitario in proiezione obliqua, con il sottocubo di lato `side` in un angolo */
function Cube({ side }: { side: number }) {
  const S = 200
  const k = 0.5
  const ang = Math.PI / 6
  const pr = (x: number, y: number, z: number) => [40 + x * S + z * S * k * Math.cos(ang), 250 - y * S - z * S * k * Math.sin(ang)]
  const edges = (s: number) => {
    const v = [
      [0, 0, 0],
      [s, 0, 0],
      [s, s, 0],
      [0, s, 0],
      [0, 0, s],
      [s, 0, s],
      [s, s, s],
      [0, s, s],
    ].map(([x, y, z]) => pr(x, y, z))
    const E = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ]
    return E.map(([a, b]) => `M${v[a][0].toFixed(1)},${v[a][1].toFixed(1)}L${v[b][0].toFixed(1)},${v[b][1].toFixed(1)}`).join('')
  }
  const [tx, ty] = pr(side / 2, 0, 0)
  return (
    <svg viewBox="0 0 340 280" className="curse__cube" role="img" aria-label={`Cubo unitario con un sottocubo di lato ${fmt(side)}`}>
      <path d={edges(1)} className="curse__big" />
      <path d={edges(Math.max(0.02, side))} className="curse__small" />
      <text x={tx} y={ty + 20} textAnchor="middle" className="curse__lbl">
        lato {fmt(side)} (in 3D)
      </text>
      <text x={pr(1, 1, 1)[0] - 6} y={pr(1, 1, 1)[1] - 8} textAnchor="end" className="curse__lbl curse__lbl--muted">
        cubo unitario
      </text>
    </svg>
  )
}
