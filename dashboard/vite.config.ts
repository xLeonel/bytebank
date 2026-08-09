import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Remote React (porta 4201). Em dev é carregado pelo shell via import() do
// módulo fonte (/src/spa.tsx). Em build de produção é empacotado como um
// bundle de entrada estável (dashboard.js) + CSS único (dashboard.css), que o
// shell importa/injeta. `base` (VITE_BASE) prefixa as URLs dos chunks em prod.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Em prod o remote é servido em /remotes/dashboard/ (atrás do Caddy).
  base: command === 'build' ? '/remotes/dashboard/' : '/',
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
  ...(command === 'build'
    ? {
        build: {
          cssCodeSplit: false,
          rollupOptions: {
            input: r('./src/spa.tsx'),
            preserveEntrySignatures: 'exports-only',
            output: {
              format: 'es',
              entryFileNames: 'dashboard.js',
              chunkFileNames: 'assets/[name]-[hash].js',
              assetFileNames: (info: { name?: string }) =>
                info.name && info.name.endsWith('.css')
                  ? 'dashboard.css'
                  : 'assets/[name]-[hash][extname]',
            },
          },
        },
      }
    : {}),
}));
