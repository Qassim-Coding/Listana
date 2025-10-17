import { Podcast, PodcastUpdate } from "../types/podcast";

let podcasts: Podcast[] = [];

export const PODCAST_STORAGE_KEY = "listana.podcast.v1";

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getPodcasts(): Podcast[] {
  return podcasts;
}

export function addPodcast(p: Podcast) {
  podcasts.push(p);
}

export function updatePodcast(id: string, changes: PodcastUpdate) {
  podcasts = podcasts.map((p) =>
    p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
  );
}

export function deletePodcast(id: string) {
  podcasts = podcasts.filter((p) => p.id !== id);
}

export function duplicatePodcastFrom(p: Podcast): Podcast {
  const now = Date.now();
  return {
    ...p,
    id: cryptoRandom(),
    title: `${p.title} (copie)`,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
}

export function searchPodcasts(items: Podcast[], q: string): Podcast[] {
  if (!q) return items;
  const s = q.trim().toLowerCase();
  return items.filter((p) =>
    (p.title || "").toLowerCase().includes(s) ||
    (p.host || "").toLowerCase().includes(s) ||
    (p.notes || "").toLowerCase().includes(s)
  );
}

export function sortPodcasts(items: Podcast[]): Podcast[] {
  return [...items]
    .filter((p) => !p.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}