// js/ghdbExplorerUI.js - Modernized Dork Explorer UI

import { qs, createElement } from './domUtils.js';
import {
    loadCuratedGhdb,
    loadUnifiedDatabase,
    getDorks,
    getAvailableCategories,
    getAvailableSources,
    getDataStatistics,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    getCurrentDataSource,
    setDataSource,
    isUnifiedLoaded
} from './ghdbService.js';
import { showToast } from './toast.js';

let RESULTS_PER_PAGE = 15;
let currentSearchTerm = '';
let currentCategoryFilter = 'All';
let currentSourceFilter = 'All';
let currentSortBy = 'default';
let currentPage = 0;
let totalFilteredRecords = 0;
let isLoading = false;
let onlyFavoritesView = false;

let ghdbEntries = [];
let onImportDorkCallback = null;

// Debounce timer for search input
let searchDebounceTimer = null;

// DOM Elements
let searchInput, clearSearchBtn, resultsContainer, paginationContainer;
let categoryFilterSelect, sourceFilterSelect, sortBySelect, pageSizeSelect;
let statsElement, tabAllBtn, tabFavsBtn, databaseSourceSelect;
let progressContainer, progressFill, progressLabel;

export function setImportCallback(callback) {
    onImportDorkCallback = callback;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

/**
 * Highlights search keywords in a text string
 */
function highlightKeywords(text, searchTerm) {
    if (!searchTerm || !text) return escapeHtml(text);

    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return escapeHtml(text);

    let escaped = escapeHtml(text);
    tokens.forEach(tok => {
        try {
            const regex = new RegExp(`(${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            escaped = escaped.replace(regex, '<mark class="highlight">$1</mark>');
        } catch (e) {
            // ignore regex issues
        }
    });

    return escaped;
}

/**
 * Returns color category class
 */
function getCategoryColorClass(category) {
    const lower = (category || '').toLowerCase();
    if (lower.includes('password') || lower.includes('credential')) return 'badge-cat-passwords';
    if (lower.includes('login') || lower.includes('portal')) return 'badge-cat-logins';
    if (lower.includes('juicy') || lower.includes('sensitive') || lower.includes('file')) return 'badge-cat-files';
    if (lower.includes('device') || lower.includes('camera') || lower.includes('iot')) return 'badge-cat-devices';
    if (lower.includes('advis') || lower.includes('vuln') || lower.includes('sqli') || lower.includes('xss')) return 'badge-cat-vulns';
    if (lower.includes('directory')) return 'badge-cat-directories';
    return 'badge-cat-default';
}

/**
 * Load and render dork entries with current filters
 */
export async function loadAndRenderEntries(page = 0) {
    currentPage = page;
    isLoading = true;

    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="explorer-loading-state">
                <div class="loading-spinner"></div>
                <p>Searching dork database...</p>
            </div>
        `;
    }

    try {
        const response = await getDorks({
            categoryFilter: currentCategoryFilter,
            sourceFilter: currentSourceFilter,
            searchTerm: currentSearchTerm,
            page: currentPage,
            pageSize: RESULTS_PER_PAGE,
            sortBy: currentSortBy,
            onlyFavorites: onlyFavoritesView
        });

        ghdbEntries = response.entries || [];
        totalFilteredRecords = response.recordsFiltered || 0;
        isLoading = false;
        renderResults();
        updatePaginationUI();
    } catch (err) {
        console.error('[ghdbExplorerUI] Error loading entries:', err);
        isLoading = false;
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="explorer-error-state">
                    <p class="error-title">❌ Failed to query database</p>
                    <p class="error-detail">${escapeHtml(err.message)}</p>
                </div>
            `;
        }
    }
}

function renderResults() {
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (ghdbEntries.length === 0) {
        resultsContainer.innerHTML = `
            <div class="explorer-empty-state">
                <span class="empty-icon">🔍</span>
                <p class="empty-title">No dorks found matching your criteria</p>
                <p class="empty-hint">Try adjusting keywords, clearing category filters, or switching database sources.</p>
            </div>
        `;
        return;
    }

    ghdbEntries.forEach(entry => {
        const query = entry.query || entry.dork || '';
        const category = entry.category || 'General';
        const subcategory = entry.subcategory || '';
        const date = entry.date || '';
        const source = entry.source || 'GHDB';
        const author = entry.author || '';
        const ghdbId = entry.ghdb_id || (source === 'GHDB' ? entry.id : null);
        const isFav = isFavorite(entry.id);

        const card = createElement('div', 'ghdb-entry-card');

        // Card Header
        const cardHeader = createElement('div', 'entry-card-header');

        const badgesContainer = createElement('div', 'entry-badges');

        // Category Badge
        const catBadge = createElement('span', ['entry-badge', getCategoryColorClass(category)], category);
        badgesContainer.appendChild(catBadge);

        // Source Badge
        const srcBadge = createElement('span', ['entry-badge', source === 'GHDB' ? 'badge-src-ghdb' : 'badge-src-dorkhub'], source);
        badgesContainer.appendChild(srcBadge);

        cardHeader.appendChild(badgesContainer);

        // Top right actions: Star favorite
        const topActions = createElement('div', 'entry-top-actions');
        const starBtn = createElement('button', ['entry-star-btn', isFav ? 'active' : '']);
        starBtn.innerHTML = isFav ? '★' : '☆';
        starBtn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        starBtn.addEventListener('click', () => {
            const nowFav = toggleFavorite(entry);
            starBtn.innerHTML = nowFav ? '★' : '☆';
            starBtn.classList.toggle('active', nowFav);
            updateStatsDisplay();
            showToast(nowFav ? 'Added to favorites' : 'Removed from favorites', 'info', 1500);
            if (onlyFavoritesView && !nowFav) {
                loadAndRenderEntries(currentPage);
            }
        });
        topActions.appendChild(starBtn);
        cardHeader.appendChild(topActions);

        card.appendChild(cardHeader);

        // Code snippet with Copy button
        const codeWrapper = createElement('div', 'entry-code-wrapper');
        const codeEl = createElement('code', 'entry-query-code');
        codeEl.innerHTML = highlightKeywords(query, currentSearchTerm);

        const copyDorkBtn = createElement('button', 'entry-copy-btn');
        copyDorkBtn.title = 'Copy dork';
        copyDorkBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
        `;
        copyDorkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(query);
                copyDorkBtn.innerHTML = '<span>Copied! ✓</span>';
                copyDorkBtn.classList.add('copied');
                setTimeout(() => {
                    copyDorkBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy</span>
                    `;
                    copyDorkBtn.classList.remove('copied');
                }, 2000);
                showToast('Dork copied to clipboard', 'success', 1500);
            } catch (e) {
                showToast('Failed to copy', 'error');
            }
        });

        codeWrapper.appendChild(codeEl);
        codeWrapper.appendChild(copyDorkBtn);
        card.appendChild(codeWrapper);

        // Metadata line
        const metaLine = createElement('div', 'entry-metadata');
        let metaParts = [];
        if (date) metaParts.push(`<span>📅 ${escapeHtml(date)}</span>`);
        if (author) metaParts.push(`<span>👤 ${escapeHtml(author)}</span>`);
        if (subcategory) metaParts.push(`<span>📁 ${escapeHtml(subcategory)}</span>`);

        if (ghdbId) {
            metaParts.push(`<a href="https://www.exploit-db.com/ghdb/${escapeHtml(ghdbId)}" target="_blank" rel="noopener noreferrer" class="exploit-db-link" title="Open Exploit-DB record">Exploit-DB #${escapeHtml(ghdbId)} ↗</a>`);
        }

        metaLine.innerHTML = metaParts.join('<span class="meta-separator">•</span>');
        card.appendChild(metaLine);

        // Card Footer Toolbar
        const cardFooter = createElement('div', 'entry-card-footer');

        // To Workspace button
        const addToWsBtn = createElement('button', 'btn-card-action', '+ To Workspace');
        addToWsBtn.title = 'Load into visual dork builder';
        addToWsBtn.addEventListener('click', () => {
            if (onImportDorkCallback) {
                onImportDorkCallback(entry);
            }
        });
        cardFooter.appendChild(addToWsBtn);

        // Direct Search button
        const directSearchBtn = createElement('button', ['btn-card-action', 'btn-action-search'], '🚀 Search');
        directSearchBtn.title = 'Run search in default engine';
        directSearchBtn.addEventListener('click', () => {
            const engineSelect = qs('#search-engine-select');
            const engine = engineSelect ? engineSelect.value : 'google';
            let searchUrl = '';
            if (engine === 'bing') {
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            } else if (engine === 'duckduckgo') {
                searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            } else {
                searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
            window.open(searchUrl, '_blank');
        });
        cardFooter.appendChild(directSearchBtn);

        card.appendChild(cardFooter);
        resultsContainer.appendChild(card);
    });
}

function updatePaginationUI() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalFilteredRecords / RESULTS_PER_PAGE);

    if (totalFilteredRecords === 0) {
        return;
    }

    const navWrapper = createElement('div', 'pagination-wrapper');

    // Stats indicator
    const startIdx = currentPage * RESULTS_PER_PAGE + 1;
    const endIdx = Math.min((currentPage + 1) * RESULTS_PER_PAGE, totalFilteredRecords);
    const countInfo = createElement('span', 'pagination-count-info', `Showing ${startIdx.toLocaleString()}–${endIdx.toLocaleString()} of ${totalFilteredRecords.toLocaleString()} dorks`);
    navWrapper.appendChild(countInfo);

    if (totalPages > 1) {
        const controls = createElement('div', 'pagination-controls');

        // First button
        const firstBtn = createElement('button', ['pagination-nav-btn'], '«');
        firstBtn.title = 'First Page';
        firstBtn.disabled = currentPage === 0 || isLoading;
        firstBtn.addEventListener('click', () => loadAndRenderEntries(0));
        controls.appendChild(firstBtn);

        // Prev button
        const prevBtn = createElement('button', ['pagination-nav-btn'], '‹');
        prevBtn.title = 'Previous Page';
        prevBtn.disabled = currentPage === 0 || isLoading;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) loadAndRenderEntries(currentPage - 1);
        });
        controls.appendChild(prevBtn);

        // Page pills calculation
        const visiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + visiblePages - 1);

        if (endPage - startPage + 1 < visiblePages) {
            startPage = Math.max(0, endPage - visiblePages + 1);
        }

        for (let p = startPage; p <= endPage; p++) {
            const pagePill = createElement('button', ['pagination-page-pill', p === currentPage ? 'active' : ''], `${p + 1}`);
            pagePill.disabled = isLoading;
            pagePill.addEventListener('click', () => loadAndRenderEntries(p));
            controls.appendChild(pagePill);
        }

        // Next button
        const nextBtn = createElement('button', ['pagination-nav-btn'], '›');
        nextBtn.title = 'Next Page';
        nextBtn.disabled = (currentPage + 1) >= totalPages || isLoading;
        nextBtn.addEventListener('click', () => {
            if ((currentPage + 1) < totalPages) loadAndRenderEntries(currentPage + 1);
        });
        controls.appendChild(nextBtn);

        // Last button
        const lastBtn = createElement('button', ['pagination-nav-btn'], '»');
        lastBtn.title = 'Last Page';
        lastBtn.disabled = (currentPage + 1) >= totalPages || isLoading;
        lastBtn.addEventListener('click', () => loadAndRenderEntries(totalPages - 1));
        controls.appendChild(lastBtn);

        // Jump to page input
        const jumpWrapper = createElement('div', 'pagination-jump');
        const jumpInput = createElement('input', 'pagination-jump-input');
        jumpInput.type = 'number';
        jumpInput.min = '1';
        jumpInput.max = `${totalPages}`;
        jumpInput.placeholder = '#';
        jumpInput.setAttribute('aria-label', 'Jump to page number');

        const jumpBtn = createElement('button', 'pagination-jump-btn', 'Go');
        jumpBtn.type = 'button';
        const executeJump = () => {
            const targetPage = parseInt(jumpInput.value, 10);
            if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                loadAndRenderEntries(targetPage - 1);
            }
        };
        jumpBtn.addEventListener('click', executeJump);
        jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeJump();
        });

        jumpWrapper.appendChild(jumpInput);
        jumpWrapper.appendChild(jumpBtn);
        controls.appendChild(jumpWrapper);

        navWrapper.appendChild(controls);
    }

    paginationContainer.appendChild(navWrapper);
}

