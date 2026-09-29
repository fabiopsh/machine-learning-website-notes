import { useState } from 'react'

/**
 * Flag "a scatto": ognuno diventa true la prima volta che la sua condizione è vera
 * e poi resta tale. Serve ai suggerimenti "Prova a…" che si spuntano da soli.
 *
 * Aggiorna lo stato durante il render (pattern "adjusting state when props change"
 * della documentazione di React): niente effetti, niente render a cascata.
 */
export function useLatch<K extends string>(conds: Record<K, boolean>): Record<K, boolean> {
  const [latched, setLatched] = useState<Record<K, boolean>>(() => {
    const init = {} as Record<K, boolean>
    for (const k in conds) init[k] = false
    return init
  })
  let next: Record<K, boolean> | null = null
  for (const k in conds) {
    if (conds[k] && !latched[k]) {
      next = next ?? { ...latched }
      next[k] = true
    }
  }
  if (next) {
    setLatched(next)
    return next
  }
  return latched
}
