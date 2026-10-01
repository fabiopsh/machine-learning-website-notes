import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 14, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'metodi-kernel': {
    term: 'Kernel methods',
    alt: 'kernelization',
    def: 'Models in which every dot product or similarity measure is replaced with a kernel: they work in an implicit feature space by changing only the kernel, also on strings, trees and graphs.',
    section: 'Kernel methods',
  },
}

export default entries
