# Guida: convertire una lezione in pagina interattiva

Questa guida descrive **esattamente** come sono state costruite le lezioni 01–04, così che qualsiasi
sessione (umana o AI, su qualsiasi computer) produca le lezioni successive con lo stesso stile.
Leggerla tutta prima di iniziare. Lo stato dei lavori è in [`STATO.md`](STATO.md).

---

## 0. Preparazione

```bash
git clone https://github.com/fabiopsh/machine-learning-website-notes.git
cd machine-learning-website-notes/website
npm install
npm run dev          # http://localhost:5173
```

Per gli script di verifica con screenshot serve Chrome o Edge installato (altrimenti impostare
`CHROME_PATH`). Gli screenshot finiscono in `website/.shots/` (ignorata da git): **vanno guardati**,
è l'unico modo di verificare davvero una figura.

Fonti di una lezione:
- `notes/Appunti/NN - Titolo.md` — **la fonte di verità** (Markdown stile Obsidian);
- `notes/Appunti/assets/NN-*.png` — le immagini da sostituire con figure interattive;
- `notes/slides/`, `notes/newSlides/` — le slide originali, solo per capire meglio un'immagine;
- `notes/Latex*` e i PDF sono derivati dagli appunti: non servono.

---

## 1. Regole sui contenuti (non negoziabili)

1. **Nessuna informazione al di fuori degli appunti.** Il testo può essere riformulato per chiarezza,
   ma i fatti vengono solo dagli appunti (o dal materiale del corso nella cartella `notes/`).
2. **Non togliere niente.** Ogni frase, elenco, tabella, riquadro, formula e domanda d'esame degli
   appunti deve esserci. Si procede paragrafo per paragrafo. `npm run check` aiuta (titoli, riquadri,
   immagini, domande), ma non sostituisce la rilettura.
3. **Aggiungere è permesso**, purché corretto e coerente con il corso: esempi svolti, intuizioni,
   «come si legge», tracce di risposta. Ogni aggiunta va elencata in `STATO.md` → «Aggiunte».
4. **Ogni immagine degli appunti va sostituita** da una figura interattiva costruita sul web (mai
   inserita come `<img>`). La corrispondenza va scritta in `STATO.md`. Se un'immagine davvero non si può
   ricostruire (es. una fotografia), motivarlo in `STATO.md` e ricostruirne almeno lo schema.
5. **Mai "AI slop"**: niente emoji, niente gradienti viola decorativi, niente testo di riempimento,
   niente titoli urlati. Il sito ha uno stile editoriale sobrio (vedi §8): va rispettato.
6. Lingua: italiano, registro chiaro e didattico, dando del «tu» solo nelle istruzioni delle figure.

---

## 2. Procedura (checklist per la lezione NN)

1. Leggere **tutto** `notes/Appunti/NN - ….md` e guardare **ogni** immagine `assets/NN-*.png`
   (aprirle davvero). Per ogni immagine decidere il widget (§6) e annotarlo.
2. Creare `website/src/content/lessons/NN-nome-breve.mdx` (il prefisso `NN` è l'id: la lezione diventa
   automaticamente disponibile in indice, sidebar, ricerca e pager).
3. In `website/src/content/lessons.ts` aggiungere alla voce `L('NN', …)` i campi `eyebrow` (a quali lezioni
   del corso corrisponde, es. «Lezione 5» o «Lezioni 6–7»; dedurlo dall'introduzione degli appunti,
   altrimenti ometterlo) e `summary` (una riga per la home, solo contenuti della lezione).
4. Scrivere l'MDX seguendo §3–§5 (struttura, riquadri, formule, termini, figure, domande d'esame).
5. Formule importanti → `website/src/content/formulas/lNN.ts` (§4).
6. Termini nuovi → `website/src/content/glossary.ts` (§5).
7. Widget → `website/src/widgets/lNN/*.tsx`, stili → `website/src/styles/lNN.css`, importato in
   `website/src/main.tsx` dopo gli altri `lNN.css`.
8. Verificare (§9): `npm run verify` e screenshot di ogni figura in chiaro,
   scuro, mobile e tema Liquid Glass. Guardare gli screenshot e correggere.
