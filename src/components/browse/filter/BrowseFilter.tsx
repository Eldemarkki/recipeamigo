import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useId, useState } from "react";
import styles from "./BrowseFilter.module.css";
import { useTranslation } from "next-i18next";
import { BrowseSort, Sort, getSortKey, sorts } from "../sort/BrowseSort";
import {
  isValidSortParam,
  queryParamToString,
} from "../../../utils/stringUtils";
import config from "../../../config";
import { TagSelect } from "../../tag/TagSelect";

export type Filter = {
  search?: string;
};

export type BrowseFilterProps = {
  query: ParsedUrlQuery;
};

export const BrowseFilter = ({ query }: BrowseFilterProps) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const initialSearch = queryParamToString(query.search) || "";
  const initialSortUnchecked = queryParamToString(query.sort) || "";
  const initialSort = isValidSortParam(initialSortUnchecked)
    ? initialSortUnchecked
    : config.RECIPE_PAGINATION_DEFAULT_SORT;
  const initialTags = Array.isArray(query.tags)
    ? query.tags
    : query.tags
    ? [query.tags]
    : [];

  // TODO: Navigating to the previous page creates a mismatch between the UI and the actual filter
  const [search, setSearch] = useState(initialSearch);
  const [tags, setTags] = useState(initialTags);

  const [sort, setSort] = useState<Sort>(
    sorts.find((sort) => getSortKey(sort) === initialSort) || sorts[0],
  );

  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.set("search", search);
  }
  if (tags.length > 0) {
    tags.forEach((tag) => searchParams.append("tags", tag));
  }

  if (getSortKey(sort) !== config.RECIPE_PAGINATION_DEFAULT_SORT) {
    searchParams.set("sort", getSortKey(sort));
  }
  const newUrl =
    "/browse" + (searchParams.size > 0 ? "?" + searchParams.toString() : "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(newUrl);
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    router.push(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, tags]);

  const tagSelectId = useId();

  return (
    <div className={styles.container}>
      <div className={styles.container}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("recipeFilter.searchPlaceholder")}
          className={styles.searchInput}
        />
        <TagSelect tags={tags} setTags={setTags} id={tagSelectId} />
      </div>
      <BrowseSort sort={sort} onChange={setSort} />
    </div>
  );
};
