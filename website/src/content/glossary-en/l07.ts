import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 07, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'regola-della-catena': {
    term: 'Chain rule',
    def: '$\\frac{\\partial f}{\\partial x} = \\frac{\\partial f}{\\partial g}\\cdot\\frac{\\partial g}{\\partial x}$: the derivative of a composite function decomposes into simpler derivatives. It is the tool behind all of backpropagation.',
    section: 'Tools from differential calculus',
  },
  'regola-delta-generalizzata': {
    term: 'Generalized delta rule',
    def: 'The delta rule extended to all the units of a network: $\\Delta w_{tu} = \\eta\\,\\delta_t\\,o_u$, with the delta of the hidden units obtained by propagating backward that of the outputs.',
    section: 'The problem',
  },
  'delta-unita': {
    term: 'Delta of a unit',
    def: '$\\delta_t = -\\partial E_p/\\partial net_t$. For an output $\\delta_k = (d_k - o_k)f\'_k(net_k)$; for a hidden unit $\\delta_j = (\\sum_k \\delta_k w_{kj}) f\'_j(net_j)$.',
    section: 'The gradient for a generic weight',
  },
  'fattorizzazione-delta': {
    term: 'Factorization of the deltas',
    def: 'Each $\\delta_t$ is computed only once and is reused for all the weights of the unit: the cost of backpropagation is proportional to the number of weights, not to its square.',
    section: 'Properties and interpretation',
  },
}

export default entries
