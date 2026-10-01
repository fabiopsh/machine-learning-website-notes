import { getLesson } from '../content/lessons'
import type { Route } from './router'

/**
 * Titolo, descrizione e indirizzo canonico della pagina corrente, aggiornati a ogni cambio di route:
 * servono alla scheda del browser, ai segnalibri e ai motori di ricerca che eseguono JavaScript.
 * Le anteprime dei link usano invece le pagine statiche generate da `plugins/seo.ts` (stessi testi).
 */

// i valori dell'index.html (la home), letti una volta sola
const HOME = {
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
}

function set(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

export function applyMeta(route: Route) {
  let title = HOME.title
  let description = HOME.description
  let path = ''
  if (route.name === 'lesson') {
    const l = getLesson(route.id)
    title = `${l?.title ?? 'Lezione'} · Appunti di Machine Learning`
    description = l?.summary ?? HOME.description
    path = `lezione/${route.id}/`
  } else if (route.name === 'glossary') {
    title = 'Glossario di Machine Learning — Appunti interattivi'
    description = 'I termini del corso di Machine Learning: una definizione breve per ciascuno e il rimando alla lezione in cui è spiegato.'
    path = 'glossario/'
  }
  const url = HOME.canonical + path
  document.title = title
  set('meta[name="description"]', 'content', description)
  set('meta[property="og:title"]', 'content', title)
  set('meta[property="og:description"]', 'content', description)
  if (HOME.canonical) {
    set('link[rel="canonical"]', 'href', url)
    set('meta[property="og:url"]', 'content', url)
  }
}
