import { useState } from 'react'
import { Segmented } from '../../components/ui/Controls'

/**
 * Il ML al centro: collegato ai quattro curricula (caratterizzante per AI)
 * e perno dei corsi dell'area dei sistemi intelligenti.
 */

type Item = { id: string; label: string[]; note: string; strong?: boolean }

const CURRICULA: Item[] = [
  { id: 'ai', label: ['Artificial', 'Intelligence'], note: 'Curriculum AI: qui il ML è un corso caratterizzante, parte della base metodologica.', strong: true },
  { id: 'bd', label: ['Big Data', 'Technologies'], note: 'Dal 2021 (prima: Data and Knowledge). Collegato al ML.' },
  { id: 'ict', label: ['ICT Solutions', 'Architect'], note: 'Curriculum ICT. Collegato al ML.' },
  { id: 'sw', label: ['Software: Programming,', 'Principles, Technologies'], note: 'Curriculum SW. Collegato al ML.' },
]

const COURSES: Item[] = [
  { id: 'hlt', label: ['Human Language', 'Technologies'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'ispr', label: ['Intelligent Systems for', 'Pattern Recognition'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'sa', label: ['Smart', 'Applications'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'cn', label: ['Computational', 'Neuroscience'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'rob', label: ['Robotics'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'dm', label: ['Data Mining'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'ir', label: ['Information', 'Retrieval'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'bio', label: ['Bioinformatics'], note: 'Usa direttamente i metodi del ML.' },
  { id: 'bda', label: ['Big Data', 'Analytics'], note: 'Usa direttamente i metodi del ML.' },
]

export function CurriculaMap() {
  const [view, setView] = useState<'cur' | 'area'>('cur')
  const [hot, setHot] = useState<string | null>(null)
  const items = view === 'cur' ? CURRICULA : COURSES
  const W = 720
  const H = view === 'cur' ? 400 : 460
  const cx = W / 2
  const cy = H / 2
  const R = view === 'cur' ? 150 : 185
  const active = items.find((i) => i.id === hot)

  return (
    <div className="curmap">
      <div className="wbar">
        <Segmented
          value={view}
          onChange={(v) => {
            setView(v)
            setHot(null)
          }}
          options={[
            { value: 'cur', label: 'I quattro curricula' },
            { value: 'area', label: 'Area dei sistemi intelligenti' },
          ]}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="curmap__svg" role="img" aria-label="Il Machine Learning al centro dei curricula e dei corsi collegati">
        {items.map((it, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / items.length + (view === 'cur' ? Math.PI / 4 : 0)
          const x = cx + Math.cos(a) * R * (view === 'cur' ? 1.35 : 1.42)
          const y = cy + Math.sin(a) * R
          const on = hot === it.id
          return (
            <g key={it.id} onMouseEnter={() => setHot(it.id)} onMouseLeave={() => setHot(null)} className={`curmap__node${on ? ' is-hot' : ''}${it.strong ? ' is-strong' : ''}`}>
              <line x1={cx} y1={cy} x2={x} y2={y} className="curmap__edge" />
              <rect x={x - 92} y={y - 26} width={184} height={52} rx={12} />
              {it.label.map((l, k) => (
                <text key={k} x={x} y={y + 5 + (k - (it.label.length - 1) / 2) * 17} textAnchor="middle">
                  {l}
                </text>
              ))}
              {it.strong && (
                <text x={x} y={y - 34} textAnchor="middle" className="curmap__tag">
                  caratterizzante
                </text>
              )}
            </g>
          )
        })}
        <g className="curmap__center">
          <circle cx={cx} cy={cy} r={58} />
          <text x={cx} y={cy - 2} textAnchor="middle" className="curmap__ml">
            ML
          </text>
          <text x={cx} y={cy + 20} textAnchor="middle" className="curmap__cfu">
            9 CFU
          </text>
        </g>
      </svg>
      <p className="curmap__note" aria-live="polite">
        {active ? (
          <>
            <strong>{active.label.join(' ')}</strong> — {active.note}
          </>
        ) : view === 'cur' ? (
          'Il ML è collegato a tutti e quattro i curricula. Passa sui riquadri.'
        ) : (
          'Il ML è il perno dell’area dei sistemi intelligenti: questi corsi ne usano direttamente i metodi.'
        )}
      </p>
    </div>
  )
}
