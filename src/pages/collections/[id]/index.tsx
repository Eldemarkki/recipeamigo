import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { queryParamToString } from "../../../utils/stringUtils";
import { getCollection } from "../../../database/collections";
import { getUserFromRequest } from "../../../utils/auth";
import { hasReadAccessToCollection } from "../../../utils/collectionUtils";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";

export default function CollectionPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <div>
      <h1>{props.collection.name}</h1>
      {props.collection.description && <p>{props.collection.description}</p>}
      <RecipeCardGrid
        recipes={props.collection.RecipesOnCollections.map((r) => r.recipe)}
      />
    </div>
  );
}

export const getServerSideProps = (async ({ req, locale, query }) => {
  const id = queryParamToString(query.id) ?? "";

  const collection = await getCollection(id);
  const user = await getUserFromRequest(req);

  if (!collection || !hasReadAccessToCollection(user, collection)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
      collection,
    },
  };
}) satisfies GetServerSideProps;
