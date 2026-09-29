import { useState } from 'react'

/** Le tre voci del piano di studi del curriculum AI, in proporzione ai CFU. */
const PARTS = [
  { id: 'car', cfu: 60, label: 'Corsi caratterizzanti', detail: '60 CFU di corsi caratterizzanti (tra cui ML).' },
  { id: 'grp', cfu: 27, label: 'Gruppi di esami a scelta', detail: '27 CFU: un esame da 9 CFU e tre da 6 CFU.' },
  { id: 'free', cfu: 9, label: 'Libera scelta', detail: 'Almeno 9 CFU, coperti anche con due esami da 6 CFU.', min: true },
]

export function PlanBar() {
  const [hot, setHot] = useState<string | null>(null)
  const total = PARTS.reduce((s, p) => s + p.cfu, 0)
  const active = PARTS.find((p) => p.id === hot)
  return (
    <div className="plan">
      <div className="plan__bar" onMouseLeave={() => setHot(null)}>
        {PARTS.map((p) => (
          <button
            key={p.id}
            className={`plan__seg plan__seg--${p.id}${hot === p.id ? ' is-hot' : ''}`}
            style={{ flexGrow: p.cfu }}
            onMouseEnter={() => setHot(p.id)}
            onFocus={() => setHot(p.id)}
            onClick={() => setHot(p.id)}
          >
            <span className="plan__cfu">
              {p.min ? '≥ ' : ''}
              {p.cfu}
            </span>
            <span className="plan__lbl">{p.label}</span>
          </button>
        ))}
      </div>
      <p className="plan__note">
        {active ? active.detail : `Proporzioni in CFU delle tre voci (${total} CFU in tutto, contando il minimo della libera scelta).`}
      </p>
    </div>
  )
}
