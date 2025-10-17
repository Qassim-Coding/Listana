export type BookStatus = "planning" | "in_progress" | "done";

export type Book = {
  id: string;
  title: string;
  author?: string;
  // Les pages qui sont OPTIONNELLES
  totalPages?: number;
  currentPage?: number;   
  notes?: string;

  status: BookStatus;      // dérivé automatiquement
  startedAt?: number;      // timestamp ms (set quand currentPage > 0 ou manuel plus tard)
  finishedAt?: number;     // timestamp ms (set quand status passe à "done")
  updatedAt: number;       // pour trier "récemment modifié"
};
