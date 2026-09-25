import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /*server: {
    proxy: {
      '/api': {
        target: 'https://sporticos.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Optional: Secure may need to be false if the target has self-signed SSL
        // secure: false,
      }
    }
  }*/
})
