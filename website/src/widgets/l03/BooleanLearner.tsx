import { useMemo, useState } from 'react'
import { Tasks } from '../../components/prose/Figure'
import { Tex } from '../../components/prose/Tex'
import { Btn, Readout, Segmented } from '../../components/ui/Controls'
import { useLatch } from '../../lib/useLatch'

/**
 * Fig. 3.8 + il teorema sull'unbiased learner, da toccare con mano.
 * Tutte le 16 istanze di (x1, x2, x3, x4); 7 sono esempi di training.
 * Senza bias il version space non sa dire nulla sulle istanze non viste;
 * con il language bias "solo congiunzioni" le classifica tutte.
 */

type Label = 0 | 1
type Lit = 'pos' | 'neg' | 'any'
type Conj = Lit[] | 'false'

const bits = (i: number) => [(i >> 3) & 1, (i >> 2) & 1, (i >> 1) & 1, i & 1]
const idx = (b: number[]) => b[0] * 8 + b[1] * 4 + b[2] * 2 + b[3]

// Tabella 1 delle slide (Mitchell): gli esempi 1..7
const TABLE: { x: number[]; y: Label }[] = [
  { x: [0, 0, 1, 0], y: 0 },
  { x: [0, 1, 0, 0], y: 0 },
  { x: [0, 0, 1, 1], y: 1 },
  { x: [1, 0, 0, 1], y: 1 },
  { x: [0, 1, 1, 0], y: 0 },
  { x: [1, 1, 0, 0], y: 0 },
  { x: [0, 1, 0, 1], y: 0 },
]
const initialTR = () => new Map<number, Label>(TABLE.map((e) => [idx(e.x), e.y]))
const exampleNo = new Map(TABLE.map((e, k) => [idx(e.x), k + 1]))

const CONJS: Conj[] = (() => {
  const out: Conj[] = []
  const L: Lit[] = ['pos', 'neg', 'any']
  for (const a of L) for (const b of L) for (const c of L) for (const d of L) out.push([a, b, c, d])
  out.push('false')
  return out
})()

const evalConj = (h: Conj, b: number[]) =>
  h === 'false' ? 0 : h.every((l, k) => l === 'any' || (l === 'pos' ? b[k] === 1 : b[k] === 0)) ? 1 : 0

function conjTex(h: Conj) {
  if (h === 'false') return '\\text{false}'
  const lits = h.map((l, k) => (l === 'pos' ? `x_${k + 1}` : l === 'neg' ? `\\neg x_${k + 1}` : null)).filter(Boolean)
  return lits.length ? lits.join(' \\wedge ') : '\\text{true}'
}

