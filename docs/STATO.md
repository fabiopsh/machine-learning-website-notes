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
| 05 | 05 - Modelli lineari e K-nearest neighbors.md | ✅ fatta | (non indicato) | 5.1–5.23 |
| 06 | 06 - Reti neurali (parte 1) - dal neurone al MLP.md | ✅ fatta | (non indicato) | 6.1–6.15 |
| 07 | 07 - Note sulla backpropagation.md | ✅ fatta | (non indicato) | 7.1–7.5 |
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

Decisioni di stile confermate dall'utente:

- 2026-09-30 — lo stile delle lezioni 01–04 va bene: procedere con le lezioni successive (05–08 in questa
  sessione, commit e push dopo ogni lezione). Richieste: correggere la scrollbar della sidebar nel tema
  Liquid Glass e portare il Liquid Glass anche dentro le figure (grafici, schemi, tabelle); **ogni figura
  nuova deve nascere già in stile glass** (regole in `docs/GUIDA-LEZIONI.md` §7).

## Registro

- 2026-09-29 — Fase 1: lezioni 01–04, glossario, ricerca, tema chiaro/scuro.
- 2026-09-30 — Guida (`docs/GUIDA-LEZIONI.md`), skill `/nuova-lezione`, script di verifica;
  pubblicazione automatica su GitHub Pages (`.github/workflows/deploy.yml`, `404.html` che
  converte gli URL senza `#`); stile **Liquid Glass** attivabile dalla barra in alto
  (`website/src/styles/glass.css`, attributo `data-style="glass"` su `<html>`).
- 2026-09-30 — Scrollbar dei pannelli glass (sidebar, indice, pannello mobile) rientrate dagli angoli;
  Liquid Glass esteso alle figure: token `--surface`, `--plot-pane`, `--gloss`, lastra di vetro nei grafici
  (`.axes__frame`), riquadri SVG arrotondati, blocchi colorati con riflesso, tabelle; colori della figura
  TR/VL/TS in token (`--split-*`). `Surface3D` accetta `plane` (piano orizzontale ordinato in profondità) e
  `floor={false}`; `lib/math.ts` ha `lstsq` e `ridgePolyfit`.
- 2026-09-30 — Lezione 05 (modelli lineari e K-NN), 23 figure.
- 2026-09-30 — Lezione 07 (backpropagation), 5 figure; `NetSvg` accetta `onNodeClick`.
- 2026-09-30 — Lezione 06 (reti neurali, parte 1), 15 figure; componente comune `widgets/l06/NetSvg.tsx` per disegnare reti a strati.

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

### 05 — Modelli lineari e K-NN

- `05-lin_dataset.png` → Fig. 5.1 `HtfData` — 200 punti di due classi, scenario 2 (miscele di 10 gaussiane) o 1 (una gaussiana per classe), centri visibili; lo scenario è condiviso con 5.11, 5.17, 5.19–5.21 (`widgets/l05/htf.ts`).
- `05-lin_iperpiano.png` → Fig. 5.2 `Hyperplane3D` — piano $\mathbf{w}^T\mathbf{x}+w_0$ in 3D che taglia il piano degli input lungo il confine; cursori dei pesi; tabella dei tre esempi.
- `05-lin_aima-sismi.png` → Fig. 5.3 `Seismic` — dati sismici (letti dalla figura), confine $-4{,}9+1{,}7x_1-x_2=0$, evento $(6,3)$ trascinabile con il calcolo del segno.
- `05-lin_proprieta.png` → Fig. 5.4 `SeparatorProps` — retta trascinabile, $\mathbf{w}$ ortogonale, altre soluzioni, scala $K$, passaggio per l’origine.
- `05-lin_loss-smooth.png` → Fig. 5.5 `LossSmooth` — loss 0/1 e quadratica in funzione di $\mathbf{w}^T\mathbf{x}$, target $\pm1$, tangente e verso di discesa.
- `05-lin_discesa-1d.png` → Fig. 5.6 `Descent1D` — passi $w_0, w_1, \dots$ con tangenti, $\eta$, oscillazione e divergenza.
- `05-lin_superficie-errore.png` → Fig. 5.7 `ErrorSurface` — paraboloide $E(w_0,w_1)$ sui dati dell’esercizio, $-
abla E$ sulla superficie, retta e residui corrispondenti.
- `05-lin_batch-online.png` → Fig. 5.8 `BatchOnline` — percorsi batch (blu) e on-line (viola, arancione) sulle curve di livello.
- `05-lin_curve-apprendimento.png` → Fig. 5.9 `LearningCurves` — curve verde/rossa/blu (tre $\eta$) più una curva con $\eta$ scelto dallo studente.
- `05-lin_delta-rule.png` → Fig. 5.10 `DeltaRule` — LTU con input cliccabili, pesi, target, passo della delta rule con i calcoli.
- `05-lin_htf-lineare.png` → Fig. 5.11 `HtfLinear` — regressione sui target 0/1, confine $\mathbf{x}^T\mathbf{w}=0{,}5$, regioni, errori, confronto con il confine di Bayes.
- `05-lin_and.png` → Fig. 5.12 `AndSeparable` — AND con retta trascinabile e tabella di verità; riquadro della congiunzione $x_1\wedge x_2\wedge x_4$.
- `05-lin_xor.png` → Fig. 5.13 `Shattering` — tre punti trascinabili con le 8 etichettature in miniatura; XOR a quattro punti con etichette cliccabili.
- `05-lin_regolarizzazione.png` → Fig. 5.14 `RidgeFit` — polinomio di grado 9 con penalità di Tikhonov, $\ln\lambda$ condiviso con 5.15, coefficienti.
- `05-lin_rms-lambda.png` → Fig. 5.15 `RidgeRms` — $E_{RMS}$ di training e test al variare di $\ln\lambda$.
- `05-knn_1nn-vs-5nn.png` → Fig. 5.16 `KnnQuery` — punto $x_q$ trascinabile, $k$ vicini nel cerchio, voto.
- `05-knn_1nn-15nn.png` → Fig. 5.17 `KnnRegions` — regioni del 1-NN e del $k$-NN ($k$ condiviso), errori di training e test.
- `05-knn_voronoi.png` → Fig. 5.18 `Voronoi` — celle calcolate, confine del 1-NN tra classi diverse, punto da classificare.
- `05-knn_u-shape.png` → Fig. 5.19 `KnnCurves variant="u"` — errore di training e test al variare di $k$ (da $l$ a 1).
- `05-knn_errori-k.png` → Fig. 5.20 `KnnCurves variant="htf"` — stesse curve sui gradi di libertà $l/k$, modello lineare ed errore di Bayes.
- `05-knn_bayes.png` → Fig. 5.21 `BayesVsKnn` — confine di Bayes (dalla densità vera) e del $k$-NN, sovrapponibili.
- `05-knn_scala.png` → Fig. 5.22 `ScaleNN` — riscalando $x_1$ cambia il vicino più prossimo.
- `05-knn_curse.png` → Fig. 5.23 `Curse` — sottocubo nel cubo unitario e curve lato $= r^{1/n}$ per $n = 1, 2, 3, 10$; modalità «frazione» e «lato».

