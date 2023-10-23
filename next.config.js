const { i18n } = require("./next-i18next.config");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: (process.env.IMAGE_HOSTS ?? "").split(" "),
    // We can't use optimized images because they are loaded with a presigned S3 URL,
    // so the link is always different and the cache is never used, even though the
    // image is the same.
    unoptimized: true,
  },
  i18n,
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
