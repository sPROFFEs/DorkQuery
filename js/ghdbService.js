// js/ghdbService.js

/**
 * Represents a GHDB Entry.
 * @typedef {object} GhdbEntry
 * @property {string} id - GHDB ID, e.g., "7000"
 * @property {string} title - The descriptive title of the dork
 * @property {string} dork - The actual Google dork query string
 * @property {string} category - e.g., "Files containing usernames"
 * @property {string} date - Publication date
 * @property {string} urlToGhdbPage - Full URL to the specific GHDB entry page
 */

/**
 * Represents the response from fetching GHDB entries.
 * @typedef {object} GhdbResponse
 * @property {GhdbEntry[]} entries
 * @property {number} recordsFiltered
 * @property {number} recordsTotal
 * @property {number} draw - From the DataTables response
 */

/**
 * Fetches dorks from the Exploit-DB Google Hacking Database.
 * @param {string} [searchTerm=''] - Optional search term.
 * @param {number} [start=0] - Starting record index for pagination.
 * @param {number} [length=15] - Number of records to fetch.
 * @returns {Promise<GhdbResponse>}
 */
export async function fetchGhdbDorks(searchTerm = '', start = 0, length = 15) {
    const draw = 1; // Can be static for our requests
    const searchVal = encodeURIComponent(searchTerm);
    const timestamp = Date.now();

    // Construct the URL with DataTables parameters
    // Columns are 0-indexed by DataTables in the request.
    // 0: date, 1: url_title (contains dork, title, link), 2: category.title_sm (category name)
    // Note: The column name for category is 'category.title_sm' based on observed XHR from exploit-db.com itself.
    const apiUrl = `https://www.exploit-db.com/google-hacking-database?draw=${draw}&columns%5B0%5D%5Bdata%5D=date&columns%5B0%5D%5Bname%5D=date&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=url_title&columns%5B1%5D%5Bname%5D=url_title&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=category.title_sm&columns%5B2%5D%5Bname%5D=category.title_sm&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=desc&start=${start}&length=${length}&search%5Bvalue%5D=${searchVal}&search%5Bregex%5D=false&_=${timestamp}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // Often required for DataTables backends
                                                      // but Exploit-DB seems to work without it for GET if no CORS policy blocks.
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching GHDB.`);
        }
        const responseJson = await response.json();
        console.log('[ghdbService.js] Raw API Response JSON:', JSON.stringify(responseJson, null, 2));

        // Expected structure: { "draw": number, "recordsTotal": number, "recordsFiltered": number, "data": any[] }
        // Each item in `data` is an object e.g., 
        // { "date": "...", "url_title": "<a href=\"/ghdb/id/?q=dork\">Title</a>", "category": { "id": "...", "title_sm": "..." } }

        if (!responseJson || typeof responseJson !== 'object' || !Array.isArray(responseJson.data)) {
            console.error("Unexpected response structure from GHDB API:", responseJson);
            throw new Error("Failed to parse GHDB data: unexpected response structure.");
        }
        
        const entries = responseJson.data.map(item => {
            let dork = '';
            let title = '';
            let ghdbId = '';
            let urlToGhdbPage = '';
            let categoryName = "Unknown";

            const urlTitleHtml = item.url_title || ""; 

            if (urlTitleHtml) {
                const linkMatch = urlTitleHtml.match(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/i);
                if (linkMatch && linkMatch.length >= 3) {
                    const hrefPath = linkMatch[1];
                    urlToGhdbPage = `https://www.exploit-db.com${hrefPath}`;
                    // Strip HTML tags from title (like <em> for search highlights)
                    title = linkMatch[2].replace(/<[^>]+>/g, '').trim(); 

                    const idMatch = hrefPath.match(/\/ghdb\/(\d+)\//);
                    if (idMatch && idMatch[1]) {
                        ghdbId = idMatch[1];
                    }

                    const dorkMatch = hrefPath.match(/\?q=([^&"]+)/);
                    if (dorkMatch && dorkMatch[1]) {
                        dork = decodeURIComponent(dorkMatch[1].replace(/&amp;/g, '&'));
                    } else if (title) { 
                        // Fallback: if no q= param, sometimes the title itself is the dork, or a good approximation
                        // This heuristic might need refinement.
                        if (title.includes(':') || title.includes('"') || title.includes('*')) {
                           dork = title;
                        }
                    }
                } else {
                     // Fallback if parsing <a> tag fails, treat raw url_title as potential title/dork
                    title = urlTitleHtml.replace(/<[^>]+>/g, '').trim();
                    if (title.includes(':') || title.includes('"') || title.includes('*')) {
                        dork = title;
                    }
                }
            }
            
            // If dork is still empty but title resembles a dork, use title.
            if (!dork && title && (title.includes(':') || title.includes('"') || title.includes('*'))) {
                dork = title;
            }
            // If title is empty but dork is found, use dork as title (or part of it)
            if (!title && dork) {
                title = dork.length > 80 ? dork.substring(0, 77) + "..." : dork;
            }


            // Category: requested as 'category.title_sm'
            if (item.category && item.category.title_sm) {
                categoryName = item.category.title_sm;
            } else if (item.cat_id) { // Fallback if the structure was simpler (e.g. just cat_id as string)
                 categoryName = typeof item.cat_id === 'string' ? item.cat_id : "Unknown";
            }

            return {
                id: ghdbId,
                title: title || "N/A", // Ensure title is not empty
                dork: dork || "N/A",   // Ensure dork is not empty
                category: categoryName,
                date: item.date || "N/A",
                urlToGhdbPage: urlToGhdbPage
            };
        }).filter(entry => entry.id && entry.dork && entry.dork !== "N/A"); // Ensure essential fields were parsed

        return {
            draw: responseJson.draw,
            recordsTotal: responseJson.recordsTotal,
            recordsFiltered: responseJson.recordsFiltered,
            entries: entries
        };

    } catch (error) {
        console.error('Failed to fetch or parse GHDB data:', error);
        // Propagate the error so the UI can handle it
        throw error; 
    }
}
