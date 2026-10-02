// Genera le immagini di anteprima dei link (1200 × 630) e le icone:  npm run og  [-- --lang en]
//
//   public/og/home.png          anteprima della home (e del glossario)
//   public/og/NN.png            anteprima della lezione NN
//   public/og/prerequisiti.png  anteprima della pagina dei prerequisiti
//   public/og/en/…              le stesse in inglese (`--lang it` o `--lang en` rigenera solo una lingua)
//   public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
//
// Le immagini sono file del repository: vanno rigenerate (e committate) quando cambia un titolo o si aggiunge
// una lezione. Titoli e riassunti vengono da `src/content/lessons.ts` e `lessons.en.ts` (tramite `plugins/site-meta.ts`).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'
import { LANGS, langPrefix, lessonNumber, pages } from '../plugins/site-meta.ts'
import { ROOT, SHOTS, chromePath, opt } from './lib/browser.mjs'

const font = (pkg, file) => pathToFileURL(resolve(ROOT, 'node_modules/@fontsource-variable', pkg, 'files', file)).href
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// motivo del sito: punti rumorosi attorno a una curva (deterministico)
let seed = 42
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const f = (x) => 200 - 120 * Math.sin(x / 95) - x * 0.12
const curve = Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${i * 10},${f(i * 10).toFixed(1)}`).join('')
const dots = Array.from({ length: 16 }, (_, i) => {
  const x = 20 + i * 37
  return `<circle cx="${x}" cy="${(f(x) + (rnd() - 0.5) * 70).toFixed(1)}" r="7"/>`
}).join('')

const CSS = `
@font-face { font-family: N; src: url(${font('newsreader', 'newsreader-latin-opsz-normal.woff2')}); font-weight: 200 800; }
@font-face { font-family: N; font-style: italic; src: url(${font('newsreader', 'newsreader-latin-opsz-italic.woff2')}); font-weight: 200 800; }
@font-face { font-family: G; src: url(${font('geist', 'geist-latin-wght-normal.woff2')}); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #f6f4ef; color: #1c1b18; font-family: N, serif; position: relative; overflow: hidden; }
.frame { position: absolute; inset: 0; padding: 64px 72px 56px; display: flex; flex-direction: column; }
.k { font: 600 21px/1 G, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #b8284a; display: flex; align-items: center; gap: 16px; }
.k::before { content: ''; width: 44px; height: 3px; background: #b8284a; }
h1 { font-weight: 500; letter-spacing: -0.015em; line-height: 1.06; margin-top: 30px; max-width: 800px; }
.sub { font-size: 38px; font-style: italic; color: #34322d; margin-top: 12px; }
p { font-size: 26px; line-height: 1.4; color: #34322d; margin-top: 24px; max-width: 700px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: baseline; font: 500 22px/1 G, sans-serif; color: #69655c; }
.foot b { color: #1c1b18; font-weight: 600; }
.num { position: absolute; right: 60px; bottom: 96px; font-size: 300px; line-height: 1; font-weight: 300; color: #b8284a; opacity: .13; font-feature-settings: 'lnum'; }
svg { position: absolute; right: -30px; bottom: 70px; width: 640px; height: 330px; opacity: .5; }
svg path { fill: none; stroke: #b8284a; stroke-width: 4; }
svg circle { fill: #2a78d6; stroke: #f6f4ef; stroke-width: 3; }
`
const html = ({ lang, kicker, title, sub, text, size, num, left, right }) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
${num ? `<div class="num">${num}</div>` : `<svg viewBox="0 0 600 330"><path d="${curve}"/>${dots}</svg>`}
<div class="frame">
  <div class="k">${esc(kicker)}</div>
  <h1 style="font-size:${size}px">${esc(title)}</h1>
  ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
  ${text ? `<p${num ? '' : ' style="font-size:30px;max-width:500px"'}>${esc(text)}</p>` : ''}
  <div class="foot"><span><b>${esc(left)}</b></span><span>${esc(right)}</span></div>
</div></body></html>`

const T = {
  it: {
    kicker: 'Appunti interattivi',
    text: (n, f) => `${n} lezioni, ${f} figure da manipolare, formule spiegate simbolo per simbolo.`,
    homeLeft: 'Università di Pisa · corso 654AA',
    homeRight: 'a.a. 2026/27',
    left: 'Appunti interattivi di Machine Learning',
    right: 'Università di Pisa',
  },
  en: {
    kicker: 'Interactive notes',
    text: (n, f) => `${n} lessons, ${f} figures to manipulate, formulas explained symbol by symbol.`,
    homeLeft: 'University of Pisa · course 654AA',
    homeRight: 'a.y. 2026/27',
    left: 'Interactive Machine Learning notes',
    right: 'University of Pisa',
  },
}

const onlyLang = opt(process.argv, 'lang', null)
const cards = LANGS.filter((lang) => !onlyLang || lang === onlyLang).flatMap((lang) => {
  const { lessons, figures, prereq } = pages(lang)
  const t = T[lang]
  const dir = `og/${langPrefix(lang)}`
  return [
    {
      lang,
      file: `${dir}home.png`,
      kicker: t.kicker,
      title: 'Machine Learning',
      size: 124,
      text: t.text(lessons.length, figures),
      left: t.homeLeft,
      right: t.homeRight,
    },
    ...lessons.map((l) => {
      const [main, sub] = l.title.split(' — ')
      return {
        lang,
        file: `${dir}${l.id}.png`,
        kicker: `${lessonNumber(l, lessons, lang)} · ${l.partTitle}`,
        title: main,
        size: main.length > 44 ? 58 : main.length > 30 ? 66 : 80,
        sub: sub ? sub[0].toUpperCase() + sub.slice(1) : '',
        text: l.summary,
        num: l.id,
        left: t.left,
        right: t.right,
      }
    }),
    {
      lang,
      file: prereq.image,
      kicker: prereq.meta.eyebrow,
      title: prereq.meta.title,
      size: 80,
      text: prereq.meta.summary,
      left: t.left,
      right: t.right,
    },
  ]
})

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true })
const page = await browser.newPage()
const tmp = resolve(SHOTS, 'og.html')
mkdirSync(SHOTS, { recursive: true })
mkdirSync(resolve(ROOT, 'public/og/en'), { recursive: true })
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
for (const c of cards) {
  writeFileSync(tmp, html(c))
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: resolve(ROOT, 'public', c.file), type: 'png' })
}

// icone: lo stemma del favicon su fondo carta (non con --lang: sono uguali per tutte le lingue)
const mark = readFileSync(resolve(ROOT, 'public/favicon.svg'), 'utf8').replace(/<style>[\s\S]*?<\/style>/, '<style>g{fill:#00366a}</style>')
const icons = [
  ['apple-touch-icon.png', 180, 0.14],
  ['icon-192.png', 192, 0.14],
  ['icon-512.png', 512, 0.2], // margine largo: Android può ritagliarla (maskable)
]
for (const [name, px, pad] of onlyLang ? [] : icons) {
  await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 })
  writeFileSync(
    tmp,
    `<!doctype html><body style="margin:0;width:${px}px;height:${px}px;background:#f6f4ef;display:grid;place-items:center"><div style="width:${(1 - 2 * pad) * 100}%">${mark}</div></body>`,
  )
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
  await page.screenshot({ path: resolve(ROOT, 'public', name), type: 'png' })
}
await browser.close()
console.log(`generate ${cards.length} anteprime in public/og/${onlyLang ? '' : ' e 3 icone'}`)
