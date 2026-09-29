# Stato dei lavori

Aggiornare questo file **alla fine di ogni lezione convertita**: è la memoria condivisa tra sessioni
(e computer) diversi. `npm run check` verifica che ogni immagine degli appunti compaia qui sotto.

## Lezioni

| Id | Appunti (`notes/Appunti/…`) | Sito | Eyebrow | Figure |
|---|---|---|---|---|
| 01 | 01 - Introduzione al Machine Learning.md | ✅ fatta | Lezione 1 | 1.1–1.6 |
| 02 | 02 - Il ML nei curricula della magistrale.md | ✅ fatta | Intermezzo | 2.1 |
| 03 | 03 - Concetti fondamentali del ML.md | ✅ fatta | Lezioni 2–3 | 3.1–3.14 |
| 04 | 04 - Generalizzazione e validazione (introduzione).md | ✅ fatta | Lezione 4 | 4.1–4.10 |
| 05 | 05 - Modelli lineari e K-nearest neighbors.md | ⏳ da fare | | |
| 06 | 06 - Reti neurali (parte 1) - dal neurone al MLP.md | ⏳ da fare | | |
| 07 | 07 - Note sulla backpropagation.md | ⏳ da fare | | |
| 08 | 08 - Reti neurali (parte 2) - addestramento in pratica.md | ⏳ da fare | | |
| 09 | 09 - Validazione (parte 1) - model selection e assessment.md | ⏳ da fare | | |
| 10 | 10 - Validazione (parte 2) - schemi formali.md | ⏳ da fare | | |
| 11 | 11 - Validazione (parte 3) - errori tipici e FAQ.md | ⏳ da fare | | |
| 12 | 12 - Statistical Learning Theory e VC-dimension.md | ⏳ da fare | | |
| 13 | 13 - Support Vector Machines.md | ⏳ da fare | | |
| 14 | 14 - SVM e kernel - aspetti pratici e visione critica.md | ⏳ da fare | | |
| 15 | 15 - Bias-varianza ed ensemble.md | ⏳ da fare | | |
| 16 | 16 - Reti neurali convoluzionali (CNN).md | ⏳ da fare | | |
| 17 | 17 - Deep learning.md | ⏳ da fare | | |
| 18 | 18 - Reti neurali randomizzate.md | ⏳ da fare | | |
| 19 | 19 - Apprendimento non supervisionato - K-means e SOM.md | ⏳ da fare | | |
| 20 | 20 - Reti neurali ricorrenti (RNN).md | ⏳ da fare | | |
| 21 | 21 - Apprendimento su dati strutturati e grafi.md | ⏳ da fare | | |

Decisioni di stile confermate dall'utente: **in attesa** della revisione della fase 1 (lezioni 01–04).
Quando l'utente approva o chiede modifiche, annotarlo qui (data + cosa è cambiato).

## Immagini degli appunti → figure del sito

Ogni immagine degli appunti viene **sostituita** da una figura interattiva (mai inclusa come immagine),
oppure motivata qui se non ricostruibile. Formato: `file immagine` → Fig. N.k `Componente` — cosa fa.

### 01 — Introduzione al Machine Learning

- `01-intro_cifre-manoscritte.png` → Fig. 1.1 `DigitsFigure` — cifre 8×8 generate da caratteri, blocco da disegno, matrice, vettore in ℝ⁶⁴, classificatore giocattolo (K-NN, dichiarato).
- `01-intro_struttura-corso.png` → Fig. 1.2 `CourseMap` — mappa del corso cliccabile, collegata alle lezioni (usata anche in home).
- `01-intro_gradiente-superficie.png` + `01-intro_minimo-locale.png` → Fig. 1.5 `GradientExplorer` — superficie 3D (cupola/conca/sella), curve di livello, ∇f e −∇f, discesa del gradiente.
- `01-intro_gaussiana.png` → Fig. 1.6 `GaussianExplorer` — μ, σ, soglia trascinabile, area della coda (2,5% a −1,96).
- Figure aggiunte: 1.3 `DotProduct` (prodotto scalare e norme), 1.4 `TensorFigure` (assi/indici).

