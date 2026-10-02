# Guida: la versione «spiegata semplice» e i prerequisiti

Alcune lezioni (oggi 01, 03, 04, 05) hanno una seconda versione di lettura, pensata per chi fa fatica con il
linguaggio degli appunti: stessi argomenti, stesse formule, stessi esempi e stesse figure, ma con il testo riscritto
con parole facili, un passo alla volta, senza dare nulla per scontato. In più c'è una pagina di **prerequisiti**
(`#/prerequisiti`) che spiega da zero la matematica di base.

---

## 1. Come funziona

- **Modalità di lettura** (`website/src/lib/mode.ts`): `full` o `easy`, salvata in `localStorage['ml-mode']`. Non
  ricarica la pagina. Vale solo per le lezioni che hanno la versione semplice (`hasEasy(id)` in `content/lessons.ts`).
- **Dove si attiva**: riquadro con l'icona del neonato in cima alla lezione (`.easy-box` in `LessonPage.tsx`) e
  pulsante con la stessa icona nella barra in alto. Cambiando versione si resta sulla sezione che si stava leggendo.
  In home le lezioni che ce l'hanno sono marcate con l'icona.
- **Testo**: `src/content/lessons-easy/NN-….mdx` (italiano) e `src/content/lessons-easy-en/NN-….mdx` (inglese),
  **stesso nome di file** della lezione originale. Basta creare il file: la lezione mostra da sola il pulsante.
- **Id delle sezioni**: gli stessi della lezione originale (plugin `plugins/lesson-index.ts`), quindi indice, link e
  glossario funzionano in tutte le versioni.
- **Prerequisiti**: `src/content/extra/prerequisiti.mdx` e `src/content/extra-en/prerequisiti.mdx`. La pagina è
  impaginata come una lezione con id `prerequisiti` (route `#/prerequisiti/slug-sezione`), ma sta fuori dall'elenco
  delle lezioni: è raggiungibile dalla sidebar, dalla home («Prima di cominciare») e dalla ricerca. Le sue figure
  sono numerate `P.1`, `P.2`, … e i suoi widget stanno in `src/widgets/pre/`.

---

## 2. Regole della versione semplice

1. **Non si toglie nulla**: ogni titolo, frase, elenco, tabella, riquadro, formula, esempio, figura (con la stessa
   didascalia) e domanda d'esame dell'originale c'è anche qui. Gli `import` sono identici e i **titoli sono identici**,
   nello stesso ordine.
2. **Si riscrive la teoria**: frasi brevi, una idea per frase; ogni termine tecnico o inglese spiegato tra parentesi
   la prima volta; elenchi al posto di periodi lunghi; i conti svolti un passo alla volta.
3. **Ogni formula importante è seguita da «In parole semplici.»** che dice che cosa fa, pezzo per pezzo, e dove serve
   da un esempio con i numeri.
4. **Paragoni di tutti i giorni** dove aiutano (lo studente che impara a memoria, la discesa in montagna con la
   nebbia), senza tono infantile: lo stile resta sobrio, niente emoji.
5. **Rimandi ai prerequisiti** al primo uso di un concetto di base: `[derivata](#/prerequisiti/la-derivata)`.
6. Le aggiunte restano dentro ciò che spiegano gli appunti: chiarimenti sì, argomenti nuovi no. Vanno elencate in
   `docs/STATO.md`.
7. La traduzione inglese segue `GUIDA-INGLESE.md` §2 (fedele, stessa struttura riga per riga della versione semplice
   italiana).

Se cambia la lezione originale, vanno aggiornate anche le due versioni semplici.

---

## 3. Verifica

```bash
npm run check:easy [-- NN]     # anche dentro npm run verify
npm run build                  # compila tutti gli MDX
```

`check:easy` dà **errore** se: import o titoli diversi dall'originale; manca una figura, una didascalia, una
`<Formula>`, un widget, un riquadro o una domanda d'esame; un link a una sezione (`#/lezione/NN/…`,
`#/prerequisiti/…`) non esiste; la versione inglese non ha la stessa struttura di quella italiana. Dà **avvisi** (da
riguardare a mano) per le formule dell'originale non trovate alla lettera: di solito sono formule spezzate in passaggi.

Gli screenshot (`npm run shot -- lezione/03 nome --mode easy`, `npm run figs -- prerequisiti`) si fanno **solo se
l'utente lo chiede**.
