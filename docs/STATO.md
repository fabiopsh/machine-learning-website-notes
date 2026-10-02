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
| 08 | 08 - Reti neurali (parte 2) - addestramento in pratica.md | ✅ fatta | (non indicato) | 8.1–8.13 |
| 09 | 09 - Validazione (parte 1) - model selection e assessment.md | ✅ fatta | (non indicato) | 9.1–9.4 |
| 10 | 10 - Validazione (parte 2) - schemi formali.md | ✅ fatta | (non indicato) | 10.1–10.5 |
| 11 | 11 - Validazione (parte 3) - errori tipici e FAQ.md | ✅ fatta | (non indicato) | 11.1–11.3 |
| 12 | 12 - Statistical Learning Theory e VC-dimension.md | ✅ fatta | (non indicato) | 12.1–12.5 |
| 13 | 13 - Support Vector Machines.md | ✅ fatta | (non indicato) | 13.1–13.9 |
| 14 | 14 - SVM e kernel - aspetti pratici e visione critica.md | ✅ fatta | (non indicato) | 14.1–14.4 |
| 15 | 15 - Bias-varianza ed ensemble.md | ✅ fatta | (non indicato) | 15.1–15.7 |
| 16 | 16 - Reti neurali convoluzionali (CNN).md | ✅ fatta | (non indicato) | 16.1–16.13 |
| 17 | 17 - Deep learning.md | ✅ fatta | (non indicato) | 17.1–17.15 |
| 18 | 18 - Reti neurali randomizzate.md | ✅ fatta | (non indicato) | 18.1–18.4 |
| 19 | 19 - Apprendimento non supervisionato - K-means e SOM.md | ✅ fatta | (non indicato) | 19.1–19.9 |
| 20 | 20 - Reti neurali ricorrenti (RNN).md | ✅ fatta | (non indicato) | 20.1–20.11 |
| 21 | 21 - Apprendimento su dati strutturati e grafi.md | ✅ fatta | (non indicato) | 21.1–21.12 |

**Tutte le 21 lezioni sono convertite.** Restano possibili solo revisioni (figure, testi) su richiesta dell’utente.

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
- 2026-09-30 — Revisione visiva di tutte le figure 1.1–7.5 (chiaro, scuro, glass chiaro e scuro, mobile).
  Token `--surface-solid`: nodi e riquadri opachi sopra le linee, che nel glass si vedevano in trasparenza
  (1.2, 1.4, 2.1, 3.8, 5.10, 6.1, 6.2, 7.3). L'etichetta dell'asse y ora sta sopra l'asse e non copre il tick
  più alto (tutti i grafici). Pedici veri nel testo SVG e nelle superfici 3D (`components/plot/svgText.tsx`:
  il serif disegnava x₁ come «x1»; poi $w_{ji}$, $E_{RMS}$, $q_{max}$, $r^{1/n}$) e KaTeX al posto di pedici
  Unicode o `_` nei testi (4.6, 6.8, 6.12, 6.15, 7.1, 7.3, 7.4, 7.5). Etichette dei pesi di `NetSvg` spostate
  di lato rispetto all'arco (6.5, 6.6); pesi centrati sul proprio arco (5.10, 6.2) e ingressi non più tagliati;
  ≡ di 3.10 non più sopra il titolo; etichette spostate dove non passano curve (3.8, 4.6, 5.15, 5.23); tick di
  $k$ in 5.20 sopra l'etichetta e legenda dei quadratini del modello lineare; notazione $1{,}5 \cdot 10^{-8}$ in
  5.14; tacca $l$ in corsivo nel cursore di $k$ (5.17, 5.21); tangente in zero più visibile (6.10); riquadro di
  disegno di 1.1 senza inversione dei colori nel tema scuro; 6.4 in colonna sugli schermi stretti.

- 2026-09-30 — Lezione 08 (reti neurali, parte 2), 13 figure, già scritte con le regole della revisione
  (pedici con `svgScript`/`Tex`, `--surface-solid` sotto le linee). Nuovo `widgets/l08/mlp.ts`: MLP con uno
  strato nascosto addestrato **dal vivo** nel browser (batch, momentum, weight decay separato, addestramento
  progressivo a pezzi per frame, storico degli errori, copie della rete) usato da 8.6–8.9 e 8.11–8.13.
  Deciso con l’utente: niente `npm run smoke` (lento e inutile); si verifica con `npm run verify` e screenshot.
- 2026-09-30 — Lezione 09 (validazione, parte 1), 4 figure. Indicazione dell’utente: aggiunte solo se aiutano
  a capire gli appunti (spiegazioni migliori sì, dettagli o curiosità no).
- 2026-09-30 — Lezione 10 (validazione, parte 2), 5 figure con blocchi dei fold comuni (`widgets/l10/Schemes.tsx`,
  dati e CV in `widgets/l10/cv.ts`). `Callout` accetta un titolo JSX (per le formule nei titoli dei riquadri).
- 2026-09-30 — Lezione 11 (validazione, parte 3), 3 figure (`widgets/l11/Choice.tsx`, tabella di scelta comune).
- 2026-09-30 — Lezione 12 (SLT e VC-dimension), 5 figure (`widgets/l12/Vc.tsx`; riusa `separate` della lezione 5).
- 2026-09-30 — Lezione 13 (SVM), 9 figure. Nuovo `widgets/l13/solver.ts`: SVM risolta davvero nel browser (SMO
  con coppia di massima violazione come libsvm; classificazione con kernel lineare/polinomiale/RBF ed ε-SVR).
  Attenzione su Windows: `svm.ts` e `Svm.tsx` nella stessa cartella collidono (file system senza maiuscole).
- 2026-09-30 — Lezione 14 (SVM e kernel, visione critica), 4 figure (`widgets/l14/Kernels.tsx`): SVM vere sul
  problema a due classi della lezione 5 (`l05/htf.ts`) con il risolutore della lezione 13.
- 2026-09-30 — Consumo di batteria del Liquid Glass: le macchie dello sfondo erano animate all'infinito e, sotto
  le superfici con `backdrop-filter`, costringevano il browser a ridisegnare tutte le sfocature ~60 volte al
  secondo anche a pagina ferma. Ora le macchie sono ferme (a riposo nessun frame). Inoltre `Figure` mette in
  pausa le animazioni CSS delle figure fuori dallo schermo (attributo `data-away`): gli anelli e le frecce
  tratteggiate della lezione 3 costavano ~50% di CPU anche nello stile classico.
- 2026-10-01 — Lezione 15 (bias-varianza ed ensemble), 7 figure (`widgets/l15/BiasVar.tsx`, dati e calcoli in `widgets/l15/bv.ts`:
  50 rette ai minimi quadrati, 25 modelli a basi gaussiane con penalità λ, ln λ condiviso tra 15.6 e 15.7).
