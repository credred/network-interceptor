import {
  allowWindowMessaging,
  onMessage,
  sendMessage,
} from "webext-bridge/content-script";
import { extensionLocalStorageSubscribe } from "../../lib/extensionStorage/extensionStorageSubscribe";

onMessage("pageLoad", () => {
  extensionLocalStorageSubscribe<boolean>("allSiteEnabled", (value) => {
    void sendMessage("allSiteEnabled", value ?? true, "window");
  });
});

allowWindowMessaging("network-interceptor");
