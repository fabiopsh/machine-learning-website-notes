import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const vcBound: FormulaDef = {
  name: 'VC-bound',
  tex: tx(
    r`\underbrace{R[h]}_{\text{rischio vero}} \;\le\; \part{E}{R_{emp}[h]} + \part{e}{\varepsilon(VC, N, \delta)}`,
    r`\underbrace{R[h]}_{\text{true risk}} \;\le\; \part{E}{R_{emp}[h]} + \part{e}{\varepsilon(VC, N, \delta)}`,
  ),
  parts: [
    {
      k: 'E',
      sym: r`R_{emp}[h]`,
      desc: tx(r`l’errore di training di $h$, misurabile sui dati`, r`the training error of $h$, measurable on the data`),
    },
    {
      k: 'e',
      sym: r`\varepsilon(VC, N, \delta)`,
      desc: tx(
        r`la **VC-confidence**: dipende solo dalla VC-dim di $H$, dal numero di dati $N$ e da $\delta$, non da $h$`,
        r`the **VC-confidence**: it depends only on the VC-dim of $H$, on the number of data points $N$ and on $\delta$, not on $h$`,
      ),
    },
  ],
  read: tx(
    r`«con probabilità almeno uno meno delta, R di h è minore o uguale di R emp di h più epsilon di VC, N e delta».`,
    r`“with probability at least one minus delta, R of h is less than or equal to R emp of h plus epsilon of VC, N and delta.”`,
  ),
  why: tx(
    r`La somma a destra è il **rischio garantito**. Vale per **ogni** $h \in H$ contemporaneamente: per questo si può scegliere $h$ dentro la classe (minimizzando l’errore di training) senza perdere la garanzia.`,
    r`The sum on the right is the **guaranteed risk**. It holds for **every** $h \in H$ simultaneously: this is why $h$ can be chosen within the class (by minimizing the training error) without losing the guarantee.`,
  ),
}

export const vcEps: FormulaDef = {
  name: tx('VC-confidence (loss 0/1)', 'VC-confidence (0/1 loss)'),
  tex: r`\varepsilon(VC, N, \delta) = \sqrt{\frac{\part{vc}{VC}\left(\ln\frac{2N}{VC} + 1\right) \part{d}{- \ln\frac{\delta}{4}}}{\part{N}{N}}}`,
  parts: [
    {
      k: 'vc',
      sym: r`VC`,
      desc: tx(
        r`la VC-dimension di $H$: più è grande, più $\varepsilon$ cresce`,
        r`the VC-dimension of $H$: the larger it is, the more $\varepsilon$ grows`,
      ),
    },
    {
      k: 'd',
      sym: r`-\ln\frac{\delta}{4}`,
      desc: tx(
        r`il prezzo della confidenza: con $\delta$ più piccolo (garanzia più sicura) il termine cresce, ma solo in modo logaritmico`,
        r`the price of confidence: with a smaller $\delta$ (a safer guarantee) the term grows, but only logarithmically`,
      ),
    },
    {
      k: 'N',
      sym: r`N`,
      desc: tx(
        r`il numero di dati: al denominatore, quindi $\varepsilon \to 0$ quando $N$ cresce`,
        r`the number of data points: in the denominator, so $\varepsilon \to 0$ as $N$ grows`,
      ),
    },
  ],
  read: tx(
    r`«epsilon è la radice di: VC per logaritmo di due N su VC più uno, meno logaritmo di delta quarti, tutto fratto N».`,
    r`“epsilon is the square root of: VC times log of two N over VC plus one, minus log of delta over four, all divided by N.”`,
  ),
  why: tx(
    r`A meno dei logaritmi, sotto radice c’è $VC/N$: raddoppiare i dati ha lo stesso effetto di dimezzare la complessità. Si calcola **prima** dell’apprendimento, perché non dipende dall’ipotesi scelta.`,
    r`Up to logarithms, under the square root there is $VC/N$: doubling the data has the same effect as halving the complexity. It is computed **before** learning, because it does not depend on the chosen hypothesis.`,
  ),
}

export const nested: FormulaDef = {
  name: tx('Struttura annidata', 'Nested structure'),
  tex: r`\part{H}{H_1 \subseteq H_2 \subseteq \dots \subseteq H_n}, \qquad \part{V}{VC(H_1) \le \dots \le VC(H_n)}`,
  parts: [
    {
      k: 'H',
      sym: r`H_1 \subseteq \dots \subseteq H_n`,
      desc: tx(
        r`spazi delle ipotesi uno dentro l’altro: ogni ipotesi di $H_i$ è anche in $H_{i+1}$`,
        r`hypothesis spaces one inside the other: every hypothesis of $H_i$ is also in $H_{i+1}$`,
      ),
    },
    {
      k: 'V',
      sym: r`VC(H_i)`,
      desc: tx(
        r`le VC-dimension crescono lungo la struttura (finite per ipotesi)`,
        r`the VC-dimensions grow along the structure (finite by assumption)`,
      ),
    },
  ],
  read: tx(
    r`«H uno contenuto in H due, contenuto in … H n, con VC di H uno minore o uguale … di VC di H n».`,
    r`“H one contained in H two, contained in … H n, with VC of H one less than or equal to … VC of H n.”`,
  ),
  why: tx(
    r`Passando a uno spazio più grande l’errore di training non può aumentare (ci sono tutte le ipotesi di prima), mentre la VC-confidence cresce: la SRM sceglie lo spazio in cui la somma è minima.`,
    r`Moving to a larger space, the training error cannot increase (all the previous hypotheses are still there), while the VC-confidence grows: SRM chooses the space in which the sum is minimal.`,
  ),
}
