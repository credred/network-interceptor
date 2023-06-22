import { noop } from "lodash";
import Browser from "webextension-polyfill";

export interface AsyncStorage {
  onChanged: typeof Browser.storage.sync.onChanged;
  get: (
    keys?: string | string[] | Record<string, unknown>
  ) => Promise<Record<string, any>>;
  set: (items: Record<string, unknown>) => Promise<void>;
}

export const extensionStorageSubscribeFactory = (storage: AsyncStorage) => {
  return <T>(
    key: string,
    callback: (value: T) => void,
    listenChange = true
  ) => {
    void storage.get(key).then((record) => {
      callback(record[key] as T);
    });

    if (listenChange) {
      const listener = (
        changes: Browser.Storage.StorageAreaSyncOnChangedChangesType
      ) => {
        if (changes[key]) {
          callback((changes[key] as { newValue: T }).newValue);
        }
      };
      storage.onChanged.addListener(listener);
      return () => storage.onChanged.removeListener(listener);
    } else {
      return noop;
    }
  };
};

export const extensionSyncStorageSubscribe = extensionStorageSubscribeFactory(
  Browser.storage.sync
);
export const extensionLocalStorageSubscribe = extensionStorageSubscribeFactory(
  Browser.storage.local
);
