import { Collapse } from "ui";
import { Header } from "common/typings";
import { NetworkInfo } from "common/api-interceptor";

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

const HeadersList: React.FC<HeadersListProps> = (props) => {
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

export interface HeadersPanelProps {
  detail: NetworkInfo | undefined;
}

const HeadersPanel: React.FC<HeadersPanelProps> = (props) => {
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

export { HeadersPanel };
