import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 18, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'random-forest': {
    term: 'Random Forest',
    def: 'An ensemble of randomized decision trees, each built on samples drawn at random from the training set and with a random choice of the variables on which to split the nodes.',
    section: 'Intrinsically random models',
  },
  'reti-randomizzate': {
    term: 'Neural networks with random weights',
    alt: 'randomized networks',
    def: 'Networks with one or more hidden layers whose weights are fixed after the random initialization: only the output weights are trained, with a linear model.',
    section: 'Neural networks with random weights',
  },
  elm: {
    term: 'ELM and RVFL',
    alt: 'Extreme Learning Machine, Random Vector Functional Link',
    def: 'The main models of randomized feedforward network, together with RBF networks with random centers.',
    section: 'Neural networks with random weights',
  },
  readout: {
    term: 'Readout',
    def: 'The trained output layer of a randomized network: it combines the features of the hidden space, typically with a linear model, $\\mathbf{W}^{out} = (\\mathbf{H}^T\\mathbf{H} + \\lambda\\mathbf{I})^{-1}\\mathbf{H}^T\\mathbf{d}$.',
    section: 'General structure',
  },
  'teorema-cover': {
    term: 'Cover’s theorem',
    def: 'A classification problem cast non-linearly into a high-dimensional space is more likely to be linearly separable than in a low-dimensional space, provided that the space is not densely populated.',
    section: 'General structure',
  },
}

export default entries
