import { Manifest } from "webextension-polyfill";
import pkg from "./package.json";

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name: "Network Interception",
  version: pkg.version,
  description: pkg.description,
  icons: {
    "16": "assets/logo-16.png",
    "32": "assets/logo-32.png",
    "48": "assets/logo-48.png",
    "128": "assets/logo-128.png",
  },
  background: {
    service_worker: "src/entry/background/main.ts",
  },
  action: {
    default_popup: "src/entry/popup/index.html",
  },
  content_scripts: [
    {
      run_at: "document_start",
      js: ["src/entry/content-scripts/main.ts?script&iife"],
      matches: ["<all_urls>"],
    },
    {
      run_at: "document_start",
      world: "MAIN",
      js: ["src/entry/injected-script/main.ts?script&iife"],
      matches: ["<all_urls>"],
    },
  ],
  permissions: ["storage", "unlimitedStorage"],
  devtools_page: "src/entry/devtool/index.html",
};

export default manifest;
