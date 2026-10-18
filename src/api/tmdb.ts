const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

export type SearchResult = {
  id: number;
  title: string;
  year?: number;
  posterUrl?: string;
};

export function hasTmdbToken(): boolean {
  return !!TOKEN;
}

export function tmdbImage(path?: string | null, size = "w342"): string | undefined {
  return path ? `${IMG}/${size}${path}` : undefined;
}

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!TOKEN) throw new Error("Clé TMDB manquante");
  const url = `${BASE}${path}?${toQuery({ language: "fr-FR", ...params })}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, accept: "application/json" },
  });
  if (res.status === 429) throw new Error("Trop de recherches, réessaie dans un instant");
  if (!res.ok) throw new Error(`Erreur TMDB (${res.status})`);
  return (await res.json()) as T;
}

function yearOf(date?: string): number | undefined {
  const y = parseInt((date ?? "").slice(0, 4), 10);
  return Number.isFinite(y) ? y : undefined;
}

// ---------- Films ----------

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const data = await tmdbGet<{ results?: any[] }>("/search/movie", {
    query,
    include_adult: "false",
  });
  return (data.results ?? []).slice(0, 8).map((m) => ({
    id: m.id,
    title: m.title || m.original_title || "Sans titre",
    year: yearOf(m.release_date),
    posterUrl: tmdbImage(m.poster_path, "w185"),
  }));
}

export type MovieDetails = {
  id: number;
  title: string;
  originalTitle?: string;
  year?: number;
  runtime?: number;
  posterUrl?: string;
  backdropUrl?: string;
  imdbId?: string;
};

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const m = await tmdbGet<any>(`/movie/${id}`);
  return {
    id: m.id,
    title: m.title || m.original_title || "Sans titre",
    originalTitle: m.original_title || undefined,
    year: yearOf(m.release_date),
    runtime: m.runtime || undefined,
    posterUrl: tmdbImage(m.poster_path, "w342"),
    backdropUrl: tmdbImage(m.backdrop_path, "w780"),
    imdbId: m.imdb_id || undefined,
  };
}

// ---------- Séries (étape 2) ----------

export async function searchTV(query: string): Promise<SearchResult[]> {
  const data = await tmdbGet<{ results?: any[] }>("/search/tv", {
    query,
    include_adult: "false",
  });
  return (data.results ?? []).slice(0, 8).map((s) => ({
    id: s.id,
    title: s.name || s.original_name || "Sans titre",
    year: yearOf(s.first_air_date),
    posterUrl: tmdbImage(s.poster_path, "w185"),
  }));
}

export type TVDetails = {
  id: number;
  title: string;
  year?: number;
  posterUrl?: string;
  totalSeasons?: number;
  totalEpisodes?: number;
  seasons: { number: number; episodes: number }[];
};

export async function getTVDetails(id: number): Promise<TVDetails> {
  const s = await tmdbGet<any>(`/tv/${id}`);
  const seasons = (s.seasons ?? [])
    .filter((x: any) => x.season_number > 0)
    .map((x: any) => ({ number: x.season_number, episodes: x.episode_count ?? 0 }));
  return {
    id: s.id,
    title: s.name || s.original_name || "Sans titre",
    year: yearOf(s.first_air_date),
    posterUrl: tmdbImage(s.poster_path, "w342"),
    totalSeasons: s.number_of_seasons || undefined,
    totalEpisodes: s.number_of_episodes || undefined,
    seasons,
  };
}