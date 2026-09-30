import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Tasks } from '../../components/prose/Figure'
import { Btn, Toggle } from '../../components/ui/Controls'
import { fmt } from '../../components/plot/scale'
import { contourSegments, segsToPath } from '../common/contours'

/**
 * Fig. 3.7: l'apprendimento come ricerca nello spazio delle ipotesi H.
 * Ogni punto è una funzione diversa; l'errore guida una ricerca locale
 * verso la regione delle soluzioni compatibili con il training set.
 */

const W = 700
const Hh = 380
const CX = 330
const CY = 190

// bordo di H: una "patata" in coordinate polari
const rOf = (t: number) => 1 + 0.1 * Math.sin(3 * t + 0.6) + 0.06 * Math.cos(5 * t) + 0.04 * Math.sin(2 * t)
const RX = 280
const RY = 158
function inside(x: number, y: number) {
  const dx = (x - CX) / RX
  const dy = (y - CY) / RY
  const t = Math.atan2(dy, dx)
  return Math.hypot(dx, dy) <= rOf(t) * 0.98
}
const BLOB = (() => {
  let d = ''
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * 2 * Math.PI
    const r = rOf(t)
    d += `${i ? 'L' : 'M'}${(CX + Math.cos(t) * r * RX).toFixed(1)},${(CY + Math.sin(t) * r * RY).toFixed(1)}`
  }
  return d + 'Z'
})()

// errore di ogni ipotesi: minimo nell'ottimo, un po' asimmetrico
const OPT = { x: 235, y: 262 }
const E = (x: number, y: number) => {
  const u = (x - OPT.x) / 150
  const v = (y - OPT.y) / 95
  return u * u + v * v + 0.35 * u * v + 0.12 * Math.sin(u * 3) * v
}
const gradE = (x: number, y: number) => {
  const h = 0.5
  return { gx: (E(x + h, y) - E(x - h, y)) / (2 * h), gy: (E(x, y + h) - E(x, y - h)) / (2 * h) }
}
const THR = 0.55

function searchPath(start: { x: number; y: number }) {
  const pts = [start]
  let p = start
  for (let k = 0; k < 60; k++) {
    const { gx, gy } = gradE(p.x, p.y)
    const n = Math.hypot(gx, gy)
    if (n < 1e-4) break
    // passo di lunghezza limitata: ricerca "locale", tra ipotesi vicine
    const step = Math.min(44, n * 3000)
    const q = { x: p.x - (gx / n) * step, y: p.y - (gy / n) * step }
    if (E(q.x, q.y) >= E(p.x, p.y) - 1e-5) break
    p = q
    pts.push(p)
    if (Math.hypot(p.x - OPT.x, p.y - OPT.y) < 6) break
  }
  pts.push(OPT)
  return pts
}

