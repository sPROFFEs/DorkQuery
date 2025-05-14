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
    outDir: 'dist',  // La carpeta donde se generarán los archivos estáticos
    rollupOptions: {
      output: {
        // Los archivos JS generados tendrán un nombre con hash
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]', // También aplicamos el hash a los archivos de tipo imagen, fuentes, etc.
        
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'codemirror': ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-sql'],
        }
      }
    }
  }
});
