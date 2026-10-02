import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'
import {
  AUTHOR,
  LANGS,
  PREREQ_ID,
  SITE_URL,
  course,
  langPrefix,
  lessonNumber,
  lessonPath,
  lessonTitle,
  notesName,
  pages,
  siteName,
  type Lang,
  type LessonMeta,
} from './site-meta.ts'

/**
 * Metainformazioni per anteprime dei link e motori di ricerca.
 *
 * Chi genera l'anteprima di un link non esegue JavaScript e non riceve la parte dopo `#`: per avere un'anteprima
 * propria ogni pagina deve avere un indirizzo vero con un file dietro. Questo plugin:
 * - completa il <head> di index.html (titolo, descrizione, Open Graph, dati strutturati);
 * - scrive una copia di index.html per ogni lezione (`lezione/NN/index.html`), per il glossario e per i prerequisiti,
 *   con titolo, riassunto e immagine propri: è la stessa applicazione, che apre subito quella pagina
 *   (`src/lib/router.ts`), quindi l'indirizzo nella barra del browser è già quello da condividere;
 * - scrive le stesse pagine in inglese sotto `en/`; ogni pagina dichiara la sua gemella nell'altra lingua (`hreflang`);
 * - mette in ogni pagina, dentro `#root`, un testo essenziale (titolo, riassunto, sezioni, link alle altre pagine)
 *   per chi non esegue JavaScript: l'applicazione lo sostituisce appena parte;
 * - genera `sitemap.xml`.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

/** `path` è l'indirizzo della pagina nella sua lingua, `route` lo stesso senza il prefisso della lingua. */
type Page = { path: string; route: string; title: string; description: string; image: string }

const UI = {
  it: {
    locale: 'it_IT',
    language: 'Italiano',
    resource: 'Appunti di lezione interattivi',
    level: 'Laurea magistrale',
    part: 'Parte',
    figures: 'figure da manipolare',
    inLesson: 'In questa lezione',
    inPage: 'In questa pagina',
    others: 'Altre lezioni',
    all: 'Tutte le lezioni',
    by: 'Appunti di',
    glossary: 'Glossario',
  },
  en: {
    locale: 'en_US',
    language: 'English',
    resource: 'Interactive lecture notes',
    level: 'Master’s degree',
    part: 'Part',
    figures: 'figures to manipulate',
    inLesson: 'In this lesson',
    inPage: 'On this page',
    others: 'Other lessons',
    all: 'All lessons',
    by: 'Notes by',
    glossary: 'Glossary',
  },
}

/** Dati del sito per `src/lib/meta.ts`, che aggiorna il <head> quando si cambia pagina senza ricaricare. */
function siteData() {
  const home = (lang: Lang) => {
    const h = pages(lang).home
    return { title: h.title, description: h.description }
  }
  return { url: SITE_URL, home: { it: home('it'), en: home('en') } }
}

