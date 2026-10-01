import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const momentum: FormulaDef = {
  name: 'Momentum',
  tex: r`\Delta\mathbf{w}_{new} = \part{g}{-\eta\,\frac{\partial E(\mathbf{w})}{\partial\mathbf{w}}} + \part{a}{\alpha}\,\part{old}{\Delta\mathbf{w}_{old}}, \qquad \mathbf{w}_{new} = \mathbf{w} + \Delta\mathbf{w}_{new}`,
  parts: [
    {
      k: 'g',
      sym: r`-\eta\,\partial E/\partial\mathbf{w}`,
      desc: tx(
        r`il passo di discesa del gradiente usuale (qui $\eta$ è dentro $\Delta\mathbf{w}$)`,
        r`the usual gradient descent step (here $\eta$ is inside $\Delta\mathbf{w}$)`,
      ),
    },
    {
      k: 'a',
      sym: r`\alpha`,
      desc: tx(
        r`il coefficiente di momentum, $0 < \alpha < 1$ (ad esempio $0{,}5$–$0{,}9$): quanta parte del passo precedente si conserva`,
        r`the momentum coefficient, $0 < \alpha < 1$ (for example $0.5$–$0.9$): how much of the previous step is kept`,
      ),
    },
    {
      k: 'old',
      sym: r`\Delta\mathbf{w}_{old}`,
      desc: tx(
        r`lo spostamento del passo precedente, salvato dopo ogni aggiornamento`,
        r`the displacement of the previous step, saved after every update`,
      ),
    },
  ],
  read: tx(
    r`«delta w nuovo è meno eta per la derivata di E rispetto a w, più alfa per delta w vecchio».`,
    r`“delta w new is minus eta times the derivative of E with respect to w, plus alpha times delta w old.”`,
  ),
  why: tx(
    r`È la «palla pesante»: i pesi hanno un’inerzia. Dove il gradiente mantiene il segno i contributi si sommano e il passo si allunga (più veloce nei plateau); dove cambia segno a ogni passo si compensano (smorza le oscillazioni tra le pareti di un canyon).`,
    r`It is the “heavy ball”: the weights have inertia. Where the gradient keeps its sign the contributions add up and the step gets longer (faster on plateaus); where it changes sign at every step they cancel out (it damps the oscillations between the walls of a canyon).`,
  ),
}

export const lrDecay: FormulaDef = {
  name: tx('Learning rate che decresce', 'Decaying learning rate'),
  tex: r`\eta_s = \Big(1 - \frac{s}{\part{tau}{\tau}}\Big)\,\part{e0}{\eta_0} + \frac{s}{\tau}\,\part{et}{\eta_\tau}, \qquad s \le \tau`,
  parts: [
    {
      k: 'e0',
      sym: r`\eta_0`,
      desc: tx(
        r`il learning rate iniziale, scelto con il compromesso instabilità/blocco`,
        r`the initial learning rate, chosen with the instability/stalling trade-off`,
      ),
    },
    {
      k: 'et',
      sym: r`\eta_\tau`,
      desc: tx(
        r`il valore finale, piccolo (ad esempio circa l’$1\%$ di $\eta_0$), usato costante dopo $\tau$`,
        r`the final value, small (for example about $1\%$ of $\eta_0$), kept constant after $\tau$`,
      ),
    },
    {
      k: 'tau',
      sym: r`\tau`,
      desc: tx(
        r`l’iterazione a cui finisce la discesa lineare (qualche centinaio di passi)`,
        r`the iteration at which the linear decrease ends (a few hundred steps)`,
      ),
    },
  ],
  read: tx(
    r`«eta s è uno meno s su tau per eta zero, più s su tau per eta tau, per s minore o uguale a tau».`,
    r`“eta s is one minus s over tau times eta zero, plus s over tau times eta tau, for s less than or equal to tau.”`,
  ),
  why: tx(
    r`Con il mini-batch il gradiente non va a zero vicino al minimo (rumore di campionamento): un $\eta$ fisso farebbe oscillare per sempre. Ridurlo gradualmente fa assestare la discesa.`,
    r`With mini-batch the gradient does not go to zero near the minimum (sampling noise): a fixed $\eta$ would keep oscillating forever. Reducing it gradually lets the descent settle.`,
  ),
}

export const decayLoss: FormulaDef = {
  name: tx('Loss con penalità (weight decay)', 'Loss with penalty (weight decay)'),
  tex: r`\text{Loss}(\mathbf{w}) = \part{err}{\sum_p\big(d_p - o(\mathbf{x}_p)\big)^2} + \part{lam}{\lambda}\,\part{pen}{\|\mathbf{w}\|^2}`,
  parts: [
    {
      k: 'err',
      sym: r`\sum_p (d_p - o(\mathbf{x}_p))^2`,
      desc: tx(
        r`il termine sui dati: è l’**errore** da riportare in tabelle e grafici`,
        r`the term on the data: it is the **error** to be reported in tables and plots`,
      ),
    },
    {
      k: 'pen',
      sym: r`\|\mathbf{w}\|^2 = \sum_i w_i^2`,
      desc: tx(
        r`la somma dei quadrati di tutti i pesi della rete (spesso bias esclusi)`,
        r`the sum of the squares of all the weights of the network (biases often excluded)`,
      ),
    },
    {
      k: 'lam',
      sym: r`\lambda`,
      desc: tx(
        r`in genere molto piccolo (es. $0{,}01$), scelto in model selection`,
        r`generally very small (e.g. $0.01$), chosen in model selection`,
      ),
    },
  ],
  read: tx(
    r`«la loss di w è la somma su p di d p meno o di x p, al quadrato, più lambda per la norma di w al quadrato».`,
    r`“the loss of w is the sum over p of d p minus o of x p, squared, plus lambda times the squared norm of w.”`,
  ),
  why: tx(
    r`È di nuovo la regolarizzazione di Tikhonov: aggiunge circa $2\lambda w$ al gradiente di ogni peso, cioè a ogni passo ogni peso si riduce di una frazione del suo valore (weight decay). Tenendo i pesi piccoli le sigmoidi restano nella zona quasi lineare e la complessità effettiva della rete cala.`,
    r`It is Tikhonov regularization again: it adds about $2\lambda w$ to the gradient of every weight, that is, at every step every weight shrinks by a fraction of its value (weight decay). Keeping the weights small, the sigmoids stay in the almost linear region and the effective complexity of the network goes down.`,
  ),
}

