const { PEXELS_API_KEY } = process.env;

/**
 * Searches Pexels for a photo matching the query and returns the medium-size image URL,
 * or null if no API key is configured or no results are found.
 *
 * @param {string} query - the search query
 */
export async function searchImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;

  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!res.ok) return null;

  const data = await res.json();

  return data["photos"]?.[0]?.["src"]?.["medium"] ?? null;
}