function handleSearchAndFilter() {
    currentSearchTerm = searchInput ? searchInput.value.trim() : '';
    currentCategoryFilter = categoryFilterSelect ? categoryFilterSelect.value : 'All';
    currentSourceFilter = sourceFilterSelect ? sourceFilterSelect.value : 'All';
    currentSortBy = sortBySelect ? sortBySelect.value : 'default';

    if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
    }

    loadAndRenderEntries(0);
}

function updateStatsDisplay() {
    const stats = getDataStatistics();
    if (statsElement && stats.loaded) {
        const sourceLabel = stats.currentSource === 'unified' ? 'Unified Database' : 'Exploit-DB GHDB';
        statsElement.textContent = `${stats.totalEntries.toLocaleString()} dorks (${sourceLabel}) | ${stats.categoriesCount} categories`;
    }

    if (tabFavsBtn) {
        const favCount = getFavoritesCount();
        tabFavsBtn.innerHTML = `⭐ Favorites <span class="tab-badge">${favCount}</span>`;
    }
}

/**
 * Handle switching database between GHDB Curated and Unified (900k)
 */
async function handleDatabaseSourceSwitch(newSource) {
    if (newSource === getCurrentDataSource()) return;

    if (newSource === 'unified') {
        if (!isUnifiedLoaded()) {
            if (progressContainer) progressContainer.classList.remove('hidden');

            try {
                await loadUnifiedDatabase((percent, msg) => {
                    if (progressFill) progressFill.style.width = `${percent}%`;
                    if (progressLabel) progressLabel.textContent = `${msg} (${percent}%)`;
                });
                showToast('Unified database (900k+ records) loaded!', 'success');
            } catch (err) {
                showToast(`Failed to load Unified: ${err.message}`, 'error');
                if (databaseSourceSelect) databaseSourceSelect.value = 'ghdb';
                return;
            } finally {
                setTimeout(() => {
                    if (progressContainer) progressContainer.classList.add('hidden');
                }, 1000);
            }
        } else {
            setDataSource('unified');
        }
    } else {
        setDataSource('ghdb');
    }

    // Refresh categories & sources in dropdowns
    populateCategoryDropdown(getAvailableCategories());
    populateSourceDropdown(getAvailableSources());
    updateStatsDisplay();
    handleSearchAndFilter();
}

