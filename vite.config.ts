import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設定為相對路徑 './'，這樣無論您的 Repository 名稱是什麼，資源都能正確載入
  // 注意：這適用於非 History API 路由的 SPA。
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});