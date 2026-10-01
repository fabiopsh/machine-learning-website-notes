import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const dot: FormulaDef = {
  name: tx('Prodotto scalare', 'Dot product'),
  tex: r`\part{a}{\mathbf{a}} \cdot \part{b}{\mathbf{b}} = \part{c}{a_1 b_1} + a_2 b_2 + \dots + a_n b_n = \part{s}{\sum_{i=1}^{n}} a_i b_i = \part{n}{|\mathbf{a}|\,|\mathbf{b}|}\, \part{t}{\cos\theta}`,
  parts: [
    {
      k: 'a',
      sym: r`\mathbf{a}`,
      desc: tx(
        r`il primo vettore, con componenti $a_1, \dots, a_n$ (in grassetto perché è un vettore)`,
        r`the first vector, with components $a_1, \dots, a_n$ (in bold because it is a vector)`,
      ),
    },
    { k: 'b', sym: r`\mathbf{b}`, desc: tx(r`il secondo vettore, della stessa dimensione $n$`, r`the second vector, of the same dimension $n$`) },
    {
      k: 'c',
      sym: r`a_1 b_1`,
      desc: tx(
        r`prodotto delle prime componenti: si moltiplicano le componenti nella stessa posizione`,
        r`product of the first components: components in the same position are multiplied`,
      ),
    },
    {
      k: 's',
      sym: r`\sum_{i=1}^{n}`,
      desc: tx(
        r`sommatoria: somma i termini ottenuti facendo variare l’indice $i$ da $1$ a $n$`,
        r`summation: it adds up the terms obtained by letting the index $i$ range from $1$ to $n$`,
      ),
    },
    {
      k: 'n',
      sym: r`|\mathbf{a}|\,|\mathbf{b}|`,
      desc: tx(
        r`prodotto delle lunghezze (norme) dei due vettori: sempre $\ge 0$`,
        r`product of the lengths (norms) of the two vectors: always $\ge 0$`,
      ),
    },
    {
      k: 't',
      sym: r`\cos\theta`,
      desc: tx(
        r`coseno dell’angolo $\theta$ tra i vettori: $1$ se paralleli, $0$ se ortogonali, $-1$ se opposti`,
        r`cosine of the angle $\theta$ between the vectors: $1$ if parallel, $0$ if orthogonal, $-1$ if opposite`,
      ),
    },
  ],
  read: tx(
    r`«a scalare b è uguale alla sommatoria, per i che va da 1 a n, di a con i per b con i; ed è uguale al modulo di a per il modulo di b per il coseno di theta».`,
    r`“a dot b equals the sum, for i from 1 to n, of a sub i times b sub i; and it equals the modulus of a times the modulus of b times the cosine of theta.”`,
  ),
  why: tx(
    r`Le due espressioni dicono la stessa cosa in due linguaggi: quella con la sommatoria è **algebrica** (si calcola dalle componenti), quella con il coseno è **geometrica**.

Siccome $|\mathbf{a}|$ e $|\mathbf{b}|$ non sono mai negativi, il **segno** del prodotto scalare dipende solo da $\cos\theta$: positivo se l’angolo è acuto, nullo se è retto, negativo se è ottuso. Ecco perché misura l’**allineamento** tra due vettori.`,
    r`The two expressions say the same thing in two languages: the one with the summation is **algebraic** (it is computed from the components), the one with the cosine is **geometric**.

Since $|\mathbf{a}|$ and $|\mathbf{b}|$ are never negative, the **sign** of the dot product depends only on $\cos\theta$: positive if the angle is acute, zero if it is right, negative if it is obtuse. This is why it measures the **alignment** between two vectors.`,
  ),
}

