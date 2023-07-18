import { useEmotionCss } from "@ant-design/use-emotion-css";
import { usePrefixCls } from "ui/components/_utils/usePrefixCls";

const useStyles = () => {
  const { prefixCls } = usePrefixCls("");
  return useEmotionCss(({ token }) => ({
    [".NetworkDetail-preview"]: {
      color: token.colorError,
    },
  }));
};

export default useStyles;
