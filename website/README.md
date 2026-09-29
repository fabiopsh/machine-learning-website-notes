# Machine Learning — appunti interattivi

Sito degli appunti del corso di Machine Learning (654AA, Prof. Alessio Micheli, Università di Pisa).
Le lezioni seguono gli appunti in `../notes/Appunti`; le figure delle slide sono ricostruite come
widget interattivi.

## Comandi

```bash
npm install
npm run dev       # sviluppo su http://localhost:5173
npm run build     # typecheck + build statica in dist/
npm run preview   # serve la build
npm run lint
```

Il routing usa l'hash (`#/lezione/03/...`) e `base: './'`: la cartella `dist/` funziona su qualsiasi
hosting statico, anche in una sottocartella.

## Struttura

```
src/
  content/
    lessons/NN-nome.mdx   testo delle lezioni (MDX: markdown + componenti)
    formulas/lNN.ts       formule "spiegabili" (simboli, lettura, ragionamento)
    glossary.ts           glossario: definizioni brevi + sezione in cui sono spiegate
    lessons.ts            elenco delle lezioni e parti del corso
  widgets/lNN/            figure interattive di ogni lezione
  widgets/common/         superficie 3D, curve di livello
  components/
    plot/                 mini-libreria di grafici SVG (assi, curve, maniglie trascinabili)
    prose/                riquadri, formule, termini, figure, domande d'esame
    shell/                sidebar, barra in alto, indice, ricerca (Ctrl/⌘ K)
    ui/                   controlli (slider, segmented, toggle, pulsanti)
  styles/                 token di design, tipografia, componenti, stili per lezione
plugins/lesson-index.ts   indice di titoli e figure generato a build time (ricerca, indice)
```

## Aggiungere una lezione

1. Creare `src/content/lessons/NN-nome.mdx` (il prefisso `NN` è l'id della lezione): diventa
   disponibile da sola nell'indice, nella sidebar e nella ricerca.
2. Nell'MDX sono già disponibili, senza import: `Lead`, `Callout`, `Deep`, `Formula`, `T` (termine del
   glossario), `Tex`, `Figure` + `Caption`, `Exam` + `Q`, `Timeline`/`Event`, `Steps`/`Step`,
   `Cards`/`Card`. I widget si importano in cima al file.
3. Le formule con anatomia vanno in `src/content/formulas/lNN.ts` (le parti si marcano con
   `\part{chiave}{...}`), i termini nuovi in `src/content/glossary.ts` (il campo `section` è il titolo
   esatto della sezione).
4. Le figure si numerano a mano (`<Figure n="5.3" ...>`); l'ancora è `#fig-5-3`.
