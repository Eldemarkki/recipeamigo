import dynamic from "next/dynamic";
import config from "../../config";
import styles from "./page.module.css";
const HankoAuth = dynamic(() => import("../../components/auth/HankoAuth"), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

// Currently the app name is "Recipeamigo" and the "Recipe" part should have a gradient.
// If/when the app name is changed, the styling part will have to be reconsidered, so this
// function will remind us to do that.
const ensureAppNameStyle = () => {
  const appName = config.APP_NAME;
  const appNameFirst = appName.slice(0, 6);
  if (appNameFirst !== "Recipe") throw new Error("Noncritical: Update login title");
  const appNameSecond = appName.slice(6);
  if (appNameSecond !== "amigo") throw new Error("Noncritical: Update login title");

  return { appNameFirst, appNameSecond };
};

export default function Home() {
  const { appNameFirst, appNameSecond } = ensureAppNameStyle();
  return <div className={styles.container}>
    <div className={styles.innerContainer}>
      <h1 className={styles.title}>
        <span className={styles.titleGradientPart}>{appNameFirst}</span>{appNameSecond}
      </h1>
      <HankoAuth />
    </div>
  </div>;
}
