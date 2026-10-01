import { useState } from 'react'
import { lessonHref } from '../../lib/router'
import { slugify } from '../../lib/slug'
import { Icon } from '../../components/ui/Icon'
import { tx } from '../../lib/i18n'

type Key = 'data' | 'model' | 'task' | 'alg' | 'val' | 'pred'

// `section` è il titolo italiano della sezione (gli id sono comuni alle due lingue): non si traduce
const INFO: Record<Key, { title: string; text: string; section?: string }> = {
  data: {
    title: tx('Dati', 'Data'),
    text: tx('Le osservazioni del mondo, cioè l’esperienza disponibile.', 'The observations of the world, that is, the available experience.'),
    section: 'Dati',
  },
  task: {
    title: 'Task',
    text: tx('Lo scopo dell’applicazione: definisce che cosa vogliamo ottenere.', 'The purpose of the application: it defines what we want to obtain.'),
    section: 'Task',
  },
  model: {
    title: tx('Modello', 'Model'),
    text: tx(
      'L’agente/ipotesi che viene costruito o migliorato apprendendo dai dati (le osservazioni del mondo).',
      'The agent/hypothesis that is built or improved by learning from the data (the observations of the world).',
    ),
    section: 'Modello',
  },
  alg: {
    title: tx('Algoritmo di apprendimento', 'Learning algorithm'),
    text: tx(
      'Guida la costruzione del modello regolando i parametri del sistema sul problema.',
      'It drives the construction of the model by tuning the parameters of the system to the problem.',
    ),
    section: 'Algoritmo di apprendimento',
  },
  val: {
    title: tx('Validazione', 'Validation'),
    text: tx('Valuta la qualità del modello ottenuto.', 'It evaluates the quality of the model obtained.'),
    section: 'Generalizzazione e validazione',
  },
  pred: {
    title: tx('Predizione', 'Prediction'),
    text: tx(
      'L’uscita del modello su un input: è ciò per cui il modello viene costruito.',
      'The output of the model on an input: it is what the model is built for.',
    ),
  },
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
      <svg viewBox="0 0 760 330" className="mls__svg" role="group" aria-label={tx('Schema di un sistema di ML', 'Diagram of an ML system')}>
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
            {tx('DATI', 'DATA')}
          </text>
        </g>
        <text x={95} y={150} textAnchor="middle" className="mls__small">
          {tx('osservazioni del mondo', 'observations of the world')}
        </text>

        <g {...on('model')} transform="translate(280 52)">
          <rect width={212} height={68} rx={12} />
          <text x={106} y={42} textAnchor="middle" className="mls__big">
            {tx('MODELLO', 'MODEL')}
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
            {tx('ALGORITMO DI APPRENDIMENTO', 'LEARNING ALGORITHM')}
          </text>
        </g>
        <g {...on('val')} transform="translate(290 256)">
          <rect width={192} height={40} rx={10} />
          <text x={96} y={26} textAnchor="middle">
            {tx('VALIDAZIONE', 'VALIDATION')}
          </text>
        </g>

        {/* graffa: guidano la costruzione del modello */}
        <path d="M548,158 q12,0 12,12 v42 q0,8 10,10 q-10,2 -10,10 v42 q0,12 -12,12" className="mls__brace" />
        <text x={582} y={214} className="mls__small">
          <tspan x={582} dy={0}>
            {tx('guidano la costruzione', 'drive the construction')}
          </tspan>
          <tspan x={582} dy={17}>
            {tx('del modello', 'of the model')}
          </tspan>
        </text>

        <g {...on('pred')} transform="translate(598 60)">
          <rect width={140} height={52} rx={26} />
          <text x={70} y={32} textAnchor="middle" className="mls__pred">
            {tx('Predizione', 'Prediction')}
          </text>
        </g>
      </svg>
      <div className="mls__info" aria-live="polite">
        <span className="mls__info-title">{info.title}</span>
        <span className="mls__info-text">{info.text}</span>
        {info.section && (
          <a className="mls__info-link" href={lessonHref('03', slugify(info.section))}>
            {tx('Vai alla sezione', 'Go to the section')} <Icon name="arrowRight" size={13} />
          </a>
        )}
      </div>
    </div>
  )
}
