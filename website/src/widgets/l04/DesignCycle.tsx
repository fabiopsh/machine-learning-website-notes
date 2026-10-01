import { useState } from 'react'
import { tx } from '../../lib/i18n'

/** Fig. 4.10: il ciclo di progettazione, con la conoscenza a priori e il ritorno alle fasi precedenti. */

const STEPS = [
  {
    t: tx('Raccolta dei dati', 'Data collection'),
    d: tx(
      'Selezione, integrazione, pulizia. Serve un insieme di esempi abbastanza grande e rappresentativo per training e test.',
      'Selection, integration, cleaning. A set of examples that is large and representative enough is needed for training and test.',
    ),
  },
  {
    t: tx('Rappresentazione dei dati', 'Data representation'),
    d: tx(
      'Dipende dal dominio e sfrutta la conoscenza dell’esperto: feature selection, outlier, scalatura, dati mancanti. Spesso è la fase più critica.',
      'It depends on the domain and exploits the expert’s knowledge: feature selection, outliers, scaling, missing data. It is often the most critical phase.',
    ),
    prior: true,
  },
  {
    t: tx('Scelta del modello', 'Model choice'),
    d: tx(
      'Formulazione del problema e delle ipotesi: conoscere i limiti di applicabilità del modello e controllarne la complessità.',
      'Formulation of the problem and of the hypotheses: knowing the limits of applicability of the model and controlling its complexity.',
    ),
    prior: true,
  },
  {
    t: tx('Costruzione del modello', 'Model building'),
    d: tx('Il cuore del ML: l’algoritmo di apprendimento sui dati di training.', 'The heart of ML: the learning algorithm on the training data.'),
    prior: true,
  },
  {
    t: tx('Valutazione', 'Evaluation'),
    d: tx(
      'La prestazione è l’accuratezza predittiva; si aggiungono interpretazione dei risultati, spiegazione dei dati, estrazione di conoscenza.',
      'The performance is the predictive accuracy; to this are added interpretation of the results, explanation of the data, extraction of knowledge.',
    ),
  },
  { t: 'Deployment', d: tx('Il modello viene messo in uso.', 'The model is put into use.') },
]

export function DesignCycle() {
  const [sel, setSel] = useState(1)
  const s = STEPS[sel]
  return (
    <div className="cycle">
      <div className="cycle__flow">
        <div className="cycle__prior" aria-hidden="true">
          <span>{tx('conoscenza a priori', 'prior knowledge')}</span>
        </div>
        <ol className="cycle__list">
          {STEPS.map((st, i) => (
            <li key={i}>
              <button className={`cycle__step${i === sel ? ' is-sel' : ''}${st.prior ? ' is-prior' : ''}`} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)}>
                <span className="cycle__n">{i + 1}</span>
                {st.t}
              </button>
            </li>
          ))}
        </ol>
        <svg className="cycle__loop" viewBox="0 0 60 300" aria-hidden="true" preserveAspectRatio="none">
          <path d="M8,268 C 56,268 56,40 14,40" />
          <path d="M20,32 L10,40 L20,48" className="cycle__loophead" />
        </svg>
      </div>
      <div className="cycle__info" aria-live="polite">
        <div className="cycle__info-t">
          {sel + 1}. {s.t}
        </div>
        <p>{s.d}</p>
        <p className="wnote">
          {tx(
            'La freccia a destra: i risultati della valutazione possono richiedere di tornare alle fasi precedenti.',
            'The arrow on the right: the results of the evaluation may require going back to the previous phases.',
          )}
        </p>
      </div>
    </div>
  )
}
