// src/hooks/useAnimes.ts
import { useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "./useStorage";
import { Anime, AnimeStatus } from "../types/anime";

const STORAGE_KEY = "listana.animes.v1";

export function useAnimes() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnimeStatus | "all">("all");
  const [sort, setSort] = useState<"date" | "title" | "status">("date");

  useEffect(() => {
    (async () => {
      const data = await loadJSON<Anime[]>(STORAGE_KEY, []);
      setAnimes(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE_KEY, animes);
  }, [animes, loading]);

  const visibleAnimes = useMemo(() => {
    const filtered = animes.filter((a) => (filter === "all" ? true : a.status === filter));
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.updatedAt - a.updatedAt; // date desc
    });
    return sorted;
  }, [animes, filter, sort]);

  function addAnime(data: Omit<Anime, "id" | "updatedAt" | "status">) {
    const now = Date.now();
    const newAnime: Anime = {
      ...data,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      status: "planning",
      updatedAt: now,
    } as Anime; // assume required fields provided by modal
    setAnimes((prev) => [newAnime, ...prev]);
  }

  function updateAnime(id: string, changes: Partial<Anime>) {
    setAnimes((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...changes, updatedAt: Date.now() } : a
      )
    );
  }

  function removeAnime(id: string) {
    setAnimes((prev) => prev.filter((a) => a.id !== id));
  }

  function markDone(id: string) {
    updateAnime(id, { status: "done", endedAt: new Date().toISOString() });
  }

  function incrementEpisode(id: string) {
    setAnimes((prev) => {
      const arr = prev.map((a) => {
        if (a.id !== id) return a;
        const total = a.totalEpisodes;
        if (total && a.currentEpisode >= total) {
          // Déjà au maximum: ne pas dépasser; marquer terminé si pas déjà fait
          if (a.status !== "done") {
            return {
              ...a,
              status: "done",
              endedAt: a.endedAt ?? new Date().toISOString(),
              updatedAt: Date.now(),
            };
          }
          return a; // aucun changement
        }

        const next = a.currentEpisode + 1;
        const clamped = total ? Math.min(next, total) : next;
        const isDone = !!total && clamped >= total;
        return {
          ...a,
          currentEpisode: clamped,
          ...(isDone ? { status: "done", endedAt: a.endedAt ?? new Date().toISOString() } : {}),
          updatedAt: Date.now(),
        };
      });
      return arr;
    });
  }

  function startEpisode(id: string) {
    updateAnime(id, { status: "watching" });
  }

  return {
    animes,
    visibleAnimes,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    addAnime,
    updateAnime,
    removeAnime,
    markDone,
    incrementEpisode,
    startEpisode,
  };
}
