export const PODCASTS_STORAGE_KEY = "listana.podcasts.v1";
lastPositionSec: init.lastPositionSec ?? 0,
listenedTotalSec: init.listenedTotalSec ?? 0,
lastListenedAt: init.lastListenedAt ?? null,
url: init.url ?? "",
feedUrl: init.feedUrl ?? "",
podcastApiId: init.podcastApiId ?? "",
notes: init.notes ?? "",
tags: init.tags ?? [],
createdAt: now,
updatedAt: now,
archived: false,
};
}


export function updatePodcast(items, id, patch) {
return items.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p));
}


export function deletePodcast(items, id) {
return items.filter((p) => p.id !== id);
}


export function duplicatePodcastFrom(p) {
const now = Date.now();
const baseTitle = p?.title?.trim() || "Sans titre";
return {
...p,
id: cryptoRandom(),
title: `${baseTitle} (copie)`,
createdAt: now,
updatedAt: now,
archived: false,
};
}


export function sortPodcasts(items) {
return [...items]
.filter((p) => !p.archived)
.sort((a, b) => b.updatedAt - a.updatedAt);
}


export function searchPodcasts(items, q) {
if (!q) return items;
const s = q.trim().toLowerCase();
return items.filter((p) =>
(p.title || "").toLowerCase().includes(s) ||
(p.show || "").toLowerCase().includes(s) ||
(p.episode || "").toLowerCase().includes(s) ||
(p.notes || "").toLowerCase().includes(s)
);
}


export function cryptoRandom() {
if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}