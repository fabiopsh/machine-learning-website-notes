import { parts } from '../../content/lessons'
import { tx } from '../../lib/i18n'
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
    <nav className="sidebar" aria-label={tx('Lezioni del corso', 'Course lessons')}>
      <div className="sidebar__scroll">
        <a className="brand" href="#/" onClick={onNavigate}>
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            <span className="brand__title">Machine Learning</span>
            <span className="brand__sub">{tx('Appunti interattivi', 'Interactive notes')} · 654AA</span>
          </span>
        </a>

        <div className="sidebar__links">
          <a href="#/" className={route.name === 'home' ? 'is-active' : undefined} onClick={onNavigate}>
            <Icon name="book" size={16} /> {tx('Indice del corso', 'Course index')}
          </a>
          <a href={glossaryHref()} className={route.name === 'glossary' ? 'is-active' : undefined} onClick={onNavigate}>
            <Icon name="list" size={16} /> {tx('Glossario', 'Glossary')}
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
                    <li key={l.id} className="sidebar__lesson is-locked" title={tx('In preparazione', 'Coming soon')}>
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
          {tx('Appunti di Fabio Piscitelli', 'Notes by Fabio Piscitelli')}
          <br />
          Prof. Alessio Micheli · {tx('Università di Pisa', 'University of Pisa')}
          <br />
          {tx('a.a. 2026/27', 'a.y. 2026/27')}
        </div>
      </div>
    </nav>
  )
}
