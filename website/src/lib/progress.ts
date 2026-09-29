import { useSyncExternalStore } from 'react'

/** Avanzamento di lettura per lezione, salvato solo in questo browser. */
export type LessonProgress = { pct: number; done: boolean; t: number }
type Store = Record<string, LessonProgress>

const KEY = 'ml-progress'
const listeners = new Set<() => void>()
let store: Store = load()

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* storage non disponibile */
  }
}

export function recordProgress(id: string, pct: number) {
  const prev = store[id]
  const p = Math.max(0, Math.min(1, pct))
  const done = (prev?.done ?? false) || p > 0.92
  if (prev && Math.abs(prev.pct - p) < 0.02 && prev.done === done) return
  store = { ...store, [id]: { pct: p, done, t: Date.now() } }
  save()
  listeners.forEach((l) => l())
}

export function useProgress(): Store {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => store,
    () => store,
  )
}

export function lastVisited(s: Store): string | undefined {
  let best: string | undefined
  let t = 0
  for (const [id, p] of Object.entries(s)) {
    if (p.t > t) {
      t = p.t
      best = id
    }
  }
  return best
}
