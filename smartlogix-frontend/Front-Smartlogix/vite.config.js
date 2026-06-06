import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
