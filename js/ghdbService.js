// js/ghdbService.js - High-Performance Hybrid Dork Data Service (GHDB + Unified + WebWorker)
import pako from 'pako';

const FAVORITES_KEY = 'dorkquery_favorites';

let currentDataSource = 'ghdb'; // 'ghdb' or 'unified'
let ghdbEntries = [];
let ghdbCategories = [];
let ghdbSources = ['GHDB'];
let ghdbLoaded = false;

// Worker management
let worker = null;
let workerLoaded = false;
let workerLoadProgressCallback = null;
let pendingWorkerSearchResolvers = new Map();
let workerSearchCounter = 0;

// Local favorites cache
let favoritesMap = new Map();

function initFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    if (item && item.id) {
                        favoritesMap.set(String(item.id), item);
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Failed to load favorites from localStorage:', e);
    }
}

function saveFavorites() {
    try {
        const arr = Array.from(favoritesMap.values());
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
    } catch (e) {
        console.warn('Failed to save favorites to localStorage:', e);
    }
}

initFavorites();

export function isFavorite(dorkId) {
    return favoritesMap.has(String(dorkId));
}

export function toggleFavorite(entry) {
    if (!entry || !entry.id) return false;
    const id = String(entry.id);
    if (favoritesMap.has(id)) {
        favoritesMap.delete(id);
        saveFavorites();
        return false;
    } else {
        favoritesMap.set(id, {
            id: entry.id,
            query: entry.query || entry.dork || '',
            category: entry.category || 'Unknown',
            source: entry.source || 'GHDB',
            date: entry.date || '',
            author: entry.author || '',
            ghdb_id: entry.ghdb_id || null,
            favoritedAt: new Date().toISOString()
        });
        saveFavorites();
        return true;
    }
}

export function getFavoritesList() {
    return Array.from(favoritesMap.values());
}

export function getFavoritesCount() {
    return favoritesMap.size;
}

/**
 * Initializes and returns the background Web Worker if supported
 */
function getOrInitWorker() {
    if (worker) return worker;

    try {
        const workerUrl = new URL('./dorkWorker.js', import.meta.url);
        worker = new Worker(workerUrl, { type: 'module' });

        worker.onmessage = function (e) {
            const { type, percent, message, id, entries, totalFiltered, totalRecords, page, pageSize, categories, sources, error } = e.data || {};

            if (type === 'PROGRESS') {
                if (typeof workerLoadProgressCallback === 'function') {
                    workerLoadProgressCallback(percent, message);
                }
            } else if (type === 'LOADED') {
                workerLoaded = true;
                if (typeof workerLoadProgressCallback === 'function') {
                    workerLoadProgressCallback(100, 'Unified database loaded successfully!');
                }
            } else if (type === 'SEARCH_RESULTS') {
                const resolver = pendingWorkerSearchResolvers.get(id);
                if (resolver) {
                    resolver({
                        entries: entries || [],
                        recordsFiltered: totalFiltered || 0,
                        recordsTotal: totalRecords || 0,
                        page: page || 0,
                        pageSize: pageSize || 15
                    });
                    pendingWorkerSearchResolvers.delete(id);
                }
            } else if (type === 'LOAD_ERROR') {
                console.error('[ghdbService] Worker load error:', error);
                if (typeof workerLoadProgressCallback === 'function') {
                    workerLoadProgressCallback(0, `Error: ${error}`);
                }
            }
        };

        worker.onerror = function (err) {
            console.warn('[ghdbService] Web Worker error, fallback will be used:', err);
        };

        return worker;
    } catch (err) {
        console.warn('[ghdbService] Unable to create Web Worker:', err);
        return null;
    }
}

/**
 * Load high-speed curated GHDB dataset (7,944 verified dorks)
 * Fast, instant load (< 50ms)
 */
export async function loadCuratedGhdb() {
    if (ghdbLoaded) {
        return {
            categories: ghdbCategories,
            sources: ghdbSources,
            totalEntries: ghdbEntries.length
        };
    }

    try {
        const response = await fetch('data/ghdb_clean.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} fetching data/ghdb_clean.json`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.entries)) {
            throw new Error('Invalid structure in ghdb_clean.json');
        }

        ghdbEntries = data.entries.map(e => ({
            ...e,
            source: e.source || 'GHDB'
        }));

        const catSet = new Set();
        ghdbEntries.forEach(e => {
            if (e.category) catSet.add(e.category);
        });

        ghdbCategories = Array.from(catSet).sort();
        ghdbSources = ['GHDB'];
        ghdbLoaded = true;

        return {
            categories: ghdbCategories,
            sources: ghdbSources,
            totalEntries: ghdbEntries.length
        };
    } catch (err) {
        console.error('[ghdbService] Error loading GHDB clean:', err);
        throw err;
    }
}

/**
 * Load unified dataset (GHDB + DorkHub) via Web Worker
 */
export async function loadUnifiedDatabase(progressCallback) {
    workerLoadProgressCallback = progressCallback;

    const w = getOrInitWorker();
    if (!w) {
        // Fallback to loading via main thread if worker unsupported
        return loadUnifiedFallback(progressCallback);
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            if (!workerLoaded) {
                console.warn('[ghdbService] Worker load timed out, falling back...');
                loadUnifiedFallback(progressCallback).then(resolve).catch(reject);
            }
        }, 30000);

        const checkInterval = setInterval(() => {
            if (workerLoaded) {
                clearInterval(checkInterval);
                clearTimeout(timeout);
                currentDataSource = 'unified';
                resolve(true);
            }
        }, 150);

        w.postMessage({
            type: 'LOAD',
            payload: { url: 'data/unified_dorks.json.gz' }
        });
    });
}

