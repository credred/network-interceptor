import { openStream, sendMessage } from "webext-bridge/devtools";
import { createStorageClient } from "../../../../lib/storage/client";

export const request = createStorageClient(
  sendMessage,
  openStream,
  "background"
);
