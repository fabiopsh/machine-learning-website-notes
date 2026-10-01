import { getLesson } from '../content/lessons'
import { isEn, tx } from './i18n'
import type { Route } from './router'

/**
 * Titolo, descrizione e indirizzo canonico della pagina corrente, aggiornati a ogni cambio di route:
 * servono alla scheda del browser, ai segnalibri e ai motori di ricerca che eseguono JavaScript.
 * Le anteprime dei link usano invece le pagine statiche generate da `plugins/seo.ts` (stessi testi).
 */

// i valori dell'index.html (la home), letti una volta sola
const HOME = {
  title: isEn ? 'Interactive Machine Learning notes — University of Pisa' : document.title,
  description: isEn
    ? 'The lessons of the Machine Learning course of the University of Pisa as pages to explore: formulas explained symbol by symbol, figures to manipulate, a glossary and exam questions with answer outlines.'
    : (document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''),
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
    title = `${l?.title ?? tx('Lezione', 'Lesson')} · ${tx('Appunti di Machine Learning', 'Machine Learning notes')}`
    description = l?.summary ?? HOME.description
    path = `${isEn ? 'en/' : ''}lezione/${route.id}/`
  } else if (route.name === 'glossary') {
    title = tx('Glossario di Machine Learning — Appunti interattivi', 'Machine Learning glossary — Interactive notes')
    description = tx(
      'I termini del corso di Machine Learning: una definizione breve per ciascuno e il rimando alla lezione in cui è spiegato.',
      'The terms of the Machine Learning course: a short definition for each and a pointer to the lesson where it is explained.',
    )
    path = `${isEn ? 'en/' : ''}glossario/`
  } else if (isEn) {
    path = 'en/'
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
