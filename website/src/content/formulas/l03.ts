import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const hyperplane: FormulaDef = {
  name: tx('Iperpiano separatore', 'Separating hyperplane'),
  tex: r`\part{w}{\mathbf{w}}^T\part{x}{\mathbf{x}} + \part{b}{w_0} = w_1 x_1 + w_2 x_2 + w_0 = 0`,
  parts: [
    {
      k: 'w',
      sym: r`\mathbf{w}`,
      desc: tx(
        r`vettore dei **pesi** $(w_1, w_2)$: fissa l’orientamento della retta, a cui è perpendicolare`,
        r`the **weight** vector $(w_1, w_2)$: it fixes the orientation of the line, to which it is perpendicular`,
      ),
    },
    {
      k: 'x',
      sym: r`\mathbf{x}`,
      desc: tx(r`un punto dello spazio degli input, $\mathbf{x} = (x_1, x_2)$`, r`a point of the input space, $\mathbf{x} = (x_1, x_2)$`),
    },
    {
      k: 'b',
      sym: r`w_0`,
      desc: tx(
        r`termine noto (detto anche *bias* o soglia): sposta la retta senza ruotarla`,
        r`constant term (also called bias or threshold): it shifts the line without rotating it`,
      ),
    },
  ],
  read: tx(
    r`«w trasposto x più w zero uguale a zero», cioè «w uno x uno più w due x due più w zero uguale a zero».`,
    r`“w transpose x plus w zero equals zero”, that is, “w one x one plus w two x two plus w zero equals zero.”`,
  ),
  why: tx(
    r`$\mathbf{w}^T\mathbf{x}$ è un prodotto scalare: misura quanto $\mathbf{x}$ è allineato con $\mathbf{w}$. I punti con lo **stesso** valore di $\mathbf{w}^T\mathbf{x}$ stanno su una retta perpendicolare a $\mathbf{w}$; quella con valore esattamente $-w_0$ è il separatore.

Da una parte $\mathbf{w}^T\mathbf{x} + w_0 > 0$, dall’altra $< 0$: il segno dice da che lato del confine si trova il punto.`,
    r`$\mathbf{w}^T\mathbf{x}$ is a dot product: it measures how much $\mathbf{x}$ is aligned with $\mathbf{w}$. The points with the **same** value of $\mathbf{w}^T\mathbf{x}$ lie on a line perpendicular to $\mathbf{w}$; the one with value exactly $-w_0$ is the separator.

On one side $\mathbf{w}^T\mathbf{x} + w_0 > 0$, on the other $< 0$: the sign tells on which side of the boundary the point lies.`,
  ),
}

