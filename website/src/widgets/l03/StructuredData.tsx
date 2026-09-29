import { useState } from 'react'

/** Fig. 3.2: sequenza, molecola, rete di pagine web — tutti grafi, con struttura diversa. */

type N = { id: string; x: number; y: number; label?: string; kind?: 'atom' | 'c' | 'page' | 'seq' }
type E = { a: string; b: string; double?: boolean; dir?: boolean }
type G = { title: string; sub: string; nodes: N[]; edges: E[]; w: number; h: number }

const hex = (i: number, cx: number, cy: number, r: number) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 3
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

const SEQ: G = {
  title: 'Sequenza',
  sub: 'ogni elemento ha un predecessore e un successore',
  w: 300,
  h: 150,
  nodes: [1, 2, 3, 4, 5].map((i) => ({ id: `l${i}`, x: 30 + (i - 1) * 60, y: 75, label: `l${i}`, kind: 'seq' as const })),
  edges: [1, 2, 3, 4].map((i) => ({ a: `l${i}`, b: `l${i + 1}` })),
}

const ring = [0, 1, 2, 3, 4, 5].map((i) => hex(i, 110, 110, 38))
const MOL: G = {
  title: 'Molecola',
  sub: 'atomi come nodi, legami come archi',
  w: 300,
  h: 220,
  nodes: [
    ...ring.map((p, i) => ({ id: `c${i}`, ...p, kind: 'c' as const, label: 'C' })),
    { id: 'o1', x: ring[4].x - 38, y: ring[4].y - 20, label: 'OH', kind: 'atom' },
    { id: 'o2', x: ring[3].x - 38, y: ring[3].y + 22, label: 'OH', kind: 'atom' },
    { id: 'c6', x: ring[1].x + 34, y: ring[1].y - 20, label: 'C', kind: 'c' },
    { id: 'o3', x: ring[1].x + 34, y: ring[1].y - 62, label: 'OH', kind: 'atom' },
    { id: 'c7', x: ring[1].x + 70, y: ring[1].y, label: 'C', kind: 'c' },
    { id: 'n', x: ring[1].x + 106, y: ring[1].y - 20, label: 'NH', kind: 'atom' },
    { id: 'r', x: ring[1].x + 140, y: ring[1].y, label: 'R', kind: 'atom' },
  ],
  edges: [
    { a: 'c0', b: 'c1', double: true },
    { a: 'c1', b: 'c2' },
    { a: 'c2', b: 'c3', double: true },
    { a: 'c3', b: 'c4' },
    { a: 'c4', b: 'c5', double: true },
    { a: 'c5', b: 'c0' },
    { a: 'c4', b: 'o1' },
    { a: 'c3', b: 'o2' },
    { a: 'c1', b: 'c6' },
    { a: 'c6', b: 'o3' },
    { a: 'c6', b: 'c7' },
    { a: 'c7', b: 'n' },
    { a: 'n', b: 'r' },
  ],
}

const WEB: G = {
  title: 'Rete di pagine web',
  sub: 'pagine come nodi, hyperlink come archi orientati',
  w: 300,
  h: 220,
  nodes: [
    { id: 'hh', x: 50, y: 50, label: 'Help on Help', kind: 'page' },
    { id: 'top', x: 170, y: 30, label: 'Home', kind: 'page' },
    { id: 'main', x: 150, y: 110, label: 'Contents', kind: 'page' },
    { id: 'hg', x: 255, y: 80, label: 'Graphics', kind: 'page' },
    { id: 'md', x: 250, y: 175, label: 'More Details', kind: 'page' },
    { id: 'gl', x: 50, y: 160, label: 'Glossary', kind: 'page' },
    { id: 'dc', x: 150, y: 195, label: 'Dictionary', kind: 'page' },
  ],
  edges: [
    { a: 'main', b: 'hh', dir: true },
    { a: 'main', b: 'top', dir: true },
    { a: 'main', b: 'hg', dir: true },
    { a: 'main', b: 'md', dir: true },
    { a: 'hh', b: 'gl', dir: true },
    { a: 'gl', b: 'dc', dir: true },
  ],
}

function Graph({ g }: { g: G }) {
  const [hot, setHot] = useState<string | null>(null)
  const pos = new Map(g.nodes.map((n) => [n.id, n]))
  const nbrs = new Set<string>()
  if (hot)
    for (const e of g.edges) {
      if (e.a === hot) nbrs.add(e.b)
      if (e.b === hot) nbrs.add(e.a)
    }
  const hotNode = g.nodes.find((n) => n.id === hot)
  return (
    <div className="sgraph">
      <div className="sgraph__title">{g.title}</div>
      <svg viewBox={`0 0 ${g.w} ${g.h}`} className="sgraph__svg" onMouseLeave={() => setHot(null)}>
        <defs>
          <marker id={`sg-${g.title.length}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10z" className="sgraph__head" />
          </marker>
        </defs>
        {g.edges.map((e, i) => {
          const A = pos.get(e.a)!
          const B = pos.get(e.b)!
          const on = hot && (e.a === hot || e.b === hot)
          const dx = B.x - A.x
          const dy = B.y - A.y
          const L = Math.hypot(dx, dy)
          const ux = dx / L
          const uy = dy / L
          const pad = (n: N) => (n.kind === 'page' ? 20 : n.kind === 'seq' ? 17 : n.kind === 'c' ? 4 : 13)
          const x1 = A.x + ux * pad(A)
          const y1 = A.y + uy * pad(A)
          const x2 = B.x - ux * pad(B)
          const y2 = B.y - uy * pad(B)
          return (
            <g key={i} className={`sgraph__edge${on ? ' is-hot' : ''}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={e.dir ? `url(#sg-${g.title.length})` : undefined} />
              {e.double && <line x1={x1 - uy * 5 + ux * 5} y1={y1 + ux * 5 + uy * 5} x2={x2 - uy * 5 - ux * 5} y2={y2 + ux * 5 - uy * 5} />}
            </g>
          )
        })}
        {g.nodes.map((n) => {
          const cls = `sgraph__node sgraph__node--${n.kind}${hot === n.id ? ' is-hot' : ''}${nbrs.has(n.id) ? ' is-nbr' : ''}`
          return (
            <g key={n.id} className={cls} transform={`translate(${n.x} ${n.y})`} onMouseEnter={() => setHot(n.id)}>
              {n.kind === 'page' ? (
                <>
                  <rect x={-22} y={-16} width={44} height={32} rx={4} />
                  <line x1={-14} x2={14} y1={-4} y2={-4} />
                  <line x1={-14} x2={8} y1={3} y2={3} />
                  <line x1={-14} x2={11} y1={10} y2={10} />
                </>
              ) : n.kind === 'c' ? (
                <circle r={hot === n.id || nbrs.has(n.id) ? 6 : 3.5} />
              ) : (
                <>
                  <circle r={n.kind === 'seq' ? 16 : 13} />
                  <text y={4} textAnchor="middle">
                    {n.label}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
      <div className="sgraph__sub">
        {hotNode ? (
          <>
            <strong>{hotNode.label ?? hotNode.id}</strong>: {nbrs.size} {nbrs.size === 1 ? 'vicino' : 'vicini'}
          </>
        ) : (
          g.sub
        )}
      </div>
    </div>
  )
}

export function StructuredData() {
  return (
    <div className="sdata">
      <Graph g={SEQ} />
      <Graph g={MOL} />
      <Graph g={WEB} />
    </div>
  )
}
