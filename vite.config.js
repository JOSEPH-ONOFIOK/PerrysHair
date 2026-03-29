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
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — rarely changes, cached long-term by browser
          'vendor-react': ['react', 'react-dom'],
          // Supabase SDK — large, split out separately
          'vendor-supabase': ['@supabase/supabase-js'],
          // Vercel analytics
          'vendor-analytics': ['@vercel/analytics'],
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
