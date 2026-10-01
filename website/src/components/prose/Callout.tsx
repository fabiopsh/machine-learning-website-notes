import { useId, useState, type ReactNode } from 'react'
import { tx } from '../../lib/i18n'
import { Icon, type IconName } from '../ui/Icon'

export type CalloutType = 'definition' | 'theorem' | 'example' | 'note' | 'tip' | 'warning' | 'abstract' | 'question' | 'quote'

const meta: Record<CalloutType, { label: string; icon: IconName }> = {
  definition: { label: tx('Definizione', 'Definition'), icon: 'definition' },
  theorem: { label: tx('Teorema', 'Theorem'), icon: 'theorem' },
  example: { label: tx('Esempio', 'Example'), icon: 'example' },
  note: { label: tx('Nota', 'Note'), icon: 'note' },
  tip: { label: tx('Idea chiave', 'Key idea'), icon: 'tip' },
  warning: { label: tx('Attenzione', 'Warning'), icon: 'warning' },
  abstract: { label: tx('Sintesi', 'Summary'), icon: 'abstract' },
  question: { label: tx('Domande', 'Questions'), icon: 'question' },
  quote: { label: tx('Citazione', 'Quote'), icon: 'book' },
}

type CalloutProps = {
  type?: CalloutType
  title?: ReactNode
  /** etichetta alternativa (es. "Esercizio") */
  label?: string
  children: ReactNode
}

export function Callout({ type = 'note', title, label, children }: CalloutProps) {
  const m = meta[type]
  return (
    <aside className={`callout callout--${type}`}>
      <div className="callout__head">
        <span className="callout__label">
          <Icon name={m.icon} size={15} />
          {label ?? m.label}
        </span>
        {title && <span className="callout__title">{title}</span>}
      </div>
      <div className="callout__body">{children}</div>
    </aside>
  )
}

type DeepKind = 'approfondimento' | 'intuizione' | 'dimostrazione' | 'esempio' | 'come-si-legge'

const deepMeta: Record<DeepKind, { label: string; icon: IconName }> = {
  approfondimento: { label: tx('Approfondimento', 'In depth'), icon: 'sparkle' },
  intuizione: { label: tx('Intuizione', 'Intuition'), icon: 'bulb' },
  dimostrazione: { label: tx('Dimostrazione', 'Proof'), icon: 'theorem' },
  esempio: { label: tx('Esempio svolto', 'Worked example'), icon: 'example' },
  'come-si-legge': { label: tx('Come si legge', 'How to read it'), icon: 'book' },
}

/** Contenuto aggiuntivo che si apre solo se lo studente lo chiede. */
export function Deep({ title, kind = 'approfondimento', children }: { title: string; kind?: DeepKind; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const m = deepMeta[kind]
  return (
    <div className={`deep${open ? ' is-open' : ''}`}>
      <button className="deep__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="deep__kind">
          <Icon name={m.icon} size={14} />
          {m.label}
        </span>
        <span className="deep__title">{title}</span>
        <Icon name="chevronDown" size={16} className="deep__chev" />
      </button>
      <div className="deep__wrap" id={id} role="region" inert={!open}>
        <div className="deep__inner">
          <div className="deep__body">{children}</div>
        </div>
      </div>
    </div>
  )
}
