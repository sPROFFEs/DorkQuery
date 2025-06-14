// js/ghdbExplorerUI.js
import { qs, qsa, createElement } from './domUtils.js';
import { fetchGhdbDorks } from './ghdbService.js';

const RESULTS_PER_PAGE = 15;
let currentSearchTerm = '';
let currentPage = 0;
let totalFilteredRecords = 0;
let isLoading = false;
let ghdbEntries = [];
let onImportDorkCallback = null; // Will be set by init

// DOM Elements (cached after init)
let searchInput, searchButton, resultsContainer, paginationContainer;

async function loadEntries(page, term) {
    isLoading = true;
    currentSearchTerm = term; // Store the term used for this load
    currentPage = page;
    // Clear previous results and show loading immediately
    if (resultsContainer) {
        resultsContainer.innerHTML = ''; // Clear previous results
        resultsContainer.appendChild(createElement('p', 'loading-message', 'Loading GHDB entries...'));
    }
    if (paginationContainer) {
        paginationContainer.innerHTML = ''; // Clear pagination
    }
    // updatePaginationUI(); // Call to disable buttons during load

    try {
        const response = await fetchGhdbDorks(term, page * RESULTS_PER_PAGE, RESULTS_PER_PAGE);
        ghdbEntries = response.entries;
        totalFilteredRecords = response.recordsFiltered;
        isLoading = false;
    } catch (error) {
        console.error('GHDB UI Error:', error);
        ghdbEntries = []; // Clear entries on error
        totalFilteredRecords = 0;
        isLoading = false; // Ensure loading is set to false on error
        
        const errorMsg = error.message.includes('Failed to fetch') || error.message.includes('NetworkError') 
            ? 'Could not connect to GHDB. This might be a network issue or a CORS policy restriction on exploit-db.com. For local development, a CORS browser extension might be needed.'
            : `Error loading GHDB data: ${error.message}`;
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `<p class="error-message">${errorMsg}</p>`;
        }
    }
    renderGhdbUI(); // Render results or error state
}

function renderGhdbUI() {
    if (!resultsContainer) return; // Not initialized yet

    // Clear previous results (might be redundant if loadEntries already cleared and showed loading)
    resultsContainer.innerHTML = ''; 

    if (isLoading) { // Should ideally be caught by loadEntries clearing and showing loading
        resultsContainer.appendChild(createElement('p', 'loading-message', 'Loading GHDB entries...'));
        updatePaginationUI(); 
        return;
    }
    
    // If there's an error message already in resultsContainer (from loadEntries catch), don't overwrite
    if (resultsContainer.querySelector('.error-message')) {
        updatePaginationUI(); // Still update pagination (likely to hide it)
        return;
    }

    if (ghdbEntries.length === 0) {
        resultsContainer.appendChild(createElement('p', 'info-message', 'No GHDB entries found.'));
    } else {
        ghdbEntries.forEach(entry => {
            const entryDiv = createElement('div', 'ghdb-entry');
            
            const titleEl = createElement('h4', null, entry.title);
            entryDiv.appendChild(titleEl);

            const metaEl = createElement('p', 'ghdb-meta', `Category: ${entry.category} | Date: ${entry.date}`);
            entryDiv.appendChild(metaEl);

            const dorkEl = createElement('code', 'ghdb-dork', entry.dork);
            entryDiv.appendChild(dorkEl);
            
            const linkEl = createElement('a', 'ghdb-link', 'View on Exploit-DB');
            linkEl.href = entry.urlToGhdbPage;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            const linkParagraph = createElement('p'); // Wrap link in a paragraph for better spacing
            linkParagraph.appendChild(linkEl);
            entryDiv.appendChild(linkParagraph);

            const importButton = createElement('button', 'import-ghdb-btn', 'Import');
            importButton.title = `Import dork: ${entry.dork}`;
            importButton.addEventListener('click', () => {
                if (onImportDorkCallback) {
                    onImportDorkCallback(entry);
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
    paginationContainer.innerHTML = ''; // Clear previous pagination

    const totalPages = Math.ceil(totalFilteredRecords / RESULTS_PER_PAGE);

    if (totalPages <= 1 && !isLoading) { 
        return;
    }
    
    const pageInfo = createElement('span', 'page-info', `Page ${currentPage + 1} of ${totalPages === 0 && totalFilteredRecords > 0 ? 1 : totalPages }`);
    if (isLoading || totalFilteredRecords === 0) { // If loading or no records, display simplified info or hide
        pageInfo.textContent = isLoading ? 'Loading...' : (totalFilteredRecords === 0 ? 'No results' : pageInfo.textContent);
    }
    paginationContainer.appendChild(pageInfo);

    const prevButton = createElement('button', ['pagination-btn', 'prev-btn'], 'Previous');
    prevButton.disabled = currentPage === 0 || isLoading;
    prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            loadEntries(currentPage - 1, currentSearchTerm);
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = createElement('button', ['pagination-btn', 'next-btn'], 'Next');
    nextButton.disabled = (currentPage + 1) >= totalPages || isLoading;
    nextButton.addEventListener('click', () => {
        if ((currentPage + 1) < totalPages) {
            loadEntries(currentPage + 1, currentSearchTerm);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function handleSearch() {
    if (searchInput) {
        loadEntries(0, searchInput.value.trim());
    }
}

export function initGhdbExplorer(importCallback) {
    onImportDorkCallback = importCallback;

    searchInput = qs('#ghdb-search-input');
    searchButton = qs('#ghdb-search-button');
    resultsContainer = qs('#ghdb-results');
    paginationContainer = qs('#ghdb-pagination');

    if (!searchInput || !searchButton || !resultsContainer || !paginationContainer) {
        console.error('GHDB Explorer UI elements not found! Check HTML IDs.');
        return;
    }

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    loadEntries(0, ''); // Initial load
}
