// js/ghdbService.js

let allDorkEntries = [];
let uniqueCategories = [];
let uniqueSources = [];
let dataLoaded = false; // Flag to ensure data is loaded only once

/**
 * Loads all dork entries from the unified JSON file (GHDB + DorkHub) and extracts unique categories.
 * Should only be called once.
 * @returns {Promise<string[]>} A promise that resolves with an array of unique category names, or rejects on error.
 */
export async function loadAllLocalGhdbEntries() {
    if (dataLoaded) {
        return uniqueCategories; // Return cached categories if already loaded
    }

    try {
        // Try unified file first, fallback to GHDB only
        let response;
        let dataSource = 'unified';
        
        try {
            response = await fetch('data/unified_dorks.json.gz');
            if (!response.ok) {
                throw new Error('Unified file not found');
            }
        } catch (unifiedError) {
            console.log('Unified dorks file not found, falling back to GHDB only...');
            response = await fetch('data/ghdb_clean.json');
            dataSource = 'ghdb';
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching dork data.`);
            }
        }
        
        // Check if the response is gzipped based on the URL
        let jsonData;
        if (response.url.endsWith('.gz')) {
            // Use pako library for gzip decompression (more compatible)
            if (typeof pako === 'undefined') {
                throw new Error('pako library is required for gzip decompression. Please include pako.js');
            }
            
            const compressedData = await response.arrayBuffer();
            const decompressedData = pako.ungzip(new Uint8Array(compressedData), { to: 'string' });
            jsonData = JSON.parse(decompressedData);
        } else {
            jsonData = await response.json();
        }

        if (!jsonData || !Array.isArray(jsonData.entries)) {
            console.error("Unexpected JSON structure from dork file:", jsonData);
            throw new Error("Failed to parse dork data: unexpected JSON structure.");
        }

        allDorkEntries = jsonData.entries;
        
        // Extract unique categories and sources
        const categories = new Set();
        const sources = new Set();
        
        allDorkEntries.forEach(entry => {
            if (entry.category) {
                categories.add(entry.category);
            }
            if (entry.source) {
                sources.add(entry.source);
            }
        });
        
        uniqueCategories = [...categories].sort(); // Sort categories alphabetically
        uniqueSources = [...sources].sort();

        dataLoaded = true;
        
        // Log loading statistics
        const metadata = jsonData.metadata;
        if (metadata) {
            console.log(`Dork data loaded successfully from ${dataSource} source:`);
            console.log(`- Total entries: ${metadata.total_records || allDorkEntries.length}`);
            if (metadata.dorkhub_records) {
                console.log(`- DorkHub entries: ${metadata.dorkhub_records}`);
            }
            if (metadata.ghdb_records) {
                console.log(`- GHDB entries: ${metadata.ghdb_records}`);
            }
            console.log(`- Categories: ${uniqueCategories.length}`);
            console.log(`- Sources: ${uniqueSources.join(', ')}`);
        } else {
            console.log(`Local ${dataSource} data loaded and processed successfully.`);
        }
        
        return uniqueCategories;

    } catch (error) {
        console.error('Failed to load or parse dork data:', error);
        allDorkEntries = []; // Ensure it's empty on error
        uniqueCategories = [];
        uniqueSources = [];
        dataLoaded = false; // Allow retry if it was a transient issue (though unlikely for local file)
        throw error; // Re-throw to allow UI to handle it
    }
}

/**
 * Filters and paginates local dork entries (GHDB + DorkHub).
 * @param {object} options - Filtering and pagination options.
 * @param {string} [options.categoryFilter='All'] - The category to filter by. 'All' means no category filter.
 * @param {string} [options.sourceFilter='All'] - The source to filter by ('GHDB', 'DorkHub', 'All').
 * @param {string} [options.searchTerm=''] - The search term to filter by (searches in query and category).
 * @param {number} [options.page=0] - The 0-indexed page number.
 * @param {number} [options.pageSize=15] - The number of items per page.
 * @returns {{ entries: any[], recordsFiltered: number, recordsTotal: number }}
 */
export function getLocalGhdbDorks({ categoryFilter = 'All', sourceFilter = 'All', searchTerm = '', page = 0, pageSize = 15 }) {
    if (!dataLoaded) {
        console.warn('getLocalGhdbDorks called before data was loaded. Call loadAllLocalGhdbEntries first.');
        if (allDorkEntries.length === 0) {
             return { entries: [], recordsFiltered: 0, recordsTotal: 0 };
        }
    }

    let filteredEntries = allDorkEntries;

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All') {
        filteredEntries = filteredEntries.filter(entry => entry.category === categoryFilter);
    }

    // Apply source filter (new feature)
    if (sourceFilter && sourceFilter !== 'All') {
        const sourceKeyword = sourceFilter.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => {
            if (!entry.source) return false;
            return entry.source.toLowerCase().includes(sourceKeyword);
        });
    }

    // Apply search term filter
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerSearchTerm) {
        filteredEntries = filteredEntries.filter(entry => {
            const queryMatch = entry.query && entry.query.toLowerCase().includes(lowerSearchTerm);
            const categoryMatch = entry.category && entry.category.toLowerCase().includes(lowerSearchTerm);
            const subcategoryMatch = entry.subcategory && entry.subcategory.toLowerCase().includes(lowerSearchTerm);
            const sourceMatch = entry.source && entry.source.toLowerCase().includes(lowerSearchTerm);
            
            return queryMatch || categoryMatch || subcategoryMatch || sourceMatch;
        });
    }

    const recordsFiltered = filteredEntries.length;
    const recordsTotal = allDorkEntries.length;

    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pageSize);

    return {
        entries: paginatedEntries,
        recordsFiltered: recordsFiltered,
        recordsTotal: recordsTotal
    };
}

/**
 * Gets all unique sources available in the loaded data.
 * @returns {string[]} Array of unique source names.
 */
export function getAvailableSources() {
    return uniqueSources;
}

/**
 * Gets statistics about the loaded data.
 * @returns {object} Object containing data statistics.
 */
export function getDataStatistics() {
    if (!dataLoaded) {
        return { loaded: false };
    }

    const categoryStats = {};
    const sourceStats = {};

    allDorkEntries.forEach(entry => {
        // Count by category
        if (entry.category) {
            categoryStats[entry.category] = (categoryStats[entry.category] || 0) + 1;
        }
        
        // Count by source
        if (entry.source) {
            sourceStats[entry.source] = (sourceStats[entry.source] || 0) + 1;
        }
    });

    return {
        loaded: true,
        totalEntries: allDorkEntries.length,
        categoriesCount: uniqueCategories.length,
        sourcesCount: uniqueSources.length,
        categories: uniqueCategories,
        sources: uniqueSources,
        categoryStats,
        sourceStats
    };
}
