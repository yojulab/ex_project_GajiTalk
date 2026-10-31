import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 30019,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:30020',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 30019,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:30020',
        changeOrigin: true
      }
    }
  }
});

