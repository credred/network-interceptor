import { devtools } from "webextension-polyfill";

void devtools.panels.create('NetGuard', "", 'src/entry/devtool-panel/index.html');
