import { useMemoizedFn } from "ahooks";
import { NetworkInfo } from "common/api-interceptor/types";
import { filter } from "lodash";
import { useEffect, useRef, useState } from "react";

const useFilterNetworkInfo = <T extends NetworkInfo[]>(data: T) => {
  const filterStrRef = useRef("");
  const [filteredList, setFilteredData] = useState<T>(data);

  const doFilter = useMemoizedFn((userFilterStr?: string) => {
    if (userFilterStr !== undefined) {
      filterStrRef.current = userFilterStr;
    }
    const filterStr = filterStrRef.current;

    let filteredData: T;
    if (filterStr) {
      filteredData = filter(data, (networkInfo) =>
        networkInfo.url.includes(filterStr.trim())
      ) as T;
    } else {
      filteredData = data;
    }

    setFilteredData(filteredData);
  });

  useEffect(() => {
    doFilter();
  }, [data]);

  return {
    doFilter,
    filteredList,
  };
};

export default useFilterNetworkInfo;
