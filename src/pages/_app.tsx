import { Navbar } from "../components/navbar/Navbar";
import { useTheme } from "../hooks/useTheme";
import "../styles/index.scss";
import { ClerkProvider } from "@clerk/nextjs";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Open_Sans as OpenSans, DM_Serif_Display } from "next/font/google";

const openSans = OpenSans({
  variable: "--font-openSans",
  weight: "400",
  subsets: ["latin-ext"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dmSerifDisplay",
  weight: "400",
  subsets: ["latin-ext"],
});

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
      <div className={openSans.variable + " " + dmSerifDisplay.variable}>
        {showNavbar && <Navbar />}
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
};

export default appWithTranslation(App);
