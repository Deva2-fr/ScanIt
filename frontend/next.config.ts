import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api", destination: "http://127.0.0.1:8000/api" },
      { source: "/api/:path*", destination: "http://127.0.0.1:8000/api/:path*" },
      { source: "/billing", destination: "http://127.0.0.1:8000/billing" },
      { source: "/billing/:path*", destination: "http://127.0.0.1:8000/billing/:path*" },
    ];
  },
};

export default nextConfig;