### 02 — Il ML nei curricula

- (nessuna immagine negli appunti)
- Figure aggiunte: 2.1 `CurriculaMap`; `PlanBar` dentro il riquadro sul piano di studi.

### 03 — Concetti fondamentali del ML

- `03-l23_sistema-ml.png` → Fig. 3.1 `MLSystem` — ingredienti cliccabili, con link alle sezioni.
- `03-l23_dati-strutturati.png` → Fig. 3.3 `StructuredData` — sequenza, molecola, rete web; vicini al passaggio.
- `03-l23_clustering.png` → Fig. 3.4 `Clustering` — centroidi trascinabili (riusata in 3.13 con la distorsione).
- `03-l23_separatore-lineare.png` + `03-l23_classificatore-3d.png` → Fig. 3.5 `LinearSeparator` — retta trascinabile, loss 0/1, vista 3D a gradino.
- `03-l23_regressione.png` → Fig. 3.7 `HypothesesChoice` — retta 0,2x − 0,4, spezzata, polinomio interpolante.
- `03-l23_ricerca-ipotesi.png` → Fig. 3.8 `HypothesisSearch` — ricerca locale animata in H, regione compatibile con il TR.
- `03-l23_funzioni-booleane.png` → Fig. 3.9 `BooleanLearner` — tabella di verità, version space con/senza bias.
- `03-l23_sistemi-induttivi.png` → Fig. 3.10 `InductiveDeductive`.
- `03-l23_kanizsa.png` → Fig. 3.11 `Kanizsa` — rotazione dei pac-man, contorno illusorio.
- `03-l23_mse.png` → Fig. 3.12 `MSEFigure` — retta trascinabile, residui, quadrati degli errori.
- Figure aggiunte: 3.2 `OneHot`, 3.6 `RegressionExercise`, 3.13 `Clustering showLoss`, 3.14 `DensityML`.

### 04 — Generalizzazione e validazione

- `04-l4_target-seno.png` → Fig. 4.1 `SineTarget`.
- `04-l4_polinomi.png` → Fig. 4.2 `PolyFit` (M condiviso con 4.3 e 4.4 tramite `polyStore`).
- `04-l4_rms-vs-M.png` → Fig. 4.3 `RmsCurve`.
- `04-l4_polinomio9-dati.png` → Fig. 4.4 `MoreData`.
- `04-l4_curva-apprendimento.png` → Fig. 4.5 `ComplexityCurve` (andamenti illustrativi, dichiarati).
- `04-l4_bound-vc.png` → Fig. 4.6 `VCBound` (ε nella forma di Vapnik della lezione 12).
- `04-l4_schema-tr-vl-ts.png` → Fig. 4.7 `DataSplit`.
- `04-l4_kfold.png` → Fig. 4.8 `KFold`.
- `04-l4_roc.png` → Fig. 4.9 `ConfusionROC` (anche la matrice di confusione).
- `04-l4_ciclo-progettazione.png` → Fig. 4.10 `DesignCycle`.

## Aggiunte rispetto agli appunti

Tutto ciò che non è scritto negli appunti va elencato qui (l'utente deve poterlo rivedere).

- 01: esempi svolti (prodotto scalare, gradiente); «tre parole chiave» della definizione; ragionamento
  del gradiente via Δf ≈ ∇f·Δx; tracce di risposta alle domande d'esame.
- 03: come leggere gli indici $x_{p,i}$; esempio di self-supervised; derivazione del version space
  $\neg x_2 \wedge x_4$; intuizione della dimostrazione sull'unbiased learner; tracce di risposta.
- 04: perché $M = 9$ dà errore nullo; il fattore 2 in $E_{RMS}$; la formula di ε di Vapnik (dalla
  lezione 12); perché la stima diventa ottimistica; costo della K-fold; traccia per l'esercizio
  sull'errore di training nullo; tracce di risposta.
