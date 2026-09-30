import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const risk: FormulaDef = {
  name: 'Rischio atteso',
  tex: r`R(h) = \mathbb{E}_Z[\part{L}{L(z, h)}] = \int_Z L(z, h)\,\part{p}{p(z)}\,dz, \qquad \part{hs}{h^* = \arg\min_{h \in H} R(h)}`,
  parts: [
    {
      k: 'L',
      sym: r`L(z, h)`,
      desc: r`la loss «interna» dell’ipotesi $h$ sul dato $z = (x, y)$: 0/1 nella classificazione, $(h(x) - y)^2$ nella regressione`,
    },
    { k: 'p', sym: r`p(z)`, desc: r`la distribuzione (sconosciuta) da cui provengono i dati: pesa ogni possibile $z$` },
    { k: 'hs', sym: r`h^*`, desc: r`l’ipotesi di $H$ con il rischio minimo: l’obiettivo ideale` },
  ],
  read: r`«R di h è il valore atteso su Z della loss, cioè l’integrale su Z di L di z h per p di z in d z».`,
  why: r`È l’errore medio su **tutti** i dati possibili, ciascuno pesato da quanto è probabile: l’errore vero. Non si può calcolare, perché $p(z)$ è sconosciuta; ogni schema di questa lezione lo stima con una media su un insieme finito.`,
}

export const remp: FormulaDef = {
  name: 'Rischio empirico',
  tex: r`R_{emp}(h, \part{D}{D_r}) = \frac{1}{\part{r}{r}}\sum_{i=1}^{r} L(\part{z}{z_i}, h)`,
  parts: [
    { k: 'D', sym: r`D_r`, desc: r`un insieme finito di $r$ dati: training, validation o test, a seconda dello scopo` },
    { k: 'r', sym: r`r`, desc: r`quanti dati contiene $D_r$` },
    { k: 'z', sym: r`z_i`, desc: r`l’$i$-esimo dato dell’insieme` },
  ],
  read: r`«R emp di h su D r è uno fratto r per la sommatoria, per i da uno a r, di L di z i h».`,
  why: r`L’integrale del rischio diventa una media sui dati disponibili: è il **surrogato** di $R$. Lo stesso calcolo è un errore di training, di validazione o di test a seconda dell’insieme su cui si fa; conta quale insieme è stato usato per addestrare e per scegliere.`,
}

export const cvMean: FormulaDef = {
  name: 'Stima della K-fold CV',
  tex: r`R(h^*_{\theta_m}(D_l)) \approx \frac{1}{\part{K}{K}}\sum_{k=1}^{K} R_{emp}\big(\part{h}{h^*_{\theta_m}(\bar D_k)}, \part{Dk}{D_k}\big)`,
  parts: [
    { k: 'K', sym: r`K`, desc: r`il numero di parti in cui si divide $D_l$` },
    {
      k: 'h',
      sym: r`h^*_{\theta_m}(\bar D_k)`,
      desc: r`il modello con iperparametro $\theta_m$ addestrato **da zero** sul complementare $\bar D_k$`,
    },
    { k: 'Dk', sym: r`D_k`, desc: r`la parte lasciata fuori, su cui si misura l’errore: non è stata vista in addestramento` },
  ],
  read: r`«il rischio di h star theta m è stimato dalla media, per k da uno a K, di R emp di h star theta m addestrato su D k segnato, misurato su D k».`,
  why: r`Ogni dato finisce in validazione esattamente una volta e ogni errore è misurato su dati non usati per addestrare quel modello: la media dei $K$ errori stima il rischio della configurazione $\theta_m$ su tutto $D_l$.`,
}
