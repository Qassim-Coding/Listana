import { Note, NoteUpdate } from "../types/note";
import { loadJSON, saveJSON } from "../hooks/useStorage";

let notes: Note[] = [];

export const NOTE_STORAGE_KEY = "listana.note.v1";

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getNotes(): Note[] {
  return notes;
}

export async function initNotes() {
  const loaded = await loadJSON<Note[]>(NOTE_STORAGE_KEY, []);
  notes = loaded;
}

export function addNote(n: Note) {
  notes.push(n);
  void saveJSON(NOTE_STORAGE_KEY, notes);
}

export function updateNote(id: string, changes: NoteUpdate) {
  notes = notes.map((n) =>
    n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n
  );
  void saveJSON(NOTE_STORAGE_KEY, notes);
}

export function deleteNote(id: string) {
  notes = notes.filter((n) => n.id !== id);
  void saveJSON(NOTE_STORAGE_KEY, notes);
}

export function duplicateNoteFrom(n: Note): Note {
  const now = Date.now();
  return {
    ...n,
    id: cryptoRandom(),
    title: `${n.title} (copie)`,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
}

export function searchNotes(items: Note[], q: string): Note[] {
  if (!q) return items;
  const s = q.trim().toLowerCase();
  return items.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(s) ||
      (n.content || "").toLowerCase().includes(s)
  );
}

export function sortNotes(items: Note[]): Note[] {
  return [...items]
    .filter((n) => !n.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
