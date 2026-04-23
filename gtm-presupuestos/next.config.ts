import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/presupuestos",
  bundlePagesRouterDependencies: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
