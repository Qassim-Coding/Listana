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

  // Historique simple (comme films/livres)
  history?: { episode: number; season: number; startedAt: string }[];

  source?: string; // optionnel
  updatedAt: number;
};