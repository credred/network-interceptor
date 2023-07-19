import { NetworkInfo } from "common/api-interceptor";
import { Collapse } from "ui";
import { PreviewPanel } from "../PreviewPanel";
import { QueryParameterPreview } from "./QueryParameterPreview";

export interface PayloadPanelProps {
  detail: NetworkInfo | undefined;
}

const isFormData = (contentType?: string | null) =>
  contentType?.includes("application/x-www-form-urlencoded");

export const hasPayload = (detail: NetworkInfo | undefined) => {
  if (!detail) return false;
  const search = new URL(detail.url).search;
  return !!search || !!detail.requestBody;
};

export const PayloadPanel: React.FC<PayloadPanelProps> = (props) => {
  const { detail } = props;
  if (!detail) return null;

  const search = new URL(detail.url).search;

  return (
    <Collapse
      className="network-detail-collapse"
      ghost
      collapsible="icon"
      defaultActiveKey={["1", "2"]}
    >
      {search && (
        <Collapse.Panel header="Query String Parameters" key="1">
          <QueryParameterPreview value={search} />
        </Collapse.Panel>
      )}
      {detail.requestBody &&
        (isFormData(new Headers(detail.requestHeaders).get("content-type")) ? (
          <Collapse.Panel header="Form Data" key="2">
            <QueryParameterPreview value={detail.requestBody} />
          </Collapse.Panel>
        ) : (
          <Collapse.Panel header="Request Payload" key="2">
            <PreviewPanel value={detail.requestBody} />
          </Collapse.Panel>
        ))}
    </Collapse>
  );
};