export function HypothesisSearch() {
  const [start, setStart] = useState({ x: 420, y: 80 })
  const [shown, setShown] = useState(1)
  const [heat, setHeat] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [runs, setRuns] = useState(0)
  const svg = useRef<SVGSVGElement>(null)
  const path = useMemo(() => searchPath(start), [start])

  useEffect(() => {
    const t = window.setInterval(() => {
      setShown((s) => {
        if (s >= path.length) {
          window.clearInterval(t)
          return s
        }
        return s + 1
      })
    }, 320)
    return () => window.clearInterval(t)
  }, [path])

  const contours = useMemo(() => {
    const f = (x: number, y: number) => E(x, y)
    return [0.55, 1.2, 2.2, 3.6, 5.4].map((L) => segsToPath(contourSegments(f, [0, W], [0, Hh], L, 90), (v) => v, (v) => v))
  }, [])

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const r = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * Hh
    if (!inside(x, y)) {
      setMsg('Fuori da H: questa funzione il modello non la può esprimere, quindi l’algoritmo non la può raggiungere.')
      return
    }
    setMsg(null)
    setShown(1)
    setStart({ x, y })
    setRuns((n) => n + 1)
  }

  const cur = path[Math.min(shown, path.length) - 1] ?? start
  const arrived = shown >= path.length

  return (
    <div>
      <svg ref={svg} viewBox={`0 0 ${W} ${Hh}`} className="hsearch__svg" onClick={onClick} role="img" aria-label="Spazio delle ipotesi e percorso di ricerca">
        <defs>
          <clipPath id="hs-clip">
            <path d={BLOB} />
          </clipPath>
          <marker id="hs-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0L10,5L0,10z" className="hsearch__head" />
          </marker>
        </defs>
        <path d={BLOB} className="hsearch__space" />
        <g clipPath="url(#hs-clip)">
          {heat && contours.map((d, i) => <path key={i} d={d} className="hsearch__contour" style={{ opacity: 0.8 - i * 0.12 }} />)}
        </g>
        <OkRegion />
        <text x={692} y={30} textAnchor="end" className="hsearch__lbl">
          spazio delle ipotesi H
        </text>
        <text x={692} y={48} textAnchor="end" className="hsearch__lbl hsearch__lbl--sub">
          scelto a priori: ogni punto è una funzione
        </text>
        <text x={OPT.x + 70} y={OPT.y + 92} className="hsearch__lbl hsearch__lbl--ok">
          compatibili con il training set
        </text>

        {path.slice(0, shown).map((p, i) => {
          if (i === 0) return null
          const a = path[i - 1]
          const L = Math.hypot(p.x - a.x, p.y - a.y)
          if (L < 12) return <line key={`l${i}`} x1={a.x} y1={a.y} x2={p.x} y2={p.y} className="hsearch__step" />
          // la freccia si ferma prima del punto d'arrivo
          const k = (L - 7) / L
          return (
            <line
              key={`l${i}`}
              x1={a.x}
              y1={a.y}
              x2={a.x + (p.x - a.x) * k}
              y2={a.y + (p.y - a.y) * k}
              className="hsearch__step"
              markerEnd="url(#hs-arr)"
            />
          )
        })}
        {path.slice(0, shown).map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r={i === 0 ? 7 : 4.5} className={`hsearch__pt${i === 0 ? ' is-start' : ''}`} />
        ))}
        <circle cx={OPT.x} cy={OPT.y} r={arrived ? 10 : 7} className={`hsearch__opt${arrived ? ' is-reached' : ''}`} />
        {/* sotto il punto: la ricerca di partenza arriva dall'alto a destra */}
        <text x={OPT.x} y={OPT.y + 30} textAnchor="middle" className="hsearch__lbl hsearch__lbl--strong">
          soluzione ottima (errore minimo)
        </text>
      </svg>
      <div className="controls">
        <div className="hsearch__status">
          {msg ? (
            <span className="verdict verdict--warn">{msg}</span>
          ) : (
            <>
              passo <b>{Math.min(shown, path.length) - 1}</b> · errore <b>{fmt(E(cur.x, cur.y), 2)}</b>
              {arrived && <span className="verdict verdict--good">trovata l’ipotesi a errore minimo</span>}
            </>
          )}
        </div>
        <Toggle label="mostra le curve di livello dell’errore" checked={heat} onChange={setHeat} />
        <Btn
          icon="reset"
          onClick={() => {
            setShown(1)
            setStart({ ...start })
          }}
        >
          Ripeti
        </Btn>
      </div>
      <Tasks
        items={[
          { label: 'Clicca in un punto di H: da lì parte una nuova ricerca locale.', done: runs >= 1 },
          { label: 'Prova a cliccare fuori da H.', done: msg !== null },
          { label: 'Mostra le curve di livello: ogni passo scende verso errori più bassi.', done: heat },
        ]}
      />
    </div>
  )
}

function OkRegion() {
  // regione {h : E(h) < soglia}: poligono trovato per bisezione lungo raggi uscenti dall'ottimo
  const d = useMemo(() => {
    let out = ''
    for (let i = 0; i <= 90; i++) {
      const t = (i / 90) * 2 * Math.PI
      let lo = 0
      let hi = 400
      for (let k = 0; k < 30; k++) {
        const m = (lo + hi) / 2
        if (E(OPT.x + Math.cos(t) * m, OPT.y + Math.sin(t) * m) < THR) lo = m
        else hi = m
      }
      out += `${i ? 'L' : 'M'}${(OPT.x + Math.cos(t) * lo).toFixed(1)},${(OPT.y + Math.sin(t) * lo).toFixed(1)}`
    }
    return out + 'Z'
  }, [])
  return <path d={d} className="hsearch__ok" />
}