export const fullRule: FormulaDef = {
  name: tx('Regola con momentum e weight decay', 'Rule with momentum and weight decay'),
  tex: r`\Delta w_{tu} = \part{g}{\eta\,\delta_t\,o_u} + \part{m}{\alpha\,\Delta w_{tu}^{old}}, \qquad w_{tu}^{new} = w_{tu} + \Delta w_{tu} \part{d}{- \lambda\,w_{tu}}`,
  parts: [
    {
      k: 'g',
      sym: r`\eta\,\delta_t\,o_u`,
      desc: tx(
        r`il termine della backpropagation, con $\eta$ solo sull’errore (diviso per $l$ se si usa la media)`,
        r`the backpropagation term, with $\eta$ only on the error (divided by $l$ if the mean is used)`,
      ),
    },
    {
      k: 'm',
      sym: r`\alpha\,\Delta w_{tu}^{old}`,
      desc: tx(r`il momentum: memoria del solo passo di gradiente`, r`the momentum: memory of the gradient step only`),
    },
    {
      k: 'd',
      sym: r`-\lambda\,w_{tu}`,
      desc: tx(
        r`il weight decay, tenuto fuori dalla memoria del momentum`,
        r`the weight decay, kept out of the memory of the momentum`,
      ),
    },
  ],
  read: tx(
    r`«delta w t u è eta delta t o u più alfa delta w t u vecchio; w t u nuovo è w t u più delta w t u meno lambda w t u».`,
    r`“delta w t u is eta delta t o u plus alpha delta w t u old; w t u new is w t u plus delta w t u minus lambda w t u.”`,
  ),
  why: tx(
    r`Separando i tre termini, $\eta$, $\alpha$ e $\lambda$ diventano **indipendenti**: cambiando uno non cambia l’effetto degli altri, e la model selection li può cercare separatamente.`,
    r`By separating the three terms, $\eta$, $\alpha$ and $\lambda$ become **independent**: changing one does not change the effect of the others, and model selection can search for them separately.`,
  ),
}

export const softmax: FormulaDef = {
  name: 'Softmax',
  tex: r`o_k(\mathbf{x}) = \frac{e^{\part{n}{net_k}}}{\part{Z}{\sum_{j=1}^{K} e^{net_j}}}`,
  parts: [
    {
      k: 'n',
      sym: r`net_k`,
      desc: tx(r`l’input netto dell’unità di uscita $k$`, r`the net input of output unit $k$`),
    },
    {
      k: 'Z',
      sym: r`\sum_j e^{net_j}`,
      desc: tx(
        r`la normalizzazione su tutte le $K$ uscite: le uscite sommano a 1`,
        r`the normalization over all the $K$ outputs: the outputs sum to 1`,
      ),
    },
  ],
  read: tx(
    r`«o k di x è e alla net k fratto la somma per j da uno a K di e alla net j».`,
    r`“o k of x is e to the net k over the sum for j from one to K of e to the net j.”`,
  ),
  why: tx(
    r`Le uscite sono positive e sommano a 1, quindi si possono leggere come probabilità $p(\text{classe} = k \mid \mathbf{x})$; la classe predetta è quella con l’uscita più alta.`,
    r`The outputs are positive and sum to 1, so they can be read as probabilities $p(\text{class} = k \mid \mathbf{x})$; the predicted class is the one with the highest output.`,
  ),
}

export const ccS: FormulaDef = {
  name: tx('Covarianza massimizzata dal Cascade Correlation', 'Covariance maximized by Cascade Correlation'),
  tex: r`S = \sum_k \Big|\sum_p \big(\part{o}{o_p} - \bar o\big)\big(\part{E}{E_{p,k}} - \bar E_k\big)\Big|`,
  parts: [
    {
      k: 'o',
      sym: r`o_p`,
      desc: tx(r`l’uscita dell’unità candidata sul pattern $p$`, r`the output of the candidate unit on pattern $p$`),
    },
    {
      k: 'E',
      sym: r`E_{p,k} = o_{p,k} - d_{p,k}`,
      desc: tx(
        r`l’errore residuo dell’uscita $k$ della rete attuale`,
        r`the residual error of output $k$ of the current network`,
      ),
    },
  ],
  read: tx(
    r`«S è la somma su k del valore assoluto della somma su p di o p meno o medio per E p k meno E k medio».`,
    r`“S is the sum over k of the absolute value of the sum over p of o p minus o bar times E p k minus E k bar.”`,
  ),
  why: tx(
    r`Una candidata con $S$ alto «si accende» proprio dove la rete sbaglia: aggiungendola, lo strato di uscita la può usare per ridurre l’errore residuo. Si fa ascesa del gradiente su $S$ e poi si congelano i suoi pesi in ingresso.`,
    r`A candidate with a high $S$ “lights up” exactly where the network is wrong: once it is added, the output layer can use it to reduce the residual error. Gradient ascent is performed on $S$ and then its incoming weights are frozen.`,
  ),
}
