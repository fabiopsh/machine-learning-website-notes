import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Dati per le metainformazioni del sito (anteprime dei link, motori di ricerca), letti dai contenuti:
 * li usano il plugin `seo.ts` (pagine statiche, sitemap, <head>) e `scripts/og.mjs` (immagini di anteprima).
 * Solo sintassi TypeScript «cancellabile»: Node esegue questo file direttamente.
 */

/** indirizzo pubblico del sito, con la barra finale */
export const SITE_URL = 'https://fabiopsh.github.io/machine-learning-website-notes/'
export const SITE_NAME = 'Machine Learning — Appunti interattivi'
export const AUTHOR = 'Fabio Piscitelli'
export const COURSE = 'Machine Learning (654AA), prof. Alessio Micheli, Università di Pisa, a.a. 2026/27'

const ROOT = resolve(import.meta.dirname, '..')
const LESSONS_DIR = resolve(ROOT, 'src/content/lessons')

export type LessonMeta = {
  id: string
  title: string
  /** numero della parte (romano) e suo titolo */
  part: string
  partTitle: string
  eyebrow: string
  summary: string
  /** titoli delle sezioni principali (##) */
  sections: string[]
  figures: number
}

const plain = (s: string) =>
  s
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/\*\*?|`/g, '')
    .trim()

/** Le lezioni nell'ordine dell'indice, con titolo e riassunto presi da `src/content/lessons.ts`. */
export function readLessons(): LessonMeta[] {
  const src = readFileSync(resolve(ROOT, 'src/content/lessons.ts'), 'utf8')
  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.mdx'))
  const out: LessonMeta[] = []
  // ogni parte: roman, title, poi le sue L('NN', 'Titolo', { … })
  for (const p of src.matchAll(/roman: '([^']+)',\s*title: '([^']+)',\s*lessons: \[([\s\S]*?)\n {4}\],/g)) {
    for (const l of p[3].matchAll(/L\('(\d\d)', '([^']+)'(?:, \{([\s\S]*?)\}\))?/g)) {
      const file = files.find((f) => f.startsWith(l[1] + '-'))
      if (!file) continue
      const mdx = readFileSync(resolve(LESSONS_DIR, file), 'utf8')
      const field = (name: string) => new RegExp(`${name}: '([^']*)'`).exec(l[3] ?? '')?.[1] ?? ''
      out.push({
        id: l[1],
        title: l[2],
        part: p[1],
        partTitle: p[2],
        eyebrow: field('eyebrow'),
        summary: field('summary'),
        sections: [...mdx.matchAll(/^## (.*)$/gm)].map((m) => plain(m[1])),
        figures: (mdx.match(/<Figure\b/g) ?? []).length,
      })
    }
  }
  return out
}

/** Titolo, descrizione e indirizzo di ogni pagina condivisibile. */
export function pages() {
  const lessons = readLessons()
  const figures = lessons.reduce((s, l) => s + l.figures, 0)
  const home = {
    path: '',
    title: 'Appunti interattivi di Machine Learning — Università di Pisa',
    description: `Le ${lessons.length} lezioni del corso di Machine Learning dell’Università di Pisa in pagine da esplorare: formule spiegate simbolo per simbolo, ${figures} figure da manipolare, glossario e domande d’esame con traccia di risposta.`,
    image: 'og/home.png',
  }
  const glossary = {
    path: 'glossario/',
    title: 'Glossario di Machine Learning — Appunti interattivi',
    description:
      'I termini del corso di Machine Learning, dal bias induttivo al message passing: una definizione breve per ciascuno e il rimando alla lezione in cui è spiegato.',
    image: 'og/home.png',
  }
  return { lessons, figures, home, glossary }
}

export const lessonPath = (id: string) => `lezione/${id}/`
export const lessonTitle = (l: LessonMeta) => `${l.title} · Appunti di Machine Learning`
export const lessonNumber = (l: LessonMeta, all: LessonMeta[]) => `Lezione ${all.indexOf(l) + 1} di ${all.length}`
