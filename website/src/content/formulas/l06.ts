import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const unit: FormulaDef = {
  name: 'L’unità (neurone artificiale)',
  tex: r`\part{net}{net_i(\mathbf{x})} = \sum_j \part{w}{w_{ij}}\, \part{x}{x_j}, \qquad \part{o}{o_i(\mathbf{x})} = \part{f}{f}\big(net_i(\mathbf{x})\big)`,
  parts: [
    { k: 'net', sym: r`net_i`, desc: r`l’**input netto** dell’unità $i$: la somma pesata dei suoi input (bias compreso, con $x_0 = 1$)` },
    { k: 'w', sym: r`w_{ij}`, desc: r`il peso della connessione **da** $j$ **verso** l’unità $i$: il primo indice è l’unità che riceve` },
    { k: 'x', sym: r`x_j`, desc: r`l’input $j$: da una sorgente esterna o dall’uscita di un’altra unità` },
    { k: 'f', sym: r`f`, desc: r`la **funzione di attivazione**: lineare, a soglia, sigmoidale…` },
    { k: 'o', sym: r`o_i`, desc: r`l’uscita dell’unità` },
  ],
  read: r`«net i di x è la somma su j di w i j per x j; o i di x è f di net i di x».`,
  why: r`È l’analogo artificiale del neurone: le sinapsi diventano pesi (i parametri liberi che l’apprendimento modifica), il soma diventa la somma pesata, la soglia di attivazione diventa la funzione $f$.`,
}

export const perceptronRule: FormulaDef = {
  name: 'Regola del Perceptron',
  tex: r`\mathbf{w}_{new} = \mathbf{w} + \part{eta}{\eta}\, \part{d}{d}\, \part{x}{\mathbf{x}} \qquad \text{solo se } \part{out}{\operatorname{sign}(\mathbf{w}^T\mathbf{x})} \ne d`,
  parts: [
    { k: 'eta', sym: r`\eta`, desc: r`il learning rate, in $(0, 1)$` },
    { k: 'd', sym: r`d \in \{+1, -1\}`, desc: r`il target: decide se $\mathbf{x}$ viene sommato (falso negativo) o sottratto (falso positivo)` },
    { k: 'x', sym: r`\mathbf{x}`, desc: r`il pattern classificato male (bias compreso)` },
    { k: 'out', sym: r`\operatorname{sign}(\mathbf{w}^T\mathbf{x})`, desc: r`l’uscita **con la soglia**: se coincide con $d$ i pesi non cambiano` },
  ],
  read: r`«w nuovo è w più eta per d per x, quando il segno di w trasposto x è diverso da d».`,
  why: r`Geometricamente, sommare $\eta d\mathbf{x}$ ruota $\mathbf{w}$ verso il pattern (se $d = +1$) o lontano da esso (se $d = -1$), e con lui il confine di decisione, che è ortogonale a $\mathbf{w}$.

In forma equivalente $\mathbf{w}_{new} = \mathbf{w} + \tfrac12\eta(d - out)\mathbf{x}$: $d - out$ vale $0$ se il pattern è corretto e $\pm 2$ se è sbagliato.`,
}

export const convergence: FormulaDef = {
  name: 'Bound sul numero di errori',
  tex: r`q\,\part{b}{\beta} \;\ge\; \|\mathbf{w}(q)\|^2 \;\ge\; \frac{(q\,\part{a}{\alpha})^2}{\|\part{ws}{\mathbf{w}^*}\|^2} \quad\Longrightarrow\quad q \le \frac{\beta\,\|\mathbf{w}^*\|^2}{\alpha^2}`,
  parts: [
    { k: 'b', sym: r`\beta = \max_i \|\mathbf{x}_i\|^2`, desc: r`quanto sono «grandi» i pattern: dà il limite **superiore**, lineare in $q$` },
    { k: 'a', sym: r`\alpha = \min_i d_i(\mathbf{w}^*\mathbf{x}_i)`, desc: r`il margine minimo della soluzione $\mathbf{w}^*$: dà il limite **inferiore**, quadratico in $q$` },
    { k: 'ws', sym: r`\mathbf{w}^*`, desc: r`una soluzione che separa i dati (esiste perché il problema è linearmente separabile)` },
  ],
  read: r`«q beta è maggiore o uguale alla norma di w di q al quadrato, che è maggiore o uguale a q alfa al quadrato fratto la norma di w star al quadrato; quindi q è al più beta per la norma di w star al quadrato fratto alfa al quadrato».`,
  why: r`La norma dei pesi deve crescere **almeno** come $q^2$ (ogni errore la avvicina a $\mathbf{w}^*$) ma **al più** come $q$ (ogni errore aggiunge al massimo $\beta$). Una parabola supera prima o poi una retta: oltre $q_{max}$ i due limiti sono incompatibili, quindi gli errori sono finiti.`,
}

