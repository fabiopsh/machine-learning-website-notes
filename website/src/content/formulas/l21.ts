import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const agg: FormulaDef = {
  name: tx('Message passing: la formula generale', 'Message passing: the general formula'),
  tex: r`\part{h}{\mathbf{h}_v^{(l)}} = \part{a}{AGG_{W^{(l)}}}\Big(\part{L}{\mathbf{L}_v},\; \part{s}{\mathbf{h}_v^{(l-1)}},\; \part{n}{\{\mathbf{h}_u^{(l-1)} : u \in \mathcal{N}(v)\}}\Big), \qquad l = 1, \dots, L`,
  parts: [
    {
      k: 'h',
      sym: r`\mathbf{h}_v^{(l)}`,
      desc: tx(r`lo **stato** del nodo $v$ allo strato (o iterazione) $l$`, r`the **state** of node $v$ at layer (or iteration) $l$`),
    },
    {
      k: 'a',
      sym: r`AGG_{W^{(l)}}`,
      desc: tx(
        r`aggrega (propaga) i messaggi dei vicini con un operatore **invariante per permutazione** (es. una somma) e combina le attivazioni; $W^{(l)}$ sono i parametri liberi`,
        r`aggregates (propagates) the messages of the neighbors with a **permutation-invariant** operator (e.g. a sum) and combines the activations; $W^{(l)}$ are the free parameters`,
      ),
    },
    { k: 'L', sym: r`\mathbf{L}_v`, desc: tx(r`l’etichetta del nodo $v$`, r`the label of node $v$`) },
    {
      k: 's',
      sym: r`\mathbf{h}_v^{(l-1)}`,
      desc: tx(r`lo stato dello stesso nodo allo strato precedente`, r`the state of the same node at the previous layer`),
    },
    {
      k: 'n',
      sym: r`\{\mathbf{h}_u^{(l-1)} : u \in \mathcal{N}(v)\}`,
      desc: tx(
        r`l’**insieme** degli stati dei vicini $u$ di $v$ allo strato precedente; il vicinato $\mathcal{N}$ è dato dalla matrice di adiacenza $A$`,
        r`the **set** of the states of the neighbors $u$ of $v$ at the previous layer; the neighborhood $\mathcal{N}$ is given by the adjacency matrix $A$`,
      ),
    },
  ],
  read: tx(
    r`«h di v allo strato l è l’aggregazione, con parametri W l, dell’etichetta di v, dello stato di v allo strato l meno uno e degli stati dei vicini u di v allo strato l meno uno».`,
    r`“h of v at layer l is the aggregation, with parameters W l, of the label of v, of the state of v at layer l minus one and of the states of the neighbors u of v at layer l minus one.”`,
  ),
  why: tx(
    r`I vicini compaiono come **insieme**, senza ordine e senza numero fisso: per questo serve un’aggregazione che dia lo stesso risultato comunque li si elenchi. Applicata a tutti i nodi, è una visita parallela e non ordinata del grafo.`,
    r`The neighbors appear as a **set**, with no order and no fixed number: this is why we need an aggregation that gives the same result however they are listed. Applied to all the nodes, it is a parallel and unordered visit of the graph.`,
  ),
}

