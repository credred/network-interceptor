import React, { createContext, useState } from "react";

interface HoverStateContextData {
  hoveredRowIndex: number | undefined;
  setHoveredRowIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export const hoverStateContext = createContext<HoverStateContextData>({
  hoveredRowIndex: undefined,
  setHoveredRowIndex: () => void 0,
});

export const HoverStateContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number>();
  return (
    <hoverStateContext.Provider value={{ hoveredRowIndex, setHoveredRowIndex }}>
      {children}
    </hoverStateContext.Provider>
  );
};
