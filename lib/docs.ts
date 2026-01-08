import axios from "axios";

// ----------------------------------------------------
// CONFIG: Trusted Lists
// ----------------------------------------------------
export const OFFICIAL_DOCS = [
  "site:react.dev",
  "site:nextjs.org",
  "site:developer.mozilla.org",
  "site:docs.python.org",
  "site:nodejs.org",
  "site:angular.io",
  "site:vuejs.org",
  "site:go.dev",
  "site:docs.oracle.com",
];

export const TUTORIAL_SITES = [
  "site:geeksforgeeks.org",
  "site:w3schools.com",
  "site:javatpoint.com",
  "site:tutorialspoint.com",
  "site:freecodecamp.org",
  "site:programiz.com",
  "site:codecademy.com",
  "site:digitalocean.com/community/tutorials",
];

export const FORUM_SITES = ["site:stackoverflow.com", "-site:reddit.com"];

// ----------------------------------------------------
// HELPER: Google Search with Site Filters
// ----------------------------------------------------
async function fetchGoogleResults(
  query: string,
  siteFilters: string[],
  count: number
) {
  const key = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!key || !cx) {
    console.error("Missing Google API Key or CX");
    return [];
  }

  const siteQuery = `(${siteFilters.join(" OR ")})`;
  const finalQuery = `${query} ${siteQuery}`;

  try {
    const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key, cx, q: finalQuery, num: count },
    });
    return (res.data.items || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: item.displayLink,
    }));
  } catch (error) {
    console.error("Google Search Error:", error);
    return [];
  }
}
export async function fetchTrustedDocs(query: string) {
  try {
    // Parallel fetch: Official/Tutorials (Priority) + Forums (Secondary)
    const [docResults, forumResults] = await Promise.all([
      fetchGoogleResults(query, [...OFFICIAL_DOCS, ...TUTORIAL_SITES], 10),
      fetchGoogleResults(query, FORUM_SITES, 5),
    ]);

    return [...docResults, ...forumResults];
  } catch (err) {
    console.error("Error fetching trusted docs:", err);
    return [];
  }
}