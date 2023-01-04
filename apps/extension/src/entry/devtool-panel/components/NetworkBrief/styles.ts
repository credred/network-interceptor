import { useEmotionCss } from "@ant-design/use-emotion-css";

const useStyles = () =>
  useEmotionCss(({ token }) => ({
    [".networkBrief-table-row-error"]: {
      color: token.colorError,
    },
  }));

export default useStyles;