export function BooleanLearner() {
  const [mode, setMode] = useState<'all' | 'conj'>('all')
  const [tr, setTr] = useState(initialTR)
  const [done, setDone] = useState({ halve: false })

  const vs = useMemo(() => CONJS.filter((h) => [...tr].every(([i, y]) => evalConj(h, bits(i)) === y)), [tr])
  const unseen = 16 - tr.size
  const vsAllLog2 = unseen // |VS| = 2^unseen

  const seen = useLatch({ conj: mode === 'conj', empty: mode === 'conj' && vs.length === 0 })

  const add = (i: number, y: Label) => {
    setTr((m) => new Map(m).set(i, y))
    if (mode === 'all') setDone({ halve: true })
  }
  const flip = (i: number) => setTr((m) => new Map(m).set(i, m.get(i) === 1 ? 0 : 1))
  const remove = (i: number) =>
    setTr((m) => {
      const n = new Map(m)
      n.delete(i)
      return n
    })

  const prediction = (i: number) => {
    if (mode === 'all') return { p1: 0.5, n: 2 ** vsAllLog2 }
    if (!vs.length) return { p1: NaN, n: 0 }
    const ones = vs.filter((h) => evalConj(h, bits(i)) === 1).length
    return { p1: ones / vs.length, n: vs.length }
  }
  const certain = [...Array(16).keys()].filter((i) => !tr.has(i)).filter((i) => {
    const p = prediction(i).p1
    return p === 0 || p === 1
  }).length

  return (
    <div className="bool">
      <div className="wbar">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'all', label: 'Nessun bias: tutte le funzioni' },
            { value: 'conj', label: 'Language bias: solo congiunzioni' },
          ]}
        />
        <Btn icon="reset" onClick={() => setTr(initialTR())}>
          Esempi della tabella
        </Btn>
      </div>

      <div className="bool__stats readouts">
        <Readout
          label={mode === 'all' ? <Tex>{'|H| = 2^{2^n}'}</Tex> : <Tex>{'|H| = 3^n + 1'}</Tex>}
          value={mode === 'all' ? '65 536' : '82'}
          sub={mode === 'all' ? 'con n = 4: 2^16 funzioni' : 'con n = 4: 81 + «false»'}
        />
        <Readout label="esempi di training" value={String(tr.size)} sub={`${unseen} istanze non viste`} />
        <Readout
          label="version space |VS|"
          tone="accent"
          value={mode === 'all' ? (vsAllLog2 > 16 ? '—' : (2 ** vsAllLog2).toLocaleString('it-IT')) : String(vs.length)}
          sub={mode === 'all' ? `= 2^${unseen}: ogni istanza non vista può valere 0 o 1` : 'ipotesi consistenti con tutti gli esempi'}
        />
        <Readout label="non viste classificate con certezza" value={`${certain} su ${unseen}`} />
      </div>

      <div className="bool__table-wrap">
        <table className="bool__table">
          <thead>
            <tr>
              <th>es.</th>
              <th>
                <Tex>x_1</Tex>
              </th>
              <th>
                <Tex>x_2</Tex>
              </th>
              <th>
                <Tex>x_3</Tex>
              </th>
              <th>
                <Tex>x_4</Tex>
              </th>
              <th>y (training) o voto del version space</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...Array(16).keys()].map((i) => {
              const b = bits(i)
              const y = tr.get(i)
              const isTr = y !== undefined
              const pr = prediction(i)
              return (
                <tr key={i} className={isTr ? 'is-train' : 'is-unseen'}>
                  <td className="bool__no">{isTr ? (exampleNo.get(i) ?? '+') : ''}</td>
                  {b.map((v, k) => (
                    <td key={k} className="bool__bit">
                      {v}
                    </td>
                  ))}
                  <td>
                    {isTr ? (
                      <button className={`bool__y bool__y--${y}`} onClick={() => flip(i)} title="Cambia l’etichetta">
                        y = {y}
                      </button>
                    ) : Number.isNaN(pr.p1) ? (
                      <span className="bool__none">VS vuoto: nessuna risposta</span>
                    ) : (
                      <Vote p1={pr.p1} />
                    )}
                  </td>
                  <td className="bool__act">
                    {isTr ? (
                      <button className="bool__mini" onClick={() => remove(i)} title="Togli dal training set">
                        togli
                      </button>
                    ) : (
                      <>
                        <button className="bool__mini" onClick={() => add(i, 0)} title="Aggiungi come esempio con y = 0">
                          +0
                        </button>
                        <button className="bool__mini" onClick={() => add(i, 1)} title="Aggiungi come esempio con y = 1">
                          +1
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {mode === 'conj' && (
        <div className="wpanel bool__vs">
          <div className="wpanel__title">Il version space ({vs.length})</div>
          {vs.length ? (
            <div className="bool__hyps">
              {vs.slice(0, 12).map((h, k) => (
                <span key={k} className="chip">
                  <Tex>{conjTex(h)}</Tex>
                </span>
              ))}
              {vs.length > 12 && <span className="wnote">… e altre {vs.length - 12}</span>}
            </div>
          ) : (
            <p className="wnote">
              Nessuna congiunzione è consistente con questi esempi: il concetto target non è esprimibile in H. È il prezzo del
              language bias.
            </p>
          )}
        </div>
      )}

      <Tasks
        items={[
          { label: 'Senza bias, aggiungi un esempio (+0 o +1): il version space si dimezza, ma le istanze non viste restano al 50%.', done: done.halve },
          { label: 'Passa a «solo congiunzioni»: con gli stessi 7 esempi ogni istanza non vista riceve una risposta.', done: seen.conj },
          { label: 'Con le congiunzioni, cambia le etichette fino a svuotare il version space.', done: seen.empty },
        ]}
      />
    </div>
  )
}

function Vote({ p1 }: { p1: number }) {
  const certain = p1 === 0 || p1 === 1
  return (
    <span className={`vote${certain ? ' is-certain' : ''}`}>
      <span className="vote__bar">
        <span className="vote__one" style={{ width: `${p1 * 100}%` }} />
      </span>
      <span className="vote__txt">{certain ? `h = ${p1}` : p1 === 0.5 ? '50% dice 1 · 50% dice 0' : `${Math.round(p1 * 100)}% dice 1`}</span>
    </span>
  )
}
