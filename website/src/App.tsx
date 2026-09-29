import { useEffect, useState } from 'react'
import { CommandPalette } from './components/shell/CommandPalette'
import { GlassBackdrop } from './components/shell/GlassBackdrop'
import { Sidebar } from './components/shell/Sidebar'
import { Topbar } from './components/shell/Topbar'
import { GlossaryPage } from './pages/GlossaryPage'
import { Home } from './pages/Home'
import { LessonPage } from './pages/LessonPage'
import { useRoute } from './lib/router'
import { useLook } from './lib/theme'
import { getLesson } from './content/lessons'

export default function App() {
  const route = useRoute()
  const { look } = useLook()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [toc, setToc] = useState(false)

  // scorciatoie: Ctrl/⌘+K oppure "/" per cercare
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // chiude i pannelli quando si cambia pagina (aggiornamento durante il render, senza effetti)
  const pageKey = route.name === 'lesson' ? `lesson:${route.id}` : route.name
  const [prevPage, setPrevPage] = useState(pageKey)
  if (prevPage !== pageKey) {
    setPrevPage(pageKey)
    setMenu(false)
    setToc(false)
  }

  useEffect(() => {
    const t =
      route.name === 'lesson'
        ? `${getLesson(route.id)?.title ?? 'Lezione'} — ML`
        : route.name === 'glossary'
          ? 'Glossario — ML'
          : 'Machine Learning — Appunti interattivi'
    document.title = t
  }, [route])

  useEffect(() => {
    document.body.style.overflow = menu || search ? 'hidden' : ''
  }, [menu, search])

  return (
    <div className={`shell${menu ? ' menu-open' : ''}`}>
      {look === 'glass' && <GlassBackdrop />}
      <div className="shell__side">
        <Sidebar route={route} onNavigate={() => setMenu(false)} />
      </div>
      <div className="shell__scrim" onClick={() => setMenu(false)} />
      <div className="shell__main">
        <Topbar
          route={route}
          onMenu={() => setMenu(true)}
          onSearch={() => setSearch(true)}
          onToc={route.name === 'lesson' ? () => setToc(true) : undefined}
        />
        <main id="contenuto">
          {route.name === 'lesson' ? (
            <LessonPage route={route} tocOpen={toc} onCloseToc={() => setToc(false)} />
          ) : route.name === 'glossary' ? (
            <GlossaryPage term={route.term} />
          ) : (
            <Home />
          )}
        </main>
      </div>
      {search && <CommandPalette onClose={() => setSearch(false)} />}
    </div>
  )
}
