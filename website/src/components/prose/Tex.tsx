import katex from 'katex'
import { Fragment, useMemo, type ReactNode } from 'react'

const cache = new Map<string, string>()

/** Renderizza LaTeX in HTML (con cache). `trust` abilita \htmlClass per le formule interattive. */
export function renderTex(tex: string, display = false, trust = false): string {
  const key = `${display ? 'D' : 'I'}${trust ? 'T' : ''}:${tex}`
  let html = cache.get(key)
  if (html === undefined) {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      trust: trust ? (ctx) => ctx.command === '\\htmlClass' : false,
      macros: { '\\R': '\\mathbb{R}' },
    })
    cache.set(key, html)
  }
  return html
}

type TexProps = { children: string; display?: boolean; className?: string }

/** Formula LaTeX inline (o display). Uso: <Tex>{String.raw`\mathbf{x}`}</Tex> */
export function Tex({ children, display = false, className }: TexProps) {
  const html = useMemo(() => renderTex(children, display), [children, display])
  const Tag = display ? 'div' : 'span'
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/**
 * Mini-markdown per testi scritti in TS (glossario, formule, quiz):
 * $...$ matematica, **grassetto**, *corsivo*. Niente di più, di proposito.
 */
export function Rich({ text }: { text: string }) {
  const nodes = useMemo(() => parseRich(text), [text])
  return <>{nodes}</>
}

function parseRich(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\$([^$]+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={out.length}>{text.slice(last, m.index)}</Fragment>)
    if (m[1] !== undefined) out.push(<Tex key={out.length}>{m[1]}</Tex>)
    else if (m[2] !== undefined) out.push(<strong key={out.length}>{parseRich(m[2])}</strong>)
    else if (m[3] !== undefined) out.push(<em key={out.length}>{parseRich(m[3])}</em>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(<Fragment key={out.length}>{text.slice(last)}</Fragment>)
  return out
}
