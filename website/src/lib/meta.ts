import { getLesson } from '../content/lessons'
import { isEn, tx, type Lang } from './i18n'
import { PREREQ_ID, routePath, type Route } from './router'

/**
 * Titolo, descrizione, indirizzo canonico e immagine della pagina corrente, aggiornati a ogni cambio di route:
 * servono alla scheda del browser, ai segnalibri, a chi condivide la pagina dal menu del browser e ai motori di
 * ricerca che eseguono JavaScript. Chi apre direttamente un indirizzo trova già gli stessi valori nel file
 * statico di quella pagina, generato da `plugins/seo.ts`.
 */

type Site = { url: string; home: Record<Lang, { title: string; description: string }> }

// dati del sito scritti nel <head> da plugins/seo.ts
function readSite(): Site | null {
  try {
    return JSON.parse(document.getElementById('ml-site')?.textContent ?? '') as Site
  } catch {
    return null
  }
}
const SITE = readSite()
const HOME = SITE?.home[isEn ? 'en' : 'it'] ?? { title: document.title, description: '' }

function set(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

export function applyMeta(route: Route) {
  let title = HOME.title
  let description = HOME.description
  let image = 'home'
  if (route.name === 'lesson') {
    const l = getLesson(route.id)
    title = `${l?.title ?? tx('Lezione', 'Lesson')} · ${tx('Appunti di Machine Learning', 'Machine Learning notes')}`
    description = l?.summary ?? HOME.description
    if (l) image = route.id === PREREQ_ID ? PREREQ_ID : l.id
  } else if (route.name === 'glossary') {
    title = tx('Glossario di Machine Learning — Appunti interattivi', 'Machine Learning glossary — Interactive notes')
    description = tx(
      'I termini del corso di Machine Learning, dal bias induttivo al message passing: una definizione breve per ciascuno e il rimando alla lezione in cui è spiegato.',
      'The terms of the Machine Learning course, from inductive bias to message passing: a short definition for each and a pointer to the lesson where it is explained.',
    )
  }
  document.title = title
  set('meta[name="description"]', 'content', description)
  for (const name of ['og:title', 'og:image:alt']) set(`meta[property="${name}"]`, 'content', title)
  set('meta[name="twitter:title"]', 'content', title)
  set('meta[property="og:description"]', 'content', description)
  set('meta[name="twitter:description"]', 'content', description)
  if (!SITE) return

  const page = routePath(route)?.page ?? ''
  const url = SITE.url + (isEn ? 'en/' : '') + page
  const img = `${SITE.url}og/${isEn ? 'en/' : ''}${image}.jpg`
  set('link[rel="canonical"]', 'href', url)
  set('link[rel="alternate"][hreflang="it"]', 'href', SITE.url + page)
  set('link[rel="alternate"][hreflang="en"]', 'href', SITE.url + 'en/' + page)
  set('link[rel="alternate"][hreflang="x-default"]', 'href', SITE.url + page)
  set('meta[property="og:url"]', 'content', url)
  set('meta[property="og:image"]', 'content', img)
  set('meta[name="twitter:image"]', 'content', img)
}
