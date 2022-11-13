import scriptPath from "../injected-script/main?script&module";
import insertScript from "../../lib/insertScript";
import { allowWindowMessaging } from "webext-bridge/content-script";

void insertScript(scriptPath);

allowWindowMessaging("network-interceptor");