- 2026-10-01 — Lezione 16 (CNN), 13 figure (`widgets/l16/Conv.tsx`, `widgets/l16/Nets.tsx`; cifre 16×16 generate da
  tratti in `widgets/l16/digits.ts`; `Pipeline` per gli schemi a stadi, con lo spazio riservato alle etichette).
  Attenzione: mai modificare questo file o file con TeX da uno script nella shell (le barre rovesciate e gli apici
  inversi si perdono): usare gli strumenti di modifica dei file.
- 2026-10-01 — Lezione 17 (deep learning), 15 figure (`widgets/l17/Hier.tsx`, `Depth.tsx`, `Repr.tsx`, `Tech.tsx`). Nuovo
  tipo di riquadro `quote` (citazione, `> [!quote]` negli appunti) in `Callout`.
- 2026-10-01 — Lezione 18 (reti randomizzate), 4 figure (`widgets/l18/Random.tsx`): `BlockDiagram` per gli schemi a
  blocchi, `Die` (il dado delle slide), rete a pesi casuali vera con readout ai minimi quadrati regolarizzati.
- 2026-10-01 — Lezione 19 (K-means e SOM), 9 figure (`widgets/l19/Vq.tsx`, `Som.tsx`, motore in `engine.ts`: celle di
  Voronoi, vincitore, SOM 14×14 addestrata davvero con istantanee alle iterazioni della figura). Token `--um-dark` e
  `--um-light` (grigi della U-matrix, uguali in tutti i temi). Di nuovo la trappola di Windows: `vq.ts` e `Vq.tsx`
  collidevano (rinominato `engine.ts`; il server Vite va riavviato dopo la rinomina).
- 2026-10-01 — Lezione 20 (RNN), 11 figure (`widgets/l20/Seq.tsx`, `Rec.tsx`): catene di nodi (`Chain`), unità ricorrente
  calcolata dal vivo, unfolding con pesi condivisi evidenziabili, reservoir vero a due unità, `TreeSvg` (codifica di
  alberi dal basso verso l’alto, riusabile per la lezione 21). `.shots/step20.mjs NN fig-N-k:clic[:selettore]`
  fotografa una figura dopo alcuni clic su un pulsante.
- 2026-10-01 — Lezione 21 (dati strutturati e grafi), 12 figure (`widgets/l21/Graphs.tsx`, `Dgn.tsx`): message passing
  calcolato dal vivo (stato = miscela dell’informazione dei nodi), piani sovrapposti del contesto (`ContextPlanes`, usato
  da 21.7 e 21.8), GraphESN vera a stati scalari, omofilia ed energia di Dirichlet calcolate. Con questa lezione il
  corso è completo (lezioni 15–21 fatte in un’unica sessione, un commit per lezione).
- 2026-10-01 — Nuovi controlli `npm run check:math` e `npm run check:text` (`scripts/check-math.mjs`,
  `scripts/check-text.mjs`): confrontano formule e frasi degli appunti con il sito. Lezioni 15–21: tutte le formule
  inline presenti; le formule in display non trovate alla lettera sono solo quelle spezzate su più righe (15, 19, 21),
  il punto finale dentro `cases` (17) e «errore $< 1/2$» scritto a parole (15); le frasi non trovate sono solo
  didascalie riformulate (riguardate una per una) e l’intestazione delle domande d’esame.
- 2026-10-01 — Metainformazioni e indicizzazione: titolo e descrizione della home riscritti, Open Graph e Twitter
  card, canonical, dati strutturati (LearningResource, BreadcrumbList), `theme-color`, icone PNG e
  `site.webmanifest`; una pagina statica per lezione e per il glossario (`plugins/seo.ts`) con anteprima propria,
  `sitemap.xml`; 22 immagini di anteprima generate da `npm run og`; titolo, descrizione e canonical aggiornati
  nell'app (`src/lib/meta.ts`). Dettagli in `docs/GUIDA-LEZIONI.md` §10.

- 2026-10-01 — **Versione inglese** di tutto il sito. Selettore `IT | EN` nella barra in alto (accanto a stile e
  tema); la lingua viene da `?lang=`, poi dalla scelta salvata, poi dalla lingua del browser (italiano → italiano,
  qualsiasi altra → inglese) e cambiarla ricarica la pagina sulla sezione che si stava leggendo. Un solo sorgente per
  widget e formule (`tx(it, en)` di `src/lib/i18n.ts`), MDX tradotti in `src/content/lessons-en/`, glossario in
  `src/content/glossary-en/lNN.ts`, titoli e riassunti in `src/content/lessons.en.ts`. Gli id delle sezioni sono gli
  stessi nelle due lingue (quelli italiani), quindi link, glossario e indirizzi condivisi valgono per entrambe.
  Numeri con il punto decimale in inglese (`fmt`). Pagine statiche e anteprime in inglese sotto `en/`
  (`plugins/seo.ts`, `public/og/en/`, `hreflang`). Nuovi script: `npm run check:en` (traduzione allineata
  all'originale: struttura, formule, glossario, italiano rimasto) e `npm run figs -- NN --lang en` (tutte le figure
  di una lezione in una passata); `npm run shot` accetta `--lang`. Regole e procedura in `docs/GUIDA-INGLESE.md`.
  Le 21 lezioni sono state tradotte in parallelo (un agente per lezione, lezione 02 come modello).
- 2026-10-01 — **Completamento traduzione inglese**: traduzione di tutti i widget interattivi rifinita e completata
  al 100% (lezioni 03, 04, 05, 06, 08, 17 con etichette, compiti, grafici e descrizioni accessibili in inglese accademico naturale).
  Tutti i controlli `npm run check:en` e `npm run verify` (`tsc -b && eslint . && node scripts/check-content.mjs`) passano
  con successo su tutte le 21 lezioni.
