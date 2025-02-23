import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '218.219.195.24',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
