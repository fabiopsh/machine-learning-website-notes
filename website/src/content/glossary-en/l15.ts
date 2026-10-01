import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 15, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'bias-statistico': {
    term: 'Bias (of a model)',
    def: 'The discrepancy $\\big(\\bar h(\\mathbf{x}) - f(\\mathbf{x})\\big)^2$ between the true function and the **mean** prediction over the different training sets: a systematic error, due to a space $H$ that is too small or to a model that is too rigid.',
    section: 'Interpretation of the three components',
  },
  'varianza-modello': {
    term: 'Variance (of a model)',
    def: 'The variability of the response of the model for different realizations of the training set, $E_P\\big[(h(\\mathbf{x}) - \\bar h(\\mathbf{x}))^2\\big]$: it is due to excessive flexibility.',
    section: 'Interpretation of the three components',
  },
  'rumore-irriducibile': {
    term: 'Irreducible noise',
    def: 'The component $\\sigma^2$ of the expected error due to the random error in the labels: even the optimal solution can be wrong, and it does not depend on the model.',
    section: 'Interpretation of the three components',
  },
  'bias-varianza': {
    term: 'Bias-variance decomposition',
    def: 'The expected prediction error over the training sets, with squared loss, is the sum of **variance**, **bias²** and **noise²**.',
    section: 'The decomposition',
  },
  comitato: {
    term: 'Committee',
    def: 'A voting ensemble: in regression the simple average $o(\\mathbf{x}) = \\frac{1}{K}\\sum_i h_i(\\mathbf{x})$, in classification the vote of many classifiers. For a convex loss it is no worse than the average of its members.',
    section: 'Ensemble learning',
  },
  stacking: {
    term: 'Stacking',
    def: 'An ensemble in which the combiner of the responses of the models is itself an ML model.',
    section: 'Ensemble learning',
  },
  bagging: {
    term: 'Bagging',
    alt: 'bootstrap aggregating',
    def: '$K$ models are trained on different subsets of the training set obtained with the bootstrap, and their outputs are averaged (regression) or put to a vote (classification): averaging reduces the variance without increasing the bias.',
    section: 'Bagging (bootstrap aggregating)',
  },
  boosting: {
    term: 'Boosting',
    alt: 'e.g. AdaBoost',
    def: 'Classifiers trained in sequence, each one focused on the instances misclassified by the previous ones, and combined with a vote weighted according to the error. It suffers with noisy data.',
    section: 'Boosting (e.g. AdaBoost)',
  },
  'weak-learner': {
    term: 'Weak learner',
    def: 'A classifier barely better than chance (error below $1/2$ in the binary case): boosting combines many of them to incrementally build complex models.',
    section: 'Boosting (e.g. AdaBoost)',
  },
}

export default entries
