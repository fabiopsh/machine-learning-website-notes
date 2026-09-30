import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const momentum: FormulaDef = {
  name: 'Momentum',
  tex: r`\Delta\mathbf{w}_{new} = \part{g}{-\eta\,\frac{\partial E(\mathbf{w})}{\partial\mathbf{w}}} + \part{a}{\alpha}\,\part{old}{\Delta\mathbf{w}_{old}}, \qquad \mathbf{w}_{new} = \mathbf{w} + \Delta\mathbf{w}_{new}`,
  parts: [
    { k: 'g', sym: r`-\eta\,\partial E/\partial\mathbf{w}`, desc: r`il passo di discesa del gradiente usuale (qui $\eta$ è dentro $\Delta\mathbf{w}$)` },
    { k: 'a', sym: r`\alpha`, desc: r`il coefficiente di momentum, $0 < \alpha < 1$ (ad esempio $0{,}5$–$0{,}9$): quanta parte del passo precedente si conserva` },
    { k: 'old', sym: r`\Delta\mathbf{w}_{old}`, desc: r`lo spostamento del passo precedente, salvato dopo ogni aggiornamento` },
  ],
  read: r`«delta w nuovo è meno eta per la derivata di E rispetto a w, più alfa per delta w vecchio».`,
  why: r`È la «palla pesante»: i pesi hanno un’inerzia. Dove il gradiente mantiene il segno i contributi si sommano e il passo si allunga (più veloce nei plateau); dove cambia segno a ogni passo si compensano (smorza le oscillazioni tra le pareti di un canyon).`,
}

export const lrDecay: FormulaDef = {
  name: 'Learning rate che decresce',
  tex: r`\eta_s = \Big(1 - \frac{s}{\part{tau}{\tau}}\Big)\,\part{e0}{\eta_0} + \frac{s}{\tau}\,\part{et}{\eta_\tau}, \qquad s \le \tau`,
  parts: [
    { k: 'e0', sym: r`\eta_0`, desc: r`il learning rate iniziale, scelto con il compromesso instabilità/blocco` },
    { k: 'et', sym: r`\eta_\tau`, desc: r`il valore finale, piccolo (ad esempio circa l’$1\%$ di $\eta_0$), usato costante dopo $\tau$` },
    { k: 'tau', sym: r`\tau`, desc: r`l’iterazione a cui finisce la discesa lineare (qualche centinaio di passi)` },
  ],
  read: r`«eta s è uno meno s su tau per eta zero, più s su tau per eta tau, per s minore o uguale a tau».`,
  why: r`Con il mini-batch il gradiente non va a zero vicino al minimo (rumore di campionamento): un $\eta$ fisso farebbe oscillare per sempre. Ridurlo gradualmente fa assestare la discesa.`,
}

export const decayLoss: FormulaDef = {
  name: 'Loss con penalità (weight decay)',
  tex: r`\text{Loss}(\mathbf{w}) = \part{err}{\sum_p\big(d_p - o(\mathbf{x}_p)\big)^2} + \part{lam}{\lambda}\,\part{pen}{\|\mathbf{w}\|^2}`,
  parts: [
    { k: 'err', sym: r`\sum_p (d_p - o(\mathbf{x}_p))^2`, desc: r`il termine sui dati: è l’**errore** da riportare in tabelle e grafici` },
    { k: 'pen', sym: r`\|\mathbf{w}\|^2 = \sum_i w_i^2`, desc: r`la somma dei quadrati di tutti i pesi della rete (spesso bias esclusi)` },
    { k: 'lam', sym: r`\lambda`, desc: r`in genere molto piccolo (es. $0{,}01$), scelto in model selection` },
  ],
  read: r`«la loss di w è la somma su p di d p meno o di x p, al quadrato, più lambda per la norma di w al quadrato».`,
  why: r`È di nuovo la regolarizzazione di Tikhonov: aggiunge circa $2\lambda w$ al gradiente di ogni peso, cioè a ogni passo ogni peso si riduce di una frazione del suo valore (weight decay). Tenendo i pesi piccoli le sigmoidi restano nella zona quasi lineare e la complessità effettiva della rete cala.`,
}

export const fullRule: FormulaDef = {
  name: 'Regola con momentum e weight decay',
  tex: r`\Delta w_{tu} = \part{g}{\eta\,\delta_t\,o_u} + \part{m}{\alpha\,\Delta w_{tu}^{old}}, \qquad w_{tu}^{new} = w_{tu} + \Delta w_{tu} \part{d}{- \lambda\,w_{tu}}`,
  parts: [
    { k: 'g', sym: r`\eta\,\delta_t\,o_u`, desc: r`il termine della backpropagation, con $\eta$ solo sull’errore (diviso per $l$ se si usa la media)` },
    { k: 'm', sym: r`\alpha\,\Delta w_{tu}^{old}`, desc: r`il momentum: memoria del solo passo di gradiente` },
    { k: 'd', sym: r`-\lambda\,w_{tu}`, desc: r`il weight decay, tenuto fuori dalla memoria del momentum` },
  ],
  read: r`«delta w t u è eta delta t o u più alfa delta w t u vecchio; w t u nuovo è w t u più delta w t u meno lambda w t u».`,
  why: r`Separando i tre termini, $\eta$, $\alpha$ e $\lambda$ diventano **indipendenti**: cambiando uno non cambia l’effetto degli altri, e la model selection li può cercare separatamente.`,
}

export const softmax: FormulaDef = {
  name: 'Softmax',
  tex: r`o_k(\mathbf{x}) = \frac{e^{\part{n}{net_k}}}{\part{Z}{\sum_{j=1}^{K} e^{net_j}}}`,
  parts: [
    { k: 'n', sym: r`net_k`, desc: r`l’input netto dell’unità di uscita $k$` },
    { k: 'Z', sym: r`\sum_j e^{net_j}`, desc: r`la normalizzazione su tutte le $K$ uscite: le uscite sommano a 1` },
  ],
  read: r`«o k di x è e alla net k fratto la somma per j da uno a K di e alla net j».`,
  why: r`Le uscite sono positive e sommano a 1, quindi si possono leggere come probabilità $p(\text{classe} = k \mid \mathbf{x})$; la classe predetta è quella con l’uscita più alta.`,
}

export const ccS: FormulaDef = {
  name: 'Covarianza massimizzata dal Cascade Correlation',
  tex: r`S = \sum_k \Big|\sum_p \big(\part{o}{o_p} - \bar o\big)\big(\part{E}{E_{p,k}} - \bar E_k\big)\Big|`,
  parts: [
    { k: 'o', sym: r`o_p`, desc: r`l’uscita dell’unità candidata sul pattern $p$` },
    { k: 'E', sym: r`E_{p,k} = o_{p,k} - d_{p,k}`, desc: r`l’errore residuo dell’uscita $k$ della rete attuale` },
  ],
  read: r`«S è la somma su k del valore assoluto della somma su p di o p meno o medio per E p k meno E k medio».`,
  why: r`Una candidata con $S$ alto «si accende» proprio dove la rete sbaglia: aggiungendola, lo strato di uscita la può usare per ridurre l’errore residuo. Si fa ascesa del gradiente su $S$ e poi si congelano i suoi pesi in ingresso.`,
}
