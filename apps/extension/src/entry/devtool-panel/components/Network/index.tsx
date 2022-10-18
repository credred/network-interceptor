import { FC, useEffect, useState } from "react";
import { onMessage } from "webext-bridge/devtools";
import NetworkBrief from "../NetworkBrief";
import NetWorkDetail from "../NetworkDetail";
import { NetworkInfo } from 'common/api-interceptor/types';

const useData = () => {
  const [data, setData] = useState<Record<string, NetworkInfo>>({});
  useEffect(() => {
    onMessage("request", ({ data: requestData }) => {
      setData((data) => ({ ...data, [requestData.id]: requestData }));
    });
  }, []);

  useEffect(() => {
    onMessage("response", ({ data: responseData }) => {
      setData((data) => ({ ...data, [responseData.id]: responseData }));
    });
  }, []);

  return data;
};

const useCurrentNetworkDetail = (data: Record<string, NetworkInfo>) => {
  const [currentNetworkDetail, setCurrentNetworkDetail] =
    useState<NetworkInfo>();

  useEffect(() => {
    const latestCurrentNetworkDetail =
      currentNetworkDetail && data[currentNetworkDetail.id];
    if (
      currentNetworkDetail &&
      currentNetworkDetail !== latestCurrentNetworkDetail
    ) {
      setCurrentNetworkDetail(latestCurrentNetworkDetail);
    }
  }, [data]);

  return [currentNetworkDetail, setCurrentNetworkDetail] as const;
};

const Network: FC = () => {
  const data = useData();
  const [currentNetworkDetail, setCurrentNetworkDetail] =
    useCurrentNetworkDetail(data);

  return (
    <div className="h-full flex">
      <NetworkBrief
        data={data}
        currentNetworkDetail={currentNetworkDetail}
        setCurrentNetworkDetail={setCurrentNetworkDetail}
      />
      <NetWorkDetail detail={currentNetworkDetail} />
    </div>
  );
};

export default Network;
