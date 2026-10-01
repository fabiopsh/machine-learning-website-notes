import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const lms: FormulaDef = {
  name: tx('Least Mean Squares (caso univariato)', 'Least Mean Squares (univariate case)'),
  tex: r`\text{Loss}(h_\mathbf{w}) = E(\mathbf{w}) = \sum_{\part{p}{p=1}}^{l} \big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(x_p)}\big)^{\part{sq}{2}} = \sum_{p=1}^{l} \big(y_p - (\part{w}{w_1 x_p + w_0})\big)^2`,
  parts: [
    {
      k: 'p',
      sym: r`p`,
      desc: tx(
        r`indice dell’esempio: si sommano i contributi di tutti gli $l$ esempi di training`,
        r`index of the example: the contributions of all the $l$ training examples are summed`,
      ),
    },
    { k: 'y', sym: r`y_p`, desc: tx(r`il target dell’esempio $p$`, r`the target of example $p$`) },
    {
      k: 'h',
      sym: r`h_\mathbf{w}(x_p)`,
      desc: tx(r`la predizione della retta nel punto $x_p$`, r`the prediction of the line at the point $x_p$`),
    },
    {
      k: 'sq',
      sym: r`(\cdot)^2`,
      desc: tx(
        r`il **residuo** al quadrato: errori positivi e negativi pesano allo stesso modo e quelli grandi pesano di più`,
        r`the squared **residual**: positive and negative errors weigh the same and large ones weigh more`,
      ),
    },
    {
      k: 'w',
      sym: r`w_1 x_p + w_0`,
      desc: tx(
        r`la retta: $w_1$ è la pendenza, $w_0$ l’intercetta; sono i due **pesi** da trovare`,
        r`the line: $w_1$ is the slope, $w_0$ the intercept; they are the two **weights** to be found`,
      ),
    },
  ],
  read: tx(
    r`«la loss di h w è E di w, cioè la sommatoria per p da uno a l di y p meno h w di x p, al quadrato».`,
    r`“the loss of h w is E of w, that is, the sum for p from one to l of y p minus h w of x p, squared.”`,
  ),
  why: tx(
    r`Ogni retta candidata lascia dei residui, le distanze verticali tra i punti e la retta: sommarne i quadrati dà un numero che misura quanto la retta è lontana dai dati, e che si può minimizzare.

Dividendo per $l$ si ottiene la media (il *mean* di LMS), che non cambia il punto di minimo.`,
    r`Every candidate line leaves residuals, the vertical distances between the points and the line: summing their squares gives a number that measures how far the line is from the data, and that can be minimized.

Dividing by $l$ gives the mean (the *mean* of LMS), which does not change the location of the minimum.`,
  ),
}

export const linModel: FormulaDef = {
  name: tx('Modello lineare', 'Linear model'),
  tex: r`h(\mathbf{x}_p) = \part{x}{\mathbf{x}_p^T}\part{w}{\mathbf{w}} = \sum_{i=\part{i0}{0}}^{n} x_{p,i}\, w_i`,
  parts: [
    {
      k: 'x',
      sym: r`\mathbf{x}_p^T = [1, x_{p,1}, \dots, x_{p,n}]`,
      desc: tx(
        r`il pattern $p$ con in testa la componente costante $x_0 = 1$`,
        r`pattern $p$ with the constant component $x_0 = 1$ in front`,
      ),
    },
    {
      k: 'w',
      sym: r`\mathbf{w} = [w_0, w_1, \dots, w_n]^T`,
      desc: tx(r`i pesi, compresa l’intercetta (**bias**) $w_0$`, r`the weights, including the intercept (**bias**) $w_0$`),
    },
    {
      k: 'i0',
      sym: r`i = 0`,
      desc: tx(
        r`la somma parte da $0$: il termine $x_{p,0} w_0 = w_0$ è il bias`,
        r`the sum starts from $0$: the term $x_{p,0} w_0 = w_0$ is the bias`,
      ),
    },
  ],
  read: tx(
    r`«h di x p è x p trasposto per w, cioè la sommatoria per i da zero a n di x p i per w i».`,
    r`“h of x p is x p transpose times w, that is, the sum for i from zero to n of x p i times w i.”`,
  ),
  why: tx(
    r`Aggiungere $x_0 = 1$ fa entrare il bias nel prodotto scalare: il modello lineare diventa **semplicemente un prodotto scalare** tra input e pesi, senza termini a parte.`,
    r`Adding $x_0 = 1$ brings the bias into the dot product: the linear model becomes **simply a dot product** between inputs and weights, with no separate terms.`,
  ),
}

