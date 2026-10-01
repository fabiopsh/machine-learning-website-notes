import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 13, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  svm: {
    term: 'Support Vector Machine',
    alt: 'SVM',
    def: 'A linear machine that, among the separating hyperplanes, chooses the maximum-margin one: it implements an SRM. With soft margin and kernels it handles noisy data and nonlinear boundaries.',
    section: 'Part I — SVM for binary classification',
  },
  margine: {
    term: 'Margin of separation',
    def: 'Twice the distance between the hyperplane and the closest point, when the hyperplane is equidistant from the two classes: $\\rho = 2/\\|\\mathbf{w}\\|$ in canonical form.',
    section: 'The margin of separation',
  },
  'iperpiano-ottimo': {
    term: 'Optimal hyperplane',
    def: 'The separating hyperplane that maximizes the margin, that is, minimizes $\\|\\mathbf{w}\\|$; it is unique.',
    section: 'The margin of separation',
  },
  'support-vector': {
    term: 'Support vector',
    def: 'A pattern that satisfies the constraint with equality, $d_i(\\mathbf{w}^T\\mathbf{x}_i + b) = 1$ (with slack, $1 - \\xi_i$): it has multiplier $\\alpha_i > 0$ and the support vectors alone determine the solution.',
    section: 'Canonical representation and support vectors',
  },
  'soft-margin': {
    term: 'Soft margin',
    def: 'An SVM that allows points inside the margin or on the wrong side, paying for their slack variables with weight $C$: wider margin and tolerance to noise.',
    section: 'Soft margin SVM: allowing errors',
  },
  'variabili-slack': {
    term: 'Slack variables',
    def: 'Variables $\\xi_i \\ge 0$ that relax the constraints, $d_i(\\mathbf{w}^T\\mathbf{x}_i + b) \\ge 1 - \\xi_i$: 0 outside the margin, between 0 and 1 inside the margin, above 1 for an error.',
    section: 'Slack variables',
  },
  kernel: {
    term: 'Kernel',
    alt: 'inner product kernel',
    def: 'A symmetric function $k(\\mathbf{x}_i, \\mathbf{x}) = \\Phi^T(\\mathbf{x}_i)\\Phi(\\mathbf{x})$ that computes the dot product in the feature space without computing the mapping $\\Phi$.',
    section: 'The kernel trick',
  },
  'kernel-trick': {
    term: 'Kernel trick',
    def: 'Replacing every dot product between patterns (in the dual and in the decision) with a kernel: one works in very high-dimensional or infinite feature spaces without ever building them.',
    section: 'The kernel trick',
  },
  'matrice-kernel': {
    term: 'Kernel matrix',
    alt: 'Gram matrix',
    def: 'The symmetric $N \\times N$ matrix $K_{ij} = k(\\mathbf{x}_i, \\mathbf{x}_j)$ of the dot products between the training patterns in the feature space.',
    section: 'The kernel matrix',
  },
  mercer: {
    term: 'Mercer’s theorem',
    def: 'A function is a valid kernel (a dot product in some space) if it produces positive semidefinite kernel matrices, that is, with non-negative eigenvalues.',
    section: 'The kernel matrix',
  },
}

export default entries
