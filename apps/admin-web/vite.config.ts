import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 30018,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:30020',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: Number(process.env.PORT) || 30018,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:30020',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

