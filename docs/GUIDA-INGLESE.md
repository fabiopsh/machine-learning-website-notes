# Guida: la versione inglese del sito

Il sito è bilingue: l'italiano è l'originale (e resta la fonte di verità, insieme agli appunti), l'inglese è una
**traduzione fedele** della pagina italiana. Questa guida dice come è fatta e come si traduce (o si aggiorna) una
lezione. Lezione modello: la 02 (`lessons-en/02-curricula.mdx`, `widgets/l02/*`).

---

## 1. Come funziona

- **Lingua** (`website/src/lib/i18n.ts`): decisa da `index.html` prima del primo paint (`<html lang>`): parametro
  `?lang=en`, poi la scelta salvata (`localStorage['ml-lang']`), poi la lingua del browser (italiano → italiano,
  qualsiasi altra → inglese). **Non cambia durante la sessione**: il selettore `IT | EN` nella barra in alto salva la
  scelta e ricarica la pagina sulla sezione che si stava leggendo. Per questo `tx()` funziona ovunque, anche nelle
  costanti a livello di modulo.
- **`tx(it, en)`**: restituisce il primo argomento in italiano, il secondo in inglese. Vale per stringhe, JSX,
  numeri, array, oggetti. `isEn`, `lang` e `LOCALE` (`'it-IT'` / `'en-US'`, per `toLocaleString`) sono esportati
  dallo stesso file.
- **Numeri**: `fmt()` e i tick degli assi usano già il separatore giusto (virgola in italiano, punto in inglese).
- **Testo delle lezioni**: `src/content/lessons-en/NN-….mdx`, **stesso nome di file** dell'italiano. Se manca, in
  inglese si vede la lezione italiana.
- **Titoli e riassunti** delle lezioni e delle parti: `src/content/lessons.en.ts`.
- **Glossario**: `src/content/glossary-en/lNN.ts`, un file per lezione, stesse chiavi `id` di `glossary.ts`.
- **Formule e widget**: un solo sorgente per le due lingue, con `tx()` sui testi.
- **Gli id delle sezioni sono gli stessi nelle due lingue** (quelli italiani, assegnati in ordine dal plugin
  `plugins/lesson-index.ts`): i link `#/lezione/07/slug-italiano`, il glossario e gli indirizzi condivisi funzionano
  in entrambe le lingue. Quindi l'MDX inglese deve avere **gli stessi titoli, nello stesso ordine**.
- **Pagine statiche e anteprime**: `en/lezione/NN/` e `en/glossario/` (plugin `seo.ts`), immagini `public/og/en/`.

---

## 2. Regole della traduzione (non negoziabili)

1. **Fedele e completa**: ogni frase, elenco, tabella, riquadro, formula, didascalia, «Prova a…» e domanda d'esame
   dell'italiano c'è anche in inglese, nello stesso ordine. Niente riassunti, niente aggiunte, niente omissioni.
2. **L'italiano non cambia**: nei file condivisi (widget, formule) il testo italiano resta identico, carattere per
   carattere; si aggiunge solo l'inglese. Nessuna modifica a logica, layout, classi CSS, dati.
3. **Inglese naturale**, registro da libro di testo universitario, non una traduzione parola per parola. Ortografia
   **americana** (*generalization*, *color*, *center*, *neighbor*, *modeling*). Il «tu» solo nelle istruzioni delle
   figure, all'imperativo («Drag the point…»).
4. **Notazione del corso intatta**: simboli, pedici, sigle (TR, VL, TS, $l$ per il numero di esempi, $d$ per il
   target, $\eta$, $E_{RMS}$…) e termini che negli appunti sono già in inglese restano come sono.
5. Niente emoji, niente testo di riempimento: stesso stile sobrio dell'originale.

### Tipografia inglese

