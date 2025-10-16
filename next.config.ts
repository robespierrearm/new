import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/new' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
