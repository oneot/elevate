import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{js,jsx}'],
    environment: 'node',
    env: { VITE_API_BASE_URL: 'https://api.example.test/api/admin' },
    restoreMocks: true,
    clearMocks: true,
  },
})
