/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from "classnames";
import React, { useMemo } from "react";
import { Tree, TreeDataNode, useToken } from "ui";

interface JsonNodeData extends TreeDataNode {
  value: string | [key: string | number, value: string];
  type: "object" | "array" | "string";
}

const jsonToTreeData = (
  data: unknown,
  parentKey: string | number = ""
): JsonNodeData[] => {
  if (typeof data === "object" && data !== null) {
    return Object.entries(data).map(([key, value]) => {
      const hasChildren =
        (typeof value === "object" &&
          value !== null &&
          !!Object.keys(value as object).length) ||
        (Array.isArray(value) && !!value.length);
      return {
        key: `${parentKey}.${key}`,
        value: [key, value],
        title: "",
        type: Array.isArray(value)
          ? "array"
          : typeof value === "object" && value !== null
          ? "object"
          : "string",
        children: hasChildren
          ? jsonToTreeData(value, `${parentKey}.${key}`)
          : undefined,
      };
    });
  } else if (Array.isArray(data)) {
    return data.map((value, key) => {
      const hasChildren =
        (typeof value === "object" && value !== null) || Array.isArray(value);
      return {
        key: `${parentKey}.${key}`,
        value: [key, value],
        title: "",
        type: Array.isArray(value)
          ? "array"
          : typeof value === "object" && value !== null
          ? "object"
          : "string",
        children: hasChildren
          ? jsonToTreeData(value, `${parentKey}.${key}`)
          : undefined,
      };
    });
  } else {
    return [
      {
        key: `${parentKey}.0`,
        value: JSON.stringify(data),
        title: "",
        type: "string",
      },
    ];
  }
};

const PreviewJson = ({
  value,
  className,
}: {
  value: Record<string | number, unknown>;
  className: string;
}) => {
  const { token } = useToken();
  const treeData: JsonNodeData[] = useMemo(() => {
    const hasChildren =
      (typeof value === "object" &&
        value !== null &&
        !!Object.keys(value as object).length) ||
      (Array.isArray(value) && !!value.length);
    return [
      {
        key: "@root",
        value: hasChildren
          ? typeof value === "object"
            ? "{...}"
            : "[...]"
          : JSON.stringify(value),
        type: "object",
        title: "",
        children: hasChildren ? jsonToTreeData(value) : undefined,
      },
    ];
  }, [value]);
  return (
    <Tree<JsonNodeData>
      className={classNames("font-mono", className)}
      checkable={false}
      selectable={false}
      defaultExpandAll
      compact
      treeData={treeData}
      titleRender={(node) => {
        let element: React.ReactNode;
        if (Array.isArray(node.value)) {
          element = (
            <>
              <span style={{ color: token.blue4 }}>{node.value[0]}</span>
              {/* <span className="text-blue-400">{node.value[0]}</span> */}
              <span>: </span>
              {node.children ? (
                <span>{node.type === "object" ? "{...}" : "[...]"}</span>
              ) : (
                <span
                  style={{
                    color:
                      typeof node.value[1] === "number" ||
                      typeof node.value[1] === "boolean"
                        ? token.cyan4
                        : token.magenta4,
                  }}
                >
                  {JSON.stringify(node.value[1])}
                </span>
              )}
            </>
          );
        } else {
          element = <span className={"text-emerald-400"}>{node.value}</span>;
        }
        return <span className="whitespace-nowrap">{element}</span>;
      }}
    />
  );
};

export default PreviewJson;
