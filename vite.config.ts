import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This makes the dev server accessible on your local network
    host: '0.0.0.0', 
    // Add this line to allow requests from your localtunnel domain
    allowedHosts: ['.loca.lt'],
    proxy: {
      '/api': {
        // This should point to your randomplayables platform backend.
        // It might be localhost, or a specific IP like in the gothamloops example.
        target: 'http://localhost:3000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Standard rewrite to remove /api prefix
      },
    },
  },
})
