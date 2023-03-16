import { FC, useEffect, useMemo, useRef, useState } from "react";
import { onMessage, sendMessage } from "webext-bridge/devtools";
import NetworkBrief from "../NetworkBrief";
import NetWorkDetail from "../NetworkDetail";
import { NetworkInfo } from "common/api-interceptor/types";
import { initRuleByNetworkInfo } from "common/network-rule";
import debugFn from "debug";
import NetworkToolbar from "../NetworkToolbar";
import { Modal, Splitter } from "ui";
import NetworkRules from "../NetworkRules";
import { useMemoizedFn, useMount } from "ahooks";
import { request } from "../utils/request";
import useFilterNetworkInfo from "./useFilterNetworkInfo";
const debug = debugFn("Network-Manager");

const useData = (onReceive: (networkInfo: NetworkInfo) => void) => {
  const [data, setData] = useState<Record<string, NetworkInfo>>({});
  const memoizedOnReceive = useMemoizedFn(onReceive);

  useEffect(() => {
    onMessage("request", ({ data: requestData }) => {
      if (data[requestData.id]) {
        debug(
          "the response has been received, but now received request",
          requestData
        );
        return;
      }
      setData((data) => ({ ...data, [requestData.id]: requestData }));
    });
  }, []);

  useEffect(() => {
    onMessage("response", ({ data: responseData }) => {
      setData((data) => {
        if (!data[responseData.id]) {
          debug(
            "received the response before receiving the request",
            responseData
          );
        }
        const networkInfo = { ...data[responseData.id], ...responseData };
        memoizedOnReceive(networkInfo);
        return {
          ...data,
          [networkInfo.id]: networkInfo,
        };
      });
    });
  }, []);

  // useEffect(() => {
  //   const subscription = rules$.subscribe(() => {
  //     debug("apply ruleId to oldData when rules change");
  //     setData((data) =>
  //       mapValues(data, (networkInfo) => {
  //         if (networkInfo.ruleId) {
  //           return networkInfo;
  //         }
  //         const rule = matchRule(networkInfo);
  //         if (rule) {
  //           return { ...networkInfo, ruleId: rule.id };
  //         }
  //         return networkInfo;
  //       })
  //     );
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  return [data, setData] as const;
};

const useDataManager = (onReceive: (networkInfo: NetworkInfo) => void) => {
  const [data, setData] = useData(onReceive);
  const originNetworkInfoList = useMemo(
    () => Array.from(Object.values(data)),
    [data]
  );
  const { filteredList: networkInfoList, doFilter } = useFilterNetworkInfo(
    originNetworkInfoList
  );
  const filteredData = networkInfoList.reduce<Record<string, NetworkInfo>>(
    (filteredData, networkInfo) => {
      filteredData[networkInfo.id] = networkInfo;
      return filteredData;
    },
    {}
  );
  return {
    networkInfoList,
    isEmpty: !originNetworkInfoList.length,
    data: filteredData,
    clearData: () => setData({}),
    doFilter,
  };
};

const useCurrentNetworkDetail = (data: Record<string, NetworkInfo>) => {
  const [currentNetworkDetail, setCurrentNetworkDetail] =
    useState<NetworkInfo>();

  useEffect(() => {
    // latestCurrentNetworkDetail may be updated or removed by filter
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
  const [enableRecord, setEnableRecord] = useState(false);
  const ruleDisabled = useRef(false);

  const { data, networkInfoList, isEmpty, doFilter, clearData } =
    useDataManager((networkInfo) => {
      if (enableRecord && !networkInfo.ruleId && networkInfo.responseBody) {
        const rule = initRuleByNetworkInfo(networkInfo);
        void request.updateRule(rule);
      }
    });
  const [currentNetworkDetail, setCurrentNetworkDetail] =
    useCurrentNetworkDetail(data);
  const [rulesVisible, setRulesVisible] = useState(false);

  useMount(() => {
    onMessage("pageLoad", () => {
      if (ruleDisabled.current) {
        void sendMessage("disableRule", ruleDisabled.current, "window");
      }
    });
  });

  const disableRule = (disabled: boolean) => {
    ruleDisabled.current = disabled;
    void sendMessage("disableRule", disabled, "window");
  };

  return (
    <div className="h-full flex flex-col">
      <NetworkToolbar
        clear={clearData}
        toggleRecord={setEnableRecord}
        search={doFilter}
        onOpenRules={() => setRulesVisible(true)}
        disableRule={disableRule}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Splitter>
          <NetworkBrief
            dataSource={networkInfoList}
            isEmpty={isEmpty}
            currentNetworkDetail={currentNetworkDetail}
            setCurrentNetworkDetail={setCurrentNetworkDetail}
          />
          <NetWorkDetail detail={currentNetworkDetail} />
        </Splitter>
      </div>

      <Modal
        title="Rules"
        open={rulesVisible}
        fullScreen
        onCancel={() => setRulesVisible(false)}
      >
        <NetworkRules />
      </Modal>
    </div>
  );
};

export default Network;
