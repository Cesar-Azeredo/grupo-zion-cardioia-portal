import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Publicado em https://cesar-azeredo.github.io/grupo-zion-cardioia-portal/
  // (GitHub Pages de repositório). O mesmo base vale no dev, para o local e o
  // publicado se comportarem igual.
  base: '/grupo-zion-cardioia-portal/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
