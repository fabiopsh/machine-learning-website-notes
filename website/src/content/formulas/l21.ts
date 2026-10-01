import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const agg: FormulaDef = {
  name: 'Message passing: la formula generale',
  tex: r`\part{h}{\mathbf{h}_v^{(l)}} = \part{a}{AGG_{W^{(l)}}}\Big(\part{L}{\mathbf{L}_v},\; \part{s}{\mathbf{h}_v^{(l-1)}},\; \part{n}{\{\mathbf{h}_u^{(l-1)} : u \in \mathcal{N}(v)\}}\Big), \qquad l = 1, \dots, L`,
  parts: [
    { k: 'h', sym: r`\mathbf{h}_v^{(l)}`, desc: r`lo **stato** del nodo $v$ allo strato (o iterazione) $l$` },
    {
      k: 'a',
      sym: r`AGG_{W^{(l)}}`,
      desc: r`aggrega (propaga) i messaggi dei vicini con un operatore **invariante per permutazione** (es. una somma) e combina le attivazioni; $W^{(l)}$ sono i parametri liberi`,
    },
    { k: 'L', sym: r`\mathbf{L}_v`, desc: r`l’etichetta del nodo $v$` },
    { k: 's', sym: r`\mathbf{h}_v^{(l-1)}`, desc: r`lo stato dello stesso nodo allo strato precedente` },
    {
      k: 'n',
      sym: r`\{\mathbf{h}_u^{(l-1)} : u \in \mathcal{N}(v)\}`,
      desc: r`l’**insieme** degli stati dei vicini $u$ di $v$ allo strato precedente; il vicinato $\mathcal{N}$ è dato dalla matrice di adiacenza $A$`,
    },
  ],
  read: r`«h di v allo strato l è l’aggregazione, con parametri W l, dell’etichetta di v, dello stato di v allo strato l meno uno e degli stati dei vicini u di v allo strato l meno uno».`,
  why: r`I vicini compaiono come **insieme**, senza ordine e senza numero fisso: per questo serve un’aggregazione che dia lo stesso risultato comunque li si elenchi. Applicata a tutti i nodi, è una visita parallela e non ordinata del grafo.`,
}

export const nn4g: FormulaDef = {
  name: 'NN4G: lo stato allo strato l',
  tex: r`h_v^{(l)} = f\left(\part{e}{\underbrace{\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)}_{\text{etichetta di } v}} + \part{c}{\underbrace{\sum_{j=1}^{l-1}\hat w_{lj}\sum_{u \in \mathcal{N}(v)}h_u^{(j)}}_{\text{contesto dai vicini, da tutti gli strati precedenti}}}\right), \quad l = 2, \dots, N`,
  parts: [
    {
      k: 'e',
      sym: r`\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)`,
      desc: r`la parte «normale»: le componenti $L_j(v)$ dell’etichetta del nodo, pesate dai pesi $\bar w_{lj}$ (con $j = 0$ per il bias)`,
    },
    {
      k: 'c',
      sym: r`\sum_{j=1}^{l-1}\hat w_{lj}\sum_{u \in \mathcal{N}(v)}h_u^{(j)}`,
      desc: r`il **contesto**: per ogni strato precedente $j$, la somma degli stati $h_u^{(j)}$ dei vicini, pesata da $\hat w_{lj}$`,
    },
  ],
  read: r`«h di v allo strato l è f della somma pesata delle componenti dell’etichetta di v, più, per ogni strato precedente j, w cappello l j per la somma degli stati dei vicini a quello strato».`,
  why: r`Il primo strato usa solo l’etichetta: $h_v^{(1)} = f\big(\sum_j \bar w_{1j}L_j(v)\big)$. Dal secondo in poi entrano gli stati **già calcolati** dei vicini: non c’è ricorsione, e il contesto si allarga di un passo a ogni strato.`,
}

