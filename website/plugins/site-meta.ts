import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { lessonsEn, partsEn } from '../src/content/lessons.en.ts'

/**
 * Dati per le metainformazioni del sito (anteprime dei link, motori di ricerca), letti dai contenuti:
 * li usano il plugin `seo.ts` (pagine statiche, sitemap, <head>) e `scripts/og.mjs` (immagini di anteprima).
 * Solo sintassi TypeScript «cancellabile»: Node esegue questo file direttamente.
 */

export type Lang = 'it' | 'en'
export const LANGS: Lang[] = ['it', 'en']

/** indirizzo pubblico del sito, con la barra finale */
export const SITE_URL = 'https://fabiopsh.github.io/machine-learning-website-notes/'
export const AUTHOR = 'Fabio Piscitelli'

const TEXT = {
  it: {
    siteName: 'Machine Learning — Appunti interattivi',
    course: 'Machine Learning (654AA), prof. Alessio Micheli, Università di Pisa, a.a. 2026/27',
    notes: 'Appunti di Machine Learning',
  },
  en: {
    siteName: 'Machine Learning — Interactive notes',
    course: 'Machine Learning (654AA), Prof. Alessio Micheli, University of Pisa, a.y. 2026/27',
    notes: 'Machine Learning notes',
  },
}

export const siteName = (lang: Lang = 'it') => TEXT[lang].siteName
export const course = (lang: Lang = 'it') => TEXT[lang].course
export const notesName = (lang: Lang = 'it') => TEXT[lang].notes

const ROOT = resolve(import.meta.dirname, '..')
const LESSONS_DIR = resolve(ROOT, 'src/content/lessons')
const LESSONS_EN_DIR = resolve(ROOT, 'src/content/lessons-en')

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

/**
 * Le lezioni nell'ordine dell'indice, con titolo e riassunto presi da `src/content/lessons.ts`
 * (in inglese: da `lessons.en.ts` e dall'MDX tradotto, se c'è).
 */
