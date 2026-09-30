import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const lms: FormulaDef = {
  name: 'Least Mean Squares (caso univariato)',
  tex: r`\text{Loss}(h_\mathbf{w}) = E(\mathbf{w}) = \sum_{\part{p}{p=1}}^{l} \big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(x_p)}\big)^{\part{sq}{2}} = \sum_{p=1}^{l} \big(y_p - (\part{w}{w_1 x_p + w_0})\big)^2`,
  parts: [
    { k: 'p', sym: r`p`, desc: r`indice dell’esempio: si sommano i contributi di tutti gli $l$ esempi di training` },
    { k: 'y', sym: r`y_p`, desc: r`il target dell’esempio $p$` },
    { k: 'h', sym: r`h_\mathbf{w}(x_p)`, desc: r`la predizione della retta nel punto $x_p$` },
    {
      k: 'sq',
      sym: r`(\cdot)^2`,
      desc: r`il **residuo** al quadrato: errori positivi e negativi pesano allo stesso modo e quelli grandi pesano di più`,
    },
    { k: 'w', sym: r`w_1 x_p + w_0`, desc: r`la retta: $w_1$ è la pendenza, $w_0$ l’intercetta; sono i due **pesi** da trovare` },
  ],
  read: r`«la loss di h w è E di w, cioè la sommatoria per p da uno a l di y p meno h w di x p, al quadrato».`,
  why: r`Ogni retta candidata lascia dei residui, le distanze verticali tra i punti e la retta: sommarne i quadrati dà un numero che misura quanto la retta è lontana dai dati, e che si può minimizzare.

Dividendo per $l$ si ottiene la media (il *mean* di LMS), che non cambia il punto di minimo.`,
}

export const linModel: FormulaDef = {
  name: 'Modello lineare',
  tex: r`h(\mathbf{x}_p) = \part{x}{\mathbf{x}_p^T}\part{w}{\mathbf{w}} = \sum_{i=\part{i0}{0}}^{n} x_{p,i}\, w_i`,
  parts: [
    {
      k: 'x',
      sym: r`\mathbf{x}_p^T = [1, x_{p,1}, \dots, x_{p,n}]`,
      desc: r`il pattern $p$ con in testa la componente costante $x_0 = 1$`,
    },
    { k: 'w', sym: r`\mathbf{w} = [w_0, w_1, \dots, w_n]^T`, desc: r`i pesi, compresa l’intercetta (**bias**) $w_0$` },
    { k: 'i0', sym: r`i = 0`, desc: r`la somma parte da $0$: il termine $x_{p,0} w_0 = w_0$ è il bias` },
  ],
  read: r`«h di x p è x p trasposto per w, cioè la sommatoria per i da zero a n di x p i per w i».`,
  why: r`Aggiungere $x_0 = 1$ fa entrare il bias nel prodotto scalare: il modello lineare diventa **semplicemente un prodotto scalare** tra input e pesi, senza termini a parte.`,
}

export const ltu: FormulaDef = {
  name: 'Linear Threshold Unit',
  tex: r`h(\mathbf{x}) = \part{s}{\operatorname{sign}}\big(\part{net}{\mathbf{w}^T\mathbf{x} + w_0}\big)`,
  parts: [
    {
      k: 'net',
      sym: r`\mathbf{w}^T\mathbf{x} + w_0`,
      desc: r`la combinazione pesata degli input: positiva da un lato dell’iperpiano, negativa dall’altro, zero sul confine`,
    },
    {
      k: 's',
      sym: r`\operatorname{sign}`,
      desc: r`la **soglia**: $+1$ se l’argomento è $\ge 0$, $-1$ altrimenti (con uscite $0/1$ si usa lo scalino)`,
    },
  ],
  read: r`«h di x è il segno di w trasposto x più w zero».`,
  why: r`Il modello lineare dà un numero; la soglia lo trasforma in una classe. Il confine di decisione è l’iperpiano $\mathbf{w}^T\mathbf{x} + w_0 = 0$, e $-w_0$ è la soglia che la combinazione pesata deve superare.`,
}

export const normal: FormulaDef = {
  name: 'Equazioni normali e soluzione',
  tex: r`(\part{xtx}{X^T X})\,\mathbf{w} = X^T \mathbf{y} \quad\Longrightarrow\quad \mathbf{w} = (X^TX)^{-1}X^T\mathbf{y} = \part{pinv}{X^+}\mathbf{y}`,
  parts: [
    { k: 'xtx', sym: r`X^TX`, desc: r`matrice $(n+1)\times(n+1)$ costruita dai dati; se è non singolare la soluzione è unica` },
    {
      k: 'pinv',
      sym: r`X^+`,
      desc: r`la **pseudoinversa di Moore-Penrose**, definita anche quando $X$ non è invertibile; in pratica si calcola con la SVD`,
    },
  ],
  read: r`«X trasposto X per w uguale a X trasposto y; quindi w è l’inversa di X trasposto X per X trasposto y, cioè X più per y».`,
  why: r`Si ottengono imponendo il gradiente nullo, $\sum_p \delta_p\, x_{p,j} = 0$ per ogni $j$: tutte le equazioni insieme, in forma matriciale, sono $X^T(\mathbf{y} - X\mathbf{w}) = \mathbf{0}$.`,
}

