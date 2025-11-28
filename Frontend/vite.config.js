import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/sessions': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/memory': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/analyze_reports': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/analyze_prescription': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/doctor_assistant': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
