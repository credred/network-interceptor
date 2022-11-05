import { Modal as AntModal, ModalProps as AntModalProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import "./index.less";

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
    className: classNames(className, fullScreen && genCls("full-screen")),
  };

  return <AntModal {...restProps} {...overridingProps} />;
};

export default Modal;
