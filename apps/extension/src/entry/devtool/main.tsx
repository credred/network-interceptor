import { devtools } from "webextension-polyfill";

void devtools.panels.create('Network Interceptor', "", 'src/entry/devtool-panel/index.html');
