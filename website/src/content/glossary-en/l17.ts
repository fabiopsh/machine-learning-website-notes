import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 17, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'deep-learning': {
    term: 'Deep learning',
    def: 'Models composed of multiple layers of nonlinear processing that learn representations of the data with multiple levels of abstraction: a hierarchical, sparse and distributed representation.',
    section: 'What deep learning is',
  },
  shallow: {
    term: 'Shallow model',
    def: 'A model with few layers (for example a network with fewer than 3 layers), as opposed to deep models.',
    section: 'The general framework',
  },
  'feature-learning': {
    term: 'Feature learning',
    def: 'Learning the representations of the data (hierarchical feature extraction) instead of designing them by hand (feature engineering).',
    section: 'The conceptual ingredients: hierarchical abstraction',
  },
  'no-flattening': {
    term: 'No-flattening',
    def: 'A function represented compactly by a deep architecture may require a much larger architecture (even exponentially) if the depth is insufficient. It concerns efficiency, not expressiveness.',
    section: 'An example from logic circuits',
  },
  composizionalita: {
    term: 'Compositionality',
    def: 'The simple concepts represented in one layer are used as **primitives** by the next layer to represent more complex concepts, without learning all the combinations explicitly.',
    section: 'Why: compositionality',
  },
  'representation-learning': {
    term: 'Representation learning',
    def: 'Methods that allow a machine to be fed with raw data and to automatically discover the representations needed for detection or classification.',
    section: 'Representation learning',
  },
  'pre-training': {
    term: 'Pre-training',
    alt: 'greedy layer-wise unsupervised pretraining',
    def: 'Unsupervised learning, layer by layer, used to initialize a deep network before supervised training: a good initialization and a form of regularization.',
    section: 'Pre-training',
  },
  autoencoder: {
    term: 'Autoencoder',
    def: 'A network trained to copy its own input to its output: an **encoder** $\\mathbf{h} = f(\\mathbf{x})$ produces the code, a **decoder** the reconstruction $\\mathbf{r} = g(\\mathbf{h})$. Undercomplete or overcomplete depending on the size of the hidden layer.',
    section: 'Autoencoder',
  },
  'fine-tuning': {
    term: 'Fine-tuning',
    def: 'The final training of all the parameters of an already initialized network (with pre-training or from a pre-trained model) with respect to the supervised criterion.',
    section: 'The pre-training algorithm (Bengio)',
  },
  'transfer-learning': {
    term: 'Transfer learning',
    def: 'Using the representation discovered by one model to improve another: multi-task learning, domain adaptation, reuse of pre-trained models.',
    section: 'Transfer learning',
  },
  'rappresentazione-distribuita': {
    term: 'Distributed representation',
    def: 'A representation in which the features are not mutually exclusive: each concept is the set of the activations of all the units. With $n$ features with $k$ values it describes $k^n$ concepts, against the $n$ of a one-hot one.',
    section: 'Distributed representations',
  },
  'word-embedding': {
    term: 'Word embedding',
    alt: 'e.g. word2vec',
    def: 'A distributed representation of words learned from the data: words that appear in similar contexts, hence with similar meaning, end up close together.',
    section: 'Shared attributes: disentangling the concepts',
  },
  'double-descent': {
    term: 'Double descent',
    def: 'As the size of the model grows the test error first goes down, then goes back up (the classical U), and then goes down again beyond the interpolation threshold, where the training error is almost zero.',
    section: 'Other insights and recent results',
  },
  'lottery-ticket': {
    term: 'Lottery ticket hypothesis',
    def: 'The good performance of a large network depends on the lucky initialization of one or more sub-networks: large networks contain exponentially more of them.',
    section: 'Other insights and recent results',
  },
  'vanishing-gradient': {
    term: 'Vanishing gradient',
    alt: 'and exploding gradient',
    def: 'Backpropagated through many layers, the gradient shrinks exponentially (small weights, derivatives of the sigmoids) or grows exponentially (large weights, exploding gradient).',
    section: 'The vanishing gradient',
  },
  'gradient-clipping': {
    term: 'Gradient clipping',
    def: 'If the norm of the gradient exceeds a threshold $v$, it is rescaled to norm $v$ while keeping its direction: it prevents the “cliffs” of the cost function from catapulting the weights far away.',
    section: 'Gradient clipping',
  },
  'batch-normalization': {
    term: 'Batch normalization',
    def: 'Normalization of the activations of each layer to zero mean and unit variance, with the statistics of the mini-batch: it regularizes and makes learning faster.',
    section: 'Batch normalization',
  },
  dropout: {
    term: 'Dropout',
    def: 'During training a subset of units is removed at random (a different mask for each example): an implicit bagging of an exponential number of sub-networks that share the weights, with a regularizing effect.',
    section: 'Dropout',
  },
  gan: {
    term: 'Generative Adversarial Network',
    alt: 'GAN',
    def: 'Two competing networks: one generates candidates, the other evaluates them, telling the real ones from the generated ones.',
    section: 'Adversarial learning',
  },
}

export default entries
