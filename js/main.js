import * as blockManager from './blockManager.js'; // Import all exports as blockManager object
import { initCustomBlockEditor } from './customBlock.js';
import { initGhdbExplorer } from './ghdbExplorerUI.js';
import { initDragAndDrop, _setBlockManagerModule } from './dnd.js'; // Import DnD functions
import { loadAllLocalGhdbEntries } from './ghdbService.js';
import { qs } from './domUtils.js';

/**
 * Initialize the database loading screen
 */
function initDatabaseLoading() {
    const loadingScreen = qs('#database-loading');
    const progressFill = qs('#progress-fill');
    const loadingDetails = qs('#loading-details');
    
    function updateProgress(percentage, message) {
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (loadingDetails) {
            loadingDetails.textContent = message;
        }
    }
    
    function hideLoadingScreen() {
        loadingScreen?.classList.add('hidden');
    }
    
    // Simulate progress during database loading
    return {
        show: () => loadingScreen?.classList.remove('hidden'),
        hide: hideLoadingScreen,
        updateProgress,
        loadDatabase: async () => {
            updateProgress(10, 'Fetching compressed database...');
            console.log('Starting database load...');
            
            try {
                updateProgress(30, 'Downloading data...');
                await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for UX
                
                updateProgress(60, 'Decompressing data...');
                console.log('Calling loadAllLocalGhdbEntries...');
                
                const result = await loadAllLocalGhdbEntries();
                console.log('loadAllLocalGhdbEntries result:', result);
                
                updateProgress(90, 'Processing entries...');
                await new Promise(resolve => setTimeout(resolve, 200));
                
                updateProgress(100, 'Database loaded successfully!');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                console.log('Database loading completed successfully');
                hideLoadingScreen();
                return true;
            } catch (error) {
                console.error('Database loading failed:', error);
                updateProgress(0, 'Failed to load database. Please refresh to try again.');
                await new Promise(resolve => setTimeout(resolve, 2000));
                hideLoadingScreen();
                return false;
            }
        }
    };
}

/**
 * Initialize the welcome overlay functionality
 */
function initWelcomeOverlay() {
    const overlay = qs('#welcome-overlay');
    const closeBtn = qs('#close-overlay');
    const gotItBtn = qs('#got-it-btn');
    
    function hideOverlay() {
        overlay?.classList.add('hidden');
        localStorage.setItem('dorkquery_overlay_seen', 'true');
    }
    
    function showOverlay() {
        overlay?.classList.remove('hidden');
    }
    
    // Setup event listeners
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideOverlay();
        });
    }
    
    if (gotItBtn) {
        gotItBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideOverlay();
        });
    }
    
    // Close overlay when clicking outside content
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideOverlay();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay?.classList.contains('hidden')) {
            hideOverlay();
        }
    });
    
    return {
        show: showOverlay,
        hide: hideOverlay,
        shouldShow: () => !localStorage.getItem('dorkquery_overlay_seen')
    };
}

/**
 * Main function to initialize the application.
 */
async function main() {
    console.log("Static Dork Builder Initializing...");
    
    // Initialize welcome overlay
    const welcomeOverlay = initWelcomeOverlay();
    
    // Load database directly without fancy loading screen for now
    try {
        console.log('Loading database...');
        await loadAllLocalGhdbEntries();
        console.log('Database loaded successfully');
        
        // Hide loading screen
        const loadingScreen = qs('#database-loading');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Setup help button
        const helpButton = qs('#help-button');
        if (helpButton) {
            helpButton.addEventListener('click', (e) => {
                e.preventDefault();
                welcomeOverlay.show();
            });
        }
        
        // Show welcome overlay if user hasn't seen it before
        if (welcomeOverlay.shouldShow()) {
            welcomeOverlay.show();
        }
    } catch (error) {
        console.error('Failed to load database:', error);
        const loadingScreen = qs('#database-loading');
        if (loadingScreen) {
            loadingScreen.innerHTML = '<div class="loading-content"><h3>❌ Failed to load database</h3><p>Please refresh the page to try again.</p></div>';
        }
        return;
    }
    
    // Provide blockManager module to dnd.js to resolve circular dependency pattern
    _setBlockManagerModule(blockManager);

    blockManager.initBlockManager(); 
    initCustomBlockEditor(); 
    
    const headerTitle = qs('header h1');
    if (headerTitle) {
        console.log('Found header:', headerTitle.textContent);
    }

    function handleImportGhdbDorkFromExplorer(ghdbEntry) {
        console.log('Importing GHDB Entry to workspace:', ghdbEntry);
        const blockData = {
            type: 'custom', 
            operator: '',    
            value: ghdbEntry.dork, 
            placeholder: 'Imported GHDB dork', 
            description: ghdbEntry.title, 
        };
        blockManager.addBlockToWorkspace(blockData); 
    }

    initGhdbExplorer(handleImportGhdbDorkFromExplorer); 
    initDragAndDrop(); // Initialize Drag and Drop functionality

    // Setup Search Engine Logic and Execute Search Button
    const searchEngineSelect = qs('#search-engine-select');
    const executeSearchButton = qs('#execute-search-button');
    const queryOutputTextarea = qs('#query-output'); // Already used by updateQueryOutput

    let selectedSearchEngine = 'google'; // Default

    if (searchEngineSelect) {
        selectedSearchEngine = searchEngineSelect.value; // Initialize with current value
        searchEngineSelect.addEventListener('change', (event) => {
            selectedSearchEngine = event.target.value;
            // console.log('Search engine changed to:', selectedSearchEngine); // For debugging
        });
    }

    if (executeSearchButton && queryOutputTextarea) {
        executeSearchButton.addEventListener('click', () => {
            const query = queryOutputTextarea.value.trim(); // Get query from textarea
            if (!query) {
                alert('Query is empty. Add blocks to the workspace or import a dork from the explorer.');
                return;
            }

            let searchUrl = '';
            switch (selectedSearchEngine) {
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'duckduckgo':
                    searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                    break;
                case 'google':
                default:
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
            }
            // console.log('Executing search:', searchUrl); // For debugging
            window.open(searchUrl, '_blank'); // Open in a new tab
        });
    }

    // Other initializations will go here
}

// Wait for the DOM to be fully loaded before running the main script
document.addEventListener('DOMContentLoaded', main);
