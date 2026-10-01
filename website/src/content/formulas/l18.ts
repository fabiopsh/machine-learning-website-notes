import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const readout: FormulaDef = {
  name: tx('Apprendimento del readout (con regolarizzazione L²)', 'Learning the readout (with L² regularization)'),
  tex: r`\part{w}{\mathbf{W}^{out}} = (\part{h}{\mathbf{H}}^T\mathbf{H} + \part{l}{\lambda\mathbf{I}})^{-1}\mathbf{H}^T\part{d}{\mathbf{d}}`,
  parts: [
    {
      k: 'w',
      sym: r`\mathbf{W}^{out}`,
      desc: tx(r`i pesi del **readout**: gli unici che vengono appresi`, r`the weights of the **readout**: the only ones that are learned`),
    },
    {
      k: 'h',
      sym: r`\mathbf{H} = f(\mathbf{W}\mathbf{X})`,
      desc: tx(
        r`le attivazioni delle unità nascoste per tutti i pattern di training: si calcolano una volta sola, perché $\mathbf{W}$ è fissa`,
        r`the activations of the hidden units for all the training patterns: they are computed only once, because $\mathbf{W}$ is fixed`,
      ),
    },
    {
      k: 'l',
      sym: r`\lambda\mathbf{I}`,
      desc: tx(
        r`la regolarizzazione $L^2$ (ridge regression), utile per l’alto numero di unità; con $\lambda = 0$ si torna a $\mathbf{W}^{out} = \mathbf{H}^+\mathbf{d}$`,
        r`the $L^2$ regularization (ridge regression), useful because of the high number of units; with $\lambda = 0$ we are back to $\mathbf{W}^{out} = \mathbf{H}^+\mathbf{d}$`,
      ),
    },
    { k: 'd', sym: r`\mathbf{d}`, desc: tx(r`i target degli $l$ esempi`, r`the targets of the $l$ examples`) },
  ],
  read: tx(
    r`«W out è l’inversa di H trasposto H più lambda I, per H trasposto, per d».`,
    r`“W out is the inverse of H transpose H plus lambda I, times H transpose, times d.”`,
  ),
  why: tx(
    r`È la stessa soluzione in forma chiusa dei modelli lineari (equazioni normali e ridge regression), con $\mathbf{H}$ al posto della matrice degli input: per il readout le attivazioni nascoste **sono** gli input.`,
    r`It is the same closed-form solution as for linear models (normal equations and ridge regression), with $\mathbf{H}$ in place of the input matrix: for the readout the hidden activations **are** the inputs.`,
  ),
}

export const output: FormulaDef = {
  name: tx('Uso della rete', 'Using the network'),
  tex: r`\mathbf{o}(\mathbf{x}) = \part{w}{\mathbf{W}^{out}}\, \part{f}{f}(\part{r}{\mathbf{W}}\mathbf{x})`,
  parts: [
    {
      k: 'r',
      sym: r`\mathbf{W}`,
      desc: tx(r`la matrice dei pesi dello strato nascosto: **casuale e fissa**`, r`the weight matrix of the hidden layer: **random and fixed**`),
    },
    {
      k: 'f',
      sym: r`f`,
      desc: tx(
        r`la funzione non lineare delle unità nascoste; $\mathbf{h} = f(\mathbf{W}\mathbf{x})$ sono le attivazioni nascoste`,
        r`the non-linear function of the hidden units; $\mathbf{h} = f(\mathbf{W}\mathbf{x})$ are the hidden activations`,
      ),
    },
    {
      k: 'w',
      sym: r`\mathbf{W}^{out}`,
      desc: tx(r`la matrice dei pesi del readout: **addestrata**`, r`the weight matrix of the readout: **trained**`),
    },
  ],
  read: tx(r`«o di x è W out per f di W x».`, r`“o of x is W out times f of W x.”`),
  why: tx(
    r`È un’espansione lineare in basi, $\sum_j w^{out}_j \phi_j(\mathbf{x})$, in cui le basi $\phi_j(\mathbf{x}) = f(\mathbf{w}_j\mathbf{x})$ sono estratte a caso invece di essere scelte a mano o apprese.`,
    r`It is a linear basis expansion, $\sum_j w^{out}_j \phi_j(\mathbf{x})$, in which the bases $\phi_j(\mathbf{x}) = f(\mathbf{w}_j\mathbf{x})$ are drawn at random instead of being chosen by hand or learned.`,
  ),
}
