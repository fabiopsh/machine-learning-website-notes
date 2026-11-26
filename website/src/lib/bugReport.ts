import { getLesson, hasEasy, lessonSourcePath } from '../content/lessons'
import { isEn, lang, tx } from './i18n'
import { getMode } from './mode'
import { glossaryHref, lessonHref, PREREQ_ID, urlOf, type Route } from './router'

/** Indirizzo della pagina per aprire una nuova issue sul repository GitHub del corso. */
export const REPO_ISSUES_URL = 'https://github.com/fabiopsh/machine-learning-website-notes/issues/new'

const MAX_QUOTE = 420
const MAX_CONTEXT = 280
const MAX_URL_LEN = 6200

export type SelectionSnapshot = {
  quote: string
  context?: string
  anchorEl: Element
  rect: DOMRect
}

type SectionInfo = {
  slug: string
  title: string
}

type BlockInfo = {
  type: 'figure' | 'formula' | 'practice-question' | 'callout' | 'deep' | 'glossary-entry'
  id?: string
  label: string
}

/** Estrae testo pulito da un frammento DOM, convertendo le formule KaTeX nel loro sorgente LaTeX. */
function extractCleanText(node: Node): string {
  const host = document.createElement('div')
  host.appendChild(node.cloneNode(true))

  for (const junk of host.querySelectorAll('a[data-anchor], .fig__badge')) junk.remove()

  for (const katex of host.querySelectorAll('.katex')) {
    const ann = katex.querySelector('annotation[encoding="application/x-tex"]')
    if (ann?.textContent) {
      const display = Boolean(katex.closest('.katex-display'))
      const tex = ann.textContent.trim()
      katex.replaceWith(document.createTextNode(display ? `$$${tex}$$` : `$${tex}$`))
    } else {
      for (const mml of katex.querySelectorAll('.katex-mathml')) mml.remove()
    }
  }

  return (host.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function elementOf(node: Node | null): Element | null {
  if (!node) return null
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…'
}

/** Finestra di contesto attorno alla citazione dentro il suo blocco. */
function surroundingContext(blockText: string, quote: string): string | undefined {
  if (!blockText || blockText.length <= quote.length + 12) return undefined
  const idx = blockText.indexOf(quote)
  if (idx < 0) return truncate(blockText, MAX_CONTEXT)
  const pad = Math.max(40, Math.floor((MAX_CONTEXT - quote.length) / 2))
  const start = Math.max(0, idx - pad)
  const end = Math.min(blockText.length, idx + quote.length + pad)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < blockText.length ? '…' : ''
  return truncate(`${prefix}${blockText.slice(start, end).trim()}${suffix}`, MAX_CONTEXT)
}

/** Legge la selezione di testo corrente dentro `container` (di solito `#contenuto`). */
export function getSelectionSnapshot(container: Element | null): SelectionSnapshot | null {
  if (!container || typeof window === 'undefined') return null
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null

  const range = sel.getRangeAt(0)
  const startEl = elementOf(range.startContainer)
  const endEl = elementOf(range.endContainer)
  const anchorEl = elementOf(range.commonAncestorContainer)
  if (!startEl || !endEl || !anchorEl) return null
  if (!container.contains(startEl) || !container.contains(endEl)) return null
  if (startEl.closest('input, textarea, select, [contenteditable="true"]')) return null

  // se la selezione vive interamente dentro una formula KaTeX, si recupera il TeX dell'intera formula
  const insideKatex = anchorEl.closest('.katex')
  let quote = ''
  if (insideKatex) {
    const ann = insideKatex.querySelector('annotation[encoding="application/x-tex"]')
    if (ann?.textContent) {
      const display = Boolean(insideKatex.closest('.katex-display'))
      const tex = ann.textContent.trim()
      quote = display ? `$$${tex}$$` : `$${tex}$`
    }
  }
  if (!quote) quote = extractCleanText(range.cloneContents())
  if (quote.length < 2) return null

  const rect = range.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  const blockEl = anchorEl.closest('p, li, td, th, figcaption, blockquote, h1, h2, h3, h4, dd, dt, .exam__qtext, .callout__body, .deep__body')
  const context = blockEl ? surroundingContext(extractCleanText(blockEl), quote) : undefined

  return { quote, context, anchorEl, rect }
}

/** Trova la sezione (`h2`/`h3`) che contiene o precede `anchorEl`, oppure quella visibile allo scroll corrente. */
function findSection(anchorEl: Element | null): SectionInfo | undefined {
  const headings = [...document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]')]
  if (headings.length === 0) return undefined

  let found: HTMLElement | undefined
  if (anchorEl) {
    for (const h of headings) {
      if (h === anchorEl || h.contains(anchorEl)) {
        found = h
        break
      }
      const rel = h.compareDocumentPosition(anchorEl)
      if (rel & Node.DOCUMENT_POSITION_FOLLOWING) found = h
      else break
    }
  } else {
    const line = window.innerHeight * 0.28
    for (const h of headings) {
      if (h.getBoundingClientRect().top - line > 0) break
      found = h
    }
  }

  return found ? { slug: found.id, title: extractCleanText(found) } : undefined
}

/** Riconosce il blocco semantico attorno all'elemento (figura, formula, domanda, riquadro, voce di glossario). */
function findBlock(anchorEl: Element | null): BlockInfo | undefined {
  if (!anchorEl) return undefined

  const fig = anchorEl.closest<HTMLElement>('figure.fig')
  if (fig) {
    const num = fig.querySelector('.fig__num')?.textContent?.trim()
    const title = fig.querySelector('.fig__title')?.textContent?.trim()
    return { type: 'figure', id: fig.id || undefined, label: [num, title].filter(Boolean).join(' — ') || fig.id }
  }

  const formula = anchorEl.closest<HTMLElement>('.formula')
  if (formula) {
    const name = formula.querySelector('.formula__name')?.textContent?.trim()
    return { type: 'formula', label: name || tx('Formula interattiva', 'Interactive formula') }
  }

  const examQ = anchorEl.closest<HTMLElement>('.exam__q')
  if (examQ) {
    const qText = examQ.querySelector('.exam__qtext')
    return { type: 'practice-question', label: truncate(qText ? extractCleanText(qText) : tx('Domanda per esercitarsi', 'Practice question'), 120) }
  }

  const callout = anchorEl.closest<HTMLElement>('.callout')
  if (callout) {
    const title = callout.querySelector('.callout__title')?.textContent?.trim()
    return { type: 'callout', label: title || tx('Riquadro', 'Callout') }
  }

  const deep = anchorEl.closest<HTMLElement>('.deep')
  if (deep) {
    const summary = deep.querySelector('summary')?.textContent?.trim()
    return { type: 'deep', label: summary || tx('Approfondimento', 'Deep dive') }
  }

  const gloss = anchorEl.closest<HTMLElement>('.gloss__entry')
  if (gloss) {
    const dt = gloss.querySelector('dt')
    const id = gloss.id.replace(/^g-/, '') || undefined
    return { type: 'glossary-entry', id, label: dt ? extractCleanText(dt) : id ?? tx('Voce glossario', 'Glossary entry') }
  }

  return undefined
}

function getRelatedFiles(route: Route, block?: BlockInfo): string[] {
  if (route.name === 'lesson') {
    if (block?.type === 'figure') {
      return [route.id === PREREQ_ID ? 'website/src/widgets/pre/' : `website/src/widgets/l${route.id}/`]
    }
    if (block?.type === 'formula' && route.id !== PREREQ_ID) {
      return [`website/src/content/formulas/l${route.id}.ts`]
    }
    return []
  }
  if (route.name === 'glossary' && isEn) return ['website/src/content/glossary-en/']
  return []
}

function scrollPercent(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)))
}

