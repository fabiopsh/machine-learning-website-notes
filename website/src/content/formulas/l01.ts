import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const dot: FormulaDef = {
  name: 'Prodotto scalare',
  tex: r`\part{a}{\mathbf{a}} \cdot \part{b}{\mathbf{b}} = \part{c}{a_1 b_1} + a_2 b_2 + \dots + a_n b_n = \part{s}{\sum_{i=1}^{n}} a_i b_i = \part{n}{|\mathbf{a}|\,|\mathbf{b}|}\, \part{t}{\cos\theta}`,
  parts: [
    { k: 'a', sym: r`\mathbf{a}`, desc: r`il primo vettore, con componenti $a_1, \dots, a_n$ (in grassetto perché è un vettore)` },
    { k: 'b', sym: r`\mathbf{b}`, desc: r`il secondo vettore, della stessa dimensione $n$` },
    { k: 'c', sym: r`a_1 b_1`, desc: r`prodotto delle prime componenti: si moltiplicano le componenti nella stessa posizione` },
    { k: 's', sym: r`\sum_{i=1}^{n}`, desc: r`sommatoria: somma i termini ottenuti facendo variare l’indice $i$ da $1$ a $n$` },
    { k: 'n', sym: r`|\mathbf{a}|\,|\mathbf{b}|`, desc: r`prodotto delle lunghezze (norme) dei due vettori: sempre $\ge 0$` },
    { k: 't', sym: r`\cos\theta`, desc: r`coseno dell’angolo $\theta$ tra i vettori: $1$ se paralleli, $0$ se ortogonali, $-1$ se opposti` },
  ],
  read: r`«a scalare b è uguale alla sommatoria, per i che va da 1 a n, di a con i per b con i; ed è uguale al modulo di a per il modulo di b per il coseno di theta».`,
  why: r`Le due espressioni dicono la stessa cosa in due linguaggi: quella con la sommatoria è **algebrica** (si calcola dalle componenti), quella con il coseno è **geometrica**.

Siccome $|\mathbf{a}|$ e $|\mathbf{b}|$ non sono mai negativi, il **segno** del prodotto scalare dipende solo da $\cos\theta$: positivo se l’angolo è acuto, nullo se è retto, negativo se è ottuso. Ecco perché misura l’**allineamento** tra due vettori.`,
}

export const norm2: FormulaDef = {
  name: 'Norma euclidea',
  tex: r`\part{n}{\|\mathbf{x}\|_2} = \sqrt{\part{t}{\mathbf{x}^T\mathbf{x}}} = \sqrt{\part{s}{\sum_i x_i^2}} = \part{d}{d(\mathbf{x}, \mathbf{0})}`,
  parts: [
    { k: 'n', sym: r`\|\mathbf{x}\|_2`, desc: r`norma euclidea (o norma 2) di $\mathbf{x}$: la sua lunghezza` },
    { k: 't', sym: r`\mathbf{x}^T\mathbf{x}`, desc: r`$\mathbf{x}$ trasposto per $\mathbf{x}$: il prodotto scalare del vettore con se stesso` },
    { k: 's', sym: r`\sum_i x_i^2`, desc: r`somma dei quadrati delle componenti: è il teorema di Pitagora in $n$ dimensioni` },
    { k: 'd', sym: r`d(\mathbf{x},\mathbf{0})`, desc: r`distanza del punto $\mathbf{x}$ dall’origine $\mathbf{0}$` },
  ],
  read: r`«norma due di x è uguale alla radice di x trasposto x, cioè alla radice della somma, su i, di x con i al quadrato».`,
  why: r`In due dimensioni è esattamente Pitagora: la lunghezza dell’ipotenusa di un triangolo con cateti $x_1$ e $x_2$. In $n$ dimensioni si sommano $n$ quadrati.

Il legame con il prodotto scalare, $\|\mathbf{x}\|^2 = \mathbf{x}^T\mathbf{x}$, è coerente con la formula del coseno: con $\mathbf{a} = \mathbf{b}$ l’angolo è $0$, il coseno vale $1$ e resta $|\mathbf{a}|^2$.`,
}

export const inner: FormulaDef = {
  name: 'Proprietà del prodotto interno',
  tex: r`\part{s}{\langle v, w\rangle = \langle w, v\rangle}, \qquad \part{a}{\langle v+w, u\rangle = \langle v,u\rangle + \langle w,u\rangle}, \qquad \part{o}{\langle kv, w\rangle = k\langle v, w\rangle}`,
  parts: [
    { k: 's', sym: r`\langle v,w\rangle=\langle w,v\rangle`, desc: r`**simmetria**: l’ordine dei due vettori non conta` },
    { k: 'a', sym: r`\langle v+w,u\rangle`, desc: r`**additività**: il prodotto di una somma è la somma dei prodotti` },
    { k: 'o', sym: r`\langle kv,w\rangle`, desc: r`**omogeneità**: uno scalare $k$ si può "portare fuori"` },
  ],
  why: r`Additività e omogeneità insieme dicono che il prodotto è **lineare** nel primo argomento; per la simmetria lo è anche nel secondo. Da qui il nome di forma **bilineare simmetrica**.`,
}

