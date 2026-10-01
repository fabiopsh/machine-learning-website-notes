import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const gradProduct: FormulaDef = {
  name: tx('Il gradiente attraverso gli strati', 'The gradient through the layers'),
  tex: tx(
    r`\frac{\partial F}{\partial w_l} = \part{p}{\frac{\partial F_M}{\partial \mathbf{h}_{M-1}}\cdots}\part{l}{\frac{\partial F_l}{\partial w_l}}, \qquad \left|\frac{\partial F}{\partial w_l}\right| \approx \part{r}{\rho^{\,M-l+1}} \;\text{ se }\; \left\|\frac{\partial F_i}{\partial \mathbf{h}_i}\right\| \approx \rho`,
    r`\frac{\partial F}{\partial w_l} = \part{p}{\frac{\partial F_M}{\partial \mathbf{h}_{M-1}}\cdots}\part{l}{\frac{\partial F_l}{\partial w_l}}, \qquad \left|\frac{\partial F}{\partial w_l}\right| \approx \part{r}{\rho^{\,M-l+1}} \;\text{ if }\; \left\|\frac{\partial F_i}{\partial \mathbf{h}_i}\right\| \approx \rho`,
  ),
  parts: [
    {
      k: 'p',
      sym: r`\frac{\partial F_M}{\partial \mathbf{h}_{M-1}}\cdots`,
      desc: tx(
        r`un fattore per ogni strato tra l’uscita ($M$) e lo strato $l$: è la regola della catena ripetuta`,
        r`one factor for each layer between the output ($M$) and layer $l$: it is the repeated chain rule`,
      ),
    },
    {
      k: 'l',
      sym: r`\frac{\partial F_l}{\partial w_l}`,
      desc: tx(
        r`l’ultimo fattore: come l’uscita dello strato $l$ dipende dal suo peso $w_l$`,
        r`the last factor: how the output of layer $l$ depends on its weight $w_l$`,
      ),
    },
    {
      k: 'r',
      sym: r`\rho^{\,M-l+1}`,
      desc: tx(
        r`se ogni fattore ha norma circa $\rho$, il prodotto di $M - l + 1$ fattori è una **potenza** di $\rho$: l’esponente cresce avvicinandosi all’input`,
        r`if each factor has norm about $\rho$, the product of $M - l + 1$ factors is a **power** of $\rho$: the exponent grows as one approaches the input`,
      ),
    },
  ],
  read: tx(
    r`«la derivata di F rispetto a w l è il prodotto delle derivate di ogni strato, da M fino a l; la sua norma è circa rho alla M meno l più uno».`,
    r`“the derivative of F with respect to w l is the product of the derivatives of each layer, from M down to l; its norm is about rho to the power M minus l plus one.”`,
  ),
  why: tx(
    r`Qui $\mathbf{h}_l = F_l(\mathbf{h}_{l-1})$ e $F = F_M \circ \dots \circ F_1$. Una potenza con base minore di 1 si annulla rapidamente, con base maggiore di 1 esplode: per questo con $\rho < 1$ il gradiente **svanisce** e con $\rho > 1$ **esplode**, tanto più quanto lo strato è lontano dall’uscita.`,
    r`Here $\mathbf{h}_l = F_l(\mathbf{h}_{l-1})$ and $F = F_M \circ \dots \circ F_1$. A power with base less than 1 quickly goes to zero, with base greater than 1 it blows up: this is why with $\rho < 1$ the gradient **vanishes** and with $\rho > 1$ it **explodes**, all the more so the farther the layer is from the output.`,
  ),
}

export const clipping: FormulaDef = {
  name: 'Gradient clipping',
  tex: tx(
    r`\text{se } \part{n}{\|\mathbf{g}\|} > \part{v}{v} \;\text{ allora }\; \mathbf{g} \leftarrow \part{d}{\frac{v\,\mathbf{g}}{\|\mathbf{g}\|}}`,
    r`\text{if } \part{n}{\|\mathbf{g}\|} > \part{v}{v} \;\text{ then }\; \mathbf{g} \leftarrow \part{d}{\frac{v\,\mathbf{g}}{\|\mathbf{g}\|}}`,
  ),
  parts: [
    { k: 'n', sym: r`\|\mathbf{g}\|`, desc: tx(r`la norma del gradiente $\mathbf{g}$`, r`the norm of the gradient $\mathbf{g}$`) },
    { k: 'v', sym: r`v`, desc: tx(r`la **soglia** sulla norma: un iperparametro`, r`the **threshold** on the norm: a hyperparameter`) },
    {
      k: 'd',
      sym: r`\frac{v\,\mathbf{g}}{\|\mathbf{g}\|}`,
      desc: tx(
        r`$\mathbf{g}/\|\mathbf{g}\|$ è il gradiente reso di norma 1 (solo la direzione); moltiplicato per $v$ ha norma esattamente $v$`,
        r`$\mathbf{g}/\|\mathbf{g}\|$ is the gradient rescaled to norm 1 (the direction only); multiplied by $v$ it has norm exactly $v$`,
      ),
    },
  ],
  read: tx(
    r`«se la norma di g supera v, allora g diventa v per g diviso la norma di g».`,
    r`“if the norm of g exceeds v, then g becomes v times g divided by the norm of g.”`,
  ),
  why: tx(
    r`Il gradiente viene accorciato, non ruotato: si scende ancora nella stessa direzione, ma con un passo limitato. I gradienti di norma inferiore a $v$ restano invariati.`,
    r`The gradient is shortened, not rotated: the descent still goes in the same direction, but with a limited step. Gradients with norm below $v$ are left unchanged.`,
  ),
}

export const relu: FormulaDef = {
  name: 'ReLU',
  tex: r`f(x) = \max(0, x) = \begin{cases} \part{z}{0} & x < 0 \\ \part{x}{x} & x \ge 0 \end{cases}`,
  parts: [
    {
      k: 'z',
      sym: r`0`,
      desc: tx(
        r`per net negativo l’unità è **spenta**: uscita nulla (e derivata nulla)`,
        r`for a negative net the unit is **off**: zero output (and zero derivative)`,
      ),
    },
    {
      k: 'x',
      sym: r`x`,
      desc: tx(
        r`per net positivo l’unità è **lineare**: lascia passare il net, con derivata $f'(x) = 1$`,
        r`for a positive net the unit is **linear**: it lets the net through, with derivative $f'(x) = 1$`,
      ),
    },
  ],
  read: tx(
    r`«f di x è il massimo tra zero e x: zero se x è negativo, x se è positivo o nullo».`,
    r`“f of x is the maximum of zero and x: zero if x is negative, x if it is positive or zero.”`,
  ),
  why: tx(
    r`La derivata è $1$ per ogni net positivo: retropropagando attraverso molti strati non si moltiplicano numeri minori di 1 come con le sigmoidi, e il gradiente non si riduce.`,
    r`The derivative is $1$ for every positive net: backpropagating through many layers does not multiply numbers less than 1 as with the sigmoids, and the gradient does not shrink.`,
  ),
}
