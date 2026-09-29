import { useState } from 'react'
import { lessonHref } from '../../lib/router'
import { slugify } from '../../lib/slug'
import { Icon } from '../../components/ui/Icon'

type Key = 'data' | 'model' | 'task' | 'alg' | 'val' | 'pred'

const INFO: Record<Key, { title: string; text: string; section?: string }> = {
  data: { title: 'Dati', text: 'Le osservazioni del mondo, cioè l’esperienza disponibile.', section: 'Dati' },
  task: { title: 'Task', text: 'Lo scopo dell’applicazione: definisce che cosa vogliamo ottenere.', section: 'Task' },
  model: {
    title: 'Modello',
    text: 'L’agente/ipotesi che viene costruito o migliorato apprendendo dai dati (le osservazioni del mondo).',
    section: 'Modello',
  },
  alg: {
    title: 'Algoritmo di apprendimento',
    text: 'Guida la costruzione del modello regolando i parametri del sistema sul problema.',
    section: 'Algoritmo di apprendimento',
  },
  val: { title: 'Validazione', text: 'Valuta la qualità del modello ottenuto.', section: 'Generalizzazione e validazione' },
  pred: { title: 'Predizione', text: 'L’uscita del modello su un input: è ciò per cui il modello viene costruito.' },
}

export function MLSystem() {
  const [sel, setSel] = useState<Key>('model')
  const on = (k: Key) => ({
    className: `mls__box mls__box--${k}${sel === k ? ' is-sel' : ''}`,
    onMouseEnter: () => setSel(k),
    onFocus: () => setSel(k),
    onClick: () => setSel(k),
    tabIndex: 0,
    role: 'button' as const,
  })
  const info = INFO[sel]
  return (
    <div className="mls">
      <svg viewBox="0 0 760 330" className="mls__svg" role="group" aria-label="Schema di un sistema di ML">
        <defs>
          <marker id="mls-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0,0L10,5L0,10z" className="mls__head" />
          </marker>
        </defs>

        {/* contenitore del sistema */}
        <rect x={236} y={14} width={300} height={304} rx={16} className="mls__frame" />

        {/* flusso dati → modello → predizione */}
        <path d="M168,86 H278" className="mls__flow" markerEnd="url(#mls-arr)" />
        <path d="M494,86 H592" className="mls__flow" markerEnd="url(#mls-arr)" />

        <g {...on('data')} transform="translate(22 52)">
          <rect width={146} height={68} rx={12} />
          <text x={73} y={42} textAnchor="middle" className="mls__big">
            DATI
          </text>
        </g>
        <text x={95} y={150} textAnchor="middle" className="mls__small">
          osservazioni del mondo
        </text>

        <g {...on('model')} transform="translate(280 52)">
          <rect width={212} height={68} rx={12} />
          <text x={106} y={42} textAnchor="middle" className="mls__big">
            MODELLO
          </text>
          <path d="M172,58 L186,36 L193,46 L206,14" className="mls__learn" />
        </g>

        <g {...on('task')} transform="translate(300 152)">
          <rect width={172} height={40} rx={10} />
          <text x={86} y={26} textAnchor="middle">
            TASK
          </text>
        </g>
        <g {...on('alg')} transform="translate(262 204)">
          <rect width={248} height={40} rx={10} />
          <text x={124} y={26} textAnchor="middle">
            ALGORITMO DI APPRENDIMENTO
          </text>
        </g>
        <g {...on('val')} transform="translate(290 256)">
          <rect width={192} height={40} rx={10} />
          <text x={96} y={26} textAnchor="middle">
            VALIDAZIONE
          </text>
        </g>

        {/* graffa: guidano la costruzione del modello */}
        <path d="M548,158 q12,0 12,12 v42 q0,8 10,10 q-10,2 -10,10 v42 q0,12 -12,12" className="mls__brace" />
        <text x={582} y={214} className="mls__small">
          <tspan x={582} dy={0}>
            guidano la costruzione
          </tspan>
          <tspan x={582} dy={17}>
            del modello
          </tspan>
        </text>

        <g {...on('pred')} transform="translate(598 60)">
          <rect width={140} height={52} rx={26} />
          <text x={70} y={32} textAnchor="middle" className="mls__pred">
            Predizione
          </text>
        </g>
      </svg>
      <div className="mls__info" aria-live="polite">
        <span className="mls__info-title">{info.title}</span>
        <span className="mls__info-text">{info.text}</span>
        {info.section && (
          <a className="mls__info-link" href={lessonHref('03', slugify(info.section))}>
            Vai alla sezione <Icon name="arrowRight" size={13} />
          </a>
        )}
      </div>
    </div>
  )
}
