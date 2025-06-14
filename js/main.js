import * as blockManager from './blockManager.js'; // Import all exports as blockManager object
import { initCustomBlockEditor } from './customBlock.js';
import { initGhdbExplorer } from './ghdbExplorerUI.js';
import { initDragAndDrop, _setBlockManagerModule } from './dnd.js'; // Import DnD functions
import { qs } from './domUtils.js';

/**
 * Main function to initialize the application.
 */
function main() {
    console.log("Static Dork Builder Initializing...");
    
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
                alert('Query is empty. Add some blocks and values, or write a custom query.');
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
