export interface KeyValuePairProps {
  value: [string, string][];
}

export const KeyValuePair: React.FC<KeyValuePairProps> = (props) => {
  const { value } = props;
  return (
    <ol className="mb-0">
      {value.map((item, index) => {
        return (
          <li
            key={`${item[0]}-${index}`}
            className="leading-5 break-words break-all"
          >
            <span className="mr-1 font-bold text-color-subtitle">
              {item[0]}:{" "}
            </span>
            <span className="font-mono">{item[1]}</span>
          </li>
        );
      })}
    </ol>
  );
};
