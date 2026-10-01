import { useState } from 'react'
import { Tasks } from '../../components/prose/Figure'
import { Slider, Toggle } from '../../components/ui/Controls'
import { tx } from '../../lib/i18n'

/** Fig. 3.10: il triangolo di Kanizsa. Ruotando i "pac-man" l'illusione svanisce. */
export function Kanizsa() {
  const [rot, setRot] = useState(0)
  const [outline, setOutline] = useState(false)
  const [seen, setSeen] = useState({ rot: false, out: false })
  const cx = 200
  const cy = 200
  const R = 120
  // vertici del triangolo "illusorio" (punta in su)
  const up = [0, 1, 2].map((k) => ({ x: cx + R * Math.cos(-Math.PI / 2 + (k * 2 * Math.PI) / 3), y: cy + 14 + R * Math.sin(-Math.PI / 2 + (k * 2 * Math.PI) / 3) }))
  // vertici del triangolo disegnato (punta in giù), solo gli angoli
  const down = [0, 1, 2].map((k) => ({ x: cx + R * 0.95 * Math.cos(Math.PI / 2 + (k * 2 * Math.PI) / 3), y: cy - 14 + R * 0.95 * Math.sin(Math.PI / 2 + (k * 2 * Math.PI) / 3) }))

  const pac = (p: { x: number; y: number }, k: number) => {
    // la "bocca" (60°) punta verso il centro del triangolo illusorio
    const toC = Math.atan2(cy + 14 - p.y, cx - p.x) + (rot * Math.PI) / 180 * (k % 2 ? -1 : 1)
    const r = 34
    const a1 = toC - Math.PI / 6
    const a2 = toC + Math.PI / 6
    const d = `M${p.x},${p.y} L${p.x + r * Math.cos(a2)},${p.y + r * Math.sin(a2)} A${r},${r} 0 1 1 ${p.x + r * Math.cos(a1)},${p.y + r * Math.sin(a1)} Z`
    return <path key={k} d={d} className="kan__pac" />
  }

  const corner = (p: { x: number; y: number }, k: number) => {
    const others = down.filter((_, j) => j !== k)
    const L = 0.28
    const a = { x: p.x + (others[0].x - p.x) * L, y: p.y + (others[0].y - p.y) * L }
    const b = { x: p.x + (others[1].x - p.x) * L, y: p.y + (others[1].y - p.y) * L }
    return <path key={k} d={`M${a.x},${a.y}L${p.x},${p.y}L${b.x},${b.y}`} className="kan__line" />
  }

  return (
    <div className="kan">
      <svg viewBox="0 0 400 390" className="kan__svg" role="img" aria-label={tx('Triangolo di Kanizsa', 'Kanizsa triangle')}>
        {down.map(corner)}
        {up.map(pac)}
        {outline && <path d={`M${up[0].x},${up[0].y}L${up[1].x},${up[1].y}L${up[2].x},${up[2].y}Z`} className="kan__ghost" />}
      </svg>
      <div className="controls">
        <Slider
          label={tx('ruota i pac-man', 'rotate the pac-men')}
          min={0}
          max={90}
          step={1}
          value={rot}
          onChange={(v) => {
            setRot(v)
            if (v > 30) setSeen((s) => ({ ...s, rot: true }))
          }}
          format={(v) => `${v}°`}
        />
        <Toggle
          label={tx('mostra il triangolo che «vediamo»', 'show the triangle we "see"')}
          checked={outline}
          onChange={(v) => {
            setOutline(v)
            setSeen((s) => ({ ...s, out: true }))
          }}
        />
      </div>
      <Tasks
        items={[
          { label: tx('Mostra il contorno: il triangolo bianco non è disegnato da nessuna parte.', 'Show the outline: the white triangle is not drawn anywhere.'), done: seen.out },
          { label: tx('Ruota i pac-man: basta poco perché il triangolo «sparisca».', 'Rotate the pac-men: just a little rotation makes the triangle "disappear."'), done: seen.rot },
        ]}
      />
    </div>
  )
}