export const norm2: FormulaDef = {
  name: tx('Norma euclidea', 'Euclidean norm'),
  tex: r`\part{n}{\|\mathbf{x}\|_2} = \sqrt{\part{t}{\mathbf{x}^T\mathbf{x}}} = \sqrt{\part{s}{\sum_i x_i^2}} = \part{d}{d(\mathbf{x}, \mathbf{0})}`,
  parts: [
    {
      k: 'n',
      sym: r`\|\mathbf{x}\|_2`,
      desc: tx(r`norma euclidea (o norma 2) di $\mathbf{x}$: la sua lunghezza`, r`Euclidean norm (or 2-norm) of $\mathbf{x}$: its length`),
    },
    {
      k: 't',
      sym: r`\mathbf{x}^T\mathbf{x}`,
      desc: tx(
        r`$\mathbf{x}$ trasposto per $\mathbf{x}$: il prodotto scalare del vettore con se stesso`,
        r`$\mathbf{x}$ transpose times $\mathbf{x}$: the dot product of the vector with itself`,
      ),
    },
    {
      k: 's',
      sym: r`\sum_i x_i^2`,
      desc: tx(
        r`somma dei quadrati delle componenti: è il teorema di Pitagora in $n$ dimensioni`,
        r`sum of the squares of the components: it is the Pythagorean theorem in $n$ dimensions`,
      ),
    },
    {
      k: 'd',
      sym: r`d(\mathbf{x},\mathbf{0})`,
      desc: tx(r`distanza del punto $\mathbf{x}$ dall’origine $\mathbf{0}$`, r`distance of the point $\mathbf{x}$ from the origin $\mathbf{0}$`),
    },
  ],
  read: tx(
    r`«norma due di x è uguale alla radice di x trasposto x, cioè alla radice della somma, su i, di x con i al quadrato».`,
    r`“the two-norm of x equals the square root of x transpose x, that is, the square root of the sum, over i, of x sub i squared.”`,
  ),
  why: tx(
    r`In due dimensioni è esattamente Pitagora: la lunghezza dell’ipotenusa di un triangolo con cateti $x_1$ e $x_2$. In $n$ dimensioni si sommano $n$ quadrati.

Il legame con il prodotto scalare, $\|\mathbf{x}\|^2 = \mathbf{x}^T\mathbf{x}$, è coerente con la formula del coseno: con $\mathbf{a} = \mathbf{b}$ l’angolo è $0$, il coseno vale $1$ e resta $|\mathbf{a}|^2$.`,
    r`In two dimensions it is exactly Pythagoras: the length of the hypotenuse of a triangle with legs $x_1$ and $x_2$. In $n$ dimensions one adds up $n$ squares.

The link with the dot product, $\|\mathbf{x}\|^2 = \mathbf{x}^T\mathbf{x}$, is consistent with the cosine formula: with $\mathbf{a} = \mathbf{b}$ the angle is $0$, the cosine is $1$ and what remains is $|\mathbf{a}|^2$.`,
  ),
}

export const inner: FormulaDef = {
  name: tx('Proprietà del prodotto interno', 'Properties of the inner product'),
  tex: r`\part{s}{\langle v, w\rangle = \langle w, v\rangle}, \qquad \part{a}{\langle v+w, u\rangle = \langle v,u\rangle + \langle w,u\rangle}, \qquad \part{o}{\langle kv, w\rangle = k\langle v, w\rangle}`,
  parts: [
    {
      k: 's',
      sym: r`\langle v,w\rangle=\langle w,v\rangle`,
      desc: tx(r`**simmetria**: l’ordine dei due vettori non conta`, r`**symmetry**: the order of the two vectors does not matter`),
    },
    {
      k: 'a',
      sym: r`\langle v+w,u\rangle`,
      desc: tx(
        r`**additività**: il prodotto di una somma è la somma dei prodotti`,
        r`**additivity**: the product of a sum is the sum of the products`,
      ),
    },
    {
      k: 'o',
      sym: r`\langle kv,w\rangle`,
      desc: tx(r`**omogeneità**: uno scalare $k$ si può "portare fuori"`, r`**homogeneity**: a scalar $k$ can be “pulled out”`),
    },
  ],
  why: tx(
    r`Additività e omogeneità insieme dicono che il prodotto è **lineare** nel primo argomento; per la simmetria lo è anche nel secondo. Da qui il nome di forma **bilineare simmetrica**.`,
    r`Additivity and homogeneity together say that the product is **linear** in the first argument; by symmetry it is linear in the second as well. Hence the name **symmetric bilinear** form.`,
  ),
}

