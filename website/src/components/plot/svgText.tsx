import type { ReactNode } from 'react'

/**
 * Pedici e apici nel testo SVG. Il serif corsivo del sito (Newsreader) disegna le cifre in pedice
 * Unicode (x₁) a grandezza piena, e le lettere in pedice (ⱼ, ₖ) non le ha affatto: qui diventano
 * un vero pedice, con un <tspan> più piccolo e abbassato. Si usa `dy` (non `baseline-shift`,
 * che Firefox ignora); il testo che segue torna sulla linea di base.
 */

const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const SIZE = 0.72
/** abbassamento del pedice e innalzamento dell'apice, in frazioni del corpo del testo */
const DOWN = 0.2
const UP = 0.38

/** Pedice (`sub`) o apice (`sup`) in un <text> SVG; `after` è il testo che segue, riportato sulla linea di base. */
export function svgScript(base: ReactNode, script: ReactNode, kind: 'sub' | 'sup' = 'sub', after?: ReactNode) {
  const shift = kind === 'sub' ? DOWN : -UP
  return (
    <>
      {base}
      <tspan dy={`${shift / SIZE}em`} fontSize={`${SIZE}em`}>
        {script}
      </tspan>
      {after !== undefined && after !== '' && <tspan dy={`${-shift}em`}>{after}</tspan>}
    </>
  )
}

/** Converte le cifre in pedice Unicode di una stringa (x₁, w₁₂) in pedici veri; il resto passa invariato. */
export function subDigits(s: ReactNode): ReactNode {
  if (typeof s !== 'string') return s
  const m = s.match(/^([^₀-₉]*)([₀-₉]+)(.*)$/)
  if (!m) return s
  const digits = [...m[2]].map((c) => SUB_DIGITS.indexOf(c)).join('')
  return svgScript(m[1], digits, 'sub', subDigits(m[3]))
}

/** Per il canvas: divide "x₁" in base e pedice, da disegnare con due fillText. */
export function splitSubDigits(s: string): [string, string] {
  const m = s.match(/^([^₀-₉]*)([₀-₉]+)$/)
  return m ? [m[1], [...m[2]].map((c) => SUB_DIGITS.indexOf(c)).join('')] : [s, '']
}
