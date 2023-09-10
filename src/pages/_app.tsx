import { Navbar } from "../components/navbar/Navbar";
import { useTheme } from "../hooks/useTheme";
import "../styles/index.scss";
import { ClerkProvider } from "@clerk/nextjs";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Open_Sans as OpenSans, DM_Serif_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";

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

const navbarHiddenPaths = ["/login", "/sign-up", "/profile/create"];

const App = ({ Component, pageProps, router }: AppProps) => {
  const showNavbar = !navbarHiddenPaths.some((path) =>
    router.pathname.startsWith(path),
  );
  useTheme();

  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-openSans: ${openSans.style.fontFamily};
            --font-dmSerifDisplay: ${dmSerifDisplay.style.fontFamily};
          }
        `}
      </style>
      <ClerkProvider {...pageProps}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              backgroundColor: "var(--background-color-secondary)",
              color: "var(--text)",
            },
          }}
        />
        <div style={{ height: "100%" }}>
          {showNavbar && <Navbar />}
          <Component {...pageProps} />
        </div>
      </ClerkProvider>
    </>
  );
};

export default appWithTranslation(App);
