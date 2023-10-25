import { Head, Html, Main, NextScript } from "next/document";

const plausibleDataDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN;
const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        {plausibleDataDomain && plausibleSrc && (
          <script
            defer
            data-domain={plausibleDataDomain}
            src={plausibleSrc}
          ></script>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
