import type { MDXContent } from 'mdx/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { mdxComponents } from '../components/shell/mdxComponents'
import { scrollToSection, TocList, useScrollSpy, type TocItem } from '../components/shell/Toc'
import { Icon } from '../components/ui/Icon'
import { getLesson, lessonIndex, lessonStats, neighbours, partOf } from '../content/lessons'
import { recordProgress } from '../lib/progress'
import { lessonHref } from '../lib/router'

type Props = { route: { id: string; section?: string; silent?: boolean }; tocOpen: boolean; onCloseToc: () => void }

export function LessonPage({ route, tocOpen, onCloseToc }: Props) {
  const { id } = route
  const lesson = getLesson(id)
  const [Content, setContent] = useState<{ id: string; C: MDXContent } | null>(null)
  const article = useRef<HTMLElement>(null)
  const ready = Content?.id === id
  const items: TocItem[] = useMemo(
    () => (ready ? (lessonIndex[id]?.headings ?? []).map((h) => ({ id: h.slug, text: h.text, depth: h.depth })) : []),
    [ready, id],
  )
  const ids = useMemo(() => items.map((i) => i.id), [items])
  const active = useScrollSpy(ids)
  const stats = lessonStats(id)
  const part = partOf(id)
  const { prev, next } = neighbours(id)

  useEffect(() => {
    let alive = true
    lesson?.load?.().then((mod) => {
      if (alive) setContent({ id, C: mod.default })
    })
    return () => {
      alive = false
    }
  }, [id, lesson])

  // posizionamento iniziale: sezione richiesta o inizio pagina
  useEffect(() => {
    if (!ready || route.silent) return
    if (route.section) {
      const s = route.section
      requestAnimationFrame(() => scrollToSection(id, s, false))
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [ready, id, route])

  // avanzamento di lettura
  useEffect(() => {
    if (!ready) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = article.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const pct = (window.innerHeight - r.top) / (r.height + window.innerHeight * 0.1)
        recordProgress(id, pct)
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    on()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [ready, id])

  // i link "#" accanto ai titoli restano dentro il routing a hash
  useEffect(() => {
    const el = article.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[data-anchor]') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      scrollToSection(id, a.dataset.anchor!)
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [id])

  if (!lesson || !lesson.load) {
    return (
      <div className="page page--narrow">
        <div className="empty">
          <p className="empty__eyebrow">Lezione {id}</p>
          <h1>In preparazione</h1>
          <p>Questa lezione non è ancora disponibile nella versione interattiva.</p>
          <a className="btn btn--solid" href="#/">
            Torna all’indice
          </a>
        </div>
      </div>
    )
  }

  const C = ready ? Content!.C : null

  return (
    <div className="page">
      <article className="lesson" ref={article} key={id}>
        <header className="lesson-head">
          <div className="lesson-head__eyebrow">
            <span>
              Parte {part?.roman} · {part?.title}
            </span>
            {lesson.eyebrow && <span className="lesson-head__tag">{lesson.eyebrow}</span>}
          </div>
          <h1 className="lesson-head__title">
            <span className="lesson-head__num">{lesson.id}</span>
            {lesson.title}
          </h1>
          <div className="lesson-head__meta">
            {stats && (
              <>
                <span>
                  <Icon name="book" size={15} /> ≈ {stats.minutes} min di lettura
                </span>
                {stats.figures > 0 && (
                  <span>
                    <Icon name="hand" size={15} /> {stats.figures === 1 ? '1 figura interattiva' : `${stats.figures} figure interattive`}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="lesson-head__credits">
            Appunti di Fabio Piscitelli — Machine Learning (654AA), Prof. Alessio Micheli, Università di Pisa, a.a.
            2026/27
          </p>
        </header>

        <div className="prose">{C ? <C components={mdxComponents} /> : <LessonSkeleton />}</div>

        {ready && (
          <nav className="pager" aria-label="Lezioni vicine">
            {prev ? (
              <a className="pager__card pager__card--prev" href={lessonHref(prev.id)}>
                <span className="pager__dir">
                  <Icon name="arrowLeft" size={15} /> Lezione precedente
                </span>
                <span className="pager__title">
                  <span className="pager__num">{prev.id}</span> {prev.title}
                </span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="pager__card pager__card--next" href={lessonHref(next.id)}>
                <span className="pager__dir">
                  Lezione successiva <Icon name="arrowRight" size={15} />
                </span>
                <span className="pager__title">
                  <span className="pager__num">{next.id}</span> {next.title}
                </span>
              </a>
            ) : (
              <a className="pager__card pager__card--next" href="#/">
                <span className="pager__dir">
                  Fine della prima parte <Icon name="arrowRight" size={15} />
                </span>
                <span className="pager__title">Torna all’indice del corso</span>
              </a>
            )}
          </nav>
        )}
      </article>

      <aside className="toc" aria-label="Indice della lezione">
        <div className="toc__inner">
          <div className="toc__label">In questa lezione</div>
          <TocList items={items} active={active} lessonId={id} />
          <button className="toc__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Torna su
          </button>
        </div>
      </aside>

      {tocOpen && (
        <div className="sheet" onClick={onCloseToc}>
          <div className="sheet__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Indice della lezione">
            <div className="sheet__head">
              <span>In questa lezione</span>
              <button className="icon-btn" onClick={onCloseToc} aria-label="Chiudi">
                <Icon name="close" size={18} />
              </button>
            </div>
            <TocList items={items} active={active} lessonId={id} onPick={onCloseToc} />
          </div>
        </div>
      )}
    </div>
  )
}

function LessonSkeleton() {
  return (
    <div className="skeleton" aria-label="Caricamento della lezione">
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} style={{ width: `${[92, 100, 84, 97, 60, 88, 74][i]}%` }} />
      ))}
    </div>
  )
}
