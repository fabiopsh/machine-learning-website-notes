import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const poly: FormulaDef = {
  name: 'Polinomio di grado M',
  tex: r`h_\mathbf{w}(x) = \part{w0}{w_0} + w_1 x + w_2 x^2 + \dots + \part{wm}{w_M x^M} = \sum_{j=0}^{\part{M}{M}} \part{wj}{w_j} \part{xj}{x^j}`,
  parts: [
    { k: 'w0', sym: r`w_0`, desc: r`termine costante: il polinomio di grado $0$ è solo questo, una retta orizzontale` },
    { k: 'wm', sym: r`w_M x^M`, desc: r`il termine di grado massimo: più alto è $M$, più il polinomio può curvarsi` },
    { k: 'M', sym: r`M`, desc: r`il **grado**: un **iperparametro** che fissa la complessità dell’ipotesi (i parametri liberi sono $M+1$)` },
    { k: 'wj', sym: r`w_j`, desc: r`i **pesi** (parametri liberi) che l’algoritmo sceglie minimizzando l’errore` },
    { k: 'xj', sym: r`x^j`, desc: r`la $j$-esima potenza dell’unico input $x$` },
  ],
  read: r`«h w di x è uguale alla sommatoria, per j che va da zero a M, di w j per x alla j».`,
  why: r`Anche se la funzione è **non lineare in $x$**, è **lineare nei pesi** $w_j$: per questo trovare i pesi migliori con l’errore quadratico è un problema di minimi quadrati, risolvibile in modo esatto.`,
}

export const sse: FormulaDef = {
  name: 'Somma degli errori quadratici',
  tex: r`E(\mathbf{w}) = \sum_{\part{p}{p=1}}^{l} \big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(x_p)}\big)^2`,
  parts: [
    { k: 'p', sym: r`p`, desc: r`indice dell’esempio: si scorrono tutti gli $l$ esempi di training` },
    { k: 'y', sym: r`y_p`, desc: r`il target (rumoroso) dell’esempio $p$` },
    { k: 'h', sym: r`h_\mathbf{w}(x_p)`, desc: r`l’uscita del polinomio nel punto $x_p$ (qui una sola variabile, $n = 1$)` },
  ],
  read: r`«E di w è la sommatoria, per p da uno a l, di y p meno h w di x p, al quadrato».`,
}

export const erms: FormulaDef = {
  name: 'Errore RMS',
  tex: r`E_{RMS} = \sqrt{\part{two}{2}\,\part{E}{E(\mathbf{w}^*)} \,/\, \part{l}{l}}`,
  parts: [
    { k: 'E', sym: r`E(\mathbf{w}^*)`, desc: r`l’errore del modello **addestrato**, cioè con i pesi ottimi $\mathbf{w}^*$` },
    { k: 'l', sym: r`l`, desc: r`il numero di esempi: dividere per $l$ rende confrontabili dataset di dimensione diversa` },
    { k: 'two', sym: r`2`, desc: r`compensa il fattore $\tfrac12$ che molti testi (es. Bishop) mettono davanti alla somma degli errori` },
  ],
  read: r`«E RMS è la radice quadrata di due E di w star fratto l».`,
  why: r`La **radice** riporta l’errore sulla stessa scala (e unità di misura) del target $t$: un $E_{RMS}$ di $0{,}3$ si legge «in media sbaglio di circa $0{,}3$».

Il $2$ si capisce se l’errore è definito come $E = \tfrac12 \sum_p (\cdot)^2$: allora $2E/l$ è esattamente la media dei quadrati. Nelle figure di questa pagina l’$E_{RMS}$ è calcolato così: radice della media degli errori quadratici.`,
}

export const overfit: FormulaDef = {
  name: 'Overfitting',
  tex: r`\part{e}{E' > E} \qquad \text{ma} \qquad \part{r}{R' < R}`,
  parts: [
    { k: 'e', sym: r`E' > E`, desc: r`l’ipotesi alternativa $h'$ ha errore di **training** più alto…` },
    { k: 'r', sym: r`R' < R`, desc: r`…ma errore **vero** (rischio, sui dati nuovi) più basso` },
  ],
  why: r`Se esiste un’ipotesi che si adatta *peggio* ai dati ma funziona *meglio* sui dati nuovi, allora la nostra $h$ ha imparato qualcosa che nei dati nuovi non c’è: il rumore o le peculiarità del training set.`,
}

