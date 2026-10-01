import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const voronoi: FormulaDef = {
  name: tx('Poliedro di Voronoi', 'Voronoi polyhedron'),
  tex: r`V_i = \{\mathbf{x} \in V \;:\; \part{a}{\|\mathbf{x} - \mathbf{w}_i\|} \le \part{b}{\|\mathbf{x} - \mathbf{w}_j\|} \;\; \part{q}{\forall j}\}`,
  parts: [
    {
      k: 'a',
      sym: r`\|\mathbf{x} - \mathbf{w}_i\|`,
      desc: tx(r`la distanza di $\mathbf{x}$ dal vettore di riferimento $\mathbf{w}_i$`, r`the distance of $\mathbf{x}$ from the reference vector $\mathbf{w}_i$`),
    },
    {
      k: 'b',
      sym: r`\|\mathbf{x} - \mathbf{w}_j\|`,
      desc: tx(
        r`la distanza di $\mathbf{x}$ da un altro vettore di riferimento $\mathbf{w}_j$`,
        r`the distance of $\mathbf{x}$ from another reference vector $\mathbf{w}_j$`,
      ),
    },
    {
      k: 'q',
      sym: r`\forall j`,
      desc: tx(
        r`la condizione deve valere contro **tutti** gli altri vettori di riferimento`,
        r`the condition must hold against **all** the other reference vectors`,
      ),
    },
  ],
  read: tx(
    r`«V i è l’insieme degli x di V tali che la distanza di x da w i è minore o uguale della distanza di x da w j, per ogni j».`,
    r`“V i is the set of the x in V such that the distance of x from w i is less than or equal to the distance of x from w j, for every j.”`,
  ),
  why: tx(
    r`È la regione dei punti per cui $\mathbf{w}_i$ è il vincitore. Le regioni di tutti i vettori di riferimento ricoprono la varietà $V$: ogni $\mathbf{x}$ cade in una cella ed è descritto dal suo $\mathbf{w}_i$.`,
    r`It is the region of the points for which $\mathbf{w}_i$ is the winner. The regions of all the reference vectors cover the manifold $V$: each $\mathbf{x}$ falls in one cell and is described by its $\mathbf{w}_i$.`,
  ),
}

export const quantError: FormulaDef = {
  name: tx('Errore di quantizzazione (versione discreta)', 'Quantization error (discrete form)'),
  tex: r`E = \part{s}{\sum_{i=1}^{l}\sum_{j=1}^{K}} \part{d}{\|\mathbf{x}_i - \mathbf{w}_j\|^2}\,\part{w}{\delta_{winner}(i, j)}`,
  parts: [
    {
      k: 's',
      sym: r`\sum_{i=1}^{l}\sum_{j=1}^{K}`,
      desc: tx(r`somma su tutti gli $l$ dati e su tutti i $K$ prototipi`, r`sum over all the $l$ data points and over all the $K$ prototypes`),
    },
    {
      k: 'd',
      sym: r`\|\mathbf{x}_i - \mathbf{w}_j\|^2`,
      desc: tx(
        r`la **distorsione quadratica** tra il dato $\mathbf{x}_i$ e il prototipo $\mathbf{w}_j$`,
        r`the **squared distortion** between the data point $\mathbf{x}_i$ and the prototype $\mathbf{w}_j$`,
      ),
    },
    {
      k: 'w',
      sym: r`\delta_{winner}(i, j)`,
      desc: tx(
        r`vale 1 se $\mathbf{w}_j$ è il vincitore per $\mathbf{x}_i$ e 0 altrimenti: è la funzione caratteristica del campo recettivo di $\mathbf{w}_j$`,
        r`it is 1 if $\mathbf{w}_j$ is the winner for $\mathbf{x}_i$ and 0 otherwise: it is the characteristic function of the receptive field of $\mathbf{w}_j$`,
      ),
    },
  ],
  read: tx(
    r`«E è la somma, sui dati i e sui prototipi j, della distanza al quadrato tra x i e w j, per delta winner di i e j».`,
    r`“E is the sum, over the data points i and the prototypes j, of the squared distance between x i and w j, times delta winner of i and j.”`,
  ),
  why: tx(
    r`Grazie a $\delta_{winner}$, di tutta la doppia somma resta un solo termine per ogni dato: la distanza al quadrato dal **proprio** prototipo vincitore.`,
    r`Thanks to $\delta_{winner}$, of the whole double sum only one term is left for each data point: the squared distance from **its own** winning prototype.`,
  ),
}