### 06 — Reti neurali (parte 1)

- `06-nn1_neurone-biologico.png` → Fig. 6.1 `BioNeuron` — schema del neurone con le parti spiegate al passaggio, sinapsi eccitatorie/inibitoria cliccabili, potenziale con soglia, spike lungo l’assone, plasticità hebbiana.
- `06-nn1_unita.png` → Fig. 6.2 `Unit` — unità con input, pesi, bias $x_0 = 1$, $\Sigma$ e $f$ selezionabile.
- `06-nn1_attivazioni.png` → Fig. 6.3 `Activations` — lineare, soglia e logistica applicate allo stesso input netto.
- `06-nn1_perceptron-rosenblatt.png` → Fig. 6.4 `Rosenblatt` — retina 8 × 8 disegnabile, 16 unità associative, risposta Ψ con pesi appresi dal Perceptron (X contro O).
- `06-nn1_and-or.png` → Fig. 6.5 `BoolPerceptron` — AND, OR e NOT con rete, tabella di verità e retta; pesi regolabili.
- `06-nn1_xor-rete.png` → Fig. 6.6 `XorNetwork` — rete AND/OR per lo XOR, trasformazione continua dallo spazio degli input allo spazio $(h_1, h_2)$.
- `06-nn1_perceptron-geometria.png` → Fig. 6.7 `PerceptronStep` — $\mathbf{w}$, $\eta d\mathbf{x}$ e $\mathbf{w}_{new}$ come somma di vettori, confini prima/dopo, epoca completa.
- `06-nn1_convergenza.png` → Fig. 6.8 `ConvergenceBound` — limiti $(q\alpha)^2/\|\mathbf{w}^*\|^2$ e $q\beta$, $q_{max}$, esecuzione reale del Perceptron, separazione regolabile.
- `06-nn1_lms-vs-perc.png` → Fig. 6.9 `LmsVsPerceptron` — soluzione LMS che sbaglia un punto di un problema separabile, due Perceptron che separano; punto lontano trascinabile.
- `06-nn1_sigmoidi.png` → Fig. 6.10 `Sigmoids` — logistica con $a = 0{,}5; 1; 2$ più $a$ a scelta, tangente iperbolica, limiti $a \to 0$ e $a \to \infty$.
- `06-nn1_derivate-sigmoide.png` → Fig. 6.11 `SigmoidDerivatives` — $f_\sigma$, $f'_\sigma$, $f''_\sigma$, zone di saturazione, ampiezza della correzione.
- `06-nn1_due-viste.png` → Fig. 6.12 `TwoViews` — rete 2-3-1 e formula annidata con i valori per l’input scelto, collegate al passaggio.
- `06-nn1_architettura.png` → Fig. 6.13 `Architectures` — MLP a due strati e a tre strati con connessioni che saltano, elaborazione feedforward passo passo.
- `06-nn1_multi-output.png` → Fig. 6.14 `MultiOutput` — tre uscite ($0{,}2;\ 0{,}7;\ 0{,}1$ all’inizio) e classe vincente.
- Figura aggiunta: 6.15 `UniversalApprox` — costruzione «a gradini» con unità logistiche (seno o gobba), errore massimo al variare delle unità.

