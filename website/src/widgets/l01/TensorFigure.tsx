import { useState } from 'react'
import { Tex } from '../../components/prose/Tex'

/** Scalare → vettore → matrice → tensore: quanti indici servono per individuare un numero. */
export function TensorFigure() {
  const [hot, setHot] = useState<{ k: number; idx: number[] } | null>(null)
  const cell = 22
  const items = [
    { name: 'scalare', tex: 'x', axes: 0 },
    { name: 'vettore', tex: '\\mathbf{x}', axes: 1 },
    { name: 'matrice', tex: 'X', axes: 2 },
    { name: 'tensore', tex: 'X_{i,j,k}', axes: 3 },
  ]
  const label = (k: number, idx: number[]) =>
    k === 0 ? 'x' : k === 1 ? `x_{${idx[0]}}` : k === 2 ? `X_{${idx[0]},${idx[1]}}` : `X_{${idx[0]},${idx[1]},${idx[2]}}`

  const sq = (k: number, idx: number[], x: number, y: number, key: string) => {
    const on = hot && hot.k === k && hot.idx.join() === idx.join()
    return (
      <rect
        key={key}
        x={x}
        y={y}
        width={cell - 3}
        height={cell - 3}
        rx={3}
        className={`tens__cell${on ? ' is-hot' : ''}`}
        onMouseEnter={() => setHot({ k, idx })}
      />
    )
  }

  return (
    <div className="tens" onMouseLeave={() => setHot(null)}>
      <div className="tens__row">
        {items.map((it, k) => (
          <div className="tens__item" key={k}>
            <svg width={k === 3 ? 130 : k === 2 ? 100 : k === 1 ? 30 : 30} height={110} aria-hidden="true">
              {k === 0 && sq(0, [], 5, 44, 's')}
              {k === 1 && [1, 2, 3, 4].map((i) => sq(1, [i], 5, 10 + (i - 1) * cell, `v${i}`))}
              {k === 2 &&
                [1, 2, 3, 4].map((i) => [1, 2, 3, 4].map((j) => sq(2, [i, j], 5 + (j - 1) * cell, 10 + (i - 1) * cell, `m${i}${j}`)))}
              {k === 3 &&
                [3, 2, 1].map((kk) => (
                  <g key={kk}>
                    {/* fondo pieno sotto ogni strato: copre gli strati dietro, che si vedono solo dove sporgono */}
                    <rect
                      x={4 + (kk - 1) * 16}
                      y={35 - (kk - 1) * 14}
                      width={3 * cell - 1}
                      height={3 * cell - 1}
                      rx={4}
                      className="tens__back"
                    />
                    {[1, 2, 3].map((i) =>
                      [1, 2, 3].map((j) => sq(3, [i, j, kk], 5 + (j - 1) * cell + (kk - 1) * 16, 36 + (i - 1) * cell - (kk - 1) * 14, `t${i}${j}${kk}`)),
                    )}
                  </g>
                ))}
            </svg>
            <div className="tens__name">
              {it.name} · {it.axes} {it.axes === 1 ? 'asse' : 'assi'}
            </div>
            <div className="tens__tex">
              <Tex>{hot && hot.k === k ? label(k, hot.idx) : it.tex}</Tex>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
