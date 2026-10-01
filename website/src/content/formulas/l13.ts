import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const margin: FormulaDef = {
  name: tx('Margine', 'Margin'),
  tex: r`\part{r}{r = \frac{g(\mathbf{x})}{\|\mathbf{w}_o\|}} \quad\Rightarrow\quad \part{rho}{\rho = \frac{2}{\|\mathbf{w}_o\|}}`,
  parts: [
    {
      k: 'r',
      sym: r`r`,
      desc: tx(
        r`distanza (con segno) del punto $\mathbf{x}$ dall’iperpiano: il valore della funzione discriminante diviso per la norma dei pesi`,
        r`the (signed) distance of the point $\mathbf{x}$ from the hyperplane: the value of the discriminant function divided by the norm of the weights`,
      ),
    },
    {
      k: 'rho',
      sym: r`\rho`,
      desc: tx(
        r`il margine: su un support vector $g = 1$, quindi $r = 1/\|\mathbf{w}_o\|$, e il margine è il doppio`,
        r`the margin: on a support vector $g = 1$, so $r = 1/\|\mathbf{w}_o\|$, and the margin is twice that`,
      ),
    },
  ],
  read: tx(
    r`«r è g di x fratto la norma di w o; quindi rho è due fratto la norma di w o».`,
    r`“r is g of x over the norm of w o; hence rho is two over the norm of w o.”`,
  ),
  why: tx(
    r`Nella forma canonica i punti più vicini hanno $|g| = 1$: la loro distanza dipende solo da $\|\mathbf{w}\|$. Per questo massimizzare il margine equivale a **minimizzare la norma** dei pesi.`,
    r`In the canonical form the closest points have $|g| = 1$: their distance depends only on $\|\mathbf{w}\|$. This is why maximizing the margin amounts to **minimizing the norm** of the weights.`,
  ),
}

export const primalHard: FormulaDef = {
  name: tx('Primale hard margin', 'Hard margin primal'),
  tex: tx(
    r`\min_{\mathbf{w}, b}\; \part{psi}{\tfrac{1}{2}\mathbf{w}^T\mathbf{w}} \quad \text{soggetto a} \quad \part{c}{d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1} \;\; \forall i`,
    r`\min_{\mathbf{w}, b}\; \part{psi}{\tfrac{1}{2}\mathbf{w}^T\mathbf{w}} \quad \text{subject to} \quad \part{c}{d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1} \;\; \forall i`,
  ),
  parts: [
    {
      k: 'psi',
      sym: r`\tfrac12\mathbf{w}^T\mathbf{w}`,
      desc: tx(
        r`la funzione obiettivo $\Psi(\mathbf{w})$: quadratica e convessa, minimizzarla significa massimizzare il margine`,
        r`the objective function $\Psi(\mathbf{w})$: quadratic and convex, minimizing it means maximizing the margin`,
      ),
    },
    {
      k: 'c',
      sym: r`d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1`,
      desc: tx(
        r`un vincolo lineare per esempio: ogni punto dal lato giusto e fuori dal margine (zero errori)`,
        r`one linear constraint per example: every point on the right side and outside the margin (zero errors)`,
      ),
    },
  ],
  read: tx(
    r`«minimizzare un mezzo di w trasposto w, con il vincolo che d i per w trasposto x i più b sia almeno uno, per ogni i».`,
    r`“minimize one half of w transpose w, subject to d i times w transpose x i plus b being at least one, for every i.”`,
  ),
  why: tx(
    r`Obiettivo quadratico convesso e vincoli lineari: è un problema di **programmazione quadratica**, con un unico ottimo, risolto da pacchetti esistenti.`,
    r`Convex quadratic objective and linear constraints: it is a **quadratic programming** problem, with a single optimum, solved by existing packages.`,
  ),
}