9. Aggiornare `docs/STATO.md` (riga della lezione, immagini → figure, aggiunte).
10. Commit e push su `main`: la GitHub Action pubblica il sito (§10).

---

## 3. Dal Markdown degli appunti all'MDX

### Struttura della pagina

```mdx
import * as F from '../formulas/lNN'
import { MioWidget } from '../../widgets/lNN/MioWidget'

<Lead>Il paragrafo introduttivo degli appunti (quello subito dopo la riga «Appunti di …»).</Lead>

## Primo titolo degli appunti
...
<Callout type="abstract" title="Sintesi"> ... </Callout>

<Exam>
<Q q="Domanda d’esame 1"> traccia di risposta </Q>
</Exam>
```

- Il titolo della lezione e la riga «Appunti di Fabio Piscitelli — …» **non** vanno nell'MDX: li mostra
  già l'intestazione della pagina.
- I titoli `##`/`###`/`####` si copiano **identici** a quelli degli appunti (stesse parole), con
  apostrofi tipografici (`’`). Le sezioni sono numerate automaticamente (§ 1, 1.1…).
- I separatori `---` degli appunti si mantengono (servono al ritmo della pagina).

### Corrispondenze

| Appunti (Obsidian) | MDX |
|---|---|
| `> [!definition] Titolo` | `<Callout type="definition" title="Titolo">` |
| `> [!theorem]`, `[!example]`, `[!note]`, `[!tip]`, `[!warning]`, `[!abstract]` | stesso `type` |
| `> [!question] Possibili domande d'esame` | `<Exam>` con un `<Q q="…">` per domanda + traccia di risposta |
| `> [!question] Esercizi …` (altre domande) | `<Callout type="question" label="Esercizi" title="…">` |
| `![alt](assets/…png)` + didascalia `*Fig. …*` | `<Figure n="N.k" title="…"><Widget /><Caption>…</Caption></Figure>` |
| `[[07 - Note sulla backpropagation]]` | `[testo](#/lezione/07)` oppure `#/lezione/07/slug-sezione` |
| formula `$$…$$` importante | `<Formula f={F.nome} />` (§4); formule minori restano `$$…$$` |
| primo uso di un termine chiave | `<T id="…">testo</T>` (§5) |

Il contenuto dei riquadri va **tra righe vuote** (altrimenti il Markdown dentro non viene interpretato):

```mdx
<Callout type="definition" title="Overfitting">

Testo con **grassetto** e $formule$.

</Callout>
```

### Aggiunte didattiche (dove servono, senza esagerare: 2–5 per lezione)

```mdx
<Deep title="Perché con 10 punti l’errore è zero?" kind="intuizione">

Spiegazione aggiuntiva (si apre solo se lo studente la chiede).

</Deep>
```

`kind`: `approfondimento` · `intuizione` · `dimostrazione` · `esempio` (esempio svolto) · `come-si-legge`.

Blocchi disponibili senza import: `Lead`, `Callout`, `Deep`, `Formula`, `T`, `Tex`, `Figure`, `Caption`,
`Exam`, `Q`, `Timeline` + `Event` (cronologie), `Steps` + `Step` (procedure in fasi), `Cards` + `Card`
(2–4 schede brevi, `cols={n}`). Vedi le lezioni 01–04 come esempi d'uso.

### Tipografia del testo

- Apostrofi `’`, virgolette `«…»`, trattino lungo ` — ` con spazi, puntini `…`.
- Decimali con la virgola; dentro le formule scrivere `2{,}5` (con le graffe, altrimenti KaTeX
  aggiunge uno spazio).
- **Grassetto** per i concetti chiave (come negli appunti), *corsivo* per termini inglesi e titoli.

### Trappole dell'MDX

- `{` e `}` fuori dalle formule sono espressioni JavaScript: non usarli nel testo normale.
- `<` seguito da una lettera apre un tag JSX: nel testo scrivere «minore di» o metterlo in una formula.
- Niente commenti HTML `<!-- -->` (usare `{/* … */}`).
- Negli attributi JSX le stringhe sono letterali: `<Q q="perché $-\nabla f$ …">` funziona (il `\n` resta
  `\n` per KaTeX).