export const ltu: FormulaDef = {
  name: 'Linear Threshold Unit',
  tex: tx(
    r`\part{h}{h(\mathbf{x})} = \begin{cases} 1 & \text{se } \part{a}{\mathbf{w}^T\mathbf{x} + w_0} \ge 0 \\ 0 & \text{altrimenti} \end{cases} \qquad \text{oppure} \qquad h(\mathbf{x}) = \part{s}{\operatorname{sign}}(\mathbf{w}^T\mathbf{x} + w_0)`,
    r`\part{h}{h(\mathbf{x})} = \begin{cases} 1 & \text{if } \part{a}{\mathbf{w}^T\mathbf{x} + w_0} \ge 0 \\ 0 & \text{otherwise} \end{cases} \qquad \text{or} \qquad h(\mathbf{x}) = \part{s}{\operatorname{sign}}(\mathbf{w}^T\mathbf{x} + w_0)`,
  ),
  parts: [
    {
      k: 'h',
      sym: r`h(\mathbf{x})`,
      desc: tx(
        r`l’**ipotesi**: la classe che il modello assegna all’input $\mathbf{x}$`,
        r`the **hypothesis**: the class that the model assigns to the input $\mathbf{x}$`,
      ),
    },
    {
      k: 'a',
      sym: r`\mathbf{w}^T\mathbf{x}+w_0`,
      desc: tx(
        r`il valore «lineare»: positivo da un lato dell’iperpiano, negativo dall’altro`,
        r`the “linear” value: positive on one side of the hyperplane, negative on the other`,
      ),
    },
    {
      k: 's',
      sym: r`\operatorname{sign}`,
      desc: tx(
        r`funzione segno: $+1$ per argomenti positivi, $-1$ per quelli negativi (versione con classi $\pm 1$)`,
        r`sign function: $+1$ for positive arguments, $-1$ for negative ones (version with classes $\pm 1$)`,
      ),
    },
  ],
  read: tx(
    r`«h di x vale uno se w trasposto x più w zero è maggiore o uguale a zero, zero altrimenti; oppure: h di x è il segno di w trasposto x più w zero».`,
    r`“h of x is one if w transpose x plus w zero is greater than or equal to zero, zero otherwise; or: h of x is the sign of w transpose x plus w zero.”`,
  ),
  why: tx(
    r`Le due scritture sono lo stesso classificatore con due codifiche delle classi: $\{0, 1\}$ oppure $\{-1, +1\}$. In entrambi i casi si calcola una quantità lineare e si applica una **soglia** in zero: da qui il nome.`,
    r`The two forms are the same classifier with two encodings of the classes: $\{0, 1\}$ or $\{-1, +1\}$. In both cases a linear quantity is computed and a **threshold** at zero is applied: hence the name.`,
  ),
}

export const risk: FormulaDef = {
  name: tx('Errore (rischio, loss)', 'Error (risk, loss)'),
  tex: r`\text{Loss}(h_\mathbf{w}) = \part{e}{E(\mathbf{w})} = \part{m}{\frac{1}{l} \sum_{p=1}^{l}} \part{L}{L\big(h_\mathbf{w}(\mathbf{x}_p), d_p\big)}`,
  parts: [
    {
      k: 'e',
      sym: r`E(\mathbf{w})`,
      desc: tx(
        r`l’errore dipende dai parametri $\mathbf{w}$: cambiando $\mathbf{w}$ cambia l’ipotesi e quindi l’errore`,
        r`the error depends on the parameters $\mathbf{w}$: changing $\mathbf{w}$ changes the hypothesis and therefore the error`,
      ),
    },
    {
      k: 'm',
      sym: r`\frac{1}{l}\sum_{p=1}^{l}`,
      desc: tx(
        r`media sugli $l$ esempi: si somma sui pattern $p = 1, \dots, l$ e si divide per $l$`,
        r`average over the $l$ examples: we sum over the patterns $p = 1, \dots, l$ and divide by $l$`,
      ),
    },
    {
      k: 'L',
      sym: r`L(h_\mathbf{w}(\mathbf{x}_p), d_p)`,
      desc: tx(
        r`la **loss** sul singolo pattern: confronta l’uscita del modello su $\mathbf{x}_p$ con il target $d_p$`,
        r`the **loss** on the single pattern: it compares the output of the model on $\mathbf{x}_p$ with the target $d_p$`,
      ),
    },
  ],
  read: tx(
    r`«E di w è uguale a uno su l per la sommatoria, per p che va da uno a l, di L di h w di x p e d p».`,
    r`“E of w equals one over l times the sum, for p from one to l, of L of h w of x p and d p.”`,
  ),
  why: tx(
    r`La loss $L$ giudica **un** esempio; l’errore $E$ riassume il giudizio su **tutto** il dataset. Fare la media (e non la somma) rende l’errore confrontabile tra dataset di dimensioni diverse.`,
    r`The loss $L$ judges **one** example; the error $E$ summarizes the judgment on the **whole** dataset. Taking the average (and not the sum) makes the error comparable across datasets of different sizes.`,
  ),
}

