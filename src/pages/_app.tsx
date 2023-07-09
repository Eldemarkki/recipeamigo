import type { AppContext, AppInitialProps, AppProps } from "next/app";
import "../styles/index.scss";
import { Navbar } from "../components/navbar/Navbar";
import { useTheme } from "../hooks/useTheme";
import { appWithTranslation } from "next-i18next";
import { ClerkProvider } from "@clerk/nextjs";

export type Props = {
  isLoggedIn: boolean
}

const navbarHiddenPaths = [
  "/login",
  "/profile/create"
];

const App = ({ Component, pageProps, router }: AppProps<Props>) => {
  const showNavbar = !navbarHiddenPaths.some(path => router.pathname.startsWith(path));
  useTheme();

  return <ClerkProvider {...pageProps}>
    {showNavbar && <Navbar />}
    <Component {...pageProps} />
  </ClerkProvider>;
};

export default appWithTranslation(App);
