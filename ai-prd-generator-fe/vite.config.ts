import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 50,
            },
            {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 40,
            },
            {
              name: 'lucide',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 30,
            },
            {
              name: 'auth-vendor',
              test: /[\\/]node_modules[\\/]better-auth[\\/]/,
              priority: 20,
            },
            {
              name: 'markdown-vendor',
              test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-highlight|micromark|unist|vfile|highlight\.js)[\\/]/,
              priority: 10,
            }
          ]
        }
      }
    }
  }
})