export const mse: FormulaDef = {
  name: 'Mean Squared Error',
  tex: r`E(\mathbf{w}) = \frac{1}{l} \sum_{p=1}^{l} \part{q}{\big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(\mathbf{x}_p)}\big)^2}`,
  parts: [
    {
      k: 'y',
      sym: r`y_p`,
      desc: tx(r`il target del pattern $p$ (qui indicato con $y$ come nella figura)`, r`the target of pattern $p$ (here denoted by $y$ as in the figure)`),
    },
    {
      k: 'h',
      sym: r`h_\mathbf{w}(\mathbf{x}_p)`,
      desc: tx(r`l’uscita del modello lineare sul pattern $p$`, r`the output of the linear model on pattern $p$`),
    },
    {
      k: 'q',
      sym: r`(\cdot)^2`,
      desc: tx(
        r`l’errore al quadrato: sempre positivo, e penalizza molto gli errori grandi`,
        r`the squared error: always positive, and it heavily penalizes large errors`,
      ),
    },
  ],
  read: tx(r`«E di w è la media, su p, di y p meno h w di x p, al quadrato».`, r`“E of w is the average, over p, of y p minus h w of x p, squared.”`),
  why: tx(
    r`Perché il quadrato e non il valore assoluto? Rende gli errori tutti positivi (non si compensano tra loro), pesa di più quelli grandi ed è **derivabile** ovunque: una proprietà preziosa quando si minimizza con il gradiente.`,
    r`Why the square and not the absolute value? It makes all the errors positive (they do not cancel one another out), it gives more weight to the large ones and it is **differentiable** everywhere: a valuable property when minimizing with the gradient.`,
  ),
}

export const zeroOne: FormulaDef = {
  name: tx('Loss 0/1', '0/1 loss'),
  tex: tx(
    r`L(h_\mathbf{w}(\mathbf{x}_p), d_p) = \begin{cases} 0 & \text{se } h_\mathbf{w}(\mathbf{x}_p) = d_p \\ 1 & \text{altrimenti} \end{cases}`,
    r`L(h_\mathbf{w}(\mathbf{x}_p), d_p) = \begin{cases} 0 & \text{if } h_\mathbf{w}(\mathbf{x}_p) = d_p \\ 1 & \text{otherwise} \end{cases}`,
  ),
  read: tx(
    r`«la loss vale zero se la classe predetta coincide con il target, uno altrimenti».`,
    r`“the loss is zero if the predicted class coincides with the target, one otherwise.”`,
  ),
  why: tx(
    r`Conta semplicemente gli sbagli: la media sul dataset è la **frazione di pattern classificati male**. Non dice *di quanto* si sbaglia, solo *se* si sbaglia.`,
    r`It simply counts the mistakes: the average over the dataset is the **fraction of misclassified patterns**. It does not say *by how much* we are wrong, only *whether* we are wrong.`,
  ),
}

export const distortion: FormulaDef = {
  name: tx('Distorsione quadratica', 'Squared distortion'),
  tex: r`L(h(\mathbf{x}_p)) = \big(\mathbf{x}_p - \part{c}{h(\mathbf{x}_p)}\big) \cdot \big(\mathbf{x}_p - h(\mathbf{x}_p)\big) = \part{n}{\|\mathbf{x}_p - h(\mathbf{x}_p)\|^2}`,
  parts: [
    {
      k: 'c',
      sym: r`h(\mathbf{x}_p)`,
      desc: tx(
        r`il **centroide** (prototipo) del cluster a cui è assegnato $\mathbf{x}_p$`,
        r`the **centroid** (prototype) of the cluster to which $\mathbf{x}_p$ is assigned`,
      ),
    },
    {
      k: 'n',
      sym: r`\|\cdot\|^2`,
      desc: tx(
        r`distanza euclidea al quadrato: il prodotto scalare di un vettore con se stesso`,
        r`squared Euclidean distance: the dot product of a vector with itself`,
      ),
    },
  ],
  read: tx(r`«la loss è la norma al quadrato di x p meno h di x p».`, r`“the loss is the squared norm of x p minus h of x p.”`),
  why: tx(
    r`Un buon vector quantizer rappresenta ogni punto con un prototipo **vicino**: la distorsione misura proprio quanto è lontano, in media, il rappresentante dal punto rappresentato.`,
    r`A good vector quantizer represents every point with a **nearby** prototype: the distortion measures precisely how far, on average, the representative is from the point it represents.`,
  ),
}

