import { FC, useEffect, useState } from "react";
import { Collapse, Tabs, Editor } from "ui";
import { NetworkInfo } from "common/api-interceptor";
import "./index.less";
import { initRuleByNetworkInfo, NetworkRule } from "common/network-rule";
import { usePrevious, useMemoizedFn } from "ahooks";
import debugFn from "debug";
import { request } from "../utils/request";
import { Header } from "common/typings";
import Preview from "./components/Preview";
const debug = debugFn("NetworkDetail");
debugFn.enable("*");

interface NetWorkDetailProps {
  detail: NetworkInfo | undefined;
}

interface HeadersListProps {
  items: {
    label: string;
    value?: string | number;
  }[];
}

const headerTupleToLabelValue = (headerTuple: Header[]) => {
  return headerTuple.reduce<{ label: string; value: string }[]>(
    (result, [key, value]) => {
      result.push({ label: key, value });
      return result;
    },
    []
  );
};

const detectLang = (headers?: Header[]) => {
  if (!headers) return undefined;
  const header = new Headers(headers);
  const contentType = header.get("content-type");

  if (contentType?.includes("json")) {
    return "json";
  }
};

const HeadersList: FC<HeadersListProps> = (props) => {
  const { items } = props;
  return (
    <ol className="mb-0">
      {items
        .filter((item) => item.value)
        .map((item) => {
          return (
            <li key={item.label} className="leading-5 break-words break-all">
              <span className="mr-1 font-bold text-color-subtitle">
                {item.label}:{" "}
              </span>
              <span>{item.value}</span>
            </li>
          );
        })}
    </ol>
  );
};

const HeadersPanel: FC<NetWorkDetailProps> = (props) => {
  const { detail } = props;
  if (!detail) return null;
  return (
    <Collapse
      className="network-detail-collapse"
      ghost
      collapsible="icon"
      defaultActiveKey={["1", "2", "3"]}
    >
      <Collapse.Panel header="General" key="1">
        <HeadersList
          items={[
            {
              label: "Request URL",
              value: detail.url,
            },
            {
              label: "Request Method",
              value: detail.method,
            },
            {
              label: "Status Code",
              value: detail.status
                ? detail.statusText
                  ? `${detail.status} ${detail.statusText}`
                  : detail.status
                : undefined,
            },
          ]}
        />
      </Collapse.Panel>
      {detail.requestHeaders && (
        <Collapse.Panel header="Request Headers" key="2">
          <HeadersList items={headerTupleToLabelValue(detail.requestHeaders)} />
        </Collapse.Panel>
      )}
      {detail.responseHeaders && (
        <Collapse.Panel header="Response Headers" key="3">
          <HeadersList
            items={headerTupleToLabelValue(detail.responseHeaders)}
          />
        </Collapse.Panel>
      )}
    </Collapse>
  );
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
          items={[
            {
              label: "Headers",
              key: "headers",
              children: <HeadersPanel detail={networkInfo} />,
            },
            {
              label: "Preview",
              key: "preview",
              children: (
                <Preview
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
          ]}
        ></Tabs>
      </div>
    </div>
  );
};

export default NetWorkDetail;
