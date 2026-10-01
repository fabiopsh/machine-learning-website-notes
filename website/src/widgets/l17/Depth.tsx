import { useState } from 'react'
import { Axes, Dot, Handle, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Segmented } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

/* ------------------------------------------------------------------ Fig. 17.4: parità con due strati */

const parity = (bits: number[]) => bits.reduce((s, b) => s ^ b, 0)

function Bits({ bits, onToggle }: { bits: number[]; onToggle: (i: number) => void }) {
  return (
    <div className="par17__bits" role="group" aria-label="Bit di input">
      {bits.map((b, i) => (
        <button key={i} type="button" className={'par17__bit' + (b ? ' is-1' : '')} aria-pressed={!!b} onClick={() => onToggle(i)}>
          <Tex>{`x_${i + 1}`}</Tex>
          <b>{b}</b>
        </button>
      ))}
    </div>
  )
}

/** le configurazioni con un numero dispari di 1: una porta AND per ciascuna */
function oddPatterns(n: number) {
  const out: number[][] = []
  for (let k = 0; k < 2 ** n; k++) {
    const bits = Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1)
    if (parity(bits)) out.push(bits)
  }
  // prima quelle con più 1, come nella formula degli appunti (111, 100, 010, 001)
  return out.sort((a, b) => b.reduce((s, v) => s + v, 0) - a.reduce((s, v) => s + v, 0) || b.join('').localeCompare(a.join('')))
}
const termTex = (p: number[]) => p.map((b, i) => (b ? `x_${i + 1}` : `\\bar x_${i + 1}`)).join('')

