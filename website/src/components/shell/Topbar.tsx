import { useEffect, useState } from 'react'
import { getLesson, hasEasy, partOf } from '../../content/lessons'
import { lang, setLang, tx, type Lang } from '../../lib/i18n'
import { setMode, useMode } from '../../lib/mode'
import { clearProgress, useProgress } from '../../lib/progress'
import { useLook, useTheme } from '../../lib/theme'
import { glossaryHref, lessonHref, urlOf, type Route } from '../../lib/router'
import { Icon } from '../ui/Icon'

function useScrollState(active: boolean) {
  const [s, setS] = useState({ pct: 0, scrolled: false })
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setS({ pct: active && max > 0 ? window.scrollY / max : 0, scrolled: window.scrollY > 8 })
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [active])
  return s
}

/**
 * Route da riaprire dopo il cambio di lingua: in una lezione, la sezione che si sta leggendo
 * (gli id dei titoli sono gli stessi nelle due lingue).
 */
function currentHash(route: Route): string {
  if (route.name === 'glossary') return glossaryHref(route.term)
  if (route.name !== 'lesson') return '#/'
  const line = window.innerHeight * 0.28
  let section: string | undefined
  for (const h of document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]')) {
    if (h.getBoundingClientRect().top - line > 0) break
    section = h.id
  }
  return lessonHref(route.id, section)
}

const LANGS: { value: Lang; label: string; name: string }[] = [
  { value: 'it', label: 'IT', name: 'Italiano' },
  { value: 'en', label: 'EN', name: 'English' },
]

type Props = {
  route: Route
  onMenu: () => void
  onSearch: () => void
  onToc?: () => void
}

export function Topbar({ route, onMenu, onSearch, onToc }: Props) {
  const { theme, toggle } = useTheme()
  const { look, toggle: toggleLook } = useLook()
  const hasProgress = Object.keys(useProgress()).length > 0
  const isLesson = route.name === 'lesson'
  const { pct, scrolled } = useScrollState(isLesson)
  const lesson = isLesson ? getLesson(route.id) : undefined
  const part = isLesson ? partOf(route.id) : undefined
  const mode = useMode()
  const easyHere = isLesson && hasEasy(route.id)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label={tx('Apri il menu delle lezioni', 'Open the lessons menu')}>
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar__crumbs">
        {lesson ? (
          <>
            {part && (
              <>
                <span className="topbar__part">
                  {part.roman} · {part.title}
                </span>
                <Icon name="chevronRight" size={14} className="topbar__sep" />
              </>
            )}
            <span className="topbar__lesson">
              {part && <span className="topbar__num">{lesson.id}</span>} {lesson.title}
            </span>
          </>
        ) : route.name === 'glossary' ? (
          <span className="topbar__lesson">{tx('Glossario', 'Glossary')}</span>
        ) : (
          <span className="topbar__lesson">{tx('Indice del corso', 'Course index')}</span>
        )}
      </div>
      <div className="topbar__actions">
        <button className="search-btn" onClick={onSearch} aria-label={tx('Cerca', 'Search')}>
          <Icon name="search" size={16} />
          <span className="search-btn__text">{tx('Cerca nel corso…', 'Search the course…')}</span>
          <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        {onToc && (
          <button className="icon-btn topbar__toc" onClick={onToc} aria-label={tx('Indice della lezione', 'Lesson contents')}>
            <Icon name="list" size={19} />
          </button>
        )}
        {easyHere && (
          <button
            className={`icon-btn easy-btn${mode === 'easy' ? ' is-on' : ''}`}
            onClick={() => setMode(mode === 'easy' ? 'full' : 'easy')}
            aria-pressed={mode === 'easy'}
            aria-label={mode === 'easy' ? tx('Torna agli appunti completi', 'Back to the full notes') : tx('Passa alla versione «spiegata semplice»', 'Switch to the “explained simply” version')}
            title={mode === 'easy' ? tx('Appunti completi', 'Full notes') : tx('Versione «spiegata semplice»', '“Explained simply” version')}
          >
            <Icon name="baby" size={19} />
          </button>
        )}
        <div className="lang-switch" role="group" aria-label={tx('Lingua', 'Language')}>
          {LANGS.map((l) => (
            <button
              key={l.value}
              type="button"
              lang={l.value}
              className={l.value === lang ? 'is-on' : undefined}
              aria-pressed={l.value === lang}
              title={l.name}
              onClick={() => setLang(l.value, urlOf(currentHash(route), l.value))}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          className="icon-btn progress-btn"
          onClick={() => {
            if (window.confirm(tx('Azzerare l’avanzamento di lettura di tutte le lezioni?', 'Reset the reading progress of all lessons?'))) clearProgress()
          }}
          disabled={!hasProgress}
          aria-label={tx('Azzera l’avanzamento di lettura', 'Reset reading progress')}
          title={tx('Azzera l’avanzamento di lettura', 'Reset reading progress')}
        >
          <Icon name="reset" size={18} />
        </button>
        <button
          className={`icon-btn look-btn${look === 'glass' ? ' is-on' : ''}`}
          onClick={toggleLook}
          aria-pressed={look === 'glass'}
          aria-label={look === 'glass' ? tx('Passa allo stile classico', 'Switch to the classic style') : tx('Passa allo stile Liquid Glass', 'Switch to the Liquid Glass style')}
          title={look === 'glass' ? tx('Stile classico', 'Classic style') : tx('Stile Liquid Glass', 'Liquid Glass style')}
        >
          <Icon name={look === 'glass' ? 'paper' : 'glass'} size={18} />
        </button>
        <button
          className="icon-btn theme-btn"
          onClick={toggle}
          aria-label={theme === 'dark' ? tx('Passa al tema chiaro', 'Switch to the light theme') : tx('Passa al tema scuro', 'Switch to the dark theme')}
          title={theme === 'dark' ? tx('Tema chiaro', 'Light theme') : tx('Tema scuro', 'Dark theme')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
      {isLesson && <div className="topbar__progress" style={{ transform: `scaleX(${pct})` }} />}
    </header>
  )
}
