/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure base path for GitHub Pages
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable image optimization since it's not supported in static exports
  images: {
    unoptimized: true,
  },
  // Configure trailing slash for better compatibility with GitHub Pages
  trailingSlash: true,
  // Configure asset prefix for GitHub Pages
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Configure internationalization
  i18n: {
    locales: ['es', 'en', 'de'],
    defaultLocale: 'es',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