export function ParityTwoLayer() {
  const [n, setN] = useState(3)
  const [bits, setBits] = useState([1, 0, 0, 0, 0, 0, 0, 0])
  const [flips, setFlips] = useState(0)
  const cur = bits.slice(0, n)
  const pats = oddPatterns(n)
  const active = pats.findIndex((p) => p.every((b, i) => b === cur[i]))
  const seen = useLatch({ big: n === 8 })
  return (
    <div>
      <div className="wbar">
        <Segmented
          label={<>numero di input N</>}
          value={n}
          onChange={setN}
          options={[2, 3, 4, 5, 6, 7, 8].map((v) => ({ value: v, label: String(v) }))}
        />
      </div>
      <Bits
        bits={cur}
        onToggle={(i) => {
          setBits(bits.map((b, j) => (j === i ? 1 - b : b)))
          setFlips(flips + 1)
        }}
      />
      <div className="par17__layer">Primo strato: una porta AND per ogni configurazione positiva</div>
      <div className={'par17__ands' + (n > 4 ? ' is-small' : '')}>
        {pats.map((p, i) => (
          <span key={i} className={'par17__and' + (i === active ? ' is-on' : '')} title={p.join('')}>
            {n <= 4 ? <Tex>{termTex(p)}</Tex> : null}
          </span>
        ))}
      </div>
      <div className="par17__layer">Secondo strato: una porta OR</div>
      <div className="par17__or">
        <span className={'par17__and par17__and--or' + (active >= 0 ? ' is-on' : '')}>OR</span>
        <span className="par17__res">
          uscita = <b>{parity(cur)}</b> ({cur.reduce((s, v) => s + v, 0)} bit a 1: {parity(cur) ? 'dispari' : 'pari'})
        </span>
      </div>
      {n <= 4 && (
        <div className="wpanel">
          <div className="wpanel__title">La funzione come somma di prodotti</div>
          <div className="wmath">
            <Tex>{pats.map(termTex).join(' + ')}</Tex>
          </div>
          <p className="wnote">Vale 1 se e solo se l’input è {pats.map((p) => p.join('')).join(', ')}.</p>
        </div>
      )}
      <Controls>
        <div className="readouts">
          <Readout label="porte AND" value={String(pats.length)} sub={<Tex>{'2^{N-1}'}</Tex>} />
          <Readout label="porte in tutto" tone="accent" value={String(pats.length + 1)} sub={<Tex>{'2^{N-1} + 1'}</Tex>} />
        </div>
      </Controls>
      <Tasks
        items={[
          { label: 'Cambia i bit di input: si accende la sola porta AND che riconosce quella configurazione (se i bit a 1 sono dispari).', done: flips >= 2 },
          { label: 'Porta N a 8: servono 128 porte AND più una OR, 129 in tutto.', done: seen.big },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.5: parità con un albero di XOR */

export function ParityTree() {
  const [n, setN] = useState(8)
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1, 0])
  const [flips, setFlips] = useState(0)
  const cur = bits.slice(0, n)
  // livelli dell'albero: ogni livello dimezza
  const levels: number[][] = [cur]
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1]
    levels.push(Array.from({ length: prev.length / 2 }, (_, i) => prev[2 * i] ^ prev[2 * i + 1]))
  }
  const W = 560
  const H = 300
  const depth = levels.length - 1
  const xOf = (l: number) => 70 + (l * (W - 160)) / depth
  const yOf = (l: number, i: number) => {
    const step = (H - 30) / levels[0].length
    const span = 2 ** l
    return 15 + step * (i * span + span / 2)
  }
  const seen = useLatch({ small: n === 2 })
  return (
    <div>
      <div className="wbar">
        <Segmented label={<>numero di input N</>} value={n} onChange={setN} options={[2, 4, 8].map((v) => ({ value: v, label: String(v) }))} />
        <Legend
          items={[
            { label: 'valore 1', color: 'var(--c-blue)', kind: 'dot' },
            { label: 'valore 0', color: 'var(--ink-4)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid">
        <svg className="tree17" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Albero di porte XOR per la parità">
          {levels.slice(1).map((lv, l) =>
            lv.map((_, i) =>
              [0, 1].map((c) => (
                <path
                  key={`${l}-${i}-${c}`}
                  className={'tree17__wire' + (levels[l][2 * i + c] ? ' is-1' : '')}
                  d={`M${xOf(l) + (l === 0 ? 20 : 30)},${yOf(l, 2 * i + c)}H${(xOf(l) + xOf(l + 1)) / 2}V${yOf(l + 1, i) + (c ? 8 : -8)}H${xOf(l + 1) - 28}`}
                />
              )),
            ),
          )}
          {cur.map((b, i) => (
            <g
              key={i}
              className={'tree17__bit' + (b ? ' is-1' : '')}
              role="button"
              tabIndex={0}
              aria-label={`bit ${i}: ${b}`}
              onClick={() => {
                setBits(bits.map((v, j) => (j === i ? 1 - v : v)))
                setFlips(flips + 1)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setBits(bits.map((v, j) => (j === i ? 1 - v : v)))
                  setFlips(flips + 1)
                }
              }}
            >
              <rect x={xOf(0) - 62} y={yOf(0, i) - 14} width={82} height={28} rx={8} />
              <text x={xOf(0) - 21} y={yOf(0, i) + 5} textAnchor="middle">
                bit{i} = {b}
              </text>
            </g>
          ))}
          {levels.slice(1).map((lv, l) =>
            lv.map((v, i) => (
              <g key={`${l}-${i}`} className={'tree17__xor' + (v ? ' is-1' : '')}>
                <rect x={xOf(l + 1) - 28} y={yOf(l + 1, i) - 17} width={58} height={34} rx={15} />
                <text x={xOf(l + 1) + 1} y={yOf(l + 1, i) + 5} textAnchor="middle">
                  XOR
                </text>
              </g>
            )),
          )}
          <text className="tree17__out" x={xOf(depth) + 36} y={yOf(depth, 0) + 6}>
            → {levels[depth][0]}
          </text>
        </svg>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">Ogni XOR: 3 porte AND/OR</div>
            <div className="wmath">
              <Tex>{'x_1 \\oplus x_2 = x_1 \\cdot \\bar x_2 + \\bar x_1 \\cdot x_2'}</Tex>
            </div>
            <p className="wnote">Due AND (con le negazioni degli input) e una OR.</p>
          </div>
          <div className="readouts">
            <Readout label="nodi XOR" value={String(n - 1)} sub={<Tex>{'N - 1'}</Tex>} />
            <Readout label="porte con l’albero" tone="blue" value={String(3 * (n - 1))} sub={<Tex>{'3(N-1)'}</Tex>} />
            <Readout label="porte con 2 strati" tone="orange" value={String(2 ** (n - 1) + 1)} sub={<Tex>{'2^{N-1}+1'}</Tex>} />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Clicca un bit: cambia l’uscita di un solo XOR per livello, fino all’uscita finale.', done: flips >= 1 },
          { label: 'Con N = 2 l’albero costa quanto i due strati (3 porte); con N = 8 bastano 21 porte contro 129.', done: seen.small },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 17.6: SVHN */

/** punti letti dalla figura originale: [parametri in unità di 10^8, accuratezza di test in %] */
const SVHN: { name: string; color: string; pts: [number, number][] }[] = [
  {
    name: '3 strati, convoluzionale',
    color: 'var(--c-blue)',
    pts: [
      [0.065, 91.6],
      [0.097, 92.4],
      [0.128, 92.9],
      [0.165, 93.15],
      [0.25, 93.0],
      [0.34, 92.55],
    ],
  },
  {
    name: '3 strati, completamente connessa',
    color: 'var(--c-green)',
    pts: [
      [0.325, 93.25],
      [0.645, 92.8],
      [0.81, 92.9],
    ],
  },
  {
    name: '11 strati, convoluzionale',
    color: 'var(--c-red)',
    pts: [
      [0.052, 93.8],
      [0.16, 95.15],
      [0.555, 96.05],
    ],
  },
]

function at(pts: [number, number][], x: number): number | null {
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null
  for (let i = 1; i < pts.length; i++)
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  return null
}

export function Svhn() {
  const [x, setX] = useState(0.16)
  const [moved, setMoved] = useState(false)
  const seen = useLatch({ over: moved && x >= 0.3 })
  return (
    <div>
      <div className="wbar">
        <Legend items={SVHN.map((s) => ({ label: s.name, color: s.color }))} />
      </div>
      <Plot xDomain={[0, 1]} yDomain={[91, 97]} aspect={0.56} margin={{ b: 40 }}>
        <Axes
          xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          yTicks={[91, 92, 93, 94, 95, 96, 97]}
          xFormat={(v) => `${Math.round(v * 100)} M`}
          xLabel="numero di parametri (milioni)"
          yLabel="accuratezza di test (%)"
        />
        {SVHN.map((s) => (
          <Polyline key={s.name} pts={s.pts.map(([px, py]) => ({ x: px, y: py }))} color={s.color} width={2.2} />
        ))}
        {SVHN.map((s) => s.pts.map(([px, py]) => <Dot key={`${s.name}-${px}`} x={px} y={py} color={s.color} r={4} />))}
        <Polyline
          pts={[
            { x, y: 91 },
            { x, y: 97 },
          ]}
          color="var(--ink-3)"
          width={1}
          dash="3 4"
        />
        <Label x={0.36} y={92.15} className="plot-label--muted">
          overfitting oltre 20 milioni di parametri
        </Label>
        <Handle
          x={x}
          y={91}
          axis="x"
          label="numero di parametri"
          onMove={(p) => {
            setX(Math.round(p.x * 200) / 200)
            setMoved(true)
          }}
        />
      </Plot>
      <div className="controls">
        <div className="readouts">
          <Readout label="parametri" tone="accent" value={`${fmt(x * 100, 1)} milioni`} />
          {SVHN.map((s) => {
            const v = at(s.pts, x)
            return <Readout key={s.name} label={s.name} value={v === null ? '—' : `${fmt(v, 1)}%`} />
          })}
        </div>
        <Btn icon="reset" onClick={() => setX(0.16)}>
          16 milioni (come nella figura)
        </Btn>
      </div>
      <Tasks
        items={[
          {
            label: 'Sposta la linea verso destra: aumentare i parametri della rete a 3 strati non la porta al livello di quella a 11 strati, anzi peggiora.',
            done: seen.over,
          },
        ]}
      />
    </div>
  )
}
