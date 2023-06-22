interface PreviewProps {
  value: string;
  isBase64?: boolean;
}

const isBase64Image = (base64String: string) => {
  return base64String.startsWith("data:image/");
};

const Preview: React.FC<PreviewProps> = ({ value, isBase64 = false }) => {
  if (isBase64) {
    if (isBase64Image(value)) {
      return (
        <div className="p-5 text-center">
          <img src={value} />
        </div>
      );
    }
  }
  return <span>TODO</span>;
};

export default Preview;
