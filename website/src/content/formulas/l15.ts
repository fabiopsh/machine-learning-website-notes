import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const expectedError: FormulaDef = {
  name: 'Errore di predizione atteso',
  tex: r`\part{E}{E_P}\Big[\big(\part{y}{y} - \part{h}{h(\mathbf{x})}\big)^2\Big]`,
  parts: [
    {
      k: 'E',
      sym: r`E_P`,
      desc: r`l’aspettativa **su tutti i training set** estratti secondo la distribuzione $P$ (dati i.i.d.)`,
    },
    { k: 'y', sym: r`y`, desc: r`il valore di $\mathbf{x}$ che potrebbe comparire in un dataset: $y = f(\mathbf{x}) + \varepsilon$, diverso a ogni estrazione` },
    { k: 'h', sym: r`h(\mathbf{x})`, desc: r`la predizione dell’ipotesi addestrata sul training set estratto: per ogni training set c’è una $h$ diversa` },
  ],
  read: r`«il valore atteso, rispetto a P, di y meno h di x, al quadrato».`,
  why: r`Il punto $\mathbf{x}$ è fissato; ciò che varia è il training set. Non si chiede quanto sbaglia **una** ipotesi, ma quanto si sbaglia **in media** ripetendo l’intero esperimento (estrarre i dati, addestrare, predire in $\mathbf{x}$).`,
}

export const decomposition: FormulaDef = {
  name: 'Decomposizione bias-varianza',
  tex: r`E_P\big[(y - h(\mathbf{x}))^2\big] = \part{v}{\underbrace{E_P\big[(h(\mathbf{x}) - \bar h(\mathbf{x}))^2\big]}_{\text{varianza}}} + \part{b}{\underbrace{\big(\bar h(\mathbf{x}) - f(\mathbf{x})\big)^2}_{\text{bias}^2}} + \part{n}{\underbrace{E_P\big[(y - f(\mathbf{x}))^2\big]}_{\text{rumore}^2}}`,
  parts: [
    {
      k: 'v',
      sym: r`E_P\big[(h(\mathbf{x}) - \bar h(\mathbf{x}))^2\big]`,
      desc: r`la **varianza**: quanto la predizione dei singoli training set si allontana dalla predizione media $\bar h(\mathbf{x})$`,
    },
    {
      k: 'b',
      sym: r`\big(\bar h(\mathbf{x}) - f(\mathbf{x})\big)^2`,
      desc: r`il **bias** al quadrato: la distanza tra la predizione media e la funzione vera; non c’è aspettativa, è un numero fisso`,
    },
    {
      k: 'n',
      sym: r`E_P\big[(y - f(\mathbf{x}))^2\big] = E_P[\varepsilon^2] = \sigma^2`,
      desc: r`il **rumore**: quanto i dati si allontanano dalla funzione vera; non contiene $h$, quindi non dipende dal modello`,
    },
  ],
  read: r`«l’errore atteso è la varianza di h di x, più il bias di h di x al quadrato, più sigma quadro».`,
  why: r`I tre termini misurano tre distanze diverse: da ogni $h$ alla loro media, dalla media alla funzione vera, dalla funzione vera ai dati. Solo i primi due dipendono dal modello scelto.`,
}

export const regLoss: FormulaDef = {
  name: 'Loss regolarizzata',
  tex: r`\text{Loss}(\mathbf{w}) = \part{d}{\underbrace{\sum_p\big(d_p - o(\mathbf{x}_p)\big)^2}_{\text{termine sui dati}}} + \part{p}{\underbrace{\part{l}{\lambda}\|\mathbf{w}\|^2}_{\text{penalità}}}`,
  parts: [
    { k: 'd', sym: r`\sum_p (d_p - o(\mathbf{x}_p))^2`, desc: r`l’errore sui dati di training: chiede al modello di adattarsi ai dati` },
    { k: 'p', sym: r`\lambda\|\mathbf{w}\|^2`, desc: r`la penalità sui pesi: chiede un modello semplice (l’intercetta è tipicamente esclusa)` },
    {
      k: 'l',
      sym: r`\lambda`,
      desc: r`quanto pesa la penalità: $\lambda$ basso dà soluzioni meno regolarizzate (complesse), $\lambda$ alto soluzioni più regolarizzate (meno complesse)`,
    },
  ],
  read: r`«la loss di w è la somma sui pattern di d p meno o di x p al quadrato, più lambda per la norma di w al quadrato».`,
  why: r`È la loss regolarizzata già vista con i modelli lineari e le reti neurali: qui interessa perché $\lambda$ sposta il modello lungo il compromesso tra bias e varianza.`,
}

export const committee: FormulaDef = {
  name: 'Comitato e media degli errori',
  tex: r`\part{c}{\text{loss}\big(E_i[h_i]\big)} \;\le\; \part{m}{E_i\big[\text{loss}(h_i)\big]}`,
  parts: [
    { k: 'c', sym: r`\text{loss}(E_i[h_i])`, desc: r`l’errore del **comitato**: prima si mediano le predizioni dei modelli, poi si misura l’errore della media` },
    { k: 'm', sym: r`E_i[\text{loss}(h_i)]`, desc: r`la **media degli errori**: prima si misura l’errore di ogni modello, poi si fa la media` },
  ],
  read: r`«la loss della media delle h i è minore o uguale della media delle loss delle h i».`,
  why: r`Vale per ogni loss **convessa** (è la disuguaglianza di Jensen). Con la loss quadratica, gli errori in direzioni opposte si compensano nella media delle predizioni, ma non nella media degli errori.`,
}
