import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 04, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  overfitting: {
    term: 'Overfitting',
    def: 'The learner returns $h$ when there exists $h’\\in H$ with higher training error ($E’>E$) but lower true error ($R’<R$): the model fits the data too closely, noise included.',
    section: 'Generalization and overfitting',
  },
  underfitting: {
    term: 'Underfitting',
    def: 'The model is too simple with respect to the target function and does not capture its trend: the error is high already on the training data.',
    section: 'Effect of the degree of the polynomial',
  },
  erms: {
    term: 'RMS error',
    alt: 'Root-Mean-Square',
    def: '$E_{RMS}=\\sqrt{2E(\\mathbf{w}^*)/l}$: dividing by $l$ makes datasets of different size comparable, the square root brings the error back to the scale of the target.',
    section: 'Training and test error as $M$ varies',
  },
  regolarizzazione: {
    term: 'Regularization',
    def: 'Penalizing large weights to control the complexity of the model. It stems from the observation that overfitting produces huge coefficients.',
    section: 'Training and test error as $M$ varies',
  },
  rischio: {
    term: 'Risk',
    alt: 'true error',
    def: '$R=\\int L(d,h(\\mathbf{x}))\\,dP(\\mathbf{x},d)$: the expected error over **all** the possible data, according to the (unknown) distribution $P$.',
    section: 'The formal setting (simplified)',
  },
  'rischio-empirico': {
    term: 'Empirical risk',
    def: '$R_{emp}=\\frac1l\\sum_p (d_p-h(\\mathbf{x}_p))^2$: the error computed on the training set, the only one we can measure directly.',
    section: 'The formal setting (simplified)',
  },
  erm: {
    term: 'ERM',
    alt: 'Empirical Risk Minimization',
    def: 'Inductive principle: we choose the parameters that minimize the empirical risk $R_{emp}$, hoping that it approximates the true risk $R$.',
    section: 'The formal setting (simplified)',
  },
  'vc-dimension': {
    term: 'VC-dimension',
    def: 'A measure of the complexity of $H$, that is, of its flexibility in fitting the data (for linear models or polynomials it is related to the number of parameters).',
    section: 'VC-dimension and bound on the risk',
  },
  'vc-confidence': {
    term: 'VC-confidence',
    def: 'The term $\\varepsilon$ of the VC-bound $R\\le R_{emp}+\\varepsilon$: it grows with the VC-dimension and decreases with the number of data $l$.',
    section: 'VC-dimension and bound on the risk',
  },
  srm: {
    term: 'Structural Risk Minimization',
    alt: 'SRM',
    def: 'Minimizing the bound $R_{emp}+\\varepsilon$ instead of $R_{emp}$ alone: a trade-off between complexity (VC-dim) and accuracy on the training set.',
    section: 'VC-dimension and bound on the risk',
  },
  'model-selection': {
    term: 'Model selection',
    def: 'Estimating the generalization error of **different models** (and hyperparameters) in order to choose the best one. It returns a model.',
    section: 'The two goals of validation',
  },
  'model-assessment': {
    term: 'Model assessment',
    def: 'Having chosen the final model, estimating its prediction error on **new test data**. It returns an estimate.',
    section: 'The two goals of validation',
  },
  iperparametri: {
    term: 'Hyperparameters',
    def: 'The choices that define the model, such as the degree $M$ of the polynomial. They are not the weights found by training: they are set through model selection.',
    section: 'The two goals of validation',
  },
  'hold-out': {
    term: 'Hold-out',
    def: 'Partition of the dataset into three **disjoint** sets: training set (TR), validation set (VL) and test set (TS).',
    section: 'Hold-out',
  },
  'training-set': {
    term: 'Training set',
    alt: 'TR',
    def: 'The examples used to run the learning algorithm.',
    section: 'Hold-out',
  },
  'validation-set': {
    term: 'Validation set',
    alt: 'VL, selection set',
    def: 'The examples used to choose the best model, for example to tune the hyperparameters.',
    section: 'Hold-out',
  },
  'test-set': {
    term: 'Test set',
    alt: 'TS',
    def: 'The examples used **only** for model assessment: never to choose or adjust $h$.',
    section: 'Hold-out',
  },
  'k-fold': {
    term: 'K-fold cross-validation',
    def: 'The dataset is divided into $k$ disjoint parts; in turn each one acts as the validation set and the others as the training set; the $k$ results are combined.',
    section: 'K-fold cross-validation (preview)',
  },
  'matrice-di-confusione': {
    term: 'Confusion matrix',
    def: 'Table that crosses the actual class and the predicted class: true positives (TP), false negatives (FN), false positives (FP), true negatives (TN).',
    section: 'Confusion matrix',
  },
  accuratezza: {
    term: 'Accuracy',
    def: '$(TP+TN)/\\text{total}$: the percentage of correctly classified patterns. With imbalanced data it can be misleading.',
    section: 'Confusion matrix',
  },
  sensibilita: {
    term: 'Sensitivity',
    alt: 'recall, TP rate',
    def: '$TP/(TP+FN)$: how many of the true positives are recognized.',
    section: 'Confusion matrix',
  },
  specificita: {
    term: 'Specificity',
    alt: 'TN rate',
    def: '$TN/(FP+TN)=1-FPR$: how many of the true negatives are recognized.',
    section: 'Confusion matrix',
  },
  precisione: {
    term: 'Precision',
    def: '$TP/(TP+FP)$: how many of the predicted positives are really positive.',
    section: 'Confusion matrix',
  },
  'curva-roc': {
    term: 'ROC curve',
    def: 'The TP rate as a function of the FP rate as the decision threshold varies. The diagonal is the random classifier; the area under the curve (AUC) is 1 for the ideal one.',
    section: 'ROC curve',
  },
}

export default entries
