import { Allotment, AllotmentProps } from "allotment";
import "allotment/dist/style.css";

const Splitter = (props: AllotmentProps) => {
  return <Allotment {...props} />;
};

export default Splitter;
export type { AllotmentProps as SplitterProps };
