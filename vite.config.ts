import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { localApiPlugin } from './vite-plugin-local-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The only chunk above 500 kB is `vendor-lucide` (lucide-animated, ~96 kB gzip):
    // an intentionally animated icon set, isolated for caching. Further reduction
    // would mean swapping to static `lucide-react` icons (a design trade-off).
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (
            id.includes('framer-motion') ||
            id.includes('@motion') ||
            id.includes('motion-dom') ||
            id.includes('motion-utils') ||
            id.includes('animejs')
          ) {
            return 'vendor-motion'
          }
          if (id.includes('@radix-ui') || id.includes('@radix')) return 'vendor-radix'
          if (id.includes('lucide')) return 'vendor-lucide'
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('zod') ||
            id.includes('zustand')
          ) {
            return 'vendor-forms'
          }
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          return 'vendor'
        },
      },
    },
  },
})
