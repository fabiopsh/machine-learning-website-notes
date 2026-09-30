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
      L('07', 'Note sulla backpropagation'),
      L('08', 'Reti neurali (parte 2) — addestramento in pratica'),
    ],
  },
  {
    roman: 'III',
    title: 'Validazione e teoria',
    lessons: [
      L('09', 'Validazione (parte 1) — model selection e assessment'),
      L('10', 'Validazione (parte 2) — schemi formali'),
      L('11', 'Validazione (parte 3) — errori tipici e FAQ'),
      L('12', 'Statistical Learning Theory e VC-dimension'),
    ],
  },
  {
    roman: 'IV',
    title: 'SVM ed ensemble',
    lessons: [
      L('13', 'Support Vector Machines'),
      L('14', 'SVM e kernel — aspetti pratici e visione critica'),
      L('15', 'Bias-varianza ed ensemble'),
    ],
  },
  {
    roman: 'V',
    title: 'Deep learning e oltre',
    lessons: [
      L('16', 'Reti neurali convoluzionali (CNN)'),
      L('17', 'Deep learning'),
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
