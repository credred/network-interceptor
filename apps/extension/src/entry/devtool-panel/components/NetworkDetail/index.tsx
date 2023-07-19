import { FC, useEffect, useState } from "react";
import { Tabs, Editor, TabsProps } from "ui";
import { NetworkInfo } from "common/api-interceptor";
import { initRuleByNetworkInfo, NetworkRule } from "common/network-rule";
import { usePrevious, useMemoizedFn } from "ahooks";
import debugFn from "debug";
import { request } from "../utils/request";
import { Header } from "common/typings";
import { PreviewPanel } from "./components/PreviewPanel";
import { HeadersPanel } from "./components/HeadersPanel";
import { PayloadPanel, hasPayload } from "./components/PayloadPanel";

const debug = debugFn("NetworkDetail");
debugFn.enable("*");

interface NetWorkDetailProps {
  detail: NetworkInfo | undefined;
}

const detectLang = (headers?: Header[]) => {
  if (!headers) return undefined;
  const header = new Headers(headers);
  const contentType = header.get("content-type");

  if (contentType?.includes("json")) {
    return "json";
  }
};

const useRule = (networkInfo?: NetworkInfo) => {
  const previousNetworkInfo = usePrevious(networkInfo);

  const networkInfoChanged =
    previousNetworkInfo?.id !== networkInfo?.id ||
    previousNetworkInfo?.ruleId !== networkInfo?.ruleId;

  const [rule, setRule] = useState<NetworkRule | undefined>(undefined);

  useEffect(() => {
    const fn = async () => {
      if (!networkInfo) return;
      if (networkInfoChanged) {
        // generate new rule
        let partialRule: Partial<NetworkRule> = {};
        if (networkInfo.ruleId) {
          partialRule = (await request.getRule(networkInfo.ruleId)) || {};
        }
        const rule = initRuleByNetworkInfo(networkInfo, partialRule);
        debug("init rule", rule);

        setRule(rule);
      } else {
        // update rule
      }
    };
    void fn();
  }, [networkInfo]);

  return rule;
};

const useRuleForUpdate = (rule?: NetworkRule) => {
  const updateResponseBody = useMemoizedFn((body: string | undefined) => {
    if (!rule) return;
    void request.updateRule({
      ...rule,
      modifyInfo: {
        ...rule.modifyInfo,
        response: {
          ...rule.modifyInfo.response,
          responseBody: body,
        },
      },
    });
  });

  return { updateResponseBody };
};

const NetWorkDetail: FC<NetWorkDetailProps> = (props) => {
  const { detail: networkInfo } = props;

  const lang = detectLang(networkInfo?.responseHeaders);
  const rule = useRule(networkInfo);
  const { updateResponseBody } = useRuleForUpdate(rule);

  return (
    <div className="min-w-[600px] basis-0 h-full">
      <div className="h-full">
        <Tabs
          compact
          defaultActiveKey="headers"
          items={
            [
              {
                label: "Headers",
                key: "headers",
                children: <HeadersPanel detail={networkInfo} />,
              },
              hasPayload(networkInfo) && {
                label: "Payload",
                key: "payload",
                children: <PayloadPanel detail={networkInfo} />,
              },
              {
                label: "Preview",
                key: "preview",
                children: (
                  <PreviewPanel
                    key={networkInfo?.id}
                    isBase64={networkInfo?.isBase64}
                    value={networkInfo?.responseBody ?? ""}
                  />
                ),
              },
              {
                label: "Response",
                key: "response",
                children: (
                  <Editor
                    seed={networkInfo?.id}
                    autoFormat
                    options={{ readOnly: networkInfo?.isBase64 }}
                    theme="vs-dark"
                    language={lang}
                    value={networkInfo?.responseBody ?? ""}
                    onChange={updateResponseBody}
                  />
                ),
              },
              {
                label: "Rules",
                key: "rules",
                children: "rule",
              },
            ].filter(Boolean) as TabsProps["items"]
          }
        ></Tabs>
      </div>
    </div>
  );
};

export default NetWorkDetail;
