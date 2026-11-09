import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: './',
  worker: {
    format: 'es'
  },
  plugins: [
    {
      name: 'copy-data-folder',
      closeBundle() {
        const targetDir = path.resolve('dist/data');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        if (fs.existsSync('data/ghdb_clean.json')) {
          fs.copyFileSync('data/ghdb_clean.json', path.join(targetDir, 'ghdb_clean.json'));
        }
        if (fs.existsSync('data/unified_dorks.json.gz')) {
          fs.copyFileSync('data/unified_dorks.json.gz', path.join(targetDir, 'unified_dorks.json.gz'));
        }
      },
      configureServer(server) {
        // Serve /data/* requests in dev mode directly from the root data directory
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/data/') || req.url.includes('/data/'))) {
            const cleanUrl = req.url.replace(/^.*\/data\//, '/data/').split('?')[0];
            const filePath = path.join(process.cwd(), cleanUrl);
            if (fs.existsSync(filePath)) {
              if (filePath.endsWith('.gz')) {
                res.setHeader('Content-Type', 'application/gzip');
              } else if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
              }
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1500
  }
});