- 2026-10-02 — **Indirizzi veri per ogni pagina** (anteprime dei link e SEO). Prima la barra del browser mostrava sempre `…/#/lezione/NN`: la parte dopo `#` non arriva a chi genera l'anteprima, quindi ogni link condiviso mostrava la home. Ora il router (`src/lib/router.ts`) usa `…/lezione/NN/#sezione`, `…/glossario/#voce`, `…/prerequisiti/#sezione` (e gli stessi sotto `en/`, che decide anche la lingua); le pagine statiche sono copie dell'applicazione, senza più redirect, con un testo essenziale per chi non esegue JavaScript; i vecchi link con l'hash e `?lang=en` continuano a funzionare. Aggiunti pagina e immagine di anteprima dei prerequisiti, `hreflang` nella sitemap, `robots` con `max-image-preview:large`. Le immagini di anteprima non sono più cartoline disegnate ma schermate del sito (`npm run og`, `public/og/*.jpg`): la home e, per ogni lezione, una sua figura.
- 2026-10-02 — **Versione «spiegata semplice»** delle lezioni 01, 03, 04 e 05 (la 02 è esclusa su richiesta), in italiano
  e in inglese: stessi titoli, formule, esempi, figure e domande d’esame, con la teoria riscritta in parole facili
  (`src/content/lessons-easy/`, `lessons-easy-en/`). Si attiva dal riquadro con l’icona del neonato in cima alla
  lezione o dal pulsante nella barra in alto (`src/lib/mode.ts`, scelta salvata nel browser); cambiando versione si
  resta sulla sezione che si stava leggendo. Nuova pagina **Prerequisiti** (`#/prerequisiti`, in sidebar, home e
  ricerca; `src/content/extra/`, `extra-en/`): simboli, funzioni, vettori e matrici, derivate e gradiente, integrali,
  probabilità, logica e conteggi, con le figure P.1–P.5 (nuovi widget `widgets/pre/LineExplorer.tsx` e
  `TangentExplorer.tsx`; le altre riusano i widget della lezione 1). Nuovo controllo `npm run check:easy` (anche in
  `verify`); `shot` e `figs` accettano `--mode easy`, `figs` anche `prerequisiti`. Regole in `docs/GUIDA-SEMPLICE.md`.
  Deciso con l’utente: **niente screenshot di verifica se non richiesti esplicitamente** (troppi token); questa
  funzione è stata verificata con `verify`, `check:easy` e `build`, senza guardare screenshot.

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
- `05-lin_superficie-errore.png` → Fig. 5.7 `ErrorSurface` — paraboloide $E(w_0,w_1)$ sui dati dell’esercizio, $-\nabla E$ sulla superficie, retta e residui corrispondenti.
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

### 08 — Reti neurali (parte 2)

- `08-nn2_mappa.png` → Fig. 8.1 `CourseZoom` — mappa cliccabile del blocco reti neurali, argomenti già visti spuntati, «siamo qui», link alle sezioni.
- `08-nn2_sgd-vs-batch.png` → Fig. 8.2 `SgdBatch` — percorsi batch e stocastico sulle curve di livello di una regressione lineare (40 esempi), $\eta$, epoche, ordine casuale, shuffling.
- `08-nn2_minibatch.png` → Fig. 8.3 `MiniBatch` — epoca divisa in mini-batch con $mb$ a scelta, aggiornamento passo passo e percorso.
- `08-nn2_eta.png` → Fig. 8.4 `EtaCurves` — curve molto alto/molto basso/basso/alto/buono più un $\eta$ a scelta (mini-batch, errore in eccesso in scala log) e vista con una curva irregolare.
- `08-nn2_momentum.png` → Fig. 8.5 `MomentumCanyon` — canyon di una quadratica mal condizionata, gradiente puro contro momentum, $\eta$, $\alpha$, Nesterov, passi necessari.
- `08-nn2_early-stopping.png` → Fig. 8.6 `EarlyStopping` — rete 1-40-1 addestrata dal vivo su 12 punti rumorosi: curve di training e validazione (epoche in scala log), zona buona, uscita della rete all’epoca scelta.
- `08-nn2_weight-decay.png` → Fig. 8.7 `WeightDecayClassifier` — due reti da 10 unità sul problema delle due classi della lezione 5, senza e con weight decay, confini ed errori (con Bayes).
- `08-nn2_regressione-reg.png` → Fig. 8.8 `RegRegression` — la stessa regressione con $\lambda = 0$ e con $\lambda$ a scelta (0,01 all’inizio).
- `08-nn2_pesi-reg.png` → Fig. 8.9 `WeightsViz` — i pesi delle due reti della 8.8 colorati per segno e intensità, anche sulla stessa scala.
- `08-nn2_cascade.png` → Fig. 8.10 `CascadeCorrelation` — Cascade Correlation vero su una regressione 1D (pool di 6 candidate, ascesa su $S$, uscita ai minimi quadrati), schema a cascata con pesi congelati, curva dell’errore.
- `08-nn2_monk2-mse.png` → Fig. 8.11 `Monk2Mse` — MONK2 addestrato dal vivo (2 unità, $\eta = 0{,}1$, $\alpha = 0{,}5$, batch): MSE di training e test; unità, inizializzazione, codifica one-hot on/off.
- `08-nn2_monk2-acc.png` → Fig. 8.12 `Monk2Acc` — accuratezza della stessa rete.
- `08-nn2_monk3.png` → Fig. 8.13 `Monk3` — MONK3 con 4 unità e weight decay a scelta, minimo del test.

### 09 — Validazione (parte 1)

- `09-val1_bias-varianza.png` → Fig. 9.1 `BiasVariance` — errore di training e test di 100 training set (polinomi di grado 0–11 sui dati della lezione 4), medie, training set più fortunato e più sfortunato.
- `04-l4_schema-tr-vl-ts.png` (ripresa dalla lezione 4) → Fig. 9.2 `DataSplit` (lo stesso widget della 4.7).
- `09-val1_grid-random.png` → Fig. 9.4 `GridRandom` — grid search e random search con lo stesso budget, curve di livello della prestazione, tacche dei valori provati, variante in cui conta un solo iperparametro.
- Figura aggiunta: 9.3 `RandomTarget` — il controesempio del target casuale con dati veri (1000 variabili casuali, selezione su tutti i dati contro test separato prima).

### 10 — Validazione (parte 2)

