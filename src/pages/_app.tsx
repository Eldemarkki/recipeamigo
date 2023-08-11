import { Navbar } from "../components/navbar/Navbar";
import { useTheme } from "../hooks/useTheme";
import "../styles/index.scss";
import { ClerkProvider } from "@clerk/nextjs";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";

export type Props = {
  isLoggedIn: boolean;
};

const navbarHiddenPaths = ["/login", "/sign-up", "/profile/create"];

const App = ({ Component, pageProps, router }: AppProps<Props>) => {
  const showNavbar = !navbarHiddenPaths.some((path) =>
    router.pathname.startsWith(path),
  );
  useTheme();

  return (
    <ClerkProvider {...pageProps}>
      {showNavbar && <Navbar />}
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default appWithTranslation(App);
