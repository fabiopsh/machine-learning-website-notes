import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const errP: FormulaDef = {
  name: tx('Errore totale e sul pattern', 'Total error and error on a pattern'),
  tex: r`E_{tot} = \sum_p \part{Ep}{E_p}, \qquad E_p = \part{half}{\frac{1}{2}}\sum_{k=1}^{\part{K}{K}}(d_k - o_k)^2`,
  parts: [
    {
      k: 'Ep',
      sym: r`E_p`,
      desc: tx(
        r`l’errore sul pattern $p$, calcolato su tutte le unità di uscita`,
        r`the error on pattern $p$, computed over all the output units`,
      ),
    },
    {
      k: 'half',
      sym: r`\tfrac12`,
      desc: tx(
        r`serve solo a semplificare la derivata: il $2$ dell’esponente lo cancella`,
        r`it only serves to simplify the derivative: the $2$ of the exponent cancels it`,
      ),
    },
    { k: 'K', sym: r`K`, desc: tx(r`il numero di unità di uscita`, r`the number of output units`) },
  ],
  read: tx(
    r`«E totale è la somma su p di E p; E p è un mezzo della somma per k da uno a K di d k meno o k, al quadrato».`,
    r`“E total is the sum over p of E p; E p is one half of the sum for k from one to K of d k minus o k, squared.”`,
  ),
}

export const generic: FormulaDef = {
  name: tx('Gradiente per un peso generico', 'Gradient for a generic weight'),
  tex: r`\Delta_p w_{tu} = -\frac{\partial E_p}{\partial w_{tu}} = \underbrace{\part{d}{-\frac{\partial E_p}{\partial net_t}}}_{\delta_t}\cdot\underbrace{\part{o}{\frac{\partial net_t}{\partial w_{tu}}}}_{o_u} = \delta_t\cdot o_u`,
  parts: [
    {
      k: 'd',
      sym: r`\delta_t`,
      desc: tx(
        r`il **delta** dell’unità $t$: quanto l’errore cambia al variare del suo input netto (con il segno meno)`,
        r`the **delta** of unit $t$: how much the error changes as its net input varies (with the minus sign)`,
      ),
    },
    {
      k: 'o',
      sym: r`o_u`,
      desc: tx(
        r`l’input che arriva a $t$ da $u$ lungo la connessione $w_{tu}$: nella somma $net_t = \sum_s w_{ts}o_s$ solo il termine $s = u$ dipende da $w_{tu}$`,
        r`the input that reaches $t$ from $u$ along the connection $w_{tu}$: in the sum $net_t = \sum_s w_{ts}o_s$ only the term $s = u$ depends on $w_{tu}$`,
      ),
    },
  ],
  read: tx(
    r`«delta p di w t u è meno la derivata di E p rispetto a w t u, cioè delta t per o u».`,
    r`“delta p of w t u is minus the derivative of E p with respect to w t u, that is, delta t times o u.”`,
  ),
  why: tx(
    r`La regola della catena spezza la derivata in due pezzi: uno che riguarda solo l’unità $t$ (il suo delta) e uno che riguarda solo la connessione (l’input $o_u$). Tutta la difficoltà si sposta nel calcolare $\delta_t$ per ogni unità.`,
    r`The chain rule splits the derivative into two pieces: one that concerns only unit $t$ (its delta) and one that concerns only the connection (the input $o_u$). All the difficulty moves to computing $\delta_t$ for each unit.`,
  ),
}

export const deltaOut: FormulaDef = {
  name: tx('Delta di un’unità di uscita', 'Delta of an output unit'),
  tex: r`\delta_k = \part{e}{(d_k - o_k)}\cdot \part{f}{f'_k(net_k)}`,
  parts: [
    {
      k: 'e',
      sym: r`d_k - o_k`,
      desc: tx(
        r`l’errore dell’uscita $k$: è misurabile direttamente perché il target è noto`,
        r`the error of output $k$: it is directly measurable because the target is known`,
      ),
    },
    {
      k: 'f',
      sym: r`f'_k(net_k)`,
      desc: tx(
        r`la derivata dell’attivazione nel punto di lavoro (vale 1 per un’uscita lineare)`,
        r`the derivative of the activation at the operating point (it equals 1 for a linear output)`,
      ),
    },
  ],
  read: tx(r`«delta k è d k meno o k, per f k primo di net k».`, r`“delta k is d k minus o k, times f k prime of net k.”`),
  why: tx(
    r`È lo stesso delta della singola unità sigmoidale: $-\partial E_p/\partial o_k = d_k - o_k$ perché nella somma di $E_p$ solo il termine $r = k$ dipende da $o_k$.`,
    r`It is the same delta as for the single sigmoidal unit: $-\partial E_p/\partial o_k = d_k - o_k$ because in the sum of $E_p$ only the term $r = k$ depends on $o_k$.`,
  ),
}

