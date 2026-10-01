import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 20, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  rnn: {
    term: 'Recurrent neural network',
    alt: 'RNN',
    def: 'A network with feedback connections (cycles): it has dynamical properties and a memory (a state) of past computations, and can process variable-length sequences.',
    section: 'Why sequential data',
  },
  trasduzione: {
    term: 'Transduction',
    def: 'A mapping from an input sequence to an output value or sequence: sequence classification, IO-isomorphic transduction, next-step prediction, sequence generation.',
    section: 'The new domain: sequences and transductions',
  },
  idnn: {
    term: 'Input Delay Neural Network',
    alt: 'IDNN',
    def: 'A finite-memory network: a sliding window of fixed size over the sequence (a shift register) given as input to an MLP.',
    section: 'Approach 1: finite memory (IDNN)',
  },
  'stato-rnn': {
    term: 'State (of a recurrent network)',
    alt: 'context',
    def: 'The value $x(t)$ that summarizes the past information: an adaptive, continuous-valued encoding of the subsequence seen so far, $x(t) = f(\\mathbf{w}^T\\mathbf{l}(t) + \\hat w\\,x(t-1) + \\theta)$.',
    section: 'Approach 2: recurrent units',
  },
  'simple-rnn': {
    term: 'Simple RNN',
    alt: 'Elman network',
    def: 'A network with many hidden recurrent units, each of which receives the input and the previous states of all the hidden units: $\\mathbf{x}(t) = f(W\\mathbf{l}(t) + \\hat W\\mathbf{x}(t-1) + \\boldsymbol{\\theta})$.',
    section: 'A recurrent network (Simple RNN)',
  },
  unfolding: {
    term: 'Unfolding',
    alt: 'encoding network',
    def: 'Unrolling the recurrent network in time: one replica of the model for each step of the sequence, with shared weights. The result is an equivalent feedforward network to which backpropagation can be applied.',
    section: 'Learning: unfolding',
  },
  bptt: {
    term: 'BPTT',
    alt: 'Back-Propagation Through Time',
    def: 'Backpropagation applied to the network unrolled in time; together with RTRL (*Real-Time Recurrent Learning*) it is the supervised learning algorithm for RNNs.',
    section: 'Learning: unfolding',
  },
  lstm: {
    term: 'LSTM',
    alt: 'Long Short-Term Memory',
    def: 'An RNN with “gate” units that select the flow of the past and of the gradient, in order to learn long-term dependencies despite the vanishing gradient. GRUs are a simplified version.',
    section: 'Advanced models',
  },
  transformer: {
    term: 'Transformer',
    def: 'An architecture based on multi-head attention: the attention layer weighs all the previous states according to a learned relevance, so the model can access any point of the sequence.',
    section: 'Transformers and attention',
  },
  'reservoir-computing': {
    term: 'Reservoir Computing',
    def: 'Randomly connected recurrent networks with fixed weights (the reservoir), whose state encodes the sequences; only the output mapping is trained.',
    section: 'Randomized recurrent networks: Echo State Networks',
  },
  esn: {
    term: 'Echo State Network',
    alt: 'ESN',
    def: 'A large reservoir of sparse, untrained recurrent units and a trained linear readout. **Echo State Property**: with a contractive state transition the state depends only on the history of the inputs, not on the initial state.',
    section: 'Randomized recurrent networks: Echo State Networks',
  },
  recnn: {
    term: 'Recursive neural network',
    alt: 'RecNN',
    def: 'An extension of RNNs to trees: the state of each vertex depends on its label and on the states of its children, and the encoding proceeds from the leaves to the root.',
    section: 'Toward structured domains',
  },
}

export default entries
