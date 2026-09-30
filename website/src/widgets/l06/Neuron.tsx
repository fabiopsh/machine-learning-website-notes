import { useEffect, useRef, useState } from 'react'
import { Axes, Dot, FnPath, Handle, Label, Plot, Polyline } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { subDigits } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Segmented, Slider, Toggle } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'
import { sigmoid } from './NetSvg'

/* ------------------------------------------------------------------ Fig. 6.1 */

type Part = 'dendriti' | 'soma' | 'assone' | 'mielina' | 'terminali' | 'sinapsi'
const PARTS: Record<Part, string> = {
  dendriti: 'Dendriti: ricevono gli input dagli altri neuroni.',
  soma: 'Soma (corpo cellulare): somma gli effetti degli input sul potenziale della cellula.',
  assone: 'Assone: conduce lo spike fino ai terminali.',
  mielina: 'Guaina mielinica: riveste l’assone.',
  terminali: 'Bottoni terminali: forniscono gli output alle sinapsi dei neuroni successivi.',
  sinapsi: 'Sinapsi: eccitatorie (+) o inibitorie (−); la loro forza, il «peso», cambia con l’apprendimento.',
}
const SYN = [
  { x: 52, y: 58, sign: 1 },
  { x: 36, y: 150, sign: 1 },
  { x: 60, y: 238, sign: -1 },
]
const THRESH = 1
const LEAK = 0.9 // frazione di potenziale che resta ogni 100 ms

