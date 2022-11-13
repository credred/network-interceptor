import { NetworkRule } from "common/network-rule";
import { defer, Observable, shareReplay, switchMap } from "rxjs";
import { Destination, GetDataType, GetReturnType } from "webext-bridge";
import { OpenStream, SendMessage } from "../../types/webext-bridge";
import { StorageMessage, StorageMessageStreamName } from "./constants";

type Client = {
  [P in keyof typeof StorageMessage]: (
    data: GetDataType<typeof StorageMessage[P]>
  ) => Promise<GetReturnType<typeof StorageMessage[P]>>;
} & {
  rules$: Observable<NetworkRule[]>;
};

export const createStorageClient = (
  sendMessage: SendMessage,
  openStream: OpenStream,
  destination: Destination
) => {
  const client = Object.entries(StorageMessage).reduce<Client>(
    (result: Client, [messageKey, messageValue]) => {
      //@ts-expect-error ts union type error
      result[messageKey] = (data: GetDataType<StorageMessage>) => {
        return sendMessage(messageValue, data, destination);
      };
      return result;
    },
    {} as Client
  );

  client.rules$ = defer(() =>
    openStream(StorageMessageStreamName.ruleStream, destination)
  ).pipe(
    switchMap((stream) => {
      return new Observable<NetworkRule[]>((subscribe) => {
        stream.onMessage((msg) =>
          subscribe.next(msg as unknown as NetworkRule[])
        );

        return () => stream.close();
      });
    }),
    shareReplay(1)
  );

  return client;
};

export { StorageMessage };
