import { Manifest } from "webextension-polyfill";
import pkg from "./package.json";

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  background: {
    service_worker: "src/entry/background/main.ts",
  },
  content_scripts: [
    {
      run_at: "document_start",
      js: ["src/entry/content-scripts/main.ts"],
      matches: ["<all_urls>"],
    },
  ],
  permissions: [
    "storage",
    "unlimitedStorage",
  ],
  devtools_page: "src/entry/devtool/index.html",
};

export default manifest;
