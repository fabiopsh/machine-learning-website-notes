# Machine Learning — appunti interattivi

Repository degli appunti del corso di Machine Learning (654AA, Prof. Alessio Micheli, UniPi, a.a. 2026/27)
e del sito che li rende interattivi. Rispondere all'utente in italiano.

## Cosa c'è

- `notes/Appunti/NN - Titolo.md` + `notes/Appunti/assets/` — **fonte di verità** dei contenuti (21 lezioni).
- `website/` — il sito: Vite + React 19 + TypeScript + MDX + KaTeX, routing a hash, pubblicato su
  GitHub Pages (https://fabiopsh.github.io/machine-learning-website-notes/) da `.github/workflows/deploy.yml`.
- `docs/GUIDA-LEZIONI.md` — **come si converte una lezione** (regole, procedura, componenti, stile, verifica).
- `docs/STATO.md` — lezioni fatte/da fare, immagini → figure, aggiunte rispetto agli appunti.

## Regole fondamentali (dettagli in docs/GUIDA-LEZIONI.md §1)

1. Nessuna informazione al di fuori degli appunti; il testo si può riformulare per chiarezza.
2. Non togliere nulla: ogni frase, riquadro, tabella, formula e domanda d'esame deve esserci.
   Aggiungere (esempi, intuizioni, come si legge) è permesso ma va elencato in `docs/STATO.md`.
3. Ogni immagine degli appunti va **sostituita** da una figura interattiva, mai inclusa come immagine.
4. Stile editoriale sobrio e coerente con le lezioni già fatte: niente "AI slop", niente emoji,
   solo i token di design (`website/src/styles/tokens.css`), temi chiaro/scuro/Liquid Glass sempre funzionanti.
5. Le lezioni si fanno in ordine (05, 06, …) e dopo che l'utente ha confermato lo stile (vedi `docs/STATO.md`).

## Per convertire una lezione

Usare la skill `/nuova-lezione NN` (in `.claude/skills/`) oppure seguire a mano `docs/GUIDA-LEZIONI.md` §2.
Prendere come modello le lezioni 01–04 (`website/src/content/lessons/*.mdx`, `website/src/widgets/l0*/`).

## Comandi (da `website/`)

```bash
npm install && npm run dev            # sviluppo su http://localhost:5173
npm run verify                        # typecheck + lint + controllo contenuti
npm run smoke -- --only NN            # test nel browser: NON usarlo (lento, l'utente lo ritiene inutile)
npm run shot -- lezione/NN nome --sel "#fig-N-k"   # screenshot in website/.shots/
npm run build                         # build di produzione (dist/)
```

Prima di dichiarare finita una lezione: `npm run verify` pulito (niente `npm run smoke`, su richiesta dell'utente),
screenshot di ogni figura guardati (chiaro, scuro, glass, mobile), `docs/STATO.md` aggiornato.
Pubblicare = commit + push su `main` (solo se l'utente lo chiede).
