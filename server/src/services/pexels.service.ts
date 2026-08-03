interface PexelsPhoto {
  src: { large: string; medium: string; small: string };
  alt: string | null;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

export class PexelsServiceError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "PexelsServiceError";
    this.status = status;
  }
}

// Simple in-memory cache so repeated UI renders (e.g. re-visiting the same
// cuisine) don't re-hit the Pexels API every time.
const cache = new Map<string, { url: string | null; cachedAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function searchFoodImage(query: string): Promise<string | null> {
  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.url;
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new PexelsServiceError("Server is missing PEXELS_API_KEY configuration.", 500);
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { Authorization: apiKey } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    throw new PexelsServiceError(`Pexels request failed: ${message}`, 502);
  }

  if (!response.ok) {
    throw new PexelsServiceError(`Pexels API responded with ${response.status}.`, 502);
  }

  const data = (await response.json()) as PexelsSearchResponse;
  const imageUrl = data.photos[0]?.src.large ?? null;

  cache.set(key, { url: imageUrl, cachedAt: Date.now() });
  return imageUrl;
}