### 07 — Note sulla backpropagation

- `07-bp_rete.png` → Fig. 7.1 `BpNetwork` — MLP con input $i$, nascoste $j$, uscite $k$ e target $d_k$; pesi $w_{ji}$ e $w_{kj}$ evidenziati, unità selezionabili.
- `07-bp_superficie.png` → Fig. 7.2 `NonConvexSurface` — superficie non convessa con più minimi in 3D e a curve di livello, $\nabla E$ e $-\nabla E$, discesa dal punto $Z$ trascinabile.
- `07-bp_localita.png` → Fig. 7.3 `Locality` — porzione $i \to j \to k$: per ogni calcolo ($\Delta w_{kj}$, $\delta_j$, $\Delta w_{ji}$) si evidenziano le sole unità e i pesi coinvolti.
- `07-bp_retropropagazione.png` → Fig. 7.4 `BackpropFlow` — rete 2-3-2 con il ciclo di addestramento fase per fase: uscite, delta di uscita, delta retropropagati (frecce rosse), aggiornamento, 50 cicli.
- Figura aggiunta: 7.5 `NumericExample` — l’esempio numerico degli appunti calcolato dal vivo, con valori modificabili e aggiornamenti ripetibili.

## Aggiunte rispetto agli appunti

Tutto ciò che non è scritto negli appunti va elencato qui (l'utente deve poterlo rivedere).

- 01: esempi svolti (prodotto scalare, gradiente); «tre parole chiave» della definizione; ragionamento
  del gradiente via Δf ≈ ∇f·Δx; tracce di risposta alle domande d'esame.
- 03: come leggere gli indici $x_{p,i}$; esempio di self-supervised; derivazione del version space
  $\neg x_2 \wedge x_4$; intuizione della dimostrazione sull'unbiased learner; tracce di risposta.
- 07: svolgimento dell’esercizio «caso 2 direttamente dalla definizione di $E_p$»; letture e spiegazioni
  delle formule; tracce di risposta (compresa la domanda su loss diverse e più strati). Nelle figure: funzione
  d’errore della 7.2 costruita come somma di gaussiane (illustrativa); rete, pattern, target e $\eta$ della
  7.4 scelti per l’esempio; la 7.5 riproduce l’esempio numerico degli appunti.
- 06: lettura della disuguaglianza di Cauchy-Schwarz ($\cos^2\theta \le 1$); intuizione della costruzione a
  gradini per l’approssimazione universale (con la figura 6.15, dichiarata come non-dimostrazione); letture e
  spiegazioni delle formule; tracce di risposta. Nelle figure: parametri del neurone biologico illustrativi
  (soglia, perdita di potenziale, rinforzo hebbiano); nel Perceptron di Rosenblatt le unità associative sono
  blocchi 2 × 2 (in origine collegamenti casuali) e i pesi sono appresi su lettere X/O generate; i dati di
  6.7–6.9 sono costruiti (6.9 imita Hastie et al. Fig. 4.14); pesi della rete di 6.12 e 6.14 scelti a mano.
- 05: derivazione della soluzione in forma chiusa dal gradiente nullo; valori di $\delta$ ed $\eta$
  nell’esempio della delta rule ($\eta = 0{,}3/1{,}4$); perché $X^TX + \lambda I$ è sempre invertibile;
  «lettura» e spiegazione delle formule con anatomia; tracce di risposta (per lo XOR l’argomento del punto
  medio). Nelle figure: i dati del problema di esempio sono **generati** secondo i due scenari (miscela di 10
  gaussiane con varianza $1/5$ attorno a $(1,0)$ e $(0,1)$; una gaussiana per classe), con test di 4000
  punti e confine di Bayes calcolato dalla densità vera, quindi i numeri differiscono da quelli di HTF; i dati
  sismici sono letti a occhio dalla figura; le figure 5.6–5.9 usano i cinque punti dell’esercizio svolto con
  l’errore medio; la 5.14 usa i dieci punti della lezione 4, quindi i coefficienti non coincidono con la
  tabella degli appunti (riportata identica); conteggio 14 etichettature separabili su 16 per quattro punti.
- 04: perché $M = 9$ dà errore nullo; il fattore 2 in $E_{RMS}$; la formula di ε di Vapnik (dalla
  lezione 12); perché la stima diventa ottimistica; costo della K-fold; traccia per l'esercizio
  sull'errore di training nullo; tracce di risposta.
