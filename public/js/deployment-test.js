// This script tests if the deployment is working correctly
;(() => {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes("github.io")

  // Get the base path
  const basePath = "/Interactive-Hacking-Website"

  // Create a test element
  const testElement = document.createElement("div")
  testElement.id = "deployment-test"
  testElement.style.position = "fixed"
  testElement.style.bottom = "20px"
  testElement.style.right = "20px"
  testElement.style.padding = "10px"
  testElement.style.backgroundColor = "#10b981"
  testElement.style.color = "white"
  testElement.style.borderRadius = "5px"
  testElement.style.zIndex = "9999"

  // Add test information
  if (isGitHubPages) {
    testElement.textContent = "GitHub Pages Deployment: Success"

    // Test if assets are loading correctly
    const img = new Image()
    img.onload = () => {
      console.log("Asset loading: Success")
    }
    img.onerror = () => {
      console.error("Asset loading: Failed")
      testElement.textContent = "GitHub Pages Deployment: Asset loading failed"
      testElement.style.backgroundColor = "#ef4444"
    }
    img.src = `${basePath}/images/cyber-bg.png`

    // Test if the base path is configured correctly
    if (window.location.pathname.includes(basePath)) {
      console.log("Base path configuration: Success")
    } else {
      console.error("Base path configuration: Failed")
      testElement.textContent = "GitHub Pages Deployment: Base path configuration failed"
      testElement.style.backgroundColor = "#ef4444"
    }
  } else {
    testElement.textContent = "Local Development: OK"
  }

  // Add the test element to the page
  document.body.appendChild(testElement)
})()
