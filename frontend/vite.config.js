import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Detecta si estás dentro de Docker (opcional)
const apiTarget = process.env.DOCKER ? 'http://web:8000' : 'http://127.0.0.1:8000'

// En producción, el frontend lo sirve Nginx en / (no bajo /static), así que base = '/'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // si sirves el build por Nginx en la raíz

  server: {
    host: true,        // útil si pruebas en WSL/LAN
    port: 5173,        // por si lo quieres fijar
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    include: [
      'i18next',
      'react-i18next',
      'i18next-browser-languagedetector',
      // Incluye este sólo si realmente usas @react-pdf/renderer en el front:
      '@react-pdf/renderer',
    ],
  },
})
