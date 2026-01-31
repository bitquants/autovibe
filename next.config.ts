import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    // Resolve from app directory so deps in my-app/node_modules are found
    // (avoids wrong root when parent has package.json / pnpm-lock)
    config.context = __dirname;
    config.resolve.modules = [
      path.join(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
