import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useState } from "react";

export type Filter = {
  search?: string;
}

export type BrowseFilterProps = {
  query: ParsedUrlQuery;
}

export const BrowseFilter = ({ query }: BrowseFilterProps) => {
  const router = useRouter();
  const initialSearch = query.search ? (typeof query.search === "string" ? query.search : query.search[0]) : "";

  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search) {
        const newParams = new URLSearchParams();
        newParams.set("search", search);
        const newUrl = "/browse?" + newParams.toString();
        router.push(newUrl);
      }
      else {
        router.push("/browse");
      }
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />;
};
