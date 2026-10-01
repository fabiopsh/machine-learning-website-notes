import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const unit: FormulaDef = {
  name: tx('L’unità (neurone artificiale)', 'The unit (artificial neuron)'),
  tex: r`\part{net}{net_i(\mathbf{x})} = \sum_j \part{w}{w_{ij}}\, \part{x}{x_j}, \qquad \part{o}{o_i(\mathbf{x})} = \part{f}{f}\big(net_i(\mathbf{x})\big)`,
  parts: [
    {
      k: 'net',
      sym: r`net_i`,
      desc: tx(
        r`l’**input netto** dell’unità $i$: la somma pesata dei suoi input (bias compreso, con $x_0 = 1$)`,
        r`the **net input** of unit $i$: the weighted sum of its inputs (bias included, with $x_0 = 1$)`,
      ),
    },
    {
      k: 'w',
      sym: r`w_{ij}`,
      desc: tx(
        r`il peso della connessione **da** $j$ **verso** l’unità $i$: il primo indice è l’unità che riceve`,
        r`the weight of the connection **from** $j$ **to** unit $i$: the first index is the receiving unit`,
      ),
    },
    {
      k: 'x',
      sym: r`x_j`,
      desc: tx(
        r`l’input $j$: da una sorgente esterna o dall’uscita di un’altra unità`,
        r`input $j$: from an external source or from the output of another unit`,
      ),
    },
    {
      k: 'f',
      sym: r`f`,
      desc: tx(
        r`la **funzione di attivazione**: lineare, a soglia, sigmoidale…`,
        r`the **activation function**: linear, threshold, sigmoidal…`,
      ),
    },
    { k: 'o', sym: r`o_i`, desc: tx(r`l’uscita dell’unità`, r`the output of the unit`) },
  ],
  read: tx(
    r`«net i di x è la somma su j di w i j per x j; o i di x è f di net i di x».`,
    r`“net i of x is the sum over j of w i j times x j; o i of x is f of net i of x.”`,
  ),
  why: tx(
    r`È l’analogo artificiale del neurone: le sinapsi diventano pesi (i parametri liberi che l’apprendimento modifica), il soma diventa la somma pesata, la soglia di attivazione diventa la funzione $f$.`,
    r`It is the artificial analog of the neuron: the synapses become weights (the free parameters that learning modifies), the soma becomes the weighted sum, the firing threshold becomes the function $f$.`,
  ),
}

export const perceptronRule: FormulaDef = {
  name: tx('Regola del Perceptron', 'Perceptron rule'),
  tex: tx(
    r`\mathbf{w}_{new} = \mathbf{w} + \part{eta}{\eta}\, \part{d}{d}\, \part{x}{\mathbf{x}} \qquad \text{solo se } \part{out}{\operatorname{sign}(\mathbf{w}^T\mathbf{x})} \ne d`,
    r`\mathbf{w}_{new} = \mathbf{w} + \part{eta}{\eta}\, \part{d}{d}\, \part{x}{\mathbf{x}} \qquad \text{only if } \part{out}{\operatorname{sign}(\mathbf{w}^T\mathbf{x})} \ne d`,
  ),
  parts: [
    { k: 'eta', sym: r`\eta`, desc: tx(r`il learning rate, in $(0, 1)$`, r`the learning rate, in $(0, 1)$`) },
    {
      k: 'd',
      sym: r`d \in \{+1, -1\}`,
      desc: tx(
        r`il target: decide se $\mathbf{x}$ viene sommato (falso negativo) o sottratto (falso positivo)`,
        r`the target: it decides whether $\mathbf{x}$ is added (false negative) or subtracted (false positive)`,
      ),
    },
    {
      k: 'x',
      sym: r`\mathbf{x}`,
      desc: tx(r`il pattern classificato male (bias compreso)`, r`the misclassified pattern (bias included)`),
    },
    {
      k: 'out',
      sym: r`\operatorname{sign}(\mathbf{w}^T\mathbf{x})`,
      desc: tx(
        r`l’uscita **con la soglia**: se coincide con $d$ i pesi non cambiano`,
        r`the **thresholded** output: if it coincides with $d$ the weights do not change`,
      ),
    },
  ],
  read: tx(
    r`«w nuovo è w più eta per d per x, quando il segno di w trasposto x è diverso da d».`,
    r`“w new is w plus eta times d times x, when the sign of w transpose x is different from d.”`,
  ),
  why: tx(
    r`Geometricamente, sommare $\eta d\mathbf{x}$ ruota $\mathbf{w}$ verso il pattern (se $d = +1$) o lontano da esso (se $d = -1$), e con lui il confine di decisione, che è ortogonale a $\mathbf{w}$.

In forma equivalente $\mathbf{w}_{new} = \mathbf{w} + \tfrac12\eta(d - out)\mathbf{x}$: $d - out$ vale $0$ se il pattern è corretto e $\pm 2$ se è sbagliato.`,
    r`Geometrically, adding $\eta d\mathbf{x}$ rotates $\mathbf{w}$ toward the pattern (if $d = +1$) or away from it (if $d = -1$), and with it the decision boundary, which is orthogonal to $\mathbf{w}$.

In equivalent form $\mathbf{w}_{new} = \mathbf{w} + \tfrac12\eta(d - out)\mathbf{x}$: $d - out$ is $0$ if the pattern is correct and $\pm 2$ if it is wrong.`,
  ),
}

