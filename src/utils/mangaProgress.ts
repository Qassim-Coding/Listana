import { Manga, MangaStatus } from "../types/manga";

export type MangaUnit = "volume" | "chapter";

export const MANGA_STATUS_LABEL: Record<MangaStatus, string> = {
  toRead: "À lire",
  reading: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
};

export function mangaUnit(m: Manga): MangaUnit {
  return m.progressMode === "volume" ? "volume" : "chapter";
}

export function unitTitle(mode: MangaUnit): string {
  return mode === "volume" ? "Tome" : "Chapitre";
}

export function unitWord(mode: MangaUnit, count: number): string {
  const base = mode === "volume" ? "tome" : "chapitre";
  return Math.abs(count) > 1 ? `${base}s` : base;
}

// Dernier nombre trouvé dans "Dernier lu" (ex. "Tome 22" → 22, "190" → 190)
export function lastReadNumber(m: Manga): number {
  const raw = m.lastChapter ?? "";
  const match = raw.match(/(\d+)(?!.*\d)/);
  if (match) return parseInt(match[1], 10);
  const fallback = Number(m.progressMode === "volume" ? m.volumeNumber : m.chapterNumber);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
}

export function formatLastRead(m: Manga): string {
  const raw = (m.lastChapter ?? "").trim();
  if (raw && /^\d+$/.test(raw)) return `${unitTitle(mangaUnit(m))} ${raw}`;
  if (raw) return raw;
  if (m.chapterNumber) return `Chapitre ${m.chapterNumber}`;
  if (m.volumeNumber) return `Tome ${m.volumeNumber}`;
  return "Pas encore commencé";
}