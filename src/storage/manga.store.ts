import { Manga, MangaUpdate } from "../types/manga";

let mangas: Manga[] = [];

export const MANGA_STORAGE_KEY = "listana.manga.v1";

/**
 * Génère un ID unique
 */
function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Ajoute un manga
 */
export function addManga(m: Manga) {
  mangas.push(m);
}

/**
 * Met à jour un manga
 */
export function updateManga(id: string, changes: MangaUpdate) {
  mangas = mangas.map((m) => (m.id === id ? { ...m, ...changes, updatedAt: Date.now() } : m));
}

/**
 * Supprime un manga
 */
export function deleteManga(id: string) {
  mangas = mangas.filter((m) => m.id !== id);
}

/**
 * Récupère tous les mangas
 */
export function getMangas(): Manga[] {
  return mangas;
}

/**
 * Duplique un manga
 */
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

/**
 * Trie les mangas par date de mise à jour
 */
export function sortMangas(items: Manga[]): Manga[] {
  return [...items]
    .filter((m) => !m.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Recherche dans les mangas
 */
export function searchMangas(items: Manga[], q: string): Manga[] {
  if (!q) return items;
  const s = q.trim().toLowerCase();
  return items.filter((m) =>
    (m.title || "").toLowerCase().includes(s) ||
    (m.series || "").toLowerCase().includes(s) ||
    String(m.volumeNumber || "").toLowerCase().includes(s) ||
    String(m.chapterNumber || "").toLowerCase().includes(s) ||
    (m.notes || "").toLowerCase().includes(s)
  );
}

/**
 * Calcule le pourcentage de progression
 */
export function progressPct(m: Manga): number {
  const total = m.pagesTotal || 0;
  const read = Math.min(m.pagesRead || 0, total);
  return total > 0 ? Math.round((read / total) * 100) : 0;
}