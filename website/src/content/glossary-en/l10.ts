import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 10, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  iid: {
    term: 'i.i.d.',
    alt: 'independent and identically distributed',
    def: 'Data all drawn from the same distribution $p(z)$, each independently of the others: the assumption on which the risk estimates rest.',
    section: 'Notation',
  },
  'leave-one-out': {
    term: 'Leave-one-out CV',
    alt: 'LOOCV',
    def: 'K-fold cross-validation with $K = l$: each fold contains a single example, which is left out in turn.',
    section: 'K-fold cross-validation',
  },
  'design-set': {
    term: 'Design set',
    def: 'The part of the data used to build the final model (training and validation), kept separate from the test set.',
    section: 'K-fold CV for selection + hold-out for the test',
  },
  'double-cv': {
    term: 'Double (nested) cross-validation',
    def: 'For each outer fold, an inner cross-validation on the other data chooses the hyperparameters; the mean of the errors on the outer folds estimates the risk of the class of models. It does not return a single model.',
    section: 'Double (nested) K-fold CV',
  },
}

export default entries
