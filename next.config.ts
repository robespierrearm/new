import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/new',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
