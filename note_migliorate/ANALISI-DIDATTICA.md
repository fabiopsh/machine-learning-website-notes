# Analisi didattica delle note migliorate

**Oggetto**: `Machine_Learning_Note_Migliorate.pdf` (157 pagine) e i suoi sorgenti `capitoli/00-guida.tex` …
`capitoli/19-grafi.tex`, nella versione del commit `00e81f4` (17 ottobre 2026).
**Cosa contiene**: per ogni capitolo un indice di leggibilità (misurato), un indice di comprensibilità (giudizio),
gli errori trovati e le proposte di miglioramento. È solo un'analisi: nessun file delle note è stato modificato.

---

## 0. Come leggere questo resoconto

### 0.1 Indice di leggibilità (misurato): l'indice Gulpease

Il **Gulpease** è la misura di leggibilità costruita per l'italiano:

    Gulpease = 89 + (300 × numero di frasi − 10 × numero di lettere) / numero di parole

Va da 0 (illeggibile) a 100 (facilissimo) e cresce quando frasi e parole sono corte. Le soglie usate di solito:
un testo sotto 80 è difficile per chi ha la licenza elementare, sotto 60 per chi ha la licenza media, sotto 40 per
chi ha un diploma superiore. Per uno studente universitario quindi **sopra 60 il testo scorre**, **tra 50 e 60 è
leggibile ma impegnativo**, sotto 50 affatica.

Come l'ho calcolato: ho estratto il testo dai `.tex` con uno script, escludendo figure e tabelle. Ogni formula nel
testo conta come una parola corta, ogni formula su riga propria come una frase, ogni voce di elenco e ogni titolo
come una frase. Limite: il lessico tecnico (parole lunghe come "generalizzazione") abbassa l'indice anche quando il
testo è chiaro. Per questo conta più il **confronto tra capitoli** del valore assoluto.

Accanto al Gulpease riporto tre misure semplici:
- **parole per frase** (media);
- **frasi lunghe**: percentuale di frasi con più di 30 parole, quelle che di solito si rileggono due volte;
- **grassetti ogni 100 parole** (termini definiti compresi): oltre 4 il grassetto smette di guidare l'occhio, perché
  tutto sembra importante.

### 0.2 Indice di comprensibilità (giudizio)

È un mio voto da 1 a 10 dopo aver letto il capitolo; **non è una misura**. Tiene conto di sei criteri:
1. ogni termine è definito prima di essere usato;
2. ci sono esempi svolti con numeri;
3. le dimostrazioni non saltano passaggi;
4. figure e testo dicono la stessa cosa;
5. la notazione è coerente;
6. il carico è sostenibile: pochi concetti nuovi per pagina, nessun elenco di nomi lasciati senza spiegazione.

Lettura del voto: **9–10** si studia da soli senza intoppi; **7–8** si capisce con qualche rilettura; **5–6** per
alcune parti servono altre fonti o il docente; sotto 5 il capitolo non insegna.

### 0.3 Etichette delle proposte

- **[E] errore**: affermazione sbagliata o contraddittoria. Va corretta.
- **[I] imprecisione**: corretta nella sostanza ma ambigua o incompleta; uno studente può fraintendere.
- **[D] didattica**: ordine, frase troppo lunga, termine non definito, collegamento mancante.
- **[F] figura**.
- **[A] aggiunta**: qualcosa che negli appunti non c'è (un esempio svolto, una spiegazione, una tabella). Non porta
  argomenti nuovi, ma se la accetti va dichiarata come aggiunta.
- L'origine è tra parentesi: **(appunti)** se il problema c'è già negli appunti originali di `notes/Appunti/`,
  **(riscrittura)** se l'ho introdotto io scrivendo le note.

---

## 1. Quadro d'insieme

| Cap. | Titolo | Parole | Gulpease | Parole/frase | Frasi lunghe | Grassetti/100 | Esempi | Comprensibilità | In una riga |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 0 | Guida alla lettura | 260 | 64,5 | 9,6 | 7% | 3,1 | 1 | 8 | breve e chiara |
| 1 | Strumenti matematici | 755 | 62,0 | 15,1 | 10% | 2,5 | 0 | 7 | mancano gli strumenti usati più avanti |
| 2 | Il problema dell'apprendimento | 2782 | 54,7 | 15,9 | 8% | **5,6** | 2 | 6 | troppo carico; figura diversa dall'esempio |
| 3 | Spazio delle ipotesi e bias induttivo | 1137 | 60,8 | 14,4 | 8% | 2,8 | 1 | 7 | la tabella dei 7 esempi non viene mai risolta |
| 4 | Modelli lineari | 2559 | **63,3** | 13,1 | **3%** | 3,2 | **4** | **8** | il capitolo migliore |
| 5 | Overfitting e regolarizzazione | 1503 | 57,9 | 16,0 | 3% | 3,6 | 1 | 7 | figura L1/L2 sbagliata; tabelle di altri dati |
| 6 | K-nearest neighbors | 1490 | 59,2 | 16,0 | 11% | 3,2 | 0 | 7 | nessun esempio svolto |
| 7 | Statistical Learning Theory | 1770 | 57,9 | 16,4 | 12% | 3,8 | 1 | 6 | astratto; dimostrazione "due casi" su tre |
| 8 | Bias, varianza ed ensemble | 1285 | 59,9 | 13,7 | 6% | 4,4 | 3 | 7 | il simbolo della media è ambiguo |
| 9 | Validazione | 3214 | 59,4 | 15,5 | 11% | 3,8 | 1 | 6 | lungo; manca un confronto tra gli schemi |
| 10 | Dal neurone al Perceptron | 2228 | 61,2 | 13,9 | 8% | 3,8 | 0 | 7 | ipotesi della dimostrazione non giustificate |
| 11 | MLP e backpropagation | 2211 | 60,6 | 14,4 | 7% | 3,8 | 1 | **8** | derivazione chiara |
| 12 | Addestrare una rete neurale | 3786 | 55,2 | 17,6 | 14% | 3,7 | 0 | 6 | catalogo di tecniche senza definizioni |
| 13 | SVM e metodi kernel | 3087 | 61,3 | 14,5 | 10% | 3,0 | 2 | **8** | ben costruito; manca un esempio numerico |
| 14 | Reti convoluzionali | 1283 | 53,3 | 18,6 | 16% | 4,0 | 0 | 7 | padding non spiegato |
| 15 | Deep learning | 3327 | **50,3** | **19,2** | **20%** | 4,1 | 2 | 6 | il meno leggibile; molti nomi non spiegati |
| 16 | Reti neurali randomizzate | 758 | 50,9 | 17,6 | 14% | 4,5 | 0 | 7 | dimensioni delle matrici incoerenti |
| 17 | K-means e SOM | 1498 | 54,2 | 17,0 | 11% | 3,5 | 1 | **8** | buone derivazioni; U-matrix solo a parole |
| 18 | Reti neurali ricorrenti | 1423 | 54,2 | 17,8 | 18% | 4,8 | 1 | 7 | qui `x` è lo stato, non l'input |
| 19 | Dati strutturati e grafi | 1827 | 51,2 | 18,6 | 18% | 4,9 | 1 | **5** | matematica non definita, simboli sovraccarichi |

