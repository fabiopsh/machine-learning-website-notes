import { useSyncExternalStore } from 'react'
import { lang, type Lang } from './i18n'

/**
 * Router minimale. Ogni pagina ha un indirizzo vero, con un file statico dietro (generato da `plugins/seo.ts`):
 * così chi copia l'indirizzo dalla barra del browser condivide un link con la sua anteprima.
 *   …/                          home
 *   …/lezione/03/               lezione
 *   …/lezione/03/#bias          lezione, con sezione
 *   …/glossario/                glossario
 *   …/glossario/#overfitting    glossario, con voce
 *   …/prerequisiti/             prerequisiti (impaginati come una lezione, con id `prerequisiti`)
 *   …/prerequisiti/#la-derivata prerequisiti, con sezione
 * Le pagine inglesi hanno gli stessi indirizzi sotto `…/en/`.
 *
 * Dentro il sito i link restano nella forma `#/lezione/03/bias` (`lessonHref`, `glossaryHref`, link negli MDX):
 * il router li riscrive nell'indirizzo vero appena vengono seguiti. Valgono ancora, allo stesso modo, i vecchi
 * indirizzi con l'hash (`…/#/lezione/03`).
 */

/** Id della pagina dei prerequisiti: è trattata come una lezione fuori dall'elenco. */
export const PREREQ_ID = 'prerequisiti'

export type Route =
  | { name: 'home' }
  | { name: 'lesson'; id: string; section?: string; silent?: boolean }
  | { name: 'glossary'; term?: string }
  | { name: 'notfound' }

/** Cartella del sito (finisce con `/`), calcolata al caricamento: `data-root` è scritto in ogni pagina. */
const ROOT = new URL(document.documentElement.dataset.root ?? './', window.location.href).pathname

export function parseHash(hash: string): Route {
  let path = hash.replace(/^#\/?/, '')
  try {
    path = decodeURIComponent(path)
  } catch {
    // sequenza % non valida: si usa il testo così com'è
  }
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'lezione' && parts[1]) return { name: 'lesson', id: parts[1], section: parts[2] }
  if (parts[0] === PREREQ_ID) return { name: 'lesson', id: PREREQ_ID, section: parts[1] }
  if (parts[0] === 'glossario') return { name: 'glossary', term: parts[1] }
  return { name: 'notfound' }
}

export function lessonHref(id: string, section?: string) {
  if (id === PREREQ_ID) return section ? `#/${PREREQ_ID}/${encodeURIComponent(section)}` : `#/${PREREQ_ID}`
  return section ? `#/lezione/${id}/${encodeURIComponent(section)}` : `#/lezione/${id}`
}

export function glossaryHref(term?: string) {
  return term ? `#/glossario/${encodeURIComponent(term)}` : '#/glossario'
}

/** Percorso della pagina dentro il sito, senza lingua (`lezione/03/`), e sua sezione. */
export function routePath(r: Route): { page: string; fragment?: string } | null {
  if (r.name === 'home') return { page: '' }
  if (r.name === 'lesson') return { page: r.id === PREREQ_ID ? `${PREREQ_ID}/` : `lezione/${r.id}/`, fragment: r.section }
  if (r.name === 'glossary') return { page: 'glossario/', fragment: r.term }
  return null
}

/** Indirizzo vero (quello da condividere) di un link interno `#/…`, nella lingua indicata. */
export function urlOf(href: string, l: Lang = lang) {
  const prefix = ROOT + (l === 'en' ? 'en/' : '')
  const p = routePath(parseHash(href))
  if (!p) return prefix + href
  return prefix + p.page + (p.fragment ? '#' + encodeURIComponent(p.fragment) : '')
}

/** L'indirizzo corrente nella forma interna `#/…` (accetta anche i vecchi indirizzi con l'hash). */
function currentHref() {
  const { pathname, hash } = window.location
  if (hash.startsWith('#/')) return hash
  const page = (pathname.startsWith(ROOT) ? pathname.slice(ROOT.length) : '')
    .replace(/^en(\/|$)/, '')
    .replace(/index\.html$/, '')
    .replace(/\/+$/, '')
  if (!page) return '#/'
  return '#/' + page + (hash.length > 1 ? '/' + hash.slice(1) : '')
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener('hashchange', cb)
    window.removeEventListener('popstate', cb)
  }
}

const locationKey = () => window.location.pathname + window.location.hash

let cachedKey: string | null = null
let cachedRoute: Route = { name: 'home' }
function snapshot(): Route {
  if (locationKey() !== cachedKey) {
    const href = currentHref()
    cachedRoute = parseHash(href)
    // un link interno appena seguito (o un vecchio indirizzo) lascia `#/…` nella barra: lo si sostituisce con quello vero
    if (window.location.hash.startsWith('#/') && cachedRoute.name !== 'notfound') {
      history.replaceState(history.state, '', urlOf(href))
    }
    cachedKey = locationKey()
  }
  return cachedRoute
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot, () => cachedRoute)
}

export function navigate(href: string) {
  history.pushState(null, '', urlOf(href))
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Aggiorna l'indirizzo senza generare un nuovo evento di navigazione. */
export function replaceHash(href: string) {
  history.replaceState(history.state, '', urlOf(href))
  cachedKey = locationKey()
  // "silent": la pagina non deve reagire (lo scroll l'ha già fatto chi ha cambiato l'indirizzo)
  cachedRoute = { ...parseHash(href), silent: true } as Route
}
