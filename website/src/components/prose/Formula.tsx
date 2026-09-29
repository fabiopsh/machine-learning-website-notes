import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Icon } from '../ui/Icon'
import { Rich, Tex, renderTex } from './Tex'

/**
 * Una formula "che si spiega": passando sopra (o toccando) un simbolo
 * compare il suo significato; i pannelli mostrano come si legge ad alta voce
 * e il ragionamento che c'è dietro.
 *
 * Nel sorgente LaTeX le parti spiegabili si marcano con \htmlClass{fx-KEY}{...}.
 * Per comodità si può scrivere \part{KEY}{...}: viene convertito prima del render.
 */

export type FormulaPart = { k: string; sym: string; desc: string }
export type FormulaDef = {
  tex: string
  name?: string
  parts?: FormulaPart[]
  read?: string
  why?: string
}

type Panel = 'read' | 'parts' | 'why' | null

function expandParts(tex: string) {
  return tex.replace(/\\part\{([\w-]+)\}/g, '\\htmlClass{fx-$1}')
}

export function Formula({ f, tex }: { f?: FormulaDef; tex?: string }) {
  const def: FormulaDef = f ?? { tex: tex ?? '' }
  const html = useMemo(() => renderTex(expandParts(def.tex), true, true), [def.tex])
  const mathRef = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const active = hot ?? pinned
  const parts = def.parts ?? []
  const activePart = parts.find((p) => p.k === active)
  const interactive = parts.length > 0 || def.read || def.why

  // evidenzia nel DOM di KaTeX gli elementi della parte attiva
  useEffect(() => {
    const root = mathRef.current
    if (!root) return
    root.querySelectorAll('.fx-hot').forEach((el) => el.classList.remove('fx-hot'))
    if (active) root.querySelectorAll(`.fx-${CSS.escape(active)}`).forEach((el) => el.classList.add('fx-hot'))
    root.classList.toggle('has-hot', !!active)
  }, [active, html])

  const keyFrom = (target: EventTarget | null) => {
    const el = (target as HTMLElement | null)?.closest?.('[class*="fx-"]') as HTMLElement | null
    if (!el) return null
    const cls = [...el.classList].find((c) => c.startsWith('fx-') && c !== 'fx-hot')
    return cls ? cls.slice(3) : null
  }

  const onOver = (e: MouseEvent) => setHot(keyFrom(e.target))
  const onClick = (e: MouseEvent) => {
    const k = keyFrom(e.target)
    setPinned((p) => (k && p !== k ? k : null))
  }

  if (!interactive) {
    return (
      <div className="formula formula--plain">
        <div className="formula__math" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p))

  return (
    <div className={`formula${panel ? ' has-panel' : ''}`}>
      <div
        ref={mathRef}
        className={`formula__math${parts.length ? ' is-explorable' : ''}`}
        onMouseOver={onOver}
        onMouseLeave={() => setHot(null)}
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {parts.length > 0 && (
        <div className="formula__hint" aria-live="polite">
          {activePart ? (
            <>
              <span className="formula__hint-sym">
                <Tex>{activePart.sym}</Tex>
              </span>
              <span className="formula__hint-desc">
                <Rich text={activePart.desc} />
              </span>
            </>
          ) : (
            <span className="formula__hint-idle">
              <Icon name="hand" size={14} /> Passa sopra ai simboli (o toccali) per sapere cosa significano
            </span>
          )}
        </div>
      )}
      <div className="formula__bar">
        {def.name && <span className="formula__name">{def.name}</span>}
        <span className="formula__tabs" role="tablist">
          {def.read && (
            <button role="tab" aria-selected={panel === 'read'} onClick={() => toggle('read')}>
              Come si legge
            </button>
          )}
          {parts.length > 0 && (
            <button role="tab" aria-selected={panel === 'parts'} onClick={() => toggle('parts')}>
              Tutti i simboli
            </button>
          )}
          {def.why && (
            <button role="tab" aria-selected={panel === 'why'} onClick={() => toggle('why')}>
              Il ragionamento
            </button>
          )}
        </span>
      </div>
      {panel && (
        <div className="formula__panel" role="tabpanel">
          {panel === 'read' && def.read && (
            <p className="formula__read">
              <Rich text={def.read} />
            </p>
          )}
          {panel === 'parts' && (
            <ul className="formula__parts">
              {parts.map((p) => (
                <li
                  key={p.k}
                  className={active === p.k ? 'is-active' : undefined}
                  onMouseEnter={() => setHot(p.k)}
                  onMouseLeave={() => setHot(null)}
                >
                  <span className="formula__parts-sym">
                    <Tex>{p.sym}</Tex>
                  </span>
                  <span>
                    <Rich text={p.desc} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {panel === 'why' && def.why && (
            <div className="formula__why">
              {def.why.split('\n\n').map((para, i) => (
                <p key={i}>
                  <Rich text={para} />
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
