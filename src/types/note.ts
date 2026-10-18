export type NoteKind = "free" | "list" | "work";

export type WorkKey = "anime" | "tv" | "movies" | "books" | "manga" | "games" | "podcast";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

// Repère dans une œuvre : "p. 134", "Ép. 14, 12:34"…
export type NoteMark = {
  id: string;
  label: string;
  text: string;
};

// Œuvre liée (copie du titre au moment du lien, pour l'afficher même si l'œuvre est supprimée)
export type NoteWork = {
  key: WorkKey;
  id: string;
  title: string;
  meta?: string;
};

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  // Nouveaux champs (absents sur les anciennes notes = note libre)
  kind?: NoteKind;
  items?: ChecklistItem[];
  work?: NoteWork;
  marks?: NoteMark[];
}

export type NoteUpdate = Partial<Note>;

export function noteKind(n: Note): NoteKind {
  return n.kind ?? "free";
}