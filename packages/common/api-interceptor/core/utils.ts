export const postTask = (): Promise<void> => {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      resolve();
    };
    channel.port2.postMessage("");
  });
};

export const statusHasBody = (status: number) => {
  return ![101, 204, 205, 304].includes(status);
};
