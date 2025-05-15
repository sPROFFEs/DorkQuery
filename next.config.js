/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // This is critical for CSS processing
  webpack: (config) => {
    return config
  },
}

module.exports = nextConfig
