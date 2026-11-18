import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// En Vercel la app se sirve desde la raíz; en GitHub Pages desde /velora-finanzas/.
// BASE_PATH permite forzar otra ruta si hiciera falta.
const base = process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : '/velora-finanzas/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Velora Finanzas',
        short_name: 'Velora',
        description: 'Aplicación de finanzas personales',
        theme_color: '#0066FF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
