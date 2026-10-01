import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const poly: FormulaDef = {
  name: tx('Polinomio di grado M', 'Polynomial of degree M'),
  tex: r`h_\mathbf{w}(x) = \part{w0}{w_0} + w_1 x + w_2 x^2 + \dots + \part{wm}{w_M x^M} = \sum_{j=0}^{\part{M}{M}} \part{wj}{w_j} \part{xj}{x^j}`,
  parts: [
    {
      k: 'w0',
      sym: r`w_0`,
      desc: tx(
        r`termine costante: il polinomio di grado $0$ è solo questo, una retta orizzontale`,
        r`constant term: the polynomial of degree $0$ is just this, a horizontal line`,
      ),
    },
    {
      k: 'wm',
      sym: r`w_M x^M`,
      desc: tx(
        r`il termine di grado massimo: più alto è $M$, più il polinomio può curvarsi`,
        r`the term of highest degree: the higher $M$, the more the polynomial can bend`,
      ),
    },
    {
      k: 'M',
      sym: r`M`,
      desc: tx(
        r`il **grado**: un **iperparametro** che fissa la complessità dell’ipotesi (i parametri liberi sono $M+1$)`,
        r`the **degree**: a **hyperparameter** that fixes the complexity of the hypothesis (there are $M+1$ free parameters)`,
      ),
    },
    {
      k: 'wj',
      sym: r`w_j`,
      desc: tx(
        r`i **pesi** (parametri liberi) che l’algoritmo sceglie minimizzando l’errore`,
        r`the **weights** (free parameters) that the algorithm chooses by minimizing the error`,
      ),
    },
    { k: 'xj', sym: r`x^j`, desc: tx(r`la $j$-esima potenza dell’unico input $x$`, r`the $j$-th power of the single input $x$`) },
  ],
  read: tx(
    r`«h w di x è uguale alla sommatoria, per j che va da zero a M, di w j per x alla j».`,
    r`“h w of x equals the sum, for j from zero to M, of w j times x to the j.”`,
  ),
  why: tx(
    r`Anche se la funzione è **non lineare in $x$**, è **lineare nei pesi** $w_j$: per questo trovare i pesi migliori con l’errore quadratico è un problema di minimi quadrati, risolvibile in modo esatto.`,
    r`Even though the function is **nonlinear in $x$**, it is **linear in the weights** $w_j$: this is why finding the best weights with the squared error is a least squares problem, which can be solved exactly.`,
  ),
}

export const sse: FormulaDef = {
  name: tx('Somma degli errori quadratici', 'Sum of squared errors'),
  tex: r`E(\mathbf{w}) = \sum_{\part{p}{p=1}}^{l} \big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(x_p)}\big)^2`,
  parts: [
    {
      k: 'p',
      sym: r`p`,
      desc: tx(
        r`indice dell’esempio: si scorrono tutti gli $l$ esempi di training`,
        r`index of the example: it runs over all the $l$ training examples`,
      ),
    },
    { k: 'y', sym: r`y_p`, desc: tx(r`il target (rumoroso) dell’esempio $p$`, r`the (noisy) target of example $p$`) },
    {
      k: 'h',
      sym: r`h_\mathbf{w}(x_p)`,
      desc: tx(
        r`l’uscita del polinomio nel punto $x_p$ (qui una sola variabile, $n = 1$)`,
        r`the output of the polynomial at the point $x_p$ (here a single variable, $n = 1$)`,
      ),
    },
  ],
  read: tx(
    r`«E di w è la sommatoria, per p da uno a l, di y p meno h w di x p, al quadrato».`,
    r`“E of w is the sum, for p from one to l, of y p minus h w of x p, squared.”`,
  ),
}

