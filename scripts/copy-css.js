const fs = require("fs")
const path = require("path")

// Function to copy CSS files from .next/static to the output directory
function copyCssFiles() {
  console.log("Copying CSS files to static output...")

  const sourceDir = path.join(process.cwd(), ".next/static/css")
  const targetDir = path.join(process.cwd(), "dist")

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.log("No CSS directory found in .next/static")
    return
  }

  // Copy all CSS files
  const cssFiles = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".css"))

  if (cssFiles.length === 0) {
    console.log("No CSS files found in .next/static/css")
    return
  }

  cssFiles.forEach((file) => {
    const sourcePath = path.join(sourceDir, file)
    const targetPath = path.join(targetDir, "styles.css")

    fs.copyFileSync(sourcePath, targetPath)
    console.log(`Copied ${sourcePath} to ${targetPath}`)
  })

  console.log("CSS files copied successfully")
}

copyCssFiles()
