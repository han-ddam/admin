import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174, // API runs on 3000; keep admin on its own port
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
