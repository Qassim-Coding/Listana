export type Movie = {
  id: string; // interne
  title: string;
  originalTitle?: string;
  year?: number;
  runtime?: number; // durée en minutes
  progressMinutes?: number;
  status: "planning" | "watching" | "done" | "dropped";
  startedAt?: string; // date ISO
  rating?: number; // 0-5
  review?: string;
  tags?: string[];
  posterUrl?: string;
  backdropUrl?: string;
  tmdbId?: number;
  imdbId?: string;
  source: "manual" | "tmdb";
  lastSyncedAt?: number;
  dirty?: boolean;
  updatedAt: number;
  finishedAt?: number;
};