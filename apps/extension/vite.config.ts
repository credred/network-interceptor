import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import manifest from "./manifest";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as ManifestV3Export }),
  ],
  resolve: {},
  server: {
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
  css: {
    postcss: "postcss.config.cjs",
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
