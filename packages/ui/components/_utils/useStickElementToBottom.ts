import { useRef } from "react";
import { useEventListener, useThrottleFn } from "ahooks";
import { BasicTarget, getTargetElement } from "ahooks/lib/utils/domTarget";
import useResizeListener from "./useResizeListener";

const isScrolledToBottom = (element: HTMLElement) =>
  Math.abs(element.scrollTop + element.clientHeight - element.scrollHeight) <=
  2;

const useStickElementToBottom = (target: BasicTarget<HTMLElement>) => {
  const shouldStickToBottom = useRef(true);
  /** tryStrickToBottom will trigger scroll event. After the height of the element changes, the scroll event may be triggered first */
  const isTriggerScrollFromCode = useRef(false);
  const scrollContainer = getTargetElement(target);

  const tryStrickToBottom = () => {
    if (!scrollContainer) return;
    if (shouldStickToBottom.current) {
      const newScrollTop =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (scrollContainer.scrollTop !== newScrollTop) {
        scrollContainer.scrollTop = newScrollTop;
        throttledOnScroll.flush();
        isTriggerScrollFromCode.current = true;
      }
    }
  };

  const updateStickToBottom = () => {
    if (!scrollContainer) return;

    shouldStickToBottom.current = isScrolledToBottom(scrollContainer);
  };

  const throttledOnScroll = useThrottleFn(
    () => {
      if (isTriggerScrollFromCode.current) {
        isTriggerScrollFromCode.current = false;
        return;
      }
      updateStickToBottom();
    },
    { leading: true, wait: 10 }
  );

  const onUpdateScrollHeight = () => {
    tryStrickToBottom();
  };

  const onResize = () => {
    tryStrickToBottom();
  };

  useEventListener("scroll", throttledOnScroll.run, { target });
  useResizeListener(target, onResize);

  return onUpdateScrollHeight;
};

export default useStickElementToBottom;
