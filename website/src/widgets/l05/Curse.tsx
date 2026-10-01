import { useState } from 'react'
import { Axes, Dot, FnPath, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Legend, Segmented, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
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
            { value: 'frac', label: tx('Scegli la frazione di dati', 'Choose data fraction') },
            { value: 'side', label: tx('Scegli il lato', 'Choose side length') },
          ]}
        />
        <Legend items={DIMS.map((d) => ({ label: `n = ${d.n}`, color: d.color }))} />
      </div>
      <div className="wgrid wgrid--even">
        <Cube side={side3} />
        <Plot xDomain={[0, 1]} yDomain={[0, 1]} aspect={0.9} maxH={340} margin={{ l: 40, b: 40 }}>
          <Axes xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} xLabel={tx('frazione del volume r', 'fraction of volume r')} yLabel={tx('lato', 'side length')} />
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
            {svgScript(tx('lato = r', 'side = r'), '1/n', 'sup')}
          </Label>
        </Plot>
      </div>
      <div className="controls">
        {mode === 'frac' ? (
          <Slider
            label={tx('frazione dei dati da catturare r', 'fraction of data to capture r')}
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
            label={tx('lato del sottocubo s', 'sub-cube side length s')}
            min={0.05}
            max={1}
            step={0.01}
            value={s}
            onChange={setS}
            format={(v) => fmt(v)}
            width={320}
            marks={[
              { value: 0.3, label: fmt(0.3) },
              { value: 1, label: '1' },
            ]}
          />
        )}
      </div>
      <table className="hyp__table curse__table">
        <thead>
          <tr>
            <th>{tx('dimensione', 'dimension')}</th>
            {DIMS.map((d) => (
              <th key={d.n}>n = {d.n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{mode === 'frac' ? tx(`lato (frazione del range) per il ${pctStr(r)} dei dati`, `side (fraction of range) for ${pctStr(r)} of data`) : tx(`dati catturati dal lato ${fmt(s)}`, `data captured by side ${fmt(s)}`)}</td>
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
          { label: tx('Chiedi il 10% dei dati: in 2D basta un lato di 0,32, in 10D serve 0,8 (l’80% del range).', 'Request 10% of the data: 2D requires a side of 0.32, while 10D requires 0.8 (80% of the range).'), done: seen.ten },
          { label: tx('Chiedi l’1%: in 10D servono ancora 0,63 del range di ogni coordinata.', 'Request 1%: in 10D, 0.63 of the range along each coordinate is still needed.'), done: seen.one },
          { label: tx('Passa a «Scegli il lato» e fissalo a 0,3: 30%, 9%, 2,7% e in 10D circa lo 0,0006%.', 'Switch to “Choose side length” and set it to 0.3: 30%, 9%, 2.7%, and in 10D about 0.0006%.'), done: seen.three },
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
  const [px, py] = pr(side / 2, 0, 0)
  return (
    <svg viewBox="0 0 340 280" className="curse__cube" role="img" aria-label={tx(`Cubo unitario con un sottocubo di lato ${fmt(side)}`, `Unit cube with a sub-cube of side ${fmt(side)}`)}>
      <path d={edges(1)} className="curse__big" />
      <path d={edges(Math.max(0.02, side))} className="curse__small" />
      <text x={px} y={py + 20} textAnchor="middle" className="curse__lbl">
        {tx('lato', 'side')} {fmt(side)} ({tx('in 3D', 'in 3D')})
      </text>
      <text x={pr(1, 1, 1)[0] - 6} y={pr(1, 1, 1)[1] - 8} textAnchor="end" className="curse__lbl curse__lbl--muted">
        {tx('cubo unitario', 'unit cube')}
      </text>
    </svg>
  )
}
