import { useMemo, useState, type ReactNode } from 'react'
import { Axes, Dot, FnPath, Plot } from '../../components/plot/Plot'
import { fmt } from '../../components/plot/scale'
import { svgScript } from '../../components/plot/svgText'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Controls, Legend, Readout, Slider } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'
import { gauss, lstsq, rng } from '../../lib/math'
import { useLatch } from '../../lib/useLatch'

/** un dado disegnato: il segno «qui c'è casualità» delle slide */
function Die({ x, y, s = 22, face = 5 }: { x: number; y: number; s?: number; face?: number }) {
  const pips: Record<number, [number, number][]> = {
    2: [
      [-1, -1],
      [1, 1],
    ],
    3: [
      [-1, -1],
      [0, 0],
      [1, 1],
    ],
    5: [
      [-1, -1],
      [1, -1],
      [0, 0],
      [-1, 1],
      [1, 1],
    ],
  }
  return (
    <g className="die18" transform={`translate(${x} ${y}) rotate(-12)`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.2} />
      {(pips[face] ?? pips[5]).map(([a, b], i) => (
        <circle key={i} cx={a * s * 0.26} cy={b * s * 0.26} r={s * 0.085} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ Fig. 18.1: Random Forest */

const NVARS = 4
type Tree = { vars: number[]; thr: number[]; leaves: number[] }

function makeForest(seed: number): Tree[] {
  const r = rng(1801 + seed * 211)
  return Array.from({ length: 3 }, () => ({
    vars: Array.from({ length: 7 }, () => Math.floor(r() * NVARS)),
    thr: Array.from({ length: 7 }, () => 0.3 + 0.4 * r()),
    leaves: Array.from({ length: 8 }, () => (r() < 0.5 ? 0 : 1)),
  }))
}
/** indici (heap) dei nodi interni lungo il percorso, e la foglia raggiunta */
function route(t: Tree, x: number[]) {
  const path = [0]
  let k = 0
  for (let d = 0; d < 3; d++) {
    k = 2 * k + (x[t.vars[k]] > t.thr[k] ? 2 : 1)
    if (d < 2) path.push(k)
  }
  return { path, leaf: k - 7 }
}

export function RandomForest() {
  const [seed, setSeed] = useState(0)
  const [xs, setXs] = useState(0)
  const forest = useMemo(() => makeForest(seed), [seed])
  const x = useMemo(() => {
    const r = rng(99 + xs * 31)
    return Array.from({ length: NVARS }, () => r())
  }, [xs])
  const routes = forest.map((t) => route(t, x))
  const votes = forest.map((t, i) => t.leaves[routes[i].leaf])
  const y = votes.reduce((s, v) => s + v, 0) >= 2 ? 1 : 0
  const TW = 178
  const X0 = [8, 206, 404]
  const nodeX = (k: number, tx: number) => {
    const d = Math.floor(Math.log2(k + 1))
    const i = k - (2 ** d - 1)
    return tx + ((i + 0.5) * TW) / 2 ** d
  }
  const nodeY = (k: number) => 78 + Math.floor(Math.log2(k + 1)) * 38
  return (
    <div>
      <div className="pipe16__scroll">
      <svg className="rf18" viewBox="0 0 590 300" style={{ minWidth: 540 }} role="img" aria-label={tx('Random Forest: tre alberi di decisione randomizzati, le cui uscite vengono combinate', 'Random Forest: three randomized decision trees, whose outputs are combined')}>
        <text className="rf18__x" x={295} y={20} textAnchor="middle">
          x
        </text>
        {X0.map((tx, t) => (
          <line key={t} className="rf18__feed" x1={295} y1={26} x2={nodeX(0, tx)} y2={66} />
        ))}
        {forest.map((tree, t) => {
          const tx = X0[t]
          const { path, leaf } = routes[t]
          const onPath = new Set(path)
          return (
            <g key={t}>
              {Array.from({ length: 14 }, (_, q) => {
                const child = q + 1
                const parent = Math.floor((child - 1) / 2)
                const hot = child < 7 ? onPath.has(child) : child - 7 === leaf
                return (
                  <line
                    key={q}
                    className={'rf18__edge' + (hot ? ' is-hot' : '')}
                    x1={nodeX(parent, tx)}
                    y1={nodeY(parent)}
                    x2={nodeX(child, tx)}
                    y2={nodeY(child)}
                  />
                )
              })}
              {Array.from({ length: 7 }, (_, k) => (
                <g key={k} className={'rf18__node' + (onPath.has(k) ? ' is-hot' : '')}>
                  <circle cx={nodeX(k, tx)} cy={nodeY(k)} r={10.5} />
                  <text x={nodeX(k, tx)} y={nodeY(k) + 3.6} textAnchor="middle">
                    {svgScript('x', String(tree.vars[k] + 1))}
                  </text>
                </g>
              ))}
              {tree.leaves.map((c, i) => (
                <g key={i} className={'rf18__leaf' + (i === leaf ? ' is-hot' : '') + (c ? ' is-1' : '')}>
                  <rect x={nodeX(i + 7, tx) - 8} y={nodeY(i + 7) - 8} width={16} height={16} rx={4} />
                  <text x={nodeX(i + 7, tx)} y={nodeY(i + 7) + 3.8} textAnchor="middle">
                    {c}
                  </text>
                </g>
              ))}
              <line className="rf18__feed" x1={nodeX(leaf + 7, tx)} y1={nodeY(7) + 10} x2={295 + (t - 1) * 14} y2={250} />
            </g>
          )
        })}
        <text className="rf18__dots" x={394} y={120} textAnchor="middle">
          …
        </text>
        <Die x={24} y={40} />
        <Die x={50} y={34} face={3} />
        <circle className="rf18__sum" cx={295} cy={262} r={12} />
        <text className="rf18__plus" x={295} y={267.5} textAnchor="middle">
          +
        </text>
        <text className="rf18__x" x={318} y={268}>
          y = {y}
        </text>
      </svg>
      </div>
      <Controls>
        <div className="readouts">
          <Readout label={tx('voti dei tre alberi', 'votes of the three trees')} value={votes.join(' · ')} />
          <Readout
            label={tx('uscita dell’ensemble', 'ensemble output')}
            tone="accent"
            value={String(y)}
            sub={tx('la classe più votata', 'the most voted class')}
          />
        </div>
        <Btn icon="play" variant="soft" onClick={() => setXs(xs + 1)}>
          {tx('Nuovo input x', 'New input x')}
        </Btn>
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          {tx('Rilancia i dadi (nuova foresta)', 'Reroll the dice (new forest)')}
        </Btn>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            In ogni nodo è scritta la variabile di input, scelta a caso, su cui l’albero divide; i quadrati sono le foglie con la classe. Il
            percorso evidenziato è quello seguito dall’input x.
          </>,
          <>
            Each node shows the input variable, chosen at random, on which the tree splits; the squares are the leaves with the class. The
            highlighted path is the one followed by the input x.
          </>,
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Presenta qualche input nuovo: ogni albero segue il proprio percorso e dà il proprio voto.',
              'Present a few new inputs: each tree follows its own path and casts its own vote.',
            ),
            done: xs >= 2,
          },
          {
            label: tx(
              'Rilancia i dadi: cambiano le variabili scelte nei nodi, e quindi gli alberi.',
              'Reroll the dice: the variables chosen in the nodes change, and so do the trees.',
            ),
            done: seed >= 1,
          },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ schemi a blocchi (18.2, 18.3) */

type Block = { id: string; lines: string[]; kind: 'oval' | 'rand' | 'plain' | 'trained' | 'text'; w: number; title: string; text: string }

function BlockDiagram({
  blocks,
  links,
  initial,
  aria,
  shuffle,
}: {
  blocks: Block[]
  /** etichette sotto le frecce tra un blocco e il successivo */
  links?: (ReactNode | null)[]
  initial: string
  aria: string
  /** disegna connessioni casuali tra i primi due blocchi, rimescolabili */
  shuffle?: boolean
}) {
  const [sel, setSel] = useState(initial)
  const [n, setN] = useState(0)
  const [seed, setSeed] = useState(0)
  const GAP = shuffle ? 70 : 62
  const xs: number[] = []
  let acc = 12
  for (const b of blocks) {
    xs.push(acc)
    acc += b.w + GAP
  }
  const W = acc - GAP + 12
  const MID = 78
  const BH = 76
  const cur = blocks.find((b) => b.id === sel) ?? blocks[0]
  const wires = useMemo(() => {
    const r = rng(1820 + seed * 17)
    return Array.from({ length: 9 }, () => [r(), r()])
  }, [seed])
  return (
    <div>
      <div className="pipe16__scroll">
        <svg className="blk18" viewBox={`0 0 ${W} 170`} style={{ minWidth: Math.min(W, 560) }} role="img" aria-label={aria}>
          {blocks.slice(0, -1).map((b, i) => {
            const x1 = xs[i] + b.w + 5
            const x2 = xs[i + 1] - 7
            if (shuffle && i === 0)
              return (
                <g key={b.id}>
                  {wires.map(([a, c], q) => (
                    <line key={q} className="blk18__wire" x1={x1 - 3} y1={MID - 26 + a * 52} x2={x2 + 3} y2={MID - 30 + c * 60} />
                  ))}
                </g>
              )
            return (
              <g key={b.id}>
                <line className="blk18__arrow" x1={x1} y1={MID} x2={x2 - 8} y2={MID} />
                <path className="blk18__head" d={`M${x2},${MID}l-10,-6v12z`} />
                {links?.[i] && (
                  <text className="blk18__link" x={(x1 + x2) / 2} y={MID + BH / 2 + 26} textAnchor="middle">
                    {links[i]}
                  </text>
                )}
              </g>
            )
          })}
          {blocks.map((b, i) => {
            const on = b.id === sel
            const cx = xs[i] + b.w / 2
            const pick = () => {
              setSel(b.id)
              setN(n + 1)
            }
            return (
              <g
                key={b.id}
                className={`blk18__b blk18__b--${b.kind}` + (on ? ' is-on' : '')}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={b.title}
                onClick={pick}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
              >
                {b.kind === 'oval' ? (
                  <ellipse cx={cx} cy={MID} rx={b.w / 2} ry={BH / 2 + 2} />
                ) : (
                  <rect x={xs[i]} y={MID - BH / 2} width={b.w} height={BH} rx={b.kind === 'text' ? 8 : 12} />
                )}
                {b.lines.map((ln, q) => (
                  <text key={q} x={cx} y={MID + 5 + (q - (b.lines.length - 1) / 2) * 17} textAnchor="middle">
                    {ln}
                  </text>
                ))}
                {b.kind === 'rand' && (
                  <>
                    <Die x={xs[i] + b.w - 30} y={MID - BH / 2 - 4} />
                    <Die x={xs[i] + b.w - 6} y={MID - BH / 2 + 4} face={3} />
                  </>
                )}
              </g>
            )
          })}
          {shuffle && (
            <>
              <Die x={xs[0] + blocks[0].w + GAP / 2 - 12} y={MID + 52} />
              <Die x={xs[0] + blocks[0].w + GAP / 2 + 12} y={MID + 56} face={2} />
            </>
          )}
        </svg>
      </div>
      <div className="wpanel">
        <div className="wpanel__title">{cur.title}</div>
        {cur.text}
      </div>
      <Controls>
        {shuffle && (
          <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
            {tx('Rilancia i dadi (nuove connessioni)', 'Reroll the dice (new connections)')}
          </Btn>
        )}
      </Controls>
      <Tasks
        items={
          shuffle
            ? [
                {
                  label: tx(
                    'Rilancia i dadi: le connessioni tra la retina e l’area di proiezione sono casuali, non apprese.',
                    'Reroll the dice: the connections between the retina and the projection area are random, not learned.',
                  ),
                  done: seed >= 1,
                },
                {
                  label: tx('Clicca «Risposte»: è l’unica parte che veniva appresa.', 'Click “Responses”: it is the only part that was learned.'),
                  done: sel === 'resp',
                },
              ]
            : [
                {
                  label: tx(
                    'Clicca i due strati: uno è casuale e non si addestra, l’altro è l’unico addestrato.',
                    'Click the two layers: one is random and is not trained, the other is the only one trained.',
                  ),
                  done: n >= 2,
                },
              ]
        }
      />
    </div>
  )
}

export function RosenblattAreas() {
  return (
    <BlockDiagram
      shuffle
      initial="a1"
      aria={tx(
        'Il Perceptron di Rosenblatt: retina, area di proiezione, area di associazione, risposte',
        'Rosenblatt’s Perceptron: retina, projection area, association area, responses',
      )}
      blocks={[
        {
          id: 'ret',
          lines: ['Retina'],
          kind: 'oval',
          w: 96,
          title: 'Retina',
          text: tx(
            'I sensori di ingresso: da qui partono le connessioni verso l’area di proiezione.',
            'The input sensors: the connections toward the projection area start from here.',
          ),
        },
        {
          id: 'a1',
          lines: ['Area I', tx('area di proiezione', 'projection area')],
          kind: 'plain',
          w: 146,
          title: tx('Area di proiezione (A I)', 'Projection area (A I)'),
          text: tx(
            'È connessa alla retina in modo casuale: le connessioni non vengono apprese.',
            'It is randomly connected to the retina: the connections are not learned.',
          ),
        },
        {
          id: 'a2',
          lines: ['Area II', tx('area di associazione', 'association area')],
          kind: 'plain',
          w: 150,
          title: tx('Area di associazione (A II)', 'Association area (A II)'),
          text: tx(
            'È alimentata dall’area di proiezione, e a sua volta alimenta le risposte.',
            'It is fed by the projection area, and in turn feeds the responses.',
          ),
        },
        {
          id: 'resp',
          lines: [tx('Risposte', 'Responses')],
          kind: 'trained',
          w: 104,
          title: tx('Risposte', 'Responses'),
          text: tx('Solo le risposte finali venivano apprese.', 'Only the final responses were learned.'),
        },
      ]}
    />
  )
}

export function Structure() {
  return (
    <BlockDiagram
      initial="hid"
      aria={tx(
        'Struttura generale di una rete randomizzata: input, strato nascosto non addestrato, readout addestrato, output',
        'General structure of a randomized network: input, untrained hidden layer, trained readout, output',
      )}
      links={[null, <tspan key="phi">{tx('rappresentazione delle feature φ', 'feature representation φ')}</tspan>, null]}
      blocks={[
        { id: 'in', lines: ['input'], kind: 'text', w: 62, title: 'Input', text: tx('Il pattern di ingresso.', 'The input pattern.') },
        {
          id: 'hid',
          lines: tx(['Strato nascosto', 'non addestrato'], ['Hidden layer', 'untrained']),
          kind: 'rand',
          w: 150,
          title: tx('Strato nascosto (non addestrato)', 'Hidden layer (untrained)'),
          text: tx(
            'Immerge in modo non lineare l’input in uno spazio delle feature ad alta dimensione, dove il problema ha più probabilità di essere risolvibile linearmente (è una LBE). Ha una base teorica nel teorema di Cover.',
            'It non-linearly embeds the input into a high-dimensional feature space, where the problem is more likely to be linearly solvable (it is an LBE). It has a theoretical basis in Cover’s theorem.',
          ),
        },
        {
          id: 'out',
          lines: ['Readout', tx('addestrato', 'trained')],
          kind: 'trained',
          w: 210,
          title: tx('Readout (addestrato)', 'Readout (trained)'),
          text: tx(
            'Combina le feature dello spazio nascosto per calcolare l’uscita; tipicamente è un modello lineare.',
            'It combines the features of the hidden space to compute the output; typically it is a linear model.',
          ),
        },
        { id: 'o', lines: ['output'], kind: 'text', w: 66, title: 'Output', text: tx('L’uscita della rete.', 'The output of the network.') },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ Fig. 18.4: rete feedforward randomizzata */

const target = (x: number) => Math.sin(2 * Math.PI * x)
const DATA = (() => {
  const r = rng(1844)
  const xs = Array.from({ length: 30 }, (_, i) => (i + 0.15 + 0.7 * r()) / 30)
  return { xs, ds: xs.map((x) => target(x) + 0.2 * gauss(r)) }
})()
const TEST = (() => {
  const r = rng(1845)
  const xs = Array.from({ length: 300 }, () => r())
  return { xs, ds: xs.map((x) => target(x) + 0.2 * gauss(r)) }
})()
const MAXU = 100

/** W: pesi e bias casuali (rumore gaussiano) per le unità nascoste, fissati una volta per tutte */
function randomW(seed: number) {
  const r = rng(1880 + seed * 53)
  return Array.from({ length: MAXU }, () => ({ w: 9 * gauss(r), b: 5 * gauss(r) }))
}

function fitReadout(W: { w: number; b: number }[], nu: number, lambda: number) {
  const hid = (x: number) => [1, ...W.slice(0, nu).map((u) => Math.tanh(u.w * x + u.b))]
  const H = DATA.xs.map(hid)
  const n = nu + 1
  const s = Math.sqrt(lambda)
  // minimi quadrati con penalità λ‖W_out‖² (intercetta esclusa): matrice aumentata [H; √λ I]
  const pen = Array.from({ length: nu }, (_, j) => Array.from({ length: n }, (_, i) => (i === j + 1 ? s : 0)))
  const wout = lstsq([...H, ...pen], [...DATA.ds, ...new Array(nu).fill(0)])
  const out = (x: number) => hid(x).reduce((a, h, i) => a + h * wout[i], 0)
  const mse = (d: { xs: number[]; ds: number[] }) => d.xs.reduce((a, x, i) => a + (d.ds[i] - out(x)) ** 2, 0) / d.xs.length
  return { out, tr: mse(DATA), ts: mse(TEST) }
}

export function RandomNet() {
  const [nu, setNu] = useState(3)
  const [lnL, setLnL] = useState(-6)
  const [seed, setSeed] = useState(0)
  const W = useMemo(() => randomW(seed), [seed])
  const fit = useMemo(() => fitReadout(W, nu, Math.exp(lnL)), [W, nu, lnL])
  const seen = useLatch({ many: nu >= 40, reg: nu >= 40 && lnL >= -2, dice: seed >= 1 })
  const hy = (i: number, n: number) => 30 + (i * 150) / (n - 1)
  return (
    <div>
      <div className="wgrid">
        <div>
          <div className="wbar">
            <Legend
              items={[
                { label: tx('dati di training', 'training data'), color: 'var(--c-blue)', kind: 'dot' },
                { label: tx('funzione vera', 'true function'), color: 'var(--c-green)' },
                { label: tx('uscita della rete', 'network output'), color: 'var(--c-red)' },
              ]}
            />
          </div>
          <Plot xDomain={[0, 1]} yDomain={[-1.7, 1.7]} aspect={0.68} minH={230}>
            <Axes xTicks={[0, 0.5, 1]} yTicks={[-1, 0, 1]} xLabel="x" yLabel="o(x)" />
            <FnPath f={target} color="var(--c-green)" width={2} />
            <FnPath f={fit.out} color="var(--c-red)" width={2.4} samples={400} />
            {DATA.xs.map((x, i) => (
              <Dot key={i} x={x} y={DATA.ds[i]} color="var(--c-blue)" r={3.6} />
            ))}
          </Plot>
        </div>
        <div className="wside">
          <svg className="rn18" viewBox="0 0 260 210" role="img" aria-label={tx('Rete con pesi nascosti casuali W e readout addestrato W out', 'Network with random hidden weights W and trained readout W out')}>
            {[0, 1, 2].map((i) => [0, 1, 2, 3, 4].map((j) => <line key={`${i}-${j}`} className="rn18__w" x1={46} y1={70 + i * 34} x2={126} y2={hy(j, 5)} />))}
            {[0, 1, 2, 3, 4].map((j) => [0, 1].map((k) => <line key={`${j}-${k}`} className="rn18__wout" x1={134} y1={hy(j, 5)} x2={212} y2={88 + k * 34} />))}
            {[0, 1, 2].map((i) => (
              <circle key={i} className="rn18__in" cx={40} cy={70 + i * 34} r={9} />
            ))}
            {[0, 1, 2, 3, 4].map((j) => (j === 3 ? null : <circle key={j} className="rn18__h" cx={130} cy={hy(j, 5)} r={9} />))}
            <text className="rn18__dots" x={130} y={hy(3, 5) + 5} textAnchor="middle">
              ⋮
            </text>
            {[0, 1].map((k) => (
              <circle key={k} className="rn18__o" cx={218} cy={88 + k * 34} r={9} />
            ))}
            <text className="rn18__t" x={40} y={196} textAnchor="middle">
              input x
            </text>
            <text className="rn18__t" x={130} y={206} textAnchor="middle">
              h
            </text>
            <text className="rn18__t" x={218} y={150} textAnchor="middle">
              readout o
            </text>
            <text className="rn18__m" x={76} y={36} textAnchor="middle">
              W
            </text>
            <text className="rn18__m" x={180} y={62} textAnchor="middle">
              {svgScript('W', 'out', 'sup')}
            </text>
            <Die x={52} y={22} s={18} />
            <Die x={30} y={28} s={18} face={3} />
          </svg>
          <div className="readouts">
            <Readout label={tx('errore di training', 'training error')} tone="blue" value={fmt(fit.tr, 3)} />
            <Readout label={tx('errore di test', 'test error')} tone="orange" value={fmt(fit.ts, 3)} />
          </div>
        </div>
      </div>
      <Controls>
        <Slider label={tx('unità nascoste (casuali)', 'hidden units (random)')} min={1} max={MAXU} step={1} value={nu} onChange={setNu} width={220} />
        <Slider
          label={<Tex>{'\\ln\\lambda'}</Tex>}
          min={-12}
          max={2}
          step={0.5}
          value={lnL}
          onChange={setLnL}
          format={(v) => fmt(v, 1)}
          width={170}
        />
        <Btn icon="reset" onClick={() => setSeed(seed + 1)}>
          {tx('Rilancia i dadi (nuova W)', 'Reroll the dice (new W)')}
        </Btn>
      </Controls>
      <p className="wnote">
        {tx(
          <>
            Le unità nascoste sono <Tex>{'\\tanh(w x + b)'}</Tex> con <Tex>{'w'}</Tex> e <Tex>{'b'}</Tex> estratti a caso e mai modificati. Si
            calcola solo <Tex>{'\\mathbf{W}^{out}'}</Tex>, in un passo, con i minimi quadrati regolarizzati.
          </>,
          <>
            The hidden units are <Tex>{'\\tanh(w x + b)'}</Tex> with <Tex>{'w'}</Tex> and <Tex>{'b'}</Tex> drawn at random and never modified.
            Only <Tex>{'\\mathbf{W}^{out}'}</Tex> is computed, in one step, with regularized least squares.
          </>,
        )}
      </p>
      <Tasks
        items={[
          {
            label: tx(
              'Con poche unità casuali il readout lineare non basta. Aumentale oltre 40: l’espansione in basi diventa sufficiente.',
              'With few random units the linear readout is not enough. Increase them beyond 40: the basis expansion becomes sufficient.',
            ),
            done: seen.many,
          },
          {
            label: tx(
              'Con molte unità alza λ (ln λ sopra −2): la regolarizzazione liscia l’uscita.',
              'With many units raise λ (ln λ above −2): regularization smooths the output.',
            ),
            done: seen.reg,
          },
          {
            label: tx(
              'Rilancia i dadi: lo strato nascosto cambia del tutto, ma con molte unità il risultato resta buono.',
              'Reroll the dice: the hidden layer changes completely, but with many units the result stays good.',
            ),
            done: seen.dice,
          },
        ]}
      />
    </div>
  )
}