/**
 * Main thread fallback for unified database if Web Worker is disabled
 */
async function loadUnifiedFallback(progressCallback) {
    if (progressCallback) progressCallback(20, 'Downloading unified database...');
    const response = await fetch('data/unified_dorks.json.gz');
    if (!response.ok) throw new Error('Failed to fetch unified dataset');

    if (progressCallback) progressCallback(50, 'Decompressing with Pako...');
    const buffer = await response.arrayBuffer();
    const decompressed = pako.ungzip(new Uint8Array(buffer), { to: 'string' });

    if (progressCallback) progressCallback(80, 'Parsing records...');
    const json = JSON.parse(decompressed);

    ghdbEntries = json.entries;
    const catSet = new Set();
    const srcSet = new Set();
    ghdbEntries.forEach(e => {
        if (e.category) catSet.add(e.category);
        if (e.source) srcSet.add(e.source);
    });
    ghdbCategories = Array.from(catSet).sort();
    ghdbSources = Array.from(srcSet).sort();
    ghdbLoaded = true;
    currentDataSource = 'unified';

    if (progressCallback) progressCallback(100, 'Database ready!');
    return true;
}

/**
 * Load all dork entries (backward-compatible entry point)
 */
export async function loadAllLocalGhdbEntries() {
    const res = await loadCuratedGhdb();
    return res.categories;
}

/**
 * Get current active data source ('ghdb' or 'unified')
 */
export function getCurrentDataSource() {
    return currentDataSource;
}

/**
 * Set active data source
 */
export function setDataSource(source) {
    currentDataSource = source;
}

/**
 * Check if unified dataset is loaded
 */
export function isUnifiedLoaded() {
    return workerLoaded || (currentDataSource === 'unified' && ghdbLoaded);
}

/**
 * Retrieve dorks with filtering, searching, and pagination.
 * If unified dataset is active and worker is available, returns a Promise.
 * Otherwise returns synchronous result.
 */
export async function getDorks({
    categoryFilter = 'All',
    sourceFilter = 'All',
    searchTerm = '',
    page = 0,
    pageSize = 15,
    sortBy = 'default',
    onlyFavorites = false
}) {
    // 1. Favorites view
    if (onlyFavorites) {
        let favs = getFavoritesList();

        if (categoryFilter && categoryFilter !== 'All') {
            favs = favs.filter(e => e.category === categoryFilter);
        }

        if (sourceFilter && sourceFilter !== 'All') {
            const sf = sourceFilter.toLowerCase();
            favs = favs.filter(e => (e.source || '').toLowerCase().includes(sf));
        }

        const trimmed = searchTerm.trim().toLowerCase();
        if (trimmed) {
            const tokens = trimmed.split(/\s+/).filter(Boolean);
            favs = favs.filter(e => {
                const text = `${e.query || ''} ${e.category || ''} ${e.source || ''}`.toLowerCase();
                return tokens.every(tok => text.includes(tok));
            });
        }

        const totalFiltered = favs.length;
        const start = page * pageSize;
        return {
            entries: favs.slice(start, start + pageSize),
            recordsFiltered: totalFiltered,
            recordsTotal: favs.length
        };
    }

    // 2. Worker Search (Unified mode)
    if (currentDataSource === 'unified' && workerLoaded && worker) {
        return new Promise((resolve) => {
            const id = ++workerSearchCounter;
            pendingWorkerSearchResolvers.set(id, resolve);
            worker.postMessage({
                type: 'SEARCH',
                payload: {
                    id,
                    term: searchTerm,
                    category: categoryFilter,
                    source: sourceFilter,
                    page,
                    pageSize,
                    sortBy
                }
            });
        });
    }

    // 3. Main thread search (Curated GHDB mode or Worker Fallback)
    let filtered = ghdbEntries;

    if (categoryFilter && categoryFilter !== 'All') {
        filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (sourceFilter && sourceFilter !== 'All') {
        const sf = sourceFilter.toLowerCase();
        filtered = filtered.filter(e => (e.source || 'GHDB').toLowerCase().includes(sf));
    }

    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed) {
        const tokens = trimmed.split(/\s+/).filter(Boolean);
        filtered = filtered.filter(entry => {
            const q = (entry.query || '').toLowerCase();
            const c = (entry.category || '').toLowerCase();
            const sub = (entry.subcategory || '').toLowerCase();
            const a = (entry.author || '').toLowerCase();
            const full = `${q} ${c} ${sub} ${a}`;
            return tokens.every(tok => full.includes(tok));
        });
    }

    if (sortBy === 'date-desc') {
        filtered = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'date-asc') {
        filtered = [...filtered].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }

    const recordsFiltered = filtered.length;
    const startIndex = page * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
        entries: paginated,
        recordsFiltered,
        recordsTotal: ghdbEntries.length
    };
}

// Backward compatibility alias
export function getLocalGhdbDorks(options) {
    return getDorks(options);
}

export function getAvailableSources() {
    return ghdbSources;
}

export function getAvailableCategories() {
    return ghdbCategories;
}

export function getDataStatistics() {
    return {
        loaded: ghdbLoaded,
        currentSource: currentDataSource,
        totalEntries: ghdbEntries.length,
        categoriesCount: ghdbCategories.length,
        sourcesCount: ghdbSources.length,
        categories: ghdbCategories,
        sources: ghdbSources,
        favoritesCount: favoritesMap.size
    };
}
