import createMiddleware from "next-intl/middleware"

// Get the base path from environment variable
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["es", "en", "de"],

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: "es",

  // Configure the base path for GitHub Pages
  pathnames: {
    // Add the base path to all pathnames
    "/": "/",
    "/ctf": "/ctf",
    "/curso": "/curso",
    "/about": "/about",
  },
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
