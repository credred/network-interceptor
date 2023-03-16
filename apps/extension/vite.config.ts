import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import manifest from "./manifest";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), crx({ manifest: manifest as ManifestV3Export })],
  resolve: {},
  css: {
    postcss: "postcss.config.cjs",
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    watch: {
      ignored: ["**/dev-dist/**", "**/dist/**"],
    },
  },
  build: {
    outDir: command === "serve" ? "dev-dist" : "dist",
    minify: false,
    rollupOptions: {
      input: {
        devtoolPanel: "src/entry/devtool-panel/index.html",
      },
    },
  },
}));
