import type { ReactNode } from 'react'

/**
 * Disegno di una rete a strati in SVG (viewBox fisso, scala con la larghezza).
 * Le unità sono cerchi; gli archi vanno da uno strato al successivo (o come indicato in `edges`).
 * Tutti i colori vengono dai token: nodi in `--surface`, attivazione come riempimento colorato.
 */

export type NodeId = `${number}:${number}`
export type NetNode = {
  id: NodeId
  x: number
  y: number
  label?: ReactNode
  /** valore in [0, 1] (o [−1, 1]) usato per colorare il nodo */
  value?: number
  kind?: 'input' | 'hidden' | 'output' | 'bias'
}
export type NetEdge = { from: NodeId; to: NodeId; w?: number; label?: ReactNode; dash?: boolean }

export function layout(sizes: number[], W: number, H: number, padX = 60, padY = 36): NetNode[] {
  const nodes: NetNode[] = []
  sizes.forEach((n, l) => {
    const y = H - padY - (l * (H - 2 * padY)) / Math.max(1, sizes.length - 1)
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? W / 2 : padX + (i * (W - 2 * padX)) / (n - 1)
      nodes.push({ id: `${l}:${i}`, x, y, kind: l === 0 ? 'input' : l === sizes.length - 1 ? 'output' : 'hidden' })
    }
  })
  return nodes
}

/** tutti gli archi tra strati consecutivi */
export function fullEdges(sizes: number[]): NetEdge[] {
  const out: NetEdge[] = []
  for (let l = 0; l + 1 < sizes.length; l++)
    for (let i = 0; i < sizes[l]; i++) for (let j = 0; j < sizes[l + 1]; j++) out.push({ from: `${l}:${i}`, to: `${l + 1}:${j}` })
  return out
}

type Props = {
  W: number
  H: number
  nodes: NetNode[]
  edges: NetEdge[]
  r?: number
  /** nodi e archi evidenziati */
  hot?: Set<string>
  /** strati attivi (per l'animazione feedforward): i nodi degli altri strati sono attenuati */
  dimOthers?: boolean
  onNodeEnter?: (id: NodeId | null) => void
  onNodeClick?: (id: NodeId) => void
  className?: string
  ariaLabel: string
  children?: ReactNode
}

export function NetSvg({ W, H, nodes, edges, r = 18, hot, dimOthers, onNodeEnter, onNodeClick, className, ariaLabel, children }: Props) {
  const pos = new Map(nodes.map((n) => [n.id, n]))
  const maxW = Math.max(1, ...edges.map((e) => Math.abs(e.w ?? 0)))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`net${className ? ' ' + className : ''}`} role="img" aria-label={ariaLabel}>
      <defs>
        <marker id="net-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" className="net__arrowhead" />
        </marker>
      </defs>
      {edges.map((e, k) => {
        const a = pos.get(e.from)
        const b = pos.get(e.to)
        if (!a || !b) return null
        const dx = b.x - a.x
        const dy = b.y - a.y
        const L = Math.hypot(dx, dy) || 1
        const x1 = a.x + (dx / L) * r
        const y1 = a.y + (dy / L) * r
        const x2 = b.x - (dx / L) * (r + 3)
        const y2 = b.y - (dy / L) * (r + 3)
        const id = `${e.from}>${e.to}`
        const isHot = hot?.has(id)
        const wdt = e.w === undefined ? 1.4 : 0.8 + (2.6 * Math.abs(e.w)) / maxW
        const sign = e.w === undefined ? '' : e.w >= 0 ? ' is-pos' : ' is-neg'
        return (
          <g key={k} className={`net__edge${sign}${isHot ? ' is-hot' : ''}${dimOthers && !isHot ? ' is-dim' : ''}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={wdt}
              strokeDasharray={e.dash ? '5 4' : undefined}
              markerEnd="url(#net-arrow)"
            />
            {e.label !== undefined && (
              <text x={a.x + dx * 0.42} y={a.y + dy * 0.42} className="net__elabel" textAnchor="middle" dy={-4}>
                {e.label}
              </text>
            )}
          </g>
        )
      })}
      {nodes.map((n) => {
        const isHot = hot?.has(n.id)
        const v = n.value
        return (
          <g
            key={n.id}
            className={`net__node net__node--${n.kind ?? 'hidden'}${isHot ? ' is-hot' : ''}${dimOthers && !isHot ? ' is-dim' : ''}`}
            transform={`translate(${n.x} ${n.y})`}
            onPointerEnter={onNodeEnter ? () => onNodeEnter(n.id) : undefined}
            onPointerLeave={onNodeEnter ? () => onNodeEnter(null) : undefined}
            onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
            style={onNodeClick ? { cursor: 'pointer' } : undefined}
          >
            <circle r={r} />
            {v !== undefined && (
              <circle r={r - 3} className={v >= 0 ? 'net__fill' : 'net__fill is-neg'} style={{ opacity: Math.min(1, Math.abs(v)) * 0.5 }} />
            )}
            {n.label !== undefined && (
              <text y={4.5} textAnchor="middle" className="net__label">
                {n.label}
              </text>
            )}
          </g>
        )
      })}
      {children}
    </svg>
  )
}

export const sigmoid = (x: number, a = 1) => 1 / (1 + Math.exp(-a * x))
