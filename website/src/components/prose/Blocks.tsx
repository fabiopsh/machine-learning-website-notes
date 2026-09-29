import type { CSSProperties, ReactNode } from 'react'

/** Cronologia verticale (es. i successi del ML). */
export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="timeline">{children}</ol>
}

export function Event({ when, title, children }: { when: string; title: ReactNode; children?: ReactNode }) {
  return (
    <li className="timeline__item">
      <span className="timeline__when">{when}</span>
      <div className="timeline__body">
        <div className="timeline__title">{title}</div>
        {children && <div className="timeline__text">{children}</div>}
      </div>
    </li>
  )
}

/** Passi numerati in sequenza (es. le fasi dell'esame). */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="steps">{children}</ol>
}

export function Step({
  title,
  tag,
  tone = 'neutral',
  children,
}: {
  title: ReactNode
  tag?: string
  tone?: 'neutral' | 'required' | 'optional'
  children: ReactNode
}) {
  return (
    <li className={`steps__item steps__item--${tone}`}>
      <div className="steps__head">
        <span className="steps__title">{title}</span>
        {tag && <span className="steps__tag">{tag}</span>}
      </div>
      <div className="steps__body">{children}</div>
    </li>
  )
}

/** Griglia di schede brevi (es. tre punti di vista). */
export function Cards({ children, cols = 3 }: { children: ReactNode; cols?: number }) {
  return (
    <div className="cards" style={{ '--cols': cols } as CSSProperties}>
      {children}
    </div>
  )
}

export function Card({
  title,
  kicker,
  accent,
  children,
}: {
  title: ReactNode
  kicker?: ReactNode
  accent?: boolean
  children?: ReactNode
}) {
  return (
    <div className={`card${accent ? ' card--accent' : ''}`}>
      {kicker && <div className="card__kicker">{kicker}</div>}
      <div className="card__title">{title}</div>
      {children && <div className="card__body">{children}</div>}
    </div>
  )
}
