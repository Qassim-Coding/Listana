export type AnimeStatus = "planning" | "watching" | "done" | "dropped";

export type AnimeKind = "anime" | "film";

export type Anime = {
  id: string;
  title: string;
  year?: number;
  review?: string;
  startedAt?: string;
  endedAt?: string;
  currentEpisode: number;
  totalEpisodes?: number;
  kind: AnimeKind;
  status: AnimeStatus;
  // Lien TMDB
  tmdbId?: number;
  tmdbType?: "tv" | "movie";
  posterUrl?: string;
  updatedAt: number;
};