export const deltaRule: FormulaDef = {
  name: 'Delta rule (Widrow-Hoff)',
  tex: r`\Delta w_j = 2\sum_{p=1}^{l} \underbrace{\part{d}{(y_p - \mathbf{x}_p^T\mathbf{w})}}_{\delta_p}\, \part{x}{x_{p,j}}, \qquad \mathbf{w}_{new} = \mathbf{w} + \part{eta}{\eta}\,\Delta\mathbf{w}`,
  parts: [
    { k: 'd', sym: r`\delta_p`, desc: r`l’**errore** sul pattern $p$ (target meno output): se è zero non si corregge nulla` },
    {
      k: 'x',
      sym: r`x_{p,j}`,
      desc: r`l’input $j$: decide quanto e in che verso il peso $w_j$ è responsabile dell’errore (input nullo, peso invariato)`,
    },
    { k: 'eta', sym: r`\eta`, desc: r`il **learning rate**: la lunghezza del passo, compromesso tra velocità e stabilità` },
  ],
  read: r`«delta w j è due volte la sommatoria su p di delta p per x p j; w nuovo è w più eta per delta w».`,
  why: r`$\Delta\mathbf{w}$ è il gradiente **negativo** dell’errore quadratico: muoversi lungo di esso fa scendere l’errore. Letta pattern per pattern è una regola di **correzione dell’errore**: ogni peso cambia in proporzione all’errore e al suo input. La costante $2$ si può assorbire in $\eta$.`,
}

export const tikhonov: FormulaDef = {
  name: 'Loss di Tikhonov (ridge regression)',
  tex: r`\text{Loss}(\mathbf{w}) = \underbrace{\part{err}{\sum_{p=1}^{l}(y_p - \mathbf{x}_p^T\mathbf{w})^2}}_{\text{errore}} + \underbrace{\part{lam}{\lambda}\,\part{pen}{\|\mathbf{w}\|^2}}_{\text{penalità}}`,
  parts: [
    {
      k: 'err',
      sym: r`\sum_p (y_p - \mathbf{x}_p^T\mathbf{w})^2`,
      desc: r`il termine d’errore ($R_{emp}$): spinge il modello a seguire i dati`,
    },
    {
      k: 'pen',
      sym: r`\|\mathbf{w}\|^2 = \sum_j w_j^2`,
      desc: r`la penalità: punisce i pesi grandi, rendendo il modello più liscio e più semplice`,
    },
    {
      k: 'lam',
      sym: r`\lambda`,
      desc: r`l’**iperparametro di regolarizzazione**, scelto in model selection: decide quanto conta la penalità`,
    },
  ],
  read: r`«la loss di w è la somma dei quadrati degli errori più lambda per la norma di w al quadrato».`,
  why: r`È una bilancia: con $\lambda$ piccolo vince l’adattamento ai dati (rischio di overfitting), con $\lambda$ grande vince la semplicità (rischio di underfitting). La soluzione diretta diventa $\mathbf{w} = (X^TX + \lambda I)^{-1}X^T\mathbf{y}$.`,
}

export const knnAvg: FormulaDef = {
  name: 'Media dei k vicini',
  tex: r`\text{avg}_k(\mathbf{x}) = \part{k}{\frac{1}{k}}\sum_{\mathbf{x}_i \in \part{N}{N_k(\mathbf{x})}} \part{y}{y_i}`,
  parts: [
    { k: 'N', sym: r`N_k(\mathbf{x})`, desc: r`l’insieme dei $k$ pattern di training più vicini a $\mathbf{x}$ secondo la distanza $d$` },
    { k: 'y', sym: r`y_i`, desc: r`i loro target (con classi $0/1$, la media è la frazione di vicini di classe 1)` },
    { k: 'k', sym: r`1/k`, desc: r`media sui $k$ vicini: $k$ controlla quanto «locale» è la stima` },
  ],
  read: r`«avg k di x è un k-esimo della somma degli y i, per gli x i nell’intorno N k di x».`,
  why: r`Con target $0/1$ la regola «classe 1 se $\text{avg}_k > 0{,}5$» è esattamente il **voto a maggioranza** tra i vicini. Per la regressione si restituisce direttamente la media.`,
}

export const bayes: FormulaDef = {
  name: 'Classificatore ottimo di Bayes',
  tex: r`h(\mathbf{x}) = \part{am}{\arg\max_v}\; \part{P}{P(v \mid \mathbf{x})}, \qquad v \in \{C_1, \dots, C_K\}`,
  parts: [
    {
      k: 'P',
      sym: r`P(v \mid \mathbf{x})`,
      desc: r`la probabilità della classe $v$ dato l’input: calcolabile solo se si conosce la densità $P(\mathbf{x}, y)$`,
    },
    { k: 'am', sym: r`\arg\max_v`, desc: r`si sceglie la classe più probabile` },
  ],
  read: r`«h di x è l’arg max su v di P di v dato x».`,
  why: r`Nessun classificatore può fare meglio in media: il suo tasso d’errore (Bayes rate) è il minimo raggiungibile. Il K-NN lo approssima stimando $P(v \mid \mathbf{x})$ con le proporzioni delle classi in un intorno di $\mathbf{x}$.`,
}
