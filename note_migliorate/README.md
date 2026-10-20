# Machine Learning — note riorganizzate

Versione riorganizzata degli appunti di `notes/Appunti/`, pensata per lo studio: gli argomenti sono disposti in un
ordine in cui ogni concetto è definito una sola volta, senza parti storiche o organizzative, con le dimostrazioni
svolte passo per passo e le figure ridisegnate (TikZ/pgfplots).

## Versioni

| PDF | Contenuto |
|---|---|
| `Machine_Learning_Note_Migliorate.pdf` | versione 1 (16 ottobre 2026) |
| `Machine_Learning_Note_Migliorate_v2.pdf` | versione 2 (17 ottobre 2026): errori corretti, notazione unica, frasi più brevi (vedi `ANALISI-DIDATTICA.md`, sezione 8) |

Il numero di versione sta in `versione.tex` ed è scritto in copertina. `build.sh` produce
`Machine_Learning_Note_Migliorate_v<N>.pdf` e non tocca i PDF delle versioni precedenti: per una nuova versione si
aumenta il numero in `versione.tex`.

## Contenuto della cartella

- `main.tex`, `preambolo.tex` — documento e stile (XeTeX via tectonic; font XCharter e Fira Sans).
- `versione.tex` — numero di versione (copertina e nome del PDF).
- `ANALISI-DIDATTICA.md` — analisi didattica capitolo per capitolo e modifiche applicate nella versione 2.
- `capitoli/` — un file per capitolo (00 guida, 01–19).
- `script/genera_dati.py` — calcola i dati delle figure "vere" (fit polinomiali, K-NN, SVM, rete con weight decay,
  bias-varianza, K-means, SOM, ...) e scrive `dati/*.dat` e `dati/valori.tex` (i numeri citati nelle didascalie).
- `dati/` — output dello script, già presente: per compilare non serve rigenerarlo.

## Come si compila

1. Compilare il PDF (serve [tectonic](https://tectonic-typesetting.github.io)):

   ```bash
   ./build.sh
   ```

   Uscita attesa: l'ultima riga è `PDF: .../Machine_Learning_Note_Migliorate_v2.pdf` (il numero viene da
   `versione.tex`).

2. Solo se si vogliono rigenerare i dati delle figure (serve `uv`, che installa numpy, scipy, scikit-learn,
   matplotlib in un ambiente temporaneo):

   ```bash
   ./build.sh dati
   ```

## Corrispondenza con le lezioni originali

| Capitolo | Lezioni degli appunti |
|---|---|
| 1 Strumenti matematici | 01 (richiami), 07 (regole di derivazione), 15 (lemma della varianza) |
| 2 Il problema dell'apprendimento | 01, 03, 04 (ciclo di progettazione, errori di interpretazione) |
| 3 Spazio delle ipotesi e bias induttivo | 03, 04 (problema mal posto) |
| 4 Modelli lineari | 05 (prima parte) |
| 5 Overfitting e regolarizzazione | 04 (fitting polinomiale), 05 (regolarizzazione), 17 (L1/L2) |
| 6 K-nearest neighbors | 05 (seconda parte) |
| 7 Statistical Learning Theory | 04, 12 |
| 8 Bias, varianza ed ensemble | 15, 09 (premessa) |
| 9 Validazione | 04, 09, 10, 11 (parti generali) |
| 10 Dal neurone al Perceptron | 06 (prima parte) |
| 11 MLP e backpropagation | 06 (seconda parte), 07 |
| 12 Addestrare una rete neurale | 08, 11 (epoche, early stopping, inizializzazioni) |
| 13 SVM e metodi kernel | 13, 14, 18 (teorema di Cover) |
| 14 Reti convoluzionali | 16 |
| 15 Deep learning | 17 |
| 16 Reti randomizzate | 18 |
| 17 K-means e SOM | 19 |
| 18 Reti ricorrenti | 20 |
| 19 Dati strutturati e grafi | 21 |

Non sono state riportate le parti organizzative del corso (lezione 02, informazioni d'esame e bibliografia della
lezione 01), gli aneddoti e le note storiche.
