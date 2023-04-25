/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: process.env.IMAGE_HOSTS.split(" ")
  }
};

module.exports = nextConfig;
