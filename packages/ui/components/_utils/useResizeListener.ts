import { useLayoutEffect } from "react";
import { BasicTarget, getTargetElement } from "ahooks/lib/utils/domTarget";

const useResizeListener = (target: BasicTarget, onResize: () => void) => {
  const targetElement = getTargetElement(target);
  useLayoutEffect(() => {
    if (!targetElement) {
      return;
    }
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(targetElement);
    return () => resizeObserver.disconnect();
  }, [targetElement]);
};

export default useResizeListener;
