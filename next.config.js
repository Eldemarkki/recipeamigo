const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: process.env.IMAGE_HOSTS.split(" ")
  },
  i18n,
  experimental: {
    swcPlugins: [
      ["next-superjson-plugin", {}]
    ]
  }
};

module.exports = nextConfig;
