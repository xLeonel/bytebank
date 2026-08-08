import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Remote React (porta 4201). Carregado pelo shell via import() ESM cross-origin
// (por isso CORS + origin). Aliases reaproveitam o código da Fase 1 quase
// verbatim: `@` -> src e os módulos `next/*` -> shims locais.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': r('./src'),
      'next/link': r('./src/shims/next-link.tsx'),
      'next/image': r('./src/shims/next-image.tsx'),
      'next/navigation': r('./src/shims/next-navigation.ts'),
      'next/font/google': r('./src/shims/next-font.ts'),
      'next/font/local': r('./src/shims/next-font.ts'),
    },
  },
  server: {
    port: 4201,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:4201',
  },
});
