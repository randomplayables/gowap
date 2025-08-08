import { defineConfig, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';

  // Define the base server configuration object
  const serverConfig: {
    host: string;
    allowedHosts: string[];
    proxy?: Record<string, string | ProxyOptions>;
  } = {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt'],
  };

  // Only add the proxy object if we are NOT in production
  if (!isProduction) {
    serverConfig.proxy = {
      '/api': {
        // This should point to your randomplayables platform backend.
        target: 'http://localhost:3000', 
        changeOrigin: true,
        // The incorrect 'rewrite' line has been removed from this section.
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