function populateCategoryDropdown(categories) {
    if (!categoryFilterSelect) return;
    const currentVal = categoryFilterSelect.value;
    categoryFilterSelect.innerHTML = '<option value="All">All Categories</option>';
    categories.forEach(cat => {
        const opt = createElement('option', null, cat);
        opt.value = cat;
        categoryFilterSelect.appendChild(opt);
    });
    if (categories.includes(currentVal)) {
        categoryFilterSelect.value = currentVal;
    }
}

function populateSourceDropdown(sources) {
    if (!sourceFilterSelect) return;
    const currentVal = sourceFilterSelect.value;
    sourceFilterSelect.innerHTML = '<option value="All">All Sources</option>';
    sources.forEach(src => {
        const opt = createElement('option', null, src);
        opt.value = src;
        sourceFilterSelect.appendChild(opt);
    });
    if (sources.includes(currentVal)) {
        sourceFilterSelect.value = currentVal;
    }
}

export async function initGhdbExplorer(importCallback) {
    onImportDorkCallback = importCallback;

    searchInput = qs('#ghdb-search-input');
    clearSearchBtn = qs('#ghdb-clear-search');
    resultsContainer = qs('#ghdb-results');
    paginationContainer = qs('#ghdb-pagination');
    categoryFilterSelect = qs('#ghdb-category-filter');
    sourceFilterSelect = qs('#ghdb-source-filter');
    sortBySelect = qs('#ghdb-sort-by');
    pageSizeSelect = qs('#ghdb-page-size');
    statsElement = qs('#dork-stats');
    tabAllBtn = qs('#tab-all-dorks');
    tabFavsBtn = qs('#tab-favorite-dorks');
    databaseSourceSelect = qs('#database-source-select');

    progressContainer = qs('#explorer-db-progress');
    progressFill = qs('#explorer-progress-fill');
    progressLabel = qs('#explorer-progress-label');

    try {
        const data = await loadCuratedGhdb();
        populateCategoryDropdown(data.categories);
        populateSourceDropdown(data.sources);
        updateStatsDisplay();

        // Search Input listeners with debouncing
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(handleSearchAndFilter, 260);
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchDebounceTimer);
                    handleSearchAndFilter();
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                handleSearchAndFilter();
            });
        }

        if (categoryFilterSelect) categoryFilterSelect.addEventListener('change', handleSearchAndFilter);
        if (sourceFilterSelect) sourceFilterSelect.addEventListener('change', handleSearchAndFilter);
        if (sortBySelect) sortBySelect.addEventListener('change', handleSearchAndFilter);

        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                RESULTS_PER_PAGE = parseInt(e.target.value, 10) || 15;
                loadAndRenderEntries(0);
            });
        }

        if (databaseSourceSelect) {
            databaseSourceSelect.addEventListener('change', (e) => {
                handleDatabaseSourceSwitch(e.target.value);
            });
        }

        // Tabs
        if (tabAllBtn && tabFavsBtn) {
            tabAllBtn.addEventListener('click', () => {
                onlyFavoritesView = false;
                tabAllBtn.classList.add('active');
                tabFavsBtn.classList.remove('active');
                loadAndRenderEntries(0);
            });

            tabFavsBtn.addEventListener('click', () => {
                onlyFavoritesView = true;
                tabFavsBtn.classList.add('active');
                tabAllBtn.classList.remove('active');
                loadAndRenderEntries(0);
            });
        }

        // Initial render
        await loadAndRenderEntries(0);

    } catch (err) {
        console.error('Failed to initialize Dork Explorer:', err);
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="explorer-error-state"><p class="error-title">Database loading failed</p><p class="error-detail">${err.message}</p></div>`;
        }
    }
}
