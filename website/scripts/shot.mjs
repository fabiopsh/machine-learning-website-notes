// Screenshot di una pagina o di un elemento, salvati in website/.shots/
//
//   npm run shot -- lezione/03 nome                        viewport intera
//   npm run shot -- lezione/03 fig35 --sel "#fig-3-5"      solo la figura
//   npm run shot -- lezione/03 pag --pages 6               6 schermate scorrendo la pagina
//   npm run shot -- home nome                              la home (anche "glossario", "lezione/03/sezione")
//   opzioni: --w 1440 --h 900 --dpr 1 --theme light|dark --style classic|glass --lang it|en --base URL --wait ms
//            --scrollbars (mostra le barre di scorrimento, nascoste per default)
import { baseUrl, newPage, openBrowser, opt, shotPath, wait } from './lib/browser.mjs'

const args = process.argv.slice(2)
const name = args[1] ?? 'shot'
const url = baseUrl(args) + normRoute(args[0] ?? 'home')

/** Accetta "lezione/03", "#/lezione/03" e anche la versione storpiata da Git Bash ("#C:/Program Files/Git/lezione/03"). */
function normRoute(r) {
  let s = r.replace(/^#?[A-Za-z]:[\/].*?[\/]Git[\/]/, '').replace(/^#?\/?/, '')
  if (s === 'home') s = ''
  return '#/' + s
}

const browser = await openBrowser({ scrollbars: args.includes('--scrollbars') })
const { page, errors } = await newPage(browser, {
  width: +opt(args, 'w', 1440),
  height: +opt(args, 'h', 900),
  dpr: +opt(args, 'dpr', 1),
  theme: opt(args, 'theme', 'light'),
  style: opt(args, 'style', 'classic'),
  lang: opt(args, 'lang', 'it'),
})
await page.goto(url, { waitUntil: 'networkidle0' })
await wait(+opt(args, 'wait', 1200))

const sel = opt(args, 'sel', null)
const pages = +opt(args, 'pages', 0)
if (sel) {
  const el = await page.$(sel)
  if (!el) throw new Error('Elemento non trovato: ' + sel)
  await el.evaluate((e) => e.scrollIntoView({ block: 'start' }))
  await wait(400)
  await el.screenshot({ path: shotPath(name) })
  console.log('salvato', shotPath(name))
} else if (pages) {
  const H = +opt(args, 'h', 900)
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  let k = 0
  for (let y = 0; y < total && k < pages; y += H - 60, k++) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await wait(350)
    await page.screenshot({ path: shotPath(`${name}-${String(k).padStart(2, '0')}`) })
  }
  console.log(`salvate ${k} schermate (${name}-NN.png), altezza pagina ${total}px`)
} else {
  await page.screenshot({ path: shotPath(name) })
  console.log('salvato', shotPath(name))
}
if (errors.length) console.log(errors.join('\n'))
await browser.close()