export const dualHard: FormulaDef = {
  name: tx('Duale hard margin', 'Hard margin dual'),
  tex: r`\max_{\boldsymbol{\alpha}}\; Q(\boldsymbol{\alpha}) = \sum_{i=1}^{N}\part{a}{\alpha_i} - \frac{1}{2}\sum_{i=1}^{N}\sum_{j=1}^{N}\alpha_i\alpha_j d_i d_j\,\part{x}{\mathbf{x}_i^T\mathbf{x}_j}`,
  parts: [
    {
      k: 'a',
      sym: r`\alpha_i`,
      desc: tx(
        r`il moltiplicatore di Lagrange dell’esempio $i$, con $\alpha_i \ge 0$ e $\sum_i \alpha_i d_i = 0$: è positivo solo per i support vector`,
        r`the Lagrange multiplier of example $i$, with $\alpha_i \ge 0$ and $\sum_i \alpha_i d_i = 0$: it is positive only for the support vectors`,
      ),
    },
    {
      k: 'x',
      sym: r`\mathbf{x}_i^T\mathbf{x}_j`,
      desc: tx(
        r`i dati compaiono **solo** tramite prodotti scalari: è la porta d’ingresso dei kernel`,
        r`the data appear **only** through dot products: this is the gateway to kernels`,
      ),
    },
  ],
  read: tx(
    r`«massimizzare la somma degli alfa i meno un mezzo della doppia somma di alfa i alfa j d i d j per x i trasposto x j».`,
    r`“maximize the sum of the alpha i minus one half of the double sum of alpha i alpha j d i d j times x i transpose x j.”`,
  ),
  why: tx(
    r`Le variabili sono una per esempio, quindi il duale scala con $N$ e non con la dimensione dello spazio. Risolto il duale, $\mathbf{w}_o = \sum_i \alpha_{o,i} d_i \mathbf{x}_i$.`,
    r`There is one variable per example, so the dual scales with $N$ and not with the dimension of the space. Once the dual is solved, $\mathbf{w}_o = \sum_i \alpha_{o,i} d_i \mathbf{x}_i$.`,
  ),
}

export const primalSoft: FormulaDef = {
  name: tx('Primale soft margin', 'Soft margin primal'),
  tex: tx(
    r`\min\; \frac{1}{2}\mathbf{w}^T\mathbf{w} + \part{C}{C}\sum_{i=1}^{N}\part{xi}{\xi_i} \quad \text{soggetto a} \quad d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1 - \xi_i,\;\; \xi_i \ge 0`,
    r`\min\; \frac{1}{2}\mathbf{w}^T\mathbf{w} + \part{C}{C}\sum_{i=1}^{N}\part{xi}{\xi_i} \quad \text{subject to} \quad d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1 - \xi_i,\;\; \xi_i \ge 0`,
  ),
  parts: [
    {
      k: 'C',
      sym: r`C`,
      desc: tx(
        r`iperparametro di regolarizzazione: pesa gli sconfinamenti rispetto al margine (basso: underfitting; alto: overfitting)`,
        r`regularization hyperparameter: it weighs the violations against the margin (low: underfitting; high: overfitting)`,
      ),
    },
    {
      k: 'xi',
      sym: r`\xi_i`,
      desc: tx(
        r`la variabile slack del punto $i$: 0 fuori dal margine, tra 0 e 1 dentro il margine dal lato giusto, oltre 1 se è classificato male`,
        r`the slack variable of point $i$: 0 outside the margin, between 0 and 1 inside the margin on the right side, above 1 if it is misclassified`,
      ),
    },
  ],
  read: tx(
    r`«minimizzare un mezzo di w trasposto w più C per la somma degli xi i, con d i per w trasposto x i più b almeno uno meno xi i, e xi i non negativi».`,
    r`“minimize one half of w transpose w plus C times the sum of the xi i, with d i times w transpose x i plus b at least one minus xi i, and the xi i non-negative.”`,
  ),
  why: tx(
    r`Il primo termine allarga il margine (capacità), il secondo misura quanto i punti lo violano (rischio empirico): $C$ decide il compromesso. Per $C \to \infty$ si torna all’hard margin.`,
    r`The first term widens the margin (capacity), the second measures how much the points violate it (empirical risk): $C$ sets the trade-off. For $C \to \infty$ we go back to the hard margin.`,
  ),
}