export const nn4g: FormulaDef = {
  name: tx('NN4G: lo stato allo strato l', 'NN4G: the state at layer l'),
  tex: tx(
    r`h_v^{(l)} = f\left(\part{e}{\underbrace{\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)}_{\text{etichetta di } v}} + \part{c}{\underbrace{\sum_{j=1}^{l-1}\hat w_{lj}\sum_{u \in \mathcal{N}(v)}h_u^{(j)}}_{\text{contesto dai vicini, da tutti gli strati precedenti}}}\right), \quad l = 2, \dots, N`,
    r`h_v^{(l)} = f\left(\part{e}{\underbrace{\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)}_{\text{label of } v}} + \part{c}{\underbrace{\sum_{j=1}^{l-1}\hat w_{lj}\sum_{u \in \mathcal{N}(v)}h_u^{(j)}}_{\text{context from the neighbors, from all previous layers}}}\right), \quad l = 2, \dots, N`,
  ),
  parts: [
    {
      k: 'e',
      sym: r`\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)`,
      desc: tx(
        r`la parte «normale»: le componenti $L_j(v)$ dell’etichetta del nodo, pesate dai pesi $\bar w_{lj}$ (con $j = 0$ per il bias)`,
        r`the “normal” part: the components $L_j(v)$ of the label of the node, weighted by the weights $\bar w_{lj}$ (with $j = 0$ for the bias)`,
      ),
    },
    {
      k: 'c',
      sym: r`\sum_{j=1}^{l-1}\hat w_{lj}\sum_{u \in \mathcal{N}(v)}h_u^{(j)}`,
      desc: tx(
        r`il **contesto**: per ogni strato precedente $j$, la somma degli stati $h_u^{(j)}$ dei vicini, pesata da $\hat w_{lj}$`,
        r`the **context**: for every previous layer $j$, the sum of the states $h_u^{(j)}$ of the neighbors, weighted by $\hat w_{lj}$`,
      ),
    },
  ],
  read: tx(
    r`«h di v allo strato l è f della somma pesata delle componenti dell’etichetta di v, più, per ogni strato precedente j, w cappello l j per la somma degli stati dei vicini a quello strato».`,
    r`“h of v at layer l is f of the weighted sum of the components of the label of v, plus, for every previous layer j, w hat l j times the sum of the states of the neighbors at that layer.”`,
  ),
  why: tx(
    r`Il primo strato usa solo l’etichetta: $h_v^{(1)} = f\big(\sum_j \bar w_{1j}L_j(v)\big)$. Dal secondo in poi entrano gli stati **già calcolati** dei vicini: non c’è ricorsione, e il contesto si allarga di un passo a ogni strato.`,
    r`The first layer uses only the label: $h_v^{(1)} = f\big(\sum_j \bar w_{1j}L_j(v)\big)$. From the second onward the **already computed** states of the neighbors come in: there is no recursion, and the context widens by one step at every layer.`,
  ),
}

export const graphEsn: FormulaDef = {
  name: tx('GraphESN: l’iterazione degli stati', 'GraphESN: the iteration of the states'),
  tex: r`\mathbf{h}_v^{(l)} = \tanh\left(\part{e}{\sum_{j=0}^{|L_v|}\bar w_{lj}\,L_j(v)} + \part{c}{\sum_{u \in \mathcal{N}(v)}\part{w}{\hat W}\,\mathbf{h}_u^{(l-1)}}\right)`,
  parts: [
    {
      k: 'e',
      sym: r`\sum_{j}\bar w_{lj}\,L_j(v)`,
      desc: tx(r`il contributo dell’etichetta del nodo`, r`the contribution of the label of the node`),
    },
    {
      k: 'c',
      sym: r`\sum_{u \in \mathcal{N}(v)}\hat W\,\mathbf{h}_u^{(l-1)}`,
      desc: tx(
        r`il contributo degli stati dei vicini all’iterazione precedente`,
        r`the contribution of the states of the neighbors at the previous iteration`,
      ),
    },
    {
      k: 'w',
      sym: r`\hat W`,
      desc: tx(
        r`i pesi ricorrenti del **reservoir**: casuali, non addestrati, scelti in modo che la dinamica sia contrattiva`,
        r`the recurrent weights of the **reservoir**: random, untrained, chosen so that the dynamics is contractive`,
      ),
    },
  ],
  read: tx(
    r`«h di v all’iterazione l è la tangente iperbolica del contributo dell’etichetta di v più la somma, sui vicini u, di W cappello per h di u all’iterazione l meno uno».`,
    r`“h of v at iteration l is the hyperbolic tangent of the contribution of the label of v plus the sum, over the neighbors u, of W hat times h of u at iteration l minus one.”`,
  ),
  why: tx(
    r`Qui $l$ conta le **iterazioni** della stessa funzione, non strati diversi: si ripete fino a convergenza, e il punto fisso è l’embedding. L’uscita è $y(g) = W_{out}\,X(\mathbf{h}(g))$, con $X$ un global pooling e $W_{out}$ l’unica parte addestrata.`,
    r`Here $l$ counts the **iterations** of the same function, not different layers: it is repeated until convergence, and the fixed point is the embedding. The output is $y(g) = W_{out}\,X(\mathbf{h}(g))$, with $X$ a global pooling and $W_{out}$ the only trained part.`,
  ),
}

