import scriptPath from "../injected-script/main?script&module";
import insertScript from "../../lib/insertScript";
import {
  allowWindowMessaging,
  onMessage,
  sendMessage,
} from "webext-bridge/content-script";
import { extensionLocalStorageSubscribe } from "../../lib/extensionStorageSubscribe";

void insertScript(scriptPath);

onMessage("pageLoad", () => {
  extensionLocalStorageSubscribe<boolean>("allSiteEnabled", (value) => {
    void sendMessage("allSiteEnabled", value ?? true, "window");
  });
});

allowWindowMessaging("network-interceptor");
