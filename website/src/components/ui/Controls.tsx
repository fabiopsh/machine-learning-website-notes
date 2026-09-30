import { useId, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type SliderProps = {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => ReactNode
  /** etichette sotto la traccia */
  marks?: { value: number; label: ReactNode }[]
  width?: number | string
}

export function Slider({ label, value, min, max, step = 0.01, onChange, format, marks, width }: SliderProps) {
  const id = useId()
  const p = ((value - min) / (max - min)) * 100
  return (
    <div className="ctl slider" style={width ? { width } : undefined}>
      <div className="slider__top">
        <label htmlFor={id} className="ctl__label">
          {label}
        </label>
        <output htmlFor={id} className="ctl__value">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ '--p': `${p}%` } as CSSProperties}
      />
      {marks && (
        <div className="slider__marks">
          {marks.map((mk) => (
            <button
              key={mk.value}
              type="button"
              style={{ left: `${((mk.value - min) / (max - min)) * 100}%` }}
              onClick={() => onChange(mk.value)}
            >
              {mk.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type SegProps<T extends string | number> = {
  label?: ReactNode
  value: T
  options: { value: T; label: ReactNode; title?: string }[]
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}

export function Segmented<T extends string | number>({ label, value, options, onChange, size = 'md' }: SegProps<T>) {
  return (
    <div className={`ctl seg seg--${size}`}>
      {label && <span className="ctl__label">{label}</span>}
      <div className="seg__track" role="radiogroup">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            title={o.title}
            className={o.value === value ? 'is-on' : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ctl toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      <span className="toggle__label">{label}</span>
    </label>
  )
}

export function Btn({
  children,
  onClick,
  icon,
  variant = 'ghost',
  disabled,
  title,
}: {
  children?: ReactNode
  onClick: () => void
  icon?: IconName
  variant?: 'ghost' | 'solid' | 'soft'
  disabled?: boolean
  title?: string
}) {
  return (
    <button type="button" className={`btn btn--${variant}`} onClick={onClick} disabled={disabled} title={title}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  )
}

/** Valore numerico in evidenza (etichetta + numero). */
export function Readout({
  label,
  value,
  tone,
  sub,
}: {
  label: ReactNode
  value: ReactNode
  tone?: 'blue' | 'orange' | 'green' | 'violet' | 'red' | 'accent' | 'muted'
  sub?: ReactNode
}) {
  return (
    <div className={`readout${tone ? ' readout--' + tone : ''}`}>
      <span className="readout__label">
        {tone && tone !== 'muted' && tone !== 'accent' && <span className="readout__key" />}
        {label}
      </span>
      <span className="readout__value">{value}</span>
      {sub && <span className="readout__sub">{sub}</span>}
    </div>
  )
}

export function Controls({ children, align }: { children: ReactNode; align?: 'end' }) {
  return <div className={`controls${align ? ' controls--' + align : ''}`}>{children}</div>
}

export function Legend({ items }: { items: { label: ReactNode; color: string; kind?: 'line' | 'dot' | 'square' | 'dash' | 'area' }[] }) {
  return (
    <ul className="legend">
      {items.map((it, i) => (
        <li key={i}>
          <span className={`legend__key legend__key--${it.kind ?? 'line'}`} style={{ '--k': it.color } as CSSProperties} />
          {it.label}
        </li>
      ))}
    </ul>
  )
}