- La versione di `katex` in `package.json` deve essere **la stessa** usata da `rehype-katex`
  (oggi 0.16.47): con versioni diverse simboli come `\ne` e gli apici si rompono.

---

## 4. Formule «che si spiegano»

In `website/src/content/formulas/lNN.ts` (vedi `l01.ts`, `l03.ts`, `l04.ts`):

```ts
import type { FormulaDef } from '../../components/prose/Formula'
const r = String.raw

export const nome: FormulaDef = {
  name: 'Nome breve',                       // etichetta sotto la formula
  tex: r`\part{w}{\mathbf{w}}^T\part{x}{\mathbf{x}} + w_0 = 0`,
  parts: [                                  // simboli spiegati al passaggio del mouse
    { k: 'w', sym: r`\mathbf{w}`, desc: r`vettore dei **pesi** …` },
    { k: 'x', sym: r`\mathbf{x}`, desc: r`un punto dello spazio degli input` },
  ],
  read: r`«w trasposto x più w zero uguale a zero».`,        // come si legge ad alta voce
  why: r`Il ragionamento dietro la formula. Due paragrafi separati da una riga vuota.

Secondo paragrafo.`,
}
```

- `\part{chiave}{…}` marca una parte spiegabile (diventa `\htmlClass{fx-chiave}`).
- `desc`, `read`, `why` accettano `$math$`, `**grassetto**`, `*corsivo*`.
- Usare l'anatomia per le formule-chiave (definizioni, risultati principali): 3–6 per lezione.
  Le formule che servono solo di passaggio restano `$$…$$` nell'MDX.
- `read` e `why` sono aggiunte didattiche: devono essere corrette e coerenti con gli appunti.

---

## 5. Glossario

In `website/src/content/glossary.ts`, una voce per ogni termine tecnico nuovo della lezione:

```ts
{
  id: 'k-nn',                          // usato in <T id="k-nn">
  term: 'K-nearest neighbors',
  en: 'K-NN',                          // facoltativo: sinonimo / traduzione
  def: 'Definizione breve (1–2 frasi) presa dagli appunti, con $math$ e **grassetto**.',
  lesson: '05',
  section: 'Titolo esatto della sezione',   // deve esistere (npm run check lo verifica)
}
```

- Nel testo si marca con `<T id>` il **primo uso significativo** di un termine in una sezione, non ogni
  occorrenza (6–15 termini per lezione).
- Un termine già definito in una lezione precedente si può marcare di nuovo: il popover rimanda alla
  lezione dove è spiegato.

---

## 6. Figure interattive

### Principi (valgono per ogni figura)

- **Sostituire, non decorare**: la figura deve mostrare esattamente ciò che mostrava l'immagine degli
  appunti (stessi elementi, stessi numeri quando indicati), e in più renderlo manipolabile.
- **Una manipolazione principale** chiara (trascinare, uno slider, un selettore) che faccia *vedere* il
  concetto del paragrafo. Niente comandi superflui.
- **Didascalia**: prima frase = la didascalia degli appunti (riformulata ma completa), poi cosa si può
  fare («Trascina…»). Colori citati nella didascalia = colori realmente usati.
- **«Prova a…»** (`<Tasks>`): 2–4 esercizi imperativi che guidano l'osservazione e si spuntano da soli.
  Non devono risultare già fatti all'apertura della pagina.
- Deve funzionare con mouse, touch (maniglie grandi) e tastiera (le `Handle` si muovono con le frecce),
  in tema chiaro, scuro, Liquid Glass e su mobile (360 px).
- Dati deterministici: usare `rng(seed)` da `lib/math.ts`, mai `Math.random()` (le figure devono essere
  riproducibili e uguali per tutti).

### Scheletro di un widget

