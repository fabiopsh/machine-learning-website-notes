import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 03, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  pattern: {
    term: 'Pattern',
    alt: 'example, instance, sample',
    def: 'A row $\\mathbf{x}$ of the dataset. $\\mathbf{x}_p$ is the $p$-th pattern; the dataset contains $l$ of them.',
    section: 'Data',
  },
  feature: {
    term: 'Feature',
    alt: 'attribute, component',
    def: 'One of the $n$ properties that describe every example: $x_i$ is the $i$-th feature of $\\mathbf{x}$.',
    section: 'Data',
  },
  'one-hot': {
    term: 'One-hot encoding',
    alt: '1-of-k',
    def: 'Every symbol becomes a vector with a single 1, e.g. $A=(1,0,0)$, $B=(0,1,0)$, $C=(0,0,1)$: all the symbols turn out to be **equidistant**.',
    section: 'Encoding categorical variables',
  },
  rumore: {
    term: 'Noise',
    def: 'External factors added to the informative signal, due to the randomness of the measurements and not to the underlying law (e.g. Gaussian noise).',
    section: 'Noise, outliers and feature selection',
  },
  outlier: {
    term: 'Outlier',
    def: 'An unusual value, inconsistent with most of the observations. It is removed in preprocessing, or **robust** methods are used.',
    section: 'Noise, outliers and feature selection',
  },
  'feature-selection': {
    term: 'Feature selection',
    def: 'Selection of a small number of informative features, for an optimal representation of the input.',
    section: 'Noise, outliers and feature selection',
  },
  supervisionato: {
    term: 'Supervised learning',
    def: 'Learning from **labeled** examples $\\langle\\mathbf{x},d\\rangle$, with the target $d$ provided by a “teacher”, to find a hypothesis $h$ that approximates $f$ and generalizes.',
    section: 'Supervised learning',
  },
  'non-supervisionato': {
    term: 'Unsupervised learning',
    def: 'No teacher: only unlabeled data $\\langle\\mathbf{x}\\rangle$. Typical goals: clustering, dimensionality reduction, density estimation.',
    section: 'Unsupervised learning',
  },
  classificazione: {
    term: 'Classification',
    def: 'Supervised task with a **categorical** target: $f(\\mathbf{x})\\in\\{1,\\dots,K\\}$. Geometrically, it divides the input space into decision regions.',
    section: 'Classification',
  },
  'concept-learning': {
    term: 'Concept learning',
    def: 'Binary classification: learning a Boolean function (true/false, $0/1$, $-1/+1$).',
    section: 'Classification',
  },
  ltu: {
    term: 'Linear Threshold Unit',
    alt: 'LTU',
    def: 'The classifier $h(\\mathbf{x})=\\operatorname{sign}(\\mathbf{w}^T\\mathbf{x}+w_0)$: it separates the input space with a hyperplane.',
    section: 'Classification',
  },
  regressione: {
    term: 'Regression',
    def: 'Supervised task with a **numerical** target: estimation of a real-valued function from noisy samples $(\\mathbf{x}, f(\\mathbf{x})+\\text{noise})$.',
    section: 'Regression',
  },
  clustering: {
    term: 'Clustering',
    def: 'Partition of the data into subsets of “similar” elements, each represented by a centroid (prototype).',
    section: 'Unsupervised learning',
  },
  'self-supervised': {
    term: 'Self-supervised learning',
    def: 'Supervised learning with labels generated automatically from the structure of the data (e.g. predicting the next word). It is at the basis of the pre-training of LLMs.',
    section: 'Other paradigms',
  },
  'reinforcement-learning': {
    term: 'Reinforcement learning',
    def: 'Learning with a “critic” that says right/wrong: a **policy** on how to act is learned; every action has an effect on the environment, which responds with feedback.',
    section: 'Other paradigms',
  },
  'funzione-target': {
    term: 'Target function',
    def: 'The true, unknown function $f$ that we want to approximate. It is known only at the points of the examples.',
    section: 'Model',
  },
  ipotesi: {
    term: 'Hypothesis',
    def: 'A proposed function $h$, believed to be similar to the target function $f$.',
    section: 'Model',
  },
  'spazio-delle-ipotesi': {
    term: 'Hypothesis space',
    def: 'The set $H$ of all the hypotheses that the learning algorithm can, in principle, produce. It is the model that defines it.',
    section: 'Model',
  },
  'no-free-lunch': {
    term: 'No Free Lunch',
    def: 'There is no universally best learning method: if it wins on some problems, it must lose on others.',
    section: 'Model',
  },
  'bias-induttivo': {
    term: 'Inductive bias',
    def: 'The assumptions about the nature of the target function — constraints on the model (**language bias**) or preferences in the search (**search bias**). Without bias there is no generalization.',
    section: 'Inductive bias',
  },
  'language-bias': {
    term: 'Language bias',
    def: 'Inductive bias given by constraints on the hypothesis space $H$: what the model can express is restricted.',
    section: 'Inductive bias',
  },
  'search-bias': {
    term: 'Search bias',
    def: 'Inductive bias entrusted to the search strategy of the algorithm, which favors certain solutions over others. It is the one preferred in modern ML.',
    section: 'Language bias or search bias?',
  },
  'version-space': {
    term: 'Version space',
    def: 'The subset $VS_{H,TR}$ of the hypotheses of $H$ **consistent** with all the training examples, that is, with $h(\\mathbf{x})=d(\\mathbf{x})$ on every example.',
    section: 'Restricting the space: conjunctive rules',
  },
  'lookup-table': {
    term: 'Lookup table',
    def: 'A rote learner: it memorizes the examples and classifies only inputs already seen (otherwise “no answer”). No bias, no generalization.',
    section: 'Learning Boolean functions: an ill-posed problem',
  },
  'unbiased-learner': {
    term: 'Unbiased learner',
    def: 'A learner with $H=\\mathcal{P}(X)$, able to express every concept. It classifies unambiguously only the training examples: it cannot generalize.',
    section: 'The unbiased learner',
  },
  loss: {
    term: 'Loss function',
    def: '$L(h_\\mathbf{w}(\\mathbf{x}),d)$: it measures, on the single pattern, the distance between the output of the model and the target. A high value indicates a poor approximation.',
    section: 'Tasks and loss functions',
  },
  errore: {
    term: 'Error (risk, loss)',
    def: 'Expected value of the loss, for example the average over the $l$ examples: $E(\\mathbf{w})=\\frac1l\\sum_p L(h_\\mathbf{w}(\\mathbf{x}_p),d_p)$. It is the objective function of training.',
    section: 'Tasks and loss functions',
  },
  mse: {
    term: 'Mean Squared Error',
    alt: 'MSE',
    def: 'Average of the squared errors $(d_p-h_\\mathbf{w}(\\mathbf{x}_p))^2$ over the dataset: the typical loss of regression.',
    section: 'Regression: squared error',
  },
  generalizzazione: {
    term: 'Generalization',
    def: 'How accurately the model predicts on **new data**, never seen before. It is the fundamental concept of the course; it is estimated with a held-out test set.',
    section: 'Generalization and validation',
  },
}

export default entries
