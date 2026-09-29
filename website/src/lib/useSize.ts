import { useLayoutEffect, useState, type RefObject } from 'react'

/** Larghezza reale (in px CSS) di un elemento, aggiornata al ridimensionamento. */
export function useWidth(ref: RefObject<HTMLElement | null>, fallback = 640) {
  const [w, setW] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.getBoundingClientRect().width || fallback)
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width
      if (cw) setW(cw)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, fallback])
  return w
}