function head(p: Page, ld: unknown[], lang: Lang) {
  const url = SITE_URL + p.path
  const img = SITE_URL + p.image
  const other: Lang = lang === 'it' ? 'en' : 'it'
  return `<title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="author" content="${AUTHOR}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL + langPrefix(l) + p.route}" />`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${SITE_URL + p.route}" />
    <meta property="og:type" content="${p.route ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${esc(siteName(lang))}" />
    <meta property="og:locale" content="${UI[lang].locale}" />
    <meta property="og:locale:alternate" content="${UI[other].locale}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(p.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(p.title)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${img}" />
    <script type="application/json" id="ml-site">${json(siteData())}</script>
    ${ld.map((o) => `<script type="application/ld+json">${json(o)}</script>`).join('\n    ')}`.trimEnd()
}

const person = { '@type': 'Person', name: AUTHOR, url: 'https://github.com/fabiopsh' }

function homeLd(home: Page, lessons: LessonMeta[], lang: Lang) {
  const url = SITE_URL + home.path
  return [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: siteName(lang), url, inLanguage: lang, author: person },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: home.title,
      description: home.description,
      url,
      inLanguage: lang,
      learningResourceType: UI[lang].resource,
      educationalLevel: UI[lang].level,
      about: course(lang),
      author: person,
      isAccessibleForFree: true,
      hasPart: lessons.map((l) => ({ '@type': 'LearningResource', name: l.title, url: SITE_URL + lessonPath(l.id, lang) })),
    },
  ]
}

/** Dati strutturati di una pagina di contenuto (lezione o prerequisiti); `position` solo per le lezioni. */
function pageLd(p: Page, name: string, lang: Lang, position?: number) {
  const url = SITE_URL + p.path
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name,
      description: p.description,
      url,
      image: SITE_URL + p.image,
      inLanguage: lang,
      learningResourceType: UI[lang].resource,
      educationalLevel: UI[lang].level,
      about: course(lang),
      author: person,
      isAccessibleForFree: true,
      ...(position ? { position } : {}),
      isPartOf: { '@type': 'LearningResource', name: siteName(lang), url: SITE_URL + langPrefix(lang) },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: notesName(lang), item: SITE_URL + langPrefix(lang) },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
  ]
}

const START = '<!--seo-->'
const END = '<!--/seo-->'

/**
 * Una pagina del sito: l'index.html dell'applicazione con il <head> della pagina, i percorsi dei file risaliti
 * di `depth` cartelle e, dentro `#root`, il testo `body` per chi non esegue JavaScript.
 */
function render(template: string, p: Page, ld: unknown[], lang: Lang, depth: number, body: string) {
  const up = '../'.repeat(depth) || './'
  const a = template.indexOf(START)
  const b = template.indexOf(END)
  if (a < 0 || b < 0) throw new Error('seo: segnaposto del <head> non trovato in index.html')
  const html = template.slice(0, a) + head(p, ld, lang) + template.slice(b + END.length)
  if (!html.includes('<div id="root"></div>')) throw new Error('seo: <div id="root"> non trovato in index.html')
  return html
    .replace(/<html lang="it" data-root="[^"]*"/, () => `<html lang="${lang}" data-root="${up}"`)
    .replace(/\b(href|src)="\.\//g, (_, attr: string) => `${attr}="${up}`)
    .replace('<div id="root"></div>', () => `<div id="root">\n      <div class="ssr">\n${body}\n      </div>\n    </div>`)
}

export function seo(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html, ctx) {
      const { home, lessons } = pages('it')
      const page: Page = { ...home, route: '' }
      // in sviluppo c'è un solo index.html per tutti gli indirizzi: la cartella del sito è la radice del server
      const out = ctx.server ? html.replace('data-root="./"', 'data-root="/"') : html
      return out.replace(START, () => START + head(page, homeLd(page, lessons, 'it'), 'it') + END)
    },
    // dopo che Vite ha scritto index.html (con i nomi definitivi di script e stili): se ne fanno le copie
    writeBundle() {
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const write = (file: string, source: string) => {
        const path = resolve(outDir, file)
        mkdirSync(dirname(path), { recursive: true })
        writeFileSync(path, source)
      }
      const routes: string[] = []

      for (const lang of LANGS) {
        const t = UI[lang]
        const other: Lang = lang === 'it' ? 'en' : 'it'
        const { home, glossary, prereq, lessons } = pages(lang)
        const base = lang === 'en' ? 1 : 0 // le pagine inglesi sono una cartella più in basso
        const credit = `        <p><small>${t.by} ${AUTHOR} — ${esc(course(lang))}.</small></p>`

        const homePage: Page = { ...home, route: '' }
        const homeBody = `        <p>${esc(siteName(lang))}</p>
        <h1>${esc(notesName(lang))}</h1>
        <p>${esc(home.description)}</p>
        <h2>${t.all}</h2>
        <ol>
${lessons.map((l) => `          <li><a href="lezione/${l.id}/">${esc(l.title)}</a> — ${esc(l.summary)}</li>`).join('\n')}
        </ol>
        <p><a href="${PREREQ_ID}/">${esc(prereq.meta.title)}</a> · <a href="glossario/">${t.glossary}</a> · <a href="${lang === 'en' ? '../' : 'en/'}" hreflang="${other}">${UI[other].language}</a></p>
${credit}`
        write(`${home.path}index.html`, render(template, homePage, homeLd(homePage, lessons, lang), lang, base, homeBody))

        for (const l of lessons) {
          const i = lessons.indexOf(l)
          const page: Page = {
            path: lessonPath(l.id, lang),
            route: lessonPath(l.id),
            title: lessonTitle(l, lang),
            description: l.summary,
            image: `og/${langPrefix(lang)}${l.id}.jpg`,
          }
          const nav = [lessons[i - 1], lessons[i + 1]]
            .filter(Boolean)
            .map((n) => `<a href="../${n.id}/">${esc(n.title)}</a>`)
            .join(' · ')
          const body = `        <p>${lessonNumber(l, lessons, lang)} · ${t.part} ${l.part}, ${esc(l.partTitle)}</p>
        <h1>${esc(l.title)}</h1>
        <p>${esc(l.summary)}</p>
        <p>${l.figures} ${t.figures}.</p>
        <h2>${t.inLesson}</h2>
        <ul>
${l.sections.map((s) => `          <li>${esc(s)}</li>`).join('\n')}
        </ul>
        <h2>${t.others}</h2>
        <p>${nav} · <a href="../../">${t.all}</a></p>
${credit}`
          write(`${page.path}index.html`, render(template, page, pageLd(page, l.title, lang, i + 1), lang, base + 2, body))
        }

        const pPage: Page = { ...prereq, route: `${PREREQ_ID}/` }
        const pBody = `        <p>${esc(prereq.meta.eyebrow)}</p>
        <h1>${esc(prereq.meta.title)}</h1>
        <p>${esc(prereq.description)}</p>
        <h2>${t.inPage}</h2>
        <ul>
${prereq.meta.sections.map((s) => `          <li>${esc(s)}</li>`).join('\n')}
        </ul>
        <p><a href="../">${t.all}</a></p>
${credit}`
        write(`${prereq.path}index.html`, render(template, pPage, pageLd(pPage, prereq.meta.title, lang), lang, base + 1, pBody))

        const gPage: Page = { ...glossary, route: 'glossario/' }
        const gBody = `        <p>${esc(notesName(lang))}</p>
        <h1>${t.glossary}</h1>
        <p>${esc(glossary.description)}</p>
        <p><a href="../">${t.all}</a></p>
${credit}`
        write(`${glossary.path}index.html`, render(template, gPage, [], lang, base + 1, gBody))

        if (lang === 'it') routes.push('', ...lessons.map((l) => lessonPath(l.id)), `${PREREQ_ID}/`, 'glossario/')
      }

      // ogni indirizzo nelle due lingue, ciascuno con il rimando alla sua gemella
      const today = new Date().toISOString().slice(0, 10)
      const entry = (route: string, lang: Lang) => `  <url>
    <loc>${SITE_URL}${langPrefix(lang)}${route}</loc>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${langPrefix(l)}${route}" />`).join('\n')}
    <lastmod>${today}</lastmod>
  </url>`
      write(
        'sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap((lang) => routes.map((r) => entry(r, lang))).join('\n')}
</urlset>
`,
      )
    },
  }
}
