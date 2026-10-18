export type TVShow = {
  id: string;
  title: string;
  year?: number;
  review?: string;
  status: "planning" | "watching" | "done" | "dropped";
  startedAt?: string;
  finishedAt?: string;

  // Progression
  currentSeason: number;
  totalSeasons?: number;
  episodesPerSeason: number;
  currentEpisode: number;
  // Nombre d'épisodes de chaque saison (index 0 = saison 1), fourni par TMDB
  seasonEpisodes?: number[];

  // Historique simple (comme films/livres)
  history?: { episode: number; season: number; startedAt: string }[];

  // Lien TMDB
  tmdbId?: number;
  posterUrl?: string;

  source?: string; // "manual" | "tmdb"
  updatedAt: number;
};