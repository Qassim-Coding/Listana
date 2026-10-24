import { Platform } from "react-native";

// API officielle de MyAnimeList (gratuite, identifiant client requis : EXPO_PUBLIC_MAL_CLIENT_ID)
// Conditions : citer MyAnimeList comme source, pas de logo MyAnimeList dans l'app, pas d'aspiration du site.
// Dons ponctuels autorisés. Dons mensuels, abonnement, app payante ou pub = accord écrit de MyAnimeList.
const BASE = "https://api.myanimelist.net/v2";
const CLIENT_ID = process.env.EXPO_PUBLIC_MAL_CLIENT_ID;
const TIMEOUT_MS = 8000;
const FIELDS =
  "alternative_titles,main_picture,start_date,media_type,num_volumes,num_chapters,authors{first_name,last_name}";

export const MAL_URL = "https://myanimelist.net";

export type MangaSearchResult = {
  id: number; // identifiant MyAnimeList (le même que celui de Jikan : les anciens mangas restent compatibles)
  title: string;
  year?: number;
  posterUrl?: string;
  subtitle?: string; // auteur et type, affichés sous le titre dans les résultats
  author?: string;
  volumes?: number;
  chapters?: number;
};

const TYPE_LABEL: Record<string, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  manhua: "Manhua",
  light_novel: "Light novel",
  novel: "Roman",
  one_shot: "One-shot",
  doujinshi: "Doujinshi",
  oel: "OEL",
};

export function hasMalClientId(): boolean {
  return !!CLIENT_ID;
}

// Résultats déjà obtenus : retaper la même recherche ne rappelle pas le serveur
const cache = new Map<string, MangaSearchResult[]>();

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Abandonne la requête si le serveur ne répond pas à temps (au lieu de tourner dans le vide)
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { accept: "application/json", "X-MAL-CLIENT-ID": CLIENT_ID ?? "" },
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("MyAnimeList met trop de temps à répondre. Réessaie, ou remplis à la main.");
    }
    if (Platform.OS === "web") {
      // Le navigateur peut bloquer l'API de MyAnimeList (règle CORS) : sur le téléphone, pas ce problème
      throw new Error("Le navigateur bloque MyAnimeList : teste la recherche de mangas sur le téléphone.");
    }
    throw new Error("MyAnimeList est injoignable pour le moment. Réessaie, ou remplis à la main.");
  } finally {
    clearTimeout(timer);
  }
}

function authorName(a: any): string | undefined {
  const first = String(a?.node?.first_name ?? "").trim();
  const last = String(a?.node?.last_name ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  return full || undefined;
}

export async function searchManga(query: string): Promise<MangaSearchResult[]> {
  if (!CLIENT_ID) throw new Error("Identifiant MyAnimeList manquant");
  const q = query.trim();
  // MyAnimeList refuse les recherches trop courtes
  if (q.length < 3) return [];

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `${BASE}/manga?${toQuery({ q, limit: "8", fields: FIELDS })}`;
  let res = await fetchWithTimeout(url);
  // Serveur surchargé ou limite atteinte : une seule nouvelle tentative, un peu plus tard
  if (res.status === 429 || res.status >= 500) {
    await wait(1200);
    res = await fetchWithTimeout(url);
  }
  if (res.status === 400) return [];
  if (res.status === 401 || res.status === 403) throw new Error("Identifiant MyAnimeList refusé, vérifie-le");
  if (res.status === 429) throw new Error("Trop de recherches, réessaie dans un instant");
  if (!res.ok) throw new Error(`MyAnimeList ne répond pas correctement (${res.status}). Réessaie plus tard.`);
  const data = (await res.json()) as { data?: { node?: any }[] };

  const results: MangaSearchResult[] = (data.data ?? [])
    .map((row) => row?.node)
    .filter((m) => m && Number.isFinite(Number(m.id)))
    .map((m) => {
      const author = authorName(m?.authors?.[0]);
      const year = parseInt(String(m?.start_date ?? "").slice(0, 4), 10);
      const volumes = Number(m?.num_volumes);
      const chapters = Number(m?.num_chapters);
      const type = typeof m?.media_type === "string" ? TYPE_LABEL[m.media_type] ?? m.media_type : undefined;
      return {
        id: Number(m.id),
        // Titre anglais s'il existe (souvent plus parlant), sinon le titre principal
        title: m?.alternative_titles?.en || m?.title || "Sans titre",
        year: Number.isFinite(year) ? year : undefined,
        posterUrl: m?.main_picture?.medium || m?.main_picture?.large || undefined,
        subtitle: [author, type].filter(Boolean).join(" · ") || undefined,
        author,
        // 0 = inconnu ou série en cours chez MyAnimeList
        volumes: Number.isFinite(volumes) && volumes > 0 ? volumes : undefined,
        chapters: Number.isFinite(chapters) && chapters > 0 ? chapters : undefined,
      };
    });

  cache.set(key, results);
  return results;
}