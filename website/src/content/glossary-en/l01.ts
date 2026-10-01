import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 01, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'machine-learning': {
    term: 'Machine Learning',
    def: 'Automatic learning, by a system, from **experience** (a set of examples), aimed at solving a computational task.',
    section: 'What Machine Learning is',
  },
  'prodotto-scalare': {
    term: 'Dot product',
    alt: 'inner product',
    def: '$\\mathbf{a}\\cdot\\mathbf{b}=\\sum_i a_i b_i=|\\mathbf{a}||\\mathbf{b}|\\cos\\theta$. It measures how much two vectors point in the same direction: maximal if parallel, zero if orthogonal, negative if opposite.',
    section: 'Dot product and norms',
  },
  norma: {
    term: 'Euclidean norm',
    def: '$\\|\\mathbf{x}\\|_2=\\sqrt{\\mathbf{x}^T\\mathbf{x}}=\\sqrt{\\sum_i x_i^2}$: the length of the vector, that is, its distance from the origin.',
    section: 'Dot product and norms',
  },
  tensore: {
    term: 'Tensor',
    def: 'In the simplified view of ML, a multidimensional array of numbers on a regular grid with a variable number of axes (e.g. $X_{i,j,k}$).',
    section: 'Dot product and norms',
  },
  gradiente: {
    term: 'Gradient',
    def: 'The vector of the partial derivatives $\\nabla f=(\\partial f/\\partial x_1,\\dots,\\partial f/\\partial x_n)$. It points in the direction of **steepest increase** of $f$; its norm tells how steep the slope is.',
    section: 'Partial derivatives and gradient',
  },
  'discesa-del-gradiente': {
    term: 'Gradient descent',
    def: 'The idea behind training: moving in the direction $-\\nabla f$, the one in which the error function **decreases** most rapidly.',
    section: 'Partial derivatives and gradient',
  },
  'punto-stazionario': {
    term: 'Stationary point',
    def: 'A point where the gradient is zero. It can be a local minimum, a local maximum or a saddle point: the zero gradient alone is not enough to tell.',
    section: 'Partial derivatives and gradient',
  },
  gaussiana: {
    term: 'Gaussian',
    alt: 'normal distribution',
    def: 'Density $f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/(2\\sigma^2)}$ with mean $\\mu$ and variance $\\sigma^2$. With $\\mu=0,\\ \\sigma^2=1$ it is the standard normal.',
    section: 'Probability density: the Gaussian',
  },
}

export default entries
