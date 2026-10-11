import { loadJSON, saveJSON } from "../hooks/useStorage";
import { Manga, MangaUpdate } from "../types/manga";

let mangas: Manga[] = [];
let loaded = false;
let loading: Promise<void> | null = null;

export const MANGA_STORAGE_KEY = "listana.manga.v1";

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Charge la liste sauvegardée une seule fois (appelé par MangasScreen)
export function initMangas(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = loadJSON<Manga[]>(MANGA_STORAGE_KEY, []).then((stored) => {
      const storedIds = new Set(stored.map((m) => m.id));
      mangas = [...stored, ...mangas.filter((m) => !storedIds.has(m.id))];
      loaded = true;
    });
  }
  return loading;
}

// Sauvegarde après le chargement, pour ne jamais écraser avec une liste vide
async function persist() {
  await initMangas();
  await saveJSON(MANGA_STORAGE_KEY, mangas);
}

export function addManga(m: Manga) {
  mangas.push(m);
  void persist();
}

export function updateManga(id: string, changes: MangaUpdate) {
  mangas = mangas.map((m) =>
    m.id === id ? { ...m, ...changes, updatedAt: Date.now() } : m
  );
  void persist();
}

export function deleteManga(id: string) {
  mangas = mangas.filter((m) => m.id !== id);
  void persist();
}

export function getMangas(): Manga[] {
  return mangas;
}

export function duplicateMangaFrom(m: Manga): Manga {
  const now = Date.now();
  const baseTitle = m?.title?.trim() || "Sans titre";
  return {
    ...m,
    id: cryptoRandom(),
    title: `${baseTitle} (copie)`,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
}

export function sortMangas(items: Manga[]): Manga[] {
  return [...items]
    .filter((m) => !m.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function searchMangas(items: Manga[], q: string): Manga[] {
  if (!q) return items;
  const s = q.trim().toLowerCase();
  return items.filter(
    (m) =>
      (m.title || "").toLowerCase().includes(s) ||
      (m.series || "").toLowerCase().includes(s) ||
      String(m.volumeNumber || "").toLowerCase().includes(s) ||
      String(m.chapterNumber || "").toLowerCase().includes(s) ||
      (m.notes || "").toLowerCase().includes(s)
  );
}

export function progressPct(m: Manga): number {
  const total = m.pagesTotal || 0;
  const read = Math.min(m.pagesRead || 0, total);
  return total > 0 ? Math.round((read / total) * 100) : 0;
}