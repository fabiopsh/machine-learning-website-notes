import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 09, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'blind-test-set': {
    term: 'Blind test set',
    def: 'A “blind” test set: never looked at during development, used only for the final evaluation. If it is used to choose the model, it is no longer a test set.',
    section: 'Test or model selection?',
  },
  'subset-selection-bias': {
    term: 'Subset selection bias',
    def: 'The bias in the estimate that arises when the selection (of features or of the model) is made on the whole dataset: the test set has been used implicitly and the estimate becomes optimistic.',
    section: 'An instructive counterexample',
  },
  'grid-search': {
    term: 'Grid search',
    def: 'A hyperparameter search that tries all the combinations of a grid of values, choosing the best one on the validation set. Cost $(\\#\\text{values})^{\\#\\text{hyperparameters}}$.',
    section: 'Grid search',
  },
  'random-search': {
    term: 'Random search',
    alt: 'Bergstra and Bengio, 2012',
    def: 'A hyperparameter search with randomly drawn combinations: with the same budget it tries many more distinct values of each hyperparameter, useful when only some of them matter.',
    section: 'Alternatives to grid search',
  },
  stratificazione: {
    term: 'Stratification',
    def: 'Sampling so that each partition (TR, TS, fold) contains the classes in roughly the same proportions as the full dataset.',
    section: 'Lucky or unlucky sampling',
  },
  bootstrap: {
    term: 'Bootstrap',
    def: 'Random resampling with replacement, repeated to obtain different subsets for validation or for test.',
    section: 'Error measures for the evaluation',
  },
}

export default entries