export const erms: FormulaDef = {
  name: tx('Errore RMS', 'RMS error'),
  tex: r`E_{RMS} = \sqrt{\part{two}{2}\,\part{E}{E(\mathbf{w}^*)} \,/\, \part{l}{l}}`,
  parts: [
    {
      k: 'E',
      sym: r`E(\mathbf{w}^*)`,
      desc: tx(
        r`l’errore del modello **addestrato**, cioè con i pesi ottimi $\mathbf{w}^*$`,
        r`the error of the **trained** model, that is, with the optimal weights $\mathbf{w}^*$`,
      ),
    },
    {
      k: 'l',
      sym: r`l`,
      desc: tx(
        r`il numero di esempi: dividere per $l$ rende confrontabili dataset di dimensione diversa`,
        r`the number of examples: dividing by $l$ makes datasets of different size comparable`,
      ),
    },
    {
      k: 'two',
      sym: r`2`,
      desc: tx(
        r`compensa il fattore $\tfrac12$ che molti testi (es. Bishop) mettono davanti alla somma degli errori`,
        r`compensates for the factor $\tfrac12$ that many textbooks (e.g. Bishop) put in front of the sum of the errors`,
      ),
    },
  ],
  read: tx(r`«E RMS è la radice quadrata di due E di w star fratto l».`, r`“E RMS is the square root of two E of w star over l.”`),
  why: tx(
    r`La **radice** riporta l’errore sulla stessa scala (e unità di misura) del target $t$: un $E_{RMS}$ di $0{,}3$ si legge «in media sbaglio di circa $0{,}3$».

Il $2$ si capisce se l’errore è definito come $E = \tfrac12 \sum_p (\cdot)^2$: allora $2E/l$ è esattamente la media dei quadrati. Nelle figure di questa pagina l’$E_{RMS}$ è calcolato così: radice della media degli errori quadratici.`,
    r`The **square root** brings the error back to the same scale (and unit of measurement) as the target $t$: an $E_{RMS}$ of $0.3$ reads “on average I am off by about $0.3$”.

The $2$ makes sense if the error is defined as $E = \tfrac12 \sum_p (\cdot)^2$: then $2E/l$ is exactly the mean of the squares. In the figures of this page $E_{RMS}$ is computed this way: the square root of the mean of the squared errors.`,
  ),
}

export const overfit: FormulaDef = {
  name: 'Overfitting',
  tex: tx(r`\part{e}{E' > E} \qquad \text{ma} \qquad \part{r}{R' < R}`, r`\part{e}{E' > E} \qquad \text{but} \qquad \part{r}{R' < R}`),
  parts: [
    {
      k: 'e',
      sym: r`E' > E`,
      desc: tx(
        r`l’ipotesi alternativa $h'$ ha errore di **training** più alto…`,
        r`the alternative hypothesis $h'$ has a higher **training** error…`,
      ),
    },
    {
      k: 'r',
      sym: r`R' < R`,
      desc: tx(r`…ma errore **vero** (rischio, sui dati nuovi) più basso`, r`…but a lower **true** error (risk, on new data)`),
    },
  ],
  why: tx(
    r`Se esiste un’ipotesi che si adatta *peggio* ai dati ma funziona *meglio* sui dati nuovi, allora la nostra $h$ ha imparato qualcosa che nei dati nuovi non c’è: il rumore o le peculiarità del training set.`,
    r`If there exists a hypothesis that fits the data *worse* but works *better* on new data, then our $h$ has learned something that is not there in the new data: the noise or the peculiarities of the training set.`,
  ),
}

export const risk: FormulaDef = {
  name: tx('Funzione di rischio', 'Risk function'),
  tex: r`R = \part{i}{\int} \part{L}{L\big(d, h(\mathbf{x})\big)}\, \part{P}{dP(\mathbf{x}, d)}`,
  parts: [
    {
      k: 'i',
      sym: r`\int`,
      desc: tx(
        r`l’integrale somma (in modo continuo) su **tutte** le coppie input–target possibili`,
        r`the integral sums (in a continuous way) over **all** the possible input–target pairs`,
      ),
    },
    {
      k: 'L',
      sym: r`L(d, h(\mathbf{x}))`,
      desc: tx(r`la loss su una coppia, ad esempio $(d - h(\mathbf{x}))^2$`, r`the loss on one pair, for example $(d - h(\mathbf{x}))^2$`),
    },
    {
      k: 'P',
      sym: r`dP(\mathbf{x}, d)`,
      desc: tx(
        r`pesa ogni coppia con la sua probabilità, secondo la distribuzione **sconosciuta** $P$ dei dati`,
        r`weights each pair by its probability, according to the **unknown** distribution $P$ of the data`,
      ),
    },
  ],
  read: tx(r`«R è l’integrale di L di d e h di x, in d P di x e d».`, r`“R is the integral of L of d and h of x, in d P of x and d.”`),
  why: tx(
    r`È il valore atteso della loss: l’errore medio che il modello commetterebbe su un flusso infinito di dati nuovi. Non si può calcolare, perché $P$ non la conosciamo: ecco perché serve il rischio empirico.`,
    r`It is the expected value of the loss: the mean error that the model would make on an infinite stream of new data. It cannot be computed, because we do not know $P$: this is why the empirical risk is needed.`,
  ),
}