- `10-val2_kfold-selezione.png` → Fig. 10.1 `CvSelection` — l’algoritmo di model selection con K-fold CV eseguito passo passo (24 punti, θ = grado M), tabella degli errori sui fold e medie, scelta di θ*, riaddestramento su tutti i dati.
- `10-val2_kfold-holdout.png` → Fig. 10.2 `CvHoldout` — K-fold esterna per il test con hold-out TR/VL interno: M scelto e errore di test di ogni riga, rimescolamento di TR e VL, stima media ± dev. std.
- `10-val2_double-cv.png` → Fig. 10.3 `DoubleCv` — quattro split esterni, CV interna ($K'$ = 3 o 4) dello split scelto con gli errori medi per M, scelta e test.
- `10-val2_double-cv-2.png` → Fig. 10.4 `NestedResampling` — resampling esterno e interno a blocchi, ruolo di ogni blocco al clic, «test» interno = validation set.
- `10-val2_nested-cv.png` → Fig. 10.5 `NestedFlow` — diagramma della nested CV con $k_{out}$, $k_{inn}$ e selezione interna per hold-out o K-fold.

### 11 — Validazione (parte 3)

- `11-val3_es-modelli.png` → Fig. 11.1 `ModelsTable` — tabella $f_1 \dots f_6$ con barre dell’errore di training e di 10-fold CV, scelta di $f_3$; criterio di scelta commutabile (CV o training).
- `11-val3_es-unita.png` → Fig. 11.2 `UnitsTable` — la stessa tabella per 0–5 unità nascoste, scelta di 2 unità.
- `11-val3_es-knn.png` → Fig. 11.3 `KnnLoo` — K-NN per la regressione su 40 punti con errore di training e di leave-one-out calcolati, K = 1…6 o valori esponenziali, curva completa fino a K = 20.

### 12 — Statistical Learning Theory e VC-dimension

- `12-slt_dicotomie.png` → Fig. 12.1 `Dichotomies` — le $2^N$ dicotomie di $N = 1 \dots 4$ punti, pieni ($+1$) e vuoti ($-1$).
- `12-slt_shattering.png` → Fig. 12.2 `ShatterLines` — tre punti trascinabili, le 8 dicotomie con la retta separatrice e la freccia di $\mathbf{w}$, conteggio delle dicotomie rappresentate, allineamento.
- `12-slt_quattro-punti.png` → Fig. 12.3 `FourPoints` — quattro punti trascinabili: etichettature separabili su 16, caso quadrilatero convesso (diagonali che si incrociano) o punto interno, etichettature impossibili.
- `12-slt_srm.png` → Fig. 12.4 `SrmStructure` — errore empirico, VC-confidence e bound su sei spazi annidati cliccabili, numero di dati a scelta.
- `12-slt_srm-tabella.png` → Fig. 12.5 `SrmTable` — tabella $H_1 \dots H_6$ con errore di training, VC-confidence e bound (somma), scelta di $H_3$; cambia con il numero di dati.

### 13 — Support Vector Machines

- `13-svm_separabili.png` → Fig. 13.1 `Separable` — dati separabili e dati nel cerchio, una retta trascinabile per pannello, errori.
- `13-svm_margine.png` + `13-svm_margini-diversi.png` → Fig. 13.2 `MarginExplorer` — iperpiano trascinabile con la sua zona di margine, margine a confronto con il massimo, iperpiano ottimo calcolato.
- `13-svm_support-vectors.png` → Fig. 13.3 `SupportVectors` — rette $g = 0, \pm 1$, support vector cerchiati, moltiplicatori; clic su un punto per toglierlo e riaddestrare.
- `13-svm_distanza.png` → Fig. 13.4 `Distance` — punto trascinabile, proiezione $\mathbf{x}_p$, $\mathbf{w}_o$, $r = g(\mathbf{x})/\|\mathbf{w}_o\|$.
- `13-svm_soft-margin.png` + `13-svm_slack.png` → Fig. 13.5 `SoftMargin` — SVM soft margin con $C$ a scelta, due punti trascinabili, variabili slack disegnate, support vector.
- `13-svm_mapping.png` + `13-svm_esempio-phi.png` → Fig. 13.6 `FeatureMap` — ellisse nello spazio di input e piano nello spazio $(x_1^2, \sqrt2 x_1x_2, x_2^2)$ ruotabile in 3D, semiassi a scelta.
- `13-svm_architettura.png` → Fig. 13.7 `Architecture` — SVM con kernel RBF su 10 punti: regioni, pattern trascinabile, unità nascoste = support vector con i valori del kernel, pesi $lpha_i d_i$, uscita.
- `13-svm_eps-loss.png` → Fig. 13.8 `EpsLoss` — loss ε-insensitive con ε a scelta e residuo trascinabile.
- `13-svm_eps-tube.png` → Fig. 13.9 `EpsTube` — ε-SVR con kernel RBF su 26 punti, tubo, slack, support vector; ε e $C$ a scelta.

### 14 — SVM e kernel: aspetti pratici

- `14-svmo_poly.png` → Fig. 14.1 `PolySvm` — SVM con kernel polinomiale sul problema delle due classi: confine, margini, support vector, confine di Bayes, errori e % di support vector; grado e $C$ a scelta.
- `14-svmo_rbf.png` → Fig. 14.2 `RbfSvm` — lo stesso con kernel RBF; $\gamma$ e $C$ a scelta.
- `14-svmo_iperparametri.png` → Fig. 14.3 `CGamma` — errore di test in funzione di $C$ per $\gamma = 5; 1; 0{,}5; 0{,}1$, calcolato addestrando 76 SVM; $C$ a scelta con il miglior $\gamma$.
- `14-svmo_oggetti.png` → Fig. 14.4 `KernelObjects` — oggetti di sei forme e la loro immagine φ nello spazio delle feature per tre similarità (forma, grandezza, tutti uguali).

### 15 — Bias-varianza ed ensemble

- `15-bv_20punti.png` → Fig. 15.1 `TwentyPoints` — 20 punti da $y = x + 2\sin(1{,}5x)$ più rumore, funzione vera, retta ai minimi quadrati; nuovo dataset a richiesta.
- `15-bv_50fit.png` → Fig. 15.2 `FiftyFits` — le 50 rette (una per dataset) sulla funzione vera; numero di dataset a scelta.
- `15-bv_vista-grafica.png` → Fig. 15.3 `SpaceView` — insieme delle funzioni, regione delle soluzioni, media, soluzione ottima e dati; bias, varianza e rumore evidenziabili; ampiezza dell’insieme regolabile, training set aggiuntivi.
- `15-bv_varianza.png` → Fig. 15.4 `VarianceFits` — le 50 rette e la media $\bar h$ in rosso; punto $x$ trascinabile con varianza, bias², rumore² e somma; funzione vera a richiesta.
- `15-bv_freccette.png` → Fig. 15.5 `Darts` — i quattro bersagli (bias basso/alto × varianza bassa/alta) cliccabili, freccette rilanciabili (la fotografia del gioco non è riprodotta).
- `15-bv_lambda.png` → Fig. 15.6 `LambdaFits` — 25 ipotesi e la loro media contro la sinusoide per $\ln\lambda = 2{,}6;\ -0{,}31;\ -2{,}4$ o a scelta.
- `15-bv_tradeoff.png` → Fig. 15.7 `Tradeoff` — bias², varianza, somma ed errore di test in funzione di $\ln\lambda$, con i minimi.

### 16 — Reti neurali convoluzionali (CNN)

- `16-cnn_zip.png` → Fig. 16.1 `ZipDigits` — 5 righe di cifre 0–9 in 16×16 (generate), cifra scelta ingrandita e traslabile di qualche pixel, con il conteggio dei pixel che cambiano.
- `16-cnn_conv1d.png` → Fig. 16.2 `Conv1D` — sequenza $x_1 \dots x_5$, unità con tre pesi condivisi che scorre ($t = 2, 3, 4$), uscite calcolate, pesi regolabili.
- `16-cnn_conv2d.png` → Fig. 16.3 `Conv2D` — input 5×5 con padding, kernel 3×3, feature map 5×5; kernel che scorre, calcolo della cella scelta.
- `16-cnn_conv2d-esempio.png` → Fig. 16.4 `ConvExample` — input 3×4 ($a \dots l$), kernel 2×2 ($w, x, y, z$), output 2×3 simbolico con la porzione di input evidenziata.
- `16-cnn_stride.png` → Fig. 16.5 `Conv2D stride={2}` — lo stesso con stride 2 (feature map 3×3) e confronto con stride 1.
- `16-cnn_maxpool.png` → Fig. 16.6 `MaxPool` — la mappa 4×4 della figura (uscita 6, 8, 3, 4), massimo o media, valori modificabili.
- `16-cnn_cnn-intera.png` → Fig. 16.7 `CnnPipeline` — stadi cliccabili: input, convoluzioni, sotto-campionamento (due volte), completamente connesso, output.
- `16-cnn_esempio2.png` → Fig. 16.8 `ReceptiveCone` — sezione di una CNN (convoluzione, pooling, convoluzione, pooling, due strati densi, predizioni cane/gatto/barca/uccello): cono del campo recettivo dell’unità cliccata.
- `16-cnn_esempio3.png` → Fig. 16.9 `Dimensions` — volumi 36×36×3 → 26×26×9 → 12×12×9 → 6×6×3 → 2×2×3 → 5 unità → 2 uscite, con le finestre 11×11, 3×3, 7×7, 3×3.
- `16-cnn_alexnet.png` → Fig. 16.10 `AlexLike` — blocchi convoluzione + ReLU, pooling, flatten, completamente connesso, softmax; graffe «feature learning» e «classificazione».
- `16-cnn_lecun.png` → Fig. 16.11 `LeCunNets` — schema delle cinque reti (strati e dimensioni) e barre di connessioni e pesi.
- `16-cnn_lecun-curve.png` → Fig. 16.12 `LeCunCurves` — % di corretti sul test per epoca delle cinque reti (valori letti dalla figura), epoca trascinabile.
- `16-cnn_imagenet.png` → Fig. 16.13 `Top5` — otto schede con la classe corretta e le cinque predizioni (barre lette dalla figura). Le fotografie non sono ricostruibili: resta lo schema.

### 17 — Deep learning

- `17-deep_gerarchia.png` → Fig. 17.1 `Hierarchy` — rete pixel → bordi → angoli e contorni → parti di oggetti → identità (auto, persona, animale); unità cliccabili con le unità dello strato precedente che combinano. Le immagini apprese e la fotografia non sono ricostruibili: disegni schematici.
- `17-deep_dnn.png` → Fig. 17.2 `FaceFeatures` — dati grezzi, feature di basso, medio e alto livello (riquadri schematici) e la rete con gli strati corrispondenti; i numeri dell’applicazione riportati dalla slide.
- `17-deep_occhiali.png` → Fig. 17.3 `VectorArithmetic` — «uomo con occhiali − uomo + donna ≈ donna con occhiali» con volti schematici e vettori nel piano; anche gli esempi re/regina e capitali del testo.
- `17-deep_parita-2strati.png` → Fig. 17.4 `ParityTwoLayer` — parità di $N$ bit con AND + OR: una porta AND per configurazione positiva, formula per $N \le 4$, conteggio $2^{N-1}+1$.
- `17-deep_parita-albero.png` → Fig. 17.5 `ParityTree` — albero di XOR con bit cliccabili, XOR = 3 porte, confronto $3(N-1)$ contro $2^{N-1}+1$.
- `17-deep_svhn.png` → Fig. 17.6 `Svhn` — accuratezza di test contro numero di parametri per le tre famiglie di reti (punti letti dalla figura), linea verticale trascinabile.
- `17-deep_autoencoder.png` → Fig. 17.7 `Autoencoder` — input, codice, ricostruzione, encoder $W_1$ e decoder $W_1'$; numero di unità nascoste a scelta (undercomplete/overcomplete).
- `17-deep_distribuita.png` → Fig. 17.8 `LocalDistributed` — cane, gatto, tigre in one-hot e in rappresentazione distribuita, distanza tra coppie.
- `17-deep_disentangling.png` → Fig. 17.9 `Disentangle` — le due tabelle (localista 4 colonne, distribuita 2), colonna del «rosso» evidenziata, oggetto mai visto a scelta con la risposta «mi piace?».
- `17-deep_word-embedding.png` → Fig. 17.10 `WordEmbedding` — i due zoom (paesi e lingue, anni) con le parole nelle posizioni della figura; clic su una parola per le tre più vicine.
- `17-deep_double-descent.png` → Fig. 17.11 `DoubleDescent` — errore di training e di test contro la larghezza (valori letti dalla figura), regime critico, soglia di interpolazione, larghezza trascinabile.
- `17-deep_double-descent-poly.png` → Fig. 17.12 `PolyDescent` — MSE mediano di training e test contro il grado, in scala logaritmica (valori letti dalla figura).
- `17-deep_clipping.png` → Fig. 17.13 `Clipping` — discesa del gradiente davanti a una scogliera, senza e con clipping, soglia $v$ a scelta.
- `17-deep_dropout.png` → Fig. 17.14 `Dropout` — rete base con unità rimovibili, le 16 sotto-reti (7 senza percorso input-uscita), campionamento della maschera.
- `17-deep_l1-l2.png` → Fig. 17.15 `L1L2` — rombo $L^1$ e cerchio $L^2$ con la retta dei vincoli a inclinazione variabile e la soluzione a norma minima.

### 18 — Reti neurali randomizzate

- `18-rand_random-forest.png` → Fig. 18.1 `RandomForest` — tre alberi randomizzati (variabile casuale in ogni nodo), percorso dell’input evidenziato, voti combinati; nuovo input e nuova foresta a richiesta.
- `18-rand_perceptron.png` → Fig. 18.2 `RosenblattAreas` — retina → area di proiezione (connessioni casuali, rimescolabili) → area di associazione → risposte; blocchi cliccabili.
- `18-rand_struttura.png` → Fig. 18.3 `Structure` — input → strato nascosto non addestrato (dadi) → rappresentazione φ → readout addestrato → output; i due testi della slide nei blocchi cliccabili.
- `18-rand_rete.png` → Fig. 18.4 `RandomNet` — schema della rete ($\mathbf{W}$ casuale, $\mathbf{W}^{out}$ addestrata) e una rete a pesi casuali vera su una regressione: unità, $\lambda$ e pesi casuali a scelta.

### 19 — K-means e SOM

- `03-l23_clustering.png` (ripresa dalla lezione 3) → Fig. 19.1 `Clustering` (lo stesso widget della 3.4).
- `19-som_voronoi.png` → Fig. 19.2 `VoronoiCells` — celle di Voronoi grigie e bianche calcolate, vettore $\mathbf{x}$ trascinabile con il vincitore e la distorsione, numero di centri a scelta.
- `19-som_quantizzazione-1d.png` → Fig. 19.3 `Quant1D` — retta divisa in celle con un centroide ciascuna, valore trascinabile, errore di quantizzazione, numero di simboli a scelta.
- `19-som_kmeans.png` → Fig. 19.4 `KMeans` — le quattro fasi (inizializzazione, assegnazione, aggiornamento con frecce, nuova assegnazione) passo per passo fino a convergenza; inizializzazione casuale.
- `19-som_mappa.png` → Fig. 19.5 `SomMapping` — punti nello spazio 3D e griglia 3×3: punto → unità vincitrice, unità → punti che rappresenta.
- `19-som_homunculus.png` → Fig. 19.6 `Homunculus` — arco di corteccia con le parti del corpo in ordine e aree più ampie per le parti più sensibili. Il disegno anatomico non è ricostruibile: resta lo schema.
- `19-som_training-uniforme.png` → Fig. 19.7 `SomTraining` — SOM addestrata su input uniformi nel quadrato, alle iterazioni 0, 20, 100, 1000, 5000, 100.000; anche con vicinato di raggio zero.
- `19-som_umatrix.png` → Fig. 19.8 `WelfareMap mode="umatrix"` — mappa esagonale 13×9 con i 77 codici dei paesi nelle posizioni della figura e i grigi della U-matrix.
- `19-som_mappa-colori.png` → Fig. 19.9 `WelfareMap mode="colors"` — la stessa mappa a colori.

### 20 — Reti neurali ricorrenti (RNN)

- `20-rnn_trasduzioni.png` → Fig. 20.1 `Transductions` — sequenza $l_1 \dots l_n$ di vettori (lunghezza a scelta, vettore dell’elemento cliccato), uscita alla fine oppure a ogni passo, freccia del tempo.
- `20-rnn_tipi-trasduzione.png` → Fig. 20.2 `TransductionTypes` — i quattro tipi (classificazione, IO isomorfa, passo successivo con i legami autoregressivi, generazione) e la forma generale a nodi pieni e vuoti.
- `20-rnn_idnn.png` → Fig. 20.3 `Idnn` — finestra scorrevole sulla sequenza, MLP, uscite $o_3, o_4, o_5$; finestra animabile e di dimensione variabile.
- `20-rnn_unita-ricorrente.png` → Fig. 20.4 `RecurrentUnit` — unità con self-loop e ritardo $q^{-1}$, pesi $w$ e $\hat w$ regolabili, stato calcolato su una sequenza di 0 e 1 modificabile (l’esercizio «contare gli 1»).
- `20-rnn_sistema-stati.png` → Fig. 20.5 `StateSystem` — riquadri annidati delle sotto-sequenze codificate da $x(1) \dots x(5)$ e modello grafico $l \to x \to y$ con l’auto-anello.
- `20-rnn_elman.png` → Fig. 20.6 `Elman` — tre unità nascoste ricorrenti, input, ritardi, strato di uscita; unità cliccabile con i suoi pesi di input e ricorrenti e la sua equazione.
- `20-rnn_unfolding.png` → Fig. 20.7 `Unfolding` — RNN a due unità e rete srotolata su 1–6 passi, pesi colorati come nella figura ed evidenziabili in tutte le repliche.
- `20-rnn_esn.png` → Fig. 20.8 `Esn` — strato di input, reservoir sparso e casuale (rigenerabile), readout; parti cliccabili (addestrato / non addestrato).
- `20-rnn_markov.png` → Fig. 20.9 `MarkovStates` — le quattro stringhe della figura proiettate nello spazio degli stati da un reservoir vero a due unità; stringhe, contrattività e pesi casuali modificabili.
- `20-rnn_alberi.png` → Fig. 20.10 `TreeEncoding` — albero a, b, c, d, e, f codificato dalle foglie alla radice con i riquadri annidati; modello grafico con i ritardi $q_1 \dots q_k$; struttura alternativa.
- `20-rnn_recnn.png` → Fig. 20.11 `RecNN` — i due frammenti chimici codificati passo per passo fino all’uscita alla radice.

### 21 — Dati strutturati e grafi

- `21-sdl_esempi-grafi.png` → Fig. 21.1 `GraphExamples` — dieci schede (un grafo schematico per dominio) con che cosa sono nodi e archi. Le immagini dei domini non sono ricostruibili: resta lo schema.
- `21-sdl_scenario.png` → Fig. 21.2 `Scenario` — le tre righe (dominio di input, stratificazione, efficienza) con una casella selezionabile per riga, le caselle del «focus» bordate e la freccia.
- `21-sdl_grafo-etichettato.png` → Fig. 21.3 `LabeledGraph` — grafo d, b, c, a, a con archi orientati e ciclo; nodo o arco cliccabile con la sua etichetta; matrice di adiacenza $A$.
- `21-sdl_trasduzioni.png` → Fig. 21.4 `GraphTransduction` — grafo di input → $T_{enc}$ → embedding dei nodi → $T_{out}$ per nodo, oppure readout $R$ → $\mathbf{h}_g$ → $T_{out}$ per il grafo.
- `21-sdl_message-passing.png` → Fig. 21.5 `MessagePassing` — le tre fasi (messaggi, aggregazione, aggiornamento) su un grafo di 7 nodi, stato a barra colorata, iterazioni ripetibili, global pooling.
- `21-sdl_cnn-vs-grafi.png` → Fig. 21.6 `CnnVsGraph` — griglia con finestra 3×3 (8 vicini numerati) e grafo (vicini in numero variabile), nodo cliccabile in entrambi.
- `21-sdl_contesto.png` → Fig. 21.7 `ContextPlanes variant="context"` — tre piani con lo stesso grafo, contesto di raggio 0, 1, 2 del nodo scelto e stati dei vicini usati dallo strato sopra.
- `21-sdl_nn4g.png` → Fig. 21.8 `ContextPlanes variant="layers"` — tre strati, stato $h_v^{(l)}$ da calcolare e stati da cui dipende, per NN4G (tutti gli strati precedenti) o GCN (lo strato sotto).
- `21-sdl_gesn.png` → Fig. 21.9 `GraphEsn` — grafo di input, stati iterati fino al punto fisso (grafico della variazione), global pooling per il readout; peso ricorrente e stato iniziale a scelta.
- `21-sdl_problemi-aperti.png` → Fig. 21.10 `OpenIssues` — le tre schede (efficienza, under-reaching, espressività) e il campo recettivo di un nodo al variare degli strati.
- `21-sdl_eterofilia.png` → Fig. 21.11 `Homophily` — lo stesso grafo con classi ad alta o bassa omofilia, classi dei nodi modificabili, omofilia ed energia calcolate.
- `21-sdl_convolution-kernel.png` → Fig. 21.12 `ConvKernel` — bicicletta e auto schematiche, le loro sotto-strutture e il kernel $K^S$ tra le parti. Le immagini originali non sono ricostruibili: disegni schematici.

## Aggiunte rispetto agli appunti

Tutto ciò che non è scritto negli appunti va elencato qui (l'utente deve poterlo rivedere).

- **Pagina dei prerequisiti** (richiesta dall’utente): è tutta materiale aggiunto, fuori dagli appunti. Spiega solo
  le basi date per scontate (lettura dei simboli, sommatoria, insiemi, funzioni, retta, polinomi, esponenziale e
  logaritmo, vettori, prodotto scalare, norma e distanza, matrici, derivata e regole, massimi e minimi, derivate
  parziali e gradiente, regola della catena, integrale come area e come media, media/varianza/covarianza,
  probabilità, valore atteso, normale con la regola 68%–95%, probabilità condizionata e congiunta, AND/OR/NOT/XOR,
  conteggio delle combinazioni), con esempi numerici inventati.
- **Versioni «spiegate semplici»** (01, 03, 04, 05): spiegazioni dei termini tra parentesi, «In parole semplici» dopo
  le formule, conti svolti passo per passo, paragoni (bambino che impara a riconoscere i gatti, studente che impara a
  memoria, bilancia imprecisa, manopole del modello, discesa in montagna con la nebbia, scala a gradini per la loss
  0/1, cento persone che lanciano una moneta). Esempi numerici aggiunti: norme di $(3,-4)$ (01); tabella dei tre
  pazienti e MSE di tre errori (03); matrice di confusione con 100 persone (04); 200 esempi e 30 errori, voto 3 su 5
  nel K-NN, $l/k$ con 200 e 10, distanza di Hamming tra «casa» e «cosa», altezza e stipendio per la scala delle
  variabili, 6 classificatori AVA con 4 classi (05).

- 01: esempi svolti (prodotto scalare, gradiente); «tre parole chiave» della definizione; ragionamento
  del gradiente via Δf ≈ ∇f·Δx; tracce di risposta alle domande d'esame.
- 03: come leggere gli indici $x_{p,i}$; esempio di self-supervised; derivazione del version space
  $\neg x_2 \wedge x_4$; intuizione della dimostrazione sull'unbiased learner; tracce di risposta.
- 21: letture e spiegazioni delle formule (formula generale del message passing, NN4G, GraphESN, sensibilità,
  energia di Dirichlet); tracce di risposta. Nelle figure: nella 21.1 «nodi» e «archi» di ogni esempio sono letti
  dall’immagine; nella 21.2 il testo delle singole caselle riformula le scritte della slide; nella 21.3 le etichette
  vettoriali dei nodi diversi da d e i valori della matrice $A$ (ricavati dal disegno); nella 21.4 embedding e uscite
  inventati; nella 21.5 il grafo, la media come aggregazione e l’aggiornamento «metà stato proprio, metà media dei
  vicini»; nella 21.6 la numerazione dei vicini sulla griglia; nella 21.7 il primo strato ha contesto di raggio 0,
  come nella formula di NN4G (il testo alternativo dell’immagine dice «il nodo e i vicini»); nella 21.9 stati
  scalari, etichette dei nodi inventate, la condizione $\hat w\,\|A\| < 1$ come contrattività e il global pooling
  come somma; nella 21.10 l’albero binario che illustra insieme under-reaching e collo di bottiglia; nella 21.11 il
  grafo, il conteggio dei «nodi in accordo con i vicini» e l’energia di Dirichlet calcolata sulle etichette one-hot;
  nella 21.12 i nomi delle parti, i valori di similarità e la somma su tutte le coppie come modo di combinare i kernel.
- 20: letture e spiegazioni delle formule (unità ricorrente, sistema a transizione di stato, Simple RNN in forma
  vettoriale); tracce di risposta. Nelle figure: i vettori degli elementi della 20.1 dopo il primo sono inventati; nella
  20.4 i pesi partono da $0{,}5$ perché l’esercizio sia da risolvere, e si può provare la sigmoide; nella 20.7 la
  lunghezza della sequenza è variabile; nella 20.8 le connessioni del reservoir sono estratte a caso; nella 20.9 il
  reservoir ha due unità $\tanh$ con matrice ricorrente $\rho$ per una rotazione casuale (raggio spettrale $\rho$) e
  pesi di input casuali; nella 20.10 la seconda struttura («c spostato sotto d») illustra la frase «se la struttura
  cambia, la codifica cambia».
- 19: letture e spiegazioni delle formule (cella di Voronoi, errore di quantizzazione, K-means on-line, fase
  cooperativa, vicinato gaussiano); tracce di risposta. Nelle figure: centri, dati e prototipi iniziali di 19.2–19.4
  sono costruiti; nella 19.5 punti e pesi delle unità sono scelti per l’esempio; nella 19.6 le ampiezze delle zone
  sono indicative e l’elenco delle parti segue la figura (più completo del testo); nella 19.7 la SOM è 14×14 con
  $\eta(t)$ e $\sigma(t)$ decrescenti scelti per la figura, e l’opzione «raggio zero» illustra la nota sul K-means
  on-line; in 19.8 e 19.9 le posizioni dei 77 paesi sono lette dalla figura, mentre grigi e colori sono ricostruiti
  a occhio, e i paesi scritti in minuscolo nella seconda figura (non usati per l’addestramento) non sono riportati;
  cliccando un’unità si elencano i paesi delle unità adiacenti.
- 18: letture e spiegazioni delle formule (readout, uso della rete); tracce di risposta. Nelle figure: nella 18.1
  alberi, variabili e classi delle foglie sono estratti a caso e l’uscita è il voto di maggioranza; nella 18.4 la
  regressione è costruita (30 punti da $\sin(2\pi x)$ con rumore 0,2), le unità sono $\tanh(wx + b)$ con $w$ e $b$
  gaussiani, il readout è calcolato con i minimi quadrati regolarizzati (intercetta esclusa dalla penalità).
- 17: letture e spiegazioni delle formule (prodotto dei gradienti, clipping, ReLU); tracce di risposta. Nelle figure:
  disegni schematici al posto delle immagini apprese e delle fotografie (17.1–17.3); posizioni illustrative dei
  vettori nella 17.3; valori della rappresentazione distribuita nella 17.8 scelti perché gatto e tigre siano i più
  vicini; nella 17.9 la risposta «mi piace?» (mi piacciono gli oggetti rossi, come nell’esempio del testo) per ogni
  oggetto escluso; nella 17.10 alcune parole sono leggermente spostate per non sovrapporsi; nella 17.13 la funzione
  di costo è in una dimensione, costruita con una parete ripida (i valori di passo e soglia sono della figura);
  nella 17.14 il conteggio «7 sotto-reti su 16 non funzionano»; nella 17.15 la soluzione è quella a norma minima
  sulla retta dei vincoli. Nella 17.2 i numeri dell’applicazione vengono dalla slide (non sono nel testo degli appunti).
- 16: letture e spiegazioni delle formule (convoluzione, unità che scorre); tracce di risposta. Nelle figure: cifre
  generate (non quelle del dataset) e conteggio dei pixel che cambiano traslandole; valori di input, kernel e pesi di
  16.2, 16.3 e 16.5 scelti come esempio; nella 16.8 kernel largo 3 e pooling di 2 su una sezione di 32 pixel (scelti
  per la figura); nella 16.9 i conti «36 − 11 + 1 = 26» e «12 − 7 + 1 = 6» ricavati dalle dimensioni della figura;
  nella 16.12 le curve sono lette a occhio dalla figura (Net-4 arriva a circa il 94%: il testo alternativo
  dell’immagine negli appunti dice 98%); nella 16.13 le lunghezze delle barre sono approssimate.
- 15: letture e spiegazioni delle formule (errore atteso, decomposizione, loss regolarizzata, comitato); tracce di
  risposta. Nelle figure: i dati di 15.1, 15.2 e 15.4 sono generati ($x$ uniforme in $[0, 10]$, rumore gaussiano di
  varianza 0,2), con bias² e varianza stimati sui 50 fit; nella 15.3 il legame «insieme più ampio → regione più ampia e
  più vicina all’ottimo» è reso con un cursore; 15.6 e 15.7 sono calcolate davvero (25 dataset di 25 punti da
  $\sin(2\pi x)$ con rumore 0,3, intercetta più 24 gaussiane di larghezza 0,1, penalità $\lambda\|\mathbf{w}\|^2$ senza
  intercetta, test su 400 punti), quindi i valori e la posizione del minimo differiscono dalla figura di Bishop.
- 14: lettura e spiegazione della distanza indotta dal kernel; tracce di risposta. Nelle figure: 14.1–14.3 usano i
  dati generati della lezione 5, quindi errori e percentuali di support vector sono diversi dalle slide (riportate
  nelle didascalie); il kernel polinomiale lavora sulle coordinate dimezzate; nella 14.4 le similarità «grandezza»
  e «tutti uguali» illustrano l’esercizio sui kernel cattivi.
- 13: letture e spiegazioni delle formule (margine, primale e duale hard margin, primale soft margin, decisione
  con kernel, loss ε-insensitive). Nelle figure: dati costruiti; tutte le SVM sono risolte davvero (SMO), con
  «hard margin» realizzato come $C = 10^5$; nella 13.2 il margine di una retta qualsiasi è il doppio della distanza
  dal punto più vicino; kernel RBF con $\sigma$ scelto per la figura (13.7) e $\sigma = 0{,}12$ (13.9).
- 12: letture e spiegazioni delle formule (VC-bound, VC-confidence, struttura annidata); tracce di risposta.
  Nelle figure: nella 12.2 anche le dicotomie con tutte le etichette uguali hanno una retta (messa a lato dei
  punti); in 12.4 e 12.5 la VC-confidence è quella di Vapnik ($\delta = 0{,}05$) con VC-dim 4, 8, …, 128,
  l’errore empirico è un andamento illustrativo scelto perché con $l = 200$ vinca $H_3$ come nella slide.
- 11: approfondimento sul perché la soglia sull’errore di training è migliore della media delle epoche; tracce
  di risposta. Nelle figure: 11.1 e 11.2 riproducono le lunghezze delle barre delle slide (nessun valore numerico
  negli appunti); nella 11.3 i dati sono costruiti (seno con rumore, K-NN per la regressione) e l’errore è
  calcolato davvero: il minimo tra K = 1 e 6 è a K = 4 come nella slide, e i valori esponenziali trovano K = 8,
  migliore (esempio dell’ottimo solo locale citato negli appunti); nella slide l’intestazione diceva «10-fold»,
  qui si usa la leave-one-out come nel testo.
- 10: letture e spiegazioni delle formule (rischio, rischio empirico, stima della K-fold); tracce di risposta.
  Nelle figure: dati costruiti (24 punti da $\sin(2\pi x)$ con rumore, θ = grado del polinomio); nella 10.2 il
  modello di ogni riga è riaddestrato su TR ∪ VL prima del test; nella 10.5 il conteggio degli addestramenti
  (griglia di 9 configurazioni), per rendere concreto il «costo computazionale elevato».
- 09: la figura 9.3 (il controesempio dal vivo, con la stima su 1000 pattern nuovi); il conteggio degli
  addestramenti dell’esempio completo (griglia 3 × 3 e K = 5); la spiegazione di $R$ (confronto con chi
  risponde sempre la media); tracce di risposta. Nella 9.1 la complessità è il grado del polinomio invece
  dei gradi di libertà di Hastie et al.
- 08: perché con i pesi tutti a zero la rete non impara; di quanto accelera il momentum (fattore
  $1/(1-\alpha)$ sui plateau, $1/(1+\alpha)$ sulle oscillazioni); letture e spiegazioni delle formule;
  tracce di risposta. Nelle figure: **i dati MONK sono generati dalle regole ufficiali del benchmark** (non
  presenti negli appunti: MONK-2 «esattamente due attributi valgono 1»; MONK-3 «(a5 = 3 e a4 = 1) oppure (a5 ≠ 4
  e a2 ≠ 3)», con il 5% di etichette di training sbagliate; training estratto a caso, test = le 432 combinazioni);
  tutte le reti sono addestrate con la regola «a iperparametri indipendenti» della lezione e il weight decay
  come $w \leftarrow w - \lambda w$ a ogni epoca, quindi i valori di $\lambda$ non coincidono con quelli delle
  slide (dichiarato nelle didascalie); le reti di 8.6–8.9 hanno un solo strato nascosto (40 unità) invece dei
  5 strati della figura originale 8.9; i dati di 8.2–8.4 sono una regressione lineare costruita; la 8.5 una
  quadratica; i numeri delle curve differiscono da quelli delle slide.
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
