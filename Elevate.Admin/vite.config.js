import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    // 앱 아이콘·유리 타일 이미지를 base64로 JS에 넣지 않고 캐시 가능한 파일로 둔다 (초기 JS 예산 보호).
    assetsInlineLimit: 0,
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
