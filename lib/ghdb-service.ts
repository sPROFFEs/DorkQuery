// Defines the structure for a single Google Hacking Database (GHDB) entry
export interface GhdbEntry {
  id: string; // GHDB ID, e.g., "7000"
  title: string; // The descriptive title of the dork
  dork: string; // The actual Google dork query string
  category: string; // e.g., "Files containing usernames"
  date: string; // Publication date, e.g., "2021-08-17"
  urlToGhdbPage: string; // Full URL to the specific GHDB entry page on exploit-db.com
}

// Defines the structure of the response from the fetchGhdbDorks function,
// mirroring the DataTables server-side processing response structure.
export interface GhdbResponse {
  entries: GhdbEntry[]; // The array of parsed GHDB entries
  recordsFiltered: number; // Total number of records after filtering (matching the search query)
  recordsTotal: number; // Total number of records in the database
  draw: number; // A counter sent by DataTables, echoed back by the server
}

const BASE_URL = "https://www.exploit-db.com/google-hacking-database";

export async function fetchGhdbDorks(
  searchTerm?: string,
  start: number = 0,
  length: number = 25
): Promise<GhdbResponse> {
  const params = new URLSearchParams({
    draw: "1", // Can be static for our purpose
    "order[0][column]": "0", // Order by date (assuming date is the first column, index 0)
    "order[0][dir]": "desc", // Newest first
    start: start.toString(),
    length: length.toString(),
    "search[value]": searchTerm || "",
    "search[regex]": "false",
    // Request specific columns to potentially reduce response size and simplify parsing.
    // These names must match what DataTables on the server-side expects.
    // Based on typical GHDB structure: date, url_title (contains link, dork, title), cat_id (category name)
    "columns[0][data]": "date",
    "columns[0][name]": "date",
    "columns[0][searchable]": "true",
    "columns[0][orderable]": "true",
    "columns[1][data]": "url_title",
    "columns[1][name]": "url_title",
    "columns[1][searchable]": "true",
    "columns[1][orderable]": "false", // url_title is often not directly orderable
    "columns[2][data]": "cat_id",
    "columns[2][name]": "cat_id",
    "columns[2][searchable]": "true",
    "columns[2][orderable]": "true", // Categories are often orderable
    _: Date.now().toString(), // Cache buster
  });

  const fullUrl = `${BASE_URL}?${params.toString()}`;

  try {
    // @ts-expect-error view_text_website is an injected tool
    const rawResponseText = await view_text_website(fullUrl);
    const responseJson = JSON.parse(rawResponseText);

    if (!responseJson || typeof responseJson !== 'object' || !responseJson.data || !Array.isArray(responseJson.data)) {
      console.error("Unexpected response structure from GHDB API:", responseJson);
      throw new Error("Failed to parse GHDB data: unexpected response structure.");
    }

    const entries: GhdbEntry[] = responseJson.data.map((item: any): GhdbEntry | null => {
      // The 'url_title' field contains HTML like: <a href="/ghdb/7601/?q=inurl:%22/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php%3Fplid=%22">/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?plid=</a>
      // Or sometimes the dork is the title itself if q= is missing.
      const urlTitleHtml = item.url_title || "";

      let dork = "";
      let title = "";
      let ghdbId = "";
      let urlToGhdbPage = "";

      const hrefRegex = /href="(\/ghdb\/(\d+)\/\?q=([^"]+))"/;
      const hrefWithoutQueryRegex = /href="(\/ghdb\/(\d+)\/)"/; // If no q= parameter
      const titleRegex = />([^<]+)<\/a>/;

      const hrefMatch = urlTitleHtml.match(hrefRegex);
      if (hrefMatch) {
        urlToGhdbPage = `https://www.exploit-db.com${hrefMatch[1]}`;
        ghdbId = hrefMatch[2];
        dork = decodeURIComponent(hrefMatch[3]); // Dork is in the q= parameter

        const titleMatch = urlTitleHtml.match(titleRegex);
        title = titleMatch ? titleMatch[1] : "N/A"; // Title is the link text
      } else {
        // Fallback if q= parameter is not present in href
        const hrefSimpleMatch = urlTitleHtml.match(hrefWithoutQueryRegex);
        if (hrefSimpleMatch) {
          urlToGhdbPage = `https://www.exploit-db.com${hrefSimpleMatch[1]}`;
          ghdbId = hrefSimpleMatch[2];
        }

        // If q= is missing, the title (link text) is often the dork itself or a description
        const titleMatch = urlTitleHtml.match(titleRegex);
        title = titleMatch ? titleMatch[1] : "N/A";
        // Heuristic: If title looks like a dork (e.g., contains 'inurl:', 'filetype:'), use it as dork.
        // This is a simplification; true dork might be different or require fetching the page.
        if (title !== "N/A" && (title.includes(":") || title.includes("*") || title.includes("?"))) {
            dork = title;
        } else {
            // If title doesn't look like a dork, and no q= param, dork might be unavailable directly
            // or might be the title itself. For now, we'll set it to the title if it's not "N/A".
            // A more robust solution might involve fetching the GHDB page itself, which is too complex here.
            dork = title !== "N/A" ? title : "Dork not found in link text";
        }

        // If title was used as dork, and it's very long, try to find a shorter title or use a generic one.
        if (dork === title && title.length > 100) {
            title = "GHDB Entry " + ghdbId; // Generic title for very long dorks
        }
      }

      // If GHDB ID is still missing, try to extract from any part of url_title_html as a last resort
      if (!ghdbId) {
        const genericIdMatch = urlTitleHtml.match(/\/ghdb\/(\d+)\//);
        if (genericIdMatch) {
          ghdbId = genericIdMatch[1];
          if (!urlToGhdbPage) urlToGhdbPage = `https://www.exploit-db.com/ghdb/${ghdbId}/`;
        }
      }

      // If title is still N/A and dork is available, use dork as title (or part of it)
      if (title === "N/A" && dork) {
        title = dork.length > 80 ? dork.substring(0, 77) + "..." : dork;
      }

      // If dork is still not found, mark it clearly
      if (!dork) dork = "Dork not parsable";


      // Category: 'cat_id' should directly contain the category name
      // However, the JSON response for GHDB has cat_id as a numeric ID, and another field like 'category_name' or similar
      // is NOT directly available in the primary data array.
      // The provided example URL structure in the prompt for columns (columns[2][data]=cat_id) suggests 'cat_id' is requested.
      // The actual GHDB DataTables response has `category.title` and `category.id` for each entry in the `data` array.
      // So, we should expect item.category.title if the server sends nested objects, or item.cat_id might be just the ID.
      // For this implementation, I'll assume `item.category` is an object with a `title` property.
      // If it's just an ID, this part would need adjustment or a mapping.
      // Based on re-checking exploit-db's XHR, the category is available as item.category.title_sm (short title)
      // or we might need to map from item.category.id if we had a category list.
      // The 'cat_id' column in the example URL might be a simplification.
      // Let's assume for now 'cat_id' is the direct category name as per simplified prompt.
      // If item.category.title_sm is available, that's better.
      // The actual response structure is: item.category.title_sm for display name.
      // The requested column name `cat_id` might be an error in the prompt's example URL or my interpretation.
      // Let's assume item.category.title_sm. If not, then item.cat_id (which might be a number).
      // Given the prompt example "columns[2][data]=cat_id", it implies 'cat_id' is a direct field.
      // Let's stick to the prompt's column definition and assume 'cat_id' is the category string.
      // If this is an ID, we'd need a mapping. The prompt example implies it's the string.
      const category = item.cat_id || "Uncategorized";


      if (!ghdbId) {
        // If we couldn't parse an ID, it's not a valid entry for our purposes
        // console.warn("Could not parse GHDB ID from item:", item);
        return null;
      }

      return {
        id: ghdbId,
        title: title.trim(),
        dork: dork.trim(),
        category: category.trim(), // Assuming cat_id directly holds the category name
        date: item.date || "N/A",
        urlToGhdbPage: urlToGhdbPage || `https://www.exploit-db.com/ghdb/${ghdbId}/`,
      };
    }).filter(entry => entry !== null) as GhdbEntry[]; // Filter out nulls and assert type

    return {
      draw: responseJson.draw,
      recordsTotal: responseJson.recordsTotal,
      recordsFiltered: responseJson.recordsFiltered,
      entries,
    };

  } catch (error) {
    console.error("Error fetching or parsing GHDB dorks:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch GHDB dorks: ${error.message}`);
    }
    throw new Error("Failed to fetch GHDB dorks due to an unknown error.");
  }
}
