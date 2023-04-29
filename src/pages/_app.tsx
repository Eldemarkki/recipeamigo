import type { AppContext, AppInitialProps, AppProps } from "next/app";
import "../styles/index.scss";
import { Navbar } from "../components/navbar/Navbar";
import { useTheme } from "../hooks/useTheme";

export type Props = {
  isLoggedIn: boolean
}

const navbarHiddenPaths = [
  "/login",
  "/profile/create"
];

const App = ({ Component, pageProps, router }: AppProps<Props>) => {
  const showNavbar = !navbarHiddenPaths.includes(router.pathname);
  useTheme();

  return <>
    {showNavbar && <Navbar isLoggedIn={pageProps.isLoggedIn} />}
    <Component {...pageProps} />
  </>;
};

App.getInitialProps = async ({ ctx }: AppContext): Promise<AppInitialProps<Props>> => {
  const cookies = ctx.req?.headers.cookie?.split(";").reduce<Map<string, string>>((map, curr) => {
    const [key, value] = curr.split("=");
    map.set(key.trim(), value);
    return map;
  }, new Map());

  const isLoggedIn = Boolean(ctx.req?.headers.authorization || cookies?.get("hanko"));

  return {
    pageProps: {
      isLoggedIn
    }
  };
};

export default App;