export const ltu: FormulaDef = {
  name: 'Linear Threshold Unit',
  tex: r`h(\mathbf{x}) = \part{s}{\operatorname{sign}}\big(\part{net}{\mathbf{w}^T\mathbf{x} + w_0}\big)`,
  parts: [
    {
      k: 'net',
      sym: r`\mathbf{w}^T\mathbf{x} + w_0`,
      desc: tx(
        r`la combinazione pesata degli input: positiva da un lato dell’iperpiano, negativa dall’altro, zero sul confine`,
        r`the weighted combination of the inputs: positive on one side of the hyperplane, negative on the other, zero on the boundary`,
      ),
    },
    {
      k: 's',
      sym: r`\operatorname{sign}`,
      desc: tx(
        r`la **soglia**: $+1$ se l’argomento è $\ge 0$, $-1$ altrimenti (con uscite $0/1$ si usa lo scalino)`,
        r`the **threshold**: $+1$ if the argument is $\ge 0$, $-1$ otherwise (with $0/1$ outputs the step function is used)`,
      ),
    },
  ],
  read: tx(r`«h di x è il segno di w trasposto x più w zero».`, r`“h of x is the sign of w transpose x plus w zero.”`),
  why: tx(
    r`Il modello lineare dà un numero; la soglia lo trasforma in una classe. Il confine di decisione è l’iperpiano $\mathbf{w}^T\mathbf{x} + w_0 = 0$, e $-w_0$ è la soglia che la combinazione pesata deve superare.`,
    r`The linear model gives a number; the threshold turns it into a class. The decision boundary is the hyperplane $\mathbf{w}^T\mathbf{x} + w_0 = 0$, and $-w_0$ is the threshold that the weighted combination must exceed.`,
  ),
}

export const normal: FormulaDef = {
  name: tx('Equazioni normali e soluzione', 'Normal equations and solution'),
  tex: r`(\part{xtx}{X^T X})\,\mathbf{w} = X^T \mathbf{y} \quad\Longrightarrow\quad \mathbf{w} = (X^TX)^{-1}X^T\mathbf{y} = \part{pinv}{X^+}\mathbf{y}`,
  parts: [
    {
      k: 'xtx',
      sym: r`X^TX`,
      desc: tx(
        r`matrice $(n+1)\times(n+1)$ costruita dai dati; se è non singolare la soluzione è unica`,
        r`$(n+1)\times(n+1)$ matrix built from the data; if it is nonsingular the solution is unique`,
      ),
    },
    {
      k: 'pinv',
      sym: r`X^+`,
      desc: tx(
        r`la **pseudoinversa di Moore-Penrose**, definita anche quando $X$ non è invertibile; in pratica si calcola con la SVD`,
        r`the **Moore-Penrose pseudoinverse**, defined even when $X$ is not invertible; in practice it is computed with the SVD`,
      ),
    },
  ],
  read: tx(
    r`«X trasposto X per w uguale a X trasposto y; quindi w è l’inversa di X trasposto X per X trasposto y, cioè X più per y».`,
    r`“X transpose X times w equals X transpose y; hence w is the inverse of X transpose X times X transpose y, that is, X plus times y.”`,
  ),
  why: tx(
    r`Si ottengono imponendo il gradiente nullo, $\sum_p \delta_p\, x_{p,j} = 0$ per ogni $j$: tutte le equazioni insieme, in forma matriciale, sono $X^T(\mathbf{y} - X\mathbf{w}) = \mathbf{0}$.`,
    r`They are obtained by setting the gradient to zero, $\sum_p \delta_p\, x_{p,j} = 0$ for every $j$: all the equations together, in matrix form, are $X^T(\mathbf{y} - X\mathbf{w}) = \mathbf{0}$.`,
  ),
}

