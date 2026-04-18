import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@foliotree/domain"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
