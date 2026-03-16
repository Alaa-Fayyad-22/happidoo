import type { NextConfig } from "next";

// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kffoevhciytnvjvnlpxp.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
};

module.exports = nextConfig;

export default nextConfig;
