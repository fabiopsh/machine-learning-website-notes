import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { defineConfig } from 'vite'
import { enHeadingIds, lessonIndex } from './plugins/lesson-index.ts'
import { seo } from './plugins/seo.ts'

let commit = ''
try {
  commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  // ambiente senza git
}

// https://vite.dev/config/
export default defineConfig({
  // percorsi relativi: il sito funziona da qualsiasi sottocartella (routing via hash)
  base: './',
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
  },
  plugins: [
    lessonIndex(),
    seo(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, enHeadingIds, [rehypeKatex, { strict: false }]],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
})
