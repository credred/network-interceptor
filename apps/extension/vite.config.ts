import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import manifest from "./manifest";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as ManifestV3Export }),
    // monacoEditorPlugin wrong type
    (
      monacoEditorPlugin as unknown as { default: typeof monacoEditorPlugin }
    ).default({}),
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
