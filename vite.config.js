import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ignore 'fs' (Node file system) module used by face-api.js
      fs: 'false',
    },
  },
  build: {
    rollupOptions: {
      external: ['fs'],
    },
  },
});
