import { useSyncExternalStore } from 'react'

/**
 * Modalità di lettura delle lezioni, salvata in questo browser:
 *   full = gli appunti completi
 *   easy = la versione «spiegata semplice» (stessi titoli, formule e figure, testo riscritto con parole facili)
 * Vale solo per le lezioni che hanno la versione semplice (vedi `hasEasy` in content/lessons.ts).
 */
export type Mode = 'full' | 'easy'

const KEY = 'ml-mode'
const listeners = new Set<() => void>()

function load(): Mode {
  try {
    return localStorage.getItem(KEY) === 'easy' ? 'easy' : 'full'
  } catch {
    return 'full'
  }
}

let mode: Mode = load()

export function setMode(next: Mode) {
  if (next === mode) return
  mode = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* storage non disponibile: la scelta vale solo per la sessione */
  }
  listeners.forEach((l) => l())
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => mode,
    () => 'full' as Mode,
  )
}