"Parole" conta solo il testo, senza formule. **Totale**: 38 183 parole, Gulpease medio 57,3 (pesato sulle parole),
15,8 parole per frase. **Capitoli 1–12: 58,9. Capitoli 13–19: 54,2.** Comprensibilità media: circa 6,8.

**In sintesi.**
- La prima metà (capitoli 1–13) insegna bene: ordine logico, dimostrazioni passo per passo, figure calcolate sui
  dati. I difetti sono locali e si correggono in poco.
- La seconda metà (14–19) affatica: frasi più lunghe (fino al 20% sopra le 30 parole), molti nomi di modelli citati
  senza spiegazione, termini matematici mai definiti (Jacobiano, raggio spettrale, Laplaciano), pochi esempi.
- Il problema trasversale più serio è la **notazione**: lo stesso simbolo indica cose diverse da un capitolo
  all'altro, a volte nello stesso capitolo (sezione 3, T1).

---

## 2. Gli errori da correggere

Sono le voci [E] e le imprecisioni [I] più rischiose per chi studia. I dettagli sono nei capitoli (sezione 4).

| # | Dove | Problema | Origine |
|---|---|---|---|
| 1 | Cap. 7, dimostrazione di VC(rette) < 4 (`07-slt.tex:83`, `:92`) | Dice "si distinguono due casi", ne elenca tre, chiude con "In entrambi i casi" e non tratta il terzo (punti allineati). | riscrittura |
| 2 | Cap. 5, figura L1/L2 (`05-regolarizzazione.tex:364–389`) | Le curve di livello dell'errore sono disegnate come **rette** (un errore quadratico ha curve ellittiche) e **nessuna tocca** il punto indicato come soluzione: la tratteggiata attraversa il rombo e il cerchio. Contraddice la didascalia. | riscrittura |
| 3 | Cap. 5, tabelle dei coefficienti (`05:118–141`, `05:318–341`) | Sono i numeri dell'esempio originale, messi accanto a figure calcolate su **altri** dati: i coefficienti non sono quelli delle curve disegnate. | riscrittura |
| 4 | Cap. 2, esempio "Quale funzione?" e figura (`02:279–304`) | L'esempio parla di 5 punti vicini a f(x)=2x, la figura mostra 7 punti diversi. | riscrittura |
| 5 | Cap. 10, regola del Perceptron (`10:226` e `10:260`) | Prima w + ½η(d−o)x, poi w + η(d−o)x "nella stessa forma": il ½ sparisce e il passo raddoppia. | appunti |
| 6 | Cap. 10, teorema di convergenza (`10:275` e `10:294`) | L'enunciato vale "qualunque sia il punto di partenza", la dimostrazione assume w(0)=0 e η=1 senza dire perché basti. | appunti |
| 7 | Cap. 13, algoritmo "SVM con kernel", passo 5 (`13:423`) | Scrive wᵀΦ(x) = Σ αᵢdᵢk(x,xᵢ) + b: a sinistra manca + b. | riscrittura |
| 8 | Cap. 13, soft margin (`13:248`) | "0 < ξ ≤ 1: dentro il margine ma classificato correttamente": con ξ = 1 il punto sta esattamente sul confine. | riscrittura |
| 9 | Cap. 14, risultati di LeCun (`14:255`) | "Quasi al 99% (errore dell'1,6%)": un errore dell'1,6% è un'accuratezza del 98,4%. | appunti (due fonti: grafico e testo) |
| 10 | Cap. 15, schizzo formale del vanishing gradient (`15:397`) | ‖∂Fᵢ/∂hᵢ‖: Fᵢ riceve h₍ᵢ₋₁₎, quindi la derivata è ∂Fᵢ/∂h₍ᵢ₋₁₎. | appunti |
| 11 | Cap. 16, readout (`16:70–82`) | H = f(WX) ha una colonna per esempio, ma (HᵀH + λI)⁻¹Hᵀd richiede una riga per esempio; e o(x) = W^out f(Wx) richiede W^out trasposta. | appunti |
| 12 | Cap. 18, funzione di transizione (`18:63` e `18:100`) | τ(l(t), x(t−1)) e poi τ(x(t−1), l(t)): argomenti in ordine diverso. | appunti |
| 13 | Cap. 19, over-squashing (`19:228–232`) | Dalla disuguaglianza (un limite **superiore**) non segue che ‖W‖ > 1 "impedisce" alla sensibilità di svanire: segue solo che con ‖W‖ < 1 la sensibilità è **costretta** a svanire. Inoltre sembra contraddire la contrattività richiesta poco sopra (`19:168`) proprio per la GraphESN. | appunti (`21:184–188`) |
| 14 | Cap. 19, formula della GraphESN (`19:172`) | I pesi dell'etichetta w̄ₗⱼ dipendono dall'iterazione l, ma nell'approccio ricorsivo i pesi sono condivisi tra iterazioni. | appunti (`21:147`) |
| 15 | Cap. 13, teorema di Vapnik (`13:223`) | "D²/ρ² ∝ Raggio²‖w‖²": con ρ = 2/‖w‖ e D = 2R vale l'**uguaglianza** D²/ρ² = R²‖w‖²; "Raggio" non è mai definito. | riscrittura |
| 16 | Cap. 13, SVM per regressione (`13:475`) | w = (b, w₁, …) contiene il bias, quindi ½wᵀw penalizza anche b; poi il testo dice di "calcolare il bias" come passo a parte. | appunti (`13:384`) |
| 17 | Cap. 4, classificazione (`04:431` e `04:444`, `:466`) | Prima sign(wᵀx) con target ±1, poi soglia 0,5 (target 0/1) senza dire che la codifica è cambiata. | riscrittura |
| 18 | Cap. 8, boosting (`08:282–287`) | "Classifica correttamente tutte le istanze di training", "resiste all'overfitting" e "soffre con dati rumorosi" nella stessa frase, senza spiegare come stanno insieme. | appunti (`15:166`) |
| 19 | Cap. 5, weight decay (`05:260`) | w + ηΔw − 2λw: la penalità non è moltiplicata per η. Il testo lo dice ma non dice che allora questo λ non è lo stesso della forma chiusa (è λ·η). | appunti |
| 20 | Cap. 1, figura 1.1 (`01:111–115`) | Le etichette "minimo" e "−∇f" si toccano sull'asse x₁ e si leggono come "minimo −∇f". | riscrittura |

---

## 3. Problemi trasversali

### T1. Notazione non unificata

È il problema che più ostacola lo studio: chi passa da un capitolo all'altro deve ricostruire ogni volta il
significato dei simboli.

