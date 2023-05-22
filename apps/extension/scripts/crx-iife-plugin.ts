/**
 * motivation:
 *  most of the time, the es module script execution time is later than the page script.
 *  some http request cannot be intercepted.
 */
import { Plugin, ResolvedConfig } from "vite";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import { build } from "vite";
import { basename, dirname, extname, join } from "path";
import { SetRequired } from "type-fest";
export * from "@crxjs/vite-plugin";

const iifeContentScripts: SetRequired<
  NonNullable<ManifestV3["content_scripts"]>[number],
  "js"
>[] = [];
const dynamicScripts = new Set<string>();

type ManifestV3 = ManifestV3Export extends infer R
  ? R extends { manifest_version: number }
    ? R
    : never
  : never;

type options = Parameters<typeof crx>["0"];

function isCrxPlugin(
  p: unknown
): p is Plugin & { api?: { crx?: { options?: options } } } {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    !!p &&
    typeof p === "object" &&
    !(p instanceof Promise) &&
    !Array.isArray(p) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    (p as Record<string, string>).name?.startsWith("crx:")
  );
}

const getIsIifeScript = (filePath: string) => {
  const url = new URL(filePath, "stub://stub");
  return url.searchParams.has("script") && url.searchParams.has("iife");
};

const buildIife = async (entry: string, parentConfig: ResolvedConfig) => {
  const rollupOutput = await build({
    configFile: false,
    plugins: [pluginBuildDynamicScript()],
    build: {
      outDir: join(parentConfig.build.outDir, dirname(entry)),
      minify: false,
      emptyOutDir: false,
      lib: {
        entry,
        name: basename(entry, extname(entry)),
        formats: ["iife"],
        fileName: basename(entry, extname(entry)),
      },
    },
  });
  let fileName: string;
  if (Array.isArray(rollupOutput)) {
    fileName = rollupOutput[0].output[0].fileName;
  } else if ("output" in rollupOutput) {
    fileName = rollupOutput.output[0].fileName;
  } else {
    throw new Error("not support watch option");
  }

  return join(dirname(entry), fileName);
};

const optionsProviderName = "crx:optionsProvider";
const pluginOptionsProviderRewriter = (): Plugin => {
  return {
    name: "crx:iife:optionsProviderRewriter",
    enforce: "pre",
    // apply: "build",
    async config({ plugins }, env) {
      if (typeof plugins === "undefined") {
        throw new Error("config.plugins is undefined");
      }
      const awaitedPlugins = await Promise.all(plugins);
      for (const p of awaitedPlugins.flat()) {
        if (isCrxPlugin(p)) {
          if (p.name === optionsProviderName) {
            const options = p.api?.crx?.options;
            if (options) {
              const manifest = await (typeof options.manifest === "function"
                ? options.manifest(env)
                : options.manifest);
              // delete iife script from content_scripts
              manifest.content_scripts = manifest.content_scripts?.filter(
                (contentScript) => {
                  const iifeJs: string[] = [];
                  contentScript.js?.forEach((filePath) => {
                    const isIifeScript = getIsIifeScript(filePath);
                    isIifeScript && iifeJs.push(filePath.split("?")[0]);
                  });
                  if (iifeJs.length) {
                    iifeContentScripts.push({ ...contentScript, js: iifeJs });
                  }

                  return (
                    iifeJs?.length !== contentScript.js?.length ||
                    contentScript.css
                  );
                }
              );
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              p.api!.crx!.options = {
                ...options,
                manifest,
              };
            }
          }
        }
      }
    },
  };
};

const pluginAttachManifest = (): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "crx:iife:manifest-attach",
    enforce: "post",
    // apply: 'build',
    configResolved(_config) {
      config = _config;
      const plugins = config.plugins as Plugin[];
      const selfIndex = plugins.findIndex(
        ({ name }) => name === "crx:iife:manifest-attach"
      );
      const [self] = plugins.splice(selfIndex, 1);
      plugins.push(self);
    },
    async generateBundle(_options, bundle) {
      const manifestJsonAsset = bundle["manifest.json"] as { source: string };
      const manifest = JSON.parse(manifestJsonAsset.source) as ManifestV3;
      if (manifest.content_scripts) {
        const contentScripts = await Promise.all(
          iifeContentScripts.map(async (contentScript) => {
            const fileNames = await Promise.all(
              contentScript.js.map(async (filePath) => {
                return buildIife(filePath, config);
              })
            );

            return {
              ...contentScript,
              js: fileNames,
            };
          })
        );
        manifest.content_scripts = (manifest.content_scripts || []).concat(
          contentScripts
        );
      }
      manifest.web_accessible_resources =
        manifest.web_accessible_resources ?? [];
      manifest.web_accessible_resources.push({
        use_dynamic_url: true,
        // all web origins can access
        matches: ["<all_urls>"],
        // all resources are web accessible
        resources: [...dynamicScripts],
      });

      manifestJsonAsset.source = JSON.stringify(manifest, null, 2);
    },
  };
};

const pluginBuildDynamicScript = (): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "crx:iife:serve-dynamic-script",
    enforce: "pre",
    // apply: 'build',
    configResolved(_config) {
      config = _config;
    },
    async resolveId(_source, importer) {
      if (getIsIifeScript(_source)) {
        const [source] = _source.split("?");
        const resolved = await this.resolve(source, importer, {
          skipSelf: true,
        });
        if (resolved) {
          const { id } = resolved;
          const resolvedId = `${id}?dynamic`;
          return resolvedId;
        }
      }
    },
    async load(_id) {
      const index = _id.indexOf("?dynamic");
      if (index > -1) {
        const id = _id.slice(0, index);
        const fileName = await buildIife(id, config);
        dynamicScripts.add(fileName);
        return `export default "${fileName}"`;
      }
    },
  };
};

const crxIifePlugin: typeof crx = (options) => {
  return [
    pluginOptionsProviderRewriter(),
    pluginBuildDynamicScript(),
    ...crx(options),
    pluginAttachManifest(),
  ];
};

export default crxIifePlugin;
