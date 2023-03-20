const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_URL;

if (!hankoApiUrl) throw new Error("HANKO_URL is not defined");

const config = {
  APP_NAME: "Recipeamigo",
  HANKO_URL: hankoApiUrl,
};

export default config;