export const logistic: FormulaDef = {
  name: 'Sigmoide logistica',
  tex: r`f_\sigma(x) = \frac{1}{1 + e^{-\part{a}{a}x}}`,
  parts: [{ k: 'a', sym: r`a`, desc: r`la **pendenza** (*slope*): con $a \to 0$ la funzione diventa lineare (piatta), con $a \to \infty$ diventa un gradino` }],
  read: r`«f sigma di x è uno fratto uno più e alla meno a x».`,
  why: r`È una soglia **liscia e differenziabile**: vale $0{,}5$ in zero, tende a $0$ e a $1$ agli estremi e vicino a zero è quasi lineare. La derivabilità è ciò che permette di usare la discesa del gradiente.`,
}

export const sigmoidDelta: FormulaDef = {
  name: 'Delta per un’unità sigmoidale',
  tex: r`\mathbf{w}_{new} = \mathbf{w} + \eta\,\delta_p\,\mathbf{x}_p, \qquad \delta_p = \part{err}{\big(d_p - o(\mathbf{x}_p)\big)}\, \part{fp}{f'_\sigma\big(net(\mathbf{x}_p)\big)}`,
  parts: [
    { k: 'err', sym: r`d_p - o(\mathbf{x}_p)`, desc: r`l’errore sull’uscita, come nell’LMS lineare` },
    { k: 'fp', sym: r`f'_\sigma(net)`, desc: r`la derivata della sigmoide nel punto di lavoro: massima vicino a $net = 0$, quasi nulla se l’unità è satura` },
  ],
  read: r`«w nuovo è w più eta per delta p per x p, con delta p uguale a d p meno o di x p, per f sigma primo di net di x p».`,
  why: r`Viene dalla regola della catena $\frac{\partial E_p}{\partial w_j} = \frac{\partial E_p}{\partial o_p}\frac{\partial o_p}{\partial net_p}\frac{\partial net_p}{\partial w_j}$: rispetto all’unità lineare compare in più il fattore $f'_\sigma$, che rende piccola la correzione quando l’uscita è già saturata vicino al target.`,
}

export const mlp: FormulaDef = {
  name: 'Il MLP come funzione',
  tex: r`h(\mathbf{x}) = \part{fk}{f_k}\Big(\sum_j \part{wkj}{w_{kj}}\, \part{fj}{f_j\big(\textstyle\sum_i w_{ji}\, x_i\big)}\Big)`,
  parts: [
    { k: 'fj', sym: r`f_j\big(\sum_i w_{ji} x_i\big)`, desc: r`l’uscita dell’unità nascosta $j$: una **feature derivata non lineare**, cioè una funzione di base $\phi_j(\mathbf{x}, \mathbf{w})$ che dipende dai pesi` },
    { k: 'wkj', sym: r`w_{kj}`, desc: r`i pesi dallo strato nascosto all’uscita` },
    { k: 'fk', sym: r`f_k`, desc: r`l’attivazione dell’uscita: sigmoidale per la classificazione, lineare per la regressione` },
  ],
  read: r`«h di x è f k della somma su j di w k j per f j della somma su i di w j i per x i».`,
  why: r`È una composizione di funzioni lineari e non lineari. Confrontata con la linear basis expansion $\sum_j w_j\phi_j(\mathbf{x})$, la differenza è che qui le basi **si adattano ai dati** durante l’addestramento.`,
}
