// Controlla la versione «spiegata semplice» delle lezioni e la pagina dei prerequisiti:  npm run check:easy [-- 03 05 …]
//
// Versione semplice italiana (`lessons-easy/NN-….mdx`) contro la lezione originale (`lessons/`):
// ERRORI
// - il file non si chiama come l'originale, o gli import sono diversi
// - i titoli (##, ###, ####) non sono gli stessi, nello stesso ordine (gli id delle sezioni devono coincidere)
// - manca una figura, una <Formula>, un widget, una domanda d'esame o un riquadro dell'originale
// - un <T id> non esiste nel glossario; un link a una sezione (#/lezione/NN/…, #/prerequisiti/…) non esiste
// AVVISI (da riguardare a mano)
// - formule dell'originale assenti dalla versione semplice («le formule devono esserci tutte»)
//
// Versione semplice inglese (`lessons-easy-en/`) contro quella italiana, e `extra-en/` contro `extra/`:
// ERRORI: struttura diversa (titoli, separatori, componenti e loro attributi), import diversi
// AVVISI: numero di blocchi diverso in una sezione, formule solo in una delle due, righe forse non tradotte
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import GithubSlugger from 'github-slugger'
import { ROOT } from './lib/browser.mjs'

const only = process.argv.slice(2).filter((a) => /^\d\d$/.test(a))
const dir = (d) => resolve(ROOT, 'src/content', d)
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
const list = (d) => (existsSync(dir(d)) ? readdirSync(dir(d)).filter((f) => f.endsWith('.mdx')) : [])

const errors = []
const warnings = []

const plain = (t) => t.replace(/\$/g, '').replace(/\*\*?|`/g, '').trim()
const imports = (s) => s.split('\n').filter((l) => l.startsWith('import ')).join('\n')

function headings(src) {
  const slugger = new GithubSlugger()
  const out = []
  let inMath = false
  for (const line of src.split('\n')) {
    if (line.trim() === '$$') inMath = !inMath
    const h = !inMath && /^(#{2,6})\s+(.*)$/.exec(line)
    if (h) out.push({ depth: h[1].length, text: h[2].trim(), slug: slugger.slug(plain(h[2])) })
  }
  return out
}

/** Sequenza degli elementi strutturali di un MDX (come in check-en.mjs). */
function structure(src) {
  const out = []
  let inMath = false
  src.split('\n').forEach((line, i) => {
    if (line.trim() === '$$') inMath = !inMath
    if (inMath || line.startsWith('import ')) return
    const h = /^(#{2,6})\s/.exec(line)
    if (h) out.push({ t: 'h' + h[1].length, line: i + 1 })
    if (/^---\s*$/.test(line)) out.push({ t: '---', line: i + 1 })
    for (const m of line.matchAll(/<([A-Z]\w*)\b/g)) {
      const rest = line.slice(m.index)
      const attrs = []
      for (const a of ['n', 'type', 'id', 'kind', 'f', 'size', 'cols', 'tone', 'variant', 'mode']) {
        const v = new RegExp(`^<${m[1]}\\b[^>]*?\\s${a}=("[^"]*"|\\{[^}]*\\})`).exec(rest)
        if (v) attrs.push(`${a}=${v[1]}`)
      }
      out.push({ t: `<${m[1]}${attrs.length ? ' ' + attrs.join(' ') : ''}>`, line: i + 1 })
    }
  })
  return out
}

function sections(src) {
  const out = [{ title: '(inizio)', blocks: 0 }]
  let blank = true
  let inMath = false
  for (const line of src.split('\n')) {
    if (line.startsWith('import ')) continue
    if (line.trim() === '$$') inMath = !inMath
    const h = !inMath && /^#{2,6}\s+(.*)$/.exec(line)
    if (h) {
      out.push({ title: h[1], blocks: 0 })
      blank = true
      continue
    }
    if (line.trim() === '') blank = true
    else if (blank) {
      out[out.length - 1].blocks++
      blank = false
    }
  }
  return out
}

function maths(src) {
  const out = []
  const push = (m) =>
    out.push(
      m
        .replace(/\\text(?:rm|it|bf)?\{[^}]*\}/g, '\\text{}')
        .replace(/\{,\}/g, '.')
        .replace(/\\[,;:! ]/g, '')
        .replace(/\s+/g, ''),
    )
  const rest = src.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => (push(m), ' '))
  for (const m of rest.matchAll(/\$([^$\n]+)\$/g)) push(m[1])
  return out
}

/** Elementi di `a` che mancano in `b` (con molteplicità). */
function missing(a, b) {
  const count = new Map()
  for (const x of b) count.set(x, (count.get(x) ?? 0) + 1)
  const out = []
  for (const x of a) {
    const n = count.get(x) ?? 0
    if (n > 0) count.set(x, n - 1)
    else out.push(x)
  }
  return out
}

