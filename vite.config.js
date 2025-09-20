import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      symbolId: 'icon-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 9528,
    open: false
  },
  preview: {
    port: 9528,
    open: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "@import '@/styles/variables.scss';"
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static'
  }
})
