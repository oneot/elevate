import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rawBuildId = process.env.VITE_BUILD_ID || process.env.GITHUB_SHA || 'dev'
const buildId = rawBuildId.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 12) || 'dev'

function buildIdHtmlPlugin() {
  return {
    name: 'elevate-build-id-html',
    transformIndexHtml(html) {
      return html.replaceAll('__ELEVATE_BUILD_ID__', buildId)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __ELEVATE_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    buildIdHtmlPlugin(),
    react(),
    tailwindcss(),
  ],
  server: {
    historyApiFallback: true,
    proxy: {
      // 로컬 개발 시 Azure Functions 에뮬레이터로 프록시
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
})