- Virgolette `“…”` (non `«…»`), apostrofo `’`, trattino lungo ` — ` con gli spazi come nell'originale, puntini `…`.
- Decimali con il **punto**: `2{,}5` → `2.5` nelle formule, `0,5` → `0.5` nel testo. Migliaia con la virgola
  (`100.000` → `100,000`; nelle formule `100{,}000`).
- **Grassetto** e *corsivo* sugli stessi concetti dell'originale. I termini che in italiano erano in corsivo perché
  inglesi (*overfitting*, *weight decay*) in inglese perdono il corsivo, a meno che non sia un'enfasi o un titolo.

### Terminologia (uguale in tutte le lezioni)

| Italiano | Inglese |
|---|---|
| lezione (pagina del sito) · lezione (del corso, «Lezione 5») | lesson · lecture |
| appunti · slide · professore | notes · slides · professor |
| addestramento · apprendimento | training · learning |
| esempio (di training) · pattern · dato/dati | example · pattern · data point/data |
| ipotesi · spazio delle ipotesi | hypothesis · hypothesis space |
| bias induttivo · bias di linguaggio / di ricerca | inductive bias · language / search bias |
| pesi · soglia · unità · strato (nascosto) | weights · threshold · unit · (hidden) layer |
| rete neurale · funzione di attivazione | neural network · activation function |
| discesa del gradiente · passo · tasso di apprendimento | gradient descent · step · learning rate |
| minimi quadrati · equazioni normali | least squares · normal equations |
| errore di training / di validazione / di test | training / validation / test error |
| rischio (empirico) · stima · stimatore | (empirical) risk · estimate · estimator |
| generalizzazione · regolarizzazione · complessità | generalization · regularization · complexity |
| iperparametri · iperpiano · margine | hyperparameters · hyperplane · margin |
| classificatore · regressione · confine di decisione | classifier · regression · decision boundary |
| linearmente separabile · rumore · varianza | linearly separable · noise · variance |
| maledizione della dimensionalità | curse of dimensionality |
| apprendimento supervisionato / non supervisionato | supervised / unsupervised learning |
| retropropagazione | backpropagation |
| campo recettivo · pesi condivisi | receptive field · shared weights |
| vicinato · vicini · grafo · arco · nodo | neighborhood · neighbors · graph · edge · node |
| a.a. · CFU · laurea magistrale | a.y. · ECTS · Master’s degree |
| Sintesi · Idea chiave · Attenzione (etichette, automatiche) | Summary · Key idea · Warning |
| Possibili domande d’esame · traccia di risposta | Possible exam questions · answer outline |
| «Prova a…» · «Come si legge» · «Il ragionamento» | “Try it…” · “How to read it” · “The reasoning” |
| Esercizi · Esempio svolto | Exercises · Worked example |
| trascina · passa sopra · clicca/tocca · cursore | drag · hover over · click/tap · slider |

Per un termine tecnico non in tabella: usare la forma standard della letteratura (Bishop, Hastie-Tibshirani-Friedman,
Goodfellow). Il campo `en` delle voci di `glossary.ts` dà spesso già il termine inglese: usarlo.

---

## 3. Che cosa si traduce per la lezione NN

Quattro cose, e **solo questi file** (ogni lezione ha i suoi: più lezioni si traducono in parallelo senza toccarsi):