function formatQuoteBlock(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
}

function buildBody(args: {
  pageLabel: string
  file?: string
  relatedFiles: string[]
  section?: SectionInfo
  block?: BlockInfo
  quote?: string
  context?: string
  pageUrl: string
  mode: string
  theme: string
  style: string
  viewport: string
  scrollPct: number
  commit: string
  payload: Record<string, unknown>
}): string {
  const parts: string[] = [
    tx(
      '### Descrizione del problema\n<!-- Scrivi qui cosa non funziona, qual è il refuso o cosa andrebbe corretto (basta una riga). -->\n\n',
      '### Problem description\n<!-- Describe briefly what is wrong, the typo, or what should be fixed (one line is enough). -->\n\n',
    ),
  ]

  if (args.quote) {
    parts.push(`${tx('### Testo selezionato', '### Selected text')}\n${formatQuoteBlock(args.quote)}\n`)
    if (args.context) {
      parts.push(
        `<details>\n<summary>${tx('Contesto circostante', 'Surrounding context')}</summary>\n\n${formatQuoteBlock(args.context)}\n\n</details>\n`,
      )
    }
  }

  const lines: string[] = [
    `- **${tx('Pagina', 'Page')}:** ${args.pageLabel}`,
  ]
  if (args.section) lines.push(`- **${tx('Sezione', 'Section')}:** ${args.section.title} (\`#${args.section.slug}\`)`)
  if (args.block) lines.push(`- **${tx('Elemento', 'Element')}:** ${args.block.label}${args.block.id ? ` (\`#${args.block.id}\`)` : ''}`)
  if (args.file) lines.push(`- **${tx('File sorgente', 'Source file')}:** \`${args.file}\``)
  if (args.relatedFiles.length > 0) {
    lines.push(`- **${tx('File collegati', 'Related files')}:** ${args.relatedFiles.map((f) => `\`${f}\``).join(', ')}`)
  }
  lines.push(`- **URL:** ${args.pageUrl}`)
  lines.push(`- **${tx('Stato UI', 'UI state')}:** \`lang=${lang}\` · \`mode=${args.mode}\` · \`theme=${args.theme}\` · \`style=${args.style}\``)
  lines.push(
    `- **${tx('Ambiente', 'Environment')}:** \`${args.viewport}\` · \`scroll=${args.scrollPct}%\`${args.commit ? ` · \`commit=${args.commit}\`` : ''}`,
  )

  parts.push(
    `---\n### ${tx('Contesto automatico (non modificare)', 'Automatic context (do not edit)')}\n${lines.join('\n')}\n`,
  )
  parts.push(
    `<details>\n<summary>${tx('Dati strutturati (per automazione)', 'Structured data (for automation)')}</summary>\n\n\`\`\`json\n${JSON.stringify(args.payload, null, 2)}\n\`\`\`\n\n</details>`,
  )

  return parts.join('\n')
}

