import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const expectedError: FormulaDef = {
  name: tx('Errore di predizione atteso', 'Expected prediction error'),
  tex: r`\part{E}{E_P}\Big[\big(\part{y}{y} - \part{h}{h(\mathbf{x})}\big)^2\Big]`,
  parts: [
    {
      k: 'E',
      sym: r`E_P`,
      desc: tx(
        r`l’aspettativa **su tutti i training set** estratti secondo la distribuzione $P$ (dati i.i.d.)`,
        r`the expectation **over all the training sets** drawn according to the distribution $P$ (i.i.d. data)`,
      ),
    },
    {
      k: 'y',
      sym: r`y`,
      desc: tx(
        r`il valore di $\mathbf{x}$ che potrebbe comparire in un dataset: $y = f(\mathbf{x}) + \varepsilon$, diverso a ogni estrazione`,
        r`the value of $\mathbf{x}$ that could appear in a dataset: $y = f(\mathbf{x}) + \varepsilon$, different at every draw`,
      ),
    },
    {
      k: 'h',
      sym: r`h(\mathbf{x})`,
      desc: tx(
        r`la predizione dell’ipotesi addestrata sul training set estratto: per ogni training set c’è una $h$ diversa`,
        r`the prediction of the hypothesis trained on the training set drawn: for each training set there is a different $h$`,
      ),
    },
  ],
  read: tx(
    r`«il valore atteso, rispetto a P, di y meno h di x, al quadrato».`,
    r`“the expected value, with respect to P, of y minus h of x, squared.”`,
  ),
  why: tx(
    r`Il punto $\mathbf{x}$ è fissato; ciò che varia è il training set. Non si chiede quanto sbaglia **una** ipotesi, ma quanto si sbaglia **in media** ripetendo l’intero esperimento (estrarre i dati, addestrare, predire in $\mathbf{x}$).`,
    r`The point $\mathbf{x}$ is fixed; what varies is the training set. The question is not how wrong **one** hypothesis is, but how wrong one is **on average** when the whole experiment is repeated (draw the data, train, predict at $\mathbf{x}$).`,
  ),
}

export const decomposition: FormulaDef = {
  name: tx('Decomposizione bias-varianza', 'Bias-variance decomposition'),
  tex: tx(
    r`E_P\big[(y - h(\mathbf{x}))^2\big] = \part{v}{\underbrace{E_P\big[(h(\mathbf{x}) - \bar h(\mathbf{x}))^2\big]}_{\text{varianza}}} + \part{b}{\underbrace{\big(\bar h(\mathbf{x}) - f(\mathbf{x})\big)^2}_{\text{bias}^2}} + \part{n}{\underbrace{E_P\big[(y - f(\mathbf{x}))^2\big]}_{\text{rumore}^2}}`,
    r`E_P\big[(y - h(\mathbf{x}))^2\big] = \part{v}{\underbrace{E_P\big[(h(\mathbf{x}) - \bar h(\mathbf{x}))^2\big]}_{\text{variance}}} + \part{b}{\underbrace{\big(\bar h(\mathbf{x}) - f(\mathbf{x})\big)^2}_{\text{bias}^2}} + \part{n}{\underbrace{E_P\big[(y - f(\mathbf{x}))^2\big]}_{\text{noise}^2}}`,
  ),
  parts: [
    {
      k: 'v',
      sym: r`E_P\big[(h(\mathbf{x}) - \bar h(\mathbf{x}))^2\big]`,
      desc: tx(
        r`la **varianza**: quanto la predizione dei singoli training set si allontana dalla predizione media $\bar h(\mathbf{x})$`,
        r`the **variance**: how far the prediction of the individual training sets moves away from the mean prediction $\bar h(\mathbf{x})$`,
      ),
    },
    {
      k: 'b',
      sym: r`\big(\bar h(\mathbf{x}) - f(\mathbf{x})\big)^2`,
      desc: tx(
        r`il **bias** al quadrato: la distanza tra la predizione media e la funzione vera; non c’è aspettativa, è un numero fisso`,
        r`the squared **bias**: the distance between the mean prediction and the true function; there is no expectation, it is a fixed number`,
      ),
    },
    {
      k: 'n',
      sym: r`E_P\big[(y - f(\mathbf{x}))^2\big] = E_P[\varepsilon^2] = \sigma^2`,
      desc: tx(
        r`il **rumore**: quanto i dati si allontanano dalla funzione vera; non contiene $h$, quindi non dipende dal modello`,
        r`the **noise**: how far the data move away from the true function; it does not contain $h$, so it does not depend on the model`,
      ),
    },
  ],
  read: tx(
    r`«l’errore atteso è la varianza di h di x, più il bias di h di x al quadrato, più sigma quadro».`,
    r`“the expected error is the variance of h of x, plus the bias of h of x squared, plus sigma squared.”`,
  ),
  why: tx(
    r`I tre termini misurano tre distanze diverse: da ogni $h$ alla loro media, dalla media alla funzione vera, dalla funzione vera ai dati. Solo i primi due dipendono dal modello scelto.`,
    r`The three terms measure three different distances: from each $h$ to their mean, from the mean to the true function, from the true function to the data. Only the first two depend on the chosen model.`,
  ),
}

