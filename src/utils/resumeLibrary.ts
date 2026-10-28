import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadJSON } from "../hooks/useStorage";
import { getGames, initGames } from "../storage/game.store";
import { getMangas, initMangas } from "../storage/manga.store";
import { getPodcasts, initPodcasts } from "../storage/podcast.store";
import { Anime } from "../types/anime";
import { Book } from "../types/book";
import { Movie } from "../types/movie";
import { Note } from "../types/note";
import { TVShow } from "../types/tvshow";
import { animeProgress } from "./animeProgress";
import { formatLastRead } from "./mangaProgress";

// Lecture de toute la bibliothèque pour « Reprendre » : utilisée par l'accueil ET par le widget Android.
// Aucune dépendance à l'écran (pas de hook) : le widget peut l'appeler en arrière-plan, app fermée.

export type ResumeItem = {
  id: string;
  mediaKey: "anime" | "tv" | "movies" | "books" | "manga" | "games" | "podcast";
  title: string;
  meta: string;
  pct: number | null; // 0 à 100, null si aucun total connu
  updatedAt: number;
};

export type LibraryStats = {
  counts: Record<string, number>; // nombre d'éléments par catégorie (clé = route)
  inProgress: number;
  done: number;
};

export const EMPTY_STATS: LibraryStats = { counts: {}, inProgress: 0, done: 0 };

async function readAsyncList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function pctOf(current?: number, total?: number): number | null {
  if (!total || total <= 0) return null;
  const p = Math.round(((current ?? 0) / total) * 100);
  return Math.max(0, Math.min(100, p));
}

// "En cours" = statut en cours, ou pas fini/abandonné mais déjà commencé
function isStarted(status: string, progress?: number): boolean {
  if (status === "watching") return true;
  if (status === "done" || status === "dropped") return false;
  return (progress ?? 0) > 0;
}

export async function loadResumeLibrary(): Promise<{ items: ResumeItem[]; stats: LibraryStats }> {
  await Promise.all([initMangas(), initGames(), initPodcasts()]);
  const animes = await loadJSON<Anime[]>("listana.animes.v1", []);
  const books = await loadJSON<Book[]>("listana.books.v1", []);
  // Lecture seule : on ne touche pas à la liste en mémoire du bloc-notes
  const notes = await loadJSON<Note[]>("listana.note.v1", []);
  const tvshows = await readAsyncList<TVShow>("tvshows");
  const movies = await readAsyncList<Movie>("movies");
  const mangas = getMangas().filter((m) => !m.archived);
  const games = getGames();
  const podcasts = getPodcasts().filter((p) => !p.archived);

  const items: ResumeItem[] = [];

  for (const a of animes) {
    if (!isStarted(a.status, a.currentEpisode)) continue;
    // Saison + épisode (animé) ou compteur (film / OAV), calculé au même endroit que la carte
    const progress = animeProgress(a);
    items.push({
      id: `anime-${a.id}`,
      mediaKey: "anime",
      title: a.title,
      meta: progress.short,
      pct: progress.pct,
      updatedAt: a.updatedAt ?? 0,
    });
  }

  for (const s of tvshows) {
    if (!isStarted(s.status, s.currentEpisode)) continue;
    const perSeason = s.episodesPerSeason || 0;
    items.push({
      id: `tv-${s.id}`,
      mediaKey: "tv",
      title: s.title,
      meta: `S${s.currentSeason ?? 1} · Ép. ${s.currentEpisode ?? 0}${perSeason ? ` / ${perSeason}` : ""}`,
      pct: pctOf(s.currentEpisode, perSeason),
      updatedAt: s.updatedAt ?? 0,
    });
  }

  for (const m of movies) {
    if (!isStarted(m.status, m.progressMinutes)) continue;
    const progress = m.progressMinutes ?? 0;
    items.push({
      id: `movie-${m.id}`,
      mediaKey: "movies",
      title: m.title,
      meta: m.runtime ? `${progress} / ${m.runtime} min` : `${progress} min`,
      pct: pctOf(progress, m.runtime),
      updatedAt: m.updatedAt ?? 0,
    });
  }

  for (const b of books) {
    if (b.status !== "in_progress") continue;
    items.push({
      id: `book-${b.id}`,
      mediaKey: "books",
      title: b.title,
      meta: b.totalPages ? `Page ${b.currentPage ?? 0} / ${b.totalPages}` : `Page ${b.currentPage ?? 0}`,
      pct: pctOf(b.currentPage, b.totalPages),
      updatedAt: b.updatedAt ?? 0,
    });
  }

  for (const m of mangas) {
    if (m.status !== "reading") continue;
    items.push({
      id: `manga-${m.id}`,
      mediaKey: "manga",
      title: m.title,
      meta: formatLastRead(m),
      pct: pctOf(m.pagesRead, m.pagesTotal),
      updatedAt: m.updatedAt ?? 0,
    });
  }

  for (const g of games) {
    if (g.status !== "playing") continue;
    items.push({
      id: `game-${g.id}`,
      mediaKey: "games",
      title: g.title,
      meta: g.lastCheckpoint || g.platform || "En cours",
      pct: null,
      updatedAt: (g as any).updatedAt ?? (Number(g.id) || 0),
    });
  }

  for (const p of podcasts) {
    if (p.status !== "listening") continue;
    items.push({
      id: `podcast-${p.id}`,
      mediaKey: "podcast",
      title: p.title,
      meta: p.lastEpisode
        ? `Dernier épisode : ${p.lastEpisode}`
        : p.kind === "audiobook"
        ? "Livre audio"
        : "Podcast",
      pct: null,
      updatedAt: p.updatedAt ?? 0,
    });
  }

  const sorted = items.sort((a, b) => b.updatedAt - a.updatedAt);

  const done =
    animes.filter((a) => a.status === "done").length +
    tvshows.filter((s) => s.status === "done").length +
    movies.filter((m) => m.status === "done").length +
    books.filter((b) => b.status === "done").length +
    mangas.filter((m) => m.status === "completed").length +
    games.filter((g) => g.status === "completed").length +
    podcasts.filter((p) => p.status === "completed").length;

  const counts: Record<string, number> = {
    anime: animes.length,
    tv: tvshows.length,
    movies: movies.length,
    books: books.length,
    manga: mangas.length,
    games: games.length,
    podcast: podcasts.length,
    note: notes.filter((n) => !n.archived).length,
  };

  return {
    items: sorted.slice(0, 10),
    stats: { counts, inProgress: sorted.length, done },
  };
}
