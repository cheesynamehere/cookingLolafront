import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/upload-audio',

        destination: 'http://localhost:5000/api/upload-audio',
      },
    ]
  },
};

export default nextConfig;
