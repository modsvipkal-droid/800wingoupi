import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable production browser source maps to prevent exposing source code in DevTools Sources */
  productionBrowserSourceMaps: false,

  /* Hide Next.js technology stack fingerprint header */
  poweredByHeader: false,

  devIndicators: false,

  allowedDevOrigins: [
    "172.22.185.199",
    "172.22.185.199:3000",
    "localhost",
    "127.0.0.1",
    "wingologic.com",
    "www.wingologic.com",
  ],

  experimental: {
    agentFeedback: true,
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
