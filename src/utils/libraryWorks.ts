import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadJSON } from "../hooks/useStorage";
import { getGames, initGames } from "../storage/game.store";
import { getMangas, initMangas } from "../storage/manga.store";
import { getPodcasts, initPodcasts } from "../storage/podcast.store";
import { Theme } from "../theme";
import { Anime } from "../types/anime";
import { animeProgress } from "./animeProgress";
import { Book } from "../types/book";
import { Movie } from "../types/movie";
import { WorkKey } from "../types/note";
import { TVShow } from "../types/tvshow";
import { formatLastRead } from "./mangaProgress";

export type LibraryWork = {
  key: WorkKey;
  id: string;
  title: string;
  meta: string;
  inProgress: boolean;
  updatedAt: number;
};

export const WORK_LABEL: Record<WorkKey, string> = {
  anime: "Animé",
  tv: "Série",
  movies: "Film",
  books: "Livre",
  manga: "Manga",
  games: "Jeu",
  podcast: "Podcast",
};

export function workColor(t: Theme, key: WorkKey): string {
  const map: Record<WorkKey, string> = {
    anime: t.media.anime,
    tv: t.media.tv,
    movies: t.media.movie,
    books: t.media.book,
    manga: t.media.manga,
    games: t.media.game,
    podcast: t.media.podcast,
  };
  return map[key];
}

// Début proposé pour un repère selon le type d'œuvre
export function markPrefix(key: WorkKey): string {
  if (key === "books" || key === "manga") return "p. ";
  if (key === "anime" || key === "tv" || key === "podcast") return "Ép. ";
  return "";
}

async function readAsyncList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

// Toute la bibliothèque, en lecture seule, pour lier une note à une œuvre
export async function loadLibraryWorks(): Promise<LibraryWork[]> {
  await Promise.all([initMangas(), initGames(), initPodcasts()]);
  const animes = await loadJSON<Anime[]>("listana.animes.v1", []);
  const books = await loadJSON<Book[]>("listana.books.v1", []);
  const tvshows = await readAsyncList<TVShow>("tvshows");
  const movies = await readAsyncList<Movie>("movies");
  const works: LibraryWork[] = [];

  for (const a of animes) {
    works.push({
      key: "anime",
      id: a.id,
      title: a.title,
      meta: animeProgress(a).short,
      inProgress: a.status === "watching",
      updatedAt: a.updatedAt ?? 0,
    });
  }
  for (const s of tvshows) {
    works.push({
      key: "tv",
      id: s.id,
      title: s.title,
      meta: `S${s.currentSeason ?? 1} Ép. ${s.currentEpisode ?? 0}`,
      inProgress: s.status === "watching",
      updatedAt: s.updatedAt ?? 0,
    });
  }
  for (const m of movies) {
    works.push({
      key: "movies",
      id: m.id,
      title: m.title,
      meta: m.year ? String(m.year) : "Film",
      inProgress: m.status === "watching",
      updatedAt: m.updatedAt ?? 0,
    });
  }
  for (const b of books) {
    works.push({
      key: "books",
      id: b.id,
      title: b.title,
      meta: b.currentPage ? `Page ${b.currentPage}${b.totalPages ? ` / ${b.totalPages}` : ""}` : "Livre",
      inProgress: b.status === "in_progress",
      updatedAt: b.updatedAt ?? 0,
    });
  }
  for (const m of getMangas()) {
    if (m.archived) continue;
    works.push({
      key: "manga",
      id: m.id,
      title: m.title || "Sans titre",
      meta: formatLastRead(m),
      inProgress: m.status === "reading",
      updatedAt: m.updatedAt ?? 0,
    });
  }
  for (const g of getGames()) {
    works.push({
      key: "games",
      id: g.id,
      title: g.title,
      meta: g.lastCheckpoint || g.platform || "Jeu",
      inProgress: g.status === "playing",
      updatedAt: Number(g.id) || 0,
    });
  }
  for (const p of getPodcasts()) {
    if (p.archived) continue;
    works.push({
      key: "podcast",
      id: p.id,
      title: p.title || "Sans titre",
      meta: p.lastEpisode ? `Dernier : ${p.lastEpisode}` : p.kind === "audiobook" ? "Livre audio" : "Podcast",
      inProgress: p.status === "listening",
      updatedAt: p.updatedAt ?? 0,
    });
  }

  return works.sort((a, b) => b.updatedAt - a.updatedAt);
}