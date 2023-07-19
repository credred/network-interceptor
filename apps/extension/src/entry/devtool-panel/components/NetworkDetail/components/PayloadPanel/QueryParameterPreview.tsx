import { useMemo } from "react";
import { KeyValuePair } from "./KeyValuePair";

export interface QueryParameterPreviewProps {
  value: string;
}

export const QueryParameterPreview: React.FC<QueryParameterPreviewProps> = ({
  value,
}) => {
  const keyValuePair = useMemo(
    () => [...new URLSearchParams(value).entries()],
    [value]
  );

  return <KeyValuePair value={keyValuePair} />;
};
