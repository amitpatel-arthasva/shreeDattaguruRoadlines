import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    rollupOptions: {
      external: [
        'electron',
        'fs',
        'path',
        'url',
        'crypto',
        'os',
        'child_process'
      ]
    }
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['electron']
  },
  define: {
    // Exclude Node.js globals from browser build
    global: 'globalThis'
  }
})
