import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "窮鬼勇者",
        short_name: "窮鬼勇者",
        description: "記帳打怪，守住你的預算。",
        theme_color: "#7161B8",
        background_color: "#FFF8EC",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB 上限（角色動畫 webp 較大）
        globPatterns: [
          "**/*.{js,css,html,ico,svg,woff2}",
          "icons/*.png",
          "assets/courtyard-*.webp",
          "assets/apprentice-*.webp",
          // Keep the lightweight wardrobe usable when videos are unavailable.
          "assets/rig-*.webp",
          "assets/mint-*.webp",
          "assets/night-*.webp",
          "assets/belt-journal-*.webp",
          "assets/satchel-*.webp",
          "assets/owl-*.webp",
          "assets/cat-*.webp",
          "assets/terrace-*.webp",
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.endsWith(".glb"),
            handler: "CacheFirst",
            options: {
              cacheName: "quest-starwind-models-v1",
              cacheableResponse: { statuses: [200] },
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === "image" &&
              url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "quest-art-v2",
              cacheableResponse: { statuses: [200] },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
