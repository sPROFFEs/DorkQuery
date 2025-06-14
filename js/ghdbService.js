// js/ghdbService.js

let allGhdbEntries = [];
let uniqueCategories = [];
let dataLoaded = false; // Flag to ensure data is loaded only once

/**
 * Loads all GHDB entries from the local JSON file and extracts unique categories.
 * Should only be called once.
 * @returns {Promise<string[]>} A promise that resolves with an array of unique category names, or rejects on error.
 */
export async function loadAllLocalGhdbEntries() {
    if (dataLoaded) {
        return uniqueCategories; // Return cached categories if already loaded
    }

    try {
        const response = await fetch('data/ghdb_clean.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching local GHDB JSON.`);
        }
        const jsonData = await response.json();

        if (!jsonData || !Array.isArray(jsonData.entries)) {
            console.error("Unexpected JSON structure from local GHDB file:", jsonData);
            throw new Error("Failed to parse local GHDB data: unexpected JSON structure.");
        }

        allGhdbEntries = jsonData.entries;
        
        // Extract unique categories
        const categories = new Set();
        allGhdbEntries.forEach(entry => {
            if (entry.category) {
                categories.add(entry.category);
            }
        });
        uniqueCategories = [...categories].sort(); // Sort categories alphabetically

        dataLoaded = true;
        console.log('Local GHDB data loaded and processed successfully.');
        return uniqueCategories;

    } catch (error) {
        console.error('Failed to load or parse local GHDB data:', error);
        allGhdbEntries = []; // Ensure it's empty on error
        uniqueCategories = [];
        dataLoaded = false; // Allow retry if it was a transient issue (though unlikely for local file)
        throw error; // Re-throw to allow UI to handle it
    }
}

/**
 * Filters and paginates local GHDB entries.
 * @param {object} options - Filtering and pagination options.
 * @param {string} [options.categoryFilter='All'] - The category to filter by. 'All' means no category filter.
 * @param {string} [options.searchTerm=''] - The search term to filter by (searches in query and category).
 * @param {number} [options.page=0] - The 0-indexed page number.
 * @param {number} [options.pageSize=15] - The number of items per page.
 * @returns {{ entries: any[], recordsFiltered: number, recordsTotal: number }}
 */
export function getLocalGhdbDorks({ categoryFilter = 'All', searchTerm = '', page = 0, pageSize = 15 }) {
    if (!dataLoaded) {
        // This case should ideally be prevented by UI logic (e.g., disable search until data is loaded)
        // or loadAllLocalGhdbEntries should be awaited before first call.
        console.warn('getLocalGhdbDorks called before data was loaded. Call loadAllLocalGhdbEntries first.');
        // Attempt to load now, though this makes getLocalGhdbDorks async if not careful.
        // For simplicity here, assuming loadAllLocalGhdbEntries was called at init.
        // If not, this will operate on empty allGhdbEntries.
        if (allGhdbEntries.length === 0) {
             return { entries: [], recordsFiltered: 0, recordsTotal: 0 };
        }
    }

    let filteredEntries = allGhdbEntries;

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All') {
        filteredEntries = filteredEntries.filter(entry => entry.category === categoryFilter);
    }

    // Apply search term filter
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerSearchTerm) {
        filteredEntries = filteredEntries.filter(entry => {
            const queryMatch = entry.query && entry.query.toLowerCase().includes(lowerSearchTerm);
            // The user's JSON sample has 'category' as a string, not an object with title_sm.
            // The 'title' field from the old API structure (descriptive title of the dork) isn't directly in the user's sample.
            // We'll search in 'category' as well.
            const categoryMatch = entry.category && entry.category.toLowerCase().includes(lowerSearchTerm);
            // If there was a description or title field in the JSON, we'd search it too.
            // const descriptionMatch = entry.description && entry.description.toLowerCase().includes(lowerSearchTerm);
            return queryMatch || categoryMatch;
        });
    }

    const recordsFiltered = filteredEntries.length;
    const recordsTotal = allGhdbEntries.length;

    // Apply pagination
    const startIndex = page * pageSize;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pageSize);

    return {
        entries: paginatedEntries,
        recordsFiltered: recordsFiltered,
        recordsTotal: recordsTotal
    };
}
