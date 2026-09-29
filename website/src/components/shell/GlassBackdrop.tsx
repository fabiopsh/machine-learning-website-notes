import { useEffect } from 'react'

/** Superfici che, nello stile Liquid Glass, catturano un riflesso di luce sotto il puntatore. */
const LIT = '.fig, .callout, .deep, .exam, .card, .pager__card, .index__row, .howto__grid li, .cmap, .gloss__entry, .hero__figure'

/**
 * Sfondo dello stile Liquid Glass: macchie di colore sfocate che si muovono lentamente
 * dietro le superfici di vetro, più un riflesso che segue il puntatore sulle superfici.
 */
export function GlassBackdrop() {
  useEffect(() => {
    let lit: HTMLElement | null = null
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const el = (e.target as Element | null)?.closest?.(LIT) as HTMLElement | null
      if (lit && lit !== el) lit.style.removeProperty('--lx')
      lit = el
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--lx', `${e.clientX - r.left}px`)
      el.style.setProperty('--ly', `${e.clientY - r.top}px`)
    }
    const onLeave = () => {
      lit?.style.removeProperty('--lx')
      lit = null
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      lit?.style.removeProperty('--lx')
    }
  }, [])

  return (
    <div className="glass-bg" aria-hidden="true">
      <span className="glass-bg__blob glass-bg__blob--1" />
      <span className="glass-bg__blob glass-bg__blob--2" />
      <span className="glass-bg__blob glass-bg__blob--3" />
      <span className="glass-bg__blob glass-bg__blob--4" />
      <span className="glass-bg__blob glass-bg__blob--5" />
      <span className="glass-bg__grain" />
    </div>
  )
}
