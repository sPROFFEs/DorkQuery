const fs = require("fs")
const path = require("path")

// Check if package-lock.json exists
const packageLockPath = path.join(__dirname, "..", "package-lock.json")
const packageLockExists = fs.existsSync(packageLockPath)

console.log(`Package lock file exists: ${packageLockExists}`)

if (!packageLockExists) {
  console.log("Generating package-lock.json...")
  // This is just a check script, the actual generation happens in the GitHub Actions workflow
  console.log('Run "npm install --package-lock-only" to generate the lock file')
}

// Check if yarn.lock exists
const yarnLockPath = path.join(__dirname, "..", "yarn.lock")
const yarnLockExists = fs.existsSync(yarnLockPath)

console.log(`Yarn lock file exists: ${yarnLockExists}`)

// Check if both lock files exist (which is not recommended)
if (packageLockExists && yarnLockExists) {
  console.warn(
    "WARNING: Both package-lock.json and yarn.lock exist. This can cause issues. Consider removing one of them.",
  )
}

// Exit with appropriate code
if (packageLockExists || yarnLockExists) {
  console.log("Lock file check passed")
  process.exit(0)
} else {
  console.error("No lock file found. This might cause issues with GitHub Actions.")
  process.exit(1)
}
