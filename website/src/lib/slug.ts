import GithubSlugger from 'github-slugger'

/** Stesso algoritmo di rehype-slug (e del plugin lesson-index). */
export function slugify(heading: string) {
  const plain = heading.replace(/\$/g, '').replace(/\*\*?|`/g, '').trim()
  return new GithubSlugger().slug(plain)
}
