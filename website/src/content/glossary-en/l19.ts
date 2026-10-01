import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 19, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  centroide: {
    term: 'Centroid',
    alt: 'prototype, codevector',
    def: 'The vector that represents a cluster (also called prototype, reference vector, cluster center). The set of centroids is the **codebook**.',
    section: 'Clustering',
  },
  'quantizzazione-vettoriale': {
    term: 'Vector quantization',
    alt: 'VQ',
    def: 'Encoding the data $\\mathbf{x} \\in V$ with a finite set of reference vectors: each $\\mathbf{x}$ is described by the **winning** vector, the one with minimum distortion. The space ends up divided into Voronoi polyhedra.',
    section: 'Vector quantization',
  },
  'errore-di-quantizzazione': {
    term: 'Quantization error',
    alt: 'distortion',
    def: 'The mean squared distortion between the data and their winning prototypes, $E = \\sum_i\\sum_j \\|\\mathbf{x}_i - \\mathbf{w}_j\\|^2\\,\\delta_{winner}(i,j)$: the loss of vector quantization.',
    section: 'The quantization error',
  },
  'k-means': {
    term: 'K-means',
    def: 'Clustering algorithm that minimizes the quantization error: on-line, it moves the winning prototype toward the data point; in batch, it alternates assignment to the nearest center and recomputation of the centers as means.',
    section: 'K-means',
  },
  som: {
    term: 'Self-Organizing Map',
    alt: 'SOM, Kohonen map',
    def: 'Network of neurons arranged on a low-dimensional grid, each with a weight of the same dimension as the input: it learns a map that **preserves the topology**, by updating the winner and its neighbors on the grid.',
    section: 'Self-Organizing Map',
  },
  'apprendimento-competitivo': {
    term: 'Competitive learning',
    def: 'Adaptive process in which the neurons compete for a data point and the winner learns the most: they gradually become specialized on different categories of inputs.',
    section: 'Competitive learning and biological inspiration',
  },
  'funzione-di-vicinato': {
    term: 'Neighborhood function',
    alt: 'neighborhood kernel',
    def: 'The function $h_{i,i^*}$ that decreases with the distance **on the map** between unit $i$ and the winner, for example $\\exp(-\\|\\mathbf{r}_i - \\mathbf{r}_{i^*}\\|^2 / 2\\sigma^2)$: it decides how much the neighbors are updated.',
    section: 'Cooperative stage',
  },
  'u-matrix': {
    term: 'U-matrix',
    def: 'Visualization of the distances between the prototypes of adjacent units of a SOM: dark colors = large distances (boundaries between clusters), light colors = small distances (clusters).',
    section: 'Visualization',
  },
}

export default entries
