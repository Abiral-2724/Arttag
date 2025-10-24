import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Uncomment if you are using server actions
    // serverActions: {},
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
   
  },
};

export default nextConfig;