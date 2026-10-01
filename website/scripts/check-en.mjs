// Confronta la traduzione inglese di una lezione con l'originale italiano:  npm run check:en [-- 05 06 …]
//
// ERRORI (la traduzione non è allineata all'originale):
// - manca `src/content/lessons-en/NN-….mdx` (stesso nome di file dell'italiano) o gli import sono diversi
// - la sequenza di titoli, separatori e componenti (<Figure>, <Callout>, <T>, <Formula>, widget…) non coincide,
//   così come i valori di n, type, id, kind, f
// - una voce del glossario della lezione non ha la traduzione in `src/content/glossary-en/lNN.ts`
// AVVISI (da riguardare a mano, uno per uno):
// - una sezione ha un numero diverso di blocchi (paragrafi, elenchi, riquadri): forse manca qualcosa
// - formule presenti solo in una delle due versioni (a parte \text{…} e il separatore decimale)
// - righe che sembrano ancora in italiano nell'MDX inglese, e virgole decimali rimaste
// - testi italiani fuori da `tx(…)` nei widget e nelle formule della lezione
// - `section` di una voce inglese del glossario che non è un titolo della lezione inglese
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from './lib/browser.mjs'

const only = process.argv.slice(2).filter((a) => /^\d\d$/.test(a))
const IT = resolve(ROOT, 'src/content/lessons')
const EN = resolve(ROOT, 'src/content/lessons-en')
const GLOSS_EN = resolve(ROOT, 'src/content/glossary-en')

const errors = []
const warnings = []
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')

// ---------------------------------------------------------------- struttura

