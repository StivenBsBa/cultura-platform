import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Mantiene la comprobación de tipos, evitando el parser de `tsc --showConfig`
  // que falla bajo la combinación actual de Next.js y Node 24.
  experimental: { useTypeScriptCli: false },
};
export default nextConfig;
