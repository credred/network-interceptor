import { JsonValue } from "type-fest";
import {
  Destination,
  Endpoint,
  GetDataType,
  GetReturnType,
  OnMessageCallback,
} from "webext-bridge";
import { openStream } from "webext-bridge/background";

export type SendMessage = <
  ReturnType_1 extends JsonValue,
  K extends string = string
>(
  messageID: K,
  data: GetDataType<K, JsonValue>,
  destination?: Destination
) => Promise<GetReturnType<K, ReturnType_1>>;
export type OnMessage = <Data extends JsonValue, K extends string = string>(
  messageID: K,
  callback: OnMessageCallback<GetDataType<K, Data>, GetReturnType<K, unknown>>
) => void;

type Stream = ReturnType<typeof openStream> extends Promise<infer R>
  ? R
  : never;

export type OpenStream = (
  channel: string,
  destination: string | Endpoint
) => Promise<Stream>;
export type OnOpenStreamChannel = (
  channel: string,
  callback: (stream: Stream) => void
) => void;
