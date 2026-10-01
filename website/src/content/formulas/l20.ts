import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const recUnit: FormulaDef = {
  name: 'Unità neurale ricorrente',
  tex: r`x(t) = \tau\big(\mathbf{l}(t), x(t-1)\big) = \part{f}{f}\big(\part{w}{\mathbf{w}^T\mathbf{l}(t)} + \part{r}{\hat{w}\,x(t-1)} + \part{b}{\theta}\big), \qquad \part{z}{x(0) = 0}`,
  parts: [
    { k: 'f', sym: r`f`, desc: r`la funzione di attivazione (sigmoidale)` },
    { k: 'w', sym: r`\mathbf{w}^T\mathbf{l}(t)`, desc: r`la parte «normale»: l’input (etichetta) al tempo $t$ pesato dai pesi $\mathbf{w}$` },
    {
      k: 'r',
      sym: r`\hat{w}\,x(t-1)`,
      desc: r`la **parte nuova**: lo stato al passo precedente, riportato in ingresso dal ritardo unitario $q^{-1}$ e pesato dal **peso ricorrente** $\hat w$`,
    },
    { k: 'b', sym: r`\theta`, desc: r`il bias` },
    { k: 'z', sym: r`x(0) = 0`, desc: r`lo stato iniziale, prima di aver visto qualunque input` },
  ],
  read: r`«x di t è tau di l di t e x di t meno uno, cioè f di w trasposto l di t, più w cappello per x di t meno uno, più theta».`,
  why: r`Sostituendo $x(t-1)$ con la sua definizione, e così via all’indietro, si vede che $x(t)$ dipende da **tutti** gli input passati $\mathbf{l}(1), \dots, \mathbf{l}(t)$: lo stato è una memoria di lunghezza non fissata in anticipo.`,
}

export const stateSystem: FormulaDef = {
  name: 'Sistema a transizione di stato',
  tex: r`\begin{cases} \part{x}{\mathbf{x}(t) = \tau\big(\mathbf{x}(t-1), \mathbf{l}(t)\big)} \\ \part{y}{\mathbf{y}(t) = g\big(\mathbf{x}(t), \mathbf{l}(t)\big)} \end{cases} \qquad \mathbf{x}(0) = \mathbf{0}`,
  parts: [
    {
      k: 'x',
      sym: r`\mathbf{x}(t) = \tau(\mathbf{x}(t-1), \mathbf{l}(t))`,
      desc: r`la **funzione di transizione di stato** $\tau$: il nuovo stato dipende dallo stato precedente e dall’input corrente`,
    },
    { k: 'y', sym: r`\mathbf{y}(t) = g(\mathbf{x}(t), \mathbf{l}(t))`, desc: r`la **funzione di uscita** $g$: l’uscita dipende dallo stato (e dall’input) corrente` },
  ],
  read: r`«x di t è tau di x di t meno uno e l di t; y di t è g di x di t e l di t; x di zero è zero».`,
  why: r`Tutta l’informazione sul passato passa attraverso $\mathbf{x}(t-1)$: lo stato è una codifica, di dimensione fissa, della sotto-sequenza vista finora.`,
}

export const elman: FormulaDef = {
  name: 'Simple RNN in forma vettoriale',
  tex: r`\mathbf{x}(t) = f\big(\part{w}{W\mathbf{l}(t)} + \part{r}{\hat W\mathbf{x}(t-1)} + \part{b}{\boldsymbol{\theta}}\big)`,
  parts: [
    { k: 'w', sym: r`W\mathbf{l}(t)`, desc: r`la matrice $W$ dei pesi di input, applicata all’input corrente` },
    { k: 'r', sym: r`\hat W\mathbf{x}(t-1)`, desc: r`la matrice $\hat W$ dei pesi ricorrenti: ogni unità riceve gli stati precedenti di **tutte** le unità nascoste` },
    { k: 'b', sym: r`\boldsymbol{\theta}`, desc: r`il vettore dei bias` },
  ],
  read: r`«x di t è f di W per l di t, più W cappello per x di t meno uno, più theta».`,
  why: r`È l’equazione di una singola unità ricorrente scritta per tutte le unità nascoste insieme: la riga $i$ di $W$ e di $\hat W$ contiene i pesi $w_{ij}$ e $\hat w_{ik}$ dell’unità $i$.`,
}
