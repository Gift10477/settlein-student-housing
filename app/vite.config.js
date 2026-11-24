import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig(() => {
  const settings = loadEnv('', fileURLToPath(new URL('../server/', import.meta.url)), '')
  const proxy = { '/data': { target: 'http://127.0.0.1:' + (settings.PORT || 5001), changeOrigin: true } }
  return { base: process.env.VITE_BASE_PATH || '/', plugins: [react()], server: { proxy }, preview: { proxy } }
})