export const convergence: FormulaDef = {
  name: tx('Bound sul numero di errori', 'Bound on the number of errors'),
  tex: r`q\,\part{b}{\beta} \;\ge\; \|\mathbf{w}(q)\|^2 \;\ge\; \frac{(q\,\part{a}{\alpha})^2}{\|\part{ws}{\mathbf{w}^*}\|^2} \quad\Longrightarrow\quad q \le \frac{\beta\,\|\mathbf{w}^*\|^2}{\alpha^2}`,
  parts: [
    {
      k: 'b',
      sym: r`\beta = \max_i \|\mathbf{x}_i\|^2`,
      desc: tx(
        r`quanto sono «grandi» i pattern: dà il limite **superiore**, lineare in $q$`,
        r`how “large” the patterns are: it gives the **upper** bound, linear in $q$`,
      ),
    },
    {
      k: 'a',
      sym: r`\alpha = \min_i d_i(\mathbf{w}^*\mathbf{x}_i)`,
      desc: tx(
        r`il margine minimo della soluzione $\mathbf{w}^*$: dà il limite **inferiore**, quadratico in $q$`,
        r`the minimum margin of the solution $\mathbf{w}^*$: it gives the **lower** bound, quadratic in $q$`,
      ),
    },
    {
      k: 'ws',
      sym: r`\mathbf{w}^*`,
      desc: tx(
        r`una soluzione che separa i dati (esiste perché il problema è linearmente separabile)`,
        r`a solution that separates the data (it exists because the problem is linearly separable)`,
      ),
    },
  ],
  read: tx(
    r`«q beta è maggiore o uguale alla norma di w di q al quadrato, che è maggiore o uguale a q alfa al quadrato fratto la norma di w star al quadrato; quindi q è al più beta per la norma di w star al quadrato fratto alfa al quadrato».`,
    r`“q beta is greater than or equal to the norm of w of q squared, which is greater than or equal to q alpha squared over the norm of w star squared; hence q is at most beta times the norm of w star squared over alpha squared.”`,
  ),
  why: tx(
    r`La norma dei pesi deve crescere **almeno** come $q^2$ (ogni errore la avvicina a $\mathbf{w}^*$) ma **al più** come $q$ (ogni errore aggiunge al massimo $\beta$). Una parabola supera prima o poi una retta: oltre $q_{max}$ i due limiti sono incompatibili, quindi gli errori sono finiti.`,
    r`The norm of the weights must grow **at least** like $q^2$ (each error brings it closer to $\mathbf{w}^*$) but **at most** like $q$ (each error adds at most $\beta$). A parabola sooner or later exceeds a line: beyond $q_{max}$ the two bounds are incompatible, so the errors are finite.`,
  ),
}

export const logistic: FormulaDef = {
  name: tx('Sigmoide logistica', 'Logistic sigmoid'),
  tex: r`f_\sigma(x) = \frac{1}{1 + e^{-\part{a}{a}x}}`,
  parts: [
    {
      k: 'a',
      sym: r`a`,
      desc: tx(
        r`la **pendenza** (*slope*): con $a \to 0$ la funzione diventa lineare (piatta), con $a \to \infty$ diventa un gradino`,
        r`the **slope**: with $a \to 0$ the function becomes linear (flat), with $a \to \infty$ it becomes a step`,
      ),
    },
  ],
  read: tx(r`«f sigma di x è uno fratto uno più e alla meno a x».`, r`“f sigma of x is one over one plus e to the minus a x.”`),
  why: tx(
    r`È una soglia **liscia e differenziabile**: vale $0{,}5$ in zero, tende a $0$ e a $1$ agli estremi e vicino a zero è quasi lineare. La derivabilità è ciò che permette di usare la discesa del gradiente.`,
    r`It is a **smooth and differentiable** threshold: it equals $0.5$ at zero, tends to $0$ and to $1$ at the extremes and is almost linear near zero. Differentiability is what makes it possible to use gradient descent.`,
  ),
}