```tsx
// website/src/widgets/lNN/Esempio.tsx
import { useState } from 'react'
import { Axes, FnPath, Handle, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Controls, Readout, Slider } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

export function Esempio() {
  const [w, setW] = useState(1)
  const [p, setP] = useState({ x: 0.5, y: 0.5 })
  const seen = useLatch({ grande: w > 2 })          // si spunta la prima volta che la condizione è vera
  return (
    <div>
      <Plot xDomain={[0, 1]} yDomain={[-1, 1]} aspect={0.55}>
        <Axes xLabel="x" yLabel="y" />
        <FnPath f={(x) => w * x} color="var(--c-red)" />
        <Handle x={p.x} y={p.y} onMove={setP} label="punto" />
      </Plot>
      <Controls>
        <Slider label={<Tex>{'w'}</Tex>} min={0} max={3} step={0.01} value={w} onChange={setW} format={(v) => fmt(v)} />
        <Readout label="errore" tone="accent" value={fmt(w * 2, 3)} />
      </Controls>
      <Tasks items={[{ label: 'Porta w sopra 2 e osserva…', done: seen.grande }]} />
    </div>
  )
}
```

Nell'MDX:

```mdx
<Figure n="5.3" title="Titolo breve della figura" size="wide">
  <Esempio />
  <Caption>Didascalia con $formule$…</Caption>
</Figure>
```

- `n` = numero progressivo nella lezione (`N.1`, `N.2`, … nell'ordine della pagina, figure aggiunte
  comprese). L'ancora è `#fig-5-3`. `size="wide"` per figure larghe (grafici affiancati, tabelle).
- Stato dei «Prova a…»: `useLatch({...})` per condizioni sullo stato, `useState` impostato nei gestori
  per azioni (clic su un pulsante). **Mai** `setState` dentro `useEffect` (il lint lo blocca).

### Mattoni disponibili (leggere il codice prima di usarli)

| Dove | Cosa |
|---|---|
| `components/plot/Plot.tsx` | `Plot` (scale, `equal` per assi isometrici, `overlay` per tooltip `.ptip`, eventi puntatore), `Axes`, `FnPath` (y = f(x)), `Polyline`, `Dot`, `Arrow`, `Label`, `Handle` (maniglia trascinabile, `axis`, `bounds`, `color`), `usePlot()` per disegni SVG su misura |
| `components/plot/scale.ts` | `fmt(v, cifre)` (virgola decimale, meno tipografico), `clamp`, `niceTicks` |
| `components/ui/Controls.tsx` | `Slider` (con `marks`), `Segmented`, `Toggle`, `Btn` (`ghost`/`soft`/`solid`, `icon`), `Readout` (`tone` = colore della serie), `Legend`, `Controls` (riga di controlli) |
| `components/prose/Figure.tsx` | `Figure`, `Caption`, `Tasks`, `Exam`, `Q` |
| `widgets/common/Surface3D.tsx` | superficie z = f(x,y) su canvas, ruotabile, curve di livello sul pavimento, overlay 3D (`floorGap`, `ramp`) |
| `widgets/common/contours.ts` | curve di livello (marching squares) → path SVG |
| `lib/math.ts` | `rng`, `gauss`, `lstsq` (minimi quadrati generici con QR), `polyfit`, `ridgePolyfit` (Tikhonov), `polyval`, `sse`, `normPdf`, `normCdf`, `mean`, `lerp` |
| `components/plot/svgText.tsx` | `svgScript(base, pedice)` e `subDigits` per pedici/apici veri nel testo SVG |
| `widgets/l06/NetSvg.tsx` | reti a strati in SVG (`layout`, `fullEdges`, nodi con valore, archi pesati con etichette, `hot`, `onNodeClick`), `sigmoid` |
| `widgets/l08/mlp.ts` | MLP a uno strato nascosto addestrato dal vivo: `trainer(cfg, epoche, ogni, conAccuratezza, conCopie)` + `useTrainer`, addestramento progressivo per frame, `restart({…})` |
| `widgets/l05/htf.ts` | il problema a due classi di Hastie-Tibshirani-Friedman (due scenari, K-NN precalcolato, Bayes) |
| `lib/useLatch.ts` | flag «a scatto» per i «Prova a…» |
| `components/ui/Icon.tsx` | icone disegnate a mano (aggiungerne qui, stesso stile: tratto 1.6, griglia 24) |

Classi CSS di impaginazione nelle figure (`styles/widgets.css`): `wbar` (barra sopra il grafico:
selettori + legenda), `wgrid` / `wgrid--even` (grafico + colonna laterale), `wside`, `wpanel` +
`wpanel__title` (riquadro grigio con calcoli), `wmath` (formula nel riquadro), `wnote` (nota piccola),
`verdict verdict--good|warn|bad|info` (esito), `readouts`.

