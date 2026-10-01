import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const convolution: FormulaDef = {
  name: tx('Operatore di convoluzione', 'Convolution operator'),
  tex: r`(f * g)(t) = \int_{-\infty}^{\infty} \part{f}{f(\tau)}\,\part{g}{g(t - \tau)}\,d\tau`,
  parts: [
    {
      k: 'f',
      sym: r`f(\tau)`,
      desc: tx(r`la funzione di cui si fa la media pesata (il segnale)`, r`the function whose weighted average is taken (the signal)`),
    },
    {
      k: 'g',
      sym: r`g(t - \tau)`,
      desc: tx(
        r`la funzione che fa da **peso**, centrata in $t$: è non nulla solo su un intervallo, quindi agisce come una **finestra scorrevole**`,
        r`the function that acts as the **weight**, centered at $t$: it is nonzero only on an interval, so it acts as a **sliding window**`,
      ),
    },
  ],
  read: tx(
    r`«f convoluto g in t è l’integrale, per tau da meno infinito a più infinito, di f di tau per g di t meno tau».`,
    r`“f convolved with g at t is the integral, for tau from minus infinity to plus infinity, of f of tau times g of t minus tau.”`,
  ),
  why: tx(
    r`Per ogni $t$ si ottiene una media pesata dei valori di $f$ attorno a $t$, con i pesi dati da $g$. Cambiando $t$ la finestra si sposta, ma i pesi restano gli stessi.`,
    r`For every $t$ one obtains a weighted average of the values of $f$ around $t$, with the weights given by $g$. As $t$ changes the window moves, but the weights stay the same.`,
  ),
}

export const conv1d: FormulaDef = {
  name: tx('Un’unità che scorre su uno stream', 'A unit sliding over a stream'),
  tex: r`\part{o}{out_t} = \sum_{i=1}^{3} \part{w}{w_i}\,\part{x}{x_{t+i-2}}`,
  parts: [
    {
      k: 'o',
      sym: r`out_t`,
      desc: tx(r`l’uscita dell’unità quando è nella posizione $t$ della sequenza`, r`the output of the unit when it is at position $t$ of the sequence`),
    },
    {
      k: 'w',
      sym: r`w_i`,
      desc: tx(
        r`i tre pesi dell’unità: **gli stessi** per ogni posizione $t$ (pesi condivisi)`,
        r`the three weights of the unit: **the same** for every position $t$ (shared weights)`,
      ),
    },
    {
      k: 'x',
      sym: r`x_{t+i-2}`,
      desc: tx(
        r`i tre input nella finestra: per $i = 1, 2, 3$ sono $x_{t-1}$, $x_t$, $x_{t+1}$`,
        r`the three inputs in the window: for $i = 1, 2, 3$ they are $x_{t-1}$, $x_t$, $x_{t+1}$`,
      ),
    },
  ],
  read: tx(
    r`«out t è la somma, per i da uno a tre, di w i per x di indice t più i meno due».`,
    r`“out t is the sum, for i from one to three, of w i times x with index t plus i minus two.”`,
  ),
  why: tx(
    r`È la versione discreta della convoluzione: la finestra è larga tre input e i pesi $w_i$ fanno la parte di $g$. L’indice $t + i - 2$ serve solo a centrare la finestra su $x_t$.`,
    r`It is the discrete version of convolution: the window is three inputs wide and the weights $w_i$ play the role of $g$. The index $t + i - 2$ only serves to center the window on $x_t$.`,
  ),
}
