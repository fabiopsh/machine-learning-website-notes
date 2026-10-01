import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 11, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  ensemble: {
    term: 'Ensemble',
    def: 'Using several models together, combining their outputs (mean or vote) instead of choosing one.',
    section: 'Random initialization and model selection',
  },
  'selezione-sequenziale': {
    term: 'Sequential hyperparameter selection',
    def: 'Choosing the hyperparameters one at a time (e.g. first $\\eta$, then the number of units): it introduces a bias tied to the order, because it ignores the cross effects. It should be avoided in favor of a grid over all the combinations.',
    section: 'Sequential selection of the hyperparameters',
  },
}

export default entries
