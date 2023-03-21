import dynamic from "next/dynamic";
import styled from "styled-components";
import config from "../../config";
const HankoAuth = dynamic(() => import("../../components/auth/HankoAuth"), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

const Title = styled.h1({
  fontSize: "4rem",
  fontWeight: "bold",
  fontFamily: "Inter"
});

const TitleGradientPart = styled.span({
  background: "linear-gradient(90deg, #FFB800 0%, #FF5E00 100%)",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

const Container = styled.div({
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
});

const InnerContainer = styled.main({
  display: "flex",
  flexDirection: "column",
  gap: "4rem",
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
  return <Container>
    <InnerContainer>
      <Title>
        <TitleGradientPart>{appNameFirst}</TitleGradientPart>{appNameSecond}
      </Title>
      <HankoAuth />
    </InnerContainer>
  </Container>;
}
