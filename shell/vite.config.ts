import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Chassi (root-config). Orquestra os remotes via single-spa.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
