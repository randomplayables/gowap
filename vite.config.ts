import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
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
          // CORRECTED: The rewrite now correctly passes the full path to the backend,
          // which expects the /api prefix.
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
  };

  if (command === 'build') {
    (config as any).build = {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    };
  }

  return config;
})