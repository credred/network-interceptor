import React, { useLayoutEffect, useRef, useState } from "react";
import { VariableSizeGrid } from "react-window";
import { theme } from "antd";
import { AnyObject } from "antd/es/table/Table";
import { TableVirtualProps } from "../interface";
import Cell, { CellData } from "../Cell";
import { HoverStateContextProvider } from "../Cell/hoverStateContext";
import { GetComponentProps } from "rc-table/es/interface";

export interface useVirtualBodyOptions<RecordType> {
  genCls: (suffix?: string) => string;
  columns: TableVirtualProps<RecordType>["columns"];
  onRow: GetComponentProps<RecordType>;
  tableWidth: number;
  tableHeight: number;
  rowHeight: number;
}

const ChangeHOC: React.FC<{
  state: unknown;
  onChange: () => void;
  children: React.ReactElement;
}> = ({ state, onChange, children }) => {
  const prevState = useRef(state);
  useLayoutEffect(() => {
    if (state !== prevState.current) {
      onChange();
    }
    prevState.current = state;
  }, [state]);

  return children || null;
};

const useVirtualBody = <RecordType extends AnyObject>({
  genCls,
  columns,
  onRow,
  tableWidth,
  tableHeight,
  rowHeight,
}: useVirtualBodyOptions<RecordType>) => {
  const { token } = theme.useToken();
  const gridRef = useRef<VariableSizeGrid<CellData<RecordType>>>(null);
  const gridOutRef = useRef<HTMLDivElement>(null);
  const gridInnerRef = useRef<HTMLDivElement>(null);

  const [connectObject] = useState<{ scrollLeft: number }>(() => {
    const obj = {} as { scrollLeft: number };
    Object.defineProperty(obj, "scrollLeft", {
      get: () => {
        if (gridRef.current) {
          return (
            (gridRef.current?.state as { scrollLeft: number })?.scrollLeft || 0
          );
        }
        return null;
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true,
    });
  };

  const tableTotalHeight = useRef(0);
  const prevHasScrollbarRef = useRef(false);

  useLayoutEffect(() => resetVirtualGrid, [tableWidth]);
  useLayoutEffect(() => {
    const currentHasScrollbar = tableTotalHeight.current > tableHeight;
    if (currentHasScrollbar !== prevHasScrollbarRef.current) {
      resetVirtualGrid();
    }
  }, [tableHeight]);

  const renderBody: Required<
    TableVirtualProps<RecordType>
  >["components"]["body"] = (rawData, { scrollbarSize, ref, onScroll }) => {
    (
      ref as React.MutableRefObject<{
        scrollLeft: number;
      }>
    ).current = connectObject;
    const totalHeight = rawData.length * rowHeight;
    const hasScrollbar = totalHeight > tableHeight;

    prevHasScrollbarRef.current = hasScrollbar;
    return (
      <ChangeHOC state={hasScrollbar} onChange={resetVirtualGrid}>
        <HoverStateContextProvider>
          <VariableSizeGrid<CellData<RecordType>>
            ref={gridRef}
            outerRef={gridOutRef}
            innerRef={gridInnerRef}
            className={genCls("body")}
            columnCount={columns.length}
            columnWidth={(index: number) => {
              const { width } = columns[index];
              // return width as number;
              return hasScrollbar && index === columns.length - 1
                ? (width as number) - scrollbarSize - token.lineWidth
                : (width as number);
            }}
            itemData={{ data: rawData, columns, prefixCls: genCls(), onRow }}
            height={tableHeight}
            rowCount={rawData.length}
            rowHeight={() => rowHeight}
            width={tableWidth - (hasScrollbar ? token.lineWidth : 0)}
            onScroll={({ scrollLeft }: { scrollLeft: number }) => {
              onScroll({ scrollLeft });
            }}
            // eslint-disable-next-line react/no-children-prop
            children={Cell}
          />
        </HoverStateContextProvider>
      </ChangeHOC>
    );
  };

  return renderBody;
};

export default useVirtualBody;
