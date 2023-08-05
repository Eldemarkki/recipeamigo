const { i18n } = require("./next-i18next.config");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: (process.env.IMAGE_HOSTS ?? "").split(" "),
  },
  i18n,
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
