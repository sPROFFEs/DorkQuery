import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Solo si quieres mantenerlo dinámico con GitHub Actions
const repoName = process.env.GITHUB_REPOSITORY 
  ? process.env.GITHUB_REPOSITORY.split('/')[1] 
  : 'hacklabs';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'codemirror': ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-sql'],
        }
      }
    }
  }
});
