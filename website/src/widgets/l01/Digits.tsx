import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn } from '../../components/ui/Controls'
import { rng } from '../../lib/math'

/**
 * Fig. 1.1 ricostruita: cifre 8×8 (stile del dataset "optdigits": valori 0–16),
 * generate disegnando i caratteri con calligrafie diverse e riducendoli a 8×8.
 * Lo studente può disegnare una cifra: vede la matrice, il vettore di 64 numeri
 * e la risposta di un classificatore "giocattolo" (nearest neighbor).
 */

type Img = number[] // 64 valori in [0, 16]
type Style = { font: string; weight: number; italic?: boolean }

const STYLES: Style[] = [
  { font: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive', weight: 400 },
  { font: '"Ink Free", "Marker Felt", "Segoe Script", cursive', weight: 400 },
  { font: 'Georgia, "Newsreader Variable", serif', weight: 400, italic: true },
  { font: '"Comic Sans MS", "Chalkboard SE", cursive', weight: 700 },
  { font: '"Geist Variable", system-ui, sans-serif', weight: 500 },
  { font: '"Newsreader Variable", Georgia, serif', weight: 600 },
  { font: 'cursive', weight: 400 },
  { font: 'monospace', weight: 700 },
  { font: 'sans-serif', weight: 800 },
  { font: 'serif', weight: 400, italic: true },
]

const SRC = 72
const FIT = 28
const BOX = 32

/** Ritaglia l'inchiostro, lo centra in 32×32 e fa la media su blocchi 4×4 → 8×8 (0–16). */
function downsample(src: HTMLCanvasElement): Img | null {
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  const { width: W, height: H } = src
  const data = sctx.getImageData(0, 0, W, H).data
  let x0 = W
  let y0 = H
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 40) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  if (x1 < 0) return null
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1
  const k = FIT / Math.max(bw, bh)
  const tmp = document.createElement('canvas')
  tmp.width = BOX
  tmp.height = BOX
  const t = tmp.getContext('2d', { willReadFrequently: true })!
  t.imageSmoothingQuality = 'high'
  t.drawImage(src, x0, y0, bw, bh, (BOX - bw * k) / 2, (BOX - bh * k) / 2, bw * k, bh * k)
  const d = t.getImageData(0, 0, BOX, BOX).data
  const out: Img = []
  for (let by = 0; by < 8; by++)
    for (let bx = 0; bx < 8; bx++) {
      let s = 0
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) s += d[((by * 4 + y) * BOX + bx * 4 + x) * 4 + 3]
      out.push(Math.round((s / 16 / 255) * 16))
    }
  return out
}

