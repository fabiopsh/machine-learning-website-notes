import { useEffect, useMemo, useRef, useState } from 'react'
import { glossary } from '../../content/glossary'
import { availableLessons, lessonIndex } from '../../content/lessons'
import { glossaryHref, lessonHref, navigate } from '../../lib/router'
import { Rich } from '../prose/Tex'
import { Icon, type IconName } from '../ui/Icon'

type Kind = 'lesson' | 'section' | 'figure' | 'term'
type Item = { kind: Kind; title: string; sub: string; href: string; hay: string }

const kindMeta: Record<Kind, { label: string; icon: IconName; weight: number }> = {
  lesson: { label: 'Lezione', icon: 'book', weight: 3 },
  term: { label: 'Glossario', icon: 'definition', weight: 2.2 },
  section: { label: 'Sezione', icon: 'hash', weight: 1.6 },
  figure: { label: 'Figura', icon: 'figure', weight: 1.2 },
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[$\\{}^_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildIndex(): Item[] {
  const items: Item[] = []
  for (const l of availableLessons) {
    items.push({ kind: 'lesson', title: l.title, sub: `${l.id} · ${l.eyebrow ?? ''}`, href: lessonHref(l.id), hay: '' })
    const idx = lessonIndex[l.id]
    if (!idx) continue
    for (const h of idx.headings) {
      items.push({ kind: 'section', title: h.text, sub: `${l.id} · ${l.title}`, href: lessonHref(l.id, h.slug), hay: '' })
    }
    for (const f of idx.figures) {
      items.push({
        kind: 'figure',
        title: f.title,
        sub: `Fig. ${f.n} · ${l.title}`,
        href: lessonHref(l.id, `fig-${f.n.replace('.', '-')}`),
        hay: '',
      })
    }
  }
  for (const g of glossary) {
    items.push({
      kind: 'term',
      title: g.term,
      sub: g.def.replace(/\*/g, ''),
      href: glossaryHref(g.id),
      hay: normalize(`${g.en ?? ''} ${g.id}`),
    })
  }
  return items.map((it) => ({ ...it, hay: normalize(`${it.title} ${it.hay}`) }))
}

function search(items: Item[], q: string): Item[] {
  const nq = normalize(q)
  if (!nq) return items.filter((i) => i.kind === 'lesson')
  const tokens = nq.split(' ')
  const scored: { it: Item; s: number }[] = []
  for (const it of items) {
    if (!tokens.every((t) => it.hay.includes(t))) continue
    let s = kindMeta[it.kind].weight
    if (it.hay.startsWith(nq)) s += 3
    else if (it.hay.includes(nq)) s += 1.5
    for (const t of tokens) if (new RegExp(`(^| )${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(it.hay)) s += 0.6
    scored.push({ it, s })
  }
  return scored
    .sort((a, b) => b.s - a.s)
    .slice(0, 40)
    .map((x) => x.it)
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const index = useMemo(() => buildIndex(), [])
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const results = useMemo(() => search(index, q), [index, q])

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    list.current?.querySelector('.is-sel')?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  const go = (it: Item | undefined) => {
    if (!it) return
    onClose()
    navigate(it.href)
  }

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Cerca nel corso" onMouseDown={onClose}>
      <div className="palette__box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette__input">
          <Icon name="search" size={18} />
          <input
            ref={input}
            value={q}
            placeholder="Cerca lezioni, sezioni, figure, termini…"
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSel((s) => Math.min(results.length - 1, s + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSel((s) => Math.max(0, s - 1))
              } else if (e.key === 'Enter') {
                go(results[sel])
              } else if (e.key === 'Escape') {
                onClose()
              }
            }}
            aria-activedescendant={`pal-${sel}`}
          />
          <kbd onClick={onClose}>Esc</kbd>
        </div>
        <ul className="palette__list" ref={list} role="listbox">
          {results.length === 0 && <li className="palette__empty">Nessun risultato per “{q}”.</li>}
          {results.map((it, i) => {
            const m = kindMeta[it.kind]
            return (
              <li
                id={`pal-${i}`}
                key={it.href + it.title}
                role="option"
                aria-selected={i === sel}
                className={i === sel ? 'is-sel' : undefined}
                onMouseMove={() => setSel(i)}
                onClick={() => go(it)}
              >
                <span className="palette__icon">
                  <Icon name={m.icon} size={16} />
                </span>
                <span className="palette__text">
                  <span className="palette__title">
                    <Rich text={it.title} />
                  </span>
                  <span className="palette__sub">
                    <Rich text={it.sub} />
                  </span>
                </span>
                <span className="palette__kind">{m.label}</span>
              </li>
            )
          })}
        </ul>
        <div className="palette__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> per muoverti
          </span>
          <span>
            <kbd>↵</kbd> per aprire
          </span>
        </div>
      </div>
    </div>
  )
}