export const kmeansOnline: FormulaDef = {
  name: tx('K-means on-line', 'On-line K-means'),
  tex: r`\Delta\mathbf{w}_{i^*} = \part{e}{\eta}\,\part{w}{\delta_{winner}(i, i^*)}\,\part{d}{(\mathbf{x}_i - \mathbf{w}_{i^*})}`,
  parts: [
    { k: 'e', sym: r`\eta`, desc: tx(r`il learning rate`, r`the learning rate`) },
    {
      k: 'w',
      sym: r`\delta_{winner}(i, i^*)`,
      desc: tx(
        r`si aggiorna **solo il prototipo vincitore** per il dato $\mathbf{x}_i$`,
        r`**only the winning prototype** for the data point $\mathbf{x}_i$ is updated`,
      ),
    },
    {
      k: 'd',
      sym: r`\mathbf{x}_i - \mathbf{w}_{i^*}`,
      desc: tx(
        r`il vettore che va dal prototipo al dato: il prototipo si sposta **verso** $\mathbf{x}_i$`,
        r`the vector that goes from the prototype to the data point: the prototype moves **toward** $\mathbf{x}_i$`,
      ),
    },
  ],
  read: tx(r`«delta w i star è eta per delta winner per x i meno w i star».`, r`“delta w i star is eta times delta winner times x i minus w i star.”`),
  why: tx(
    r`La derivata di $\|\mathbf{x}_i - \mathbf{w}_j\|^2$ rispetto a $\mathbf{w}_j$ è $-2(\mathbf{x}_i - \mathbf{w}_j)$: muoversi nel verso opposto al gradiente significa avvicinare $\mathbf{w}_j$ a $\mathbf{x}_i$.`,
    r`The derivative of $\|\mathbf{x}_i - \mathbf{w}_j\|^2$ with respect to $\mathbf{w}_j$ is $-2(\mathbf{x}_i - \mathbf{w}_j)$: moving in the direction opposite to the gradient means bringing $\mathbf{w}_j$ closer to $\mathbf{x}_i$.`,
  ),
}

export const somUpdate: FormulaDef = {
  name: tx('Fase cooperativa della SOM', 'Cooperative stage of the SOM'),
  tex: r`\mathbf{w}_i(t+1) = \mathbf{w}_i(t) + \part{e}{\eta(t)}\,\part{h}{h_{i,i^*(\mathbf{x})}(t)}\,\part{d}{\big[\mathbf{x} - \mathbf{w}_i(t)\big]}`,
  parts: [
    {
      k: 'e',
      sym: r`\eta(t)`,
      desc: tx(r`il learning rate, che diminuisce con le iterazioni`, r`the learning rate, which decreases with the iterations`),
    },
    {
      k: 'h',
      sym: r`h_{i,i^*(\mathbf{x})}(t)`,
      desc: tx(
        r`la **funzione di vicinato**: vale 1 per il vincitore $i^*$ e decresce con la distanza **sulla mappa** tra l’unità $i$ e il vincitore`,
        r`the **neighborhood function**: it is 1 for the winner $i^*$ and decreases with the distance **on the map** between unit $i$ and the winner`,
      ),
    },
    {
      k: 'd',
      sym: r`\mathbf{x} - \mathbf{w}_i(t)`,
      desc: tx(r`lo spostamento verso l’input, come nel K-means`, r`the displacement toward the input, as in K-means`),
    },
  ],
  read: tx(
    r`«w i al tempo t più uno è w i al tempo t, più eta di t per h di i e i star per x meno w i di t».`,
    r`“w i at time t plus one is w i at time t, plus eta of t times h of i and i star times x minus w i of t.”`,
  ),
  why: tx(
    r`È la regola del K-means on-line con un fattore in più, $h$: non si muove solo il vincitore ma anche i suoi vicini sulla griglia, tanto meno quanto più sono lontani.`,
    r`It is the on-line K-means rule with one more factor, $h$: not only the winner moves but also its neighbors on the grid, the less so the farther away they are.`,
  ),
}

export const neighborhood: FormulaDef = {
  name: tx('Vicinato gaussiano', 'Gaussian neighborhood'),
  tex: r`h_{i,i^*}(t) = \exp\left(-\frac{\part{r}{\|\mathbf{r}_i - \mathbf{r}_{i^*}\|^2}}{2\part{s}{\sigma^2(t)}}\right)`,
  parts: [
    {
      k: 'r',
      sym: r`\|\mathbf{r}_i - \mathbf{r}_{i^*}\|^2`,
      desc: tx(
        r`la distanza al quadrato tra le **coordinate sulla griglia** dell’unità $i$ e del vincitore $i^*$ (non tra i loro pesi)`,
        r`the squared distance between the **coordinates on the grid** of unit $i$ and of the winner $i^*$ (not between their weights)`,
      ),
    },
    {
      k: 's',
      sym: r`\sigma(t)`,
      desc: tx(
        r`la larghezza (raggio) del vicinato: ampia all’inizio, poi si restringe`,
        r`the width (radius) of the neighborhood: wide at the beginning, then it shrinks`,
      ),
    },
  ],
  read: tx(
    r`«h di i e i star è l’esponenziale di meno la distanza al quadrato tra r i e r i star, diviso due sigma quadro di t».`,
    r`“h of i and i star is the exponential of minus the squared distance between r i and r i star, divided by two sigma squared of t.”`,
  ),
  why: tx(
    r`Una gaussiana centrata sul vincitore: 1 per il vincitore, vicina a 0 per le unità lontane sulla mappa.`,
    r`A Gaussian centered on the winner: 1 for the winner, close to 0 for the units far away on the map.`,
  ),
}
