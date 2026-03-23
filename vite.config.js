import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), serial=()',
}

export default defineConfig({
  plugins: [react()],
  server: { headers: securityHeaders },
  preview: { headers: securityHeaders },
  build: {
    // Strip all console.* calls from the production bundle
    minify: 'esbuild',
    target: 'es2020',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
