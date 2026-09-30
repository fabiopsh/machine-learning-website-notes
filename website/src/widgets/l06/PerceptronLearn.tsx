import { useMemo, useState } from 'react'
import { Arrow, Axes, Dot, FnPath, Handle, Label, Plot, Polyline, usePlot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Legend, Readout, Slider } from '../../components/ui/Controls'
import { rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

type P = { x: number; y: number }
type LP = P & { d: 1 | -1 }
const C1 = 'var(--c-blue)'
const C0 = 'var(--c-orange)'

/** retta w₁x + w₂y + w₀ = 0 disegnabile in un riquadro */
function lineIn(w1: number, w2: number, w0: number, X: [number, number]): P[] {
  if (Math.abs(w2) >= Math.abs(w1) && Math.abs(w2) > 1e-9) return [X[0] - 5, X[1] + 5].map((x) => ({ x, y: (-w0 - w1 * x) / w2 }))
  if (Math.abs(w1) > 1e-9) return [X[0] - 5, X[1] + 5].map((y) => ({ x: (-w0 - w2 * y) / w1, y }))
  return []
}

function Mark({ p, bad, sel, name, onClick }: { p: LP; bad: boolean; sel?: boolean; name?: string; onClick?: () => void }) {
  const { x, y } = usePlot()
  return (
    <g
      transform={`translate(${x(p.x)} ${y(p.y)})`}
      className={`pl__pt${onClick ? ' sep__click' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `pattern ${name ?? ''} con target ${p.d > 0 ? '+1' : '−1'}` : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {bad && <circle r={13} className="lsep__ring" />}
      {sel && <circle r={15} className="bool6__halo" />}
      {p.d > 0 ? (
        <path d="M0,-7L2,-2L7,-2L3,1.5L4.6,7L0,3.6L-4.6,7L-3,1.5L-7,-2L-2,-2Z" fill={C1} stroke="var(--plot-bg)" strokeWidth={1.2} />
      ) : (
        <circle r={5.5} fill="var(--plot-bg)" stroke={C0} strokeWidth={2.4} />
      )}
      {name && (
        <text x={10} y={-8} className="pl__name">
          {name}
        </text>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 6.7 */

const GX: [number, number] = [-3.4, 3.4]
const GDATA: LP[] = [
  { x: 1.2, y: 2.6, d: 1 },
  { x: -1.6, y: -1.8, d: -1 },
  { x: -2.2, y: 1.6, d: 1 },
  { x: -1.4, y: 2.4, d: 1 },
  { x: -0.6, y: 2.8, d: 1 },
  { x: -2.6, y: 0.6, d: 1 },
  { x: -1.0, y: 1.0, d: 1 },
  { x: 1.8, y: 0.5, d: -1 },
  { x: 2.6, y: 0.9, d: -1 },
  { x: 2.0, y: -0.4, d: -1 },
  { x: 1.0, y: -1.2, d: -1 },
  { x: 2.8, y: 0.2, d: -1 },
]
const W0: P = { x: -2, y: 0.8 }
const dot = (w: P, p: P) => w.x * p.x + w.y * p.y
const wrongOf = (w: P) => GDATA.map((p) => (dot(w, p) > 0 ? 1 : -1) !== p.d)

export function PerceptronStep() {
  const [w, setW] = useState<P>(W0)
  const [eta, setEta] = useState(0.5)
  const [sel, setSel] = useState<number | null>(0)
  const [updates, setUpdates] = useState(0)
  const [log, setLog] = useState({ p1: false, p2: false })
  const wrong = wrongOf(w)
  const nWrong = wrong.filter(Boolean).length
  const cand = sel !== null && wrong[sel] ? GDATA[sel] : null
  const delta = cand ? { x: eta * cand.d * cand.x, y: eta * cand.d * cand.y } : null
  const wNew = delta ? { x: w.x + delta.x, y: w.y + delta.y } : null
  const apply = () => {
    if (!wNew || sel === null) return
    setW(wNew)
    setUpdates((u) => u + 1)
    if (sel === 0) setLog((l) => ({ ...l, p1: true }))
    if (sel === 1) setLog((l) => ({ ...l, p2: true }))
  }
  const epoch = () => {
    let v = w
    let n = 0
    for (const p of GDATA) {
      if ((dot(v, p) > 0 ? 1 : -1) !== p.d) {
        v = { x: v.x + eta * p.d * p.x, y: v.y + eta * p.d * p.y }
        n++
      }
    }
    setW(v)
    setUpdates((u) => u + n)
  }
  const seen = useLatch({ p1: log.p1, p2: log.p2, zero: updates > 0 && nWrong === 0 })
  const wn = Math.hypot(w.x, w.y) || 1
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'd = +1', color: C1, kind: 'dot' },
            { label: 'd = −1', color: C0, kind: 'dot' },
            { label: 'w e il suo confine', color: 'var(--ink)' },
            { label: 'η d x', color: 'var(--c-green)' },
            { label: 'w nuovo', color: 'var(--c-violet)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={GX} yDomain={GX} equal aspect={0.9} maxH={420}>
          <Axes xTicks={[-3, -2, -1, 0, 1, 2, 3]} yTicks={[-3, -2, -1, 0, 1, 2, 3]} origin xLabel="x₁" yLabel="x₂" />
          <Polyline pts={lineIn(w.x, w.y, 0, GX)} color="var(--ink-2)" width={1.6} dash="6 4" />
          {wNew && <Polyline pts={lineIn(wNew.x, wNew.y, 0, GX)} color="var(--c-violet)" width={1.8} dash="6 4" />}
          <Arrow
            from={{ x: 0, y: 0 }}
            to={{ x: (w.x / wn) * Math.min(2.6, wn), y: (w.y / wn) * Math.min(2.6, wn) }}
            color="var(--ink)"
            width={2.4}
          />
          {delta && wNew && (
            <>
              <Arrow
                from={{ x: w.x * clampK(wn), y: w.y * clampK(wn) }}
                to={{ x: w.x * clampK(wn) + delta.x, y: w.y * clampK(wn) + delta.y }}
                color="var(--c-green)"
                width={2.2}
              />
              <Arrow
                from={{ x: 0, y: 0 }}
                to={{ x: w.x * clampK(wn) + delta.x, y: w.y * clampK(wn) + delta.y }}
                color="var(--c-violet)"
                width={2.2}
              />
            </>
          )}
          {GDATA.map((p, i) => (
            <Mark
              key={i}
              p={p}
              bad={wrong[i]}
              sel={sel === i}
              name={i === 0 ? 'p₁' : i === 1 ? 'p₂' : undefined}
              onClick={() => setSel(i)}
            />
          ))}
          <Handle
            x={(w.x / wn) * Math.min(2.6, wn)}
            y={(w.y / wn) * Math.min(2.6, wn)}
            label="punta del vettore dei pesi"
            onMove={(p) => setW(p)}
          />
        </Plot>
        <div className="wside">
          <div className="wpanel">
            <div className="wpanel__title">Aggiornamento</div>
            {cand ? (
              <div className="wmath">
                <Tex>{`\\mathbf{w}_{new} = \\mathbf{w} + \\eta\\, d\\, \\mathbf{x} = (${n(w.x)};\\ ${n(w.y)}) ${cand.d > 0 ? '+' : '-'} ${n(eta)}\\,(${n(cand.x)};\\ ${n(cand.y)})`}</Tex>
              </div>
            ) : (
              <p className="wnote">Clicca un pattern cerchiato in rosso (classificato male) per vedere la correzione.</p>
            )}
          </div>
          <Slider label={<Tex>{'\\eta'}</Tex>} min={0.1} max={1} step={0.05} value={eta} onChange={setEta} format={(v) => fmt(v)} />
          <div className="delta__btns">
            <Btn icon="step" variant="soft" onClick={apply} disabled={!wNew}>
              Applica
            </Btn>
            <Btn onClick={epoch}>Un’epoca</Btn>
            <Btn
              icon="reset"
              onClick={() => {
                setW(W0)
                setUpdates(0)
                setSel(0)
              }}
              title="Ricomincia"
            />
          </div>
          <div className="readouts">
            <Readout label="classificati male" value={`${nWrong} su ${GDATA.length}`} tone={nWrong ? 'red' : 'accent'} />
            <Readout label="aggiornamenti" value={String(updates)} />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Applica la correzione su p₁ (d = +1): w viene spostato verso p₁.', done: seen.p1 },
          { label: 'Esercizio: scegli p₂ (d = −1) e applica: w viene allontanato da p₂.', done: seen.p2 },
          { label: 'Continua (anche con «Un’epoca») fino a zero errori.', done: seen.zero },
        ]}
      />
    </div>
  )
}

const clampK = (wn: number) => Math.min(2.6, wn) / wn
const n = (v: number) => fmt(v, 2).replace(',', '{,}').replace('−', '-')

/* ------------------------------------------------------------------ Fig. 6.8 */

function convData(gamma: number) {
  const r = rng(808)
  const th = 0.6
  const u = { x: Math.cos(th), y: Math.sin(th) }
  const pts: LP[] = []
  while (pts.length < 30) {
    const p = { x: (r() * 2 - 1) * 3, y: (r() * 2 - 1) * 3 }
    const s = dot(u, p)
    if (Math.abs(s) < gamma || Math.hypot(p.x, p.y) > 3) continue
    pts.push({ ...p, d: s > 0 ? 1 : -1 })
  }
  const alpha = Math.min(...pts.map((p) => p.d * dot(u, p)))
  const beta = Math.max(...pts.map((p) => p.x * p.x + p.y * p.y))
  // Perceptron con w(0) = 0 e η = 1: si registra ‖w(q)‖² dopo ogni errore
  let w = { x: 0, y: 0 }
  const norms: P[] = [{ x: 0, y: 0 }]
  for (let ep = 0; ep < 500; ep++) {
    let errs = 0
    for (const p of pts) {
      if (p.d * dot(w, p) <= 0) {
        w = { x: w.x + p.d * p.x, y: w.y + p.d * p.y }
        errs++
        norms.push({ x: norms.length, y: w.x * w.x + w.y * w.y })
      }
    }
    if (!errs) break
  }
  return { pts, u, alpha, beta, qmax: beta / (alpha * alpha), norms }
}

export function ConvergenceBound() {
  const [gamma, setGamma] = useState(0.35)
  const D = useMemo(() => convData(gamma), [gamma])
  const q = D.norms.length - 1
  const qm = D.qmax
  const moved = useLatch({ m: gamma !== 0.35 }).m
  const seen = useLatch({ small: moved && gamma <= 0.15, big: gamma >= 0.6 })
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'limite inferiore (qα)²/‖w*‖²', color: 'var(--c-blue)' },
            { label: 'limite superiore qβ', color: 'var(--c-orange)' },
            { label: '‖w(q)‖² di una esecuzione', color: 'var(--c-red)', kind: 'dot' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={[0, qm * 1.08]} yDomain={[0, D.beta * qm * 1.08]} aspect={0.62} margin={{ l: 56, b: 40 }}>
          <Axes xTicks={4} yTicks={4} xLabel="numero di errori q" yLabel="‖w(q)‖²" yFormat={(v) => fmt(v, 0)} xFormat={(v) => fmt(v, 0)} />
          <FnPath f={(x) => (x * D.alpha) ** 2} color="var(--c-blue)" width={2.2} />
          <FnPath f={(x) => x * D.beta} color="var(--c-orange)" width={2.2} />
          <Polyline
            pts={[
              { x: qm, y: 0 },
              { x: qm, y: D.beta * qm },
            ]}
            color="var(--ink-3)"
            width={1.2}
            dash="4 4"
          />
          <Label x={qm} y={D.beta * qm * 0.06} dx={-6} anchor="end" className="plot-label--math">
            q_max
          </Label>
          <Polyline pts={D.norms} color="var(--c-red)" width={1.4} />
          {D.norms.map((p, i) => (
            <Dot key={i} x={p.x} y={p.y} r={3} color="var(--c-red)" />
          ))}
        </Plot>
        <div className="wside">
          <Plot xDomain={[-3.2, 3.2]} yDomain={[-3.2, 3.2]} equal aspect={1} minH={170} maxH={230} margin={{ l: 10, r: 10, t: 10, b: 10 }}>
            <Axes hideX hideY grid={false} />
            <Polyline pts={lineIn(D.u.x, D.u.y, 0, [-3.2, 3.2])} color="var(--ink-2)" width={1.6} />
            <Polyline pts={lineIn(D.u.x, D.u.y, -gamma, [-3.2, 3.2])} color="var(--ink-4)" width={1} dash="3 3" />
            <Polyline pts={lineIn(D.u.x, D.u.y, gamma, [-3.2, 3.2])} color="var(--ink-4)" width={1} dash="3 3" />
            {D.pts.map((p, i) => (
              <Mark key={i} p={p} bad={false} />
            ))}
          </Plot>
          <Slider
            label="separazione tra le classi"
            min={0.05}
            max={0.7}
            step={0.05}
            value={gamma}
            onChange={setGamma}
            format={(v) => fmt(v)}
          />
          <div className="readouts">
            <Readout label="α (margine di w*)" value={fmt(D.alpha, 2)} />
            <Readout label="β = max ‖x‖²" value={fmt(D.beta, 1)} />
            <Readout label="q ≤ β‖w*‖²/α²" tone="accent" value={fmt(qm, 0)} sub={`errori effettivi: ${q}`} />
          </div>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Avvicina le classi (separazione piccola): α cala e il limite q_max esplode.', done: seen.small },
          { label: 'Allontanale al massimo: bastano pochi errori per convergere.', done: seen.big },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.9 */

const LX: [number, number] = [-2, 8]
const BLUE: P[] = [
  { x: 2.2, y: 3.0 },
  { x: 3.4, y: 4.2 },
  { x: 4.2, y: 3.0 },
  { x: 3.0, y: 2.1 },
  { x: 1.5, y: 1.9 },
  { x: 2.4, y: 1.4 },
]
const ORANGE: P[] = [
  { x: 0.2, y: 0.6 },
  { x: -0.6, y: 1.4 },
  { x: 0.8, y: -0.4 },
  { x: -1.2, y: -0.8 },
  { x: 0.4, y: -1.6 },
  { x: -0.4, y: -0.2 },
  { x: 1.0, y: 0.4 },
  { x: -1.4, y: 0.6 },
]

/** minimi quadrati 3 × 3 sui target ±1 */
function lms(data: LP[]) {
  const S = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const t = [0, 0, 0]
  for (const p of data) {
    const v = [1, p.x, p.y]
    for (let a = 0; a < 3; a++) {
      t[a] += v[a] * p.d
      for (let b = 0; b < 3; b++) S[a][b] += v[a] * v[b]
    }
  }
  const M = S.map((r, i) => [...r, t[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]]
}

function perceptron(data: LP[], w0: number[]) {
  let w = w0.slice()
  for (let ep = 0; ep < 1000; ep++) {
    let errs = 0
    for (const p of data) {
      const v = [1, p.x, p.y]
      if (p.d * (w[0] + w[1] * p.x + w[2] * p.y) <= 0) {
        w = w.map((wi, i) => wi + p.d * v[i])
        errs++
      }
    }
    if (!errs) break
  }
  return w
}

export function LmsVsPerceptron() {
  const [far, setFar] = useState<P>({ x: 7, y: 7 })
  const data: LP[] = [...BLUE.map((p) => ({ ...p, d: 1 as const })), { ...far, d: 1 }, ...ORANGE.map((p) => ({ ...p, d: -1 as const }))]
  const wl = lms(data)
  const wp1 = perceptron(data, [0, 0, 0])
  const wp2 = perceptron(data, [-4, -1, 3])
  const hl = (p: LP) => (wl[0] + wl[1] * p.x + wl[2] * p.y > 0 ? 1 : -1)
  const lmsWrong = data.filter((p) => hl(p) !== p.d)
  const moved = useLatch({ m: far.x !== 7 || far.y !== 7 }).m
  const s1 = useLatch({ fixed: moved && lmsWrong.length === 0 })
  const seen = { ...s1, ...useLatch({ back: s1.fixed && lmsWrong.length > 0 }) }
  return (
    <div>
      <div className="wbar">
        <Legend
          items={[
            { label: 'classe +1', color: C1, kind: 'dot' },
            { label: 'classe −1', color: C0, kind: 'dot' },
            { label: 'soluzione LMS', color: 'var(--c-violet)' },
            { label: 'Perceptron (due inizializzazioni)', color: 'var(--c-red)' },
          ]}
        />
      </div>
      <div className="wgrid">
        <Plot xDomain={LX} yDomain={LX} equal aspect={0.95} maxH={420}>
          <Axes xTicks={[-2, 0, 2, 4, 6, 8]} yTicks={[-2, 0, 2, 4, 6, 8]} xLabel="x₁" yLabel="x₂" />
          <Polyline pts={lineIn(wp1[1], wp1[2], wp1[0], LX)} color="var(--c-red)" width={2} />
          <Polyline pts={lineIn(wp2[1], wp2[2], wp2[0], LX)} color="var(--c-red)" width={2} dash="6 4" />
          <Polyline pts={lineIn(wl[1], wl[2], wl[0], LX)} color="var(--c-violet)" width={2.6} />
          {data.map((p, i) => (
            <Mark key={i} p={p} bad={hl(p) !== p.d} />
          ))}
          <Handle
            x={far.x}
            y={far.y}
            label="punto lontano ma corretto"
            onMove={setFar}
            bounds={{ x: [0, 7.8], y: [0, 7.8] }}
            color="var(--accent)"
          />
        </Plot>
        <div className="wside">
          <div className="readouts">
            <Readout label="errori LMS" tone="violet" value={String(lmsWrong.length)} sub="sul training, problema separabile" />
            <Readout label="errori Perceptron" tone="red" value="0" sub="converge a un classificatore perfetto" />
          </div>
          <p className="wnote">
            La maniglia è un pattern della classe +1 lontano dal confine: già classificato bene, ma il suo errore quadratico è grande e
            «tira» la retta LMS.
          </p>
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Avvicina il punto lontano al suo gruppo: la retta LMS torna a separare tutto.', done: seen.fixed },
          { label: 'Poi riportalo lontano: la retta LMS torna a sbagliare, il Perceptron no.', done: seen.back },
        ]}
      />
    </div>
  )
}
