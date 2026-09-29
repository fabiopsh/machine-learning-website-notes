import { useEffect, useState } from 'react'
import { Rich } from '../prose/Tex'
import { lessonHref, replaceHash } from '../../lib/router'

export type TocItem = { id: string; text: string; depth: number }

export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | undefined>()
  useEffect(() => {
    if (!ids.length) return
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const onScroll = () => {
      const line = window.innerHeight * 0.28
      let cur: string | undefined = els[0]?.id
      for (const el of els) {
        if (el.getBoundingClientRect().top - line <= 0) cur = el.id
        else break
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

export function scrollToSection(lessonId: string, id: string, smooth = true) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  replaceHash(lessonHref(lessonId, id))
}

export function TocList({
  items,
  active,
  lessonId,
  onPick,
}: {
  items: TocItem[]
  active?: string
  lessonId: string
  onPick?: () => void
}) {
  return (
    <ol className="toc__list">
      {items.map((it) => (
        <li key={it.id} className={`toc__item toc__item--${it.depth}${active === it.id ? ' is-active' : ''}`}>
          <a
            href={lessonHref(lessonId, it.id)}
            onClick={(e) => {
              e.preventDefault()
              scrollToSection(lessonId, it.id)
              onPick?.()
            }}
          >
            <Rich text={it.text} />
          </a>
        </li>
      ))}
    </ol>
  )
}