Esempi da cui partire, per tipo di figura:
- curva con parametri e slider → `widgets/l01/GaussianExplorer.tsx`
- punti/rette trascinabili con errori → `widgets/l03/MSEFigure.tsx`, `widgets/l03/LinearSeparator.tsx`
- superficie 3D → `widgets/l01/GradientExplorer.tsx` (e la vista 3D di `LinearSeparator`)
- schema/diagramma cliccabile in SVG → `widgets/l03/MLSystem.tsx`, `widgets/l04/DataSplit.tsx`, `widgets/l01/CourseMap.tsx`
- animazione passo-passo → `widgets/l03/HypothesisSearch.tsx`, `widgets/l04/KFold.tsx`
- più figure che condividono lo stato → `widgets/l04/polyStore.ts` + `PolyLab.tsx`
- tabelle interattive → `widgets/l03/BooleanLearner.tsx`
- metriche da una soglia → `widgets/l04/ConfusionROC.tsx`

### Colori nelle figure (ruoli fissi in tutto il sito)

| Token | Ruolo |
|---|---|
| `--accent` (carminio) | **tutto ciò che si può toccare**: maniglie, slider, elementi selezionati. Mai per i dati |
| `--c-blue` | dati di training / campioni / classe 1 / serie «training» |
| `--c-green` | funzione vera (target), errori-segmento (residui), negativo di un gradiente |
| `--c-red` | modello / ipotesi appresa (curva o retta fittata) |
| `--c-orange` | serie «test», classe 0, gradiente ∇f, seconda serie generica |
| `--c-violet` | combinazioni (somma/bound), curve ROC, terza serie |
| `--ink`, `--ink-2…4` | testo, assi, elementi neutri; `--grid`, `--axis` per griglia e assi |

Regole: linee 2–2,5 px, punti r ≥ 4 con anello `--plot-bg`, griglia sottile; legenda sempre con ≥ 2
serie; il testo non prende il colore della serie; niente colori esadecimali nel codice dei widget
(solo token `var(--…)`), così i temi funzionano da soli.