| Simbolo | Significati diversi |
|---|---|
| target | `d` (cap. 3, 10, 13, 18), `y` (cap. 3 tabella, 4 a `04:396`, 8), `t` (cap. 8, esempio a `08:259`) |
| numero di esempi | `l` (cap. 4, 9, 16, 17), `N` (cap. 7, 13); nel cap. 7 entrambi a poche righe (`07:188`, `07:194`) |
| dimensione dell'input | `n` (cap. 3, 17), `m` (cap. 13, riquadro notazione), `m₀` (cap. 13, Vapnik e kernel) |
| `R` | rischio (cap. 7, 9), numero di fold (`09:472–481`), coefficiente di correlazione (`09:583`) |
| `K` | vicini (cap. 6), fold (cap. 9), modelli del comitato (`08:243`), prototipi (cap. 17), matrice kernel (cap. 13) |
| "kernel" | funzione di similarità (cap. 13) e filtro convoluzionale (cap. 14), senza avvertire |
| `x` | input ovunque, ma **stato** nel cap. 18; l'input lì è `l(t)` nel testo e `u(t)` nella figura ESN |
| `L` | loss (cap. 9), numero di strati, etichetta del nodo `L_v` e Laplaciano, tutti nel cap. 19 |
| `α` | moltiplicatori di Lagrange (cap. 13), margine minimo (dimostrazione del Perceptron, `10:286`), costante del kernel (`13:399`), parametro ELU (cap. 15) |
| `d` | target, profondità (`15:390`), distorsione `d(x, w)` (cap. 17) |
| `N` | anche numero di strati in NN4G (`19:157`) |
| `E` | somma degli errori, media, con o senza ½, secondo il capitolo |
| stato nascosto | `h` (cap. 15, 16, 19) ma `x` (cap. 18) |

**Proposta.** Una tabella della notazione nella Guida (capitolo 0) e simboli coerenti in tutto il testo. Dove gli
appunti usano un simbolo diverso cambia solo il nome, non la formula. Dove un capitolo deve per forza deviare,
un riquadro "Notazione" in apertura, come già nel capitolo 13.

### T2. Termini usati prima di essere definiti

Lo script ha cercato ogni termine definito con `\termine{}` nei capitoli precedenti. Quelli che contano (gli altri
sono usi generici della parola):

| Termine | Usato in | Definito in |
|---|---|---|
| overfitting | 4 | 5 |
| VC-dimension | 4, 5 | 7 |
| model selection | 5, 6, 7 | 9 |
| mini-batch | 4 | 12 |
| early stopping | 7, 9, 11 | 12 |
| softmax | 10 | 12 |
| kernel | 4, 6 | 13 |
| dropout | 12, 14 | 15 |
| word embedding | 15 (`15:75–82`) | 15 (`15:319`) |
| PCA | 15, 17 | mai |