| File | Che cosa fare |
|---|---|
| `src/content/lessons-en/NN-….mdx` (nuovo, stesso nome dell'italiano) | traduzione dell'MDX |
| `src/content/formulas/lNN.ts` (se esiste) | `tx()` su `name`, `desc`, `read`, `why` |
| `src/widgets/lNN/*.tsx` e `*.ts` | `tx()` su ogni testo visibile |
| `src/content/glossary-en/lNN.ts` (nuovo, se la lezione ha voci in `glossary.ts`) | traduzione delle voci |

Non toccare: `glossary.ts`, `lessons.ts`, `lessons.en.ts`, i componenti comuni (`components/`, `widgets/common/`,
`lib/`), i CSS, i widget di altre lezioni, i file `docs/`. Se serve una modifica lì (es. un'etichetta che non entra,
un componente comune con testo italiano), **segnalarla nel resoconto** invece di farla.

### 3.1 MDX

- Copiare la struttura dell'originale **riga per riga**: stessi `import` (identici), stessi componenti nello stesso
  ordine con gli stessi attributi non testuali (`n`, `type`, `id`, `kind`, `f`, `size`, `cols`, …), stessi separatori
  `---`, stesso numero di paragrafi per sezione.
- Si traducono: il testo, i titoli `##`/`###`/`####`, gli attributi testuali (`title`, `q`, `label`, `when`, `tag`,
  `kicker`, eventuali testi passati ai widget), il testo dentro `<T id="…">…</T>`, `<Caption>`, le tabelle.
- **Non** si traducono: gli `id` di `<T>`, il `kind` di `<Deep>` (`intuizione`, `come-si-legge`… sono chiavi), i
  link (`#/lezione/07/slug-italiano` resta identico: gli id sono comuni alle due lingue), i nomi dei componenti.
- Formule: identiche all'originale, tranne il testo dentro `\text{…}` (da tradurre) e il separatore decimale.
- Trappole dell'MDX (valgono anche qui): `{` `}` fuori dalle formule sono JavaScript; `<` seguito da una lettera apre
  un tag; il contenuto dei riquadri va tra righe vuote; negli attributi JSX le stringhe sono letterali.

### 3.2 Formule (`formulas/lNN.ts`)

```ts
import { tx } from '../../lib/i18n'
const r = String.raw

export const nome: FormulaDef = {
  name: tx('Iperpiano separatore', 'Separating hyperplane'),
  tex: r`\part{w}{\mathbf{w}}^T\part{x}{\mathbf{x}} + w_0 = 0`,          // una volta sola: non si duplica
  parts: [{ k: 'w', sym: r`\mathbf{w}`, desc: tx(r`vettore dei **pesi**`, r`the **weight** vector`) }],
  read: tx(r`«w trasposto x più w zero uguale a zero».`, r`“w transpose x plus w zero equals zero.”`),
  why: tx(r`Primo paragrafo.

Secondo paragrafo.`, r`First paragraph.

Second paragraph.`),
}
```

`tex` e `sym` si avvolgono in `tx()` solo se contengono `\text{…}` in italiano o una virgola decimale.

### 3.3 Widget (`widgets/lNN/*`)

`import { tx } from '../../lib/i18n'` (anche `LOCALE` se serve) e poi, su **ogni testo che lo studente vede o che un
lettore di schermo legge**:

```tsx
<Slider label={tx('passo', 'step')} … />
<Readout label={tx('errore', 'error')} value={fmt(e, 3)} />            // fmt usa già il separatore giusto
<Tasks items={[{ label: tx('Trascina il punto sopra la retta.', 'Drag the point above the line.'), done: seen.up }]} />
<svg aria-label={tx('Schema della rete', 'Diagram of the network')}>
<text>{tx('uscita', 'output')}</text>
const OPTIONS = [{ value: 'a', label: tx('nessuno', 'none') }]          // anche a livello di modulo

// testo con JSX dentro: i due rami interi
{tx(
  <>Con <Tex>{'M = 9'}</Tex> l’errore è nullo.</>,
  <>With <Tex>{'M = 9'}</Tex> the error is zero.</>,
)}

// frasi composte da pezzi: tradurre la frase intera, non i pezzi (l'ordine delle parole cambia)
{tx(`${n} punti su ${tot} sbagliati`, `${n} of ${tot} points misclassified`)}
```

- Stringhe con decimali scritti a mano: `tx('0,5', '0.5')`, `tx(r`\eta = 0{,}3`, r`\eta = 0.3`)`.
  `.toFixed(2).replace('.', ',')` → usare `fmt(v, 2)` solo se il risultato in italiano resta identico, altrimenti
  `tx(…replace('.', ','), …)`. `toLocaleString('it-IT')` → `toLocaleString(LOCALE)`.
- Singolare/plurale e accordi: scrivere i due rami in ciascuna lingua.
- Non si traducono: commenti, nomi di variabili, classi CSS, `key`, `id`, valori di stato (`'batch'`, `'cur'`),
  token dei colori, nomi propri e sigle (MONK, LMS, ReLU…), testi già in inglese uguali nelle due lingue.
- **Lunghezza**: l'inglese deve stare nello spazio dell'italiano. Nelle etichette SVG, nei pulsanti e nei selettori
  preferire la forma più corta che resta chiara; se un'etichetta è posizionata a mano e l'inglese è più lungo,
  accorciare il testo (non spostare gli elementi, a meno che l'italiano resti identico pixel per pixel).
- I widget di un'altra lezione riusati qui (es. `l04/DataSplit` nella 09) li traduce chi traduce quella lezione.

### 3.4 Glossario (`glossary-en/lNN.ts`)

```ts
import type { GlossaryEn } from '../glossary'

/** Voci del glossario della lezione 05, in inglese (stesse chiavi `id` di glossary.ts). */
const entries: Record<string, GlossaryEn> = {
  'k-nn': {
    term: 'K-nearest neighbors',
    alt: 'K-NN',                               // facoltativo: sigla o sinonimo mostrato accanto
    def: 'Short definition with $math$ and **bold** (TeX backslashes doubled: $\\mathbf{x}$).',
    section: 'Exact English heading of the section',   // il titolo, tradotto, della `section` italiana
  },
}

export default entries
```

Una voce per **ogni** voce di `glossary.ts` con `lesson: 'NN'` (nessuna in più, nessuna in meno). Nelle stringhe
normali di TypeScript ogni barra rovesciata del TeX va raddoppiata, come nell'originale.

---

## 4. Verifica

Da `website/` (il server di sviluppo è su http://localhost:5173):

```bash
npm run check:en -- NN                                   # struttura, formule, glossario, italiano rimasto
npx tsc -p tsconfig.app.json --noEmit --incremental false   # tipi (guardare solo gli errori nei propri file)
npx eslint src/widgets/lNN src/content/formulas/lNN.ts src/content/glossary-en/lNN.ts
npm run figs -- NN --lang en                             # uno screenshot per figura in .shots/NN-fig-N-k-en.png
npm run figs -- NN --lang en --w 390                     # lo stesso su telefono (…-en-m.png)
npm run shot -- lezione/NN en-NN --lang en --pages 40    # (facoltativo) tutta la pagina a schermate
```

- `check:en`: gli **errori** vanno eliminati tutti; gli **avvisi** vanno riguardati uno per uno (una formula con
  `\text{}` tradotto o un nome proprio italiano sono falsi allarmi; una frase mancante no).
- Gli screenshot **vanno guardati tutti**, desktop e telefono: testo ancora in italiano, etichette che si
  sovrappongono o escono dal riquadro, pulsanti andati a capo, tabelle sformate. `figs` segnala anche i testi che
  escono dal proprio contenitore. Per vedere testi che compaiono solo dopo un'interazione, rileggere il codice.
- Mai modificare file con TeX o `\n` da uno script nella shell (le barre rovesciate e gli apici inversi si
  perdono): usare gli strumenti di modifica dei file.
- `npm run verify` (tipi + lint + contenuti italiani) deve restare pulito a lavoro finito.

## 5. Quando cambia l'italiano

Ogni modifica a una lezione italiana va riportata nella traduzione (MDX inglese, ramo inglese dei `tx()`, glossario)
nella stessa sessione; `npm run check:en` segnala struttura e formule non più allineate. Dopo un cambio di titolo o
di `summary` aggiornare anche `lessons.en.ts` e rilanciare `npm run og`.
