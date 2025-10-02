import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), [tailwindcss()]],
  base: '/static/',
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000"
    }
  }
})