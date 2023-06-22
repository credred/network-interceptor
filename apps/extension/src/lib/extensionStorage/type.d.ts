import { ExtensionStorageKey } from "./constants";

export type ExtensionStorage = {
  [ExtensionStorageKey.allSiteEnabled]: boolean;
  [ExtensionStorageKey.preserveLog]: boolean;
};
