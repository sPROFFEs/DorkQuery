// js/ghdbExplorerUI.js
import { qs, createElement } from './domUtils.js';
// Import new service functions
import { loadAllLocalGhdbEntries, getLocalGhdbDorks, getAvailableSources, getDataStatistics } from './ghdbService.js';

const RESULTS_PER_PAGE = 15;
let currentSearchTerm = '';
let currentCategoryFilter = 'All'; // Initialize category filter
let currentSourceFilter = 'All'; // Initialize source filter
let currentPage = 0;
let totalFilteredRecords = 0;
// isLoading might be less critical for local data, but kept for UI consistency during initial load
let isLoading = false; 
let ghdbEntries = [];
let onImportDorkCallback = null; // Will be set by init

// DOM Elements
let searchInput, searchButton, resultsContainer, paginationContainer, categoryFilterSelect, sourceFilterSelect, statsElement;

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
function loadAndRenderEntries(page, term, category, source) {
    isLoading = true;
    currentSearchTerm = term;
    currentCategoryFilter = category;
    currentSourceFilter = source;
    currentPage = page;

    if (resultsContainer) {
        resultsContainer.innerHTML = ''; 
        resultsContainer.appendChild(createElement('p', 'loading-message', 'Loading dork entries...'));
    }
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }

    try {
        // getLocalGhdbDorks is synchronous after initial data load
        const response = getLocalGhdbDorks({ 
            categoryFilter: currentCategoryFilter,
            sourceFilter: currentSourceFilter,
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
        console.error('Dork UI Error during filtering/pagination:', error);
        displayGhdbError(`Error processing dork data: ${error.message}`);
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
        resultsContainer.appendChild(createElement('p', 'info-message', 'No dork entries found matching your criteria.'));
    } else {
        ghdbEntries.forEach(entry => {
            const entryDiv = createElement('div', 'ghdb-entry');
            
            // Create source badge
            const sourceEl = createElement('span', 'source-badge', entry.source || 'Unknown');
            if (entry.source === 'DorkHub') {
                sourceEl.classList.add('dorkhub-badge');
            } else if (entry.source === 'GHDB') {
                sourceEl.classList.add('ghdb-badge');
            }
            entryDiv.appendChild(sourceEl);
            
            const dorkTitle = entry.query.length > 100 ? entry.query.substring(0, 97) + "..." : entry.query;
            const titleEl = createElement('h4', null, dorkTitle);
            entryDiv.appendChild(titleEl);

            // Enhanced meta information
            let metaText = `Category: ${entry.category}`;
            if (entry.subcategory) {
                metaText += ` > ${entry.subcategory}`;
            }
            metaText += ` | Date: ${entry.date}`;
            if (entry.author) {
                metaText += ` | Author: ${entry.author}`;
            }
            
            const metaEl = createElement('p', 'ghdb-meta', metaText);
            entryDiv.appendChild(metaEl);

            // Display the full dork string
            const dorkEl = createElement('code', 'ghdb-dork', entry.query);
            entryDiv.appendChild(dorkEl);
            
            // Links section
            const linksEl = createElement('p', 'entry-links');
            
            if (entry.ghdb_id) {
                const linkEl = createElement('a', 'ghdb-link', 'View on Exploit-DB');
                linkEl.href = `https://www.exploit-db.com/ghdb/${entry.ghdb_id}`;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
                linksEl.appendChild(linkEl);
            }
            
            if (entry.source === 'DorkHub' && entry.source_file) {
                if (linksEl.children.length > 0) {
                    linksEl.appendChild(document.createTextNode(' | '));
                }
                const fileInfo = createElement('span', 'file-info', `From: ${entry.source_file}`);
                linksEl.appendChild(fileInfo);
            }
            
            if (linksEl.children.length > 0) {
                entryDiv.appendChild(linksEl);
            }

            const importButton = createElement('button', 'import-ghdb-btn', 'Import');
            importButton.title = `Import dork: ${entry.query}`;
            importButton.addEventListener('click', () => {
                if (onImportDorkCallback) {
                    const title = entry.ghdb_id ? 
                        `GHDB-${entry.ghdb_id}: ${entry.query.substring(0,50)}...` :
                        `${entry.source}-${entry.category}: ${entry.query.substring(0,50)}...`;
                    
                    onImportDorkCallback({ 
                        dork: entry.query, 
                        title: title
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
            loadAndRenderEntries(currentPage - 1, currentSearchTerm, currentCategoryFilter, currentSourceFilter);
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = createElement('button', ['pagination-btn', 'next-btn'], 'Next');
    nextButton.disabled = (currentPage + 1) >= totalPages || isLoading;
    nextButton.addEventListener('click', () => {
        if ((currentPage + 1) < totalPages) {
            loadAndRenderEntries(currentPage + 1, currentSearchTerm, currentCategoryFilter, currentSourceFilter);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function handleSearchAndFilter() {
    const term = searchInput ? searchInput.value.trim() : '';
    const category = categoryFilterSelect ? categoryFilterSelect.value : 'All';
    const source = sourceFilterSelect ? sourceFilterSelect.value : 'All';
    loadAndRenderEntries(0, term, category, source);
}

function updateStatsDisplay() {
    const stats = getDataStatistics();
    if (statsElement && stats.loaded) {
        statsElement.textContent = `${stats.totalEntries.toLocaleString()} dorks | ${stats.categoriesCount} categories | ${stats.sourcesCount} sources`;
    }
}

export async function initGhdbExplorer(importCallback) {
    onImportDorkCallback = importCallback;

    searchInput = qs('#ghdb-search-input');
    searchButton = qs('#ghdb-search-button');
    resultsContainer = qs('#ghdb-results');
    paginationContainer = qs('#ghdb-pagination');
    categoryFilterSelect = qs('#ghdb-category-filter');
    sourceFilterSelect = qs('#ghdb-source-filter'); // New source filter
    statsElement = qs('#dork-stats'); // Stats badge

    if (!searchInput || !searchButton || !resultsContainer || !paginationContainer || !categoryFilterSelect || !sourceFilterSelect) {
        console.error('Dork Explorer UI elements not found! Check HTML IDs.');
        displayGhdbError('Dork Explorer UI could not be initialized. Required HTML elements are missing.');
        return;
    }

    // Initial UI state before data load
    resultsContainer.innerHTML = `<p class="loading-message">Initializing Dork Explorer...</p>`;
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

        // Populate source filter
        if (sourceFilterSelect) {
            const sources = getAvailableSources();
            sources.forEach(source => {
                const option = createElement('option', null, source);
                option.value = source;
                sourceFilterSelect.appendChild(option);
            });
            sourceFilterSelect.addEventListener('change', handleSearchAndFilter);
        }

        // Update stats display
        updateStatsDisplay();
        
        searchButton.addEventListener('click', handleSearchAndFilter);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearchAndFilter();
            }
        });

        handleSearchAndFilter(); // Initial load of entries with default filters

    } catch (error) {
        // Error from loadAllLocalGhdbEntries (e.g., file not found, JSON parse error)
        console.error('Failed to initialize Dork Explorer:', error);
        displayGhdbError(`Failed to load dork data: ${error.message}. Check if dork data files are valid.`);
        isLoading = false; // Ensure loading is reset
        updatePaginationUI(); // Update pagination to reflect error state
    }
}