export function readLessons(lang: Lang = 'it'): LessonMeta[] {
  const src = readFileSync(resolve(ROOT, 'src/content/lessons.ts'), 'utf8')
  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.mdx'))
  const out: LessonMeta[] = []
  // ogni parte: roman, title, poi le sue L('NN', 'Titolo', { … })
  for (const p of src.matchAll(/roman: '([^']+)',\s*title: '([^']+)',\s*lessons: \[([\s\S]*?)\n {4}\],/g)) {
    for (const l of p[3].matchAll(/L\('(\d\d)', '([^']+)'(?:, \{([\s\S]*?)\}\))?/g)) {
      const file = files.find((f) => f.startsWith(l[1] + '-'))
      if (!file) continue
      const translated = lang === 'en' && existsSync(resolve(LESSONS_EN_DIR, file))
      const mdx = readFileSync(resolve(translated ? LESSONS_EN_DIR : LESSONS_DIR, file), 'utf8')
      const field = (name: string) => new RegExp(`${name}: '([^']*)'`).exec(l[3] ?? '')?.[1] ?? ''
      const en = lang === 'en' ? lessonsEn[l[1]] : undefined
      out.push({
        id: l[1],
        title: en?.title ?? l[2],
        part: p[1],
        partTitle: (lang === 'en' && partsEn[p[1]]) || p[2],
        eyebrow: en ? (en.eyebrow ?? '') : field('eyebrow'),
        summary: en?.summary ?? field('summary'),
        sections: [...mdx.matchAll(/^## (.*)$/gm)].map((m) => plain(m[1])),
        figures: (mdx.match(/<Figure\b/g) ?? []).length,
      })
    }
  }
  return out
}

/** Id (e cartella) della pagina dei prerequisiti: come `PREREQ_ID` in `src/lib/router.ts`. */
export const PREREQ_ID = 'prerequisiti'

/** La pagina dei prerequisiti, letta da `src/content/lessons.ts` (`prereq`) e dal suo MDX. */
export function readPrereq(lang: Lang = 'it'): LessonMeta {
  const src = readFileSync(resolve(ROOT, 'src/content/lessons.ts'), 'utf8')
  const block = src.slice(src.indexOf('export const prereq'))
  const pair = (name: string) => new RegExp(`${name}: tx\\(\\s*'([^']*)',\\s*'([^']*)'`).exec(block)
  const [title, eyebrow, summary] = ['title', 'eyebrow', 'summary'].map((name) => {
    const m = pair(name)
    if (!m) throw new Error(`site-meta: campo "${name}" dei prerequisiti non trovato in src/content/lessons.ts`)
    return m[lang === 'en' ? 2 : 1]
  })
  const mdx = readFileSync(resolve(ROOT, `src/content/${lang === 'en' ? 'extra-en' : 'extra'}/${PREREQ_ID}.mdx`), 'utf8')
  return {
    id: PREREQ_ID,
    title,
    part: '',
    partTitle: '',
    eyebrow,
    summary,
    sections: [...mdx.matchAll(/^## (.*)$/gm)].map((m) => plain(m[1])),
    figures: (mdx.match(/<Figure\b/g) ?? []).length,
  }
}

/** Titolo, descrizione e indirizzo di ogni pagina condivisibile. */
export function pages(lang: Lang = 'it') {
  const lessons = readLessons(lang)
  const figures = lessons.reduce((s, l) => s + l.figures, 0)
  const prefix = langPrefix(lang)
  const image = `og/${prefix}home.jpg`
  const home =
    lang === 'en'
      ? {
          path: prefix,
          title: 'Interactive Machine Learning notes — University of Pisa',
          description: `The ${lessons.length} lessons of the Machine Learning course of the University of Pisa as pages to explore: formulas explained symbol by symbol, ${figures} figures to manipulate, a glossary and exam questions with answer outlines.`,
          image,
        }
      : {
          path: prefix,
          title: 'Appunti interattivi di Machine Learning — Università di Pisa',
          description: `Le ${lessons.length} lezioni del corso di Machine Learning dell’Università di Pisa in pagine da esplorare: formule spiegate simbolo per simbolo, ${figures} figure da manipolare, glossario e domande d’esame con traccia di risposta.`,
          image,
        }
  const glossary =
    lang === 'en'
      ? {
          path: `${prefix}glossario/`,
          title: 'Machine Learning glossary — Interactive notes',
          description:
            'The terms of the Machine Learning course, from inductive bias to message passing: a short definition for each and a pointer to the lesson where it is explained.',
          image,
        }
      : {
          path: `${prefix}glossario/`,
          title: 'Glossario di Machine Learning — Appunti interattivi',
          description:
            'I termini del corso di Machine Learning, dal bias induttivo al message passing: una definizione breve per ciascuno e il rimando alla lezione in cui è spiegato.',
          image,
        }
  const pre = readPrereq(lang)
  const prereq = {
    path: `${prefix}${PREREQ_ID}/`,
    title: `${pre.title} · ${notesName(lang)}`,
    description: pre.summary,
    image: `og/${prefix}${PREREQ_ID}.jpg`,
    meta: pre,
  }
  return { lessons, figures, home, glossary, prereq }
}

/** Le pagine inglesi stanno sotto `en/` (stessi percorsi dell'italiano). */
export const langPrefix = (lang: Lang = 'it') => (lang === 'en' ? 'en/' : '')
export const lessonPath = (id: string, lang: Lang = 'it') => `${langPrefix(lang)}lezione/${id}/`
export const lessonTitle = (l: LessonMeta, lang: Lang = 'it') => `${l.title} · ${notesName(lang)}`
export const lessonNumber = (l: LessonMeta, all: LessonMeta[], lang: Lang = 'it') =>
  lang === 'en' ? `Lesson ${all.indexOf(l) + 1} of ${all.length}` : `Lezione ${all.indexOf(l) + 1} di ${all.length}`
