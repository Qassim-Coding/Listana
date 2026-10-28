export type AnimeStatus = "planning" | "watching" | "done" | "dropped";

export type AnimeKind = "anime" | "film";

export type Anime = {
  id: string;
  title: string;
  year?: number;
  review?: string;
  startedAt?: string;
  endedAt?: string;
  kind: AnimeKind;
  status: AnimeStatus;

  // Progression
  // - Animé (série) : comme les séries TV, saison + épisode DANS la saison
  // - Film / OAV : simple compteur d'épisodes (currentEpisode / totalEpisodes)
  currentEpisode: number; // animé : épisode de la saison en cours ; film/OAV : épisode tout court
  totalEpisodes?: number; // nombre total d'épisodes (toutes saisons), pour info
  currentSeason?: number; // animé seulement (1 par défaut)
  totalSeasons?: number;
  episodesPerSeason?: number; // épisodes de la saison en cours (saisi ou fourni par TMDB)
  seasonEpisodes?: number[]; // épisodes de chaque saison (index 0 = saison 1), fourni par TMDB

  // Lien TMDB
  tmdbId?: number;
  tmdbType?: "tv" | "movie";
  posterUrl?: string;
  updatedAt: number;
};
