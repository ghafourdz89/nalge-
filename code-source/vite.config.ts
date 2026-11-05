import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Par défaut : build classique (dossier dist/, déploiement sur n'importe quel hébergeur statique).
// SINGLE_FILE=1 npm run build : produit un unique index.html autonome (aperçu / partage).
export default defineConfig({
  plugins: [react(), ...(process.env.SINGLE_FILE ? [viteSingleFile()] : [])],
  base: './',
});