const tags = (src, re) => [...src.matchAll(re)].map((m) => m[1])
const STOP =
  /(?<![\p{L}])(il|della|delle|degli|dello|che|è|sono|nel|nella|nelle|più|perché|cioè|anche|questo|questa|quando|allora|gli|una|dei|del|alla|sulla|sul|viene|ogni|tra|ma|se|dal|dalla|con|per|non|si|ha|può|cui|qui|così|già|però|ciò)(?![\p{L}])/giu
const italianScore = (s) => new Set([...s.replace(/\$[^$]*\$/g, ' ').matchAll(STOP)].map((m) => m[1].toLowerCase())).size

// ---------------------------------------------------------------- slug a cui si può puntare

const glossaryIds = new Set([...read(resolve(ROOT, 'src/content/glossary.ts')).matchAll(/id: '([^']+)'/g)].map((m) => m[1]))
const slugsOf = {}
const figsOf = {}
for (const f of list('lessons')) {
  const src = read(resolve(dir('lessons'), f))
  slugsOf[f.slice(0, 2)] = new Set(headings(src).map((h) => h.slug))
  figsOf[f.slice(0, 2)] = new Set(tags(src, /<Figure\b[^>]*\bn="([^"]+)"/g).map((n) => 'fig-' + n.replace('.', '-')))
}
const prereqFile = resolve(dir('extra'), 'prerequisiti.mdx')
const prereqSlugs = existsSync(prereqFile) ? new Set(headings(read(prereqFile)).map((h) => h.slug)) : new Set()

function checkLinks(src, tag) {
  for (const m of src.matchAll(/\(#\/(lezione\/(\d\d)|prerequisiti)(?:\/([^)\s]+))?\)/g)) {
    const section = m[3] ? decodeURIComponent(m[3]) : undefined
    if (m[2]) {
      if (!slugsOf[m[2]]) errors.push(`${tag}: link alla lezione ${m[2]}, che non esiste`)
      else if (section && !slugsOf[m[2]].has(section) && !figsOf[m[2]].has(section)) errors.push(`${tag}: link a una sezione che non esiste → ${m[0]}`)
    } else if (section && !prereqSlugs.has(section)) errors.push(`${tag}: link a una sezione dei prerequisiti che non esiste → ${m[0]}`)
  }
}

/** Confronto stretto tra un MDX italiano e la sua traduzione (stessa struttura, stesse formule). */
function checkTranslation(it, en, tag) {
  if (imports(it) !== imports(en)) errors.push(`${tag}: gli import devono essere identici a quelli dell'italiano`)
  const a = structure(it)
  const b = structure(en)
  const k = a.findIndex((x, i) => x.t !== b[i]?.t)
  if (k >= 0 || a.length !== b.length) {
    const i = k >= 0 ? k : Math.min(a.length, b.length)
    errors.push(
      `${tag}: struttura diversa dall'italiano al ${i + 1}º elemento — italiano riga ${a[i]?.line ?? 'fine'}: ${a[i]?.t ?? '(niente)'} · inglese riga ${b[i]?.line ?? 'fine'}: ${b[i]?.t ?? '(niente)'}`,
    )
  } else {
    const sa = sections(it)
    const sb = sections(en)
    sa.forEach((s, i) => {
      if (sb[i] && s.blocks !== sb[i].blocks) warnings.push(`${tag}: sezione «${sb[i].title}» — ${sb[i].blocks} blocchi, ${s.blocks} nell'italiano («${s.title}»)`)
    })
  }
  const ma = maths(it)
  const mb = maths(en)
  for (const m of missing(ma, mb).slice(0, 25)) warnings.push(`${tag}: formula solo nell'italiano → ${m.slice(0, 110)}`)
  for (const m of missing(mb, ma).slice(0, 25)) warnings.push(`${tag}: formula solo nell'inglese → ${m.slice(0, 110)}`)
  en.split('\n').forEach((line, i) => {
    if (line.startsWith('import ')) return
    if (italianScore(line) >= 3) warnings.push(`${tag}:${i + 1}: riga forse non tradotta → ${line.trim().slice(0, 90)}`)
    if (/\d\{,\}\d/.test(line)) warnings.push(`${tag}:${i + 1}: virgola decimale (in inglese si usa il punto) → ${line.trim().slice(0, 90)}`)
    if (/[«»]/.test(line)) warnings.push(`${tag}:${i + 1}: virgolette «» (in inglese “ ”) → ${line.trim().slice(0, 90)}`)
  })
}

// ---------------------------------------------------------------- lezioni semplici

const originals = list('lessons')
const easyEn = list('lessons-easy-en')
let done = 0
for (const file of list('lessons-easy')) {
  const id = file.slice(0, 2)
  if (only.length && !only.includes(id)) continue
  const tag = `lessons-easy/${file}`
  if (!originals.includes(file)) {
    errors.push(`${tag}: il file deve chiamarsi come la lezione originale (${originals.find((f) => f.startsWith(id + '-')) ?? 'nessuna lezione ' + id})`)
    continue
  }
  done++
  const orig = read(resolve(dir('lessons'), file))
  const easy = read(resolve(dir('lessons-easy'), file))

  if (imports(orig) !== imports(easy)) errors.push(`${tag}: gli import devono essere identici a quelli della lezione originale`)

  const ho = headings(orig)
  const he = headings(easy)
  const k = ho.findIndex((h, i) => h.text !== he[i]?.text || h.depth !== he[i]?.depth)
  if (k >= 0 || ho.length !== he.length) {
    const i = k >= 0 ? k : Math.min(ho.length, he.length)
    errors.push(`${tag}: titoli diversi dall'originale al ${i + 1}º — originale «${ho[i]?.text ?? '(niente)'}» · semplice «${he[i]?.text ?? '(niente)'}»`)
  }

  // tutto ciò che c'è nell'originale deve esserci (in più si può aggiungere)
  const kinds = [
    ['figura', /<Figure\b[^>]*\bn="([^"]+)"/g],
    ['formula', /<Formula\b[^>]*\bf=\{([^}]+)\}/g],
    ['domanda', /<Q\b[^>]*\bq="([^"]+)"/g],
    ['riquadro', /<Callout\b[^>]*\btype="([^"]+)"/g],
    ['approfondimento', /<Deep\b[^>]*\bkind="([^"]+)"/g],
    ['didascalia', /<Caption>([\s\S]*?)<\/Caption>/g],
  ]
  for (const [name, re] of kinds) for (const x of missing(tags(orig, re), tags(easy, re))) errors.push(`${tag}: manca ${name} dell'originale → ${x.slice(0, 80)}`)
  // i widget: ogni componente dentro una figura dell'originale
  const widgets = (s) => [...s.matchAll(/<Figure\b[\s\S]*?<\/Figure>/g)].flatMap((m) => tags(m[0], /<([A-Z]\w*)\b[^>]*\/>/g))
  for (const x of missing(widgets(orig), widgets(easy))) errors.push(`${tag}: manca il widget <${x} /> dell'originale`)
  for (const x of missing(tags(orig, /<(Timeline|Steps|Cards|Exam)\b/g), tags(easy, /<(Timeline|Steps|Cards|Exam)\b/g))) errors.push(`${tag}: manca il blocco <${x}> dell'originale`)
  for (const [name, re] of [['Event', /<Event\b/g], ['Step', /<Step\b/g], ['Card', /<Card\b/g]]) {
    const a = (orig.match(re) ?? []).length
    const b = (easy.match(re) ?? []).length
    if (b < a) errors.push(`${tag}: ${b} <${name}>, ${a} nell'originale`)
  }
  for (const x of tags(easy, /<T id="([^"]+)"/g)) if (!glossaryIds.has(x)) errors.push(`${tag}: termine <T id="${x}"> assente dal glossario`)
  for (const x of missing([...new Set(tags(orig, /<T id="([^"]+)"/g))], tags(easy, /<T id="([^"]+)"/g))) warnings.push(`${tag}: il termine <T id="${x}"> dell'originale non è marcato`)
  checkLinks(easy, tag)

  // righe delle tabelle (dati): devono esserci tutte
  const rows = (s) => s.split('\n').filter((l) => /^\|/.test(l) && !/^\|[-| ]+\|$/.test(l)).map((l) => (l.match(/-?\d[\d.,]*/g) ?? []).join(' ')).filter(Boolean)
  for (const x of missing(rows(orig), rows(easy))) warnings.push(`${tag}: riga di tabella con i numeri «${x.slice(0, 60)}» non trovata`)

  for (const m of [...new Set(missing(maths(orig), maths(easy)))].slice(0, 40)) warnings.push(`${tag}: formula dell'originale non trovata → ${m.slice(0, 110)}`)

  // traduzione inglese
  if (!easyEn.includes(file)) {
    errors.push(`lessons-easy-en/${file}: traduzione mancante`)
    continue
  }
  const en = read(resolve(dir('lessons-easy-en'), file))
  checkTranslation(easy, en, `lessons-easy-en/${file}`)
  checkLinks(en, `lessons-easy-en/${file}`)
}
for (const file of easyEn) if (!list('lessons-easy').includes(file)) errors.push(`lessons-easy-en/${file}: non esiste la versione semplice italiana con lo stesso nome`)

// ---------------------------------------------------------------- pagine extra (prerequisiti)

if (!only.length) {
  const extraEn = list('extra-en')
  for (const file of list('extra')) {
    const it = read(resolve(dir('extra'), file))
    checkLinks(it, `extra/${file}`)
    if (!extraEn.includes(file)) {
      errors.push(`extra-en/${file}: traduzione mancante`)
      continue
    }
    const en = read(resolve(dir('extra-en'), file))
    checkTranslation(it, en, `extra-en/${file}`)
    checkLinks(en, `extra-en/${file}`)
  }
}

if (warnings.length) console.log('AVVISI (da riguardare a mano):\n' + warnings.map((w) => '  - ' + w).join('\n'))
if (errors.length) {
  console.log('ERRORI:\n' + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`Versione semplice ok: ${done} lezioni controllate${warnings.length ? ` (${warnings.length} avvisi)` : ''}.`)
