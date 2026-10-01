import { useState } from 'react'
import { tx } from '../../lib/i18n'

/** Le tre voci del piano di studi del curriculum AI, in proporzione ai CFU. */
const PARTS = [
  { id: 'car', cfu: 60, label: tx('Corsi caratterizzanti', 'Core courses'), detail: tx('60 CFU di corsi caratterizzanti (tra cui ML).', '60 ECTS of core courses (including ML).') },
  { id: 'grp', cfu: 27, label: tx('Gruppi di esami a scelta', 'Groups of elective exams'), detail: tx('27 CFU: un esame da 9 CFU e tre da 6 CFU.', '27 ECTS: one 9-ECTS exam and three 6-ECTS exams.') },
  { id: 'free', cfu: 9, label: tx('Libera scelta', 'Free choice'), detail: tx('Almeno 9 CFU, coperti anche con due esami da 6 CFU.', 'At least 9 ECTS, which can also be covered with two 6-ECTS exams.'), min: true },
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
        {active
          ? active.detail
          : tx(
              `Proporzioni in CFU delle tre voci (${total} CFU in tutto, contando il minimo della libera scelta).`,
              `Proportions in ECTS of the three items (${total} ECTS in total, counting the minimum for the free choice).`,
            )}
      </p>
    </div>
  )
}
