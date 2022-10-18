import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { FC } from "react";
import { Collapse, Tabs } from "ui";
import { NetworkInfo } from 'common/api-interceptor';
import "./index.less";

loader.config({ monaco });

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
  if (!headers) return undefined

  const contentType = headers["content-type"];

  if (contentType.includes("json")) {
    return 'json'
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

const NetWorkDetail: FC<NetWorkDetailProps> = (props) => {
  const { detail } = props;

  const lang = detectLang(detail?.responseHeaders)
  
  return (
    <div className="min-w-[600px]">
      <div className="h-full">
        <Tabs
          defaultActiveKey="headers"
          items={[
            {
              label: "Headers",
              key: "headers",
              children: <Headers detail={detail} />,
            },
            {
              label: "Response",
              key: "response",
              children: (
                <Editor
                  options={{ readOnly: !detail?.responseBodyParsable }}
                  theme="vs-dark"
                  language={lang}
                  height={"100%"}
                  value={detail?.responseBody}
                />
              ),
            },
          ]}
        ></Tabs>
      </div>
    </div>
  );
};

export default NetWorkDetail;
