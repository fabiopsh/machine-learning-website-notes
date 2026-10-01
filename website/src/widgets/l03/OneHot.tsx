import { useState } from 'react'
import { Tex } from '../../components/prose/Tex'
import { Segmented } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'

/**
 * Codifica di variabili categoriche: con 1, 2, 3 la distanza tra simboli
 * diventa diversa (somiglianza artificiale); con one-hot sono tutti equidistanti.
 */

type Enc = 'ord' | 'hot'
type Sym = 'abc' | 'size'

const NAMES: Record<Sym, [string, string, string]> = {
  abc: ['A', 'B', 'C'],
  size: tx(['piccolo', 'medio', 'grande'], ['small', 'medium', 'large']),
}
// sigle inglesi dentro i cerchi (in italiano: le prime tre lettere del nome)
const SHORT_EN = ['S', 'M', 'L']

const CODES: Record<Enc, number[][]> = {
  ord: [[1], [2], [3]],
  hot: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
}

const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))

export function OneHot() {
  const [enc, setEnc] = useState<Enc>('ord')
  const [sym, setSym] = useState<Sym>('abc')
  const [pair, setPair] = useState<[number, number] | null>(null)
  const names = NAMES[sym]
  const codes = CODES[enc]
  const d = (i: number, j: number) => dist(codes[i], codes[j])
  const fmtD = (v: number) => (Math.abs(v - Math.SQRT2) < 1e-9 ? '\\sqrt{2}' : String(v))

  // posizioni per il disegno: su una retta (ordinale) o ai vertici di un triangolo equilatero (one-hot)
  const pos =
    enc === 'ord'
      ? [
          { x: 70, y: 110 },
          { x: 200, y: 110 },
          { x: 330, y: 110 },
        ]
      : [
          { x: 200, y: 32 },
          { x: 110, y: 188 },
          { x: 290, y: 188 },
        ]
  const pairs: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 2],
  ]

  const verdict =
    enc === 'hot'
      ? {
          cls: 'verdict--good',
          text: tx('Tutti i simboli sono equidistanti: nessuna somiglianza inventata.', 'All the symbols are equidistant: no made-up similarity.'),
        }
      : sym === 'size'
        ? {
            cls: 'verdict--good',
            text: tx(
              'Qui l’ordine esiste davvero: «medio» è più vicino a «piccolo» che «grande». Va bene.',
              'Here the order really exists: “medium” is closer to “small” than “large” is. That is fine.',
            ),
          }
        : {
            cls: 'verdict--warn',
            text: tx(
              'A risulta «più simile» a B che a C: una somiglianza che nei dati non c’è.',
              'A turns out to be “more similar” to B than to C: a similarity that is not in the data.',
            ),
          }

  return (
    <div className="onehot">
      <div className="wbar">
        <Segmented
          value={enc}
          onChange={setEnc}
          options={[
            { value: 'ord', label: tx('Codifica 1, 2, 3', '1, 2, 3 encoding') },
            { value: 'hot', label: tx('Codifica one-hot', 'One-hot encoding') },
          ]}
        />
        <Segmented
          size="sm"
          value={sym}
          onChange={setSym}
          options={[
            { value: 'abc', label: tx('Simboli senza ordine', 'Unordered symbols') },
            { value: 'size', label: tx('Categorie ordinate', 'Ordered categories') },
          ]}
        />
      </div>
      <div className="wgrid wgrid--even">
        <svg viewBox="0 0 400 230" className="onehot__svg" aria-label={tx('Distanze tra i simboli codificati', 'Distances between the encoded symbols')}>
          {pairs.map(([i, j]) => {
            const hot = pair && pair[0] === i && pair[1] === j
            const ord = enc === 'ord'
            const curve = ord && i === 0 && j === 2
            const mx = (pos[i].x + pos[j].x) / 2
            const my = (pos[i].y + pos[j].y) / 2
            return (
              <g key={`${i}${j}`} onMouseEnter={() => setPair([i, j])} onMouseLeave={() => setPair(null)} className={`onehot__edge${hot ? ' is-hot' : ''}`}>
                {curve ? (
                  <path d={`M${pos[0].x},${pos[0].y + 22} Q200,${pos[0].y + 110} ${pos[2].x},${pos[2].y + 22}`} />
                ) : (
                  <line x1={pos[i].x} y1={pos[i].y} x2={pos[j].x} y2={pos[j].y} />
                )}
                <foreignObject
                  x={(curve ? 200 : mx) - 30}
                  y={(curve ? pos[0].y + 64 : ord ? my - 34 : my - 14) - 2}
                  width={60}
                  height={28}
                >
                  <div className="onehot__dist">
                    <Tex>{fmtD(d(i, j))}</Tex>
                  </div>
                </foreignObject>
              </g>
            )
          })}
          {pos.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`} className="onehot__sym">
              <circle r={enc === 'ord' ? 20 : 22} />
              <text y={sym === 'size' ? 4 : 6} textAnchor="middle" className={sym === 'size' ? 'is-small' : undefined}>
                {sym === 'size' ? tx(names[i].slice(0, 3) + '.', SHORT_EN[i]) : names[i]}
              </text>
            </g>
          ))}
        </svg>
        <div className="wside">
          <table className="onehot__table">
            <thead>
              <tr>
                <th>{tx('simbolo', 'symbol')}</th>
                <th>{tx('codice', 'code')}</th>
              </tr>
            </thead>
            <tbody>
              {names.map((n, i) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>
                    <Tex>{codes[i].length === 1 ? String(codes[i][0]) : `(${codes[i].join(',')})`}</Tex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <span className={`verdict ${verdict.cls}`}>{verdict.text}</span>
        </div>
      </div>
    </div>
  )
}
