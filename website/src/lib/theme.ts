import { useCallback, useSyncExternalStore } from 'react'

/**
 * Due impostazioni indipendenti, entrambe salvate nel browser e applicate su <html>:
 *   data-theme = light | dark        (chiaro / scuro)
 *   data-style = classic | glass     (stile classico "carta e inchiostro" / Liquid Glass)
 * index.html le applica già prima del primo paint.
 */

export type Theme = 'light' | 'dark'
export type Look = 'classic' | 'glass'

const THEME_KEY = 'ml-theme'
const LOOK_KEY = 'ml-style'
const listeners = new Set<() => void>()

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function currentLook(): Look {
  return document.documentElement.dataset.style === 'glass' ? 'glass' : 'classic'
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function apply(attr: 'theme' | 'style', value: string, key: string) {
  const root = document.documentElement
  // transizione morbida solo durante il cambio esplicito
  root.classList.add('theme-anim')
  root.dataset[attr] = value
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage non disponibile: la scelta vale solo per la sessione */
  }
  window.setTimeout(() => root.classList.remove('theme-anim'), 450)
  listeners.forEach((l) => l())
}

export function setTheme(t: Theme) {
  apply('theme', t, THEME_KEY)
}

export function setLook(s: Look) {
  apply('style', s, LOOK_KEY)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as Theme)
  const toggle = useCallback(() => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}

export function useLook() {
  const look = useSyncExternalStore(subscribe, currentLook, () => 'classic' as Look)
  const toggle = useCallback(() => setLook(currentLook() === 'glass' ? 'classic' : 'glass'), [])
  return { look, toggle }
}

/** Legge un token CSS (es. '--c-blue') — utile per i disegni su canvas. */
export function cssVar(name: string, el: Element = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim()
}