/** Sequenza degli elementi strutturali di un MDX: titoli, separatori, tag dei componenti con gli attributi non testuali. */
function structure(src) {
  const out = []
  const lines = src.split('\n')
  let inMath = false
  lines.forEach((line, i) => {
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

/** Numero di blocchi (separati da righe vuote) di ogni sezione, nell'ordine dei titoli. */
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

// ---------------------------------------------------------------- formule

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

function diffCounts(a, b) {
  const count = new Map()
  for (const x of a) count.set(x, (count.get(x) ?? 0) + 1)
  for (const x of b) count.set(x, (count.get(x) ?? 0) - 1)
  return { onlyA: [...count].filter(([, n]) => n > 0).map(([k]) => k), onlyB: [...count].filter(([, n]) => n < 0).map(([k]) => k) }
}

// ---------------------------------------------------------------- italiano rimasto

const STOP =
  /(?<![\p{L}])(il|della|delle|degli|dello|che|è|sono|nel|nella|nelle|più|perché|cioè|anche|questo|questa|quando|allora|gli|una|dei|del|alla|sulla|sul|viene|ogni|tra|ma|se|dal|dalla|con|per|non|si|ha|può|cui|qui|così|già|però|ciò)(?![\p{L}])/giu
const italianScore = (s) => new Set([...s.replace(/\$[^$]*\$/g, ' ').matchAll(STOP)].map((m) => m[1].toLowerCase())).size

/** Toglie commenti e chiamate `tx(…)` (parentesi bilanciate, stringhe rispettate) mantenendo i numeri di riga. */
function outsideTx(src) {
  const keepLines = (s) => s.replace(/[^\n]/g, ' ')
  let s = src.replace(/\/\*[\s\S]*?\*\//g, keepLines).replace(/(^|[^:\\])\/\/[^\n]*/g, (m, p) => p + keepLines(m.slice(p.length)))
  let out = ''
  let i = 0
  while (i < s.length) {
    const at = s.indexOf('tx(', i)
    if (at < 0 || (at > 0 && /[\w.]/.test(s[at - 1]))) {
      if (at < 0) {
        out += s.slice(i)
        break
      }
      out += s.slice(i, at + 3)
      i = at + 3
      continue
    }
    out += s.slice(i, at)
    let depth = 0
    let j = at + 2
    let quote = null
    for (; j < s.length; j++) {
      const c = s[j]
      if (quote) {
        if (c === '\\') j++
        else if (c === quote) quote = null
      } else if (c === "'" || c === '"' || c === '`') quote = c
      else if (c === '(') depth++
      else if (c === ')' && --depth === 0) break
    }
    out += keepLines(s.slice(at, j + 1))
    i = j + 1
  }
  return out
}

function leftoverItalian(file, rel) {
  const lines = outsideTx(read(file)).split('\n')
  lines.forEach((line, i) => {
    // solo testo visibile: stringhe e testo JSX
    const texts = [...line.matchAll(/'([^'\n]{3,})'|"([^"\n]{3,})"|`([^`\n]{3,})`|>([^<>{}\n]{3,})</g)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4])
    for (const t of texts) {
      if (/^[\w./-]+$/.test(t) || /^(var\(|M |[a-z-]+: )/.test(t)) continue
      if (/[àèéìòù]/i.test(t.replace(/\$[^$]*\$/g, '')) || italianScore(t) >= 2) {
        warnings.push(`${rel}:${i + 1}: testo forse non tradotto (fuori da tx) → ${t.trim().slice(0, 90)}`)
        break
      }
    }
  })
}

// ---------------------------------------------------------------- controllo

const glossarySrc = read(resolve(ROOT, 'src/content/glossary.ts'))
const glossaryIds = {}
for (const m of glossarySrc.matchAll(/id: '([^']+)',[\s\S]*?lesson: '(\d\d)'/g)) (glossaryIds[m[2]] ??= []).push(m[1])
const norm = (s) => s.replace(/\*\*?|`|\$/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

const enFiles = existsSync(EN) ? readdirSync(EN) : []
let done = 0
for (const file of readdirSync(IT).filter((f) => f.endsWith('.mdx'))) {
  const id = file.slice(0, 2)
  if (only.length && !only.includes(id)) continue
  if (!enFiles.includes(file)) {
    const other = enFiles.find((f) => f.startsWith(id + '-'))
    errors.push(other ? `lessons-en/${other}: il file deve chiamarsi come l'originale (${file})` : `lessons-en/${file}: traduzione mancante`)
    continue
  }
  done++
  const it = read(resolve(IT, file))
  const en = read(resolve(EN, file))
  const tag = `lessons-en/${file}`

  const imports = (s) => s.split('\n').filter((l) => l.startsWith('import ')).join('\n')
  if (imports(it) !== imports(en)) errors.push(`${tag}: gli import devono essere identici a quelli dell'originale`)

  const a = structure(it)
  const b = structure(en)
  const k = a.findIndex((x, i) => x.t !== b[i]?.t)
  if (k >= 0 || a.length !== b.length) {
    const i = k >= 0 ? k : Math.min(a.length, b.length)
    errors.push(
      `${tag}: struttura diversa dall'originale al ${i + 1}º elemento — italiano riga ${a[i]?.line ?? 'fine'}: ${a[i]?.t ?? '(niente)'} · inglese riga ${b[i]?.line ?? 'fine'}: ${b[i]?.t ?? '(niente)'}`,
    )
  } else {
    const sa = sections(it)
    const sb = sections(en)
    sa.forEach((s, i) => {
      if (sb[i] && s.blocks !== sb[i].blocks) warnings.push(`${tag}: sezione «${sb[i].title}» — ${sb[i].blocks} blocchi, ${s.blocks} nell'originale («${s.title}»)`)
    })
  }

  const d = diffCounts(maths(it), maths(en))
  for (const m of d.onlyA.slice(0, 25)) warnings.push(`${tag}: formula solo nell'originale → ${m.slice(0, 110)}`)
  for (const m of d.onlyB.slice(0, 25)) warnings.push(`${tag}: formula solo nella traduzione → ${m.slice(0, 110)}`)

  en.split('\n').forEach((line, i) => {
    if (line.startsWith('import ')) return
    if (italianScore(line) >= 3) warnings.push(`${tag}:${i + 1}: riga forse non tradotta → ${line.trim().slice(0, 90)}`)
    if (/\d\{,\}\d/.test(line)) warnings.push(`${tag}:${i + 1}: virgola decimale (in inglese si usa il punto) → ${line.trim().slice(0, 90)}`)
    if (/[«»]/.test(line)) warnings.push(`${tag}:${i + 1}: virgolette «» (in inglese “ ”) → ${line.trim().slice(0, 90)}`)
  })

  // glossario
  const gFile = resolve(GLOSS_EN, `l${id}.ts`)
  const ids = glossaryIds[id] ?? []
  if (ids.length) {
    if (!existsSync(gFile)) errors.push(`glossary-en/l${id}.ts: file mancante (${ids.length} voci da tradurre)`)
    else {
      const g = read(gFile)
      const keys = new Set([...g.matchAll(/^ {2}'?([a-z0-9-]+)'?:\s*\{/gm)].map((m) => m[1]))
      for (const x of ids) if (!keys.has(x)) errors.push(`glossary-en/l${id}.ts: manca la voce '${x}'`)
      for (const x of keys) if (!ids.includes(x)) errors.push(`glossary-en/l${id}.ts: la voce '${x}' non è una voce della lezione ${id} in glossary.ts`)
      const heads = new Set(sections(en).map((s) => norm(s.title)))
      for (const m of g.matchAll(/section:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`([^`]*)`)/g)) {
        const s = (m[1] ?? m[2] ?? m[3]).replace(/\\\\/g, '\\').replace(/\\'/g, "'")
        if (!heads.has(norm(s))) warnings.push(`glossary-en/l${id}.ts: section «${s}» non è un titolo della lezione inglese`)
      }
      if (italianScore(g.replace(/^.*\/\/.*$/gm, '')) >= 12) warnings.push(`glossary-en/l${id}.ts: sembra contenere testo italiano`)
    }
  }

  // widget e formule della lezione: testi italiani fuori da tx()
  const wDir = resolve(ROOT, `src/widgets/l${id}`)
  for (const f of existsSync(wDir) ? readdirSync(wDir) : []) if (/\.tsx?$/.test(f)) leftoverItalian(resolve(wDir, f), `widgets/l${id}/${f}`)
  const fFile = resolve(ROOT, `src/content/formulas/l${id}.ts`)
  if (existsSync(fFile)) leftoverItalian(fFile, `formulas/l${id}.ts`)
}

if (warnings.length) console.log('AVVISI (da riguardare a mano):\n' + warnings.map((w) => '  - ' + w).join('\n'))
if (errors.length) {
  console.log('ERRORI:\n' + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`Traduzione inglese ok: ${done} lezioni controllate${warnings.length ? ` (${warnings.length} avvisi)` : ''}.`)
