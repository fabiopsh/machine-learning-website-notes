import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../ui/Icon'
import { Rich } from './Tex'

type FigureProps = {
  n: string
  title: string
  /** 'wide' esce leggermente dalla colonna del testo */
  size?: 'normal' | 'wide'
  children: ReactNode
}

/** Didascalia (accetta markdown e formule dall'MDX). */
export function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="fig__caption">{children}</figcaption>
}

/**
 * Mette in pausa le animazioni CSS di una figura quando è fuori dallo schermo: altrimenti le
 * animazioni infinite (anelli, frecce tratteggiate) fanno ridisegnare la pagina a ogni frame.
 */
function usePauseWhenAway() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-away', !e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

export function Figure({ n, title, size = 'normal', children }: FigureProps) {
  const ref = usePauseWhenAway()
  const items = Children.toArray(children)
  const caption = items.find((c) => isValidElement(c) && c.type === Caption)
  const body = items.filter((c) => c !== caption)
  return (
    <figure ref={ref} className={`fig fig--${size}`} id={`fig-${n.replace('.', '-')}`}>
      <div className="fig__head">
        <span className="fig__num">Fig. {n}</span>
        <span className="fig__title">{title}</span>
        <span className="fig__badge" title="Figura interattiva">
          <Icon name="hand" size={13} />
          interattiva
        </span>
      </div>
      <div className="fig__body">{body}</div>
      {caption}
    </figure>
  )
}

export type Task = { label: ReactNode; done: boolean }

/** "Prova a…": suggerimenti che si spuntano da soli quando lo studente li esegue. */
export function Tasks({ items }: { items: Task[] }) {
  const done = items.filter((t) => t.done).length
  return (
    <div className="tasks">
      <div className="tasks__head">
        <span>Prova a…</span>
        <span className="tasks__count">
          {done}/{items.length}
        </span>
      </div>
      <ul>
        {items.map((t, i) => (
          <li key={i} className={t.done ? 'is-done' : undefined}>
            <span className="tasks__box">{t.done && <Icon name="check" size={12} strokeWidth={2.4} />}</span>
            <span>{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Domande d'esame con traccia di risposta nascosta. */
export function Exam({ children }: { children: ReactNode }) {
  return (
    <section className="exam" aria-label="Possibili domande d'esame">
      <div className="exam__head">
        <span className="exam__label">
          <Icon name="question" size={15} /> Possibili domande d’esame
        </span>
        <span className="exam__hint">Prova a rispondere, poi apri la traccia</span>
      </div>
      <ol className="exam__list">{children}</ol>
    </section>
  )
}

export function Q({ q, children }: { q: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <li className={`exam__q${open ? ' is-open' : ''}`}>
      <div className="exam__qtext">{typeof q === 'string' ? <Rich text={q} /> : q}</div>
      <button className="exam__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Nascondi traccia' : 'Mostra traccia di risposta'}
        <Icon name="chevronDown" size={15} />
      </button>
      <div className="exam__answer" inert={!open}>
        <div className="exam__answer-inner">
          <div className="exam__answer-body">{children}</div>
        </div>
      </div>
    </li>
  )
}
