import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the default rollup behaviour: every route is React.lazy()'d, so
    // letting rollup derive chunks from the import graph already keeps the
    // landing page at ~277 kB. Forcing a manual vendor split was tried and
    // reverted -- naming three/hls chunks made them *static* deps of the entry,
    // which pushed the initial payload to ~1.75 MB.
    chunkSizeWarningLimit: 700,
  },
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://consumet-api-clone.vercel.app/anime/gogoanime',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
      }
    }
  },
})