export const kernelDecision: FormulaDef = {
  name: tx('Funzione di decisione con kernel', 'Decision function with kernel'),
  tex: r`h(\mathbf{x}) = \operatorname{sign}\Big(\sum_{i=1}^{N}\part{a}{\alpha_i d_i}\,\part{k}{k(\mathbf{x}, \mathbf{x}_i)} + \part{b}{b}\Big)`,
  parts: [
    {
      k: 'a',
      sym: r`\alpha_i d_i`,
      desc: tx(
        r`il peso di ciascun esempio: nullo per tutti i non-support vector (soluzione sparsa)`,
        r`the weight of each example: zero for all the non-support vectors (sparse solution)`,
      ),
    },
    {
      k: 'k',
      sym: r`k(\mathbf{x}, \mathbf{x}_i)`,
      desc: tx(
        r`il kernel: il prodotto scalare $\Phi^T(\mathbf{x})\Phi(\mathbf{x}_i)$ nello spazio delle feature, calcolato senza la mappatura`,
        r`the kernel: the dot product $\Phi^T(\mathbf{x})\Phi(\mathbf{x}_i)$ in the feature space, computed without the mapping`,
      ),
    },
    {
      k: 'b',
      sym: r`b`,
      desc: tx(r`il bias, ricavato dai moltiplicatori e dalla matrice kernel`, r`the bias, obtained from the multipliers and the kernel matrix`),
    },
  ],
  read: tx(
    r`«h di x è il segno della somma degli alfa i d i per k di x e x i, più b».`,
    r`“h of x is the sign of the sum of the alpha i d i times k of x and x i, plus b.”`,
  ),
  why: tx(
    r`Non si calcola mai $\mathbf{w}$, che vive nello spazio delle feature (anche di dimensione infinita): bastano i support vector memorizzati e il kernel.`,
    r`$\mathbf{w}$, which lives in the feature space (possibly infinite-dimensional), is never computed: the stored support vectors and the kernel are enough.`,
  ),
}

export const epsLoss: FormulaDef = {
  name: tx('Loss ε-insensitive', 'ε-insensitive loss'),
  tex: tx(
    r`L_\varepsilon(d, y) = \begin{cases} |d - y| - \part{e}{\varepsilon} & \text{se } |d - y| \ge \varepsilon \ \part{z}{0} & \text{altrimenti} \end{cases}`,
    r`L_\varepsilon(d, y) = \begin{cases} |d - y| - \part{e}{\varepsilon} & \text{if } |d - y| \ge \varepsilon \ \part{z}{0} & \text{otherwise} \end{cases}`,
  ),
  parts: [
    {
      k: 'e',
      sym: r`\varepsilon`,
      desc: tx(
        r`la semiampiezza del tubo attorno alla predizione: si paga solo la parte di errore che lo supera`,
        r`the half-width of the tube around the prediction: only the part of the error that exceeds it is paid`,
      ),
    },
    {
      k: 'z',
      sym: r`0`,
      desc: tx(
        r`gli errori più piccoli di $\varepsilon$ non costano nulla: quei punti non influenzano la soluzione`,
        r`errors smaller than $\varepsilon$ cost nothing: those points do not affect the solution`,
      ),
    },
  ],
  read: tx(
    r`«L epsilon di d e y vale il valore assoluto di d meno y, meno epsilon, se questo è almeno epsilon; zero altrimenti».`,
    r`“L epsilon of d and y equals the absolute value of d minus y, minus epsilon, if this is at least epsilon; zero otherwise.”`,
  ),
}
