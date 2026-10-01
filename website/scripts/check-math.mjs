// Confronta le formule degli appunti con quelle del sito:  node scripts/check-math.mjs 15 16 …  (senza argomenti: tutte)
//
// Per ogni lezione estrae dagli appunti le formule in display ($$…$$) e inline ($…$) e controlla che ciascuna
// compaia, a meno di spazi, graffe e spaziature TeX, nell'MDX della lezione o nel suo file di formule
// (dove le parti spiegabili sono marcate con \part{chiave}{…}). Elenca quelle non trovate alla lettera:
// vanno riguardate a mano (di solito sono solo spezzate su più righe o riscritte a parole).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from './lib/browser.mjs'

const NOTES = resolve(ROOT, '../notes/Appunti')
const LESSONS = resolve(ROOT, 'src/content/lessons')
const FORMULAS = resolve(ROOT, 'src/content/formulas')

const norm = (s) =>
  s
    .replace(/\\part\{[\w-]+\}/g, '')
    .replace(/\\(,|;|!|quad|qquad)/g, '')
    .replace(/[\s{}]/g, '')
    .replace(/[.,]+$/, '')

const ids = process.argv.slice(2)
const files = readdirSync(LESSONS).filter((f) => f.endsWith('.mdx') && (!ids.length || ids.includes(f.slice(0, 2))))
let total = 0
for (const file of files) {
  const id = file.slice(0, 2)
  const noteFile = readdirSync(NOTES).find((f) => f.startsWith(id + ' - ') && f.endsWith('.md'))
  if (!noteFile) continue
  const notes = readFileSync(resolve(NOTES, noteFile), 'utf8').replace(/^> ?/gm, '')
  const formulaFile = resolve(FORMULAS, `l${id}.ts`)
  const hay = norm(readFileSync(resolve(LESSONS, file), 'utf8')) + norm(existsSync(formulaFile) ? readFileSync(formulaFile, 'utf8') : '')
  const display = [...notes.matchAll(/\$\$([\s\S]*?)\$\$/g)].map((m) => m[1])
  const inline = [...notes.replace(/\$\$[\s\S]*?\$\$/g, '').matchAll(/\$([^$\n]+)\$/g)].map((m) => m[1])
  const missing = (list) => [...new Set(list)].filter((t) => !hay.includes(norm(t)))
  const md = missing(display)
  const mi = missing(inline)
  total += md.length + mi.length
  console.log(`${id}: ${display.length} formule in display (${md.length} da riguardare), ${inline.length} inline (${mi.length} da riguardare)`)
  for (const t of md) console.log('   [display] ' + t.trim().replace(/\s+/g, ' '))
  for (const t of mi) console.log('   [inline]  ' + t)
}
console.log(total ? `\n${total} formule da riguardare a mano.` : '\nTutte le formule degli appunti compaiono nel sito.')
