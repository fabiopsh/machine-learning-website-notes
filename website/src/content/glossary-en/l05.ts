import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 05, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  lms: {
    term: 'Least Mean Squares',
    alt: 'LMS, least squares',
    def: 'The weights are chosen to minimize the sum (or the mean) of the squared residuals $\\sum_p (y_p - h_\\mathbf{w}(\\mathbf{x}_p))^2$. It is the standard approach to overdetermined systems.',
    section: 'Learning via Least Mean Squares',
  },
  'bias-intercetta': {
    term: 'Bias (intercept)',
    alt: 'intercept, offset',
    def: 'The weight $w_0$ of the linear model, also called threshold or offset. With the constant component $x_0 = 1$ it enters the dot product $\\mathbf{x}^T\\mathbf{w}$.',
    section: 'Notation for multidimensional inputs',
  },
  'confine-di-decisione': {
    term: 'Decision boundary',
    def: 'The hyperplane $\\mathbf{w}^T\\mathbf{x} + w_0 = 0$ that separates the region classified as positive from the negative one; in two dimensions it is a straight line. $\\mathbf{w}$ is orthogonal to it.',
    section: 'Hyperplanes and decision regions',
  },
  'equazioni-normali': {
    term: 'Normal equations',
    def: '$(X^TX)\\,\\mathbf{w} = X^T\\mathbf{y}$: they are obtained by setting the gradient of the squared error to zero. If $X^TX$ is nonsingular the solution is $\\mathbf{w} = (X^TX)^{-1}X^T\\mathbf{y}$.',
    section: 'Direct approach: the normal equations',
  },
  pseudoinversa: {
    term: 'Moore-Penrose pseudoinverse',
    def: 'It generalizes the inverse to non-invertible matrices: $\\mathbf{w} = X^+\\mathbf{y}$ is the minimum-norm least-squares solution. It is computed with the SVD: $X^+ = V\\Sigma^+U^T$.',
    section: 'Direct approach: the normal equations',
  },
  'learning-rate': {
    term: 'Learning rate',
    alt: 'step size',
    def: 'The coefficient $\\eta$ of the rule $\\mathbf{w}_{new} = \\mathbf{w} + \\eta\\,\\Delta\\mathbf{w}$: it governs the length of the step, that is, the trade-off between speed and stability of the descent.',
    section: 'The learning rule (delta rule)',
  },
  epoca: {
    term: 'Epoch',
    def: 'One complete pass over the whole training set. In the batch version the weights are updated once per epoch.',
    section: 'Batch and on-line',
  },
  'online-sgd': {
    term: 'On-line (stochastic) descent',
    alt: 'SGD',
    def: 'Variant of gradient descent in which the weights are updated after **every** pattern, with the gradient of the single example. It makes progress with every example but requires a smaller $\\eta$.',
    section: 'Batch and on-line',
  },
  'delta-rule': {
    term: 'Delta rule',
    alt: 'Widrow-Hoff rule',
    def: '$\\Delta w_j \\propto \\sum_p \\delta_p\\, x_{p,j}$ with $\\delta_p = y_p - \\mathbf{x}_p^T\\mathbf{w}$: every weight changes in proportion to the error and to its input. It is an error-correction rule.',
    section: 'Interpretation: an error-correction rule',
  },
  'separabilita-lineare': {
    term: 'Linear separability',
    def: 'Two sets of points are linearly separable if a hyperplane (a straight line in the plane) separates them completely. XOR on four points is not.',
    section: 'Classification: linear separability',
  },
  'basis-expansion': {
    term: 'Linear basis expansion',
    alt: 'LBE',
    def: '$h_\\mathbf{w}(\\mathbf{x}) = \\sum_k w_k\\,\\phi_k(\\mathbf{x})$ with fixed transformations $\\phi_k$ of the input: a model that is nonlinear in $\\mathbf{x}$ but **linear in the parameters**, trainable with the same least squares.',
    section: 'Linear Basis Expansion (LBE)',
  },
  'curse-of-dimensionality': {
    term: 'Curse of dimensionality',
    def: 'The volume of the space grows so fast with the dimension that the available data become sparse: neighborhoods are no longer local and a huge amount of data is needed.',
    section: 'The curse of dimensionality',
  },
  ridge: {
    term: 'Ridge regression',
    alt: 'Tikhonov regularization',
    def: 'The penalty $\\lambda\\|\\mathbf{w}\\|^2$ is added to the loss, which favors small weights and smoother models. Direct solution: $\\mathbf{w} = (X^TX + \\lambda I)^{-1}X^T\\mathbf{y}$.',
    section: 'Ridge regression (Tikhonov regularization)',
  },
  'weight-decay': {
    term: 'Weight decay',
    def: 'The gradient rule of ridge regression, $\\mathbf{w}_{new} = \\mathbf{w} + \\eta\\,\\Delta\\mathbf{w} - 2\\lambda\\mathbf{w}$: at every step each weight shrinks by a fraction of its value.',
    section: 'Solution',
  },
  lasso: {
    term: 'Lasso',
    def: 'Regularization with the $L_1$ norm ($\\lambda\\sum_j |w_j|$): it tends to drive some weights exactly to zero, a form of feature selection. The loss is not differentiable at zero.',
    section: 'Other regularization techniques',
  },
  'eager-lazy': {
    term: 'Eager and lazy learning',
    def: '**Eager**: an explicit hypothesis is built from the training data (e.g. the linear model). **Lazy**: the data are stored and an ad hoc hypothesis is built only when a test point arrives (e.g. K-NN).',
    section: 'Eager and lazy learning',
  },
  'k-nn': {
    term: 'K-nearest neighbors',
    alt: 'K-NN',
    def: 'It classifies a point with the majority vote (or the mean, for regression) of the $k$ nearest training examples according to a distance $d$. No model to train: it is a lazy and local method.',
    section: 'K-nearest neighbors',
  },
  voronoi: {
    term: 'Voronoi diagram',
    def: 'Partition of the plane into cells, one per pattern: every cell contains the points that are nearer to that pattern than to any other. 1-NN assigns to every cell the label of its pattern.',
    section: 'K-nearest neighbors',
  },
  bayes: {
    term: 'Bayes optimal classifier',
    alt: 'Bayes rate',
    def: '$h(\\mathbf{x}) = \\arg\\max_v P(v \\mid \\mathbf{x})$, computable if the density of the data is known. Its error (Bayes rate) is the minimum achievable.',
    section: 'The Bayes optimal classifier',
  },
}

export default entries
