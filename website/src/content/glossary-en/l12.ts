import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 12, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  dicotomia: {
    term: 'Dichotomy',
    def: 'One of the $2^N$ possible labelings ($-1$ or $+1$) of $N$ points. It is represented in $H$ if some hypothesis of $H$ realizes it.',
    section: 'Shattering',
  },
  shattering: {
    term: 'Shattering',
    def: '$H$ shatters a set of points if it represents all of its dichotomies, that is, it classifies the points with no errors for every possible labeling.',
    section: 'Shattering',
  },
  'rischio-garantito': {
    term: 'Guaranteed risk',
    def: 'The right-hand side of the VC-bound, $R_{emp} + \\varepsilon$: with probability at least $1-\\delta$ the true risk does not exceed it.',
    section: 'The analytical bound on the risk',
  },
}

export default entries
