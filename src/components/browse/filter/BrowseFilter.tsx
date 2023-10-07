import { generateSearchParams } from "../../../utils/browseUtils";
import { IngredientSelect } from "../../IngredientSelect";
import { NumberInput } from "../../forms/NumberInput";
import { TagSelect } from "../../tag/TagSelect";
import { sorts, BrowseSort, type SortKey } from "../sort/BrowseSort";
import styles from "./BrowseFilter.module.css";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";

export type BrowseFilterProps = {
  query: {
    search: string | undefined;
    tags: string[];
    excludedIngredients: string[];
    maximumTime: number | undefined;
    sort: SortKey;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
};

const compareStringArrays = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

export const BrowseFilter = ({ query, pagination }: BrowseFilterProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const initialSearch = query.search;
  const initialSort = query.sort;
  const initialTags = query.tags;
  const initialMaximumTime = query.maximumTime;
  const initialExcludedIngredients = query.excludedIngredients;

  // TODO: Navigating to the previous page creates a mismatch between the UI and the actual filter
  const [search, setSearch] = useState(initialSearch);
  const [tags, setTags] = useState(initialTags);
  const [maximumTime, setMaximumTime] = useState(initialMaximumTime);
  const [excludedIngredients, setExcludedIngredients] = useState(
    initialExcludedIngredients,
  );

  const [sort, setSort] = useState<SortKey>(
    sorts.find((sort) => sort === initialSort) || sorts[0],
  );

  const newPage =
    search !== initialSearch ||
    maximumTime !== initialMaximumTime ||
    sort !== initialSort ||
    !compareStringArrays(tags, initialTags) ||
    !compareStringArrays(excludedIngredients, initialExcludedIngredients)
      ? 1
      : pagination.page;

  const searchParams = generateSearchParams({
    search,
    tags,
    maximumTime,
    excludedIngredients,
    sort,
    pagination: {
      page: newPage,
      pageSize: pagination.pageSize,
    },
  });

  const newUrl =
    "/browse" + (searchParams.size > 0 ? "?" + searchParams.toString() : "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      void router.push(newUrl);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, maximumTime]);

  useEffect(() => {
    void router.push(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, tags, excludedIngredients]);

  const tagSelectId = useId();

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        placeholder={t("recipeFilter.searchPlaceholder")}
        className={styles.searchInput}
      />
      <div>
        <label htmlFor={tagSelectId}>{t("browse:labels.tags")}</label>
        <TagSelect tags={tags} setTags={setTags} id={tagSelectId} />
      </div>
      <BrowseSort sort={sort} onChange={setSort} />
      <div>
        <label>{t("browse:labels.maximumTime.label")}</label>
        <NumberInput
          value={maximumTime}
          onChange={setMaximumTime}
          placeholder={t("browse:labels.maximumTime.placeholder")}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label>{t("browse:labels.excludeIngredients")}</label>
        <IngredientSelect
          multi
          ingredients={excludedIngredients}
          setIngredients={setExcludedIngredients}
        />
      </div>
    </div>
  );
};
