import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import {
  AsyncStorage,
  extensionStorageSubscribeFactory,
} from "../../lib/extensionStorage/extensionStorageSubscribe";

export const createUseAsyncStorageState = (getStorage: () => AsyncStorage) => {
  const storage = getStorage();
  const extensionStorageSubscribe = extensionStorageSubscribeFactory(storage);
  return <T>(key: string, initialState: T, listenChange = true) => {
    const [state, setState] = useState<T>(initialState);

    const updateState = useMemoizedFn((value: T) => {
      if (!listenChange) {
        setState(value);
      }
      void storage.set({ [key]: value });
    });

    useEffect(() => {
      return extensionStorageSubscribe<T>(
        key,
        (value) => {
          setState(value);
        },
        listenChange
      );
    }, [key, listenChange]);

    return [state, updateState] as const;
  };
};

export const useSyncStorageState = createUseAsyncStorageState(
  () => Browser.storage.sync
);
export const useLocalStorageState = createUseAsyncStorageState(
  () => Browser.storage.local
);
