import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api': ' https://rah-qegm.onrender.com',
      '/socket.io': {
        target: ' https://rah-qegm.onrender.com',
        ws: true,
      },
      '/uploads': ' https://rah-qegm.onrender.com',
    },
    host: true
  },
})
