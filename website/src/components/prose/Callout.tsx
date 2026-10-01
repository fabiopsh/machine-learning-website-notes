import { useId, useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../ui/Icon'

export type CalloutType = 'definition' | 'theorem' | 'example' | 'note' | 'tip' | 'warning' | 'abstract' | 'question' | 'quote'

const meta: Record<CalloutType, { label: string; icon: IconName }> = {
  definition: { label: 'Definizione', icon: 'definition' },
  theorem: { label: 'Teorema', icon: 'theorem' },
  example: { label: 'Esempio', icon: 'example' },
  note: { label: 'Nota', icon: 'note' },
  tip: { label: 'Idea chiave', icon: 'tip' },
  warning: { label: 'Attenzione', icon: 'warning' },
  abstract: { label: 'Sintesi', icon: 'abstract' },
  question: { label: 'Domande', icon: 'question' },
  quote: { label: 'Citazione', icon: 'book' },
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
  approfondimento: { label: 'Approfondimento', icon: 'sparkle' },
  intuizione: { label: 'Intuizione', icon: 'bulb' },
  dimostrazione: { label: 'Dimostrazione', icon: 'theorem' },
  esempio: { label: 'Esempio svolto', icon: 'example' },
  'come-si-legge': { label: 'Come si legge', icon: 'book' },
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
