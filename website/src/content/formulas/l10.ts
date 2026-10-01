import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const risk: FormulaDef = {
  name: tx('Rischio atteso', 'Expected risk'),
  tex: r`R(h) = \mathbb{E}_Z[\part{L}{L(z, h)}] = \int_Z L(z, h)\,\part{p}{p(z)}\,dz, \qquad \part{hs}{h^* = \arg\min_{h \in H} R(h)}`,
  parts: [
    {
      k: 'L',
      sym: r`L(z, h)`,
      desc: tx(
        r`la loss «interna» dell’ipotesi $h$ sul dato $z = (x, y)$: 0/1 nella classificazione, $(h(x) - y)^2$ nella regressione`,
        r`the “internal” loss of the hypothesis $h$ on the data point $z = (x, y)$: 0/1 in classification, $(h(x) - y)^2$ in regression`,
      ),
    },
    {
      k: 'p',
      sym: r`p(z)`,
      desc: tx(
        r`la distribuzione (sconosciuta) da cui provengono i dati: pesa ogni possibile $z$`,
        r`the (unknown) distribution the data come from: it weights every possible $z$`,
      ),
    },
    {
      k: 'hs',
      sym: r`h^*`,
      desc: tx(
        r`l’ipotesi di $H$ con il rischio minimo: l’obiettivo ideale`,
        r`the hypothesis of $H$ with the minimum risk: the ideal goal`,
      ),
    },
  ],
  read: tx(
    r`«R di h è il valore atteso su Z della loss, cioè l’integrale su Z di L di z h per p di z in d z».`,
    r`“R of h is the expected value over Z of the loss, that is, the integral over Z of L of z h times p of z d z.”`,
  ),
  why: tx(
    r`È l’errore medio su **tutti** i dati possibili, ciascuno pesato da quanto è probabile: l’errore vero. Non si può calcolare, perché $p(z)$ è sconosciuta; ogni schema di questa lezione lo stima con una media su un insieme finito.`,
    r`It is the average error over **all** possible data, each weighted by how probable it is: the true error. It cannot be computed, because $p(z)$ is unknown; every scheme in this lesson estimates it with a mean over a finite set.`,
  ),
}

export const remp: FormulaDef = {
  name: tx('Rischio empirico', 'Empirical risk'),
  tex: r`R_{emp}(h, \part{D}{D_r}) = \frac{1}{\part{r}{r}}\sum_{i=1}^{r} L(\part{z}{z_i}, h)`,
  parts: [
    {
      k: 'D',
      sym: r`D_r`,
      desc: tx(
        r`un insieme finito di $r$ dati: training, validation o test, a seconda dello scopo`,
        r`a finite set of $r$ data points: training, validation or test, depending on the purpose`,
      ),
    },
    { k: 'r', sym: r`r`, desc: tx(r`quanti dati contiene $D_r$`, r`how many data points $D_r$ contains`) },
    { k: 'z', sym: r`z_i`, desc: tx(r`l’$i$-esimo dato dell’insieme`, r`the $i$-th data point of the set`) },
  ],
  read: tx(
    r`«R emp di h su D r è uno fratto r per la sommatoria, per i da uno a r, di L di z i h».`,
    r`“R emp of h on D r is one over r times the sum, for i from one to r, of L of z i h.”`,
  ),
  why: tx(
    r`L’integrale del rischio diventa una media sui dati disponibili: è il **surrogato** di $R$. Lo stesso calcolo è un errore di training, di validazione o di test a seconda dell’insieme su cui si fa; conta quale insieme è stato usato per addestrare e per scegliere.`,
    r`The integral of the risk becomes a mean over the available data: it is the **surrogate** of $R$. The same computation is a training, validation or test error depending on the set it is carried out on; what matters is which set was used for training and for choosing.`,
  ),
}

export const cvMean: FormulaDef = {
  name: tx('Stima della K-fold CV', 'K-fold CV estimate'),
  tex: r`R(h^*_{\theta_m}(D_l)) \approx \frac{1}{\part{K}{K}}\sum_{k=1}^{K} R_{emp}\big(\part{h}{h^*_{\theta_m}(\bar D_k)}, \part{Dk}{D_k}\big)`,
  parts: [
    {
      k: 'K',
      sym: r`K`,
      desc: tx(r`il numero di parti in cui si divide $D_l$`, r`the number of parts $D_l$ is split into`),
    },
    {
      k: 'h',
      sym: r`h^*_{\theta_m}(\bar D_k)`,
      desc: tx(
        r`il modello con iperparametro $\theta_m$ addestrato **da zero** sul complementare $\bar D_k$`,
        r`the model with hyperparameter $\theta_m$ trained **from scratch** on the complement $\bar D_k$`,
      ),
    },
    {
      k: 'Dk',
      sym: r`D_k`,
      desc: tx(
        r`la parte lasciata fuori, su cui si misura l’errore: non è stata vista in addestramento`,
        r`the part left out, on which the error is measured: it was not seen in training`,
      ),
    },
  ],
  read: tx(
    r`«il rischio di h star theta m è stimato dalla media, per k da uno a K, di R emp di h star theta m addestrato su D k segnato, misurato su D k».`,
    r`“the risk of h star theta m is estimated by the mean, for k from one to K, of R emp of h star theta m trained on D k bar, measured on D k.”`,
  ),
  why: tx(
    r`Ogni dato finisce in validazione esattamente una volta e ogni errore è misurato su dati non usati per addestrare quel modello: la media dei $K$ errori stima il rischio della configurazione $\theta_m$ su tutto $D_l$.`,
    r`Every data point ends up in validation exactly once and every error is measured on data not used to train that model: the mean of the $K$ errors estimates the risk of the configuration $\theta_m$ on the whole $D_l$.`,
  ),
}