export function BioNeuron() {
  const [pot, setPot] = useState(0)
  const [w, setW] = useState([0.45, 0.45, 0.5])
  const [spikes, setSpikes] = useState(0)
  const [spikeKey, setSpikeKey] = useState(0)
  const [firing, setFiring] = useState(false)
  const [hebb, setHebb] = useState(false)
  const [part, setPart] = useState<Part | null>(null)
  const recent = useRef<number[]>([0, 0, 0])
  const [clicked, setClicked] = useState({ inh: false })

  // il potenziale decade nel tempo (perdita di carica)
  useEffect(() => {
    const t = window.setInterval(() => {
      setPot((p) => (Math.abs(p) < 0.01 ? 0 : p * LEAK))
      recent.current = recent.current.map((v) => Math.max(0, v - 1))
    }, 100)
    return () => window.clearInterval(t)
  }, [])

  const stimulate = (i: number) => {
    const s = SYN[i].sign
    recent.current[i] = 6
    if (s < 0) setClicked({ inh: true })
    const next = pot + s * w[i]
    if (next >= THRESH) {
      setPot(-0.3) // dopo lo spike la cellula si scarica
      setSpikes((n) => n + 1)
      setSpikeKey((k) => k + 1)
      setFiring(true)
      window.setTimeout(() => setFiring(false), 800)
      if (hebb) setW((ww) => ww.map((v, j) => (SYN[j].sign > 0 && recent.current[j] > 0 ? Math.min(1.2, v + 0.08) : v)))
    } else setPot(next)
  }
  const seen = useLatch({ spike: spikes > 0, inh: clicked.inh, hebb: hebb && w[0] + w[1] > 0.95 })

  return (
    <div>
      <div className="wscroll">
        <svg viewBox="0 0 720 300" className="bio__svg" role="img" aria-label="Neurone biologico con dendriti, soma, assone e terminali">
          {/* dendriti */}
          <g
            className={`bio__part bio__dend${part === 'dendriti' ? ' is-hot' : ''}`}
            onPointerEnter={() => setPart('dendriti')}
            onPointerLeave={() => setPart(null)}
          >
            <path d="M200,130 C150,110 110,80 60,60 M120,92 C110,70 100,50 92,30 M200,150 C140,150 90,150 44,150 M110,150 C100,130 80,122 64,112 M205,170 C160,195 110,220 66,236 M130,205 C120,230 118,250 112,272" />
          </g>
          {SYN.map((s, i) => (
            <g
              key={i}
              className={`bio__syn${s.sign < 0 ? ' is-inh' : ''}`}
              transform={`translate(${s.x} ${s.y})`}
              onClick={() => stimulate(i)}
              onPointerEnter={() => setPart('sinapsi')}
              onPointerLeave={() => setPart(null)}
              role="button"
              tabIndex={0}
              aria-label={`stimola la sinapsi ${i + 1} (${s.sign > 0 ? 'eccitatoria' : 'inibitoria'})`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && stimulate(i)}
            >
              <circle r={9 + w[i] * 10} />
              <text y={5} textAnchor="middle">
                {s.sign > 0 ? '+' : '−'}
              </text>
            </g>
          ))}
          {/* soma */}
          <g
            className={`bio__part bio__soma${part === 'soma' ? ' is-hot' : ''}${firing ? ' is-firing' : ''}`}
            onPointerEnter={() => setPart('soma')}
            onPointerLeave={() => setPart(null)}
          >
            <ellipse cx={240} cy={150} rx={52} ry={46} />
            <circle cx={236} cy={146} r={15} className="bio__nucleus" />
          </g>
          {/* assone con mielina */}
          <g
            className={`bio__part bio__axon${part === 'assone' ? ' is-hot' : ''}`}
            onPointerEnter={() => setPart('assone')}
            onPointerLeave={() => setPart(null)}
          >
            <path d="M292,150 L600,150" />
          </g>
          <g
            className={`bio__part bio__myelin${part === 'mielina' ? ' is-hot' : ''}`}
            onPointerEnter={() => setPart('mielina')}
            onPointerLeave={() => setPart(null)}
          >
            {[320, 380, 440, 500, 560].map((x) => (
              <rect key={x} x={x} y={140} width={48} height={20} rx={10} />
            ))}
          </g>
          <g
            className={`bio__part bio__term${part === 'terminali' ? ' is-hot' : ''}`}
            onPointerEnter={() => setPart('terminali')}
            onPointerLeave={() => setPart(null)}
          >
            <path d="M600,150 C630,130 650,100 672,86 M600,150 C640,150 660,150 690,150 M600,150 C630,172 650,200 672,214" />
            {[
              [672, 86],
              [690, 150],
              [672, 214],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={7} />
            ))}
          </g>
          {spikeKey > 0 && <circle key={spikeKey} r={8} className="bio__spike" style={{ offsetPath: 'path("M292,150 L600,150")' }} />}
          {/* potenziale */}
          <g transform="translate(222 230)">
            <rect x={0} y={0} width={40} height={60} rx={6} className="bio__meter" />
            <rect
              x={4}
              y={56 - Math.max(0, Math.min(1, pot / 1.2)) * 52}
              width={32}
              height={Math.max(0, Math.min(1, pot / 1.2)) * 52}
              rx={3}
              className="bio__level"
            />
            <line x1={-4} x2={44} y1={56 - (THRESH / 1.2) * 52} y2={56 - (THRESH / 1.2) * 52} className="bio__thresh" />
            <text x={52} y={56 - (THRESH / 1.2) * 52 + 4} className="bio__lbl">
              soglia
            </text>
          </g>
          <text x={40} y={24} className="bio__lbl bio__lbl--io">
            input
          </text>
          <text x={690} y={290} textAnchor="end" className="bio__lbl bio__lbl--io">
            output
          </text>
        </svg>
      </div>
      <p className="bio__info">{part ? PARTS[part] : 'Passa sulle parti del neurone; clicca le sinapsi per stimolarle.'}</p>
      <div className="controls">
        <div className="readouts">
          <Readout label="potenziale" value={fmt(pot, 2)} sub={`soglia ${fmt(THRESH, 1)}`} />
          <Readout label="spike emessi" tone="accent" value={String(spikes)} />
          <Readout label="pesi sinaptici" value={w.map((v, i) => (SYN[i].sign > 0 ? '+' : '−') + fmt(v, 2)).join('  ')} />
        </div>
        <Toggle label="plasticità (Hebb)" checked={hebb} onChange={setHebb} />
        <Btn icon="reset" onClick={() => setW([0.45, 0.45, 0.5])} title="Pesi iniziali" />
      </div>
      <Tasks
        items={[
          { label: 'Stimola le sinapsi eccitatorie in rapida successione fino a superare la soglia: parte uno spike.', done: seen.spike },
          { label: 'Stimola la sinapsi inibitoria: il potenziale scende invece di salire.', done: seen.inh },
          { label: 'Accendi la plasticità e genera qualche spike: le sinapsi coinvolte si rafforzano.', done: seen.hebb },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.2 */

type Act = 'lin' | 'step' | 'sig'
const ACT: Record<Act, { f: (v: number) => number; name: string }> = {
  lin: { f: (v) => v, name: 'lineare (identità)' },
  step: { f: (v) => (v > 0 ? 1 : 0), name: 'a soglia (Perceptron)' },
  sig: { f: (v) => sigmoid(v), name: 'logistica (sigmoide)' },
}

export function Unit() {
  const [x, setX] = useState([1, 0.5, -1])
  const [w, setW] = useState([0.8, -0.4, 0.6])
  const [w0, setW0] = useState(0.2)
  const [act, setAct] = useState<Act>('sig')
  const net = w0 + w.reduce((s, v, i) => s + v * x[i], 0)
  const o = ACT[act].f(net)
  const moved = useLatch({ m: w0 !== 0.2 || w[0] !== 0.8 || w[1] !== -0.4 || w[2] !== 0.6 || x[0] !== 1 || x[1] !== 0.5 || x[2] !== -1 }).m
  const seen = useLatch({ neg: moved && net < 0, step: act === 'step', lin: act === 'lin' })
  const setXi = (i: number, v: number) => setX(x.map((a, j) => (j === i ? v : a)))
  const setWi = (i: number, v: number) => setW(w.map((a, j) => (j === i ? v : a)))
  const Y = [52, 110, 168]
  return (
    <div>
      <div className="wscroll">
        <svg
          viewBox="-18 0 658 230"
          className="unit__svg"
          role="img"
          aria-label="Unità artificiale: input, pesi, somma pesata e funzione di attivazione"
        >
          <text x={40} y={22} textAnchor="middle" className="unit__head">
            input
          </text>
          {[0, ...Y].map((yy, i) => {
            const isBias = i === 0
            const yv = isBias ? 206 : yy
            const val = isBias ? 1 : x[i - 1]
            const wv = isBias ? w0 : w[i - 1]
            return (
              <g key={i}>
                <line
                  x1={66}
                  y1={yv}
                  x2={338}
                  y2={116}
                  className={`unit__edge${wv >= 0 ? ' is-pos' : ' is-neg'}`}
                  strokeWidth={1 + Math.abs(wv) * 2.4}
                />
                <g transform={`translate(40 ${yv})`} className={`unit__in${isBias ? ' is-bias' : ''}`}>
                  <circle r={20} />
                  <text y={5} textAnchor="middle">
                    {fmt(val, 1)}
                  </text>
                  <text x={-28} y={5} textAnchor="end" className="unit__sym">
                    {subDigits(isBias ? 'x₀' : `x${'₁₂₃'[i - 1]}`)}
                  </text>
                </g>
                {/* il peso sta sul proprio arco (stessa frazione di percorso per tutti, così non si sovrappongono) */}
                <g transform={`translate(${66 + 272 * 0.14} ${yv + (116 - yv) * 0.14})`}>
                  <rect x={-34} y={-12} width={68} height={24} rx={12} className="unit__w" />
                  <text y={4} textAnchor="middle" className="unit__wtxt">
                    {isBias ? 'w₀' : `w${'₁₂₃'[i - 1]}`} {fmt(wv, 1)}
                  </text>
                </g>
              </g>
            )
          })}
          <g transform="translate(390 116)" className="unit__node">
            <circle r={52} />
            <line x1={0} y1={-52} x2={0} y2={52} className="unit__split" />
            <text x={-26} y={10} textAnchor="middle" className="unit__big">
              Σ
            </text>
            <text x={26} y={10} textAnchor="middle" className="unit__big unit__big--f">
              f
            </text>
          </g>
          <line x1={442} y1={116} x2={540} y2={116} className="unit__edge is-out" />
          <path d="M540,110 L552,116 L540,122 Z" className="unit__arrow" />
          <text x={596} y={112} textAnchor="middle" className="unit__out">
            {fmt(o, 2)}
          </text>
          <text x={596} y={134} textAnchor="middle" className="unit__sym">
            o = f(net)
          </text>
          <text x={390} y={196} textAnchor="middle" className="unit__sym">
            net = {fmt(net, 2)}
          </text>
        </svg>
      </div>
      <div className="wgrid wgrid--even">
        <div className="unit__sliders">
          {x.map((v, i) => (
            <Slider
              key={`x${i}`}
              label={<Tex>{`x_${i + 1}`}</Tex>}
              min={-1}
              max={1}
              step={0.1}
              value={v}
              onChange={(a) => setXi(i, a)}
              format={(a) => fmt(a, 1)}
            />
          ))}
        </div>
        <div className="unit__sliders">
          {w.map((v, i) => (
            <Slider
              key={`w${i}`}
              label={<Tex>{`w_{i${i + 1}}`}</Tex>}
              min={-2}
              max={2}
              step={0.1}
              value={v}
              onChange={(a) => setWi(i, a)}
              format={(a) => fmt(a, 1)}
            />
          ))}
          <Slider label={<Tex>{'w_{i0}'}</Tex>} min={-2} max={2} step={0.1} value={w0} onChange={setW0} format={(a) => fmt(a, 1)} />
        </div>
      </div>
      <div className="controls">
        <Segmented
          label="funzione di attivazione f"
          value={act}
          onChange={setAct}
          options={[
            { value: 'lin', label: 'lineare' },
            { value: 'step', label: 'soglia' },
            { value: 'sig', label: 'logistica' },
          ]}
        />
        <div className="readouts">
          <Readout label={<Tex>{'net_i = \\sum_j w_{ij} x_j'}</Tex>} value={fmt(net, 2)} />
          <Readout label={<Tex>{'o_i = f(net_i)'}</Tex>} tone="accent" value={fmt(o, 3)} />
        </div>
      </div>
      <Tasks
        items={[
          { label: 'Cambia input e pesi fino a rendere negativo l’input netto.', done: seen.neg },
          { label: 'Passa alla soglia: l’uscita diventa 0 o 1 (è il Perceptron).', done: seen.step },
          { label: 'Passa alla lineare: l’uscita coincide con net.', done: seen.lin },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ Fig. 6.3 */

export function Activations() {
  const [net, setNet] = useState(0.8)
  const moved = useLatch({ m: net !== 0.8 }).m
  const seen = useLatch({ neg: moved && net < 0, big: net > 3.5 })
  return (
    <div>
      <div className="act3">
        {(['lin', 'step', 'sig'] as Act[]).map((k) => (
          <div key={k} className="act3__cell">
            <div className="htf__title">{ACT[k].name}</div>
            <Plot
              xDomain={[-4, 4]}
              yDomain={k === 'lin' ? [-4, 4] : [-0.2, 1.2]}
              aspect={0.75}
              minH={150}
              maxH={220}
              margin={{ l: 30, r: 8, t: 10, b: 24 }}
            >
              <Axes xTicks={[-4, -2, 0, 2, 4]} yTicks={k === 'lin' ? [-4, 0, 4] : [0, 0.5, 1]} origin />
              {k === 'step' ? (
                <Polyline
                  pts={[
                    { x: -4, y: 0 },
                    { x: 0, y: 0 },
                    { x: 0, y: 1 },
                    { x: 4, y: 1 },
                  ]}
                  color="var(--c-red)"
                  width={2.4}
                />
              ) : (
                <FnPath f={ACT[k].f} color="var(--c-red)" width={2.4} />
              )}
              <Polyline
                pts={[
                  { x: net, y: k === 'lin' ? -4 : -0.2 },
                  { x: net, y: ACT[k].f(net) },
                ]}
                color="var(--ink-4)"
                width={1}
                dash="3 3"
              />
              <Dot x={net} y={ACT[k].f(net)} color="var(--c-red)" r={5} />
              <Label x={-3.8} y={k === 'lin' ? 3.4 : 1.08} className="plot-label--muted">
                o = {fmt(ACT[k].f(net), 2)}
              </Label>
              <Handle x={net} y={k === 'lin' ? -4 : -0.2} axis="x" label="input netto" onMove={(p) => setNet(Math.round(p.x * 10) / 10)} />
            </Plot>
          </div>
        ))}
      </div>
      <Tasks
        items={[
          { label: 'Porta net sotto zero: la soglia dà 0, la logistica scende sotto 0,5, la lineare diventa negativa.', done: seen.neg },
          { label: 'Porta net molto in alto: la logistica si «satura» vicino a 1, come la soglia.', done: seen.big },
        ]}
      />
    </div>
  )
}
