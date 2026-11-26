import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getSelectionSnapshot, openBugReport, type SelectionSnapshot } from '../../lib/bugReport'
import { tx } from '../../lib/i18n'
import type { Route } from '../../lib/router'
import { Icon } from '../ui/Icon'

type PopState = {
  snap: SelectionSnapshot
  left: number
  top: number
  above: boolean
}

function positionOf(rect: DOMRect): { left: number; top: number; above: boolean } | null {
  if (rect.bottom < 0 || rect.top > window.innerHeight) return null
  const margin = 96
  const left = Math.min(Math.max(margin, rect.left + rect.width / 2), window.innerWidth - margin)
  const above = rect.top > 112
  return { left, top: above ? rect.top - 10 : rect.bottom + 10, above }
}

/**
 * Bottone flottante vicino al testo selezionato: un clic apre una issue GitHub precompilata
 * con citazione, contesto, sezione, file sorgente e stato della pagina.
 */
export function SelectionBugButton({ route }: { route: Route }) {
  const [pop, setPop] = useState<PopState | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | undefined>(undefined)

  // chiude il bottone quando cambia pagina (aggiornamento durante il render, senza effetti)
  const pageKey = route.name === 'lesson' ? `lesson:${route.id}` : route.name
  const [prevPage, setPrevPage] = useState(pageKey)
  if (prevPage !== pageKey) {
    setPrevPage(pageKey)
    setPop(null)
  }

  useEffect(() => {
    const refresh = () => {
      const snap = getSelectionSnapshot(document.getElementById('contenuto'))
      if (!snap) {
        setPop(null)
        return
      }
      const pos = positionOf(snap.rect)
      if (!pos) {
        setPop(null)
        return
      }
      setPop({ snap, ...pos })
    }

    const schedule = (delay: number) => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(refresh, delay)
    }

    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) {
        window.clearTimeout(timerRef.current)
        setPop(null)
        return
      }
      schedule(140)
    }

    const onPointerUp = (e: Event) => {
      if (btnRef.current?.contains(e.target as Node)) return
      schedule(16)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPop(null)
        return
      }
      if (e.shiftKey || e.key === 'a' || e.key === 'A') schedule(16)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('mouseup', onPointerUp)
    document.addEventListener('touchend', onPointerUp)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      window.clearTimeout(timerRef.current)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('mouseup', onPointerUp)
      document.removeEventListener('touchend', onPointerUp)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // mantiene il bottone ancorato alla selezione durante lo scroll o il ridimensionamento
  const visible = Boolean(pop)
  useEffect(() => {
    if (!visible) return
    let raf = 0
    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const snap = getSelectionSnapshot(document.getElementById('contenuto'))
        const pos = snap ? positionOf(snap.rect) : null
        setPop(snap && pos ? { snap, ...pos } : null)
      })
    }
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [visible])

  if (!pop) return null

  return createPortal(
    <button
      ref={btnRef}
      type="button"
      className={`bug-pop${pop.above ? ' is-above' : ''}`}
      style={{ left: pop.left, top: pop.top }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        openBugReport(route, pop.snap)
        setPop(null)
        window.getSelection()?.removeAllRanges()
      }}
      aria-label={tx('Segnala un errore su questo testo su GitHub', 'Report an issue with this text on GitHub')}
    >
      <Icon name="bug" size={15} />
      <span>{tx('Segnala errore', 'Report issue')}</span>
    </button>,
    document.body,
  )
}
