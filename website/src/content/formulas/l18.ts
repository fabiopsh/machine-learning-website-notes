import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const readout: FormulaDef = {
  name: 'Apprendimento del readout (con regolarizzazione L²)',
  tex: r`\part{w}{\mathbf{W}^{out}} = (\part{h}{\mathbf{H}}^T\mathbf{H} + \part{l}{\lambda\mathbf{I}})^{-1}\mathbf{H}^T\part{d}{\mathbf{d}}`,
  parts: [
    { k: 'w', sym: r`\mathbf{W}^{out}`, desc: r`i pesi del **readout**: gli unici che vengono appresi` },
    {
      k: 'h',
      sym: r`\mathbf{H} = f(\mathbf{W}\mathbf{X})`,
      desc: r`le attivazioni delle unità nascoste per tutti i pattern di training: si calcolano una volta sola, perché $\mathbf{W}$ è fissa`,
    },
    {
      k: 'l',
      sym: r`\lambda\mathbf{I}`,
      desc: r`la regolarizzazione $L^2$ (ridge regression), utile per l’alto numero di unità; con $\lambda = 0$ si torna a $\mathbf{W}^{out} = \mathbf{H}^+\mathbf{d}$`,
    },
    { k: 'd', sym: r`\mathbf{d}`, desc: r`i target degli $l$ esempi` },
  ],
  read: r`«W out è l’inversa di H trasposto H più lambda I, per H trasposto, per d».`,
  why: r`È la stessa soluzione in forma chiusa dei modelli lineari (equazioni normali e ridge regression), con $\mathbf{H}$ al posto della matrice degli input: per il readout le attivazioni nascoste **sono** gli input.`,
}

export const output: FormulaDef = {
  name: 'Uso della rete',
  tex: r`\mathbf{o}(\mathbf{x}) = \part{w}{\mathbf{W}^{out}}\, \part{f}{f}(\part{r}{\mathbf{W}}\mathbf{x})`,
  parts: [
    { k: 'r', sym: r`\mathbf{W}`, desc: r`la matrice dei pesi dello strato nascosto: **casuale e fissa**` },
    { k: 'f', sym: r`f`, desc: r`la funzione non lineare delle unità nascoste; $\mathbf{h} = f(\mathbf{W}\mathbf{x})$ sono le attivazioni nascoste` },
    { k: 'w', sym: r`\mathbf{W}^{out}`, desc: r`la matrice dei pesi del readout: **addestrata**` },
  ],
  read: r`«o di x è W out per f di W x».`,
  why: r`È un’espansione lineare in basi, $\sum_j w^{out}_j \phi_j(\mathbf{x})$, in cui le basi $\phi_j(\mathbf{x}) = f(\mathbf{w}_j\mathbf{x})$ sono estratte a caso invece di essere scelte a mano o apprese.`,
}
