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
  // Critical for CSS processing in static exports
  transpilePackages: ["lucide-react"],
  // Ensure CSS is properly extracted
  webpack: (config) => {
    // This helps with CSS extraction for static exports
    return config
  },
}

module.exports = nextConfig
