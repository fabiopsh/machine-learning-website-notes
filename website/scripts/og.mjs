// Genera le immagini di anteprima dei link (1200 × 630) e le icone:  npm run og  [-- --lang en] [-- --only 03]
//
//   public/og/home.jpg          anteprima della home (e del glossario): l'inizio della pagina
//   public/og/NN.jpg            anteprima della lezione NN: una schermata della lezione, su una sua figura
//   public/og/prerequisiti.jpg  anteprima della pagina dei prerequisiti
//   public/og/en/…              le stesse in inglese (`--lang it` o `--lang en` rigenera solo una lingua)
//   public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
//
// Sono schermate del sito vero: serve il server di sviluppo acceso (`npm run dev`) o `--base URL`.
// Le immagini sono file del repository: vanno rigenerate (e committate) quando cambia l'aspetto di una lezione
// o se ne aggiunge una. Per scegliere la figura di una lezione: `FIGURE` qui sotto.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LANGS, PREREQ_ID, langPrefix, pages } from '../plugins/site-meta.ts'
import { ROOT, SHOTS, baseUrl, newPage, openBrowser, opt, wait } from './lib/browser.mjs'

// finestra 1000 × 525 ingrandita 1,2 volte: l'immagine è 1200 × 630 e il testo resta leggibile nelle anteprime
// piccole; sotto i 1024 px la barra laterale è nascosta, quindi la lezione occupa tutta la larghezza
const W = 1000
const H = 525
const DPR = 1.2
const TOPBAR = 56

/** Figura da inquadrare, per le lezioni in cui quella scelta in automatico non convince: `'03': '3.5'`. */
const FIGURE = {}

const args = process.argv.slice(2)
const onlyLang = opt(args, 'lang', null)
const only = opt(args, 'only', null)
const base = baseUrl(args)

const browser = await openBrowser()
let count = 0
for (const lang of LANGS.filter((l) => !onlyLang || l === onlyLang)) {
  const { lessons } = pages(lang)
  const prefix = langPrefix(lang)
  mkdirSync(resolve(ROOT, 'public/og', prefix), { recursive: true })
  const { page, errors } = await newPage(browser, { width: W, height: H, dpr: DPR, theme: 'light', style: 'glass', lang })
  const targets = [
    { id: 'home', route: '' },
    ...lessons.map((l) => ({ id: l.id, route: `lezione/${l.id}/` })),
    { id: PREREQ_ID, route: `${PREREQ_ID}/` },
  ].filter((t) => !only || t.id === only)

  for (const t of targets) {
    await page.goto(base + prefix + t.route, { waitUntil: 'networkidle0', timeout: 120000 })
    await wait(800)
    // la figura da inquadrare: quella indicata, altrimenti la prima che sta per intero nella finestra
    const y = await page.evaluate(
      (wanted, top, h) => {
        const figs = [...document.querySelectorAll('figure.fig[id^="fig-"]')]
        if (!figs.length) return 0
        const room = h - top
        const fits = (f) => f.offsetHeight >= 240 && f.offsetHeight <= room - 16
        const fig =
          (wanted && document.getElementById('fig-' + wanted.replace('.', '-'))) ||
          figs.find(fits) ||
          figs.find((f) => f.offsetHeight > room - 16) ||
          figs[0]
        const r = fig.getBoundingClientRect()
        const margin = Math.max(12, (room - r.height) / 2)
        return Math.max(0, window.scrollY + r.top - top - margin)
      },
      FIGURE[t.id] ?? null,
      TOPBAR,
      H,
    )
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await wait(900)
    await page.screenshot({ path: resolve(ROOT, 'public/og', prefix, `${t.id}.jpg`), type: 'jpeg', quality: 86 })
    count++
  }
  if (errors.length) console.log(errors.join('\n'))
  await page.close()
}

// icone: lo stemma del favicon su fondo carta (non con --lang o --only: sono uguali per tutte le lingue)
const mark = readFileSync(resolve(ROOT, 'public/favicon.svg'), 'utf8').replace(/<style>[\s\S]*?<\/style>/, '<style>g{fill:#00366a}</style>')
const icons = [
  ['apple-touch-icon.png', 180, 0.14],
  ['icon-192.png', 192, 0.14],
  ['icon-512.png', 512, 0.2], // margine largo: Android può ritagliarla (maskable)
]
const makeIcons = !onlyLang && !only
if (makeIcons) {
  const page = await browser.newPage()
  const tmp = resolve(SHOTS, 'og.html')
  mkdirSync(SHOTS, { recursive: true })
  for (const [name, px, pad] of icons) {
    await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 })
    writeFileSync(
      tmp,
      `<!doctype html><body style="margin:0;width:${px}px;height:${px}px;background:#f6f4ef;display:grid;place-items:center"><div style="width:${(1 - 2 * pad) * 100}%">${mark}</div></body>`,
    )
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
    await page.screenshot({ path: resolve(ROOT, 'public', name), type: 'png' })
  }
}
await browser.close()
console.log(`generate ${count} anteprime in public/og/${makeIcons ? ' e 3 icone' : ''}`)