**Proposta.** Alla prima occorrenza, una frase di definizione provvisoria più il rimando ("una rete va in
*overfitting* quando impara il rumore dei dati di training; capitolo 5"). Il capitolo 2 ha 11 rimandi in avanti: va
bene, perché è una mappa del corso, ma va detto in apertura.

### T3. Matematica usata ma mai spiegata

Autovalori e matrice semidefinita positiva (Mercer, cap. 13); moltiplicatori di Lagrange, punto di sella,
condizioni di Kuhn-Tucker (cap. 13); Jacobiano e norma di una matrice (cap. 15, 19); raggio spettrale e funzione
contrattiva (cap. 18, 19); norma spettrale e costante di Lipschitz, Laplaciano, trasformata di Fourier su grafo
(cap. 19); NP-completo (cap. 17); Turing-equivalente (cap. 18).

**Proposta [A].** Una sezione di circa una pagina nel capitolo 1, "Algebra lineare e ottimizzazione vincolata",
con **solo** ciò che serve: autovalori, matrice semidefinita positiva, norma di una matrice e raggio spettrale,
Jacobiano, idea dei moltiplicatori di Lagrange. Per i termini usati una sola volta basta una frase sul posto.

### T4. Pochi esempi svolti

Sei capitoli non hanno nessun esempio (1, 6, 10, 12, 14, 16) e cinque ne hanno uno solo. Gli esempi proposti
capitolo per capitolo sono nella sezione 4; quelli con il guadagno maggiore:
- cap. 3: risolvere il version space sulla tabella dei 7 esempi;
- cap. 8: dimostrare la disuguaglianza del comitato con il lemma della varianza del cap. 1;
- cap. 10: un'esecuzione del Perceptron passo per passo;
- cap. 13: una SVM a due punti risolta a mano;
- cap. 19: un passo di message passing con numeri.

### T5. Le domande d'esame non hanno una traccia di risposta

Ogni capitolo chiude con le domande, ma lo studente non sa dove trovare la risposta né se la propria è completa.
In un caso le note **non contengono** la risposta: "Cosa sono kernel, stride, padding, feature map?" (cap. 14), ma
il padding è descritto solo con "gestisce i bordi".
**Proposta [A].** Accanto a ogni domanda il rimando alle sezioni che rispondono (costo basso), oppure
un'appendice di tracce di risposta (3–5 punti per domanda).

### T6. La leggibilità cala nella seconda metà

Capitoli 14–19: Gulpease 50–54, dal 14 al 20% di frasi sopra le 30 parole (nei capitoli 4–5 sono il 3%). Le
frasi più lunghe arrivano a 60 parole, per esempio:
- `16:108–111` "Sono utili con i big data, per implementazioni minuscole … " (60 parole);
- `19:149–152` "Nelle reti convoluzionali per grafi (GCN, NN4G) ogni iterazione … " (63 parole);
- `18:228–232` "Il reservoir agisce come una proiezione … " (57 parole).

**Proposta.** Spezzare le frasi oltre le 30 parole, portando questi capitoli verso 58–60 come la prima metà.
Non serve togliere contenuto: serve un punto dove ora c'è un punto e virgola o una parentesi lunga.

### T7. Elenchi di nomi non spiegati

Molti modelli sono solo nominati: Capsule Network (cap. 14); VAE, BERT, GPT, GAN, lottery ticket, pruning,
quantizzazione, manifold (cap. 15); Restricted Boltzmann Machine, Extremely Randomized Trees (cap. 16); MDS, ICA,
t-SNE, maximum-entropy clustering (cap. 17); HMM, GRU, BPTT e RTRL (cap. 18); GAT, NN4G+, network quantification
(cap. 19). Lo studente non capisce che cosa va saputo e che cosa è solo cultura.
**Proposta.** Raggrupparli in un riquadro riconoscibile, per esempio "Per orientarsi", con una riga per nome; il
testo principale resta sui concetti spiegati.

### T8. Grassetto troppo fitto

Capitolo 2: 5,6 grassetti ogni 100 parole; capitoli 18–19: 4,8–4,9. Quando quasi ogni frase ha un grassetto
l'occhio non sa più dove fermarsi. Nel capitolo 12 due titoli contengono "(!)" (`12:169`, `12:306`), un segno
da appunti che stona in un testo stampato.
**Proposta.** Grassetto solo sul termine nel punto in cui è definito e su uno o due enunciati chiave per sezione;
al posto di "(!)" un riquadro.

### T9. Mancano le tabelle di confronto [A]

Tre tabelle che collegano capitoli diversi, senza ripetere argomenti (ogni riga rimanda alla sezione):
1. **schemi di validazione** (cap. 9): hold-out, K-fold, TR/VL/TS, double CV: cosa stima, quanti addestramenti
   richiede, quando usarlo;
2. **forme di regolarizzazione**: Tikhonov (cap. 5), weight decay ed early stopping (cap. 12), C del soft margin
   (cap. 13), pesi condivisi (cap. 14), dropout (cap. 15): cosa limita e quale iperparametro la controlla;
3. **modelli**: LMS, Perceptron, K-NN, MLP, SVM, rete randomizzata: bias induttivo, tipo di addestramento,
   problema convesso o no, iperparametri principali.

### T10. Manca un indice analitico [A]

Il comando `\termine{}` marca già ogni termine nel punto in cui è definito. Facendogli scrivere anche una voce
d'indice si otterrebbe in fondo al PDF l'elenco alfabetico dei termini con la pagina della definizione. Da
verificare che `tectonic` generi l'indice (richiede `makeindex`); in alternativa lo si costruisce con uno script.

---

## 4. Capitolo per capitolo

### Capitolo 0 — Guida alla lettura
Gulpease 64,5 · comprensibilità 8/10.
- Funziona: breve, spiega il significato dei riquadri.
- [A] Ospitare la tabella della notazione (T1) e una mappa delle dipendenze tra capitoli (quale capitolo serve
  per leggere quale).

### Capitolo 1 — Strumenti matematici
Gulpease 62,0 · 15,1 parole/frase · comprensibilità 7/10.
- Funziona: compatto; lo sviluppo del quadrato della norma è riusato in tre dimostrazioni più avanti; il lemma
  della varianza è al posto giusto.
- [F] Figura 1.1: "minimo" e "−∇f" attaccate sull'asse x₁ (errore 20).
- [D] Nessun esempio. [A] Un gradiente calcolato con numeri sulla funzione della figura, f = x₁² + 2x₂²: in
  (1, 1) vale ∇f = (2, 4), e si vede che la freccia della figura è più ripida dell'asse x₁ perché la funzione
  cresce più in fretta lungo x₂.
- [D] Mancano gli strumenti usati più avanti (T3).

### Capitolo 2 — Il problema dell'apprendimento
Gulpease 54,7 · 15,9 parole/frase · 5,6 grassetti/100 · comprensibilità 6/10.
- Funziona: gli ingredienti (dati, task, modello, algoritmo) sono ben separati; il ciclo di progettazione è
  chiaro.
- [E] Esempio e figura con punti diversi (errore 4). Proposta: disegnare i 5 punti dell'esempio con la retta, una
  curva liscia e il polinomio di grado 4 che li interpola.
- [D] È il capitolo più denso di nomi che torneranno più avanti (autoencoder, transformer, centroide,
  quantizzazione vettoriale…): al primo incontro spaventano. Proposta: dichiarare in apertura che è una mappa;
  lasciare il nome e il rimando, togliere i dettagli che il capitolo di destinazione ripete.
- [D] Grassetto troppo fitto (T8).

### Capitolo 3 — Spazio delle ipotesi e bias induttivo
Gulpease 60,8 · comprensibilità 7/10.
- Funziona: i conteggi 2^(2^n) e 3ⁿ + 1 sono dimostrati; la dimostrazione del learner senza bias è passo per passo;
  l'esempio a un solo input è efficace.
- [D] La tabella dei 7 esempi (`03:43–60`) serve solo a contare le 512 funzioni compatibili. [A] **Risolverla con
  le regole congiuntive**: i due esempi positivi (3 e 4) hanno in comune solo x₂ = 0 e x₄ = 1, quindi le regole
  candidate sono *true*, ¬x₂, x₄, ¬x₂∧x₄. L'esempio negativo 1 elimina *true* e ¬x₂, il 7 elimina x₄: il version
  space è **{¬x₂ ∧ x₄}**. Con il bias congiuntivo si risponde su tutte le 9 istanze non viste; senza bias le
  funzioni compatibili restano 512. È il messaggio del capitolo, mostrato sui suoi stessi dati (calcolo verificato).
- [I] Letterali scritti `lᵢ` ma variabili `xᵢ`; target `y` nella tabella e `d(x)` nella definizione.

### Capitolo 4 — Modelli lineari
Gulpease 63,3 · 13,1 parole/frase · 3% frasi lunghe · comprensibilità 8/10.
- Funziona: il più leggibile; derivazioni complete; quattro esempi; gli errori della figura di classificazione
  sono calcolati.
- [I] Codifica dei target ±1 / 0-1 cambiata senza dirlo (errore 17).
- [D] L'esempio della delta rule (`04:293–295`) resta qualitativo ("w₁ e w₃ aumentano"). [A] Con η = 0,1:
  δ = 1 − (−0,4) = 1,4; Δw = 0,14 · (1, 0, 1); nuovi pesi (−0,06; 0,5; −0,06); wᵀx = −0,12, più vicino al target.
- [D] Rimandi in avanti a kernel, VC-dimension, mini-batch: una frase di definizione provvisoria (T2).

### Capitolo 5 — Overfitting e regolarizzazione
Gulpease 57,9 · comprensibilità 7/10.
- Funziona: l'esperimento polinomiale è calcolato e mostra bene underfitting e overfitting; la spiegazione del
  perché L1 azzera i pesi (spinta costante contro spinta che si attenua) è chiara.
- [E] Figura L1/L2 (errore 2). Proposta: ellissi dell'errore attorno a un minimo non vincolato; la più piccola
  tangente al rombo in un vertice e al cerchio in un punto generico.
- [E] Tabelle dei coefficienti (errore 3). Proposta: farle calcolare a `genera_dati.py` sugli stessi dati delle
  figure, così numeri e curve coincidono (il fenomeno resta: coefficienti enormi con M = 9, piccoli con λ).
- [I] λ nella regola del weight decay (errore 19).

### Capitolo 6 — K-nearest neighbors
Gulpease 59,2 · 11% frasi lunghe · comprensibilità 7/10.
- Funziona: le figure al variare di k sono calcolate; il confronto con il modello lineare e con Bayes è ben posto.
- [D] Nessun esempio svolto. [A] Sei punti etichettati e un punto da classificare, con la tabella delle distanze:
  il 1-NN e il 3-NN danno risposte diverse, e si vede perché k regola la regolarità del confine.
- [D] `K` torna con altri significati nei capitoli 8, 9, 13, 17 (T1).

### Capitolo 7 — Statistical Learning Theory
Gulpease 57,9 · 12% frasi lunghe · comprensibilità 6/10.
- Funziona: la VC-dimension delle rette è dimostrata in entrambi i versi; il ruolo del bound è discusso.
- [E] Dimostrazione con tre casi chiamati "due" (errore 1).
- [I] `N` e `l` mescolati (`07:188`, `07:194`).
- [D] Il bound resta una formula. [A] Tre valori calcolati con la formula del capitolo (δ = 0,05): VC = 10,
  N = 1000 dà ε ≈ 0,26; VC = 10, N = 10 000 dà ε ≈ 0,095; VC = 100, N = 1000 dà ε ≈ 0,64. Si vede subito che la
  garanzia è debole con pochi dati e peggiora con la capacità.

### Capitolo 8 — Bias, varianza ed ensemble
Gulpease 59,9 · comprensibilità 7/10.
- Funziona: la decomposizione è dimostrata passo per passo; gli esempi numerici del comitato.
- [I] `E_P` indica due medie diverse: sui training set (da cui dipende h) e sul rumore del target nel punto x.
  L'indipendenza tra y e h(x) (`08:84`) vale perché il rumore del nuovo punto non dipende dal training set: va
  detto.
- [A] **Dimostrare il teorema del comitato** (`08:249–256`, ora solo enunciato "è Jensen") con il lemma della
  varianza del capitolo 1: Eᵢ[(t − hᵢ)²] = (t − h̄)² + Varᵢ[hᵢ]. Una riga, e mostra che il guadagno del comitato
  è esattamente la **varianza tra i modelli**, cioè la loro diversità. Torna con l'esempio già presente:
  predizioni 2 e 4, media degli errori 5 = errore del comitato 4 + varianza 1.
- [I] Boosting (errore 18).
- [D] "Feature selection (cenni)" chiude un capitolo che parla d'altro. Proposta: spostarla accanto al Lasso
  (cap. 5, che già la chiama "una forma di feature selection") o tra gli errori di validazione (cap. 9), dove
  sta l'avvertimento sul *feature subset selection bias*.

### Capitolo 9 — Validazione
Gulpease 59,4 · 3214 parole · comprensibilità 6/10.
- Funziona: gli schemi formali sono rigorosi; il controesempio è istruttivo; la parte sugli errori frequenti è
  utile.
- [I] `R` con tre significati (T1). Proposta: K per il numero di fold, come nel resto del capitolo.
- [D] Sette algoritmi e sette riquadri "attenzione" di fila: manca una vista d'insieme. [A] Tabella di confronto
  degli schemi (T9) e uno schema "come scelgo lo schema" (pochi dati? serve anche una stima del rischio?).
- [D] Dire in una frase perché l'errore di validazione del modello scelto è ottimista: si è preso il minimo tra
  molti valori, ciascuno affetto da rumore.
- [A] Matrice di confusione con numeri: 100 esempi, TP 40, FN 10, FP 5, TN 45 → accuratezza 0,85; sensibilità
  0,80; specificità 0,90; precisione 0,89.

### Capitolo 10 — Dal neurone al Perceptron
Gulpease 61,2 · comprensibilità 7/10.
- Funziona: la dimostrazione di convergenza in cinque passi con la figura dei due limiti; l'interpretazione del
  bound come margine prepara le SVM.
- [E] Il ½ che sparisce (errore 5).
- [I] Ipotesi della dimostrazione (errore 6). Proposta: dire che con w(0) = 0 il valore di η moltiplica tutti i
  pesi senza cambiarne i segni, quindi η = 1 non è una restrizione; e che il caso w(0) ≠ 0 richiede di adattare
  i limiti (gli appunti non lo svolgono).
- [I] Passo 1: oltre a dire che w* risolve entrambi i problemi, va detto che **l'algoritmo fa gli stessi passi**
  sui dati "ribaltati": sbaglia su (x, d) se e solo se w·(dx) ≤ 0, e aggiorna w + ηdx = w + ηx′.
- [I] Il caso wᵀx = 0 va contato come errore: il testo lo fa implicitamente (`10:223`) e la dimostrazione lo usa
  (passo 4), ma non lo dichiara.
- [I] Condizione d'arresto "i pesi non cambiano più" (`10:213`): meglio "un'epoca intera senza errori".
- [A] Un'esecuzione svolta: AND a due ingressi con bias, w(0) = 0, η = 1, una tabella per epoca.

### Capitolo 11 — Multi-Layer Perceptron e backpropagation
Gulpease 60,6 · comprensibilità 8/10.
- Funziona: derivazione generale → uscita → nascoste; tabella di sintesi; la fattorizzazione dei delta spiegata con
  numeri (10⁹ contro 10¹⁸).
- [I] `11:252`: "w + ηΔw + …": i puntini non sono spiegati.
- [D] O(#W) contro O(#W²) compare a `11:200` e si spiega solo a `11:389–391`: anticipare la frase dei 10⁹ pesi.

### Capitolo 12 — Addestrare una rete neurale
Gulpease 55,2 · 3786 parole (il più lungo) · 14% frasi lunghe · 0 definizioni · 0 esempi · comprensibilità 6/10.
- Funziona: early stopping e momentum con figure; Cascade Correlation; il benchmark MONK come verifica pratica.
- [D] È un catalogo: nove riquadri "idea" uno dopo l'altro perdono la funzione di riquadro. Proposta: riquadri
  di definizione per momentum, early stopping, weight decay; tolto questo, il resto può tornare testo normale.
- [A] Una tabella finale "iperparametro → effetto se troppo alto / troppo basso → come sceglierlo" (η, momentum,
  λ, numero di unità, dimensione del mini-batch, numero di epoche).
- [F] La figura della Cascade Correlation è affollata: meno connessioni disegnate, un'unità aggiunta alla volta.
- [D] "(!)" nei titoli (T8).

### Capitolo 13 — Support Vector Machines e metodi kernel
Gulpease 61,3 · 3087 parole · comprensibilità 8/10.
- Funziona: percorso in quattro passi; dimostrazione del margine; derivazione del duale passo per passo; figure
  calcolate (hard margin, soft margin, kernel); i "luoghi comuni da sfatare".
- [E] Manca + b (errore 7). [I] ξ = 1 (errore 8). [I] Vapnik (errore 15). [I] Regressione (errore 16).
- [I] `13:251` "Il teorema di Vapnik non vale più, perché l'hard margin non ammette punti nel margine": la frase
  è rovesciata. Meglio: il teorema vale per iperpiani con nessun punto dentro il margine, e il soft margin toglie
  proprio questa ipotesi.
- [I] Notazione: `m` e `m₀` per la stessa dimensione; `α` anche per la costante del kernel (`13:399`).
- [D] Moltiplicatori di Lagrange, punto di sella e Kuhn-Tucker arrivano senza spiegazione (T3). [A] Mezza pagina:
  cosa fa un moltiplicatore e perché αᵢ(…) = 0 significa "o il vincolo è attivo o il moltiplicatore è nullo".
- [D] Soft margin: μᵢ compare senza la lagrangiana. [A] Una riga, ∂J/∂ξᵢ = C − αᵢ − μᵢ = 0 con μᵢ ≥ 0, spiega da
  dove viene αᵢ ≤ C; e una tabella dei tre casi (αᵢ = 0: fuori dal margine; 0 < αᵢ < C: sul bordo; αᵢ = C: dentro
  o dal lato sbagliato).
- [I] Il bias si calcola con un support vector positivo nell'hard margin e con dⱼ − … nel soft margin: usare la
  forma generale b = dₛ − wᵀxₛ in entrambi.
- [A] **SVM risolta a mano**: x₁ = (1, 1) con d = +1, x₂ = (−1, −1) con d = −1. Il vincolo Σαᵢdᵢ = 0 dà
  α₁ = α₂ = α; il duale diventa Q(α) = 2α − 4α², massimo in α = 1/4; quindi w = (½, ½), b = 0, ρ = 2/‖w‖ = 2√2,
  esattamente la distanza tra i due punti. Tutto il capitolo su un esempio che si controlla a occhio (calcolo
  verificato).

### Capitolo 14 — Reti convoluzionali
Gulpease 53,3 · 18,6 parole/frase · 16% frasi lunghe · 0 definizioni · 0 esempi · comprensibilità 7/10.
- Funziona: figure della convoluzione 1D e 2D con lettere al posto dei numeri, campo recettivo, max pooling; breve.
- [I] 98,4% e non "quasi 99%" (errore 9).
- [D] Padding solo "gestisce i bordi", ma la domanda d'esame chiede cos'è (T5). [A] Una frase: si aggiungono
  valori attorno all'immagine, così il kernel può essere centrato anche sui pixel di bordo e la feature map non
  si rimpicciolisce.
- [D] Dimensione della feature map: si ricava dalla figura (input 3×4, kernel 2×2 → 3−2+1 per 4−2+1 = 2×3). Una
  riga lo renderebbe una regola (con stride 1 e senza padding).
- [D] "Kernel" ha un altro significato nel capitolo 13: avvertirlo.
- [A] Contare i parametri: un filtro 3×3 ha 9 pesi più il bias; un'unità densa su un'immagine 16×16 ne ha 256.
  Rende concreto "riduce i parametri liberi".
- [A] Backpropagation con pesi condivisi (`14:225`, "qualche specializzazione"): il gradiente di un peso condiviso
  è la somma dei gradienti delle sue copie, per la regola della catena.
- [D] Definizioni in riquadro per convoluzione, feature map, stride, padding, pooling; Capsule Network in
  "Per orientarsi" (T7); frasi lunghe a `14:182–186` e `14:282–285`.

### Capitolo 15 — Deep learning
Gulpease 50,3 (il più basso) · 19,2 parole/frase · 20% frasi lunghe · comprensibilità 6/10.
- Funziona: l'esempio della parità con il conteggio delle porte e l'albero di XOR; la tabella simbolica/
  distribuita; la figura delle 16 sotto-reti del dropout; l'algoritmo del dropout.
- [E] Indice della derivata (errore 10); Jacobiano e norma non definiti (T3); `d` per la profondità (`15:390`).
- [I] "Con log N strati" (`15:105`): ogni XOR sono due livelli di porte, quindi gli strati di porte sono 2 log N.
- [D] Word embedding usato a `15:75` e definito a `15:319`: spostare la definizione o anticiparla.
- [D] La sezione "Maledizione della dimensionalità e bias" (`15:167–180`) è astratta; l'esempio concreto (auto/
  bici, kⁿ concetti) arriva dopo. Rimandarvi o invertire l'ordine.
- [D] PCA mai definita (`15:237`); GAN elencate tra le tecniche di regolarizzazione (`15:515`), dove non stanno;
  VAE, BERT, GPT, lottery ticket… (T7).
- [D] Il "puzzle del non-overfitting" parla di margine massimo: rimando al capitolo 13.
- [A] Batch normalization: scrivere la normalizzazione (x − μ_B)/σ_B con media e deviazione standard del
  mini-batch, che il testo descrive solo a parole.
- [D] Frasi lunghe (T6), per esempio `15:255–262` (53 parole).

### Capitolo 16 — Reti neurali randomizzate
Gulpease 50,9 · 0 esempi · comprensibilità 7/10.
- Funziona: breve; mostra come tornano Cover, espansione in basi e ridge regression.
- [E] Dimensioni delle matrici (errore 11).
- [I] "Random Forest (o Extremely Randomized Trees)" (`16:23`): sono due metodi diversi, la "o" li fa sembrare
  sinonimi. Gli alberi di decisione non sono mai definiti nelle note.
- [D] "Pro e contro" (`16:98–105`) mescola pro e contro senza separarli; Cascade Correlation senza rimando al
  capitolo 12.
- [A] Una figura calcolata con lo script: errore di test in funzione del numero di unità casuali, sui dati a due
  classi già usati per le SVM. Mostra perché servono "molte unità".

### Capitolo 17 — Apprendimento non supervisionato: K-means e SOM
Gulpease 54,2 · comprensibilità 8/10.
- Funziona: derivazione della regola on-line; passaggio alla versione batch; figure calcolate (K-means in quattro
  passi, SOM che si distende); tabella K-means/SOM; "con vicinato nullo la SOM è il K-means".
- [I] `17:92`: δ_winner(i, i*) vale sempre 1 per il vincitore, quindi è superfluo nella regola.
- [I] `17:126` "con η = 1 e mediando" non è un passo dell'algoritmo on-line. Più pulito: con le assegnazioni
  fissate, la derivata dell'errore del cluster si annulla nella media, quindi la media è il centro ottimo.
- [D] `17:28` "1 meno una gaussiana": dire cosa ottiene (la distanza non supera 1, quindi un outlier lontano non
  pesa più di un punto vicino al bordo).
- [D] "Varietà" (`17:34`) non definita: basta "insieme". PCA, MDS, ICA, t-SNE solo elencati (T7).
- [F][A] La U-matrix è descritta a parole e l'esempio dei 77 paesi non ha figura. Proposta: una U-matrix calcolata
  dallo script sui dati del K-means (tre zone chiare separate da bordi scuri).
- [D] L'analogia con la corteccia somatosensoriale (`17:216–218`) è l'unico richiamo biologico rimasto nel
  capitolo: tenerla o toglierla secondo la regola "niente aneddoti".

### Capitolo 18 — Reti neurali ricorrenti
Gulpease 54,2 · 18% frasi lunghe · comprensibilità 7/10.
- Funziona: l'esempio "contare gli 1" (mostra cos'è lo stato e il limite delle IDNN); l'unfolding con figura; le
  tre assunzioni.