export const cauchy: FormulaDef = {
  name: tx('Disuguaglianza di Cauchy-Schwarz', 'Cauchy-Schwarz inequality'),
  tex: r`\part{l}{|\langle x, y\rangle|} \le \part{r}{\|x\|\cdot\|y\|} \qquad \forall\, x, y \in V`,
  parts: [
    { k: 'l', sym: r`|\langle x,y\rangle|`, desc: tx(r`valore assoluto del prodotto interno`, r`absolute value of the inner product`) },
    { k: 'r', sym: r`\|x\|\cdot\|y\|`, desc: tx(r`prodotto delle norme dei due vettori`, r`product of the norms of the two vectors`) },
  ],
  why: tx(
    r`Nel caso euclideo è una conseguenza immediata della formula del coseno: $|\mathbf{a}\cdot\mathbf{b}| = |\mathbf{a}|\,|\mathbf{b}|\,|\cos\theta|$ e $|\cos\theta| \le 1$. L’uguaglianza vale solo per vettori paralleli.`,
    r`In the Euclidean case it is an immediate consequence of the cosine formula: $|\mathbf{a}\cdot\mathbf{b}| = |\mathbf{a}|\,|\mathbf{b}|\,|\cos\theta|$ and $|\cos\theta| \le 1$. Equality holds only for parallel vectors.`,
  ),
}

export const gradient: FormulaDef = {
  name: tx('Gradiente', 'Gradient'),
  tex: r`\part{g}{\nabla f} = \operatorname{grad} f = \left( \part{p}{\frac{\partial f}{\partial x_1}}, \dots, \frac{\partial f}{\partial x_n} \right) = \sum_{i=1}^{n} \frac{\partial f}{\partial x_i}\, \part{e}{\mathbf{e}_i}`,
  parts: [
    {
      k: 'g',
      sym: r`\nabla f`,
      desc: tx(
        r`gradiente di $f$ (si legge «nabla f»): un **vettore** con $n$ componenti, una per variabile`,
        r`gradient of $f$ (read “nabla f”): a **vector** with $n$ components, one per variable`,
      ),
    },
    {
      k: 'p',
      sym: r`\frac{\partial f}{\partial x_1}`,
      desc: tx(
        r`derivata parziale rispetto a $x_1$: quanto cambia $f$ muovendo solo $x_1$, con le altre variabili ferme`,
        r`partial derivative with respect to $x_1$: how much $f$ changes when only $x_1$ moves, with the other variables held fixed`,
      ),
    },
    {
      k: 'e',
      sym: r`\mathbf{e}_i`,
      desc: tx(
        r`versore della direzione $i$: il vettore lungo $1$ sull’asse $x_i$ (es. $\mathbf{e}_1 = (1, 0, \dots, 0)$)`,
        r`unit vector of direction $i$: the vector of length $1$ along the $x_i$ axis (e.g. $\mathbf{e}_1 = (1, 0, \dots, 0)$)`,
      ),
    },
  ],
  read: tx(
    r`«nabla f, o gradiente di f, è il vettore che ha per componenti le derivate parziali di f rispetto a x uno, …, x n».`,
    r`“nabla f, or the gradient of f, is the vector whose components are the partial derivatives of f with respect to x one, …, x n.”`,
  ),
  why: tx(
    r`Facendo un piccolo passo $\Delta\mathbf{x}$, la variazione di $f$ è circa la somma dei contributi delle singole coordinate: $\Delta f \approx \nabla f \cdot \Delta\mathbf{x}$. È un **prodotto scalare**!

Per un passo di lunghezza fissata, il prodotto scalare è massimo quando $\Delta\mathbf{x}$ è parallelo a $\nabla f$ e minimo (negativo) quando è opposto: per questo $\nabla f$ indica la direzione di massima crescita e $-\nabla f$ quella di massima decrescita.

Lungo una curva di livello $f$ non cambia, quindi $\nabla f \cdot \Delta\mathbf{x} = 0$: il gradiente è **perpendicolare** alle curve di livello.`,
    r`Taking a small step $\Delta\mathbf{x}$, the change in $f$ is approximately the sum of the contributions of the individual coordinates: $\Delta f \approx \nabla f \cdot \Delta\mathbf{x}$. It is a **dot product**!

For a step of fixed length, the dot product is largest when $\Delta\mathbf{x}$ is parallel to $\nabla f$ and smallest (negative) when it is opposite: this is why $\nabla f$ indicates the direction of steepest increase and $-\nabla f$ that of steepest decrease.

Along a level curve $f$ does not change, so $\nabla f \cdot \Delta\mathbf{x} = 0$: the gradient is **perpendicular** to the level curves.`,
  ),
}

