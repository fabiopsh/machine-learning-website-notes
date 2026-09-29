import GithubSlugger from 'github-slugger'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Espone `virtual:lesson-index`: per ogni lezione MDX l'elenco dei titoli
 * (con gli stessi slug generati da rehype-slug), le figure e il numero di parole.
 * Serve alla ricerca globale e alla home senza caricare le lezioni intere.
 */

const VIRTUAL_ID = 'virtual:lesson-index'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const LESSONS_DIR = resolve(import.meta.dirname, '../src/content/lessons')

type Heading = { depth: number; text: string; slug: string }
type FigureRef = { n: string; title: string }
type LessonIndexEntry = { headings: Heading[]; figures: FigureRef[]; words: number }

function plainHeading(raw: string): string {
  return raw
    .replace(/\$/g, '')
    .replace(/\*\*?|`/g, '')
    .trim()
}

function indexLesson(source: string): LessonIndexEntry {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  const figures: FigureRef[] = []
  let inFence = false
  let inMath = false
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith('```')) inFence = !inFence
    if (line.trim() === '$$') inMath = !inMath
    if (inFence || inMath) continue
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    if (h) {
      const text = plainHeading(h[2])
      headings.push({ depth: h[1].length, text: h[2].replace(/\*\*?/g, '').trim(), slug: slugger.slug(text) })
    }
  }
  const figRe = /<Figure\b[^>]*?\bn="([^"]+)"[^>]*?\btitle="([^"]+)"/g
  for (const m of source.matchAll(figRe)) figures.push({ n: m[1], title: m[2] })

  const prose = source
    .replace(/^import .*$/gm, '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' x ')
    .replace(/<[^>]+>/g, ' ')
  const words = prose.split(/\s+/).filter((w) => /[a-zà-ù]/i.test(w)).length
  return { headings, figures, words }
}

export function lessonIndex(): Plugin {
  return {
    name: 'lesson-index',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const out: Record<string, LessonIndexEntry> = {}
      for (const file of readdirSync(LESSONS_DIR)) {
        if (!file.endsWith('.mdx')) continue
        const key = file.slice(0, 2)
        const src = readFileSync(join(LESSONS_DIR, file), 'utf8')
        this.addWatchFile(join(LESSONS_DIR, file))
        out[key] = indexLesson(src)
      }
      return `export default ${JSON.stringify(out)}`
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.mdx')) return
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) ctx.server.moduleGraph.invalidateModule(mod)
    },
  }
}