- [I] Lo stato si chiama `x` (T1). Proposta: chiamarlo `h` come nei capitoli 15, 16 e 19; in alternativa un
  riquadro "Notazione".
- [E] Ordine degli argomenti di τ (errore 12); figura ESN con `u(t)` e `W_in` contro `l(t)` del testo.
- [D] Transformer (`18:181–188`): una sola frase di oltre 60 parole con multi-head, query, prodotto scalare
  scalato non definiti; l'esempio "see that girl" non chiarisce. Proposta: spezzare in passi brevi ciò che gli
  appunti dicono già (ogni elemento confronta il proprio vettore query con gli altri elementi con un prodotto
  scalare; i confronti diventano pesi di rilevanza; l'uscita combina tutti gli elementi con quei pesi).
- [D] Raggio spettrale e funzione contrattiva (`18:205`) non definiti (T3); BPTT e RTRL nominati senza dire in
  che cosa differiscono; "gate" delle LSTM non spiegato; HMM, Turing-equivalente (T7).
- [A] Readout della ESN: rimandare all'algoritmo del capitolo 16, che è la stessa ridge regression con gli stati
  nel tempo al posto delle attivazioni nascoste.

### Capitolo 19 — Apprendimento su dati strutturati e grafi
Gulpease 51,2 · 18,6 parole/frase · 18% frasi lunghe · 0 definizioni · comprensibilità 5/10.
- Funziona: il message passing in tre passi con figura; la figura della crescita del contesto; omofilia ed
  eterofilia disegnate; il confronto con le CNN.
- [E] L'inferenza su ‖W‖ > 1 e la contraddizione con la contrattività (errore 13); i pesi w̄ₗⱼ della GraphESN
  (errore 14).
- [I] Simboli sovraccarichi: `L` (strati, etichette, Laplaciano), etichette scritte `l(v)`, `L_v`, `L_j(v)`
  e `x_u` (nello Jacobiano), `N` per gli strati, `X` per il global pooling (T1).
- [I] GCN scritta come ReLU(Â h W), cioè con una riga per nodo, e GraphConv come f(W₁h + W₂Ah), con una colonna
  per nodo, nella stessa lista (`19:114–116`).
- [D] Jacobiano, norma spettrale, costante di Lipschitz, Laplaciano, trasformata di Fourier su grafo non definiti
  (T3).
- [D] Nessun riquadro di definizione: DGN, message passing, over-smoothing, over-squashing, eterofilia ne meritano
  uno.
- [D] I risultati di ricerca con numeri (accelerazione fino a 10 volte, oltre 100 000 nodi, "minuti invece di
  ore", benchmark Wikipedia) sono sparsi nel testo: raccoglierli in un riquadro "Risultati".
- [A] **Un passo di message passing con numeri**: grafo di 4 nodi in fila, etichette scalari, aggregazione per
  somma, due strati. Si vede che dopo il secondo strato il primo nodo "sente" il terzo: è la figura del contesto
  resa calcolabile.
- [D] Frasi lunghe (T6).

---

## 5. Priorità suggerite

1. **Errori** (sezione 2, voci 1–20): lavoro breve, nessuna discussione di stile. Le voci di origine "appunti"
   correggono imprecisioni presenti anche nel materiale originale: le segnalo perché uno studente le
   imparerebbe sbagliate.
2. **Notazione e definizioni mancanti** (T1, T2, T3): lavoro medio, il guadagno maggiore per la seconda metà.
3. **Esempi svolti** (T4 e sezione 4): i cinque elencati in T4 per primi.
4. **Leggibilità dei capitoli 14–19** (T6, T7, T8): spezzare le frasi, raccogliere i nomi in riquadri,
   alleggerire il grassetto.
5. **Facoltativi**: tabelle di confronto (T9), tracce di risposta (T5), indice analitico (T10).

## 6. Cose che non propongo

Vanno oltre gli appunti; le aggiungerei solo se lo chiedi:
- il delta della backpropagation con cross-entropy e softmax (le note consigliano questa loss ma non ne derivano
  la regola);
- la formula generale della dimensione della feature map con stride e padding;
- i parametri di scala e traslazione appresi della batch normalization;
- la dimostrazione che il K-means termina (l'errore non aumenta mai);
- chiavi e valori del meccanismo di attenzione.

## 7. Limiti di questa analisi

- Ho letto i sorgenti `.tex` capitolo per capitolo; del PDF ho riguardato a grandezza reale solo la figura 1.1.
  Altri problemi di impaginazione delle figure possono esserci.
- La copertura delle formule era stata controllata alla stesura (168 formule in display degli appunti ritrovate);
  qui non l'ho ripetuta.
- I calcoli degli esempi proposti (version space del cap. 3, delta rule del cap. 4, ε del cap. 7, SVM a due punti
  del cap. 13, matrice di confusione del cap. 9) li ho verificati; gli esempi senza numeri (cap. 6, 10, 19) vanno
  costruiti e verificati se li approvi.

---

## 8. Applicato nella versione 2 (17 ottobre 2026)

Richiesta: correggere gli errori, unificare la notazione, migliorare la leggibilità, e produrre un nuovo PDF senza
sostituire il precedente. Risultato: `Machine_Learning_Note_Migliorate_v2.pdf` (159 pagine). Il PDF della versione 1
è rimasto intatto. Non sono stati aggiunti gli esempi svolti, le tabelle di sintesi, l'indice analitico e le altre
aggiunte [A] delle sezioni 3 e 4: restano proposte.

### 8.1 Errori (sezione 2)

Corretti tutti i 20 punti. Come:
- **1** (cap. 7): tre casi dichiarati come tre, che coprono tutte le possibilità; per ciascuno la ragione per cui
  l'etichettatura non è separabile (un semipiano è convesso).
- **2** (cap. 5): figura L1/L2 ridisegnata con curve di livello ellittiche attorno al minimo dell'errore $\hat w$;
  i punti di contatto sono calcolati (vertice del rombo; punto (0,254; 0,967) sul cerchio).
- **3** (cap. 5): le due tabelle dei coefficienti sono generate da `script/genera_dati.py` sugli stessi dati delle
  figure (`dati/poly_coeff_M.tex`, `dati/poly_coeff_lambda.tex`).
- **4** (cap. 2): figura ridisegnata con i cinque punti dell'esempio, retta dei minimi quadrati, parabola e polinomio
  interpolante di grado 4, su un intervallo che mostra dove l'interpolante si stacca.
- **5–6** (cap. 10): il ½ è assorbito esplicitamente in η; spiegato perché η = 1 non è una restrizione con
  w(0) = 0, e dichiarato che il caso w(0) ≠ 0 non è svolto. Aggiunti anche: la convenzione wᵀx = 0 = errore (usata
  nella dimostrazione), il passo 1 completato (l'algoritmo fa gli stessi passi sui dati "ribaltati"), l'arresto dopo
  un'epoca senza errori.
- **7, 8, 15, 16** (cap. 13): + b nell'algoritmo; caso ξ = 1 separato; D²/ρ² = R_s²‖w‖² come uguaglianza, con
  R_s = D/2 definito; un riquadro spiega dove sta il bias nella SVM per regressione. Il bias dell'hard margin è ora
  scritto nella forma generale b = d − wᵀx per un support vector qualsiasi.
- **9** (cap. 14): Net-5 al 98,4% (errore 1,6%).
- **10** (cap. 15): derivate ∂F_i/∂h_{i−1}, M − l fattori, Jacobiano definito in una frase.
- **11** (cap. 16): H con una riga per esempio, dimensioni dichiarate, uscita o(x) = (w^out)ᵀ f(Wx).
- **12** (cap. 18): τ(h(t−1), x(t)) in tutto il capitolo.
- **13, 14** (cap. 19): l'inferenza su ‖W‖ > 1 ora dice ciò che il limite superiore permette di dire, e spiega la
  tensione con la contrattività; i pesi della GraphESN sono W_in e Ŵ, uguali a ogni iterazione.
- **17** (cap. 4): detto esplicitamente che con target 0/1 la soglia naturale è 0,5.
- **18** (cap. 8): spiegato come stanno insieme "resiste all'overfitting" e "soffre con dati rumorosi".
- **19** (cap. 5): riquadro sul λ della regola di weight decay (vale η volte quello della loss).
- **20** (cap. 1): etichette "minimo" e "−∇f" separate.

Corretti anche, dalla sezione 4: il simbolo E_P spiegato (due fonti di casualità) e l'indipendenza nel termine misto
(cap. 8); i puntini "+ …" nella backpropagation spiegati e O(#W) contro O(#W²) spiegato alla prima occorrenza
(cap. 11); "Random Forest (o Extremely Randomized Trees)" separati e pro/contro distinti (cap. 16); la frase
rovesciata sul teorema di Vapnik nel soft margin (cap. 13); la parità con log n livelli di XOR, cioè 2 log n strati di
porte (cap. 15); la derivazione on-line → batch del K-means rifatta annullando la derivata del cluster (cap. 17).

### 8.2 Notazione

| Grandezza | Prima | Ora |
|---|---|---|
| target | `d`, `y`, `t` | `d` ovunque (`y` resta solo come secondo vettore generico, ad esempio in k(x, y)) |
| numero di esempi | `l` e `N` | `l` ovunque; nel cap. 7 i punti da frammentare sono `m` |
| dimensione dell'input | `n`, `m`, `m₀` | `n`; la dimensione dello spazio delle feature è `n_Φ` |
| numero di fold | `K` e `R` | `K` |
| coefficiente di correlazione | `R` | `r` (con `R²` come nome usuale); il residuo è `e_i` |
| stato di una RNN | `x` (input `l(t)` o `u(t)`) | stato `h(t)`, input `x(t)`, uscita `o(t)` |
| etichetta di un nodo (cap. 19) | `l(v)`, `L_v`, `L_j(v)` | `x_v`; strati fino a `L`; Laplaciano `𝓛`; pooling `χ` |
| GCN e GraphConv | convenzioni opposte | entrambe con la matrice H (una riga per nodo) |
| costante del kernel | `α` | `c` |
| distorsione (cap. 17) | `d(x, w)` | `dist(x, w)` |
| training set (cap. 11) | `(x¹, d¹)` | `(x₁, d₁)` |

La tabella della notazione nella Guida (capitolo 0) è aggiornata; i capitoli 13, 18 e 19 hanno un riquadro
"Notazione" in apertura.

### 8.3 Leggibilità

Stesso calcolo per entrambe le versioni. Rispetto alla sezione 1 ho corretto lo script in un punto: anche le formule
in ambiente `equation`/`align`/`gather` contano come fine frase, come già quelle in `\[ \]`; per questo il valore
della versione 1 qui è 57,5 invece di 57,3.

| Cap. | Gulpease v1 | Gulpease v2 | Frasi > 30 parole v1 | v2 |
|---|---:|---:|---:|---:|
| 1 | 63,6 | 66,4 | 7,3% | 0% |
| 2 | 54,8 | 61,5 | 7,4% | 0% |
| 3 | 61,1 | 64,9 | 7,5% | 0% |
| 4 | 64,0 | 65,4 | 2,5% | 0% |
| 5 | 58,2 | 61,5 | 3,1% | 0% |
| 6 | 59,2 | 64,6 | 10,8% | 0% |
| 7 | 58,4 | 64,2 | 10,8% | 0,7% |
| 8 | 60,3 | 64,4 | 6,2% | 0,8% |
| 9 | 59,4 | 64,9 | 10,6% | 0,4% |
| 10 | 61,5 | 65,8 | 8,0% | 0% |
| 11 | 61,4 | 64,5 | 6,2% | 0% |
| 12 | 55,3 | 63,5 | 13,4% | 0% |
| 13 | 61,4 | 67,2 | 10,3% | 0% |
| 14 | 53,3 | 61,8 | 15,9% | 0% |
| 15 | 50,3 | 59,0 | 20,2% | 0% |
| 16 | 50,9 | 58,8 | 14,0% | 0% |
| 17 | 54,4 | 62,4 | 11,2% | 0% |
| 18 | 54,3 | 62,4 | 16,0% | 0% |
| 19 | 51,3 | 61,0 | 18,2% | 0,6% |
| **Totale** | **57,5** | **63,4** | — | — |

Parole per frase in media: da 15,6 a 12,1. Il metodo è stato spezzare le frasi lunghe e trasformare in elenchi le
enumerazioni dentro una frase; il contenuto è lo stesso. Le parole sono passate da 38 225 a 40 079 (+5%) per le
congiunzioni e i soggetti che lo spezzare richiede, e per le spiegazioni brevi elencate sotto.

### 8.4 Spiegazioni brevi aggiunte

Sono aggiunte nel senso della sezione 0.3, ma solo frasi che spiegano termini già usati: cosa fa il padding (la
domanda d'esame lo chiede, cap. 14) e come si calcola la dimensione della feature map nel caso della figura; il
doppio significato di "kernel" (cap. 14); perché l'errore sul validation set del modello scelto è ottimista (cap. 9);
cos'è lo Jacobiano (cap. 15), la PCA in una riga (cap. 15), "Turing-equivalente", "contrattiva" e "raggio
spettrale" (cap. 18), norma spettrale, costante di Lipschitz, Laplaciano e grado di un nodo (cap. 19); cosa ottiene
la distanza "1 meno una gaussiana" (cap. 17).

### 8.5 Verifiche fatte

- `./build.sh` compila senza errori e senza riferimenti non risolti; 159 pagine.
- Riguardate a schermo le figure toccate: 1.1, 2.5, 5.7 (L1/L2) e le tabelle 5.1 e 5.2.
- Rigenerando `dati/` con lo script, gli altri file di dati non cambiano (stesse versioni delle librerie).
