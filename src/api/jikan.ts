// Jikan : API non officielle de MyAnimeList (gratuite, sans clé)
// Limites : 3 requêtes par seconde, 60 par minute
const BASE = "https://api.jikan.moe/v4";

export const MAL_URL = "https://myanimelist.net";

const TIMEOUT_MS = 8000;
const RETRY_WAIT_MS = 1500;

export type MangaSearchResult = {
  id: number; // identifiant MyAnimeList (mal_id)
  title: string;
  year?: number;
  posterUrl?: string;
  subtitle?: string; // auteur et type, affichés sous le titre dans les résultats
  author?: string;
  volumes?: number;
  chapters?: number;
};

const cache = new Map<string, MangaSearchResult[]>();

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

// MyAnimeList écrit les auteurs "Nom, Prénom" : on remet dans l'ordre habituel
function authorName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw.trim();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJikan(url: string, attempt = 1): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { accept: "application/json" }, signal: ctrl.signal });
    if (res.status === 429 && attempt < 2) {
      await wait(RETRY_WAIT_MS);
      return fetchJikan(url, attempt + 1);
    }
    return res;
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    const network = e instanceof Error && /Failed to fetch|Network request failed/i.test(e.message);
    if (attempt < 2 && (aborted || network)) {
      await wait(RETRY_WAIT_MS);
      return fetchJikan(url, attempt + 1);
    }
    if (aborted) throw new Error("Jikan met trop de temps à répondre. Réessaie.");
    if (network) throw new Error("Impossible de joindre Jikan. Réessaie dans un instant.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchManga(query: string): Promise<MangaSearchResult[]> {
  const key = query.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const url = `${BASE}/manga?${toQuery({ q: query, limit: "8", sfw: "true" })}`;
  const res = await fetchJikan(url);
  if (res.status === 429) throw new Error("Trop de recherches, réessaie dans un instant");
  if (!res.ok) throw new Error(`Erreur Jikan (${res.status})`);
  const data = (await res.json()) as { data?: any[] };

  const results = (data.data ?? []).map((m) => {
    const author = authorName(m?.authors?.[0]?.name);
    const year = parseInt(String(m?.published?.from ?? "").slice(0, 4), 10);
    const volumes = Number(m?.volumes);
    const chapters = Number(m?.chapters);
    const type = typeof m?.type === "string" ? m.type : undefined;
    return {
      id: Number(m?.mal_id),
      title: m?.title_english || m?.title || "Sans titre",
      year: Number.isFinite(year) ? year : undefined,
      posterUrl: m?.images?.jpg?.image_url || undefined,
      subtitle: [author, type].filter(Boolean).join(" · ") || undefined,
      author,
      volumes: Number.isFinite(volumes) && volumes > 0 ? volumes : undefined,
      chapters: Number.isFinite(chapters) && chapters > 0 ? chapters : undefined,
    };
  });

  cache.set(key, results);
  return results;
}
