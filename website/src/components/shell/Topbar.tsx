import { useEffect, useState } from 'react'
import { getLesson, partOf } from '../../content/lessons'
import { clearProgress, useProgress } from '../../lib/progress'
import { useLook, useTheme } from '../../lib/theme'
import type { Route } from '../../lib/router'
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
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Apri il menu delle lezioni">
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar__crumbs">
        {lesson ? (
          <>
            <span className="topbar__part">
              {part?.roman} · {part?.title}
            </span>
            <Icon name="chevronRight" size={14} className="topbar__sep" />
            <span className="topbar__lesson">
              <span className="topbar__num">{lesson.id}</span> {lesson.title}
            </span>
          </>
        ) : route.name === 'glossary' ? (
          <span className="topbar__lesson">Glossario</span>
        ) : (
          <span className="topbar__lesson">Indice del corso</span>
        )}
      </div>
      <div className="topbar__actions">
        <button className="search-btn" onClick={onSearch} aria-label="Cerca">
          <Icon name="search" size={16} />
          <span className="search-btn__text">Cerca nel corso…</span>
          <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        {onToc && (
          <button className="icon-btn topbar__toc" onClick={onToc} aria-label="Indice della lezione">
            <Icon name="list" size={19} />
          </button>
        )}
        <button
          className="icon-btn progress-btn"
          onClick={() => {
            if (window.confirm('Azzerare l’avanzamento di lettura di tutte le lezioni?')) clearProgress()
          }}
          disabled={!hasProgress}
          aria-label="Azzera l’avanzamento di lettura"
          title="Azzera l’avanzamento di lettura"
        >
          <Icon name="reset" size={18} />
        </button>
        <button
          className={`icon-btn look-btn${look === 'glass' ? ' is-on' : ''}`}
          onClick={toggleLook}
          aria-pressed={look === 'glass'}
          aria-label={look === 'glass' ? 'Passa allo stile classico' : 'Passa allo stile Liquid Glass'}
          title={look === 'glass' ? 'Stile classico' : 'Stile Liquid Glass'}
        >
          <Icon name={look === 'glass' ? 'paper' : 'glass'} size={18} />
        </button>
        <button
          className="icon-btn theme-btn"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
          title={theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
      {isLesson && <div className="topbar__progress" style={{ transform: `scaleX(${pct})` }} />}
    </header>
  )
}