export const risk: FormulaDef = {
  name: 'Funzione di rischio',
  tex: r`R = \part{i}{\int} \part{L}{L\big(d, h(\mathbf{x})\big)}\, \part{P}{dP(\mathbf{x}, d)}`,
  parts: [
    { k: 'i', sym: r`\int`, desc: r`l’integrale somma (in modo continuo) su **tutte** le coppie input–target possibili` },
    { k: 'L', sym: r`L(d, h(\mathbf{x}))`, desc: r`la loss su una coppia, ad esempio $(d - h(\mathbf{x}))^2$` },
    { k: 'P', sym: r`dP(\mathbf{x}, d)`, desc: r`pesa ogni coppia con la sua probabilità, secondo la distribuzione **sconosciuta** $P$ dei dati` },
  ],
  read: r`«R è l’integrale di L di d e h di x, in d P di x e d».`,
  why: r`È il valore atteso della loss: l’errore medio che il modello commetterebbe su un flusso infinito di dati nuovi. Non si può calcolare, perché $P$ non la conosciamo: ecco perché serve il rischio empirico.`,
}

export const remp: FormulaDef = {
  name: 'Rischio empirico',
  tex: r`R_{emp}(h, TR) = \part{m}{\frac{1}{l} \sum_{p=1}^{l}} \big(d_p - h(\mathbf{x}_p)\big)^2`,
  parts: [{ k: 'm', sym: r`\frac1l\sum_p`, desc: r`la media sui soli $l$ esempi disponibili, al posto dell’integrale su tutta la distribuzione` }],
  read: r`«R emp di h su TR è la media, sugli l esempi, di d p meno h di x p al quadrato».`,
  why: r`Si sostituisce l’integrale su $P$ con una media sui campioni che abbiamo: è la stessa idea della media campionaria che stima una media vera. La domanda della SLT è quando questa stima è affidabile.`,
}

export const vcBound: FormulaDef = {
  name: 'VC-bound',
  tex: r`\underbrace{\part{R}{R}}_{\text{rischio garantito}} \;\le\; \part{E}{R_{emp}} + \underbrace{\part{e}{\varepsilon\left(\frac{1}{l}, VC, \frac{1}{\delta}\right)}}_{\text{VC-confidence}}`,
  parts: [
    { k: 'R', sym: r`R`, desc: r`il rischio vero, che vorremmo conoscere` },
    { k: 'E', sym: r`R_{emp}`, desc: r`l’errore di training, che possiamo misurare` },
    { k: 'e', sym: r`\varepsilon`, desc: r`la **VC-confidence**: cresce con la VC-dimension, decresce con il numero di dati $l$ (e con $\delta$)` },
  ],
  read: r`«R è minore o uguale di R emp più epsilon, funzione di uno su l, della VC-dimension e di uno su delta».`,
  why: r`Il rischio vero non può superare quello empirico **più un margine**. Il margine è piccolo quando i dati sono tanti rispetto alla complessità del modello: allora l’errore di training è una stima fedele di quello vero.

Il bound vale «con probabilità $1-\delta$»: è una garanzia statistica, non una certezza. Con $\delta = 0{,}01$ vale nel 99% dei casi.`,
}

export const vcConcrete: FormulaDef = {
  tex: r`R \le R_{emp} + \varepsilon\left(\frac{VC}{l}, -\frac{\ln\delta}{l}\right)`,
  why: r`Si vede che $\varepsilon$ dipende essenzialmente dal **rapporto** tra complessità e numero di dati, $VC/l$. Nella forma classica di Vapnik per la loss 0/1 (vedi la lezione sulla SLT):

$\varepsilon = \sqrt{\frac{VC\left(\ln\frac{2l}{VC} + 1\right) - \ln\frac{\delta}{4}}{l}}$ — è la curva usata nella figura 4.6.`,
}
