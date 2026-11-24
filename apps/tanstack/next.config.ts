import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@board/kit"],
}

export default nextConfig
