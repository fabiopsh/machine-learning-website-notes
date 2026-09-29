import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'ml-theme'
const listeners = new Set<() => void>()

function current(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setTheme(t: Theme) {
  const root = document.documentElement
  // transizione morbida solo durante il cambio esplicito
  root.classList.add('theme-anim')
  root.dataset.theme = t
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* storage non disponibile: il tema vale solo per la sessione */
  }
  window.setTimeout(() => root.classList.remove('theme-anim'), 350)
  listeners.forEach((l) => l())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme)
  const toggle = useCallback(() => setTheme(current() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}

/** Legge un token CSS (es. '--c-blue') — utile per i disegni su canvas. */
export function cssVar(name: string, el: Element = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim()
}
