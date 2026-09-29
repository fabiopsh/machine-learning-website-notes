// Utilità comuni agli script di verifica: trova Chrome/Edge e apre una pagina del sito.
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const SHOTS = resolve(ROOT, '.shots')

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
]

export function chromePath() {
  const p = CANDIDATES.find((c) => c && existsSync(c))
  if (!p) throw new Error('Chrome/Edge non trovato: imposta la variabile CHROME_PATH con il percorso del browser.')
  return p
}

/** URL base del sito: argomento --base, variabile BASE_URL o il server di sviluppo. */
export function baseUrl(args = process.argv) {
  const i = args.indexOf('--base')
  const b = i >= 0 ? args[i + 1] : process.env.BASE_URL || 'http://localhost:5173/'
  return b.endsWith('/') ? b : b + '/'
}

export function opt(args, key, def) {
  const i = args.indexOf('--' + key)
  return i >= 0 ? args[i + 1] : def
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function openBrowser() {
  return puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--hide-scrollbars'] })
}

/** Nuova pagina con tema impostato e raccolta degli errori di console. */
export async function newPage(browser, { width = 1440, height = 900, dpr = 1, theme = 'light', style = 'classic' } = {}) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('[console] ' + m.text())
  })
  page.on('requestfailed', (r) => errors.push('[rete] ' + r.url() + ' ' + (r.failure()?.errorText ?? '')))
  await page.setViewport({ width, height, deviceScaleFactor: dpr })
  await page.evaluateOnNewDocument(
    (t, s) => {
      localStorage.setItem('ml-theme', t)
      localStorage.setItem('ml-style', s)
    },
    theme,
    style,
  )
  return { page, errors }
}

export function shotPath(name) {
  mkdirSync(SHOTS, { recursive: true })
  return resolve(SHOTS, name.endsWith('.png') ? name : name + '.png')
}