function renderGlyph(digit: number, st: Style, rot: number, skew: number, scaleX: number): Img | null {
  const c = document.createElement('canvas')
  c.width = SRC
  c.height = SRC
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.translate(SRC / 2, SRC / 2)
  ctx.rotate(rot)
  ctx.transform(scaleX, 0, skew, 1, 0, 0)
  ctx.font = `${st.italic ? 'italic ' : ''}${st.weight} 44px ${st.font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  ctx.fillText(String(digit), 0, 2)
  // ispessisce i caratteri sottili, come un tratto di penna
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2.6
  ctx.lineJoin = 'round'
  ctx.strokeText(String(digit), 0, 2)
  return downsample(c)
}

type Bank = { samples: Img[][]; templates: { img: Img; label: number }[] }
let bankPromise: Promise<Bank> | null = null

function buildBank(): Promise<Bank> {
  if (bankPromise) return bankPromise
  bankPromise = (document.fonts?.ready ?? Promise.resolve()).then(() => {
    const r = rng(7)
    const samples: Img[][] = [] // [riga][cifra]
    const rowStyles = [0, 1, 3, 2]
    for (const si of rowStyles) {
      const row: Img[] = []
      for (let dgt = 0; dgt < 10; dgt++) {
        const img = renderGlyph(dgt, STYLES[si], (r() - 0.5) * 0.3, (r() - 0.5) * 0.35, 0.85 + r() * 0.3)
        row.push(img ?? new Array(64).fill(0))
      }
      samples.push(row)
    }
    const templates: { img: Img; label: number }[] = []
    for (let dgt = 0; dgt < 10; dgt++)
      for (const st of STYLES)
        for (let a = 0; a < 3; a++) {
          const img = renderGlyph(dgt, st, (r() - 0.5) * 0.35, (r() - 0.5) * 0.4, 0.8 + r() * 0.4)
          if (img) templates.push({ img, label: dgt })
        }
    return { samples, templates }
  })
  return bankPromise
}

function classify(x: Img, bank: Bank) {
  const d = bank.templates.map((t) => {
    let s = 0
    for (let i = 0; i < 64; i++) s += (x[i] - t.img[i]) ** 2
    return { s, label: t.label }
  })
  d.sort((a, b) => a.s - b.s)
  const votes = new Array(10).fill(0)
  for (const n of d.slice(0, 5)) votes[n.label] += 1 / (1 + Math.sqrt(n.s))
  const best = votes.indexOf(Math.max(...votes))
  const total = votes.reduce((a, b) => a + b, 0)
  return { label: best, conf: votes[best] / total, votes }
}

/** Immagine 8×8 come rettangoli SVG: il colore segue il tema da solo. */
function Pix({ img, size = 32, hot }: { img: Img; size?: number; hot?: number | null }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" className="pix" shapeRendering="crispEdges" aria-hidden="true">
      <rect width={8} height={8} className="pix__bg" />
      {img.map((v, i) =>
        v > 0 ? <rect key={i} x={i % 8} y={Math.floor(i / 8)} width={1} height={1} className="pix__on" opacity={v / 16} /> : null,
      )}
      {hot != null && <rect x={hot % 8} y={Math.floor(hot / 8)} width={1} height={1} className="pix__hot" />}
    </svg>
  )
}

export function DigitsFigure() {
  const [bank, setBank] = useState<Bank | null>(null)
  const [sel, setSel] = useState<{ img: Img; label: number | null; drawn: boolean } | null>(null)
  const [hot, setHot] = useState<number | null>(null)
  const [done, setDone] = useState({ pick: false, draw: false, cell: false })
  const pad = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let alive = true
    buildBank().then((b) => {
      if (!alive) return
      setBank(b)
      setSel({ img: b.samples[0][3], label: 3, drawn: false })
    })
    return () => {
      alive = false
    }
  }, [])

  const pred = useMemo(() => (bank && sel ? classify(sel.img, bank) : null), [bank, sel])

  const padCtx = () => {
    const c = pad.current!
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    return ctx
  }
  const pos = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 200, y: ((e.clientY - r.top) / r.height) * 200 }
  }
  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = padCtx()
    // colore dell'inchiostro del tema (la riduzione a 8 × 8 legge solo l'opacità)
    ctx.strokeStyle = getComputedStyle(pad.current!).color
    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  const commit = () => {
    const img = downsample(pad.current!)
    if (img) {
      setSel({ img, label: null, drawn: true })
      setDone((d) => ({ ...d, draw: true }))
    }
  }
  const clear = () => {
    padCtx().clearRect(0, 0, 200, 200)
    if (bank) setSel({ img: bank.samples[0][3], label: 3, drawn: false })
  }

  const col = pred?.label

  return (
    <div className="digits">
      <div className="digits__grid" role="group" aria-label="Esempi di cifre scritte a mano, 8×8 pixel">
        {bank ? (
          <>
            {bank.samples.map((row, ri) => (
              <div className="digits__row" key={ri}>
                {row.map((img, d) => (
                  <button
                    key={d}
                    className={`digits__cell${col === d ? ' is-col' : ''}${sel?.img === img ? ' is-sel' : ''}`}
                    onClick={() => {
                      setSel({ img, label: d, drawn: false })
                      setDone((v) => ({ ...v, pick: true }))
                    }}
                    aria-label={`esempio della cifra ${d}`}
                  >
                    <Pix img={img} size={34} />
                  </button>
                ))}
              </div>
            ))}
            <div className="digits__row digits__row--arrows" aria-hidden="true">
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className={col === d ? 'is-col' : undefined}>
                  <svg width="12" height="22" viewBox="0 0 12 22">
                    <path d="M6 1v18M1.5 14.5L6 20l4.5-5.5" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ))}
            </div>
            <div className="digits__row digits__row--labels">
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className={col === d ? 'is-col' : undefined}>
                  {d}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="digits__loading">Genero le cifre…</div>
        )}
      </div>

      <div className="digits__pipe">
        <div className="digits__stage">
          <div className="digits__stage-label">1 · Disegna una cifra</div>
          <canvas
            ref={pad}
            width={200}
            height={200}
            className="digits__pad"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              drawing.current = true
              const p = pos(e)
              last.current = p
              stroke(p, { x: p.x + 0.1, y: p.y + 0.1 })
            }}
            onPointerMove={(e) => {
              if (!drawing.current || !last.current) return
              const p = pos(e)
              stroke(last.current, p)
              last.current = p
            }}
            onPointerUp={() => {
              drawing.current = false
              last.current = null
              commit()
            }}
            onPointerCancel={() => {
              drawing.current = false
            }}
            aria-label="Area di disegno: disegna una cifra con il mouse o il dito"
          />
          <Btn icon="reset" onClick={clear}>
            Cancella
          </Btn>
        </div>

        <div className="digits__arrow" aria-hidden="true">
          →
        </div>

        <div className="digits__stage">
          <div className="digits__stage-label">2 · Immagine 8 × 8 (valori 0–16)</div>
          {sel && (
            <div className="digits__matrix" onMouseLeave={() => setHot(null)}>
              {sel.img.map((v, i) => (
                <span
                  key={i}
                  style={{ '--v': v / 16 } as CSSProperties}
                  className={`${hot === i ? 'is-hot' : ''}${v >= 8 ? ' is-ink' : ''}`}
                  onMouseEnter={() => {
                    setHot(i)
                    setDone((d) => ({ ...d, cell: true }))
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="digits__arrow" aria-hidden="true">
          →
        </div>

        <div className="digits__stage digits__stage--out">
          <div className="digits__stage-label">
            3 · Il classificatore <Tex>f</Tex>
          </div>
          <div className="digits__f">
            <span className="digits__fbox">
              <Tex>f</Tex>
            </span>
            <span className="digits__out">{pred ? pred.label : '·'}</span>
            <span className="digits__conf">
              {pred && (sel?.drawn ? `classe predetta · voti ${Math.round(pred.conf * 100)}%` : `classe corretta: ${sel?.label}`)}
            </span>
          </div>
        </div>
      </div>

      {sel && (
        <div className="digits__vector">
          <div className="digits__stage-label">
            L’input <Tex>{'\\mathbf{x} \\in \\mathbb{R}^{64}'}</Tex>: le 8 righe messe una dopo l’altra
            {hot !== null && (
              <span className="digits__xi">
                {' '}
                · <Tex>{`x_{${hot + 1}} = ${sel.img[hot]}`}</Tex> (riga {Math.floor(hot / 8) + 1}, colonna {(hot % 8) + 1})
              </span>
            )}
          </div>
          <div className="digits__strip" onMouseLeave={() => setHot(null)}>
            {sel.img.map((v, i) => (
              <span
                key={i}
                style={{ '--v': v / 16 } as CSSProperties}
                className={`${hot === i ? 'is-hot' : ''}${i % 8 === 0 ? ' is-row' : ''}`}
                onMouseEnter={() => setHot(i)}
              />
            ))}
          </div>
        </div>
      )}

      <Tasks
        items={[
          { label: 'Clicca un esempio della griglia: vedi i suoi 64 valori.', done: done.pick },
          { label: 'Disegna una cifra nel riquadro: viene ridotta a 8 × 8 come gli esempi.', done: done.draw },
          { label: 'Passa sopra a una casella della matrice: è una componente del vettore x.', done: done.cell },
        ]}
      />
      <p className="wnote digits__disclaimer">
        Il classificatore qui è un giocattolo: confronta il disegno con esempi generati al computer e sceglie i più simili (è un
        K-nearest neighbors, che si studierà nella lezione 5). Scrivere a mano le regole, invece, sarebbe di fatto impossibile.
      </p>
    </div>
  )
}
