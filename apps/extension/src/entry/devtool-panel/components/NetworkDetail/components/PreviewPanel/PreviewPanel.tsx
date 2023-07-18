import PreviewJson from "./PreviewJson";

interface PreviewPanelProps {
  value: string;
  isBase64?: boolean;
}

const isBase64Image = (base64String: string) => {
  return base64String.startsWith("data:image/");
};

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  value,
  isBase64 = false,
}) => {
  if (!value) {
    return (
      <div className="flex w-full h-full items-center">
        <div className="text-center flex-1">
          <span className="font-bold text-lg">
            This request have not response body
          </span>
        </div>
      </div>
    );
  } else if (isBase64) {
    if (isBase64Image(value)) {
      return (
        <div className="p-5 text-center">
          <img src={value} />
        </div>
      );
    }
  } else {
    try {
      const obj = JSON.parse(value) as Record<string, unknown>;
      return <PreviewJson value={obj} className="p-1" />;
    } catch {}
  }
  return <span>TODO</span>;
};

export { PreviewPanel };
