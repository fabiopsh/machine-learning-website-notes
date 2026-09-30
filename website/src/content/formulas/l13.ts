import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const margin: FormulaDef = {
  name: 'Margine',
  tex: r`\part{r}{r = \frac{g(\mathbf{x})}{\|\mathbf{w}_o\|}} \quad\Rightarrow\quad \part{rho}{\rho = \frac{2}{\|\mathbf{w}_o\|}}`,
  parts: [
    {
      k: 'r',
      sym: r`r`,
      desc: r`distanza (con segno) del punto $\mathbf{x}$ dall’iperpiano: il valore della funzione discriminante diviso per la norma dei pesi`,
    },
    {
      k: 'rho',
      sym: r`\rho`,
      desc: r`il margine: su un support vector $g = 1$, quindi $r = 1/\|\mathbf{w}_o\|$, e il margine è il doppio`,
    },
  ],
  read: r`«r è g di x fratto la norma di w o; quindi rho è due fratto la norma di w o».`,
  why: r`Nella forma canonica i punti più vicini hanno $|g| = 1$: la loro distanza dipende solo da $\|\mathbf{w}\|$. Per questo massimizzare il margine equivale a **minimizzare la norma** dei pesi.`,
}

export const primalHard: FormulaDef = {
  name: 'Primale hard margin',
  tex: r`\min_{\mathbf{w}, b}\; \part{psi}{\tfrac{1}{2}\mathbf{w}^T\mathbf{w}} \quad \text{soggetto a} \quad \part{c}{d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1} \;\; \forall i`,
  parts: [
    {
      k: 'psi',
      sym: r`\tfrac12\mathbf{w}^T\mathbf{w}`,
      desc: r`la funzione obiettivo $\Psi(\mathbf{w})$: quadratica e convessa, minimizzarla significa massimizzare il margine`,
    },
    {
      k: 'c',
      sym: r`d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1`,
      desc: r`un vincolo lineare per esempio: ogni punto dal lato giusto e fuori dal margine (zero errori)`,
    },
  ],
  read: r`«minimizzare un mezzo di w trasposto w, con il vincolo che d i per w trasposto x i più b sia almeno uno, per ogni i».`,
  why: r`Obiettivo quadratico convesso e vincoli lineari: è un problema di **programmazione quadratica**, con un unico ottimo, risolto da pacchetti esistenti.`,
}

export const dualHard: FormulaDef = {
  name: 'Duale hard margin',
  tex: r`\max_{\boldsymbol{\alpha}}\; Q(\boldsymbol{\alpha}) = \sum_{i=1}^{N}\part{a}{\alpha_i} - \frac{1}{2}\sum_{i=1}^{N}\sum_{j=1}^{N}\alpha_i\alpha_j d_i d_j\,\part{x}{\mathbf{x}_i^T\mathbf{x}_j}`,
  parts: [
    {
      k: 'a',
      sym: r`\alpha_i`,
      desc: r`il moltiplicatore di Lagrange dell’esempio $i$, con $\alpha_i \ge 0$ e $\sum_i \alpha_i d_i = 0$: è positivo solo per i support vector`,
    },
    {
      k: 'x',
      sym: r`\mathbf{x}_i^T\mathbf{x}_j`,
      desc: r`i dati compaiono **solo** tramite prodotti scalari: è la porta d’ingresso dei kernel`,
    },
  ],
  read: r`«massimizzare la somma degli alfa i meno un mezzo della doppia somma di alfa i alfa j d i d j per x i trasposto x j».`,
  why: r`Le variabili sono una per esempio, quindi il duale scala con $N$ e non con la dimensione dello spazio. Risolto il duale, $\mathbf{w}_o = \sum_i \alpha_{o,i} d_i \mathbf{x}_i$.`,
}

export const primalSoft: FormulaDef = {
  name: 'Primale soft margin',
  tex: r`\min\; \frac{1}{2}\mathbf{w}^T\mathbf{w} + \part{C}{C}\sum_{i=1}^{N}\part{xi}{\xi_i} \quad \text{soggetto a} \quad d_i(\mathbf{w}^T\mathbf{x}_i + b) \ge 1 - \xi_i,\;\; \xi_i \ge 0`,
  parts: [
    {
      k: 'C',
      sym: r`C`,
      desc: r`iperparametro di regolarizzazione: pesa gli sconfinamenti rispetto al margine (basso: underfitting; alto: overfitting)`,
    },
    {
      k: 'xi',
      sym: r`\xi_i`,
      desc: r`la variabile slack del punto $i$: 0 fuori dal margine, tra 0 e 1 dentro il margine dal lato giusto, oltre 1 se è classificato male`,
    },
  ],
  read: r`«minimizzare un mezzo di w trasposto w più C per la somma degli xi i, con d i per w trasposto x i più b almeno uno meno xi i, e xi i non negativi».`,
  why: r`Il primo termine allarga il margine (capacità), il secondo misura quanto i punti lo violano (rischio empirico): $C$ decide il compromesso. Per $C \to \infty$ si torna all’hard margin.`,
}

export const kernelDecision: FormulaDef = {
  name: 'Funzione di decisione con kernel',
  tex: r`h(\mathbf{x}) = \operatorname{sign}\Big(\sum_{i=1}^{N}\part{a}{\alpha_i d_i}\,\part{k}{k(\mathbf{x}, \mathbf{x}_i)} + \part{b}{b}\Big)`,
  parts: [
    { k: 'a', sym: r`\alpha_i d_i`, desc: r`il peso di ciascun esempio: nullo per tutti i non-support vector (soluzione sparsa)` },
    {
      k: 'k',
      sym: r`k(\mathbf{x}, \mathbf{x}_i)`,
      desc: r`il kernel: il prodotto scalare $\Phi^T(\mathbf{x})\Phi(\mathbf{x}_i)$ nello spazio delle feature, calcolato senza la mappatura`,
    },
    { k: 'b', sym: r`b`, desc: r`il bias, ricavato dai moltiplicatori e dalla matrice kernel` },
  ],
  read: r`«h di x è il segno della somma degli alfa i d i per k di x e x i, più b».`,
  why: r`Non si calcola mai $\mathbf{w}$, che vive nello spazio delle feature (anche di dimensione infinita): bastano i support vector memorizzati e il kernel.`,
}

export const epsLoss: FormulaDef = {
  name: 'Loss ε-insensitive',
  tex: r`L_\varepsilon(d, y) = \begin{cases} |d - y| - \part{e}{\varepsilon} & \text{se } |d - y| \ge \varepsilon \ \part{z}{0} & \text{altrimenti} \end{cases}`,
  parts: [
    {
      k: 'e',
      sym: r`\varepsilon`,
      desc: r`la semiampiezza del tubo attorno alla predizione: si paga solo la parte di errore che lo supera`,
    },
    { k: 'z', sym: r`0`, desc: r`gli errori più piccoli di $\varepsilon$ non costano nulla: quei punti non influenzano la soluzione` },
  ],
  read: r`«L epsilon di d e y vale il valore assoluto di d meno y, meno epsilon, se questo è almeno epsilon; zero altrimenti».`,
}
