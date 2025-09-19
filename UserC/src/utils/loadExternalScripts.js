// Utility to ensure external scripts are loaded before using them
export const loadExternalScripts = () => {
  return new Promise((resolve) => {
    // Check if scripts are already loaded
    if (window.Chart && window.L) {
      resolve()
      return
    }

    // Function to check if scripts are loaded
    const checkScripts = () => {
      if (window.Chart && window.L) {
        resolve()
      } else {
        setTimeout(checkScripts, 100)
      }
    }

    checkScripts()
  })
}

// Make scripts available globally
export const ensureGlobalScripts = () => {
  if (typeof window !== 'undefined') {
    // Chart.js and Leaflet should be available via script tags in index.html
    return loadExternalScripts()
  }
}
