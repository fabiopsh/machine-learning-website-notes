import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const gradProduct: FormulaDef = {
  name: 'Il gradiente attraverso gli strati',
  tex: r`\frac{\partial F}{\partial w_l} = \part{p}{\frac{\partial F_M}{\partial \mathbf{h}_{M-1}}\cdots}\part{l}{\frac{\partial F_l}{\partial w_l}}, \qquad \left|\frac{\partial F}{\partial w_l}\right| \approx \part{r}{\rho^{\,M-l+1}} \;\text{ se }\; \left\|\frac{\partial F_i}{\partial \mathbf{h}_i}\right\| \approx \rho`,
  parts: [
    {
      k: 'p',
      sym: r`\frac{\partial F_M}{\partial \mathbf{h}_{M-1}}\cdots`,
      desc: r`un fattore per ogni strato tra l’uscita ($M$) e lo strato $l$: è la regola della catena ripetuta`,
    },
    { k: 'l', sym: r`\frac{\partial F_l}{\partial w_l}`, desc: r`l’ultimo fattore: come l’uscita dello strato $l$ dipende dal suo peso $w_l$` },
    {
      k: 'r',
      sym: r`\rho^{\,M-l+1}`,
      desc: r`se ogni fattore ha norma circa $\rho$, il prodotto di $M - l + 1$ fattori è una **potenza** di $\rho$: l’esponente cresce avvicinandosi all’input`,
    },
  ],
  read: r`«la derivata di F rispetto a w l è il prodotto delle derivate di ogni strato, da M fino a l; la sua norma è circa rho alla M meno l più uno».`,
  why: r`Qui $\mathbf{h}_l = F_l(\mathbf{h}_{l-1})$ e $F = F_M \circ \dots \circ F_1$. Una potenza con base minore di 1 si annulla rapidamente, con base maggiore di 1 esplode: per questo con $\rho < 1$ il gradiente **svanisce** e con $\rho > 1$ **esplode**, tanto più quanto lo strato è lontano dall’uscita.`,
}

export const clipping: FormulaDef = {
  name: 'Gradient clipping',
  tex: r`\text{se } \part{n}{\|\mathbf{g}\|} > \part{v}{v} \;\text{ allora }\; \mathbf{g} \leftarrow \part{d}{\frac{v\,\mathbf{g}}{\|\mathbf{g}\|}}`,
  parts: [
    { k: 'n', sym: r`\|\mathbf{g}\|`, desc: r`la norma del gradiente $\mathbf{g}$` },
    { k: 'v', sym: r`v`, desc: r`la **soglia** sulla norma: un iperparametro` },
    {
      k: 'd',
      sym: r`\frac{v\,\mathbf{g}}{\|\mathbf{g}\|}`,
      desc: r`$\mathbf{g}/\|\mathbf{g}\|$ è il gradiente reso di norma 1 (solo la direzione); moltiplicato per $v$ ha norma esattamente $v$`,
    },
  ],
  read: r`«se la norma di g supera v, allora g diventa v per g diviso la norma di g».`,
  why: r`Il gradiente viene accorciato, non ruotato: si scende ancora nella stessa direzione, ma con un passo limitato. I gradienti di norma inferiore a $v$ restano invariati.`,
}

export const relu: FormulaDef = {
  name: 'ReLU',
  tex: r`f(x) = \max(0, x) = \begin{cases} \part{z}{0} & x < 0 \\ \part{x}{x} & x \ge 0 \end{cases}`,
  parts: [
    { k: 'z', sym: r`0`, desc: r`per net negativo l’unità è **spenta**: uscita nulla (e derivata nulla)` },
    { k: 'x', sym: r`x`, desc: r`per net positivo l’unità è **lineare**: lascia passare il net, con derivata $f'(x) = 1$` },
  ],
  read: r`«f di x è il massimo tra zero e x: zero se x è negativo, x se è positivo o nullo».`,
  why: r`La derivata è $1$ per ogni net positivo: retropropagando attraverso molti strati non si moltiplicano numeri minori di 1 come con le sigmoidi, e il gradiente non si riduce.`,
}
