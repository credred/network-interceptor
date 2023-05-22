declare module "webextension-polyfill" {
  export namespace Manifest {
    interface ContentScript {
      world?: "ISOLATE" | "MAIN";
    }
  }
}

export {};
