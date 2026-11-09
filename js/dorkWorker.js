// js/dorkWorker.js - Background Web Worker for Heavy Dork Datasets (GHDB + DorkHub)

let entries = [];
let normalizedIndex = []; // cached lowercased search strings for ultra-fast filtering
let uniqueCategories = [];
let uniqueSources = [];
let isLoaded = false;
let pakoLib = null;

async function ensurePako() {
    if (pakoLib) return pakoLib;
    if (typeof pako !== 'undefined') {
        pakoLib = pako;
        return pakoLib;
    }
    if (typeof self !== 'undefined' && self.pako) {
        pakoLib = self.pako;
        return pakoLib;
    }
    try {
        importScripts('https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js');
        pakoLib = self.pako;
        return pakoLib;
    } catch (e) {
        try {
            const mod = await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.esm.mjs');
            pakoLib = mod.default || mod;
            return pakoLib;
        } catch (e2) {
            throw new Error('Failed to load Pako in worker: ' + e2.message);
        }
    }
}

// Listen for messages from main thread
self.onmessage = async function (e) {
    const { type, payload } = e.data || {};

    switch (type) {
        case 'LOAD':
            await handleLoad(payload);
            break;
        case 'SEARCH':
            handleSearch(payload);
            break;
        case 'GET_STATS':
            handleGetStats();
            break;
        default:
            console.warn('[dorkWorker] Unknown message type:', type);
    }
};

async function handleLoad(payload = {}) {
    const url = payload.url || 'data/unified_dorks.json.gz';

    try {
        self.postMessage({ type: 'PROGRESS', percent: 15, message: 'Downloading database...' });

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while fetching ${url}`);
        }

        let jsonData;
        if (url.endsWith('.gz')) {
            self.postMessage({ type: 'PROGRESS', percent: 40, message: 'Decompressing records with Pako...' });

            const pakoInstance = await ensurePako();
            const buffer = await response.arrayBuffer();
            self.postMessage({ type: 'PROGRESS', percent: 65, message: 'Parsing decompressed JSON...' });

            const decompressed = pakoInstance.ungzip(new Uint8Array(buffer), { to: 'string' });
            jsonData = JSON.parse(decompressed);
        } else {
            self.postMessage({ type: 'PROGRESS', percent: 60, message: 'Parsing JSON data...' });
            jsonData = await response.json();
        }

        if (!jsonData || !Array.isArray(jsonData.entries)) {
            throw new Error('Unexpected JSON structure: entries array missing');
        }

        entries = jsonData.entries;

        self.postMessage({ type: 'PROGRESS', percent: 85, message: 'Indexing categories & search tokens...' });

        const catSet = new Set();
        const srcSet = new Set();
        normalizedIndex = new Array(entries.length);

        for (let i = 0; i < entries.length; i++) {
            const item = entries[i];
            const cat = item.category || 'Other';
            const src = item.source || 'GHDB';
            catSet.add(cat);
            srcSet.add(src);

            // Pre-normalize text for instant token search
            const q = (item.query || '').toLowerCase();
            const c = cat.toLowerCase();
            const sub = (item.subcategory || '').toLowerCase();
            const a = (item.author || '').toLowerCase();
            normalizedIndex[i] = `${q} | ${c} | ${sub} | ${a} | ${src.toLowerCase()}`;
        }

        uniqueCategories = Array.from(catSet).sort();
        uniqueSources = Array.from(srcSet).sort();
        isLoaded = true;

        self.postMessage({
            type: 'LOADED',
            success: true,
            totalCount: entries.length,
            categories: uniqueCategories,
            sources: uniqueSources,
            metadata: jsonData.metadata || {}
        });

    } catch (error) {
        console.error('[dorkWorker] Load error:', error);
        self.postMessage({
            type: 'LOAD_ERROR',
            error: error.message
        });
    }
}

function handleSearch(payload = {}) {
    if (!isLoaded) {
        self.postMessage({
            type: 'SEARCH_RESULTS',
            id: payload.id,
            entries: [],
            totalFiltered: 0,
            totalRecords: 0,
            page: 0,
            pageSize: payload.pageSize || 15
        });
        return;
    }

    const {
        id,
        term = '',
        category = 'All',
        source = 'All',
        page = 0,
        pageSize = 15,
        sortBy = 'default'
    } = payload;

    const trimmedTerm = term.trim().toLowerCase();
    const tokens = trimmedTerm ? trimmedTerm.split(/\s+/).filter(Boolean) : [];
    const hasCategory = category && category !== 'All';
    const hasSource = source && source !== 'All';
    const sourceLower = hasSource ? source.toLowerCase() : '';

    const matchedIndices = [];

    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];

        // 1. Category check
        if (hasCategory && (item.category || 'Other') !== category) {
            continue;
        }

        // 2. Source check
        if (hasSource) {
            const itemSrc = (item.source || 'GHDB').toLowerCase();
            if (!itemSrc.includes(sourceLower)) {
                continue;
            }
        }

        // 3. Search tokens check (all tokens must match)
        if (tokens.length > 0) {
            const fullText = normalizedIndex[i];
            let allMatched = true;
            for (let t = 0; t < tokens.length; t++) {
                if (!fullText.includes(tokens[t])) {
                    allMatched = false;
                    break;
                }
            }
            if (!allMatched) {
                continue;
            }
        }

        matchedIndices.push(i);
    }

    const totalFiltered = matchedIndices.length;

    // Optional sort
    if (sortBy === 'date-desc') {
        matchedIndices.sort((a, b) => (entries[b].date || '').localeCompare(entries[a].date || ''));
    } else if (sortBy === 'date-asc') {
        matchedIndices.sort((a, b) => (entries[a].date || '').localeCompare(entries[b].date || ''));
    } else if (sortBy === 'query-asc') {
        matchedIndices.sort((a, b) => (entries[a].query || '').localeCompare(entries[b].query || ''));
    }

    // Pagination
    const startIndex = page * pageSize;
    const paginatedSlice = matchedIndices.slice(startIndex, startIndex + pageSize).map(idx => entries[idx]);

    self.postMessage({
        type: 'SEARCH_RESULTS',
        id,
        entries: paginatedSlice,
        totalFiltered,
        totalRecords: entries.length,
        page,
        pageSize
    });
}

function handleGetStats() {
    self.postMessage({
        type: 'STATS',
        isLoaded,
        totalCount: entries.length,
        categoriesCount: uniqueCategories.length,
        sourcesCount: uniqueSources.length,
        categories: uniqueCategories,
        sources: uniqueSources
    });
}
