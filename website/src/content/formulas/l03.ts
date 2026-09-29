import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const hyperplane: FormulaDef = {
  name: 'Iperpiano separatore',
  tex: r`\part{w}{\mathbf{w}}^T\part{x}{\mathbf{x}} + \part{b}{w_0} = w_1 x_1 + w_2 x_2 + w_0 = 0`,
  parts: [
    { k: 'w', sym: r`\mathbf{w}`, desc: r`vettore dei **pesi** $(w_1, w_2)$: fissa l’orientamento della retta, a cui è perpendicolare` },
    { k: 'x', sym: r`\mathbf{x}`, desc: r`un punto dello spazio degli input, $\mathbf{x} = (x_1, x_2)$` },
    { k: 'b', sym: r`w_0`, desc: r`termine noto (detto anche *bias* o soglia): sposta la retta senza ruotarla` },
  ],
  read: r`«w trasposto x più w zero uguale a zero», cioè «w uno x uno più w due x due più w zero uguale a zero».`,
  why: r`$\mathbf{w}^T\mathbf{x}$ è un prodotto scalare: misura quanto $\mathbf{x}$ è allineato con $\mathbf{w}$. I punti con lo **stesso** valore di $\mathbf{w}^T\mathbf{x}$ stanno su una retta perpendicolare a $\mathbf{w}$; quella con valore esattamente $-w_0$ è il separatore.

Da una parte $\mathbf{w}^T\mathbf{x} + w_0 > 0$, dall’altra $< 0$: il segno dice da che lato del confine si trova il punto.`,
}

export const ltu: FormulaDef = {
  name: 'Linear Threshold Unit',
  tex: r`\part{h}{h(\mathbf{x})} = \begin{cases} 1 & \text{se } \part{a}{\mathbf{w}^T\mathbf{x} + w_0} \ge 0 \\ 0 & \text{altrimenti} \end{cases} \qquad \text{oppure} \qquad h(\mathbf{x}) = \part{s}{\operatorname{sign}}(\mathbf{w}^T\mathbf{x} + w_0)`,
  parts: [
    { k: 'h', sym: r`h(\mathbf{x})`, desc: r`l’**ipotesi**: la classe che il modello assegna all’input $\mathbf{x}$` },
    { k: 'a', sym: r`\mathbf{w}^T\mathbf{x}+w_0`, desc: r`il valore «lineare»: positivo da un lato dell’iperpiano, negativo dall’altro` },
    { k: 's', sym: r`\operatorname{sign}`, desc: r`funzione segno: $+1$ per argomenti positivi, $-1$ per quelli negativi (versione con classi $\pm 1$)` },
  ],
  read: r`«h di x vale uno se w trasposto x più w zero è maggiore o uguale a zero, zero altrimenti; oppure: h di x è il segno di w trasposto x più w zero».`,
  why: r`Le due scritture sono lo stesso classificatore con due codifiche delle classi: $\{0, 1\}$ oppure $\{-1, +1\}$. In entrambi i casi si calcola una quantità lineare e si applica una **soglia** in zero: da qui il nome.`,
}

export const risk: FormulaDef = {
  name: 'Errore (rischio, loss)',
  tex: r`\text{Loss}(h_\mathbf{w}) = \part{e}{E(\mathbf{w})} = \part{m}{\frac{1}{l} \sum_{p=1}^{l}} \part{L}{L\big(h_\mathbf{w}(\mathbf{x}_p), d_p\big)}`,
  parts: [
    { k: 'e', sym: r`E(\mathbf{w})`, desc: r`l’errore dipende dai parametri $\mathbf{w}$: cambiando $\mathbf{w}$ cambia l’ipotesi e quindi l’errore` },
    { k: 'm', sym: r`\frac{1}{l}\sum_{p=1}^{l}`, desc: r`media sugli $l$ esempi: si somma sui pattern $p = 1, \dots, l$ e si divide per $l$` },
    { k: 'L', sym: r`L(h_\mathbf{w}(\mathbf{x}_p), d_p)`, desc: r`la **loss** sul singolo pattern: confronta l’uscita del modello su $\mathbf{x}_p$ con il target $d_p$` },
  ],
  read: r`«E di w è uguale a uno su l per la sommatoria, per p che va da uno a l, di L di h w di x p e d p».`,
  why: r`La loss $L$ giudica **un** esempio; l’errore $E$ riassume il giudizio su **tutto** il dataset. Fare la media (e non la somma) rende l’errore confrontabile tra dataset di dimensioni diverse.`,
}

