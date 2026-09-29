import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { defineConfig } from 'vite'
import { lessonIndex } from './plugins/lesson-index.ts'

// https://vite.dev/config/
export default defineConfig({
  // percorsi relativi: il sito funziona da qualsiasi sottocartella (routing via hash)
  base: './',
  plugins: [
    lessonIndex(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, [rehypeKatex, { strict: false }]],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
})
