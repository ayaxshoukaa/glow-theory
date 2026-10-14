import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@workspace/api-client-react"],
  allowedDevOrigins: [
    "*.replit.dev",
    "*.pike.replit.dev",
    "*.replit.app",
    "127.0.0.1",
    "localhost",
  ],
  async rewrites() {
    return [
      {
        source: "/shop-api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
