// Utility functions for GitHub Pages deployment

/**
 * Gets the correct path for assets in GitHub Pages
 * @param path The original path
 * @returns The corrected path for GitHub Pages
 */
export function getAssetPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  // If the path already starts with the base path, return it as is
  if (path.startsWith(basePath)) {
    return path
  }

  // If the path starts with a slash, append it to the base path
  if (path.startsWith("/")) {
    return `${basePath}${path}`
  }

  // Otherwise, append the path to the base path with a slash
  return `${basePath}/${path}`
}

/**
 * Gets the correct URL for a page in GitHub Pages
 * @param locale The locale
 * @param path The original path
 * @returns The corrected URL for GitHub Pages
 */
export function getPageUrl(locale: string, path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path

  // Construct the URL with the locale
  return `${basePath}/${locale}/${cleanPath}`
}

/**
 * Checks if the current environment is GitHub Pages
 * @returns True if the current environment is GitHub Pages
 */
export function isGitHubPages(): boolean {
  if (typeof window === "undefined") {
    return !!process.env.NEXT_PUBLIC_BASE_PATH
  }

  // Check if the URL contains github.io
  return window.location.hostname.includes("github.io")
}