export const sigmoidDelta: FormulaDef = {
  name: tx('Delta per un’unità sigmoidale', 'Delta for a sigmoidal unit'),
  tex: r`\mathbf{w}_{new} = \mathbf{w} + \eta\,\delta_p\,\mathbf{x}_p, \qquad \delta_p = \part{err}{\big(d_p - o(\mathbf{x}_p)\big)}\, \part{fp}{f'_\sigma\big(net(\mathbf{x}_p)\big)}`,
  parts: [
    {
      k: 'err',
      sym: r`d_p - o(\mathbf{x}_p)`,
      desc: tx(r`l’errore sull’uscita, come nell’LMS lineare`, r`the error on the output, as in linear LMS`),
    },
    {
      k: 'fp',
      sym: r`f'_\sigma(net)`,
      desc: tx(
        r`la derivata della sigmoide nel punto di lavoro: massima vicino a $net = 0$, quasi nulla se l’unità è satura`,
        r`the derivative of the sigmoid at the operating point: maximal near $net = 0$, almost zero if the unit is saturated`,
      ),
    },
  ],
  read: tx(
    r`«w nuovo è w più eta per delta p per x p, con delta p uguale a d p meno o di x p, per f sigma primo di net di x p».`,
    r`“w new is w plus eta times delta p times x p, with delta p equal to d p minus o of x p, times f sigma prime of net of x p.”`,
  ),
  why: tx(
    r`Viene dalla regola della catena $\frac{\partial E_p}{\partial w_j} = \frac{\partial E_p}{\partial o_p}\frac{\partial o_p}{\partial net_p}\frac{\partial net_p}{\partial w_j}$: rispetto all’unità lineare compare in più il fattore $f'_\sigma$, che rende piccola la correzione quando l’uscita è già saturata vicino al target.`,
    r`It comes from the chain rule $\frac{\partial E_p}{\partial w_j} = \frac{\partial E_p}{\partial o_p}\frac{\partial o_p}{\partial net_p}\frac{\partial net_p}{\partial w_j}$: compared with the linear unit there is the extra factor $f'_\sigma$, which makes the correction small when the output is already saturated close to the target.`,
  ),
}

export const mlp: FormulaDef = {
  name: tx('Il MLP come funzione', 'The MLP as a function'),
  tex: r`h(\mathbf{x}) = \part{fk}{f_k}\Big(\sum_j \part{wkj}{w_{kj}}\, \part{fj}{f_j\big(\textstyle\sum_i w_{ji}\, x_i\big)}\Big)`,
  parts: [
    {
      k: 'fj',
      sym: r`f_j\big(\sum_i w_{ji} x_i\big)`,
      desc: tx(
        r`l’uscita dell’unità nascosta $j$: una **feature derivata non lineare**, cioè una funzione di base $\phi_j(\mathbf{x}, \mathbf{w})$ che dipende dai pesi`,
        r`the output of hidden unit $j$: a **nonlinear derived feature**, that is, a basis function $\phi_j(\mathbf{x}, \mathbf{w})$ that depends on the weights`,
      ),
    },
    {
      k: 'wkj',
      sym: r`w_{kj}`,
      desc: tx(r`i pesi dallo strato nascosto all’uscita`, r`the weights from the hidden layer to the output`),
    },
    {
      k: 'fk',
      sym: r`f_k`,
      desc: tx(
        r`l’attivazione dell’uscita: sigmoidale per la classificazione, lineare per la regressione`,
        r`the activation of the output: sigmoidal for classification, linear for regression`,
      ),
    },
  ],
  read: tx(
    r`«h di x è f k della somma su j di w k j per f j della somma su i di w j i per x i».`,
    r`“h of x is f k of the sum over j of w k j times f j of the sum over i of w j i times x i.”`,
  ),
  why: tx(
    r`È una composizione di funzioni lineari e non lineari. Confrontata con la linear basis expansion $\sum_j w_j\phi_j(\mathbf{x})$, la differenza è che qui le basi **si adattano ai dati** durante l’addestramento.`,
    r`It is a composition of linear and nonlinear functions. Compared with the linear basis expansion $\sum_j w_j\phi_j(\mathbf{x})$, the difference is that here the bases **adapt to the data** during training.`,
  ),
}
