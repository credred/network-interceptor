import { useEmotionCss } from "@ant-design/use-emotion-css";
import { usePrefixCls } from "ui/components/_utils/usePrefixCls";

const useStyles = () => {
  const { prefixCls } = usePrefixCls("table");
  return useEmotionCss(({ token }) => ({
    [".networkBrief-table-row-error"]: {
      color: token.colorError,
    },
    [`.${prefixCls}-small`]: {
      [".networkBrief-table-cell-marker"]: {
        borderLeft: `${token.lineWidthBold}px ${token.lineType} ${token.colorSuccess}`,
        paddingLeft: `${token.paddingXS - token.lineWidthBold}px`,
      },
    },
  }));
};

export default useStyles;