export const logLoss: FormulaDef = {
  name: tx('Loss per la stima di densità', 'Loss for density estimation'),
  tex: r`L(h(\mathbf{x}_p)) = \part{l}{-\ln} \part{h}{h(\mathbf{x}_p)}`,
  parts: [
    {
      k: 'h',
      sym: r`h(\mathbf{x}_p)`,
      desc: tx(r`la densità stimata nel punto osservato $\mathbf{x}_p$`, r`the estimated density at the observed point $\mathbf{x}_p$`),
    },
    {
      k: 'l',
      sym: r`-\ln`,
      desc: tx(
        r`meno logaritmo naturale: grande quando $h$ è vicina a $0$, piccolo quando $h$ è alta`,
        r`minus the natural logarithm: large when $h$ is close to $0$, small when $h$ is high`,
      ),
    },
  ],
  read: tx(r`«meno logaritmo di h di x p».`, r`“minus the logarithm of h of x p.”`),
  why: tx(
    r`Il logaritmo trasforma prodotti in somme: $\ln \prod_p h(\mathbf{x}_p) = \sum_p \ln h(\mathbf{x}_p)$. Quindi minimizzare $\sum_p -\ln h(\mathbf{x}_p)$ equivale a **massimizzare** il prodotto delle probabilità dei dati osservati: la verosimiglianza.`,
    r`The logarithm turns products into sums: $\ln \prod_p h(\mathbf{x}_p) = \sum_p \ln h(\mathbf{x}_p)$. So minimizing $\sum_p -\ln h(\mathbf{x}_p)$ is equivalent to **maximizing** the product of the probabilities of the observed data: the likelihood.`,
  ),
}

export const countAll: FormulaDef = {
  name: tx('Quante funzioni booleane?', 'How many Boolean functions?'),
  tex: tx(
    r`|H| = 2^{\part{i}{\#\text{istanze di input}}} = 2^{\part{n}{2^n}}`,
    r`|H| = 2^{\part{i}{\#\text{input instances}}} = 2^{\part{n}{2^n}}`,
  ),
  parts: [
    {
      k: 'i',
      sym: tx(r`\#\text{istanze}`, r`\#\text{instances}`),
      desc: tx(
        r`il numero di input distinti: ogni funzione sceglie liberamente $0$ o $1$ per ciascuno`,
        r`the number of distinct inputs: every function freely chooses $0$ or $1$ for each of them`,
      ),
    },
    {
      k: 'n',
      sym: r`2^n`,
      desc: tx(
        r`con $n$ input binari le istanze sono $2^n$ (ogni bit ha 2 valori)`,
        r`with $n$ binary inputs there are $2^n$ instances (every bit has 2 values)`,
      ),
    },
  ],
  why: tx(
    r`Una funzione booleana è una **tabella di verità**: una colonna di $2^n$ uscite, ognuna $0$ o $1$. Il numero di colonne diverse è $2 \cdot 2 \cdots 2 = 2^{2^n}$. Con $n = 4$: $2^{16} = 65536$; con $n = 10$: $2^{1024} \approx 10^{308}$.`,
    r`A Boolean function is a **truth table**: a column of $2^n$ outputs, each $0$ or $1$. The number of different columns is $2 \cdot 2 \cdots 2 = 2^{2^n}$. With $n = 4$: $2^{16} = 65536$; with $n = 10$: $2^{1024} \approx 10^{308}$.`,
  ),
}