export const deltaRule: FormulaDef = {
  name: 'Delta rule (Widrow-Hoff)',
  tex: r`\Delta w_j = 2\sum_{p=1}^{l} \underbrace{\part{d}{(y_p - \mathbf{x}_p^T\mathbf{w})}}_{\delta_p}\, \part{x}{x_{p,j}}, \qquad \mathbf{w}_{new} = \mathbf{w} + \part{eta}{\eta}\,\Delta\mathbf{w}`,
  parts: [
    {
      k: 'd',
      sym: r`\delta_p`,
      desc: tx(
        r`l’**errore** sul pattern $p$ (target meno output): se è zero non si corregge nulla`,
        r`the **error** on pattern $p$ (target minus output): if it is zero nothing is corrected`,
      ),
    },
    {
      k: 'x',
      sym: r`x_{p,j}`,
      desc: tx(
        r`l’input $j$: decide quanto e in che verso il peso $w_j$ è responsabile dell’errore (input nullo, peso invariato)`,
        r`input $j$: it decides how much and in which direction the weight $w_j$ is responsible for the error (zero input, weight unchanged)`,
      ),
    },
    {
      k: 'eta',
      sym: r`\eta`,
      desc: tx(
        r`il **learning rate**: la lunghezza del passo, compromesso tra velocità e stabilità`,
        r`the **learning rate**: the length of the step, a trade-off between speed and stability`,
      ),
    },
  ],
  read: tx(
    r`«delta w j è due volte la sommatoria su p di delta p per x p j; w nuovo è w più eta per delta w».`,
    r`“delta w j is twice the sum over p of delta p times x p j; w new is w plus eta times delta w.”`,
  ),
  why: tx(
    r`$\Delta\mathbf{w}$ è il gradiente **negativo** dell’errore quadratico: muoversi lungo di esso fa scendere l’errore. Letta pattern per pattern è una regola di **correzione dell’errore**: ogni peso cambia in proporzione all’errore e al suo input. La costante $2$ si può assorbire in $\eta$.`,
    r`$\Delta\mathbf{w}$ is the **negative** gradient of the squared error: moving along it makes the error decrease. Read pattern by pattern it is an **error-correction** rule: every weight changes in proportion to the error and to its input. The constant $2$ can be absorbed into $\eta$.`,
  ),
}

export const tikhonov: FormulaDef = {
  name: tx('Loss di Tikhonov (ridge regression)', 'Tikhonov loss (ridge regression)'),
  tex: tx(
    r`\text{Loss}(\mathbf{w}) = \underbrace{\part{err}{\sum_{p=1}^{l}(y_p - \mathbf{x}_p^T\mathbf{w})^2}}_{\text{errore}} + \underbrace{\part{lam}{\lambda}\,\part{pen}{\|\mathbf{w}\|^2}}_{\text{penalità}}`,
    r`\text{Loss}(\mathbf{w}) = \underbrace{\part{err}{\sum_{p=1}^{l}(y_p - \mathbf{x}_p^T\mathbf{w})^2}}_{\text{error}} + \underbrace{\part{lam}{\lambda}\,\part{pen}{\|\mathbf{w}\|^2}}_{\text{penalty}}`,
  ),
  parts: [
    {
      k: 'err',
      sym: r`\sum_p (y_p - \mathbf{x}_p^T\mathbf{w})^2`,
      desc: tx(
        r`il termine d’errore ($R_{emp}$): spinge il modello a seguire i dati`,
        r`the error term ($R_{emp}$): it pushes the model to follow the data`,
      ),
    },
    {
      k: 'pen',
      sym: r`\|\mathbf{w}\|^2 = \sum_j w_j^2`,
      desc: tx(
        r`la penalità: punisce i pesi grandi, rendendo il modello più liscio e più semplice`,
        r`the penalty: it punishes large weights, making the model smoother and simpler`,
      ),
    },
    {
      k: 'lam',
      sym: r`\lambda`,
      desc: tx(
        r`l’**iperparametro di regolarizzazione**, scelto in model selection: decide quanto conta la penalità`,
        r`the **regularization hyperparameter**, chosen in model selection: it decides how much the penalty counts`,
      ),
    },
  ],
  read: tx(
    r`«la loss di w è la somma dei quadrati degli errori più lambda per la norma di w al quadrato».`,
    r`“the loss of w is the sum of the squared errors plus lambda times the squared norm of w.”`,
  ),
  why: tx(
    r`È una bilancia: con $\lambda$ piccolo vince l’adattamento ai dati (rischio di overfitting), con $\lambda$ grande vince la semplicità (rischio di underfitting). La soluzione diretta diventa $\mathbf{w} = (X^TX + \lambda I)^{-1}X^T\mathbf{y}$.`,
    r`It is a balance: with small $\lambda$ the fit to the data wins (risk of overfitting), with large $\lambda$ simplicity wins (risk of underfitting). The direct solution becomes $\mathbf{w} = (X^TX + \lambda I)^{-1}X^T\mathbf{y}$.`,
  ),
}

