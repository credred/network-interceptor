import { openStream, sendMessage } from "webext-bridge/devtools";
import { createStorageClient } from "../../../../lib/storage/client";

const { client, createClient } = createStorageClient(
  sendMessage,
  openStream,
  "background"
);

export { client as request, createClient as createRequest };
