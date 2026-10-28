import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(() => {
  // Config runs in Node, never in the browser. Do not expose these through
  // VITE_* variables or define: they are server-side proxy credentials.
  const backend = loadEnv('', fileURLToPath(new URL('../server/', import.meta.url)), '')
  const key = backend.SETTLEIN_WEB_API_KEY || backend.API_KEYS?.split(',')[0]?.trim()
  const proxy = {
    '/api': {
      target: `http://127.0.0.1:${backend.PORT || 5000}`,
      changeOrigin: true,
      configure(proxyServer) {
        proxyServer.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader('X-API-Key')
          if (key) proxyReq.setHeader('X-API-Key', key)
        })
      },
    },
  }
  return { plugins: [react()], server: { proxy }, preview: { proxy } }
})
