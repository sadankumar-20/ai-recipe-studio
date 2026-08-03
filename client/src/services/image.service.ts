import { api } from "./api";

// Client-side memory cache so the same query (e.g. a dish name shown on
// multiple cards) only ever triggers one network request per session.
const cache = new Map<string, Promise<string | null>>();

export function fetchFoodImage(query: string): Promise<string | null> {
  const key = query.trim().toLowerCase();
  if (!key) return Promise.resolve(null);

  const existing = cache.get(key);
  if (existing) return existing;

  const promise = api
    .get<{ url: string | null }>("/images/search", { params: { query: key } })
    .then((res) => res.data.url)
    .catch(() => null);

  cache.set(key, promise);
  return promise;
}
