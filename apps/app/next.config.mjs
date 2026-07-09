/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@netlium/lib",
    "@netlium/ui",
    "@netlium/types"
  ]
};

export default nextConfig;
