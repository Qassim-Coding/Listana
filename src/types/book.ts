export type BookStatus = "planning" | "in_progress" | "done" | "abandoned";

export type Book = {
  id: string;
  title: string;
  author?: string;
  // Les pages qui sont OPTIONNELLES
  totalPages?: number;
  currentPage?: number;
  notes?: string;

  status: BookStatus; // dérivé de la page, sauf « abandoned » (choisi à la main)
  startedAt?: number; // timestamp ms (set quand currentPage > 0 ou manuel plus tard)
  finishedAt?: number; // timestamp ms (set quand status passe à "done")
  updatedAt: number; // pour trier "récemment modifié"

  // Lien Open Library (optionnel)
  coverUrl?: string;
  olKey?: string; // ex. "/works/OL27448W"
  year?: number; // année de première publication
  source?: "manual" | "openlibrary";
};

// Champs modifiables depuis le formulaire
export type BookInput = {
  title: string;
  author?: string;
  totalPages?: number;
  notes?: string;
  coverUrl?: string;
  olKey?: string;
  year?: number;
};