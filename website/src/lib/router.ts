import { useSyncExternalStore } from 'react'

/**
 * Router minimale basato sull'hash: funziona su qualsiasi hosting statico.
 *   #/                       home
 *   #/lezione/03             lezione
 *   #/lezione/03/bias        lezione, con sezione
 *   #/glossario              glossario
 *   #/glossario/overfitting  glossario, con voce
 */

export type Route =
  | { name: 'home' }
  | { name: 'lesson'; id: string; section?: string; silent?: boolean }
  | { name: 'glossary'; term?: string }
  | { name: 'notfound' }

export function parseHash(hash: string): Route {
  const path = decodeURIComponent(hash.replace(/^#\/?/, ''))
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'lezione' && parts[1]) return { name: 'lesson', id: parts[1], section: parts[2] }
  if (parts[0] === 'glossario') return { name: 'glossary', term: parts[1] }
  return { name: 'notfound' }
}

export function lessonHref(id: string, section?: string) {
  return section ? `#/lezione/${id}/${encodeURIComponent(section)}` : `#/lezione/${id}`
}

export function glossaryHref(term?: string) {
  return term ? `#/glossario/${encodeURIComponent(term)}` : '#/glossario'
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

let cachedHash = ''
let cachedRoute: Route = { name: 'home' }
function snapshot(): Route {
  const h = window.location.hash
  if (h !== cachedHash) {
    cachedHash = h
    cachedRoute = parseHash(h)
  }
  return cachedRoute
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot, () => cachedRoute)
}

export function navigate(href: string) {
  window.location.hash = href.replace(/^#/, '')
}

/** Aggiorna l'hash senza generare un nuovo evento di navigazione. */
export function replaceHash(href: string) {
  history.replaceState(history.state, '', href)
  cachedHash = window.location.hash
  // "silent": la pagina non deve reagire (lo scroll l'ha già fatto chi ha cambiato l'hash)
  cachedRoute = { ...parseHash(cachedHash), silent: true } as Route
}
