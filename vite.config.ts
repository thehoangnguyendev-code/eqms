import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks: {
              // Core React runtime
              'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-router'],
              // Charting library
              'vendor-recharts': ['recharts'],
              // Animation library
              'vendor-framer': ['framer-motion'],
              // PDF viewer
              'vendor-pdf': ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', 'pdfjs-dist'],
              // Document preview
              'vendor-docx': ['docx-preview'],
              // Icons
              'vendor-icons': ['lucide-react', '@tabler/icons-react'],
            },
          },
        },
      },
    };
});
