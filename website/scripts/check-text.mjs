// Controlla che ogni frase degli appunti compaia nel sito:  node scripts/check-text.mjs 15 16 …  (senza argomenti: tutte)
//
// Gli appunti vengono divisi in righe e frasi; ogni frase (senza formule, markdown e punteggiatura) deve comparire
// nel testo dell'MDX della lezione, del suo file di formule o dei suoi widget. Le formule si controllano a parte
// (check-math.mjs); i testi alternativi delle immagini non si controllano (le immagini sono sostituite da figure).
// Le frasi non trovate alla lettera vanno riguardate a mano: di solito sono state riformulate (didascalie, rimandi
// ad altre lezioni), ma una frase davvero mancante è un errore.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from './lib/browser.mjs'

const NOTES = resolve(ROOT, '../notes/Appunti')
const LESSONS = resolve(ROOT, 'src/content/lessons')

const noMath = (s) => s.replace(/\$\$[\s\S]*?\$\$/g, ' § ').replace(/\$[^$\n]+\$/g, ' § ')
const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9§]+/g, ' ')
    .replace(/(?: ?§ ?)+/g, ' § ')
    .replace(/\s+/g, ' ')
    .trim()

const ids = process.argv.slice(2)
const files = readdirSync(LESSONS).filter((f) => f.endsWith('.mdx') && (!ids.length || ids.includes(f.slice(0, 2))))
let total = 0
for (const file of files) {
  const id = file.slice(0, 2)
  const noteFile = readdirSync(NOTES).find((f) => f.startsWith(id + ' - ') && f.endsWith('.md'))
  if (!noteFile) continue
  let hay = noMath(readFileSync(resolve(LESSONS, file), 'utf8'))
    .replace(/<Formula[^>]*\/>/g, ' § ')
    .replace(/<T id="[^"]*">|<\/T>/g, '') // i termini del glossario non interrompono la frase
    .replace(/\]\(#\/lezione[^)]*\)/g, ' ')
  const formulaFile = resolve(ROOT, `src/content/formulas/l${id}.ts`)
  if (existsSync(formulaFile)) hay += ' ' + readFileSync(formulaFile, 'utf8')
  const wdir = resolve(ROOT, `src/widgets/l${id}`)
  if (existsSync(wdir)) for (const f of readdirSync(wdir)) hay += ' ' + readFileSync(resolve(wdir, f), 'utf8')
  hay = ' ' + words(hay) + ' '
  const text = noMath(readFileSync(resolve(NOTES, noteFile), 'utf8').replace(/^> ?/gm, ''))
  const missing = []
  for (const raw of text.split(/\r?\n/).slice(3)) {
    if (/^\s*!\[/.test(raw) || /^\s*\|?\s*-{3,}/.test(raw)) continue
    const line = raw
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[\[[^\]]*\]\]/g, ' ')
      .replace(/^\s*(?:[-*]|\d+\.)\s+/, '')
      .replace(/^#+\s+/, '')
      .replace(/^\[!\w+\]\s*/, '')
    // si spezza a fine frase, ai due punti, alle parentesi, alle barre delle tabelle e alle formule
    for (const piece of line.split(/(?<=[.;:!?])\s+|\s+—\s+|[()|]|§/)) {
      const t = words(piece)
      if (t.split(' ').length < 4) continue
      if (!hay.includes(' ' + t + ' ')) missing.push(piece.trim())
    }
  }
  total += missing.length
  console.log(`${id}: ${missing.length} frasi da riguardare`)
  for (const m of missing) console.log('   · ' + m.slice(0, 240))
}
console.log(total ? `\n${total} frasi da riguardare a mano.` : '\nTutte le frasi degli appunti compaiono nel sito.')
