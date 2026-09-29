import { useEffect, useMemo, useState } from 'react'
import { normalize } from '../components/shell/CommandPalette'
import { Rich } from '../components/prose/Tex'
import { Icon } from '../components/ui/Icon'
import { glossary } from '../content/glossary'
import { getLesson } from '../content/lessons'
import { lessonHref } from '../lib/router'
import { slugify } from '../lib/slug'

export function GlossaryPage({ term }: { term?: string }) {
  const [q, setQ] = useState('')
  const sorted = useMemo(() => [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'it')), [])
  const filtered = useMemo(() => {
    const n = normalize(q)
    if (!n) return sorted
    return sorted.filter((g) => normalize(`${g.term} ${g.en ?? ''} ${g.def}`).includes(n))
  }, [q, sorted])
  const groups = useMemo(() => {
    const m = new Map<string, typeof glossary>()
    for (const g of filtered) {
      const L = normalize(g.term)[0].toUpperCase()
      if (!m.has(L)) m.set(L, [])
      m.get(L)!.push(g)
    }
    return [...m.entries()]
  }, [filtered])

  useEffect(() => {
    if (!term) {
      window.scrollTo({ top: 0 })
      return
    }
    requestAnimationFrame(() => document.getElementById(`g-${term}`)?.scrollIntoView({ block: 'center' }))
  }, [term])

  return (
    <div className="page page--glossary">
      <div className="gloss">
        <header className="gloss__head">
          <p className="gloss__eyebrow">Strumenti</p>
          <h1>Glossario</h1>
          <p className="gloss__lead">
            Tutti i termini tecnici incontrati nelle lezioni, con la definizione breve e il link al punto in cui sono
            spiegati. Nel testo li riconosci dalla sottolineatura a puntini.
          </p>
          <div className="gloss__search">
            <Icon name="search" size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtra i termini…" aria-label="Filtra i termini" />
            <span className="gloss__count">{filtered.length} termini</span>
          </div>
          <nav className="gloss__letters" aria-label="Lettere">
            {groups.map(([L]) => (
              <a key={L} href={`#/glossario`} onClick={(e) => {
                e.preventDefault()
                document.getElementById(`gl-${L}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}>
                {L}
              </a>
            ))}
          </nav>
        </header>

        {groups.map(([L, entries]) => (
          <section key={L} className="gloss__group" id={`gl-${L}`}>
            <h2 className="gloss__letter">{L}</h2>
            <dl>
              {entries.map((g) => {
                const lesson = getLesson(g.lesson)
                return (
                  <div key={g.id} id={`g-${g.id}`} className={`gloss__entry${term === g.id ? ' is-target' : ''}`}>
                    <dt>
                      {g.term}
                      {g.en && <span className="gloss__en">{g.en}</span>}
                    </dt>
                    <dd>
                      <p>
                        <Rich text={g.def} />
                      </p>
                      <a href={lessonHref(g.lesson, slugify(g.section))} className="gloss__link">
                        <span className="gloss__lnum">{g.lesson}</span>
                        {lesson?.title} · <Rich text={g.section} />
                        <Icon name="arrowRight" size={14} />
                      </a>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
