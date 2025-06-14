// js/ghdbExplorerUI.js
import { qs, createElement } from './domUtils.js';
// Import new service functions
import { loadAllLocalGhdbEntries, getLocalGhdbDorks } from './ghdbService.js';

const RESULTS_PER_PAGE = 15;
let currentSearchTerm = '';
let currentCategoryFilter = 'All'; // Initialize category filter
let currentPage = 0;
let totalFilteredRecords = 0;
// isLoading might be less critical for local data, but kept for UI consistency during initial load
let isLoading = false; 
let ghdbEntries = [];
let onImportDorkCallback = null; // Will be set by init

// DOM Elements
let searchInput, searchButton, resultsContainer, paginationContainer, categoryFilterSelect;

// Function to display error messages in the results container
function displayGhdbError(message) {
    if (resultsContainer) {
        resultsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
    ghdbEntries = [];
    totalFilteredRecords = 0;
    renderGhdbUI(); // Update UI (which will show no entries and update pagination)
}

// Unified function to load and render entries
function loadAndRenderEntries(page, term, category) {
    isLoading = true;
    currentSearchTerm = term;
    currentCategoryFilter = category;
    currentPage = page;

    if (resultsContainer) {
        resultsContainer.innerHTML = ''; 
        resultsContainer.appendChild(createElement('p', 'loading-message', 'Loading GHDB entries...'));
    }
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
    // renderGhdbUI(); // Show loading state

    try {
        // getLocalGhdbDorks is synchronous after initial data load
        const response = getLocalGhdbDorks({ 
            categoryFilter: currentCategoryFilter, 
            searchTerm: currentSearchTerm, 
            page: currentPage, 
            pageSize: RESULTS_PER_PAGE 
        });
        ghdbEntries = response.entries;
        totalFilteredRecords = response.recordsFiltered;
        isLoading = false;
    } catch (error) {
        // This catch is more for unexpected errors in filtering logic,
        // as data loading errors are handled in init.
        console.error('GHDB UI Error during filtering/pagination:', error);
        displayGhdbError(`Error processing GHDB data: ${error.message}`);
        isLoading = false;
    }
    renderGhdbUI();
}


function renderGhdbUI() {
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ''; // Clear previous results or loading message

    if (isLoading) { // This should ideally not be hit if loadAndRenderEntries handles it.
        resultsContainer.appendChild(createElement('p', 'loading-message', 'Loading GHDB entries...'));
        updatePaginationUI();
        return;
    }

    // If an error message is already in resultsContainer (e.g., from init or loadAndRenderEntries catch), don't overwrite
    if (resultsContainer.querySelector('.error-message')) {
        updatePaginationUI(); // Still update pagination (likely to hide it)
        return;
    }

    if (ghdbEntries.length === 0) {
        resultsContainer.appendChild(createElement('p', 'info-message', 'No GHDB entries found matching your criteria.'));
    } else {
        ghdbEntries.forEach(entry => {
            const entryDiv = createElement('div', 'ghdb-entry');
            
            // The JSON sample uses 'query' for the dork string, and 'category' for category name.
            // It does not have a separate descriptive 'title' for the dork itself.
            // We'll use the query as the main display title, or part of it.
            const dorkTitle = entry.query.length > 100 ? entry.query.substring(0, 97) + "..." : entry.query;
            const titleEl = createElement('h4', null, dorkTitle); // Use entry.query or a snippet as title
            entryDiv.appendChild(titleEl);

            const metaEl = createElement('p', 'ghdb-meta', `Category: ${entry.category} | Date: ${entry.date}`);
            entryDiv.appendChild(metaEl);

            // Display the full dork string (was entry.dork, now entry.query)
            const dorkEl = createElement('code', 'ghdb-dork', entry.query);
            entryDiv.appendChild(dorkEl);
            
            if (entry.ghdb_id) { // Check if ghdb_id exists
                const linkEl = createElement('a', 'ghdb-link', 'View on Exploit-DB');
                linkEl.href = `https://www.exploit-db.com/ghdb/${entry.ghdb_id}`;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
                const linkParagraph = createElement('p');
                linkParagraph.appendChild(linkEl);
                entryDiv.appendChild(linkParagraph);
            }

            const importButton = createElement('button', 'import-ghdb-btn', 'Import');
            // Tooltip: use the query string as it's the most descriptive part of the entry now
            importButton.title = `Import dork: ${entry.query}`; 
            importButton.addEventListener('click', () => {
                if (onImportDorkCallback) {
                    // Adapt the object passed to the callback if its structure expectation changed
                    // Assuming the callback expects an object with a 'dork' field for the query string
                    onImportDorkCallback({ 
                        dork: entry.query, 
                        title: `GHDB-${entry.ghdb_id}: ${entry.query.substring(0,50)}...` // Construct a title
                    });
                }
            });
            entryDiv.appendChild(importButton);
            resultsContainer.appendChild(entryDiv);
        });
    }
    updatePaginationUI();
}

function updatePaginationUI() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = ''; 

    const totalPages = Math.ceil(totalFilteredRecords / RESULTS_PER_PAGE);

    if (totalPages <= 1 && !isLoading) {
        return;
    }
    
    const pageInfo = createElement('span', 'page-info', `Page ${currentPage + 1} of ${totalPages || 1}`);
    if (isLoading) {
        pageInfo.textContent = 'Loading...';
    } else if (totalFilteredRecords === 0 && !isLoading) {
        pageInfo.textContent = 'No results';
    }
    paginationContainer.appendChild(pageInfo);

    const prevButton = createElement('button', ['pagination-btn', 'prev-btn'], 'Previous');
    prevButton.disabled = currentPage === 0 || isLoading;
    prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            loadAndRenderEntries(currentPage - 1, currentSearchTerm, currentCategoryFilter);
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = createElement('button', ['pagination-btn', 'next-btn'], 'Next');
    nextButton.disabled = (currentPage + 1) >= totalPages || isLoading;
    nextButton.addEventListener('click', () => {
        if ((currentPage + 1) < totalPages) {
            loadAndRenderEntries(currentPage + 1, currentSearchTerm, currentCategoryFilter);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function handleSearchAndFilter() {
    const term = searchInput ? searchInput.value.trim() : '';
    const category = categoryFilterSelect ? categoryFilterSelect.value : 'All';
    loadAndRenderEntries(0, term, category);
}

export async function initGhdbExplorer(importCallback) {
    onImportDorkCallback = importCallback;

    searchInput = qs('#ghdb-search-input');
    searchButton = qs('#ghdb-search-button');
    resultsContainer = qs('#ghdb-results');
    paginationContainer = qs('#ghdb-pagination');
    categoryFilterSelect = qs('#ghdb-category-filter'); // Cache the new select element

    if (!searchInput || !searchButton || !resultsContainer || !paginationContainer || !categoryFilterSelect) {
        console.error('GHDB Explorer UI elements not found! Check HTML IDs (searchInput, searchButton, resultsContainer, paginationContainer, categoryFilterSelect).');
        displayGhdbError('GHDB Explorer UI could not be initialized. Required HTML elements are missing.');
        return;
    }

    // Initial UI state before data load
    resultsContainer.innerHTML = `<p class="loading-message">Initializing GHDB Explorer...</p>`;
    updatePaginationUI();


    try {
        isLoading = true; // Set loading before async operation
        const categories = await loadAllLocalGhdbEntries(); // Load data and get categories
        isLoading = false;

        // Populate category filter
        if (categoryFilterSelect) {
            categories.forEach(category => {
                const option = createElement('option', null, category);
                option.value = category;
                categoryFilterSelect.appendChild(option);
            });
            categoryFilterSelect.addEventListener('change', handleSearchAndFilter);
        }
        
        searchButton.addEventListener('click', handleSearchAndFilter);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearchAndFilter();
            }
        });

        handleSearchAndFilter(); // Initial load of entries with "All Categories" and empty search

    } catch (error) {
        // Error from loadAllLocalGhdbEntries (e.g., file not found, JSON parse error)
        console.error('Failed to initialize GHDB Explorer:', error);
        displayGhdbError(`Failed to load local GHDB data: ${error.message}. Check if 'data/ghdb_entries.json' is valid.`);
        isLoading = false; // Ensure loading is reset
        updatePaginationUI(); // Update pagination to reflect error state
    }
}
