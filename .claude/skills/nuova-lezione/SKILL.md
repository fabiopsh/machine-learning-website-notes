---
name: nuova-lezione
description: Converte una lezione degli appunti di Machine Learning (notes/Appunti/NN - ….md) in una pagina interattiva del sito in website/, con lo stesso stile, le stesse regole e le stesse verifiche delle lezioni già fatte. Usare quando l'utente chiede di aggiungere, implementare, convertire o proseguire con una lezione (es. "/nuova-lezione 05", "fai la lezione 6", "procedi con le lezioni successive").
---

# Nuova lezione

L'argomento è il numero della lezione (due cifre, es. `05`). Se manca, prendere la prima lezione
«da fare» in `docs/STATO.md`. Se l'utente chiede più lezioni, farle **una alla volta**, completando
tutti i passi (verifica compresa) prima di passare alla successiva.

## Prima di scrivere codice

1. Leggere per intero `docs/GUIDA-LEZIONI.md` e `docs/STATO.md`. Se in `STATO.md` lo stile non risulta
   confermato dall'utente, chiedere conferma prima di procedere.
2. Leggere per intero gli appunti `notes/Appunti/NN - ….md`.
3. Aprire e **guardare** ogni immagine `notes/Appunti/assets/NN-*.png` referenziata negli appunti.
4. Rileggere almeno una lezione già fatta per allinearsi al tono (es. `website/src/content/lessons/03-concetti.mdx`)
   e aprire i widget più simili a quelli che servono (tabella «Esempi da cui partire» nella guida, §6).
5. Stendere un piano breve: per ogni immagine il widget che la sostituisce; formule con anatomia;
   termini del glossario; approfondimenti da aggiungere.

## Realizzazione (guida §2–§7)

- `website/src/content/lessons/NN-nome.mdx` — tutto il testo, nessuna informazione tolta o inventata.
- `website/src/content/formulas/lNN.ts`, voci in `website/src/content/glossary.ts`.
- `website/src/widgets/lNN/*.tsx` + `website/src/styles/lNN.css` (importato in `website/src/main.tsx`).
- `eyebrow` e `summary` della lezione in `website/src/content/lessons.ts`.

## Verifica (obbligatoria, guida §9)

```bash
cd website
npm run verify                    # deve essere pulito; leggere anche gli AVVISI di check
npm run dev                       # in background
```

Poi screenshot di ogni figura in chiaro, scuro, `--style glass` e mobile (`--w 390 --h 844 --dpr 2`),
più la pagina intera (`--pages 40`): **guardarli tutti** e correggere sovrapposizioni, testi tagliati,
contrasti, «Prova a…» già spuntati all'apertura.

## Chiusura

- Aggiornare `docs/STATO.md`: riga della lezione (✅, eyebrow, figure), mappa immagini → figure,
  elenco delle aggiunte rispetto agli appunti.
- Riassumere all'utente: figure create, aggiunte fatte (da rivedere), eventuali dubbi.
- Commit (messaggio in inglese, stile conventional commits) e push su `main` **solo se l'utente lo chiede**:
  il push pubblica il sito tramite GitHub Actions.
