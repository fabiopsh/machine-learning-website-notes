import { parts } from '../../content/lessons'
import { useProgress } from '../../lib/progress'
import { glossaryHref, lessonHref, type Route } from '../../lib/router'
import { Icon } from '../ui/Icon'

function Ring({ pct, done }: { pct: number; done: boolean }) {
  const r = 6
  const c = 2 * Math.PI * r
  return (
    <svg className={`ring${done ? ' is-done' : ''}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r={r} className="ring__track" />
      {done ? (
        <path d="M5 8.3l2 2 4-4.3" className="ring__check" />
      ) : (
        pct > 0.02 && (
          <circle cx="8" cy="8" r={r} className="ring__arc" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 8 8)" />
        )
      )}
    </svg>
  )
}

export function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  const progress = useProgress()
  const activeId = route.name === 'lesson' ? route.id : undefined
  return (
    <nav className="sidebar" aria-label="Lezioni del corso">
      <a className="brand" href="#/" onClick={onNavigate}>
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <rect width="32" height="32" rx="9" className="brand__bg" />
            <path d="M7 21.5 C 11 21.5, 12 10.5, 16 10.5 S 21 21.5, 25 21.5" className="brand__curve" />
            <circle cx="16" cy="10.5" r="2.6" className="brand__dot" />
          </svg>
        </span>
        <span className="brand__text">
          <span className="brand__title">Machine Learning</span>
          <span className="brand__sub">Appunti interattivi · 654AA</span>
        </span>
      </a>

      <div className="sidebar__links">
        <a href="#/" className={route.name === 'home' ? 'is-active' : undefined} onClick={onNavigate}>
          <Icon name="book" size={16} /> Indice del corso
        </a>
        <a href={glossaryHref()} className={route.name === 'glossary' ? 'is-active' : undefined} onClick={onNavigate}>
          <Icon name="list" size={16} /> Glossario
        </a>
      </div>

      {parts.map((part) => (
        <div className="sidebar__part" key={part.roman}>
          <div className="sidebar__part-title">
            <span className="sidebar__roman">{part.roman}</span>
            {part.title}
          </div>
          <ol>
            {part.lessons.map((l) => {
              const p = progress[l.id]
              if (!l.load) {
                return (
                  <li key={l.id} className="sidebar__lesson is-locked" title="In preparazione">
                    <span className="sidebar__num">{l.id}</span>
                    <span className="sidebar__name">{l.title}</span>
                  </li>
                )
              }
              return (
                <li key={l.id}>
                  <a
                    href={lessonHref(l.id)}
                    className={`sidebar__lesson${activeId === l.id ? ' is-active' : ''}`}
                    aria-current={activeId === l.id ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    <span className="sidebar__num">{l.id}</span>
                    <span className="sidebar__name">{l.title}</span>
                    <Ring pct={p?.pct ?? 0} done={p?.done ?? false} />
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      ))}

      <div className="sidebar__foot">
        Appunti di Fabio Piscitelli
        <br />
        Prof. Alessio Micheli · Università di Pisa
        <br />
        a.a. 2026/27
      </div>
    </nav>
  )
}
