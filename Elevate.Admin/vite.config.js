import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Include CommonJS proxies and JSX internals, not just package entry points.
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'vendor-react'
          }
          if (id.includes('/node_modules/@azure/msal-')) return 'vendor-msal'
          if (/\/node_modules\/(@tiptap\/|prosemirror-[^/]+\/|lowlight\/|highlight\.js\/)/.test(id)) {
            return 'vendor-tiptap'
          }
        },
      },
    },
  },
})