export const knnAvg: FormulaDef = {
  name: tx('Media dei k vicini', 'Mean of the k neighbors'),
  tex: r`\text{avg}_k(\mathbf{x}) = \part{k}{\frac{1}{k}}\sum_{\mathbf{x}_i \in \part{N}{N_k(\mathbf{x})}} \part{y}{y_i}`,
  parts: [
    {
      k: 'N',
      sym: r`N_k(\mathbf{x})`,
      desc: tx(
        r`l’insieme dei $k$ pattern di training più vicini a $\mathbf{x}$ secondo la distanza $d$`,
        r`the set of the $k$ training patterns nearest to $\mathbf{x}$ according to the distance $d$`,
      ),
    },
    {
      k: 'y',
      sym: r`y_i`,
      desc: tx(
        r`i loro target (con classi $0/1$, la media è la frazione di vicini di classe 1)`,
        r`their targets (with $0/1$ classes, the mean is the fraction of neighbors of class 1)`,
      ),
    },
    {
      k: 'k',
      sym: r`1/k`,
      desc: tx(
        r`media sui $k$ vicini: $k$ controlla quanto «locale» è la stima`,
        r`mean over the $k$ neighbors: $k$ controls how “local” the estimate is`,
      ),
    },
  ],
  read: tx(
    r`«avg k di x è un k-esimo della somma degli y i, per gli x i nell’intorno N k di x».`,
    r`“avg k of x is one over k times the sum of the y i, for the x i in the neighborhood N k of x.”`,
  ),
  why: tx(
    r`Con target $0/1$ la regola «classe 1 se $\text{avg}_k > 0{,}5$» è esattamente il **voto a maggioranza** tra i vicini. Per la regressione si restituisce direttamente la media.`,
    r`With $0/1$ targets the rule “class 1 if $\text{avg}_k > 0.5$” is exactly the **majority vote** among the neighbors. For regression the mean is returned directly.`,
  ),
}

export const bayes: FormulaDef = {
  name: tx('Classificatore ottimo di Bayes', 'Bayes optimal classifier'),
  tex: r`h(\mathbf{x}) = \part{am}{\arg\max_v}\; \part{P}{P(v \mid \mathbf{x})}, \qquad v \in \{C_1, \dots, C_K\}`,
  parts: [
    {
      k: 'P',
      sym: r`P(v \mid \mathbf{x})`,
      desc: tx(
        r`la probabilità della classe $v$ dato l’input: calcolabile solo se si conosce la densità $P(\mathbf{x}, y)$`,
        r`the probability of class $v$ given the input: computable only if the density $P(\mathbf{x}, y)$ is known`,
      ),
    },
    { k: 'am', sym: r`\arg\max_v`, desc: tx(r`si sceglie la classe più probabile`, r`the most probable class is chosen`) },
  ],
  read: tx(r`«h di x è l’arg max su v di P di v dato x».`, r`“h of x is the arg max over v of P of v given x.”`),
  why: tx(
    r`Nessun classificatore può fare meglio in media: il suo tasso d’errore (Bayes rate) è il minimo raggiungibile. Il K-NN lo approssima stimando $P(v \mid \mathbf{x})$ con le proporzioni delle classi in un intorno di $\mathbf{x}$.`,
    r`No classifier can do better on average: its error rate (Bayes rate) is the minimum achievable. K-NN approximates it by estimating $P(v \mid \mathbf{x})$ with the proportions of the classes in a neighborhood of $\mathbf{x}$.`,
  ),
}
