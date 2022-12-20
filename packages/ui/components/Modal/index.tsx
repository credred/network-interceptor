import { Modal as AntModal, ModalProps as AntModalProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface ModalProps extends AntModalProps {
  /**
   * Show modal with full screen
   * @default false
   */
  fullScreen?: boolean;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { fullScreen, footer, className, width, ...restProps } = props;
  const { genCls } = usePrefixCls("modal");

  const overridingProps: Partial<ModalProps> = {
    footer: fullScreen ? footer || false : footer,
    width: fullScreen ? "100%" : width,
  };

  const renderNode: RenderNode = (classes) => (
    <AntModal
      className={classNames(
        classes,
        className,
        fullScreen && genCls("full-screen")
      )}
      {...restProps}
      {...overridingProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

export default Modal;
