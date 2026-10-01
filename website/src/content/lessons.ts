import type { MDXContent } from 'mdx/types'
import lessonIndex from 'virtual:lesson-index'

export type LessonMeta = {
  id: string
  title: string
  /** etichetta sopra il titolo: a quali lezioni del corso corrisponde */
  eyebrow?: string
  /** una riga per la home */
  summary?: string
  load?: () => Promise<{ default: MDXContent }>
}

export type LessonPart = { roman: string; title: string; lessons: LessonMeta[] }

const loaders = import.meta.glob<{ default: MDXContent }>('./lessons/*.mdx')
function loaderFor(id: string) {
  const key = Object.keys(loaders).find((k) => k.startsWith(`./lessons/${id}-`))
  return key ? loaders[key] : undefined
}

function L(id: string, title: string, extra: Omit<LessonMeta, 'id' | 'title' | 'load'> = {}): LessonMeta {
  return { id, title, ...extra, load: loaderFor(id) }
}

export const parts: LessonPart[] = [
  {
    roman: 'I',
    title: 'Fondamenti',
    lessons: [
      L('01', 'Introduzione al Machine Learning', {
        eyebrow: 'Lezione 1',
        summary: 'Che cos’è il ML, perché è una necessità, come funziona il corso e i richiami matematici che serviranno sempre.',
      }),
      L('02', 'Il ML nei curricula della magistrale', {
        eyebrow: 'Intermezzo',
        summary: 'Dove si colloca il corso nella Laurea Magistrale in Informatica e perché affiancarlo a Computational Mathematics.',
      }),
      L('03', 'Concetti fondamentali del ML', {
        eyebrow: 'Lezioni 2–3',
        summary: 'Dati, task, modello, algoritmo, validazione: gli ingredienti di un sistema di ML, il bias induttivo e le funzioni di loss.',
      }),
      L('04', 'Generalizzazione e validazione', {
        eyebrow: 'Lezione 4',
        summary: 'Underfitting e overfitting sul fitting polinomiale, il VC-bound, hold-out e K-fold, matrice di confusione e curva ROC.',
      }),
    ],
  },
  {
    roman: 'II',
    title: 'Modelli lineari e reti neurali',
    lessons: [
      L('05', 'Modelli lineari e K-nearest neighbors', {
        summary: 'Regressione e classificazione lineare con LMS, equazioni normali e discesa del gradiente, regolarizzazione; poi il K-NN, il classificatore di Bayes e la maledizione della dimensionalità.',
      }),
      L('06', 'Reti neurali (parte 1) — dal neurone al MLP', {
        summary: 'Dal neurone biologico al Perceptron e al suo teorema di convergenza, le sigmoidi, il Multi-Layer Perceptron come espansione in basi adattiva e approssimatore universale.',
      }),
      L('07', 'Note sulla backpropagation', {
        summary: 'La derivazione completa della backpropagation: il delta di ogni unità, la retropropagazione dall’uscita agli strati nascosti, il ciclo di addestramento e il suo costo lineare.',
      }),
      L('08', 'Reti neurali (parte 2) — addestramento in pratica', {
        summary: 'Come si addestra davvero un MLP: inizializzazione, on-line/batch/mini-batch, learning rate e momentum, early stopping e weight decay, Cascade Correlation, input e output, il benchmark MONK.',
      }),
    ],
  },
  {
    roman: 'III',
    title: 'Validazione e teoria',
    lessons: [
      L('09', 'Validazione (parte 1) — model selection e assessment', {
        summary: 'Perché le stime sbagliano: model selection contro model assessment, il controesempio del target casuale, grid e random search, K-fold CV, campionamento e misure d’errore.',
      }),
      L('10', 'Validazione (parte 2) — schemi formali', {
        summary: 'Rischio e rischio empirico, poi gli schemi rigorosi: model selection e model assessment con hold-out e K-fold CV, e come combinarli (TR–VL–TS, CV + test, double CV).',
      }),
      L('11', 'Validazione (parte 3) — errori tipici e FAQ', {
        summary: 'Gli errori più frequenti: epoche fisse, early stopping nella CV, inizializzazioni casuali, selezione sequenziale, test usato per riprogettare, CV in overfitting; quale CV scegliere ed esempi.',
      }),
      L('12', 'Statistical Learning Theory e VC-dimension', {
        summary: 'Shattering e VC-dimension (le rette nel piano ne hanno 3), VC-dim e numero di parametri, il VC-bound sul rischio e la Structural Risk Minimization su strutture annidate.',
      }),
    ],
  },
  {
    roman: 'IV',
    title: 'SVM ed ensemble',
    lessons: [
      L('13', 'Support Vector Machines', {
        summary: 'Margine massimo e support vector, il problema quadratico (primale e duale), soft margin e variabili slack, kernel e kernel trick, SVM per la regressione con la loss ε-insensitive.',
      }),
      L('14', 'SVM e kernel — aspetti pratici e visione critica', {
        summary: 'Pregi e difetti delle SVM, i risultati sul problema delle due classi, il ruolo critico di C e dei parametri del kernel, i luoghi comuni da sfatare e i metodi kernel come misure di similarità.',
      }),
      L('15', 'Bias-varianza ed ensemble', {
        summary: 'L’errore atteso sui training set scomposto in varianza, bias² e rumore, il ruolo di λ nel compromesso, poi gli ensemble: comitati, bagging e boosting, e cenni di feature selection.',
      }),
    ],
  },
  {
    roman: 'V',
    title: 'Deep learning e oltre',
    lessons: [
      L('16', 'Reti neurali convoluzionali (CNN)', {
        summary: 'Connessioni locali, pesi condivisi, pooling e molti strati: la convoluzione 1D e 2D, il campo recettivo che cresce con la profondità, le reti di LeCun, MNIST, AlexNet e ImageNet.',
      }),
      L('17', 'Deep learning', {
        summary: 'Perché molti strati: astrazione gerarchica, no-flattening e composizionalità; representation learning, autoencoder e transfer learning; rappresentazioni distribuite; le tecniche: ReLU, clipping, batch normalization, dropout.',
      }),
      L('18', 'Reti neurali randomizzate'),
      L('19', 'Apprendimento non supervisionato — K-means e SOM'),
      L('20', 'Reti neurali ricorrenti (RNN)'),
      L('21', 'Apprendimento su dati strutturati e grafi'),
    ],
  },
]

export const lessons: LessonMeta[] = parts.flatMap((p) => p.lessons)
export const availableLessons = lessons.filter((l) => l.load)

export function getLesson(id: string) {
  return lessons.find((l) => l.id === id)
}

export function partOf(id: string) {
  return parts.find((p) => p.lessons.some((l) => l.id === id))
}

export function neighbours(id: string) {
  const i = availableLessons.findIndex((l) => l.id === id)
  return { prev: i > 0 ? availableLessons[i - 1] : undefined, next: i >= 0 ? availableLessons[i + 1] : undefined }
}

export function lessonStats(id: string) {
  const entry = lessonIndex[id]
  if (!entry) return undefined
  return {
    minutes: Math.max(3, Math.round(entry.words / 190)),
    figures: entry.figures.length,
    headings: entry.headings,
  }
}

export { lessonIndex }
