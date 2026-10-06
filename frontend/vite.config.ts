import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// /api -> Express API (server/apps/api), /ocr -> Model 1 FastAPI service (Ocr-Model-1).
// Proxying avoids CORS: the OCR service does not enable it.
const API_TARGET = process.env.API_TARGET ?? 'http://localhost:4000'
const OCR_TARGET = process.env.OCR_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/ocr': { target: OCR_TARGET, changeOrigin: true, rewrite: (p) => p.replace(/^\/ocr/, '') },
    },
  },
})
