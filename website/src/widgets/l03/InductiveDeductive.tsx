import { useState } from 'react'
import { tx } from '../../lib/i18n'

/** Fig. 3.9: un sistema induttivo equivale a un sistema deduttivo che riceve anche il bias induttivo. */
type Key = 'ex' | 'inst' | 'bias' | 'out' | null

const TIPS: Record<Exclude<Key, null>, string> = {
  ex: tx('Gli esempi di training: le coppie ⟨x, d⟩ note.', 'Training examples: the known ⟨x, d⟩ pairs.'),
  inst: tx('La nuova istanza da classificare, mai vista prima.', 'The new instance to be classified, never seen before.'),
  bias: tx('Il bias induttivo, dato come assioma aggiuntivo: è esattamente ciò che rende la risposta «logicamente deducibile».', 'The inductive bias, given as an additional axiom: this is exactly what makes the answer "logically deducible."'),
  out: tx('La classificazione della nuova istanza, oppure «non so».', 'The classification of the new instance, or "don’t know."'),
}

export function InductiveDeductive() {
  const [hot, setHot] = useState<Key>(null)
  const g = (k: Exclude<Key, null>) => ({
    onMouseEnter: () => setHot(k),
    onMouseLeave: () => setHot(null),
    className: `ind__in${hot === k ? ' is-hot' : ''}${k === 'bias' ? ' ind__in--bias' : ''}`,
  })
  const row = (y: number, title: string, box: string, withBias: boolean) => (
    <g transform={`translate(0 ${y})`}>
      <text x={250} y={-14} className="ind__title">
        {title}
      </text>
      <g {...g('ex')}>
        <text x={8} y={36}>
          {tx('esempi di training', 'training examples')}
        </text>
        <line x1={8} y1={46} x2={236} y2={46} markerEnd="url(#ind-arr)" />
      </g>
      <g {...g('inst')}>
        <text x={8} y={84}>
          {tx('nuova istanza', 'new instance')}
        </text>
        <line x1={8} y1={94} x2={236} y2={94} markerEnd="url(#ind-arr)" />
      </g>
      {withBias && (
        <g {...g('bias')}>
          <text x={8} y={132}>
            {tx('bias induttivo', 'inductive bias')}
          </text>
          <line x1={8} y1={142} x2={236} y2={142} markerEnd="url(#ind-arr)" />
        </g>
      )}
      <rect x={240} y={14} width={250} height={withBias ? 146 : 104} rx={12} className="ind__box" />
      <text x={258} y={44} className="ind__boxtxt">
        {box}
      </text>
      {!withBias && (
        <text x={258} y={96} className="ind__boxsub">
          {tx('che usa lo spazio delle ipotesi H', 'using hypothesis space H')}
        </text>
      )}
      <g {...g('out')}>
        <line x1={490} y1={withBias ? 88 : 66} x2={560} y2={withBias ? 88 : 66} markerEnd="url(#ind-arr)" />
        <text x={568} y={withBias ? 82 : 60}>
          {tx('classificazione della', 'classification of')}
        </text>
        <text x={568} y={withBias ? 100 : 78}>
          {tx('nuova istanza, o «non so»', 'new instance, or "don’t know"')}
        </text>
      </g>
    </g>
  )
  return (
    <div className="ind">
      <svg viewBox="0 0 760 404" className="ind__svg" role="img" aria-label={tx('Sistema induttivo e sistema deduttivo equivalente', 'Inductive system and equivalent deductive system')}>
        <defs>
          <marker id="ind-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10z" className="ind__head" />
          </marker>
        </defs>
        {row(34, tx('sistema induttivo', 'inductive system'), tx('algoritmo di apprendimento', 'learning algorithm'), false)}
        {row(228, tx('sistema deduttivo equivalente', 'equivalent deductive system'), tx('dimostratore di teoremi', 'theorem prover'), true)}
        <text x={365} y={197} textAnchor="middle" className="ind__eq">
          ≡
        </text>
      </svg>
      <p className="ind__tip" aria-live="polite">
        {hot ? TIPS[hot] : tx('Passa sulle frecce: stessi ingressi, stessa uscita — più il bias induttivo come assioma.', 'Hover over arrows: same inputs, same output — plus inductive bias as an axiom.')}
      </p>
    </div>
  )
}
