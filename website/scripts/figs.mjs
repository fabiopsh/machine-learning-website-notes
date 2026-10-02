// Screenshot di tutte le figure di una lezione, in una sola sessione del browser, salvati in website/.shots/
//
//   npm run figs -- 05                       → .shots/05-fig-5-1-it.png, …
//   npm run figs -- 05 --lang en             → .shots/05-fig-5-1-en.png, …
//   npm run figs -- 05 --lang en --w 390     → larghezza da telefono (suffisso -m)
//   opzioni: --theme light|dark --style classic|glass --wait ms (attesa per le figure che si addestrano dal vivo)
//            --only fig-5-3,fig-5-7  --base URL  --mode easy (versione «spiegata semplice»)
//   npm run figs -- prerequisiti             → le figure della pagina dei prerequisiti
import { baseUrl, newPage, openBrowser, opt, shotPath, wait } from './lib/browser.mjs'

const args = process.argv.slice(2)
const id = args[0]
if (!/^(\d\d|prerequisiti)$/.test(id ?? '')) throw new Error('Uso: npm run figs -- NN [--lang en] [--w 390]')
const mode = opt(args, 'mode', 'full')
const lang = opt(args, 'lang', 'it')
const theme = opt(args, 'theme', 'light')
const style = opt(args, 'style', 'classic')
const w = +opt(args, 'w', 1440)
const only = opt(args, 'only', null)?.split(',')

const browser = await openBrowser()
const { page, errors } = await newPage(browser, { width: w, height: 900, dpr: w < 700 ? 2 : 1, theme, style, lang, mode })
await page.goto(`${baseUrl(args)}#/${id === 'prerequisiti' ? id : 'lezione/' + id}`, { waitUntil: 'networkidle0', timeout: 120000 })
await wait(1000)
let ids = await page.$$eval('figure.fig', (els) => els.map((e) => e.id))
if (only) ids = ids.filter((f) => only.includes(f))
// scorre fino a ogni figura per avviare gli addestramenti, poi aspetta
for (const fid of ids) {
  await page.$eval('#' + fid, (e) => e.scrollIntoView())
  await wait(150)
}
await wait(+opt(args, 'wait', 3000))
const suffix = [lang, mode !== 'full' && mode, style !== 'classic' && style, theme !== 'light' && theme, w < 700 && 'm'].filter(Boolean).join('-')
for (const fid of ids) {
  const el = await page.$('#' + fid)
  await el.evaluate((e) => e.scrollIntoView({ block: 'start' }))
  await wait(300)
  await el.screenshot({ path: shotPath(`${id}-${fid}-${suffix}`) })
}
// testo che esce dal proprio contenitore: di solito un'etichetta diventata troppo lunga
const overflow = await page.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('figure.fig button, figure.fig .readout, figure.fig .wpanel, figure.fig th, figure.fig td')) {
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible') {
      out.push(`${el.closest('figure').id}: «${el.textContent.trim().slice(0, 50)}» esce di ${el.scrollWidth - el.clientWidth}px`)
    }
  }
  return out
})
console.log(`${ids.length} figure salvate in .shots/ come ${id}-fig-N-k-${suffix}.png`)
if (overflow.length) console.log('TESTO CHE ESCE DAL CONTENITORE:\n' + overflow.join('\n'))
if (errors.length) console.log(errors.join('\n'))
await browser.close()