export const graphEsn: FormulaDef = {
  name: 'GraphESN: l’iterazione degli stati',
  tex: r`\mathbf{h}_v^{(l)} = \tanh\left(\part{e}{\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)} + \part{c}{\sum_{u \in \mathcal{N}(v)}\part{w}{\hat W}\,\mathbf{h}_u^{(l-1)}}\right)`,
  parts: [
    { k: 'e', sym: r`\sum_{j}\bar w_{lj}\,L_j(v)`, desc: r`il contributo dell’etichetta del nodo` },
    { k: 'c', sym: r`\sum_{u \in \mathcal{N}(v)}\hat W\,\mathbf{h}_u^{(l-1)}`, desc: r`il contributo degli stati dei vicini all’iterazione precedente` },
    { k: 'w', sym: r`\hat W`, desc: r`i pesi ricorrenti del **reservoir**: casuali, non addestrati, scelti in modo che la dinamica sia contrattiva` },
  ],
  read: r`«h di v all’iterazione l è la tangente iperbolica del contributo dell’etichetta di v più la somma, sui vicini u, di W cappello per h di u all’iterazione l meno uno».`,
  why: r`Qui $l$ conta le **iterazioni** della stessa funzione, non strati diversi: si ripete fino a convergenza, e il punto fisso è l’embedding. L’uscita è $y(g) = W_{out}\,X(\mathbf{h}(g))$, con $X$ un global pooling e $W_{out}$ l’unica parte addestrata.`,
}

export const sensitivity: FormulaDef = {
  name: 'Sensibilità all’input di un nodo lontano',
  tex: r`\part{j}{\left\|\frac{\partial\mathbf{h}_v^{(L)}}{\partial\mathbf{x}_u}\right\|} \le \part{w}{\prod_{l=1}^{L}\|W^{(l)}\|}\cdot\part{a}{\big(A^L\big)_{u,v}}`,
  parts: [
    {
      k: 'j',
      sym: r`\left\|\frac{\partial\mathbf{h}_v^{(L)}}{\partial\mathbf{x}_u}\right\|`,
      desc: r`quanto lo stato finale del nodo $v$ cambia se cambiano le feature di input del nodo $u$ (lo Jacobiano)`,
    },
    { k: 'w', sym: r`\prod_{l=1}^{L}\|W^{(l)}\|`, desc: r`il prodotto delle norme dei pesi degli $L$ strati: se ogni norma è minore di 1, decresce esponenzialmente con $L$` },
    { k: 'a', sym: r`(A^L)_{u,v}`, desc: r`l’elemento $(u, v)$ della potenza $L$-esima della matrice di adiacenza: dipende dai cammini di lunghezza $L$ tra $u$ e $v$` },
  ],
  read: r`«la norma della derivata di h di v allo strato L rispetto a x di u è minore o uguale del prodotto delle norme dei W, per l’elemento u v di A alla L».`,
  why: r`È lo stesso meccanismo del vanishing gradient: un prodotto di $L$ fattori. Per questo imporre $\|W\| > 1$ impedisce che la sensibilità svanisca esponenzialmente, cioè contrasta l’over-squashing.`,
}

export const dirichlet: FormulaDef = {
  name: 'Energia di Dirichlet',
  tex: r`E(\mathbf{h}) = \part{s}{\sum_{v}\sum_{u \in \mathcal{N}_v}}\part{d}{\|\mathbf{h}_v - \mathbf{h}_u\|^2}`,
  parts: [
    { k: 's', sym: r`\sum_{v}\sum_{u \in \mathcal{N}_v}`, desc: r`somma su tutti i nodi $v$ e, per ciascuno, sui suoi vicini $u$: cioè su tutte le coppie di nodi collegati` },
    { k: 'd', sym: r`\|\mathbf{h}_v - \mathbf{h}_u\|^2`, desc: r`quanto il segnale (etichette o embedding) differisce tra due nodi vicini` },
  ],
  read: r`«E di h è la somma, su ogni nodo v e su ogni suo vicino u, della distanza al quadrato tra h di v e h di u».`,
  why: r`Se nodi vicini hanno valori simili (segnale liscio, a bassa frequenza) l’energia è bassa; se nodi vicini hanno valori diversi (alta frequenza) è alta. L’over-smoothing rende tutti gli stati simili: l’energia crolla.`,
}
