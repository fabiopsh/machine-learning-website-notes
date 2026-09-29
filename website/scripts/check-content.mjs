// Controlli di coerenza sui contenuti (non serve il browser):  npm run check  [-- --only 05]
//
// - ogni titolo (##, ###) degli appunti compare nell'MDX della lezione
// - ogni riquadro degli appunti (> [!tipo]) ha un <Callout> corrispondente (conteggio per tipo)
// - ogni immagine degli appunti è mappata in docs/STATO.md (sostituita da una figura)
// - le domande d'esame degli appunti sono tutte presenti come <Q>
// - le figure sono numerate N.1, N.2, … in ordine e hanno una <Caption>
// - ogni <T id> esiste nel glossario e ogni voce del glossario punta a una sezione esistente
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import GithubSlugger from 'github-slugger'
import { ROOT, opt } from './lib/browser.mjs'

const args = process.argv.slice(2)
const only = opt(args, 'only', null)
const REPO = resolve(ROOT, '..')
const NOTES = resolve(REPO, 'notes/Appunti')
const LESSONS = resolve(ROOT, 'src/content/lessons')
const STATO = resolve(REPO, 'docs/STATO.md')

const norm = (s) =>
  s
    .replace(/[’']/g, "'")
    .replace(/[«»“”"]/g, '"')
    .replace(/\*\*?|`|\$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
const plain = (t) => t.replace(/\$/g, '').replace(/\*\*?|`/g, '').trim()

const errors = []
const warnings = []
const stato = existsSync(STATO) ? readFileSync(STATO, 'utf8') : ''

const glossarySrc = readFileSync(resolve(ROOT, 'src/content/glossary.ts'), 'utf8')
const glossaryIds = new Set([...glossarySrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]))
const headingSlugs = {}

for (const file of readdirSync(LESSONS).filter((f) => f.endsWith('.mdx'))) {
  const id = file.slice(0, 2)
  const mdx = readFileSync(resolve(LESSONS, file), 'utf8')
  const slugger = new GithubSlugger()
  headingSlugs[id] = new Set()
  const mdxHeadings = []
  for (const line of mdx.split(/\r?\n/)) {
    const m = /^(#{2,6})\s+(.*)$/.exec(line)
    if (m) {
      headingSlugs[id].add(slugger.slug(plain(m[2])))
      mdxHeadings.push(norm(m[2]))
    }
  }
  for (const m of mdx.matchAll(/<T id="([^"]+)"/g)) if (!glossaryIds.has(m[1])) errors.push(`${file}: termine <T id="${m[1]}"> assente dal glossario`)

  if (only && id !== only) continue

  // figure
  const figs = [...mdx.matchAll(/<Figure\b[^>]*\bn="([^"]+)"[\s\S]*?<\/Figure>/g)]
  const nLesson = String(+id)
  figs.forEach((m, i) => {
    const want = `${nLesson}.${i + 1}`
    if (m[1] !== want) errors.push(`${file}: la figura ${i + 1}ª è numerata ${m[1]}, atteso ${want}`)
    if (!m[0].includes('<Caption>')) warnings.push(`${file}: la figura ${m[1]} non ha <Caption>`)
  })

  // confronto con gli appunti
  const noteFile = readdirSync(NOTES).find((f) => f.startsWith(id + ' - ') && f.endsWith('.md'))
  if (!noteFile) {
    warnings.push(`${file}: appunti originali non trovati`)
    continue
  }
  const notes = readFileSync(resolve(NOTES, noteFile), 'utf8')
  for (const line of notes.split(/\r?\n/)) {
    const m = /^(#{2,3})\s+(.*)$/.exec(line)
    if (m && !mdxHeadings.includes(norm(m[2]))) warnings.push(`${file}: titolo degli appunti non trovato nell'MDX → "${m[2]}"`)
  }
  const types = {}
  for (const m of notes.matchAll(/^> \[!(\w+)\]\s*(.*)$/gm)) {
    if (/domande d.esame/i.test(m[2])) continue
    types[m[1]] = (types[m[1]] ?? 0) + 1
  }
  for (const [t, n] of Object.entries(types)) {
    const have = [...mdx.matchAll(new RegExp(`<Callout type="${t}"`, 'g'))].length
    if (have < n) warnings.push(`${file}: negli appunti ci sono ${n} riquadri [!${t}], nell'MDX ${have} <Callout type="${t}">`)
  }
  const images = [...notes.matchAll(/^!\[.*\]\(assets\/([^)|]+)/gm)].map((m) => m[1])
  for (const img of images) if (!stato.includes(img)) warnings.push(`${file}: immagine ${img} non mappata in docs/STATO.md`)
  const qBlock = /> \[!question\][^\n]*\n((?:>.*\n?)*)/.exec(notes)
  if (qBlock) {
    const nq = (qBlock[1].match(/^> - /gm) ?? []).length
    const have = (mdx.match(/<Q\b/g) ?? []).length
    if (have < nq) warnings.push(`${file}: ${nq} domande d'esame negli appunti, ${have} <Q> nell'MDX`)
  }
}

for (const m of glossarySrc.matchAll(/id: '([^']+)',[\s\S]*?lesson: '(\d\d)',\s*section: '([^']+)'/g)) {
  const slug = new GithubSlugger().slug(plain(m[3]))
  if (headingSlugs[m[2]] && !headingSlugs[m[2]].has(slug)) errors.push(`glossary.ts: "${m[1]}" punta alla sezione inesistente "${m[3]}" (lezione ${m[2]})`)
}

if (warnings.length) console.log('AVVISI (da verificare a mano):\n' + warnings.map((w) => '  - ' + w).join('\n'))
if (errors.length) {
  console.log('ERRORI:\n' + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`Controllo contenuti ok${warnings.length ? ` (${warnings.length} avvisi)` : ''}.`)
