import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 06, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  connessionismo: {
    term: 'Connectionism',
    def: 'The “philosophy” of neural networks: complex behaviors that **emerge** from the interaction of many simple interconnected computational units.',
    section: 'Neural networks as an ML tool',
  },
  hebb: {
    term: 'Hebbian learning',
    alt: 'Hebb, 1949',
    def: 'A synapse is strengthened when the inputs of the neuron (and the correlated outputs) are repeated: the weights move closer to the inputs.',
    section: 'The biological inspiration',
  },
  unita: {
    term: 'Unit (artificial neuron)',
    def: 'It computes the net input $net_i = \\sum_j w_{ij}x_j$ (bias included) and the output $o_i = f(net_i)$. $w_{ij}$ is the weight of the connection from $j$ to $i$.',
    section: 'The artificial neuron',
  },
  'funzione-di-attivazione': {
    term: 'Activation function',
    def: 'The function $f$ that the unit applies to the net input: linear (identity), threshold (Perceptron), sigmoidal (logistic, tanh), ReLU…',
    section: 'The artificial neuron',
  },
  perceptron: {
    term: 'Perceptron',
    alt: 'Rosenblatt, 1957–1960',
    def: 'Threshold unit $\\operatorname{sign}(\\mathbf{w}^T\\mathbf{x})$ with its learning algorithm: it corrects the weights, $\\mathbf{w} \\leftarrow \\mathbf{w} + \\eta d\\mathbf{x}$, only on misclassified patterns.',
    section: 'The Perceptron',
  },
  'convergenza-perceptron': {
    term: 'Perceptron convergence theorem',
    def: 'If the problem is linearly separable, the Perceptron algorithm finds a perfect classifier in a finite number of steps, at most $\\beta\\|\\mathbf{w}^*\\|^2/\\alpha^2$ errors.',
    section: 'The Perceptron convergence theorem',
  },
  adaline: {
    term: 'Adaline',
    alt: 'Adaptive Linear Neuron',
    def: 'The approach of Widrow and Hoff: during training the unit is linear and LMS is used (direct or gradient-based). It is the one that generalizes to MLPs.',
    section: 'Learning for a single unit',
  },
  sigmoide: {
    term: 'Logistic sigmoid',
    def: '$f_\\sigma(x) = 1/(1 + e^{-ax})$, values in $[0, 1]$: a smooth and differentiable version of the threshold. The derivative (with $a = 1$) is $f_\\sigma(1 - f_\\sigma)$.',
    section: 'Sigmoidal activation functions',
  },
  tanh: {
    term: 'Hyperbolic tangent',
    def: 'The symmetric version of the sigmoid: $2f_\\sigma(x) - 1 = \\tanh(ax/2)$, values in $[-1, +1]$. Derivative (with $a = 1$): $1 - \\tanh^2(x)$.',
    section: 'Sigmoidal activation functions',
  },
  relu: {
    term: 'ReLU',
    alt: 'Rectified Linear Unit',
    def: '$f(x) = \\max(0, x)$: the default choice in deep models. Its smooth approximation is the softplus $\\ln(1 + e^x)$.',
    section: 'Other activation functions',
  },
  mlp: {
    term: 'Multi-Layer Perceptron',
    alt: 'MLP',
    def: 'A network of units organized in layers (input, one or more hidden, output), also seen as a nested function $h(\\mathbf{x}) = f_k(\\sum_j w_{kj} f_j(\\sum_i w_{ji}x_i))$.',
    section: 'Neural networks: the Multi-Layer Perceptron',
  },
  'strato-nascosto': {
    term: 'Hidden layer',
    def: 'A layer of units between input and output: it produces an internal re-representation of the inputs (high-level features) that makes the task of the output layer easier.',
    section: 'The hidden layer as a representation',
  },
  feedforward: {
    term: 'Feedforward network',
    def: 'A network with a single direction input → output: the pattern propagates layer after layer up to $h(\\mathbf{x})$. Recurrent networks add feedback cycles.',
    section: 'Architecture and feedforward processing',
  },
  'approssimazione-universale': {
    term: 'Universal approximation',
    alt: 'Cybenko 1989, Hornik et al.',
    def: 'An MLP with a single (logistic) hidden layer and a linear output approximates arbitrarily well every continuous function on a hypercube, with enough hidden units. It is an existence theorem.',
    section: 'Universal approximation',
  },
  'credit-assignment': {
    term: 'Credit assignment',
    def: 'The problem of attributing to the hidden units their “responsibility” for the error: their desired output is not known, so the error signal is not directly measurable.',
    section: 'The credit assignment problem',
  },
  'loading-problem': {
    term: 'Loading problem',
    def: 'Given a network and a set of examples, is there a set of weights consistent with the examples? It is NP-complete (Judd, 1990).',
    section: 'The loading problem',
  },
  backpropagation: {
    term: 'Backpropagation',
    def: 'The algorithm that extends gradient descent to MLPs by computing a delta for every unit, including hidden ones; it uses only local quantities and is $O(\\#W)$.',
    section: 'The key idea: extending gradient descent',
  },
}

export default entries