export const sensitivity: FormulaDef = {
  name: tx('Sensibilità all’input di un nodo lontano', 'Sensitivity to the input of a distant node'),
  tex: r`\part{j}{\left\|\frac{\partial\mathbf{h}_v^{(L)}}{\partial\mathbf{x}_u}\right\|} \le \part{w}{\prod_{l=1}^{L}\|W^{(l)}\|}\cdot\part{a}{\big(A^L\big)_{u,v}}`,
  parts: [
    {
      k: 'j',
      sym: r`\left\|\frac{\partial\mathbf{h}_v^{(L)}}{\partial\mathbf{x}_u}\right\|`,
      desc: tx(
        r`quanto lo stato finale del nodo $v$ cambia se cambiano le feature di input del nodo $u$ (lo Jacobiano)`,
        r`how much the final state of node $v$ changes if the input features of node $u$ change (the Jacobian)`,
      ),
    },
    {
      k: 'w',
      sym: r`\prod_{l=1}^{L}\|W^{(l)}\|`,
      desc: tx(
        r`il prodotto delle norme dei pesi degli $L$ strati: se ogni norma è minore di 1, decresce esponenzialmente con $L$`,
        r`the product of the norms of the weights of the $L$ layers: if every norm is smaller than 1, it decreases exponentially with $L$`,
      ),
    },
    {
      k: 'a',
      sym: r`(A^L)_{u,v}`,
      desc: tx(
        r`l’elemento $(u, v)$ della potenza $L$-esima della matrice di adiacenza: dipende dai cammini di lunghezza $L$ tra $u$ e $v$`,
        r`the $(u, v)$ entry of the $L$-th power of the adjacency matrix: it depends on the paths of length $L$ between $u$ and $v$`,
      ),
    },
  ],
  read: tx(
    r`«la norma della derivata di h di v allo strato L rispetto a x di u è minore o uguale del prodotto delle norme dei W, per l’elemento u v di A alla L».`,
    r`“the norm of the derivative of h of v at layer L with respect to x of u is less than or equal to the product of the norms of the W’s, times the u v entry of A to the L.”`,
  ),
  why: tx(
    r`È lo stesso meccanismo del vanishing gradient: un prodotto di $L$ fattori. Per questo imporre $\|W\| > 1$ impedisce che la sensibilità svanisca esponenzialmente, cioè contrasta l’over-squashing.`,
    r`It is the same mechanism as the vanishing gradient: a product of $L$ factors. This is why imposing $\|W\| > 1$ prevents the sensitivity from vanishing exponentially, that is, it counteracts over-squashing.`,
  ),
}

export const dirichlet: FormulaDef = {
  name: tx('Energia di Dirichlet', 'Dirichlet energy'),
  tex: r`E(\mathbf{h}) = \part{s}{\sum_{v}\sum_{u \in \mathcal{N}_v}}\part{d}{\|\mathbf{h}_v - \mathbf{h}_u\|^2}`,
  parts: [
    {
      k: 's',
      sym: r`\sum_{v}\sum_{u \in \mathcal{N}_v}`,
      desc: tx(
        r`somma su tutti i nodi $v$ e, per ciascuno, sui suoi vicini $u$: cioè su tutte le coppie di nodi collegati`,
        r`sum over all the nodes $v$ and, for each one, over its neighbors $u$: that is, over all the pairs of connected nodes`,
      ),
    },
    {
      k: 'd',
      sym: r`\|\mathbf{h}_v - \mathbf{h}_u\|^2`,
      desc: tx(
        r`quanto il segnale (etichette o embedding) differisce tra due nodi vicini`,
        r`how much the signal (labels or embeddings) differs between two neighboring nodes`,
      ),
    },
  ],
  read: tx(
    r`«E di h è la somma, su ogni nodo v e su ogni suo vicino u, della distanza al quadrato tra h di v e h di u».`,
    r`“E of h is the sum, over every node v and every neighbor u of it, of the squared distance between h of v and h of u.”`,
  ),
  why: tx(
    r`Se nodi vicini hanno valori simili (segnale liscio, a bassa frequenza) l’energia è bassa; se nodi vicini hanno valori diversi (alta frequenza) è alta. L’over-smoothing rende tutti gli stati simili: l’energia crolla.`,
    r`If neighboring nodes have similar values (smooth, low-frequency signal) the energy is low; if neighboring nodes have different values (high frequency) it is high. Over-smoothing makes all the states similar: the energy collapses.`,
  ),
}
