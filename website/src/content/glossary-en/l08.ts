import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 08, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'mini-batch': {
    term: 'Mini-batch',
    def: 'The gradients of $mb$ patterns ($1 < mb < l$) are summed before updating the weights, and this is repeated until the epoch is over. A compromise between on-line and batch, suited to the GPU memory.',
    section: 'Mini-batch',
  },
  shuffling: {
    term: 'Shuffling',
    def: 'Presenting the patterns in a different random order at every epoch (on-line and mini-batch), to avoid systematic drifts of the descent.',
    section: 'On-line, batch and mini-batch',
  },
  momentum: {
    term: 'Momentum',
    alt: 'heavy ball',
    def: '$\\Delta\\mathbf{w}_{new} = -\\eta\\,\\partial E/\\partial\\mathbf{w} + \\alpha\\,\\Delta\\mathbf{w}_{old}$: at every step a fraction of the previous displacement is added. It speeds up on plateaus and damps the oscillations.',
    section: 'Momentum (!)',
  },
  'early-stopping': {
    term: 'Early stopping',
    def: 'Stopping training when the error on a validation set starts to go up (with a certain *patience*): since the effective complexity of the network grows during training, stopping earlier limits it.',
    section: 'How overfitting arises in a network',
  },
  'cascade-correlation': {
    term: 'Cascade Correlation',
    alt: 'Fahlman and Lebiere, 1990',
    def: 'A constructive algorithm that learns weights and number of units: it adds one unit at a time, trained to maximize the correlation with the residual error, and freezes its incoming weights.',
    section: 'Cascade Correlation',
  },
  softmax: {
    term: 'Softmax',
    def: '$o_k = e^{net_k}/\\sum_j e^{net_j}$: positive outputs that sum to 1, interpretable as class probabilities.',
    section: 'Input and output',
  },
  'cross-entropy': {
    term: 'Cross-entropy',
    def: 'An alternative loss to the squared error for classification (maximum likelihood estimate): for one unit $-\\sum_i \\{d_i\\log out(\\mathbf{x}_i) + (1-d_i)\\log(1 - out(\\mathbf{x}_i))\\}$.',
    section: 'Input and output',
  },
  standardizzazione: {
    term: 'Standardization',
    def: 'Pre-processing that brings every feature to mean 0 and standard deviation 1: $(v - \\text{mean})/\\text{std. dev.}$.',
    section: 'Input and output',
  },
  monk: {
    term: 'MONK',
    def: 'Three small artificial binary classification problems (UCI) with 6 symbolic attributes, 17 inputs with the 1-of-k encoding: the first test of a network implementation.',
    section: 'Toward the project: the MONK benchmark',
  },
}

export default entries
