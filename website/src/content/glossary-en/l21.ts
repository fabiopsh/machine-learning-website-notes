import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 21, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  dgn: {
    term: 'Deep Graph Network',
    alt: 'DGN',
    def: 'The general framework of neural networks for graphs (GNN, GCN, NN4G, GraphESN…), based on message passing between the nodes, iterated over several layers or iterations.',
    section: 'Deep Graph Networks',
  },
  'grafo-etichettato': {
    term: 'Labeled graph',
    def: 'A graph in which every node $v$ has a vector label $\\mathbf{l}(v)$; the edges too can have a label and be directed, and there can be cycles. $A$ is the adjacency matrix.',
    section: 'The graphs considered',
  },
  'message-passing': {
    term: 'Message passing',
    def: 'The nodes exchange messages with their neighbors, aggregate them with a permutation-invariant function and update their own state. By iterating, information spreads over the whole graph.',
    section: 'Message passing',
  },
  'global-pooling': {
    term: 'Global pooling',
    def: 'Permutation-invariant aggregation (sum or mean) of the node representations, to obtain an output for the whole graph.',
    section: 'Message passing',
  },
  gcn: {
    term: 'Graph Convolutional Network',
    alt: 'GCN',
    def: 'Convolutional network for graphs: every iteration of message passing is a new layer, $\\mathbf{h}^{(l)} = \\text{ReLU}(\\hat A\\,\\mathbf{h}^{(l-1)}W^{(l)})$ with $\\hat A$ the degree-normalized adjacency matrix.',
    section: 'The general formula',
  },
  nn4g: {
    term: 'NN4G',
    alt: 'Neural Network for Graphs',
    def: 'Layered network for graphs built incrementally (one unit at a time, in the style of Cascade Correlation): the state of a node at a layer uses its label and the states of the neighbors in all the previous layers.',
    section: 'NN4G and GCN: iterations as layers',
  },
  graphesn: {
    term: 'GraphESN',
    def: 'Extension of Echo State Networks to graphs: an untrained recursive message passing (random, contractive reservoir) iterated up to a fixed point, followed by global pooling and a trained linear readout.',
    section: 'GNN and GraphESN: recursive approach',
  },
  'over-smoothing': {
    term: 'Over-smoothing',
    def: 'In the deep layers the node representations collapse and all become similar, because message passing acts as a diffusion.',
    section: 'The problems of depth: the “over-*”',
  },
  'over-squashing': {
    term: 'Over-squashing',
    def: 'Bottleneck: the receptive field grows exponentially with depth, but it has to be compressed into a fixed-size embedding; the sensitivity to distant nodes decreases exponentially.',
    section: 'The problems of depth: the “over-*”',
  },
  eterofilia: {
    term: 'Heterophily',
    alt: 'and homophily',
    def: 'In a **homophilic** graph neighboring nodes mostly share the same class; in a **heterophilic** one the nodes of the same class are far apart, and predictions based on the immediate neighbors are misleading.',
    section: 'The problems of depth: the “over-*”',
  },
  'energia-di-dirichlet': {
    term: 'Dirichlet energy',
    def: '$E(\\mathbf{h}) = \\sum_v\\sum_{u \\in \\mathcal{N}_v}\\|\\mathbf{h}_v - \\mathbf{h}_u\\|^2$: it measures how much the signal varies between neighboring nodes. A smooth (low-frequency) signal has low energy.',
    section: 'Tools for the analysis',
  },
  'kernel-di-convoluzione': {
    term: 'Convolution kernel',
    def: 'Kernel for structured objects: the objects are decomposed into substructures and the kernel is defined by combining kernels between the substructures.',
    section: 'Other approaches: kernels for structures',
  },
}

export default entries
