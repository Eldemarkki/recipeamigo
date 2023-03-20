import Head from "next/head";
import config from "../config";

export default function Home() {
  return <>
    <Head>
      <title>{config.APP_NAME}</title>
      <meta name="description" content="Recipe sharing website" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <h1>{config.APP_NAME}</h1>
    </main>
  </>;
}
