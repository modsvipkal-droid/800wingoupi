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

  async rewrites() {
    return [
      {
        source: "/wingo-30s-prediction",
        destination: "/?t=wingo-30s",
      },
      {
        source: "/wingo-1-minute-prediction",
        destination: "/?t=wingo-1m",
      },
      {
        source: "/wingo-pattern-radar",
        destination: "/?t=pattern-radar",
      },
      {
        source: "/wingo-calculator",
        destination: "/?t=calculator",
      },
      {
        source: "/about",
        destination: "/?t=about",
      },
    ];
  },
};

export default nextConfig;
