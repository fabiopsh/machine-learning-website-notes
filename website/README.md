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
npm run verify    # typecheck + lint + controllo contenuti
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

## Verifica

```bash
npm run verify                          # typecheck + lint + controllo contenuti
npm run smoke                           # test nel browser (con npm run dev attivo)
npm run shot -- lezione/03 nome     # screenshot in .shots/
```

## Aggiungere una lezione

Seguire [`../docs/GUIDA-LEZIONI.md`](../docs/GUIDA-LEZIONI.md) e aggiornare [`../docs/STATO.md`](../docs/STATO.md).
Con Claude Code: `/nuova-lezione 05`.