export const regLoss: FormulaDef = {
  name: tx('Loss regolarizzata', 'Regularized loss'),
  tex: tx(
    r`\text{Loss}(\mathbf{w}) = \part{d}{\underbrace{\sum_p\big(d_p - o(\mathbf{x}_p)\big)^2}_{\text{termine sui dati}}} + \part{p}{\underbrace{\part{l}{\lambda}\|\mathbf{w}\|^2}_{\text{penalità}}}`,
    r`\text{Loss}(\mathbf{w}) = \part{d}{\underbrace{\sum_p\big(d_p - o(\mathbf{x}_p)\big)^2}_{\text{data term}}} + \part{p}{\underbrace{\part{l}{\lambda}\|\mathbf{w}\|^2}_{\text{penalty}}}`,
  ),
  parts: [
    {
      k: 'd',
      sym: r`\sum_p (d_p - o(\mathbf{x}_p))^2`,
      desc: tx(
        r`l’errore sui dati di training: chiede al modello di adattarsi ai dati`,
        r`the error on the training data: it asks the model to fit the data`,
      ),
    },
    {
      k: 'p',
      sym: r`\lambda\|\mathbf{w}\|^2`,
      desc: tx(
        r`la penalità sui pesi: chiede un modello semplice (l’intercetta è tipicamente esclusa)`,
        r`the penalty on the weights: it asks for a simple model (the intercept is typically excluded)`,
      ),
    },
    {
      k: 'l',
      sym: r`\lambda`,
      desc: tx(
        r`quanto pesa la penalità: $\lambda$ basso dà soluzioni meno regolarizzate (complesse), $\lambda$ alto soluzioni più regolarizzate (meno complesse)`,
        r`how much the penalty weighs: low $\lambda$ gives less regularized (complex) solutions, high $\lambda$ more regularized (less complex) ones`,
      ),
    },
  ],
  read: tx(
    r`«la loss di w è la somma sui pattern di d p meno o di x p al quadrato, più lambda per la norma di w al quadrato».`,
    r`“the loss of w is the sum over the patterns of d p minus o of x p squared, plus lambda times the squared norm of w.”`,
  ),
  why: tx(
    r`È la loss regolarizzata già vista con i modelli lineari e le reti neurali: qui interessa perché $\lambda$ sposta il modello lungo il compromesso tra bias e varianza.`,
    r`It is the regularized loss already seen with linear models and neural networks: here it matters because $\lambda$ moves the model along the trade-off between bias and variance.`,
  ),
}

export const committee: FormulaDef = {
  name: tx('Comitato e media degli errori', 'Committee and average of the errors'),
  tex: r`\part{c}{\text{loss}\big(E_i[h_i]\big)} \;\le\; \part{m}{E_i\big[\text{loss}(h_i)\big]}`,
  parts: [
    {
      k: 'c',
      sym: r`\text{loss}(E_i[h_i])`,
      desc: tx(
        r`l’errore del **comitato**: prima si mediano le predizioni dei modelli, poi si misura l’errore della media`,
        r`the error of the **committee**: first the predictions of the models are averaged, then the error of the average is measured`,
      ),
    },
    {
      k: 'm',
      sym: r`E_i[\text{loss}(h_i)]`,
      desc: tx(
        r`la **media degli errori**: prima si misura l’errore di ogni modello, poi si fa la media`,
        r`the **average of the errors**: first the error of each model is measured, then the average is taken`,
      ),
    },
  ],
  read: tx(
    r`«la loss della media delle h i è minore o uguale della media delle loss delle h i».`,
    r`“the loss of the average of the h i is less than or equal to the average of the losses of the h i.”`,
  ),
  why: tx(
    r`Vale per ogni loss **convessa** (è la disuguaglianza di Jensen). Con la loss quadratica, gli errori in direzioni opposte si compensano nella media delle predizioni, ma non nella media degli errori.`,
    r`It holds for every **convex** loss (it is Jensen’s inequality). With the squared loss, errors in opposite directions cancel out in the average of the predictions, but not in the average of the errors.`,
  ),
}
