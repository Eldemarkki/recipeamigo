import Head from "next/head";
import config from "../config";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../utils/auth";
import { JwtPayload } from "jsonwebtoken";

type HomeProps = {
  user: string | JwtPayload | null;
}

export default function Home(props: HomeProps) {  
  return <>
    <Head>
      <title>{config.APP_NAME}</title>
      <meta name="description" content="Recipe sharing website" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <h1>{config.APP_NAME}</h1>
      <div>
        <Link href="/login">Login</Link>
      </div>
      {props.user && <div>
        <Link href="/profile">Profile</Link>
      </div>}
      {props.user && <div>
        Logged in as {typeof props.user === "string" ? props.user : props.user.sub}
      </div>}
    </main>
  </>;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ req }) => {
  const user = await getUserFromRequest(req);

  return {
    props: {
      user: user
    },
  };
};
