import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@workspace/api-client-react"],
  allowedDevOrigins: ["*.replit.dev", "*.replit.app"],
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