export const deltaHidden: FormulaDef = {
  name: tx('Delta di un’unità nascosta', 'Delta of a hidden unit'),
  tex: r`\delta_j = \Big(\sum_{k=1}^{K} \part{dk}{\delta_k}\, \part{w}{w_{kj}}\Big)\cdot \part{f}{f'_j(net_j)}`,
  parts: [
    {
      k: 'dk',
      sym: r`\delta_k`,
      desc: tx(
        r`i delta delle unità di uscita, **già calcolati**: è qui che l’errore «risale» la rete`,
        r`the deltas of the output units, **already computed**: this is where the error “climbs back up” the network`,
      ),
    },
    {
      k: 'w',
      sym: r`w_{kj}`,
      desc: tx(
        r`gli stessi pesi usati nella propagazione in avanti, da $j$ verso $k$`,
        r`the same weights used in the forward propagation, from $j$ to $k$`,
      ),
    },
    {
      k: 'f',
      sym: r`f'_j(net_j)`,
      desc: tx(r`la derivata dell’attivazione dell’unità nascosta`, r`the derivative of the activation of the hidden unit`),
    },
  ],
  read: tx(
    r`«delta j è la somma su k di delta k per w k j, il tutto per f j primo di net j».`,
    r`“delta j is the sum over k of delta k times w k j, all times f j prime of net j.”`,
  ),
  why: tx(
    r`L’uscita $o_j$ non compare in $E_p$, ma influenza ogni $net_k$ a cui è collegata, con derivata $\partial net_k/\partial o_j = w_{kj}$. La «colpa» di $j$ è la somma delle colpe delle unità a cui contribuisce, pesata da quanto contribuisce: è la soluzione del credit assignment.`,
    r`The output $o_j$ does not appear in $E_p$, but it influences every $net_k$ it is connected to, with derivative $\partial net_k/\partial o_j = w_{kj}$. The “blame” of $j$ is the sum of the blames of the units it contributes to, weighted by how much it contributes: it is the solution of credit assignment.`,
  ),
}

export const update: FormulaDef = {
  name: tx('Regola di aggiornamento', 'Update rule'),
  tex: r`w_{tu}^{new} = w_{tu} + \part{eta}{\eta}\,\part{d}{\delta_t}\,\part{o}{o_u}`,
  parts: [
    { k: 'eta', sym: r`\eta`, desc: tx(r`il learning rate`, r`the learning rate`) },
    {
      k: 'd',
      sym: r`\delta_t`,
      desc: tx(
        r`il segnale d’errore disponibile all’unità $t$ (di uscita o nascosta)`,
        r`the error signal available at unit $t$ (output or hidden)`,
      ),
    },
    {
      k: 'o',
      sym: r`o_u`,
      desc: tx(r`l’input a $t$ da $u$; per il bias $o_0 = 1$`, r`the input to $t$ from $u$; for the bias $o_0 = 1$`),
    },
  ],
  read: tx(r`«w t u nuovo è w t u più eta per delta t per o u».`, r`“w t u new is w t u plus eta times delta t times o u.”`),
  why: tx(
    r`Vale per ogni peso della rete, qualunque sia lo strato: cambia solo come si ottiene $\delta_t$. Sommando i contributi di tutti i pattern prima di aggiornare si ha la versione batch; aggiornando pattern per pattern, quella on-line.`,
    r`It holds for every weight of the network, whatever the layer: only the way $\delta_t$ is obtained changes. Summing the contributions of all the patterns before updating gives the batch version; updating pattern by pattern, the on-line one.`,
  ),
}
