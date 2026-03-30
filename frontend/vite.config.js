import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Gestor de Finanzas Personales',
        short_name: 'Finanzas',
        description: 'Gestiona tus ingresos y gastos de forma fácil',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="100" fill="white" font-family="Arial" font-weight="bold">💰</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="100" fill="white" font-family="Arial" font-weight="bold">💰</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect fill="%23667eea" width="512" height="512"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="300" fill="white" font-family="Arial" font-weight="bold">💰</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect fill="%23667eea" width="512" height="512"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="300" fill="white" font-family="Arial" font-weight="bold">💰</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 720"><rect fill="%23f8f9fa" width="540" height="720"/><text x="270" y="360" text-anchor="middle" font-size="60" fill="%23667eea">Gestor de Finanzas</text></svg>',
            sizes: '540x720',
            type: 'image/svg+xml',
            form_factor: 'narrow',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect fill="%23f8f9fa" width="1280" height="720"/><text x="640" y="360" text-anchor="middle" font-size="60" fill="%23667eea">Gestor de Finanzas</text></svg>',
            sizes: '1280x720',
            type: 'image/svg+xml',
            form_factor: 'wide',
          },
        ],
        categories: ['finance', 'productivity'],
        orientation: 'portrait-primary',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/.*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.ejemplo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutos
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})