Testo nelle figure:
- **pedici e apici**: mai `q_max`, `R_emp`, `r^(1/n)` scritti così, e mai lettere Unicode in pedice come
  `ⱼ`, `ᵢ`, `ₖ` (i font del sito non le hanno: escono da un font di ripiego). Nell'HTML (didascalie dei
  controlli, «Prova a…», note) usare `<Tex>{'q_{max}'}</Tex>`; nell'SVG un `<tspan baselineShift="sub"
  fontSize="0.7em">max</tspan>` (`"super"` per gli apici). Le cifre in pedice `₀ ₁ ₂` vanno bene;
- **etichette sopra le linee**: una `Label`/`.plot-label` ha già un alone, ma se una curva le corre accanto
  va spostata dove non passa nulla (controllare anche su mobile, dove il grafico è più stretto);
- l'etichetta dell'asse y (`yLabel`) sta sopra l'asse, a destra dei tick: non serve spazio in più.

---

## 7. Registrare lezione e stili

- `lessons.ts`: `eyebrow` + `summary` sulla voce della lezione (il caricamento è automatico).
- `styles/lNN.css`: solo classi con prefisso del widget (es. `.knn__…`), token per i colori, versione
  scura automatica (i token cambiano da soli). Importarlo in `main.tsx`.
- Se una figura ha bisogno di un colore nuovo, aggiungere un token in `styles/tokens.css` (chiaro e
  scuro) e, se serve un valore diverso, in `styles/glass.css` (glass chiaro e glass scuro).
- Nello stile Liquid Glass i contenitori (`.fig`, riquadri, schede) diventano vetro da soli: nei widget
  usare le classi comuni (`wpanel`, `tasks`, `seg`, `btn`…) invece di stili propri per i riquadri, così
  il vetro si applica senza lavoro in più. `--plot-bg` resta un colore pieno (la superficie 3D lo legge).
- **Ogni widget nuovo nasce già "glass"** (regole in fondo a `styles/glass.css`):
  - riempimenti di riquadri, nodi di schemi SVG, celle e schede → `var(--surface)` (pieno nel classico,
    vetro traslucido nel glass); tinte → `color-mix(in srgb, var(--c-…) 14%, var(--surface))`.
    `--plot-bg` solo per aloni delle etichette, bordo dei punti e maschere che devono coprire linee;
  - **nodi e riquadri disegnati sopra linee** (archi di una rete, frecce, un asse che li attraversa, un
    riquadro del peso sul proprio arco) → `var(--surface-solid)`, anche nelle tinte
    (`color-mix(…, var(--surface-solid))`): `--surface` nel glass è traslucido e lascerebbe vedere la linea
    sotto. Stesso motivo per `--accent-soft` (traslucido in tutti i temi): per un nodo evidenziato usare
    `color-mix(in srgb, var(--accent) 10%, var(--surface-solid))`;
  - i grafici con `<Axes>` hanno già la lastra di vetro (`.axes__frame`), niente da fare;
  - blocchi colorati HTML (barre, segmenti, celle piene) → aggiungere la classe del widget alla regola
    «blocchi colorati» di `glass.css` (riflesso `--gloss` + bordo `--gloss-rim`);
  - riquadri SVG → aggiungerli alla regola `rx: 14px` degli schemi; tabelle → come `.bool__table-wrap`;
  - controllare sempre il glass **chiaro e scuro**: un bordo `--glass-edge` è bianco e sparisce sul chiaro
    (per i bordi usare `--line`/`--line-2`).

---

## 8. Design system (riassunto)

- **Carattere**: testo e titoli in *Newsreader* (serif editoriale, corpo 20 px), interfaccia in *Geist*,
  numeri in *Geist Mono*. Non introdurre altri font.
- **Colori**: carta calda + inchiostro + un solo accento carminio (`styles/tokens.css`). Tema scuro con
  gli stessi ruoli. Tema **Liquid Glass** (attivabile dall'utente) con superfici traslucide: i widget
  devono usare i token, mai colori fissi, così restano leggibili in ogni tema.
- **Impaginazione**: colonna di testo di 660 px, figure larghe fino a 800 px, indice a destra ≥ 1380 px,
  sidebar a sinistra ≥ 1024 px, mobile con menu a scomparsa.
- **Riquadri**: definizione/teorema con filetto a sinistra, esempio verde, nota tratteggiata, idea
  chiave ocra, attenzione arancio, sintesi carminio. Etichetta maiuscoletta + icona sottile.
- **Tono**: pulito ed editoriale, ispirato ai libri di testo e agli «explorable explanations». Niente
  emoji, niente effetti vistosi, animazioni brevi e utili.

---

## 9. Verifica

```bash
cd website
npm run verify                       # typecheck + lint + controllo contenuti (tutte le lezioni)
npm run check -- --only NN           # solo la lezione NN (titoli, riquadri, immagini, domande)
npm run dev                          # in un altro terminale, poi:
# npm run smoke esiste ma NON va usato: l'utente lo ritiene lento e inutile (2026-09-30)
npm run shot -- lezione/NN fig --sel "#fig-N-k"                 # una figura
npm run shot -- lezione/NN fig-dark --sel "#fig-N-k" --theme dark
npm run shot -- lezione/NN fig-glass --sel "#fig-N-k" --style glass
npm run shot -- lezione/NN mobile --w 390 --h 844 --dpr 2
npm run shot -- lezione/NN pagina --pages 40                    # tutta la pagina a schermate
npm run build                        # build di produzione
```

Guardare **ogni** screenshot: sovrapposizioni di etichette, testi tagliati, contrasto in scuro/glass,
figure troppo piccole su mobile, «Prova a…» già spuntati all'apertura.

---

## 10. Pubblicazione

Il sito è su **https://fabiopsh.github.io/machine-learning-website-notes/** e si pubblica da solo:
ogni push su `main` che tocca `website/` avvia `.github/workflows/deploy.yml` (build + GitHub Pages).
Si può anche avviare a mano da GitHub → Actions → «Pubblica il sito» → *Run workflow*.
Le route usano l'hash (`#/lezione/05/sezione`), quindi funzionano tutte anche su Pages senza
configurazioni aggiuntive. Dopo il deploy: `npm run smoke -- --base https://fabiopsh.github.io/machine-learning-website-notes/`.