export const remp: FormulaDef = {
  name: tx('Rischio empirico', 'Empirical risk'),
  tex: r`R_{emp}(h, TR) = \part{m}{\frac{1}{l} \sum_{p=1}^{l}} \big(d_p - h(\mathbf{x}_p)\big)^2`,
  parts: [
    {
      k: 'm',
      sym: r`\frac1l\sum_p`,
      desc: tx(
        r`la media sui soli $l$ esempi disponibili, al posto dell’integrale su tutta la distribuzione`,
        r`the mean over only the $l$ available examples, in place of the integral over the whole distribution`,
      ),
    },
  ],
  read: tx(
    r`«R emp di h su TR è la media, sugli l esempi, di d p meno h di x p al quadrato».`,
    r`“R emp of h on TR is the mean, over the l examples, of d p minus h of x p squared.”`,
  ),
  why: tx(
    r`Si sostituisce l’integrale su $P$ con una media sui campioni che abbiamo: è la stessa idea della media campionaria che stima una media vera. La domanda della SLT è quando questa stima è affidabile.`,
    r`The integral over $P$ is replaced with a mean over the samples we have: it is the same idea as the sample mean that estimates a true mean. The question of SLT is when this estimate is reliable.`,
  ),
}

export const vcBound: FormulaDef = {
  name: 'VC-bound',
  tex: tx(
    r`\underbrace{\part{R}{R}}_{\text{rischio garantito}} \;\le\; \part{E}{R_{emp}} + \underbrace{\part{e}{\varepsilon\left(\frac{1}{l}, VC, \frac{1}{\delta}\right)}}_{\text{VC-confidence}}`,
    r`\underbrace{\part{R}{R}}_{\text{guaranteed risk}} \;\le\; \part{E}{R_{emp}} + \underbrace{\part{e}{\varepsilon\left(\frac{1}{l}, VC, \frac{1}{\delta}\right)}}_{\text{VC-confidence}}`,
  ),
  parts: [
    { k: 'R', sym: r`R`, desc: tx(r`il rischio vero, che vorremmo conoscere`, r`the true risk, which we would like to know`) },
    { k: 'E', sym: r`R_{emp}`, desc: tx(r`l’errore di training, che possiamo misurare`, r`the training error, which we can measure`) },
    {
      k: 'e',
      sym: r`\varepsilon`,
      desc: tx(
        r`la **VC-confidence**: cresce con la VC-dimension, decresce con il numero di dati $l$ (e con $\delta$)`,
        r`the **VC-confidence**: it grows with the VC-dimension, decreases with the number of data $l$ (and with $\delta$)`,
      ),
    },
  ],
  read: tx(
    r`«R è minore o uguale di R emp più epsilon, funzione di uno su l, della VC-dimension e di uno su delta».`,
    r`“R is less than or equal to R emp plus epsilon, a function of one over l, of the VC-dimension and of one over delta.”`,
  ),
  why: tx(
    r`Il rischio vero non può superare quello empirico **più un margine**. Il margine è piccolo quando i dati sono tanti rispetto alla complessità del modello: allora l’errore di training è una stima fedele di quello vero.

Il bound vale «con probabilità $1-\delta$»: è una garanzia statistica, non una certezza. Con $\delta = 0{,}01$ vale nel 99% dei casi.`,
    r`The true risk cannot exceed the empirical one **plus a margin**. The margin is small when the data are many compared with the complexity of the model: then the training error is a faithful estimate of the true one.

The bound holds “with probability $1-\delta$”: it is a statistical guarantee, not a certainty. With $\delta = 0.01$ it holds in 99% of the cases.`,
  ),
}

export const vcConcrete: FormulaDef = {
  tex: r`R \le R_{emp} + \varepsilon\left(\frac{VC}{l}, -\frac{\ln\delta}{l}\right)`,
  why: tx(
    r`Si vede che $\varepsilon$ dipende essenzialmente dal **rapporto** tra complessità e numero di dati, $VC/l$. Nella forma classica di Vapnik per la loss 0/1 (vedi la lezione sulla SLT):

$\varepsilon = \sqrt{\frac{VC\left(\ln\frac{2l}{VC} + 1\right) - \ln\frac{\delta}{4}}{l}}$ — è la curva usata nella figura 4.6.`,
    r`We see that $\varepsilon$ depends essentially on the **ratio** between complexity and number of data, $VC/l$. In Vapnik’s classical form for the 0/1 loss (see the lecture on SLT):

$\varepsilon = \sqrt{\frac{VC\left(\ln\frac{2l}{VC} + 1\right) - \ln\frac{\delta}{4}}{l}}$ — it is the curve used in figure 4.6.`,
  ),
}