export const gaussian: FormulaDef = {
  name: tx('Densità gaussiana', 'Gaussian density'),
  tex: r`\part{f}{f(x)} = \part{k}{\frac{1}{\sigma\sqrt{2\pi}}}\, e^{\part{q}{-(x-\part{m}{\mu})^2 / (2\part{s}{\sigma^2})}}`,
  parts: [
    {
      k: 'f',
      sym: r`f(x)`,
      desc: tx(
        r`densità di probabilità nel punto $x$. Non è una probabilità: le probabilità sono **aree** sotto la curva`,
        r`probability density at the point $x$. It is not a probability: probabilities are **areas** under the curve`,
      ),
    },
    {
      k: 'k',
      sym: r`\frac{1}{\sigma\sqrt{2\pi}}`,
      desc: tx(
        r`costante di normalizzazione: fa sì che l’area totale sotto la curva valga $1$`,
        r`normalization constant: it makes the total area under the curve equal to $1$`,
      ),
    },
    {
      k: 'q',
      sym: r`-\frac{(x-\mu)^2}{2\sigma^2}`,
      desc: tx(
        r`esponente: sempre $\le 0$, vale $0$ solo in $x = \mu$ — lì la curva ha il massimo`,
        r`exponent: always $\le 0$, equal to $0$ only at $x = \mu$ — there the curve has its maximum`,
      ),
    },
    { k: 'm', sym: r`\mu`, desc: tx(r`media («mu»): il centro della campana`, r`mean (“mu”): the center of the bell`) },
    {
      k: 's',
      sym: r`\sigma^2`,
      desc: tx(
        r`varianza («sigma quadro»); $\sigma$ è la deviazione standard e regola la larghezza`,
        r`variance (“sigma squared”); $\sigma$ is the standard deviation and controls the width`,
      ),
    },
  ],
  read: tx(
    r`«f di x è uguale a uno su sigma per radice di due pi greco, per e elevato a meno x meno mu al quadrato, fratto due sigma quadro».`,
    r`“f of x equals one over sigma times the square root of two pi, times e to the power of minus x minus mu squared, over two sigma squared.”`,
  ),
  why: tx(
    r`La forma a campana viene da $e^{-u^2}$: vale $1$ per $u = 0$ e scende rapidamente, in modo simmetrico, allontanandosi da lì. Qui $u$ è la distanza di $x$ dalla media, misurata in unità di $\sigma$.

Quindi $\mu$ **sposta** la campana e $\sigma$ la **allarga** o la stringe. Quando si allarga, la costante $\frac{1}{\sigma\sqrt{2\pi}}$ la abbassa nella stessa proporzione: l’area totale resta $1$.`,
    r`The bell shape comes from $e^{-u^2}$: it equals $1$ for $u = 0$ and drops rapidly, symmetrically, moving away from there. Here $u$ is the distance of $x$ from the mean, measured in units of $\sigma$.

So $\mu$ **shifts** the bell and $\sigma$ **widens** or narrows it. When it widens, the constant $\frac{1}{\sigma\sqrt{2\pi}}$ lowers it in the same proportion: the total area remains $1$.`,
  ),
}
