import { useState } from 'react'

/** Fig. 3.9: un sistema induttivo equivale a un sistema deduttivo che riceve anche il bias induttivo. */
type Key = 'ex' | 'inst' | 'bias' | 'out' | null

const TIPS: Record<Exclude<Key, null>, string> = {
  ex: 'Gli esempi di training: le coppie ⟨x, d⟩ note.',
  inst: 'La nuova istanza da classificare, mai vista prima.',
  bias: 'Il bias induttivo, dato come assioma aggiuntivo: è esattamente ciò che rende la risposta «logicamente deducibile».',
  out: 'La classificazione della nuova istanza, oppure «non so».',
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
          esempi di training
        </text>
        <line x1={8} y1={46} x2={236} y2={46} markerEnd="url(#ind-arr)" />
      </g>
      <g {...g('inst')}>
        <text x={8} y={84}>
          nuova istanza
        </text>
        <line x1={8} y1={94} x2={236} y2={94} markerEnd="url(#ind-arr)" />
      </g>
      {withBias && (
        <g {...g('bias')}>
          <text x={8} y={132}>
            bias induttivo
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
          che usa lo spazio delle ipotesi H
        </text>
      )}
      <g {...g('out')}>
        <line x1={490} y1={withBias ? 88 : 66} x2={560} y2={withBias ? 88 : 66} markerEnd="url(#ind-arr)" />
        <text x={568} y={withBias ? 82 : 60}>
          classificazione della
        </text>
        <text x={568} y={withBias ? 100 : 78}>
          nuova istanza, o «non so»
        </text>
      </g>
    </g>
  )
  return (
    <div className="ind">
      <svg viewBox="0 0 760 400" className="ind__svg" role="img" aria-label="Sistema induttivo e sistema deduttivo equivalente">
        <defs>
          <marker id="ind-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10z" className="ind__head" />
          </marker>
        </defs>
        {row(34, 'sistema induttivo', 'algoritmo di apprendimento', false)}
        {row(212, 'sistema deduttivo equivalente', 'dimostratore di teoremi', true)}
        <text x={380} y={196} textAnchor="middle" className="ind__eq">
          ≡
        </text>
      </svg>
      <p className="ind__tip" aria-live="polite">
        {hot ? TIPS[hot] : 'Passa sulle frecce: stessi ingressi, stessa uscita — più il bias induttivo come assioma.'}
      </p>
    </div>
  )
}
