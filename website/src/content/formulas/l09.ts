import type { FormulaDef } from '../../components/prose/Formula'

const r = String.raw

export const gridCost: FormulaDef = {
  name: 'Costo della grid search',
  tex: r`\#\text{prove} = (\part{v}{\#\text{valori}})^{\part{h}{\#\text{iperparametri}}}`,
  parts: [
    { k: 'v', sym: r`\#\text{valori}`, desc: r`quanti valori si provano per ciascun iperparametro` },
    { k: 'h', sym: r`\#\text{iperparametri}`, desc: r`quanti iperparametri si cercano insieme: sta all’esponente` },
  ],
  read: r`«il numero di prove è il numero di valori elevato al numero di iperparametri».`,
  why: r`La griglia è il prodotto cartesiano dei valori: con 3 valori per 2 iperparametri si fanno $3^2 = 9$ prove, con 10 valori per 6 iperparametri $10^6$. La crescita esponenziale è il motivo delle griglie annidate (grossolana, poi fine) e della ricerca casuale.`,
}

export const rCoef: FormulaDef = {
  name: 'Coefficiente di correlazione',
  tex: r`R = \sqrt{1 - \frac{\part{S}{S^2}}{\part{Sy}{S_y^2}}}, \qquad S_y^2 = \text{mean}_i\big[(y_i - \bar y)^2\big]`,
  parts: [
    { k: 'S', sym: r`S^2`, desc: r`l’errore quadratico medio del modello (MSE): $S$ è l’RMS` },
    { k: 'Sy', sym: r`S_y^2`, desc: r`la varianza del target: l’errore di un modello che risponde sempre con la media $\bar y$` },
  ],
  read: r`«R è la radice di uno meno S quadro fratto S y quadro».`,
  why: r`Il rapporto $S^2/S_y^2$ confronta l’errore del modello con quello di chi risponde sempre la media: se il modello non fa meglio della media vale 1 e $R = 0$; se l’errore è nullo $R = 1$. Per questo $R$ sta in $[0, 1]$ e 1 è il meglio.`,
}
