/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@netlium/lib",
    "@netlium/ui",
    "@netlium/types",
    "@neptlium/design-system"
  ],
  experimental: {
    serverActions: {
      // Server Actions compare the request's Origin header against the safelist
      // below. In this dev environment the browser's Origin can show up as either
      // localhost (proxied) or the forwarded Codespaces hostname (direct), so both
      // sides of that mismatch need to be allowed.
      allowedOrigins: ["localhost:3001", "*.app.github.dev"]
    }
  }
};

export default nextConfig;
