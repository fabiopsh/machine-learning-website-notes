import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 16, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  cnn: {
    term: 'Convolutional network',
    alt: 'CNN, ConvNet',
    def: 'A not fully connected feedforward network based on four ingredients: **local connections**, **shared weights**, **pooling** and **many layers**. A historical instance of a deep network.',
    section: 'The CNN as a whole',
  },
  'campo-recettivo': {
    term: 'Local receptive field',
    def: 'The small region of the input (for example $3 \\times 3$ pixels) to which a unit is connected. In the higher layers the units are indirectly connected to larger and larger areas of the image.',
    section: 'The problem: recognizing characters',
  },
  'weight-sharing': {
    term: 'Weight sharing',
    def: 'Different units use the same weights, that is, they apply the same operation to different parts of the input: it reduces the free parameters while maintaining a complex connectivity.',
    section: 'The problem: recognizing characters',
  },
  convoluzione: {
    term: 'Convolution',
    def: 'A weighted average of a function $f$ with weights given by a sliding function $g$: $(f * g)(t) = \\int f(\\tau)\\,g(t-\\tau)\\,d\\tau$. In a network it is a sliding window of shared weights.',
    section: 'Convolution',
  },
  tdnn: {
    term: 'Time-Delay Neural Network',
    def: 'A network in which the same unit (an adaptive filter with shared weights) slides over a sequence of inputs: 1D convolution.',
    section: '1D convolution: one unit over a stream',
  },
  'kernel-convoluzione': {
    term: 'Kernel (convolution)',
    alt: 'filter',
    def: 'The weights of the unit that slides over the image, for example $3 \\times 3$: it is its local receptive field, a filter trained to detect a pattern.',
    section: '2D convolution',
  },
  stride: {
    term: 'Stride',
    def: 'How many pixels the kernel moves at each step. With a stride greater than 1 the kernel skips pixels: this is a subsampling and the feature map shrinks.',
    section: '2D convolution',
  },
  padding: {
    term: 'Padding',
    def: 'The border added around the image to handle the positions where the kernel goes beyond the edges.',
    section: '2D convolution',
  },
  'feature-map': {
    term: 'Feature map',
    def: 'The output of a filter that has scanned the whole image: the features extracted by the filter, position by position.',
    section: '2D convolution',
  },
  'invarianza-traslazione': {
    term: 'Translation invariance',
    def: 'The features are detected regardless of position, because the same filter is applied over the whole image.',
    section: 'A network of “filters”',
  },
  pooling: {
    term: 'Pooling',
    alt: 'max pooling',
    def: 'Reduction of the feature map: one value (the average or, in **max pooling**, the maximum) for each rectangular set of pixels. It helps invariance to small translations.',
    section: 'Pooling',
  },
  'data-augmentation': {
    term: 'Data augmentation',
    def: 'Obtaining many more training examples by deforming the available ones (for example the images): a way of controlling complexity.',
    section: 'MNIST',
  },
  'capsule-network': {
    term: 'Capsule Network',
    def: 'Networks with “capsules”, groups of neurons that indicate whether an entity is present and its pose parameters; instead of max pooling they use a routing mechanism.',
    section: 'Modern CNNs and GPUs',
  },
}

export default entries
