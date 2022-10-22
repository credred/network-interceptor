import { FC, useEffect, useState } from "react";
import { Collapse, Tabs, Editor } from "ui";
import { NetworkInfo } from "common/api-interceptor";
import "./index.less";
import { getRuleById, saveRule } from "../../../../lib/storage";
import { initRuleByNetworkInfo, NetworkRule } from "common/network-rule";
import { usePrevious, useMemoizedFn } from "ahooks";
import debugFn from "debug";
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

const objToLabelValue = (obj: Record<string, string>) => {
  return Array.from(Object.entries(obj)).reduce<
    { label: string; value: string }[]
  >((result, [key, value]) => {
    result.push({ label: key, value });
    return result;
  }, []);
};

const detectLang = (headers?: Record<string, string>) => {
  if (!headers) return undefined;

  const contentType = headers["content-type"];

  if (contentType.includes("json")) {
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
            <li key={item.label} className="leading-5 truncate">
              <span className="mr-1">{item.label}: </span>
              <span>{item.value}</span>
            </li>
          );
        })}
    </ol>
  );
};

const Headers: FC<NetWorkDetailProps> = (props) => {
  const { detail } = props;
  if (!detail) return null;
  return (
    <Collapse className="network-detail-collapse" defaultActiveKey={["1"]}>
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
        <Collapse.Panel header="Response Headers" key="2">
          <HeadersList items={objToLabelValue(detail.requestHeaders)} />
        </Collapse.Panel>
      )}
      {detail.responseHeaders && (
        <Collapse.Panel header="Request Headers" key="3">
          <HeadersList items={objToLabelValue(detail.responseHeaders)} />
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
          partialRule = await getRuleById(networkInfo.ruleId);
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
    void saveRule({
      ...rule,
      modifyInfo: { ...rule.modifyInfo, responseBody: body },
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
    <div className="min-w-[600px]">
      <div className="h-full">
        <Tabs
          defaultActiveKey="headers"
          items={[
            {
              label: "Headers",
              key: "headers",
              children: <Headers detail={networkInfo} />,
            },
            {
              label: "Response",
              key: "response",
              children: (
                <Editor
                  options={{ readOnly: !networkInfo?.responseBodyParsable }}
                  theme="vs-dark"
                  language={lang}
                  value={networkInfo?.responseBody ?? ''}
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
