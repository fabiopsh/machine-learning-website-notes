import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const vcBound: FormulaDef = {
  name: 'VC-bound',
  tex: r`\underbrace{R[h]}_{\text{rischio vero}} \;\le\; \part{E}{R_{emp}[h]} + \part{e}{\varepsilon(VC, N, \delta)}`,
  parts: [
    { k: 'E', sym: r`R_{emp}[h]`, desc: r`l’errore di training di $h$, misurabile sui dati` },
    {
      k: 'e',
      sym: r`\varepsilon(VC, N, \delta)`,
      desc: r`la **VC-confidence**: dipende solo dalla VC-dim di $H$, dal numero di dati $N$ e da $\delta$, non da $h$`,
    },
  ],
  read: r`«con probabilità almeno uno meno delta, R di h è minore o uguale di R emp di h più epsilon di VC, N e delta».`,
  why: r`La somma a destra è il **rischio garantito**. Vale per **ogni** $h \in H$ contemporaneamente: per questo si può scegliere $h$ dentro la classe (minimizzando l’errore di training) senza perdere la garanzia.`,
}

export const vcEps: FormulaDef = {
  name: 'VC-confidence (loss 0/1)',
  tex: r`\varepsilon(VC, N, \delta) = \sqrt{\frac{\part{vc}{VC}\left(\ln\frac{2N}{VC} + 1\right) \part{d}{- \ln\frac{\delta}{4}}}{\part{N}{N}}}`,
  parts: [
    { k: 'vc', sym: r`VC`, desc: r`la VC-dimension di $H$: più è grande, più $\varepsilon$ cresce` },
    {
      k: 'd',
      sym: r`-\ln\frac{\delta}{4}`,
      desc: r`il prezzo della confidenza: con $\delta$ più piccolo (garanzia più sicura) il termine cresce, ma solo in modo logaritmico`,
    },
    { k: 'N', sym: r`N`, desc: r`il numero di dati: al denominatore, quindi $\varepsilon \to 0$ quando $N$ cresce` },
  ],
  read: r`«epsilon è la radice di: VC per logaritmo di due N su VC più uno, meno logaritmo di delta quarti, tutto fratto N».`,
  why: r`A meno dei logaritmi, sotto radice c’è $VC/N$: raddoppiare i dati ha lo stesso effetto di dimezzare la complessità. Si calcola **prima** dell’apprendimento, perché non dipende dall’ipotesi scelta.`,
}

export const nested: FormulaDef = {
  name: 'Struttura annidata',
  tex: r`\part{H}{H_1 \subseteq H_2 \subseteq \dots \subseteq H_n}, \qquad \part{V}{VC(H_1) \le \dots \le VC(H_n)}`,
  parts: [
    {
      k: 'H',
      sym: r`H_1 \subseteq \dots \subseteq H_n`,
      desc: r`spazi delle ipotesi uno dentro l’altro: ogni ipotesi di $H_i$ è anche in $H_{i+1}$`,
    },
    { k: 'V', sym: r`VC(H_i)`, desc: r`le VC-dimension crescono lungo la struttura (finite per ipotesi)` },
  ],
  read: r`«H uno contenuto in H due, contenuto in … H n, con VC di H uno minore o uguale … di VC di H n».`,
  why: r`Passando a uno spazio più grande l’errore di training non può aumentare (ci sono tutte le ipotesi di prima), mentre la VC-confidence cresce: la SRM sceglie lo spazio in cui la somma è minima.`,
}
