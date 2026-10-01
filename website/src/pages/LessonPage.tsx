import type { MDXContent } from 'mdx/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { mdxComponents } from '../components/shell/mdxComponents'
import { scrollToSection, TocList, useScrollSpy, type TocItem } from '../components/shell/Toc'
import { Icon } from '../components/ui/Icon'
import { getLesson, lessonIndex, lessonStats, neighbours, partOf } from '../content/lessons'
import { tx } from '../lib/i18n'
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
    if (!route.section) {
      window.scrollTo({ top: 0 })
      return
    }
    const s = route.section
    scrollToSection(id, s, false)
    // font, formule e figure possono spostare il layout dopo il primo scroll:
    // si ricontrolla qualche volta, ma solo se nel frattempo l'utente non ha scrollato
    let y = window.scrollY
    const timers = [120, 450, 1100].map((ms) =>
      window.setTimeout(() => {
        const el = document.getElementById(s)
        if (!el || Math.abs(window.scrollY - y) > 2) return
        const want = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
        if (Math.abs(el.getBoundingClientRect().top - want) > 6) {
          scrollToSection(id, s, false)
          y = window.scrollY
        }
      }, ms),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
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
          <p className="empty__eyebrow">{tx('Lezione', 'Lesson')} {id}</p>
          <h1>{tx('In preparazione', 'Coming soon')}</h1>
          <p>{tx('Questa lezione non è ancora disponibile nella versione interattiva.', 'This lesson is not yet available in the interactive version.')}</p>
          <a className="btn btn--solid" href="#/">
            {tx('Torna all’indice', 'Back to the index')}
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
              {tx('Parte', 'Part')} {part?.roman} · {part?.title}
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
                  <Icon name="book" size={15} /> ≈ {stats.minutes} {tx('min di lettura', 'min read')}
                </span>
                {stats.figures > 0 && (
                  <span>
                    <Icon name="hand" size={15} /> {stats.figures === 1
                      ? tx('1 figura interattiva', '1 interactive figure')
                      : `${stats.figures} ${tx('figure interattive', 'interactive figures')}`}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="lesson-head__credits">
            {tx(
              'Appunti di Fabio Piscitelli — Machine Learning (654AA), Prof. Alessio Micheli, Università di Pisa, a.a. 2026/27',
              'Notes by Fabio Piscitelli — Machine Learning (654AA), Prof. Alessio Micheli, University of Pisa, a.y. 2026/27',
            )}
          </p>
        </header>

        <div className="prose">{C ? <C components={mdxComponents} /> : <LessonSkeleton />}</div>

        {ready && (
          <nav className="pager" aria-label={tx('Lezioni vicine', 'Adjacent lessons')}>
            {prev ? (
              <a className="pager__card pager__card--prev" href={lessonHref(prev.id)}>
                <span className="pager__dir">
                  <Icon name="arrowLeft" size={15} /> {tx('Lezione precedente', 'Previous lesson')}
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
                  {tx('Lezione successiva', 'Next lesson')} <Icon name="arrowRight" size={15} />
                </span>
                <span className="pager__title">
                  <span className="pager__num">{next.id}</span> {next.title}
                </span>
              </a>
            ) : (
              <a className="pager__card pager__card--next" href="#/">
                <span className="pager__dir">
                  {tx('Ultima lezione disponibile', 'Last available lesson')} <Icon name="arrowRight" size={15} />
                </span>
                <span className="pager__title">{tx('Torna all’indice del corso', 'Back to the course index')}</span>
              </a>
            )}
          </nav>
        )}
      </article>

      <aside className="toc" aria-label={tx('Indice della lezione', 'Lesson contents')}>
        <div className="toc__inner">
          <div className="toc__label">{tx('In questa lezione', 'In this lesson')}</div>
          <div className="toc__scroll">
            <TocList items={items} active={active} lessonId={id} />
          </div>
          <button className="toc__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {tx('Torna su', 'Back to top')}
          </button>
        </div>
      </aside>

      {tocOpen && (
        <div className="sheet" onClick={onCloseToc}>
          <div className="sheet__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={tx('Indice della lezione', 'Lesson contents')}>
            <div className="sheet__head">
              <span>{tx('In questa lezione', 'In this lesson')}</span>
              <button className="icon-btn" onClick={onCloseToc} aria-label={tx('Chiudi', 'Close')}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="toc__scroll">
              <TocList items={items} active={active} lessonId={id} onPick={onCloseToc} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LessonSkeleton() {
  return (
    <div className="skeleton" aria-label={tx('Caricamento della lezione', 'Loading the lesson')}>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} style={{ width: `${[92, 100, 84, 97, 60, 88, 74][i]}%` }} />
      ))}
    </div>
  )
}
