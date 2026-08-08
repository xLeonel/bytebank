import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Remote React. É carregado pelo shell via import() ESM cross-origin, então o
// dev server precisa de CORS e de origin absoluto (para as URLs dos módulos).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4201,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:4201',
  },
});