export const mse: FormulaDef = {
  name: 'Mean Squared Error',
  tex: r`E(\mathbf{w}) = \frac{1}{l} \sum_{p=1}^{l} \part{q}{\big(\part{y}{y_p} - \part{h}{h_\mathbf{w}(\mathbf{x}_p)}\big)^2}`,
  parts: [
    { k: 'y', sym: r`y_p`, desc: r`il target del pattern $p$ (qui indicato con $y$ come nella figura)` },
    { k: 'h', sym: r`h_\mathbf{w}(\mathbf{x}_p)`, desc: r`l’uscita del modello lineare sul pattern $p$` },
    { k: 'q', sym: r`(\cdot)^2`, desc: r`l’errore al quadrato: sempre positivo, e penalizza molto gli errori grandi` },
  ],
  read: r`«E di w è la media, su p, di y p meno h w di x p, al quadrato».`,
  why: r`Perché il quadrato e non il valore assoluto? Rende gli errori tutti positivi (non si compensano tra loro), pesa di più quelli grandi ed è **derivabile** ovunque: una proprietà preziosa quando si minimizza con il gradiente.`,
}

export const zeroOne: FormulaDef = {
  name: 'Loss 0/1',
  tex: r`L(h_\mathbf{w}(\mathbf{x}_p), d_p) = \begin{cases} 0 & \text{se } h_\mathbf{w}(\mathbf{x}_p) = d_p \\ 1 & \text{altrimenti} \end{cases}`,
  read: r`«la loss vale zero se la classe predetta coincide con il target, uno altrimenti».`,
  why: r`Conta semplicemente gli sbagli: la media sul dataset è la **frazione di pattern classificati male**. Non dice *di quanto* si sbaglia, solo *se* si sbaglia.`,
}

export const distortion: FormulaDef = {
  name: 'Distorsione quadratica',
  tex: r`L(h(\mathbf{x}_p)) = \big(\mathbf{x}_p - \part{c}{h(\mathbf{x}_p)}\big) \cdot \big(\mathbf{x}_p - h(\mathbf{x}_p)\big) = \part{n}{\|\mathbf{x}_p - h(\mathbf{x}_p)\|^2}`,
  parts: [
    { k: 'c', sym: r`h(\mathbf{x}_p)`, desc: r`il **centroide** (prototipo) del cluster a cui è assegnato $\mathbf{x}_p$` },
    { k: 'n', sym: r`\|\cdot\|^2`, desc: r`distanza euclidea al quadrato: il prodotto scalare di un vettore con se stesso` },
  ],
  read: r`«la loss è la norma al quadrato di x p meno h di x p».`,
  why: r`Un buon vector quantizer rappresenta ogni punto con un prototipo **vicino**: la distorsione misura proprio quanto è lontano, in media, il rappresentante dal punto rappresentato.`,
}

export const logLoss: FormulaDef = {
  name: 'Loss per la stima di densità',
  tex: r`L(h(\mathbf{x}_p)) = \part{l}{-\ln} \part{h}{h(\mathbf{x}_p)}`,
  parts: [
    { k: 'h', sym: r`h(\mathbf{x}_p)`, desc: r`la densità stimata nel punto osservato $\mathbf{x}_p$` },
    { k: 'l', sym: r`-\ln`, desc: r`meno logaritmo naturale: grande quando $h$ è vicina a $0$, piccolo quando $h$ è alta` },
  ],
  read: r`«meno logaritmo di h di x p».`,
  why: r`Il logaritmo trasforma prodotti in somme: $\ln \prod_p h(\mathbf{x}_p) = \sum_p \ln h(\mathbf{x}_p)$. Quindi minimizzare $\sum_p -\ln h(\mathbf{x}_p)$ equivale a **massimizzare** il prodotto delle probabilità dei dati osservati: la verosimiglianza.`,
}

export const countAll: FormulaDef = {
  name: 'Quante funzioni booleane?',
  tex: r`|H| = 2^{\part{i}{\#\text{istanze di input}}} = 2^{\part{n}{2^n}}`,
  parts: [
    { k: 'i', sym: r`\#\text{istanze}`, desc: r`il numero di input distinti: ogni funzione sceglie liberamente $0$ o $1$ per ciascuno` },
    { k: 'n', sym: r`2^n`, desc: r`con $n$ input binari le istanze sono $2^n$ (ogni bit ha 2 valori)` },
  ],
  why: r`Una funzione booleana è una **tabella di verità**: una colonna di $2^n$ uscite, ognuna $0$ o $1$. Il numero di colonne diverse è $2 \cdot 2 \cdots 2 = 2^{2^n}$. Con $n = 4$: $2^{16} = 65536$; con $n = 10$: $2^{1024} \approx 10^{308}$.`,
}