export const cauchy: FormulaDef = {
  name: 'Disuguaglianza di Cauchy-Schwarz',
  tex: r`\part{l}{|\langle x, y\rangle|} \le \part{r}{\|x\|\cdot\|y\|} \qquad \forall\, x, y \in V`,
  parts: [
    { k: 'l', sym: r`|\langle x,y\rangle|`, desc: r`valore assoluto del prodotto interno` },
    { k: 'r', sym: r`\|x\|\cdot\|y\|`, desc: r`prodotto delle norme dei due vettori` },
  ],
  why: r`Nel caso euclideo è una conseguenza immediata della formula del coseno: $|\mathbf{a}\cdot\mathbf{b}| = |\mathbf{a}|\,|\mathbf{b}|\,|\cos\theta|$ e $|\cos\theta| \le 1$. L’uguaglianza vale solo per vettori paralleli.`,
}

export const gradient: FormulaDef = {
  name: 'Gradiente',
  tex: r`\part{g}{\nabla f} = \operatorname{grad} f = \left( \part{p}{\frac{\partial f}{\partial x_1}}, \dots, \frac{\partial f}{\partial x_n} \right) = \sum_{i=1}^{n} \frac{\partial f}{\partial x_i}\, \part{e}{\mathbf{e}_i}`,
  parts: [
    { k: 'g', sym: r`\nabla f`, desc: r`gradiente di $f$ (si legge «nabla f»): un **vettore** con $n$ componenti, una per variabile` },
    { k: 'p', sym: r`\frac{\partial f}{\partial x_1}`, desc: r`derivata parziale rispetto a $x_1$: quanto cambia $f$ muovendo solo $x_1$, con le altre variabili ferme` },
    { k: 'e', sym: r`\mathbf{e}_i`, desc: r`versore della direzione $i$: il vettore lungo $1$ sull’asse $x_i$ (es. $\mathbf{e}_1 = (1, 0, \dots, 0)$)` },
  ],
  read: r`«nabla f, o gradiente di f, è il vettore che ha per componenti le derivate parziali di f rispetto a x uno, …, x n».`,
  why: r`Facendo un piccolo passo $\Delta\mathbf{x}$, la variazione di $f$ è circa la somma dei contributi delle singole coordinate: $\Delta f \approx \nabla f \cdot \Delta\mathbf{x}$. È un **prodotto scalare**!

Per un passo di lunghezza fissata, il prodotto scalare è massimo quando $\Delta\mathbf{x}$ è parallelo a $\nabla f$ e minimo (negativo) quando è opposto: per questo $\nabla f$ indica la direzione di massima crescita e $-\nabla f$ quella di massima decrescita.

Lungo una curva di livello $f$ non cambia, quindi $\nabla f \cdot \Delta\mathbf{x} = 0$: il gradiente è **perpendicolare** alle curve di livello.`,
}

export const gaussian: FormulaDef = {
  name: 'Densità gaussiana',
  tex: r`\part{f}{f(x)} = \part{k}{\frac{1}{\sigma\sqrt{2\pi}}}\, e^{\part{q}{-(x-\part{m}{\mu})^2 / (2\part{s}{\sigma^2})}}`,
  parts: [
    { k: 'f', sym: r`f(x)`, desc: r`densità di probabilità nel punto $x$. Non è una probabilità: le probabilità sono **aree** sotto la curva` },
    { k: 'k', sym: r`\frac{1}{\sigma\sqrt{2\pi}}`, desc: r`costante di normalizzazione: fa sì che l’area totale sotto la curva valga $1$` },
    { k: 'q', sym: r`-\frac{(x-\mu)^2}{2\sigma^2}`, desc: r`esponente: sempre $\le 0$, vale $0$ solo in $x = \mu$ — lì la curva ha il massimo` },
    { k: 'm', sym: r`\mu`, desc: r`media («mu»): il centro della campana` },
    { k: 's', sym: r`\sigma^2`, desc: r`varianza («sigma quadro»); $\sigma$ è la deviazione standard e regola la larghezza` },
  ],
  read: r`«f di x è uguale a uno su sigma per radice di due pi greco, per e elevato a meno x meno mu al quadrato, fratto due sigma quadro».`,
  why: r`La forma a campana viene da $e^{-u^2}$: vale $1$ per $u = 0$ e scende rapidamente, in modo simmetrico, allontanandosi da lì. Qui $u$ è la distanza di $x$ dalla media, misurata in unità di $\sigma$.

Quindi $\mu$ **sposta** la campana e $\sigma$ la **allarga** o la stringe. Quando si allarga, la costante $\frac{1}{\sigma\sqrt{2\pi}}$ la abbassa nella stessa proporzione: l’area totale resta $1$.`,
}
