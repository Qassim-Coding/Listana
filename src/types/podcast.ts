export type PodcastStatus = "toListen" | "listening" | "completed" | "abandoned";
export type PodcastKind = "podcast" | "audiobook";

export interface Podcast {
  id: string;
  title: string;
  host?: string;
  status: PodcastStatus;
  kind?: PodcastKind; // default: "podcast"
  notes?: string;
  lastEpisode?: string;

  // Lien Apple Podcasts / Apple Books (optionnel)
  appleId?: number; // identifiant Apple de l'émission ou du livre audio (collectionId)
  coverUrl?: string; // pochette chargée depuis Apple
  storeUrl?: string; // fiche Apple : le lien « Écouter sur… » est obligatoire à côté de la pochette
  genre?: string;
  episodeCount?: number; // nombre d'épisodes annoncé par Apple (podcasts seulement)
  source?: "manual" | "apple";

  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export type PodcastUpdate = Partial<Podcast>;