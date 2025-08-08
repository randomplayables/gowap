import { defineConfig, ProxyOptions } from 'vite' // CHANGE: Import ProxyOptions
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';

  // Define the base server configuration object
  const serverConfig: {
    host: string;
    allowedHosts: string[];
    proxy?: Record<string, string | ProxyOptions>; // CHANGE: Use the specific type for the proxy
  } = {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt'],
  };

  // Only add the proxy object if we are NOT in production
  if (!isProduction) {
    serverConfig.proxy = {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    };
  }

  const config = {
    plugins: [react()],
    server: serverConfig, // Use the serverConfig object we just built
  };

  if (command === 'build') {
    (config as any).build = {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    };
  }
  
  return config;
});