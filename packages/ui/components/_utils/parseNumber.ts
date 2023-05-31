const parseNumber = (value: string | number) => {
  return typeof value === "number" ? value : parseInt(value);
};

export default parseNumber;
