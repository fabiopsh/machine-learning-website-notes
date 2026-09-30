import { useRef, useState } from 'react'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Readout } from '../../components/ui/Controls'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/**
 * Fig. 6.4 — un Perceptron «alla Rosenblatt» che riconosce le lettere X e O.
 * Retina 8 × 8 di fotocellule → 16 unità associative (ognuna guarda un blocco 2 × 2 e si accende
 * se almeno 2 fotocellule sono attive) → unità di risposta a soglia Ψ, i cui pesi sono appresi
 * con l'algoritmo del Perceptron su lettere spostate e un po' rumorose.
 */

const N = 8
type Img = number[] // 64 valori 0/1

function letter(kind: 'X' | 'O', dx = 0, dy = 0): Img {
  const im = new Array(N * N).fill(0)
  const set = (r: number, c: number) => {
    const rr = r + dy
    const cc = c + dx
    if (rr >= 0 && rr < N && cc >= 0 && cc < N) im[rr * N + cc] = 1
  }
  if (kind === 'X')
    for (let i = 1; i <= 6; i++) {
      set(i, i)
      set(i, 7 - i)
    }
  else {
    for (let c = 2; c <= 5; c++) {
      set(1, c)
      set(6, c)
    }
    for (let r = 2; r <= 5; r++) {
      set(r, 1)
      set(r, 6)
    }
  }
  return im
}

/** unità associative: blocchi 2 × 2, attive se almeno due fotocellule sono accese */
function assoc(im: Img): number[] {
  const out: number[] = []
  for (let br = 0; br < 4; br++)
    for (let bc = 0; bc < 4; bc++) {
      let s = 0
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) s += im[(br * 2 + r) * N + bc * 2 + c]
      out.push(s >= 2 ? 1 : 0)
    }
  return out
}

/** addestramento del Perceptron sulle φ: d = +1 per X, −1 per O */
const TRAINED = (() => {
  const r = rng(64)
  const set: { phi: number[]; d: number }[] = []
  for (const k of ['X', 'O'] as const)
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let v = 0; v < 2; v++) {
          const im = letter(k, dx, dy)
          if (v) for (let t = 0; t < 3; t++) im[Math.floor(r() * 64)] ^= 1
          set.push({ phi: [1, ...assoc(im)], d: k === 'X' ? 1 : -1 })
        }
  let w = new Array(17).fill(0)
  let epochs = 0
  for (; epochs < 200; epochs++) {
    let errors = 0
    for (const s of set) {
      const net = w.reduce((a, wi, i) => a + wi * s.phi[i], 0)
      const out = net > 0 ? 1 : -1
      if (out !== s.d) {
        errors++
        w = w.map((wi, i) => wi + s.d * s.phi[i])
      }
    }
    if (!errors) break
  }
  return { w, epochs: epochs + 1, n: set.length }
})()

export function Rosenblatt() {
  const [im, setIm] = useState<Img>(() => letter('X'))
  const paint = useRef<number | null>(null)
  const phi = assoc(im)
  const net = TRAINED.w[0] + phi.reduce((a, v, i) => a + v * TRAINED.w[i + 1], 0)
  const cls = net > 0 ? 'X' : 'O'
  const [log, setLog] = useState({ o: false, drawn: false })
  const seen = useLatch({ o: log.o && cls === 'O', drawn: log.drawn && im.some(Boolean) })
  const toggle = (k: number, v?: number) => {
    setIm((cur) => cur.map((p, i) => (i === k ? (v ?? 1 - p) : p)))
    setLog((l) => ({ ...l, drawn: true }))
  }
  const [nseed, setNseed] = useState(1)
  const preset = (k: 'X' | 'O', noisy = false) => {
    const im2 = letter(k, noisy ? (nseed % 3) - 1 : 0, noisy ? ((nseed >> 1) % 3) - 1 : 0)
    if (noisy) {
      setNseed((n) => n + 1)
      const r = rng(nseed * 131)
      for (let t = 0; t < 4; t++) im2[Math.floor(r() * 64)] ^= 1
    }
    setIm(im2)
    if (k === 'O') setLog((l) => ({ ...l, o: true }))
  }
  return (
    <div>
      <div className="ros">
        <div className="ros__col">
          <div className="htf__title">Retina (fotocellule)</div>
          <div
            className="ros__retina"
            onPointerUp={() => (paint.current = null)}
            onPointerLeave={() => (paint.current = null)}
            role="group"
            aria-label="Retina 8 per 8: clicca o trascina per accendere le fotocellule"
          >
            {im.map((p, k) => (
              <button
                key={k}
                type="button"
                className={`ros__cell${p ? ' is-on' : ''}`}
                aria-label={`fotocellula ${Math.floor(k / N) + 1}, ${(k % N) + 1}: ${p ? 'accesa' : 'spenta'}`}
                onPointerDown={(e) => {
                  e.preventDefault()
                  paint.current = 1 - p
                  toggle(k, 1 - p)
                }}
                onPointerEnter={() => paint.current !== null && toggle(k, paint.current)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(k)}
              />
            ))}
          </div>
        </div>
        <div className="ros__arrow" aria-hidden="true">
          →
        </div>
        <div className="ros__col">
          <div className="htf__title">Unità associative φ</div>
          <div className="ros__phi">
            {phi.map((v, i) => (
              <span
                key={i}
                className={`ros__unit${v ? ' is-on' : ''}${TRAINED.w[i + 1] >= 0 ? ' is-pos' : ' is-neg'}`}
                title={`φ${i + 1} = ${v}, peso ${fmt(TRAINED.w[i + 1], 0)}`}
              >
                {fmt(TRAINED.w[i + 1], 0)}
              </span>
            ))}
          </div>
          <p className="wnote">Il numero è il peso appreso verso Ψ (blu positivo, arancione negativo).</p>
        </div>
        <div className="ros__arrow" aria-hidden="true">
          →
        </div>
        <div className="ros__col ros__col--out">
          <div className="htf__title">Risposta Ψ</div>
          <div className={`ros__out ros__out--${cls}`}>{cls}</div>
          <Readout label="Σ w φ + w₀" value={fmt(net, 0)} sub={net > 0 ? '> 0: X' : '≤ 0: O'} />
        </div>
      </div>
      <div className="controls">
        <Btn onClick={() => preset('X')}>Lettera X</Btn>
        <Btn onClick={() => preset('O')}>Lettera O</Btn>
        <Btn onClick={() => preset(nseed % 2 ? 'X' : 'O', true)}>Lettera spostata e rumorosa</Btn>
        <Btn icon="reset" onClick={() => setIm(new Array(64).fill(0))}>
          Cancella
        </Btn>
      </div>
      <p className="wnote">
        Pesi di Ψ appresi con l’algoritmo del Perceptron su {TRAINED.n} lettere X e O spostate e rumorose ({TRAINED.epochs} epoche).
      </p>
      <Tasks
        items={[
          { label: 'Carica la lettera O: le unità accese cambiano e la risposta diventa O.', done: seen.o },
          { label: 'Disegna una lettera tua sulla retina (clicca o trascina) e guarda cosa risponde.', done: seen.drawn },
        ]}
      />
    </div>
  )
}
