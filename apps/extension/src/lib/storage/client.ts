import { NetworkRule } from "common/network-rule";
import { defer, Observable, share, shareReplay, switchMap } from "rxjs";
import { Destination, GetDataType, GetReturnType } from "webext-bridge";
import { OpenStream, SendMessage } from "../../types/webext-bridge";
import { StorageMessage, StorageMessageStreamName } from "./constants";

type Client = {
  [P in keyof typeof StorageMessage]: (
    data: GetDataType<(typeof StorageMessage)[P]>["data"],
    withOperator?: boolean
  ) => Promise<GetReturnType<(typeof StorageMessage)[P]>>;
} & {
  rules$: Observable<NetworkRule[]>;
};

export const createStorageClient = (
  sendMessage: SendMessage,
  openStream: OpenStream,
  destination: Destination
) => {
  const stream$ = defer(() =>
    openStream(StorageMessageStreamName.ruleStream, destination)
  ).pipe(share());
  const createClient = (operator?: string) => {
    const client = Object.entries(StorageMessage).reduce<Client>(
      (result: Client, [messageKey, messageValue]) => {
        //@ts-expect-error ts union type error
        result[messageKey] = (
          data: GetDataType<StorageMessage>["data"],
          withOperator = false
        ) => {
          return sendMessage(
            messageValue,
            {
              data,
              operator: withOperator ? operator : undefined,
            } as GetDataType<StorageMessage>,
            destination
          );
        };
        return result;
      },
      {} as Client
    );

    client.rules$ = stream$.pipe(
      switchMap((stream) => {
        return new Observable<NetworkRule[]>((subscribe) => {
          stream.onMessage((value) => {
            const { operator: currentOperator, rules } = value as unknown as {
              operator?: string;
              rules: NetworkRule[];
            };
            if (!operator || !currentOperator || operator !== currentOperator) {
              subscribe.next(rules);
            }
          });

          return () => stream.close();
        });
      }),
      shareReplay(1)
    );

    return client;
  };
  const client = createClient();

  return { client, createClient };
};

export { StorageMessage };
