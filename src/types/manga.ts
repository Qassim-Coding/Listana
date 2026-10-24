export type MangaStatus = "toRead" | "reading" | "completed" | "abandoned";

/**
 * Modèle principal d’un manga
 * - Aligné avec tes helpers existants (manga.js)
 * - Dates en nombre (timestamp ms) pour cohérence avec createdAt/updatedAt
 */
export interface Manga {
  id: string;
  title: string;
  series?: string;

  // Progression par volume/chapitre
  volumeNumber?: number;
  chapterNumber?: number;
  // Type de progression principale (tome vs chapitre)
  progressMode?: "volume" | "chapter";

  // Progression par pages
  pagesTotal?: number;
  pagesRead?: number;

  // Métadonnées
  status?: MangaStatus;
  notes?: string;
  lastChapter?: string;

  // Lien MyAnimeList (optionnel)
  malId?: number;
  coverUrl?: string;
  totalVolumes?: number; // nombre de tomes publiés (absent si série en cours)
  totalChapters?: number; // nombre de chapitres publiés (absent si série en cours)
  // "mal" = API officielle de MyAnimeList ; "jikan" = mangas ajoutés avant le changement (même identifiant MAL)
  source?: "manual" | "mal" | "jikan";

  // Gestion du cycle de vie
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

/**
 * Utilisé pour créer/mettre à jour partiellement un manga (ex: dans une modale).
 */
export type MangaUpdate = Partial<Manga>;