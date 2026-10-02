/**
 * Lingua del sito: italiano (originale) o inglese (traduzione).
 *
 * La lingua è quella dell'indirizzo (le pagine inglesi stanno sotto `en/`) ed è scritta in `<html lang>` da
 * index.html prima del primo paint; da un indirizzo italiano chi ha scelto l'inglese (o ha il browser in un'altra
 * lingua e non ha scelto) viene portato alla pagina inglese. **Non cambia durante la sessione**: cambiarla apre
 * l'altra pagina.
 * Per questo `tx()` si può usare ovunque, anche nelle costanti a livello di modulo.
 */

export type Lang = 'it' | 'en'

const KEY = 'ml-lang'

export const lang: Lang = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'it'
export const isEn = lang === 'en'

/** Locale per `toLocaleString` (separatore delle migliaia). */
export const LOCALE = isEn ? 'en-US' : 'it-IT'

/** Testo (o JSX, o qualsiasi valore) nella lingua corrente: `tx('Trascina il punto', 'Drag the point')`. */
export function tx<T>(it: T, en: T): T {
  return isEn ? en : it
}

/** Cambia lingua: salva la scelta e apre `url`, l'indirizzo della stessa pagina nell'altra lingua (`urlOf`). */
export function setLang(next: Lang, url: string) {
  if (next === lang) return
  let query = ''
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // storage non disponibile: la scelta viaggia nell'indirizzo
    query = `?lang=${next}`
  }
  const [page, fragment] = url.split('#')
  window.location.assign(page + query + (fragment ? '#' + fragment : ''))
}
