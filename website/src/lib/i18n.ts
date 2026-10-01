/**
 * Lingua del sito: italiano (originale) o inglese (traduzione).
 *
 * La lingua è decisa da index.html prima del primo paint (`<html lang>`: parametro `?lang=`, poi la scelta
 * salvata, poi la lingua del browser) e **non cambia durante la sessione**: cambiarla ricarica la pagina.
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

/** Cambia lingua e ricarica; `hash` (facoltativo) è la route da aprire dopo il cambio. */
export function setLang(next: Lang, hash?: string) {
  if (next === lang) return
  const url = new URL(window.location.href)
  url.searchParams.delete('lang')
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // storage non disponibile: la scelta viaggia nell'indirizzo
    url.searchParams.set('lang', next)
  }
  if (hash) url.hash = hash
  history.replaceState(history.state, '', url)
  window.location.reload()
}
