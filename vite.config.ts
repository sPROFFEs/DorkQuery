import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use the repository name as the base path for GitHub Pages
  base: "/visual-dork-builder/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    // Ensure source maps are generated for easier debugging
    sourcemap: true,
    // Output to the dist folder
    outDir: "dist",
  },
})
