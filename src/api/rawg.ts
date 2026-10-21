import { GameGenre, GamePlatform } from "../types/game";

// RAWG : recherche de jeux vidéo (clé gratuite, usage non commercial)
const BASE = "https://api.rawg.io/api";
const KEY = process.env.EXPO_PUBLIC_RAWG_KEY;

export const RAWG_URL = "https://rawg.io";

export type GameSearchResult = {
  id: number;
  title: string;
  year?: number;
  posterUrl?: string;
  subtitle?: string; // plateformes, affichées sous le titre dans les résultats
  released?: string; // "AAAA-MM-JJ"
  platforms: string[];
  genres: string[];
};

export function hasRawgKey(): boolean {
  return !!KEY;
}

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  if (!KEY) throw new Error("Clé RAWG manquante");
  const url = `${BASE}/games?${toQuery({ key: KEY, search: query, page_size: "8" })}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 401 || res.status === 403) throw new Error("Clé RAWG refusée, vérifie-la");
  if (res.status === 429) throw new Error("Trop de recherches, réessaie dans un instant");
  if (!res.ok) throw new Error(`Erreur RAWG (${res.status})`);
  const data = (await res.json()) as { results?: any[] };

  return (data.results ?? []).map((g) => {
    const platforms: string[] = (g.platforms ?? [])
      .map((p: any) => p?.platform?.name)
      .filter((n: unknown): n is string => typeof n === "string");
    const genres: string[] = (g.genres ?? [])
      .map((x: any) => x?.name)
      .filter((n: unknown): n is string => typeof n === "string");
    const released = typeof g.released === "string" ? g.released : undefined;
    const year = parseInt((released ?? "").slice(0, 4), 10);
    return {
      id: Number(g.id),
      title: g.name || "Sans titre",
      year: Number.isFinite(year) ? year : undefined,
      posterUrl: g.background_image || undefined,
      subtitle: platforms.slice(0, 3).join(", ") || undefined,
      released,
      platforms,
      genres,
    };
  });
}

// Plateforme RAWG → plateforme de Listana (la première qui correspond)
export function mapPlatform(names: string[]): GamePlatform | undefined {
  for (const raw of names) {
    const n = raw.toLowerCase();
    if (n === "pc" || n === "macos" || n === "linux") return "PC";
    if (n.startsWith("playstation")) return "PS5";
    if (n.startsWith("xbox")) return "Xbox";
    if (n.startsWith("nintendo") || n.startsWith("wii") || n.startsWith("game boy")) return "Nintendo";
    if (n === "ios" || n === "android") return "Mobile";
  }
  return undefined;
}

// Genre RAWG → genre de Listana (sinon on garde celui choisi)
export function mapGenre(names: string[]): GameGenre | undefined {
  const lower = names.map((n) => n.toLowerCase());
  if (lower.includes("rpg")) return "RPG";
  if (lower.includes("shooter")) return "FPS";
  if (lower.includes("indie")) return "indé";
  return undefined;
}