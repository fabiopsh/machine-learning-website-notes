# Machine Learning — appunti interattivi

Repository degli appunti del corso di Machine Learning (654AA, Prof. Alessio Micheli, UniPi, a.a. 2026/27)
e del sito che li rende interattivi. Rispondere all'utente in italiano.

## Cosa c'è

- `notes/Appunti/NN - Titolo.md` + `notes/Appunti/assets/` — **fonte di verità** dei contenuti (21 lezioni).
- `website/` — il sito: Vite + React 19 + TypeScript + MDX + KaTeX, routing a hash, pubblicato su
  GitHub Pages (https://fabiopsh.github.io/machine-learning-website-notes/) da `.github/workflows/deploy.yml`.
- `docs/GUIDA-LEZIONI.md` — **come si converte una lezione** (regole, procedura, componenti, stile, verifica).
- `docs/GUIDA-INGLESE.md` — **come funziona e come si aggiorna la versione inglese** (selettore IT | EN, `tx()`, `lessons-en/`).
- `docs/GUIDA-SEMPLICE.md` — **versione «spiegata semplice»** delle lezioni (oggi 01, 03, 04, 05: `lessons-easy/`, `lessons-easy-en/`) e pagina dei **prerequisiti** (`extra/prerequisiti.mdx`).
- `docs/STATO.md` — lezioni fatte/da fare, immagini → figure, aggiunte rispetto agli appunti.

## Regole fondamentali (dettagli in docs/GUIDA-LEZIONI.md §1)

1. Nessuna informazione al di fuori degli appunti; il testo si può riformulare per chiarezza.
2. Non togliere nulla: ogni frase, riquadro, tabella, formula e domanda d'esame deve esserci.
   Aggiungere (esempi, intuizioni, come si legge) è permesso ma va elencato in `docs/STATO.md`.
3. Ogni immagine degli appunti va **sostituita** da una figura interattiva, mai inclusa come immagine.
4. Stile editoriale sobrio e coerente con le lezioni già fatte: niente "AI slop", niente emoji,
   solo i token di design (`website/src/styles/tokens.css`), temi chiaro/scuro/Liquid Glass sempre funzionanti.
5. Le lezioni si fanno in ordine (05, 06, …) e dopo che l'utente ha confermato lo stile (vedi `docs/STATO.md`).
6. Il sito è bilingue: ogni modifica a una lezione italiana (testo, widget, formule, glossario) va riportata nella
   traduzione inglese nella stessa sessione (`docs/GUIDA-INGLESE.md` §5). Ogni testo visibile nei widget passa da `tx(it, en)`.
7. Se una lezione ha la versione «spiegata semplice», ogni modifica va riportata anche lì (italiano e inglese): stessi titoli,
   formule, esempi e figure dell'originale, testo riscritto con parole facili (`docs/GUIDA-SEMPLICE.md`).

## Per convertire una lezione

Usare la skill `/nuova-lezione NN` (in `.claude/skills/`) oppure seguire a mano `docs/GUIDA-LEZIONI.md` §2.
Prendere come modello le lezioni 01–04 (`website/src/content/lessons/*.mdx`, `website/src/widgets/l0*/`).

## Comandi (da `website/`)

```bash
npm install && npm run dev            # sviluppo su http://localhost:5173
npm run verify                        # typecheck + lint + controllo contenuti
npm run check:math -- NN              # formule degli appunti assenti dal sito (da riguardare a mano)
npm run check:text -- NN              # frasi degli appunti assenti dal sito (da riguardare a mano)
npm run check:en -- NN                # traduzione inglese allineata all'originale (struttura, formule, glossario)
npm run check:easy -- NN              # versione semplice allineata all'originale e alla sua traduzione (è anche in verify)
npm run figs -- NN --lang en          # screenshot di tutte le figure: SOLO se l'utente lo chiede (anche --w 390, --style glass, --mode easy)
npm run smoke -- --only NN            # test nel browser: NON usarlo (lento, l'utente lo ritiene inutile)
npm run shot -- lezione/NN nome --sel "#fig-N-k"   # screenshot in website/.shots/: SOLO se l'utente lo chiede
npm run og                            # rigenera le anteprime dei link (public/og/, schermate del sito: serve npm run dev acceso)
npm run build                         # build di produzione (dist/), con pagine statiche per lezione e sitemap
```

Tutte le 21 lezioni sono convertite (stato in `docs/STATO.md`): restano solo revisioni.

Prima di dichiarare finita una lezione (o una revisione): `npm run verify` pulito (niente `npm run smoke`, su
richiesta dell'utente), `check:math`, `check:text`, `check:en` e `check:easy` riguardati voce per voce, `npm run build` senza errori, `docs/STATO.md` aggiornato.
**Niente screenshot di verifica** (consumano troppi token): si fanno e si guardano solo se l'utente lo chiede esplicitamente.
Pubblicare = commit + push su `main` (solo se l'utente lo chiede).
