declare module 'virtual:lesson-index' {
  type Heading = { depth: number; text: string; slug: string }
  type FigureRef = { n: string; title: string }
  type Entry = { headings: Heading[]; figures: FigureRef[]; words: number }
  /** una voce per lezione e per lingua; `en` contiene solo le lezioni già tradotte */
  const index: { it: Record<string, Entry>; en: Record<string, Entry> }
  export default index
}
