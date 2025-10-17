export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export type NoteUpdate = Partial<Note>;