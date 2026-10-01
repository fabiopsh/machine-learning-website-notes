import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const voronoi: FormulaDef = {
  name: 'Poliedro di Voronoi',
  tex: r`V_i = \{\mathbf{x} \in V \;:\; \part{a}{\|\mathbf{x} - \mathbf{w}_i\|} \le \part{b}{\|\mathbf{x} - \mathbf{w}_j\|} \;\; \part{q}{\forall j}\}`,
  parts: [
    { k: 'a', sym: r`\|\mathbf{x} - \mathbf{w}_i\|`, desc: r`la distanza di $\mathbf{x}$ dal vettore di riferimento $\mathbf{w}_i$` },
    { k: 'b', sym: r`\|\mathbf{x} - \mathbf{w}_j\|`, desc: r`la distanza di $\mathbf{x}$ da un altro vettore di riferimento $\mathbf{w}_j$` },
    { k: 'q', sym: r`\forall j`, desc: r`la condizione deve valere contro **tutti** gli altri vettori di riferimento` },
  ],
  read: r`«V i è l’insieme degli x di V tali che la distanza di x da w i è minore o uguale della distanza di x da w j, per ogni j».`,
  why: r`È la regione dei punti per cui $\mathbf{w}_i$ è il vincitore. Le regioni di tutti i vettori di riferimento ricoprono la varietà $V$: ogni $\mathbf{x}$ cade in una cella ed è descritto dal suo $\mathbf{w}_i$.`,
}

export const quantError: FormulaDef = {
  name: 'Errore di quantizzazione (versione discreta)',
  tex: r`E = \part{s}{\sum_{i=1}^{l}\sum_{j=1}^{K}} \part{d}{\|\mathbf{x}_i - \mathbf{w}_j\|^2}\,\part{w}{\delta_{winner}(i, j)}`,
  parts: [
    { k: 's', sym: r`\sum_{i=1}^{l}\sum_{j=1}^{K}`, desc: r`somma su tutti gli $l$ dati e su tutti i $K$ prototipi` },
    { k: 'd', sym: r`\|\mathbf{x}_i - \mathbf{w}_j\|^2`, desc: r`la **distorsione quadratica** tra il dato $\mathbf{x}_i$ e il prototipo $\mathbf{w}_j$` },
    {
      k: 'w',
      sym: r`\delta_{winner}(i, j)`,
      desc: r`vale 1 se $\mathbf{w}_j$ è il vincitore per $\mathbf{x}_i$ e 0 altrimenti: è la funzione caratteristica del campo recettivo di $\mathbf{w}_j$`,
    },
  ],
  read: r`«E è la somma, sui dati i e sui prototipi j, della distanza al quadrato tra x i e w j, per delta winner di i e j».`,
  why: r`Grazie a $\delta_{winner}$, di tutta la doppia somma resta un solo termine per ogni dato: la distanza al quadrato dal **proprio** prototipo vincitore.`,
}

export const kmeansOnline: FormulaDef = {
  name: 'K-means on-line',
  tex: r`\Delta\mathbf{w}_{i^*} = \part{e}{\eta}\,\part{w}{\delta_{winner}(i, i^*)}\,\part{d}{(\mathbf{x}_i - \mathbf{w}_{i^*})}`,
  parts: [
    { k: 'e', sym: r`\eta`, desc: r`il learning rate` },
    { k: 'w', sym: r`\delta_{winner}(i, i^*)`, desc: r`si aggiorna **solo il prototipo vincitore** per il dato $\mathbf{x}_i$` },
    { k: 'd', sym: r`\mathbf{x}_i - \mathbf{w}_{i^*}`, desc: r`il vettore che va dal prototipo al dato: il prototipo si sposta **verso** $\mathbf{x}_i$` },
  ],
  read: r`«delta w i star è eta per delta winner per x i meno w i star».`,
  why: r`La derivata di $\|\mathbf{x}_i - \mathbf{w}_j\|^2$ rispetto a $\mathbf{w}_j$ è $-2(\mathbf{x}_i - \mathbf{w}_j)$: muoversi nel verso opposto al gradiente significa avvicinare $\mathbf{w}_j$ a $\mathbf{x}_i$.`,
}

export const somUpdate: FormulaDef = {
  name: 'Fase cooperativa della SOM',
  tex: r`\mathbf{w}_i(t+1) = \mathbf{w}_i(t) + \part{e}{\eta(t)}\,\part{h}{h_{i,i^*(\mathbf{x})}(t)}\,\part{d}{\big[\mathbf{x} - \mathbf{w}_i(t)\big]}`,
  parts: [
    { k: 'e', sym: r`\eta(t)`, desc: r`il learning rate, che diminuisce con le iterazioni` },
    {
      k: 'h',
      sym: r`h_{i,i^*(\mathbf{x})}(t)`,
      desc: r`la **funzione di vicinato**: vale 1 per il vincitore $i^*$ e decresce con la distanza **sulla mappa** tra l’unità $i$ e il vincitore`,
    },
    { k: 'd', sym: r`\mathbf{x} - \mathbf{w}_i(t)`, desc: r`lo spostamento verso l’input, come nel K-means` },
  ],
  read: r`«w i al tempo t più uno è w i al tempo t, più eta di t per h di i e i star per x meno w i di t».`,
  why: r`È la regola del K-means on-line con un fattore in più, $h$: non si muove solo il vincitore ma anche i suoi vicini sulla griglia, tanto meno quanto più sono lontani.`,
}

export const neighborhood: FormulaDef = {
  name: 'Vicinato gaussiano',
  tex: r`h_{i,i^*}(t) = \exp\left(-\frac{\part{r}{\|\mathbf{r}_i - \mathbf{r}_{i^*}\|^2}}{2\part{s}{\sigma^2(t)}}\right)`,
  parts: [
    { k: 'r', sym: r`\|\mathbf{r}_i - \mathbf{r}_{i^*}\|^2`, desc: r`la distanza al quadrato tra le **coordinate sulla griglia** dell’unità $i$ e del vincitore $i^*$ (non tra i loro pesi)` },
    { k: 's', sym: r`\sigma(t)`, desc: r`la larghezza (raggio) del vicinato: ampia all’inizio, poi si restringe` },
  ],
  read: r`«h di i e i star è l’esponenziale di meno la distanza al quadrato tra r i e r i star, diviso due sigma quadro di t».`,
  why: r`Una gaussiana centrata sul vincitore: 1 per il vincitore, vicina a 0 per le unità lontane sulla mappa.`,
}
