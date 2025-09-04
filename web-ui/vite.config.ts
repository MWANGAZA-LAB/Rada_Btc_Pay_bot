import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rada-bot/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3001,
    host: true,
  },
})
