import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const recUnit: FormulaDef = {
  name: tx('Unità neurale ricorrente', 'Recurrent neural unit'),
  tex: r`x(t) = \tau\big(\mathbf{l}(t), x(t-1)\big) = \part{f}{f}\big(\part{w}{\mathbf{w}^T\mathbf{l}(t)} + \part{r}{\hat{w}\,x(t-1)} + \part{b}{\theta}\big), \qquad \part{z}{x(0) = 0}`,
  parts: [
    { k: 'f', sym: r`f`, desc: tx(r`la funzione di attivazione (sigmoidale)`, r`the activation function (sigmoidal)`) },
    {
      k: 'w',
      sym: r`\mathbf{w}^T\mathbf{l}(t)`,
      desc: tx(
        r`la parte «normale»: l’input (etichetta) al tempo $t$ pesato dai pesi $\mathbf{w}$`,
        r`the “ordinary” part: the input (label) at time $t$ weighted by the weights $\mathbf{w}$`,
      ),
    },
    {
      k: 'r',
      sym: r`\hat{w}\,x(t-1)`,
      desc: tx(
        r`la **parte nuova**: lo stato al passo precedente, riportato in ingresso dal ritardo unitario $q^{-1}$ e pesato dal **peso ricorrente** $\hat w$`,
        r`the **new part**: the state at the previous step, fed back as input by the unit delay $q^{-1}$ and weighted by the **recurrent weight** $\hat w$`,
      ),
    },
    { k: 'b', sym: r`\theta`, desc: tx(r`il bias`, r`the bias`) },
    { k: 'z', sym: r`x(0) = 0`, desc: tx(r`lo stato iniziale, prima di aver visto qualunque input`, r`the initial state, before any input has been seen`) },
  ],
  read: tx(
    r`«x di t è tau di l di t e x di t meno uno, cioè f di w trasposto l di t, più w cappello per x di t meno uno, più theta».`,
    r`“x of t is tau of l of t and x of t minus one, that is, f of w transpose l of t, plus w hat times x of t minus one, plus theta.”`,
  ),
  why: tx(
    r`Sostituendo $x(t-1)$ con la sua definizione, e così via all’indietro, si vede che $x(t)$ dipende da **tutti** gli input passati $\mathbf{l}(1), \dots, \mathbf{l}(t)$: lo stato è una memoria di lunghezza non fissata in anticipo.`,
    r`Replacing $x(t-1)$ with its definition, and so on backward, we see that $x(t)$ depends on **all** the past inputs $\mathbf{l}(1), \dots, \mathbf{l}(t)$: the state is a memory whose length is not fixed in advance.`,
  ),
}

export const stateSystem: FormulaDef = {
  name: tx('Sistema a transizione di stato', 'State transition system'),
  tex: r`\begin{cases} \part{x}{\mathbf{x}(t) = \tau\big(\mathbf{x}(t-1), \mathbf{l}(t)\big)} \\ \part{y}{\mathbf{y}(t) = g\big(\mathbf{x}(t), \mathbf{l}(t)\big)} \end{cases} \qquad \mathbf{x}(0) = \mathbf{0}`,
  parts: [
    {
      k: 'x',
      sym: r`\mathbf{x}(t) = \tau(\mathbf{x}(t-1), \mathbf{l}(t))`,
      desc: tx(
        r`la **funzione di transizione di stato** $\tau$: il nuovo stato dipende dallo stato precedente e dall’input corrente`,
        r`the **state transition function** $\tau$: the new state depends on the previous state and on the current input`,
      ),
    },
    {
      k: 'y',
      sym: r`\mathbf{y}(t) = g(\mathbf{x}(t), \mathbf{l}(t))`,
      desc: tx(
        r`la **funzione di uscita** $g$: l’uscita dipende dallo stato (e dall’input) corrente`,
        r`the **output function** $g$: the output depends on the current state (and input)`,
      ),
    },
  ],
  read: tx(
    r`«x di t è tau di x di t meno uno e l di t; y di t è g di x di t e l di t; x di zero è zero».`,
    r`“x of t is tau of x of t minus one and l of t; y of t is g of x of t and l of t; x of zero is zero.”`,
  ),
  why: tx(
    r`Tutta l’informazione sul passato passa attraverso $\mathbf{x}(t-1)$: lo stato è una codifica, di dimensione fissa, della sotto-sequenza vista finora.`,
    r`All the information about the past goes through $\mathbf{x}(t-1)$: the state is a fixed-size encoding of the subsequence seen so far.`,
  ),
}

export const elman: FormulaDef = {
  name: tx('Simple RNN in forma vettoriale', 'Simple RNN in vector form'),
  tex: r`\mathbf{x}(t) = f\big(\part{w}{W\mathbf{l}(t)} + \part{r}{\hat W\mathbf{x}(t-1)} + \part{b}{\boldsymbol{\theta}}\big)`,
  parts: [
    {
      k: 'w',
      sym: r`W\mathbf{l}(t)`,
      desc: tx(r`la matrice $W$ dei pesi di input, applicata all’input corrente`, r`the matrix $W$ of the input weights, applied to the current input`),
    },
    {
      k: 'r',
      sym: r`\hat W\mathbf{x}(t-1)`,
      desc: tx(
        r`la matrice $\hat W$ dei pesi ricorrenti: ogni unità riceve gli stati precedenti di **tutte** le unità nascoste`,
        r`the matrix $\hat W$ of the recurrent weights: each unit receives the previous states of **all** the hidden units`,
      ),
    },
    { k: 'b', sym: r`\boldsymbol{\theta}`, desc: tx(r`il vettore dei bias`, r`the bias vector`) },
  ],
  read: tx(
    r`«x di t è f di W per l di t, più W cappello per x di t meno uno, più theta».`,
    r`“x of t is f of W times l of t, plus W hat times x of t minus one, plus theta.”`,
  ),
  why: tx(
    r`È l’equazione di una singola unità ricorrente scritta per tutte le unità nascoste insieme: la riga $i$ di $W$ e di $\hat W$ contiene i pesi $w_{ij}$ e $\hat w_{ik}$ dell’unità $i$.`,
    r`It is the equation of a single recurrent unit written for all the hidden units together: row $i$ of $W$ and of $\hat W$ contains the weights $w_{ij}$ and $\hat w_{ik}$ of unit $i$.`,
  ),
}
