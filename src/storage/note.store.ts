import { loadJSON, saveJSON } from "../hooks/useStorage";
import { ChecklistItem, Note, NoteKind, NoteUpdate, noteKind } from "../types/note";

export const NOTE_STORAGE_KEY = "listana.note.v1";

let notes: Note[] = [];
let loaded = false;
let loading: Promise<void> | null = null;

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getNotes(): Note[] {
  return notes;
}

// Charge une seule fois, sans écraser ce qui aurait été ajouté entre-temps
export function initNotes(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      const stored = await loadJSON<Note[]>(NOTE_STORAGE_KEY, []);
      const known = new Set(notes.map((n) => n.id));
      const fromDisk = (Array.isArray(stored) ? stored : []).filter((n) => !known.has(n.id));
      notes = [...notes, ...fromDisk];
      loaded = true;
    })();
  }
  return loading;
}

async function persist() {
  await initNotes();
  await saveJSON(NOTE_STORAGE_KEY, notes);
}

// Texte d'une liste, gardé dans "content" pour la recherche et l'accueil
function listText(items?: ChecklistItem[]): string {
  return (items ?? []).map((i) => `${i.done ? "☑" : "☐"} ${i.text}`).join("\n");
}

function withDerived(n: Note): Note {
  return noteKind(n) === "list" ? { ...n, content: listText(n.items) } : n;
}

export function createNote(kind: NoteKind, data: NoteUpdate = {}): Note {
  const now = Date.now();
  const note = withDerived({
    title: "",
    content: "",
    items: kind === "list" ? [] : undefined,
    marks: kind === "work" ? [] : undefined,
    ...data,
    id: newId(),
    kind,
    createdAt: now,
    updatedAt: now,
    archived: false,
  });
  notes = [note, ...notes];
  void persist();
  return note;
}

// Ancienne fonction, gardée par compatibilité
export function addNote(n: Note) {
  notes = [withDerived(n), ...notes];
  void persist();
}

export function updateNote(id: string, changes: NoteUpdate) {
  notes = notes.map((n) => (n.id === id ? withDerived({ ...n, ...changes, updatedAt: Date.now() }) : n));
  void persist();
}

export function deleteNote(id: string) {
  notes = notes.filter((n) => n.id !== id);
  void persist();
}

export function duplicateNote(n: Note): Note {
  return createNote(noteKind(n), {
    title: `${n.title || "Sans titre"} (copie)`,
    content: n.content,
    work: n.work,
    items: n.items?.map((i) => ({ ...i, id: newId() })),
    marks: n.marks?.map((m) => ({ ...m, id: newId() })),
  });
}

// La liste modifiée le plus récemment (cible de « Ajouter à la liste »)
export function latestList(): Note | undefined {
  return sortNotes(notes.filter((n) => noteKind(n) === "list"))[0];
}

export function appendToList(listId: string, text: string) {
  const list = notes.find((n) => n.id === listId);
  if (!list) return;
  const items = [...(list.items ?? []), { id: newId(), text: text.trim(), done: false }];
  updateNote(listId, { items });
}

export function searchNotes(items: Note[], q: string): Note[] {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((n) =>
    [n.title, n.content, n.work?.title, ...(n.marks ?? []).map((m) => `${m.label} ${m.text}`)]
      .filter(Boolean)
      .some((x) => (x as string).toLowerCase().includes(s))
  );
}

export function sortNotes(items: Note[]): Note[] {
  return [...items].filter((n) => !n.archived).sort((a, b) => b.updatedAt - a.updatedAt);
}