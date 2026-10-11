import { loadJSON, saveJSON } from "../hooks/useStorage";
import { Podcast, PodcastUpdate } from "../types/podcast";

let podcasts: Podcast[] = [];
let loaded = false;
let loading: Promise<void> | null = null;

export const PODCAST_STORAGE_KEY = "listana.podcast.v1";

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Charge la liste sauvegardée (une seule fois).
// À appeler au montage de l'écran Podcasts avant d'afficher la liste.
export function initPodcasts(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = loadJSON<Podcast[]>(PODCAST_STORAGE_KEY, []).then((stored) => {
      const storedIds = new Set(stored.map((p) => p.id));
      // Garde les podcasts ajoutés en mémoire avant la fin du chargement
      podcasts = [...stored, ...podcasts.filter((p) => !storedIds.has(p.id))];
      loaded = true;
    });
  }
  return loading;
}

// Sauvegarde toujours après le chargement, pour ne jamais écraser
// la liste enregistrée avec une liste vide.
async function persist() {
  await initPodcasts();
  await saveJSON(PODCAST_STORAGE_KEY, podcasts);
}

export function getPodcasts(): Podcast[] {
  return podcasts;
}

export function addPodcast(p: Podcast) {
  podcasts.push(p);
  void persist();
}

export function updatePodcast(id: string, changes: PodcastUpdate) {
  podcasts = podcasts.map((p) =>
    p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
  );
  void persist();
}

export function deletePodcast(id: string) {
  podcasts = podcasts.filter((p) => p.id !== id);
  void persist();
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
  return items.filter(
    (p) =>
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