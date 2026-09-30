import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const errP: FormulaDef = {
  name: 'Errore totale e sul pattern',
  tex: r`E_{tot} = \sum_p \part{Ep}{E_p}, \qquad E_p = \part{half}{\frac{1}{2}}\sum_{k=1}^{\part{K}{K}}(d_k - o_k)^2`,
  parts: [
    { k: 'Ep', sym: r`E_p`, desc: r`l’errore sul pattern $p$, calcolato su tutte le unità di uscita` },
    { k: 'half', sym: r`\tfrac12`, desc: r`serve solo a semplificare la derivata: il $2$ dell’esponente lo cancella` },
    { k: 'K', sym: r`K`, desc: r`il numero di unità di uscita` },
  ],
  read: r`«E totale è la somma su p di E p; E p è un mezzo della somma per k da uno a K di d k meno o k, al quadrato».`,
}

export const generic: FormulaDef = {
  name: 'Gradiente per un peso generico',
  tex: r`\Delta_p w_{tu} = -\frac{\partial E_p}{\partial w_{tu}} = \underbrace{\part{d}{-\frac{\partial E_p}{\partial net_t}}}_{\delta_t}\cdot\underbrace{\part{o}{\frac{\partial net_t}{\partial w_{tu}}}}_{o_u} = \delta_t\cdot o_u`,
  parts: [
    { k: 'd', sym: r`\delta_t`, desc: r`il **delta** dell’unità $t$: quanto l’errore cambia al variare del suo input netto (con il segno meno)` },
    { k: 'o', sym: r`o_u`, desc: r`l’input che arriva a $t$ da $u$ lungo la connessione $w_{tu}$: nella somma $net_t = \sum_s w_{ts}o_s$ solo il termine $s = u$ dipende da $w_{tu}$` },
  ],
  read: r`«delta p di w t u è meno la derivata di E p rispetto a w t u, cioè delta t per o u».`,
  why: r`La regola della catena spezza la derivata in due pezzi: uno che riguarda solo l’unità $t$ (il suo delta) e uno che riguarda solo la connessione (l’input $o_u$). Tutta la difficoltà si sposta nel calcolare $\delta_t$ per ogni unità.`,
}

export const deltaOut: FormulaDef = {
  name: 'Delta di un’unità di uscita',
  tex: r`\delta_k = \part{e}{(d_k - o_k)}\cdot \part{f}{f'_k(net_k)}`,
  parts: [
    { k: 'e', sym: r`d_k - o_k`, desc: r`l’errore dell’uscita $k$: è misurabile direttamente perché il target è noto` },
    { k: 'f', sym: r`f'_k(net_k)`, desc: r`la derivata dell’attivazione nel punto di lavoro (vale 1 per un’uscita lineare)` },
  ],
  read: r`«delta k è d k meno o k, per f k primo di net k».`,
  why: r`È lo stesso delta della singola unità sigmoidale: $-\partial E_p/\partial o_k = d_k - o_k$ perché nella somma di $E_p$ solo il termine $r = k$ dipende da $o_k$.`,
}

export const deltaHidden: FormulaDef = {
  name: 'Delta di un’unità nascosta',
  tex: r`\delta_j = \Big(\sum_{k=1}^{K} \part{dk}{\delta_k}\, \part{w}{w_{kj}}\Big)\cdot \part{f}{f'_j(net_j)}`,
  parts: [
    { k: 'dk', sym: r`\delta_k`, desc: r`i delta delle unità di uscita, **già calcolati**: è qui che l’errore «risale» la rete` },
    { k: 'w', sym: r`w_{kj}`, desc: r`gli stessi pesi usati nella propagazione in avanti, da $j$ verso $k$` },
    { k: 'f', sym: r`f'_j(net_j)`, desc: r`la derivata dell’attivazione dell’unità nascosta` },
  ],
  read: r`«delta j è la somma su k di delta k per w k j, il tutto per f j primo di net j».`,
  why: r`L’uscita $o_j$ non compare in $E_p$, ma influenza ogni $net_k$ a cui è collegata, con derivata $\partial net_k/\partial o_j = w_{kj}$. La «colpa» di $j$ è la somma delle colpe delle unità a cui contribuisce, pesata da quanto contribuisce: è la soluzione del credit assignment.`,
}

export const update: FormulaDef = {
  name: 'Regola di aggiornamento',
  tex: r`w_{tu}^{new} = w_{tu} + \part{eta}{\eta}\,\part{d}{\delta_t}\,\part{o}{o_u}`,
  parts: [
    { k: 'eta', sym: r`\eta`, desc: r`il learning rate` },
    { k: 'd', sym: r`\delta_t`, desc: r`il segnale d’errore disponibile all’unità $t$ (di uscita o nascosta)` },
    { k: 'o', sym: r`o_u`, desc: r`l’input a $t$ da $u$; per il bias $o_0 = 1$` },
  ],
  read: r`«w t u nuovo è w t u più eta per delta t per o u».`,
  why: r`Vale per ogni peso della rete, qualunque sia lo strato: cambia solo come si ottiene $\delta_t$. Sommando i contributi di tutti i pattern prima di aggiornare si ha la versione batch; aggiornando pattern per pattern, quella on-line.`,
}
