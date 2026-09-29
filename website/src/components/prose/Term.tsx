import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { getLesson } from '../../content/lessons'
import { glossaryById } from '../../content/glossary'
import { glossaryHref, lessonHref } from '../../lib/router'
import { slugify } from '../../lib/slug'
import { Icon } from '../ui/Icon'
import { Rich } from './Tex'

const OPEN_EVENT = 'term-popover-open'

/** Termine del glossario: sottolineato, al passaggio (o al tocco) mostra la definizione. */
export function T({ id, children }: { id: string; children?: ReactNode }) {
  const entry = glossaryById.get(id)
  const anchor = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null)

  const show = (delay = 120) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = (delay = 160) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), delay)
  }

  // un solo popover aperto alla volta
  useEffect(() => {
    if (!open) return
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: anchor.current }))
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== anchor.current) setOpen(false)
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!anchor.current?.contains(t) && !pop.current?.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => setOpen(false)
    window.addEventListener(OPEN_EVENT, onOther)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener(OPEN_EVENT, onOther)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open || !anchor.current) return
    const r = anchor.current.getBoundingClientRect()
    const width = Math.min(340, window.innerWidth - 24)
    const left = Math.min(Math.max(12, r.left + r.width / 2 - width / 2), window.innerWidth - width - 12)
    const above = r.bottom + 220 > window.innerHeight && r.top > 240
    setPos({ left, top: above ? r.top - 10 : r.bottom + 10, above })
  }, [open])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!entry) return <>{children}</>
  const lesson = getLesson(entry.lesson)
  const href = lessonHref(entry.lesson, slugify(entry.section))

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className={`term${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onMouseEnter={() => show()}
        onMouseLeave={() => hide()}
        onFocus={() => show(0)}
        onBlur={() => hide(200)}
        onClick={() => setOpen((o) => !o)}
      >
        {children ?? entry.term}
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={pop}
            role="tooltip"
            className={`term-pop${pos.above ? ' is-above' : ''}`}
            style={{ left: pos.left, top: pos.top }}
            onMouseEnter={() => window.clearTimeout(timer.current)}
            onMouseLeave={() => hide()}
          >
            <div className="term-pop__head">
              <span className="term-pop__term">{entry.term}</span>
              {entry.en && <span className="term-pop__en">{entry.en}</span>}
            </div>
            <p className="term-pop__def">
              <Rich text={entry.def} />
            </p>
            <div className="term-pop__foot">
              <a href={href} onClick={() => setOpen(false)}>
                <span className="term-pop__lesson">{entry.lesson}</span>
                {lesson?.title}
                <Icon name="arrowRight" size={14} />
              </a>
              <a href={glossaryHref(entry.id)} onClick={() => setOpen(false)} className="term-pop__gloss">
                Glossario
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
