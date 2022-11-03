import { FC, useEffect, useRef, useState } from "react";
import { onMessage, sendMessage } from "webext-bridge/devtools";
import NetworkBrief from "../NetworkBrief";
import NetWorkDetail from "../NetworkDetail";
import { NetworkInfo } from "common/api-interceptor/types";
import { rules$, saveRule } from "../../../../lib/storage";
import { mapValues } from "lodash";
import { initRuleByNetworkInfo, matchRule } from "common/network-rule";
import debugFn from "debug";
import NetworkToolbar from "../NetworkToolbar";
import { Modal } from "ui";
import NetworkRules from "../NetworkRules";
import { useMemoizedFn, useMount } from "ahooks";
const debug = debugFn("Network-Manager");

const useData = (onReceive: (networkInfo: NetworkInfo) => void) => {
  const [data, setData] = useState<Record<string, NetworkInfo>>({});
  const memoizedOnReceive = useMemoizedFn(onReceive);

  useEffect(() => {
    onMessage("request", ({ data: requestData }) => {
      setData((data) => ({ ...data, [requestData.id]: requestData }));
    });
  }, []);

  useEffect(() => {
    onMessage("response", ({ data: responseData }) => {
      setData((data) => {
        const networkInfo = { ...data[responseData.id], ...responseData };
        memoizedOnReceive(networkInfo);
        return {
          ...data,
          [networkInfo.id]: networkInfo,
        };
      });
    });
  }, []);

  useEffect(() => {
    const subscription = rules$.subscribe(() => {
      debug("apply ruleId to oldData when rules change");
      setData((data) =>
        mapValues(data, (networkInfo) => {
          if (networkInfo.ruleId) {
            return networkInfo;
          }
          const rule = matchRule(networkInfo);
          if (rule) {
            return { ...networkInfo, ruleId: rule.id };
          }
          return networkInfo;
        })
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  return [data, setData] as const;
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
  const [enableRecord, setEnableRecord] = useState(false);
  const ruleDisabled = useRef(false);

  const [data, setData] = useData((networkInfo) => {
    if (enableRecord && !networkInfo.ruleId) {
      const rule = initRuleByNetworkInfo(networkInfo);
      void saveRule(rule);
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
        clear={() => setData({})}
        toggleRecord={setEnableRecord}
        onOpenRules={() => setRulesVisible(true)}
        disableRule={disableRule}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <NetworkBrief
          data={data}
          currentNetworkDetail={currentNetworkDetail}
          setCurrentNetworkDetail={setCurrentNetworkDetail}
        />
        <NetWorkDetail detail={currentNetworkDetail} />
      </div>

      <Modal
        title="Rules"
        open={rulesVisible}
        footer={null}
        onCancel={() => setRulesVisible(false)}
      >
        <NetworkRules />
      </Modal>
    </div>
  );
};

export default Network;
