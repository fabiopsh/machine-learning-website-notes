/**
 * Titoli, etichette e riassunti delle lezioni in inglese (gli originali sono in `lessons.ts`).
 * File di soli dati, senza import: lo leggono anche `plugins/site-meta.ts` e `scripts/og.mjs`.
 */

export const partsEn: Record<string, string> = {
  I: 'Foundations',
  II: 'Linear models and neural networks',
  III: 'Validation and theory',
  IV: 'SVMs and ensembles',
  V: 'Deep learning and beyond',
}

export const lessonsEn: Record<string, { title: string; eyebrow?: string; summary: string }> = {
  '01': {
    title: 'Introduction to Machine Learning',
    eyebrow: 'Lecture 1',
    summary: 'What ML is, why it is a necessity, how the course works and the maths refresher that will be needed throughout.',
  },
  '02': {
    title: 'ML in the Master’s curricula',
    eyebrow: 'Interlude',
    summary: 'Where the course sits in the Master’s degree in Computer Science and why to pair it with Computational Mathematics.',
  },
  '03': {
    title: 'Fundamental concepts of ML',
    eyebrow: 'Lectures 2–3',
    summary: 'Data, task, model, algorithm, validation: the ingredients of an ML system, the inductive bias and loss functions.',
  },
  '04': {
    title: 'Generalization and validation',
    eyebrow: 'Lecture 4',
    summary: 'Underfitting and overfitting on polynomial fitting, the VC-bound, hold-out and K-fold, confusion matrix and ROC curve.',
  },
  '05': {
    title: 'Linear models and K-nearest neighbors',
    summary:
      'Linear regression and classification with LMS, normal equations and gradient descent, regularization; then K-NN, the Bayes classifier and the curse of dimensionality.',
  },
  '06': {
    title: 'Neural networks (part 1) — from the neuron to the MLP',
    summary:
      'From the biological neuron to the Perceptron and its convergence theorem, sigmoids, the Multi-Layer Perceptron as an adaptive basis expansion and universal approximator.',
  },
  '07': {
    title: 'Notes on backpropagation',
    summary:
      'The full derivation of backpropagation: the delta of each unit, the backward pass from the output to the hidden layers, the training loop and its linear cost.',
  },
  '08': {
    title: 'Neural networks (part 2) — training in practice',
    summary:
      'How an MLP is actually trained: initialization, on-line/batch/mini-batch, learning rate and momentum, early stopping and weight decay, Cascade Correlation, inputs and outputs, the MONK benchmark.',
  },
  '09': {
    title: 'Validation (part 1) — model selection and assessment',
    summary:
      'Why estimates go wrong: model selection versus model assessment, the random-target counterexample, grid and random search, K-fold CV, sampling and error measures.',
  },
  '10': {
    title: 'Validation (part 2) — formal schemes',
    summary:
      'Risk and empirical risk, then the rigorous schemes: model selection and model assessment with hold-out and K-fold CV, and how to combine them (TR–VL–TS, CV + test, double CV).',
  },
  '11': {
    title: 'Validation (part 3) — typical mistakes and FAQ',
    summary:
      'The most frequent mistakes: fixed epochs, early stopping inside CV, random initializations, sequential selection, the test set used to redesign, overfitted CV; which CV to choose, with examples.',
  },
  '12': {
    title: 'Statistical Learning Theory and VC-dimension',
    summary:
      'Shattering and VC-dimension (lines in the plane have 3), VC-dim and number of parameters, the VC-bound on the risk and Structural Risk Minimization on nested structures.',
  },
  '13': {
    title: 'Support Vector Machines',
    summary:
      'Maximum margin and support vectors, the quadratic problem (primal and dual), soft margin and slack variables, kernels and the kernel trick, SVMs for regression with the ε-insensitive loss.',
  },
  '14': {
    title: 'SVMs and kernels — practical aspects and a critical view',
    summary:
      'Strengths and weaknesses of SVMs, the results on the two-class problem, the critical role of C and of the kernel parameters, the myths to debunk and kernel methods as similarity measures.',
  },
  '15': {
    title: 'Bias-variance and ensembles',
    summary:
      'The expected error over training sets decomposed into variance, bias² and noise, the role of λ in the trade-off, then ensembles: committees, bagging and boosting, and a note on feature selection.',
  },
  '16': {
    title: 'Convolutional neural networks (CNN)',
    summary:
      'Local connections, shared weights, pooling and many layers: 1D and 2D convolution, the receptive field that grows with depth, LeCun’s networks, MNIST, AlexNet and ImageNet.',
  },
  '17': {
    title: 'Deep learning',
    summary:
      'Why many layers: hierarchical abstraction, no-flattening and compositionality; representation learning, autoencoders and transfer learning; distributed representations; the techniques: ReLU, clipping, batch normalization, dropout.',
  },
  '18': {
    title: 'Randomized neural networks',
    summary:
      'Randomness as a resource: Random Forests, hidden layers with random weights that are never trained, a linear readout in one step, Cover’s theorem; pros and cons of random features.',
  },
  '19': {
    title: 'Unsupervised learning — K-means and SOM',
    summary:
      'Clustering as vector quantization: Voronoi cells, quantization error, on-line and batch K-means; then Self-Organizing Maps, which preserve topology and make it possible to visualize the data.',
  },
  '20': {
    title: 'Recurrent neural networks (RNN)',
    summary:
      'Sequences and transductions, the finite memory of IDNNs and the state of recurrent units, the Simple RNN, unfolding and backpropagation through time, then transformers, Echo State Networks and recursive networks.',
  },
  '21': {
    title: 'Learning on structured data and graphs',
    summary:
      'From vectors to graphs: transductions on graphs, message passing and Deep Graph Networks (GCN, NN4G, GNN, GraphESN), the problems of depth (over-smoothing, over-squashing, heterophily) and kernels for structures.',
  },
}
