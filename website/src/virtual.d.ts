declare module 'virtual:lesson-index' {
  type Heading = { depth: number; text: string; slug: string }
  type FigureRef = { n: string; title: string }
  const index: Record<string, { headings: Heading[]; figures: FigureRef[]; words: number }>
  export default index
}
