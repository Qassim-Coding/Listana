export const MANGA_STORAGE_KEY = "listana.manga.v1";


export function duplicateMangaFrom(m) {
const now = Date.now();
const baseTitle = m?.title?.trim() || "Sans titre";
return { ...m, id: cryptoRandom(), title: `${baseTitle} (copie)`, createdAt: now, updatedAt: now, archived: false };
}


export function sortManga(items) {
return [...items]
.filter((m) => !m.archived)
.sort((a, b) => b.updatedAt - a.updatedAt);
}


export function searchManga(items, q) {
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


export function progressPct(m) {
const total = m.pagesTotal || 0;
const read = Math.min(m.pagesRead || 0, total);
return total > 0 ? Math.round((read / total) * 100) : 0;
}


export function cryptoRandom() {
if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}