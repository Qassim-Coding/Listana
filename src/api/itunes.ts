import { Platform } from "react-native";

// Apple (iTunes Search API) : podcasts et livres audio, sans clé ni compte.
// Conditions d'Apple : les pochettes servent à promouvoir le contenu Apple, donc un lien
// « Écouter sur Apple Podcasts / Apple Books » doit être affiché à côté de chaque pochette.
// Environ 20 recherches par minute : le champ attend 450 ms après la frappe et on garde un cache.
const BASE = "https://itunes.apple.com/search";
const COUNTRY = "CH"; // boutique suisse (contenus en français, allemand, italien et anglais)
const TIMEOUT_MS = 8000;

export const APPLE_PODCASTS_URL = "https://podcasts.apple.com";

export type AppleKind = "podcast" | "audiobook";

export type AppleSearchResult = {
  id: number; // identifiant Apple (collectionId)
  title: string;
  year?: number;
  posterUrl?: string;
  subtitle?: string; // auteur et genre, affichés sous le titre dans les résultats
  author?: string;
  genre?: string;
  storeUrl?: string; // fiche Apple Podcasts ou Apple Books
  episodeCount?: number;
};

// Texte du lien obligatoire à côté de la pochette
export function appleLinkLabel(kind: AppleKind): string {
  return kind === "audiobook" ? "Écouter sur Apple Books" : "Écouter sur Apple Podcasts";
}

// Résultats déjà obtenus : retaper la même recherche ne rappelle pas Apple
const cache = new Map<string, AppleSearchResult[]>();

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

// Abandonne la requête si Apple ne répond pas à temps (au lieu de tourner dans le vide)
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { headers: { accept: "application/json" }, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Apple met trop de temps à répondre. Réessaie, ou remplis à la main.");
    }
    if (Platform.OS === "web") {
      throw new Error("Recherche Apple impossible depuis le navigateur : teste sur le téléphone.");
    }
    throw new Error("Apple est injoignable pour le moment. Réessaie, ou remplis à la main.");
  } finally {
    clearTimeout(timer);
  }
}

// Les pochettes de 100 px sont floues : Apple fournit la même image en 600 px
function bigArtwork(r: any): string | undefined {
  if (typeof r?.artworkUrl600 === "string") return r.artworkUrl600;
  if (typeof r?.artworkUrl100 === "string") return r.artworkUrl100.replace("100x100", "600x600");
  return undefined;
}

async function searchApple(query: string, kind: AppleKind): Promise<AppleSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const key = `${kind}:${q.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `${BASE}?${toQuery({ term: q, media: kind, entity: kind, country: COUNTRY, limit: "8" })}`;
  const res = await fetchWithTimeout(url);
  // Apple répond 403 ou 429 quand on cherche trop souvent
  if (res.status === 403 || res.status === 429) throw new Error("Trop de recherches, réessaie dans une minute");
  if (!res.ok) throw new Error(`Apple ne répond pas correctement (${res.status}). Réessaie plus tard.`);
  const data = (await res.json()) as { results?: any[] };

  const results: AppleSearchResult[] = (data.results ?? [])
    .filter((r) => Number.isFinite(Number(r?.collectionId)))
    .map((r) => {
      const author = typeof r.artistName === "string" ? r.artistName : undefined;
      const genre = typeof r.primaryGenreName === "string" ? r.primaryGenreName : undefined;
      const count = Number(r.trackCount);
      // Pour un podcast, la date d'Apple est celle du dernier épisode : on ne l'affiche pas comme une année de sortie
      const year = kind === "audiobook" ? parseInt(String(r.releaseDate ?? "").slice(0, 4), 10) : NaN;
      return {
        id: Number(r.collectionId),
        title: r.collectionName || r.trackName || "Sans titre",
        year: Number.isFinite(year) ? year : undefined,
        posterUrl: bigArtwork(r),
        subtitle: [author, genre].filter(Boolean).join(" · ") || undefined,
        author,
        genre,
        storeUrl: r.collectionViewUrl || r.trackViewUrl || undefined,
        episodeCount: kind === "podcast" && Number.isFinite(count) && count > 0 ? count : undefined,
      };
    });

  cache.set(key, results);
  return results;
}

// Deux fonctions fixes (et non une fonction recréée à chaque affichage) :
// le champ de recherche relance la recherche quand la fonction change.
export function searchApplePodcasts(query: string): Promise<AppleSearchResult[]> {
  return searchApple(query, "podcast");
}

export function searchAppleAudiobooks(query: string): Promise<AppleSearchResult[]> {
  return searchApple(query, "audiobook");
}