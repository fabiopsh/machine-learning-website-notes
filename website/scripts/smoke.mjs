// Test di fumo di tutto il sito (serve il sito avviato: npm run dev, oppure --base <url pubblicato>).
//
//   npm run smoke                      contro http://localhost:5173/
//   npm run smoke -- --base https://fabiopsh.github.io/machine-learning-website-notes/
//   npm run smoke -- --only 05         solo una lezione
//
// Controlla: route principali, ogni lezione, ogni link a sezione (#/lezione/NN/slug),
// che ogni <Figure> sia presente, che KaTeX non segnali errori, che trascinare/cliccare
// nelle figure non generi errori in console.
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import GithubSlugger from 'github-slugger'
import { ROOT, baseUrl, newPage, openBrowser, opt, wait } from './lib/browser.mjs'

const args = process.argv.slice(2)
const base = baseUrl(args)
const only = opt(args, 'only', null)
const dir = resolve(ROOT, 'src/content/lessons')
const plain = (t) => t.replace(/\$/g, '').replace(/\*\*?|`/g, '').trim()

const lessons = readdirSync(dir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => {
    const src = readFileSync(resolve(dir, f), 'utf8')
    const slugger = new GithubSlugger()
    const slugs = []
    let fence = false
    for (const line of src.split(/\r?\n/)) {
      if (line.startsWith('```')) fence = !fence
      const m = !fence && /^(#{2,6})\s+(.*)$/.exec(line)
      if (m) {
        const s = slugger.slug(plain(m[2]))
        if (m[1].length <= 3) slugs.push(s)
      }
    }
    const figures = [...src.matchAll(/<Figure\b[^>]*\bn="([^"]+)"/g)].map((m) => m[1])
    return { id: f.slice(0, 2), slugs, figures }
  })
  .filter((l) => !only || l.id === only)

const problems = []
const browser = await openBrowser()
const { page, errors } = await newPage(browser)
const go = async (route, ms = 900) => {
  await page.goto(base + route, { waitUntil: 'networkidle0' })
  await wait(ms)
}
const flush = (where) => {
  while (errors.length) problems.push(`${where}: ${errors.shift()}`)
}

// route generali
for (const r of ['#/', '#/glossario', '#/glossario/overfitting', '#/rotta-che-non-esiste', '#/lezione/99']) {
  await go(r)
  const ok = await page.evaluate(() => !!document.querySelector('main')?.textContent?.trim())
  if (!ok) problems.push(`${r}: pagina vuota`)
  flush(r)
  console.log('ok', r)
}

for (const l of lessons) {
  const route = `#/lezione/${l.id}`
  await go(route, 1500)
  // scorre tutta la pagina per montare ogni figura
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await wait(30)
  }
  const found = await page.$$eval('.fig', (els) => els.map((e) => e.id))
  for (const n of l.figures) if (!found.includes('fig-' + n.replace('.', '-'))) problems.push(`${route}: manca la figura ${n}`)
  const katexErr = await page.$$eval('.katex-error', (els) => els.map((e) => e.getAttribute('title') || e.textContent))
  for (const k of katexErr) problems.push(`${route}: errore KaTeX → ${k}`)

  // interazioni: una maniglia trascinata e un controllo cliccato per figura
  for (const id of found) {
    const h = await page.$(`#${id} .handle`)
    if (h) {
      await h.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      const bb = await h.boundingBox()
      if (bb) {
        await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2)
        await page.mouse.down()
        await page.mouse.move(bb.x + bb.width / 2 + 30, bb.y + bb.height / 2 - 20, { steps: 6 })
        await page.mouse.up()
      }
    }
    const b = await page.$(`#${id} .seg__track button:not(.is-on)`)
    if (b) {
      await b.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await b.click()
      await wait(120)
    }
  }
  flush(route)

  // ogni sezione deve essere raggiungibile con un link diretto
  for (const s of l.slugs) {
    await go(`${route}/${encodeURIComponent(s)}`, 700)
    const top = await page.evaluate((id) => document.getElementById(id)?.getBoundingClientRect().top ?? null, s)
    if (top === null) problems.push(`${route}/${s}: sezione inesistente`)
    else if (top < -5 || top > 260) problems.push(`${route}/${s}: la pagina non scorre alla sezione (top=${Math.round(top)})`)
  }
  flush(route)
  console.log(`ok ${route}: ${found.length} figure, ${l.slugs.length} sezioni`)
}

await browser.close()
if (problems.length) {
  console.log('\nPROBLEMI:\n' + problems.join('\n'))
  process.exit(1)
}
console.log('\nTutto a posto.')
