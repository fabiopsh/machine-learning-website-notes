import type { Plugin } from 'vite'
import { AUTHOR, COURSE, SITE_NAME, SITE_URL, lessonNumber, lessonPath, lessonTitle, pages, type LessonMeta } from './site-meta.ts'

/**
 * Metainformazioni per anteprime dei link e motori di ricerca.
 *
 * Il sito è un'unica pagina con route nell'hash (`#/lezione/05`): chi genera l'anteprima di un link non esegue
 * JavaScript e non vede l'hash, quindi senza altro ogni link mostrerebbe la stessa anteprima. Questo plugin:
 * - completa il <head> di index.html (titolo, descrizione, Open Graph, dati strutturati);
 * - genera una pagina statica per ogni lezione (`lezione/NN/index.html`) e per il glossario, con titolo,
 *   riassunto, sezioni e immagine propri, che in un browser porta subito alla pagina interattiva;
 * - genera `sitemap.xml`.
 * Gli indirizzi da condividere sono quindi `…/lezione/05/` (senza hash).
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

type Page = { path: string; title: string; description: string; image: string }

function head(p: Page, ld: unknown[]) {
  const url = SITE_URL + p.path
  const img = SITE_URL + p.image
  return `
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="author" content="${AUTHOR}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${p.path.startsWith('lezione/') ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="it_IT" />
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

function homeLd(home: Page, lessons: LessonMeta[]) {
  return [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL, inLanguage: 'it', author: person },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: home.title,
      description: home.description,
      url: SITE_URL,
      inLanguage: 'it',
      learningResourceType: 'Appunti di lezione interattivi',
      educationalLevel: 'Laurea magistrale',
      about: COURSE,
      author: person,
      isAccessibleForFree: true,
      hasPart: lessons.map((l) => ({ '@type': 'LearningResource', name: l.title, url: SITE_URL + lessonPath(l.id) })),
    },
  ]
}

function lessonLd(l: LessonMeta, lessons: LessonMeta[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: l.title,
      description: l.summary,
      url: SITE_URL + lessonPath(l.id),
      inLanguage: 'it',
      learningResourceType: 'Appunti di lezione interattivi',
      educationalLevel: 'Laurea magistrale',
      about: COURSE,
      author: person,
      isAccessibleForFree: true,
      position: lessons.indexOf(l) + 1,
      isPartOf: { '@type': 'LearningResource', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Appunti di Machine Learning', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: l.title, item: SITE_URL + lessonPath(l.id) },
      ],
    },
  ]
}

/** Pagina statica: leggibile da sola (senza JavaScript), in un browser passa subito alla pagina interattiva. */
function staticPage(p: Page, ld: unknown[], route: string, depth: number, body: string) {
  const up = '../'.repeat(depth)
  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="${up}favicon.svg" />
    <link rel="apple-touch-icon" href="${up}apple-touch-icon.png" />
    <meta name="color-scheme" content="light dark" />${head(p, ld)}
    <script>
      location.replace(${json(up + '#/' + route)} + (location.hash ? '/' + location.hash.slice(1) : ''))
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
      const { home, lessons } = pages()
      // titolo e descrizione dell'index sono sostituiti da quelli generati
      return html
        .replace(/\s*<title>[\s\S]*?<\/title>/, '')
        .replace(/\s*<meta name="description"[^>]*>/, '')
        .replace('</head>', head(home, homeLd(home, lessons)).trimStart() + '\n  </head>')
    },
    generateBundle() {
      const { home, glossary, lessons } = pages()
      for (const l of lessons) {
        const i = lessons.indexOf(l)
        const page: Page = { path: lessonPath(l.id), title: lessonTitle(l), description: l.summary, image: `og/${l.id}.png` }
        const nav = [lessons[i - 1], lessons[i + 1]]
          .filter(Boolean)
          .map((n) => `<a href="../${n.id}/">${esc(n.title)}</a>`)
          .join(' · ')
        const body = `      <p class="k">${lessonNumber(l, lessons)} · Parte ${l.part}, ${esc(l.partTitle)}</p>
      <h1>${esc(l.title)}</h1>
      <p>${esc(l.summary)}</p>
      <p><a href="../../#/lezione/${l.id}">Apri la lezione interattiva</a> (${l.figures} figure da manipolare)</p>
      <h2>In questa lezione</h2>
      <ul>
${l.sections.map((s) => `        <li>${esc(s)}</li>`).join('\n')}
      </ul>
      <h2>Altre lezioni</h2>
      <p>${nav} · <a href="../../">Tutte le lezioni</a></p>
      <p><small>Appunti di ${AUTHOR} — ${esc(COURSE)}.</small></p>`
        this.emitFile({ type: 'asset', fileName: `lezione/${l.id}/index.html`, source: staticPage(page, lessonLd(l, lessons), `lezione/${l.id}`, 2, body) })
      }
      const gBody = `      <p class="k">Appunti di Machine Learning</p>
      <h1>Glossario</h1>
      <p>${esc(glossary.description)}</p>
      <p><a href="../#/glossario">Apri il glossario</a> · <a href="../">Tutte le lezioni</a></p>`
      this.emitFile({ type: 'asset', fileName: 'glossario/index.html', source: staticPage(glossary, [], 'glossario', 1, gBody) })

      const today = new Date().toISOString().slice(0, 10)
      const urls = [home.path, ...lessons.map((l) => lessonPath(l.id)), glossary.path]
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
