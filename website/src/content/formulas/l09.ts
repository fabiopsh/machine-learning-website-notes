import type { FormulaDef } from '../../components/prose/Formula'
import { tx } from '../../lib/i18n'

const r = String.raw

export const gridCost: FormulaDef = {
  name: tx('Costo della grid search', 'Cost of grid search'),
  tex: tx(
    r`\#\text{prove} = (\part{v}{\#\text{valori}})^{\part{h}{\#\text{iperparametri}}}`,
    r`\#\text{trials} = (\part{v}{\#\text{values}})^{\part{h}{\#\text{hyperparameters}}}`,
  ),
  parts: [
    {
      k: 'v',
      sym: tx(r`\#\text{valori}`, r`\#\text{values}`),
      desc: tx(r`quanti valori si provano per ciascun iperparametro`, r`how many values are tried for each hyperparameter`),
    },
    {
      k: 'h',
      sym: tx(r`\#\text{iperparametri}`, r`\#\text{hyperparameters}`),
      desc: tx(
        r`quanti iperparametri si cercano insieme: sta all’esponente`,
        r`how many hyperparameters are searched together: it is the exponent`,
      ),
    },
  ],
  read: tx(
    r`«il numero di prove è il numero di valori elevato al numero di iperparametri».`,
    r`“the number of trials is the number of values raised to the number of hyperparameters.”`,
  ),
  why: tx(
    r`La griglia è il prodotto cartesiano dei valori: con 3 valori per 2 iperparametri si fanno $3^2 = 9$ prove, con 10 valori per 6 iperparametri $10^6$. La crescita esponenziale è il motivo delle griglie annidate (grossolana, poi fine) e della ricerca casuale.`,
    r`The grid is the Cartesian product of the values: with 3 values for 2 hyperparameters there are $3^2 = 9$ trials, with 10 values for 6 hyperparameters $10^6$. The exponential growth is the reason for nested grids (coarse, then fine) and for random search.`,
  ),
}

export const rCoef: FormulaDef = {
  name: tx('Coefficiente di correlazione', 'Correlation coefficient'),
  tex: r`R = \sqrt{1 - \frac{\part{S}{S^2}}{\part{Sy}{S_y^2}}}, \qquad S_y^2 = \text{mean}_i\big[(y_i - \bar y)^2\big]`,
  parts: [
    {
      k: 'S',
      sym: r`S^2`,
      desc: tx(r`l’errore quadratico medio del modello (MSE): $S$ è l’RMS`, r`the mean squared error of the model (MSE): $S$ is the RMS`),
    },
    {
      k: 'Sy',
      sym: r`S_y^2`,
      desc: tx(
        r`la varianza del target: l’errore di un modello che risponde sempre con la media $\bar y$`,
        r`the variance of the target: the error of a model that always answers with the mean $\bar y$`,
      ),
    },
  ],
  read: tx(
    r`«R è la radice di uno meno S quadro fratto S y quadro».`,
    r`“R is the square root of one minus S squared over S y squared.”`,
  ),
  why: tx(
    r`Il rapporto $S^2/S_y^2$ confronta l’errore del modello con quello di chi risponde sempre la media: se il modello non fa meglio della media vale 1 e $R = 0$; se l’errore è nullo $R = 1$. Per questo $R$ sta in $[0, 1]$ e 1 è il meglio.`,
    r`The ratio $S^2/S_y^2$ compares the error of the model with that of always answering the mean: if the model does no better than the mean it equals 1 and $R = 0$; if the error is zero, $R = 1$. This is why $R$ lies in $[0, 1]$ and 1 is the best.`,
  ),
}
