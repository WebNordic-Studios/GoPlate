import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites live under /<repo>/; set VITE_BASE_PATH in CI (see .github/workflows).
const base = process.env.VITE_BASE_PATH?.trim() || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
