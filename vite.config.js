import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue';
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'http://localhost:5001';
  const cleanTarget = target.trim().replace(/\/+$/, '').replace(/\/api$/, '');

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@tiptap")) return "vendor-tiptap";
              if (id.includes("chart.js") || id.includes("highlight.js")) return "vendor-vis";
              return "vendor";
            }
          },
        },
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