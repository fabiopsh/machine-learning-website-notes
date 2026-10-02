import GithubSlugger from 'github-slugger'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Espone `virtual:lesson-index`: per ogni lezione MDX, in ogni lingua, l'elenco dei titoli
 * (con gli stessi slug generati da rehype-slug), le figure e il numero di parole.
 * Serve alla ricerca globale e alla home senza caricare le lezioni intere.
 *
 * Le lezioni in inglese (`lessons-en/`) usano **gli stessi slug** di quelle in italiano, presi in ordine:
 * così i link alle sezioni, il glossario e gli indirizzi condivisi valgono in entrambe le lingue.
 *
 * Lo stesso vale per la versione «spiegata semplice» (`lessons-easy/`, `lessons-easy-en/`), che ha gli stessi
 * titoli della lezione originale, e per le pagine fuori dalle lezioni (`extra/`, `extra-en/`: i prerequisiti),
 * indicizzate con il nome del file come chiave.
 */

const VIRTUAL_ID = 'virtual:lesson-index'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const LESSONS_DIR = resolve(import.meta.dirname, '../src/content/lessons')
const LESSONS_EN_DIR = resolve(import.meta.dirname, '../src/content/lessons-en')
const EASY_DIR = resolve(import.meta.dirname, '../src/content/lessons-easy')
const EASY_EN_DIR = resolve(import.meta.dirname, '../src/content/lessons-easy-en')
const EXTRA_DIR = resolve(import.meta.dirname, '../src/content/extra')
const EXTRA_EN_DIR = resolve(import.meta.dirname, '../src/content/extra-en')

type Heading = { depth: number; text: string; slug: string }
type FigureRef = { n: string; title: string }
type LessonIndexEntry = { headings: Heading[]; figures: FigureRef[]; words: number }

function plainHeading(raw: string): string {
  return raw
    .replace(/\$/g, '')
    .replace(/\*\*?|`/g, '')
    .trim()
}

/** Tutti i titoli (## … ######) di un MDX, in ordine, con lo slug che gli assegna rehype-slug. */
export function headingsOf(source: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let inFence = false
  let inMath = false
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith('```')) inFence = !inFence
    if (line.trim() === '$$') inMath = !inMath
    if (inFence || inMath) continue
    const h = /^(#{2,6})\s+(.*)$/.exec(line)
    if (h) headings.push({ depth: h[1].length, text: h[2].replace(/\*\*?/g, '').trim(), slug: slugger.slug(plainHeading(h[2])) })
  }
  return headings
}

function italianSource(id: string): string | undefined {
  const file = readdirSync(LESSONS_DIR).find((f) => f.startsWith(id + '-') && f.endsWith('.mdx'))
  return file ? readFileSync(join(LESSONS_DIR, file), 'utf8') : undefined
}

/** Slug dei titoli della lezione italiana `id`, in ordine: sono gli id dei titoli anche in inglese. */
export function italianSlugs(id: string): string[] {
  const src = italianSource(id)
  return src ? headingsOf(src).map((h) => h.slug) : []
}

/** Slug dei titoli della pagina italiana `extra/<name>.mdx`, in ordine. */
function extraSlugs(name: string): string[] {
  const file = join(EXTRA_DIR, name + '.mdx')
  return existsSync(file) ? headingsOf(readFileSync(file, 'utf8')).map((h) => h.slug) : []
}

function indexLesson(source: string, slugs?: string[]): LessonIndexEntry {
  let all = headingsOf(source)
  if (slugs && slugs.length === all.length) all = all.map((h, i) => ({ ...h, slug: slugs[i] }))
  const headings = all.filter((h) => h.depth <= 3)
  const figures: FigureRef[] = []
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
      const it: Record<string, LessonIndexEntry> = {}
      const en: Record<string, LessonIndexEntry> = {}
      for (const file of readdirSync(LESSONS_DIR)) {
        if (!file.endsWith('.mdx')) continue
        this.addWatchFile(join(LESSONS_DIR, file))
        it[file.slice(0, 2)] = indexLesson(readFileSync(join(LESSONS_DIR, file), 'utf8'))
      }
      for (const file of existsSync(LESSONS_EN_DIR) ? readdirSync(LESSONS_EN_DIR) : []) {
        if (!file.endsWith('.mdx')) continue
        this.addWatchFile(join(LESSONS_EN_DIR, file))
        const key = file.slice(0, 2)
        en[key] = indexLesson(readFileSync(join(LESSONS_EN_DIR, file), 'utf8'), italianSlugs(key))
      }
      // versione «spiegata semplice»: stessi slug della lezione originale
      const easy: Record<string, LessonIndexEntry> = {}
      const easyEn: Record<string, LessonIndexEntry> = {}
      for (const [dir, out] of [[EASY_DIR, easy], [EASY_EN_DIR, easyEn]] as const) {
        for (const file of existsSync(dir) ? readdirSync(dir) : []) {
          if (!file.endsWith('.mdx')) continue
          this.addWatchFile(join(dir, file))
          const key = file.slice(0, 2)
          out[key] = indexLesson(readFileSync(join(dir, file), 'utf8'), italianSlugs(key))
        }
      }
      // pagine fuori dalle lezioni (prerequisiti): la chiave è il nome del file
      for (const [dir, out] of [[EXTRA_DIR, it], [EXTRA_EN_DIR, en]] as const) {
        for (const file of existsSync(dir) ? readdirSync(dir) : []) {
          if (!file.endsWith('.mdx')) continue
          this.addWatchFile(join(dir, file))
          const key = file.slice(0, -4)
          out[key] = indexLesson(readFileSync(join(dir, file), 'utf8'), dir === EXTRA_EN_DIR ? extraSlugs(key) : undefined)
        }
      }
      return `export default ${JSON.stringify({ it, en, easy, easyEn })}`
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.mdx')) return
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) ctx.server.moduleGraph.invalidateModule(mod)
    },
  }
}

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] }

/**
 * Plugin rehype (dopo rehype-slug): nelle lezioni in inglese, nelle versioni semplici e nelle pagine `extra-en/`
 * sostituisce gli id dei titoli con gli slug della pagina italiana originale, nello stesso ordine. Se il numero dei titoli non coincide lascia gli id generati.
 */
export function enHeadingIds() {
  return (tree: HastNode, file: { path?: string }) => {
    const path = String(file.path ?? '')
    const m = /[\\/](lessons-en|lessons-easy|lessons-easy-en)[\\/](\d\d)-[^\\/]*\.mdx$/.exec(path)
    const x = /[\\/]extra-en[\\/]([^\\/]+)\.mdx$/.exec(path)
    if (!m && !x) return
    const where = m ? `${m[1]}/${m[2]}` : `extra-en/${x![1]}`
    const slugs = m ? italianSlugs(m[2]) : extraSlugs(x![1])
    const found: HastNode[] = []
    const walk = (node: HastNode) => {
      if (node.type === 'element' && /^h[2-6]$/.test(node.tagName ?? '')) found.push(node)
      node.children?.forEach(walk)
    }
    walk(tree)
    if (found.length !== slugs.length) {
      console.warn(`[lesson-index] ${where}: ${found.length} titoli, ${slugs.length} nella lezione italiana — id non allineati`)
      return
    }
    found.forEach((node, i) => {
      node.properties = { ...node.properties, id: slugs[i] }
    })
  }
}
