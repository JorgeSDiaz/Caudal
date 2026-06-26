import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true, // expose on 0.0.0.0 so the dev server is reachable from outside the container
    port: 5173,
    watch: {
      // Polling makes HMR reliable on Windows bind mounts inside Docker
      usePolling: process.env.VITE_DEV_POLLING === 'true',
    },
  },
})