/** Costruisce l'URL di GitHub Issues precompilato con posizione, file sorgente, stato UI ed eventuale testo selezionato. */
export function buildBugIssueUrl(route: Route, selection?: SelectionSnapshot | null): string {
  const snap = selection === undefined ? getSelectionSnapshot(document.getElementById('contenuto')) : selection
  const isLesson = route.name === 'lesson'
  const lesson = isLesson ? getLesson(route.id) : undefined
  const effectiveMode = isLesson && hasEasy(route.id) && getMode() === 'easy' ? 'easy' : 'full'
  const section = isLesson ? findSection(snap?.anchorEl ?? null) : undefined
  const block = findBlock(snap?.anchorEl ?? null)

  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  const style = document.documentElement.dataset.style === 'glass' ? 'glass' : 'classic'
  const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100
  const viewport = `${window.innerWidth}x${window.innerHeight}@${dpr}x`
  const pct = scrollPercent()
  const commit = typeof __BUILD_COMMIT__ === 'string' ? __BUILD_COMMIT__ : ''

  let file: string | undefined
  let pageLabel: string
  let internalHref = '#/'
  let titlePrefix: string

  if (isLesson) {
    file = lessonSourcePath(route.id, effectiveMode)
    const isPrereq = route.id === PREREQ_ID
    const lessonTag = isPrereq ? tx('Prerequisiti', 'Prerequisites') : `${tx('Lezione', 'Lesson')} ${route.id}`
    pageLabel = lesson ? `${lessonTag} — ${lesson.title}` : lessonTag
    internalHref = lessonHref(route.id, section?.slug)
    const where =
      block?.type === 'figure'
        ? block.label.split(' — ')[0]
        : section?.title
          ? truncate(section.title, 48)
          : undefined
    titlePrefix = where ? `[${lessonTag} · ${where}] ` : `[${lessonTag}] `
  } else if (route.name === 'glossary') {
    file = 'website/src/content/glossary.ts'
    pageLabel = tx('Glossario', 'Glossary')
    const termId = block?.type === 'glossary-entry' ? block.id : route.term
    internalHref = glossaryHref(termId)
    titlePrefix = block?.label ? `[${tx('Glossario', 'Glossary')} · ${truncate(block.label, 40)}] ` : `[${tx('Glossario', 'Glossary')}] `
  } else {
    file = 'website/src/pages/Home.tsx'
    pageLabel = tx('Home / Indice del corso', 'Home / Course index')
    titlePrefix = '[Home] '
  }

  const pageUrl = `${window.location.origin}${urlOf(internalHref)}`
  const relatedFiles = getRelatedFiles(route, block)
  const labels = isLesson || route.name === 'glossary' || snap ? 'bug,content' : 'bug'

  let quote = snap ? truncate(snap.quote, MAX_QUOTE) : undefined
  let context = snap?.context ? truncate(snap.context, MAX_CONTEXT) : undefined

  const makeUrl = () => {
    const payload: Record<string, unknown> = {
      schema: 1,
      trigger: snap ? 'selection' : 'topbar',
      route: route.name,
      ...(isLesson ? { lessonId: route.id } : {}),
      lang,
      mode: effectiveMode,
      ...(file ? { file } : {}),
      ...(relatedFiles.length ? { relatedFiles } : {}),
      ...(section ? { sectionSlug: section.slug, sectionTitle: section.title } : {}),
      ...(block ? { block } : {}),
      ...(quote ? { quote } : {}),
      ...(context ? { context } : {}),
      url: pageUrl,
      theme,
      style,
      viewport,
      scrollPct: pct,
      ...(commit ? { commit } : {}),
      userAgent: navigator.userAgent,
    }

    const body = buildBody({
      pageLabel,
      file,
      relatedFiles,
      section,
      block,
      quote,
      context,
      pageUrl,
      mode: effectiveMode,
      theme,
      style,
      viewport,
      scrollPct: pct,
      commit,
      payload,
    })

    const params = new URLSearchParams({ title: titlePrefix, body, labels })
    return `${REPO_ISSUES_URL}?${params.toString()}`
  }

  // mantiene l'URL entro i limiti di GitHub (evita 414 URI Too Long anche con selezioni ricche di simboli)
  let url = makeUrl()
  if (url.length > MAX_URL_LEN && context) {
    context = undefined
    url = makeUrl()
  }
  if (url.length > MAX_URL_LEN && quote) {
    quote = truncate(quote, 180)
    url = makeUrl()
  }
  return url
}

/** Apre in una nuova scheda la pagina GitHub di creazione issue già compilata. */
export function openBugReport(route: Route, selection?: SelectionSnapshot | null) {
  window.open(buildBugIssueUrl(route, selection), '_blank', 'noopener,noreferrer')
}
