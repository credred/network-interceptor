import scriptPath from "../injected-script/main?script&module";
import insertScript from "../../lib/insertScript";
import {
  sendMessage,
  allowWindowMessaging,
} from "webext-bridge/content-script";
import { rules$ } from "../../lib/storage";

void insertScript(scriptPath);

allowWindowMessaging("network-interceptor");

rules$.subscribe((rules) => {
  void sendMessage("rulesChange", rules, "window");
});
