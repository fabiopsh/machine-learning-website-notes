import type { Plugin } from 'vite'
import {
  AUTHOR,
  LANGS,
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
 * Il sito è un'unica pagina con route nell'hash (`#/lezione/05`): chi genera l'anteprima di un link non esegue
 * JavaScript e non vede l'hash, quindi senza altro ogni link mostrerebbe la stessa anteprima. Questo plugin:
 * - completa il <head> di index.html (titolo, descrizione, Open Graph, dati strutturati);
 * - genera una pagina statica per ogni lezione (`lezione/NN/index.html`) e per il glossario, con titolo,
 *   riassunto, sezioni e immagine propri, che in un browser porta subito alla pagina interattiva;
 * - genera le stesse pagine in inglese sotto `en/` (`en/`, `en/lezione/NN/`, `en/glossario/`), che aprono il
 *   sito con `?lang=en`; ogni pagina dichiara la sua gemella nell'altra lingua (`hreflang`);
 * - genera `sitemap.xml`.
 * Gli indirizzi da condividere sono quindi `…/lezione/05/` e `…/en/lezione/05/` (senza hash).
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

/** `path` è l'indirizzo della pagina nella sua lingua, `route` lo stesso senza il prefisso della lingua. */
type Page = { path: string; route: string; title: string; description: string; image: string }

const UI = {
  it: {
    locale: 'it_IT',
    resource: 'Appunti di lezione interattivi',
    level: 'Laurea magistrale',
    part: 'Parte',
    open: 'Apri la lezione interattiva',
    figures: 'figure da manipolare',
    inLesson: 'In questa lezione',
    others: 'Altre lezioni',
    all: 'Tutte le lezioni',
    by: 'Appunti di',
    glossary: 'Glossario',
    openGlossary: 'Apri il glossario',
    openSite: 'Apri gli appunti interattivi',
  },
  en: {
    locale: 'en_US',
    resource: 'Interactive lecture notes',
    level: 'Master’s degree',
    part: 'Part',
    open: 'Open the interactive lesson',
    figures: 'figures to manipulate',
    inLesson: 'In this lesson',
    others: 'Other lessons',
    all: 'All lessons',
    by: 'Notes by',
    glossary: 'Glossary',
    openGlossary: 'Open the glossary',
    openSite: 'Open the interactive notes',
  },
}

function head(p: Page, ld: unknown[], lang: Lang) {
  const url = SITE_URL + p.path
  const img = SITE_URL + p.image
  const other: Lang = lang === 'it' ? 'en' : 'it'
  return `
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="author" content="${AUTHOR}" />
    <link rel="canonical" href="${url}" />
    ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL + langPrefix(l) + p.route}" />`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${SITE_URL + p.route}" />
    <meta property="og:type" content="${p.route.startsWith('lezione/') ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${esc(siteName(lang))}" />
    <meta property="og:locale" content="${UI[lang].locale}" />
    <meta property="og:locale:alternate" content="${UI[other].locale}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(p.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(p.title)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${img}" />
    ${ld.map((o) => `<script type="application/ld+json">${json(o)}</script>`).join('\n    ')}`
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

function lessonLd(l: LessonMeta, lessons: LessonMeta[], lang: Lang) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: l.title,
      description: l.summary,
      url: SITE_URL + lessonPath(l.id, lang),
      inLanguage: lang,
      learningResourceType: UI[lang].resource,
      educationalLevel: UI[lang].level,
      about: course(lang),
      author: person,
      isAccessibleForFree: true,
      position: lessons.indexOf(l) + 1,
      isPartOf: { '@type': 'LearningResource', name: siteName(lang), url: SITE_URL + langPrefix(lang) },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: notesName(lang), item: SITE_URL + langPrefix(lang) },
        { '@type': 'ListItem', position: 2, name: l.title, item: SITE_URL + lessonPath(l.id, lang) },
      ],
    },
  ]
}

/**
 * Pagina statica: leggibile da sola (senza JavaScript), in un browser passa subito alla pagina interattiva.
 * `depth` = quante cartelle sotto la radice del sito; le pagine inglesi aprono il sito con `?lang=en`.
 */
function staticPage(p: Page, ld: unknown[], lang: Lang, depth: number, body: string) {
  const up = '../'.repeat(depth)
  const app = up + (lang === 'en' ? '?lang=en' : '') + '#/' + p.route.replace(/\/$/, '')
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="${up}favicon.svg" />
    <link rel="apple-touch-icon" href="${up}apple-touch-icon.png" />
    <meta name="color-scheme" content="light dark" />${head(p, ld, lang)}
    <script>
      location.replace(${json(app)} + (location.hash ? '/' + location.hash.slice(1) : ''))
    </script>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; padding: 48px 24px; font: 19px/1.6 Georgia, 'Times New Roman', serif; background: #f6f4ef; color: #1c1b18; }
      main { max-width: 660px; margin: 0 auto; }
      .k { font: 600 12px/1 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #b8284a; }
      h1 { font-size: 40px; line-height: 1.12; font-weight: 500; margin: 12px 0 18px; }
      h2 { font: 600 12px/1 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #69655c; margin: 36px 0 8px; }
      a { color: #a01f3f; }
      li { margin: 2px 0; }
      @media (prefers-color-scheme: dark) { body { background: #131311; color: #f3f0e8; } a, .k { color: #f58aa3; } h2 { color: #a29d91; } }
    </style>
  </head>
  <body>
    <main>
${body}
    </main>
  </body>
</html>
`
}

export function seo(): Plugin {
  return {
    name: 'seo',
    transformIndexHtml(html) {
      const { home, lessons } = pages('it')
      // titolo e descrizione dell'index sono sostituiti da quelli generati
      return html
        .replace(/\s*<title>[\s\S]*?<\/title>/, '')
        .replace(/\s*<meta name="description"[^>]*>/, '')
        .replace('</head>', head({ ...home, route: '' }, homeLd({ ...home, route: '' }, lessons, 'it'), 'it').trimStart() + '\n  </head>')
    },
    generateBundle() {
      const urls: string[] = []
      for (const lang of LANGS) {
        const t = UI[lang]
        const { home, glossary, lessons } = pages(lang)
        const base = lang === 'en' ? 1 : 0 // le pagine inglesi sono una cartella più in basso
        const appQuery = lang === 'en' ? '?lang=en' : ''
        const root = (depth: number) => '../'.repeat(depth)

        // la home inglese (`en/`): quella italiana è l'index.html dell'app
        if (lang === 'en') {
          const page: Page = { ...home, route: '' }
          const body = `      <p class="k">${esc(siteName(lang))}</p>
      <h1>${esc(notesName(lang))}</h1>
      <p>${esc(home.description)}</p>
      <p><a href="../?lang=en">${t.openSite}</a></p>
      <h2>${t.all}</h2>
      <ul>
${lessons.map((l) => `        <li><a href="lezione/${l.id}/">${esc(l.title)}</a></li>`).join('\n')}
      </ul>
      <p><small>${t.by} ${AUTHOR} — ${esc(course(lang))}.</small></p>`
          this.emitFile({ type: 'asset', fileName: 'en/index.html', source: staticPage(page, homeLd(page, lessons, lang), lang, 1, body) })
        }

        for (const l of lessons) {
          const i = lessons.indexOf(l)
          const depth = base + 2
          const page: Page = {
            path: lessonPath(l.id, lang),
            route: lessonPath(l.id),
            title: lessonTitle(l, lang),
            description: l.summary,
            image: `og/${langPrefix(lang)}${l.id}.png`,
          }
          const nav = [lessons[i - 1], lessons[i + 1]]
            .filter(Boolean)
            .map((n) => `<a href="../${n.id}/">${esc(n.title)}</a>`)
            .join(' · ')
          const body = `      <p class="k">${lessonNumber(l, lessons, lang)} · ${t.part} ${l.part}, ${esc(l.partTitle)}</p>
      <h1>${esc(l.title)}</h1>
      <p>${esc(l.summary)}</p>
      <p><a href="${root(depth)}${appQuery}#/lezione/${l.id}">${t.open}</a> (${l.figures} ${t.figures})</p>
      <h2>${t.inLesson}</h2>
      <ul>
${l.sections.map((s) => `        <li>${esc(s)}</li>`).join('\n')}
      </ul>
      <h2>${t.others}</h2>
      <p>${nav} · <a href="../../">${t.all}</a></p>
      <p><small>${t.by} ${AUTHOR} — ${esc(course(lang))}.</small></p>`
          this.emitFile({ type: 'asset', fileName: `${page.path}index.html`, source: staticPage(page, lessonLd(l, lessons, lang), lang, depth, body) })
        }

        const gPage: Page = { ...glossary, route: 'glossario/' }
        const gBody = `      <p class="k">${esc(notesName(lang))}</p>
      <h1>${t.glossary}</h1>
      <p>${esc(glossary.description)}</p>
      <p><a href="${root(base + 1)}${appQuery}#/glossario">${t.openGlossary}</a> · <a href="../">${t.all}</a></p>`
        this.emitFile({ type: 'asset', fileName: `${glossary.path}index.html`, source: staticPage(gPage, [], lang, base + 1, gBody) })

        urls.push(home.path, ...lessons.map((l) => lessonPath(l.id, lang)), glossary.path)
      }

      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
      })
    },
  }
}
