import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue';
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'https://ant-forum.khei.work.gd';
  const cleanTarget = target.endsWith('/') ? target.slice(0, -1) : target;

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': { target: cleanTarget, changeOrigin: true, secure: false },
        '/auth': { target: cleanTarget, changeOrigin: true, secure: false },
        '/discussions': { target: cleanTarget, changeOrigin: true, secure: false },
        '/uploads': { target: cleanTarget, changeOrigin: true, secure: false }
      }
    }
  };
});