import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const convolution: FormulaDef = {
  name: 'Operatore di convoluzione',
  tex: r`(f * g)(t) = \int_{-\infty}^{\infty} \part{f}{f(\tau)}\,\part{g}{g(t - \tau)}\,d\tau`,
  parts: [
    { k: 'f', sym: r`f(\tau)`, desc: r`la funzione di cui si fa la media pesata (il segnale)` },
    {
      k: 'g',
      sym: r`g(t - \tau)`,
      desc: r`la funzione che fa da **peso**, centrata in $t$: è non nulla solo su un intervallo, quindi agisce come una **finestra scorrevole**`,
    },
  ],
  read: r`«f convoluto g in t è l’integrale, per tau da meno infinito a più infinito, di f di tau per g di t meno tau».`,
  why: r`Per ogni $t$ si ottiene una media pesata dei valori di $f$ attorno a $t$, con i pesi dati da $g$. Cambiando $t$ la finestra si sposta, ma i pesi restano gli stessi.`,
}

export const conv1d: FormulaDef = {
  name: 'Un’unità che scorre su uno stream',
  tex: r`\part{o}{out_t} = \sum_{i=1}^{3} \part{w}{w_i}\,\part{x}{x_{t+i-2}}`,
  parts: [
    { k: 'o', sym: r`out_t`, desc: r`l’uscita dell’unità quando è nella posizione $t$ della sequenza` },
    { k: 'w', sym: r`w_i`, desc: r`i tre pesi dell’unità: **gli stessi** per ogni posizione $t$ (pesi condivisi)` },
    {
      k: 'x',
      sym: r`x_{t+i-2}`,
      desc: r`i tre input nella finestra: per $i = 1, 2, 3$ sono $x_{t-1}$, $x_t$, $x_{t+1}$`,
    },
  ],
  read: r`«out t è la somma, per i da uno a tre, di w i per x di indice t più i meno due».`,
  why: r`È la versione discreta della convoluzione: la finestra è larga tre input e i pesi $w_i$ fanno la parte di $g$. L’indice $t + i - 2$ serve solo a centrare la finestra su $x_t$.`,
}
