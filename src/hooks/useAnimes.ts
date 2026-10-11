import { useEffect, useMemo, useState } from "react";
import { Anime, AnimeStatus } from "../types/anime";
import { loadJSON, saveJSON } from "./useStorage";

const STORAGE_KEY = "listana.animes.v1";

export const ANIME_STATUS_LABEL: Record<AnimeStatus, string> = {
  planning: "À voir",
  watching: "En cours",
  done: "Terminé",
  dropped: "Abandonné",
};

// Valeurs écrites par l'ancien formulaire d'édition, converties au chargement
const LEGACY_STATUS: Record<string, AnimeStatus> = {
  toWatch: "planning",
  completed: "done",
  abandoned: "dropped",
};

function normalize(a: Anime): Anime {
  const fixed = LEGACY_STATUS[a.status as string];
  return fixed ? { ...a, status: fixed } : a;
}

export type NewAnime = Omit<Anime, "id" | "updatedAt" | "status"> & {
  status?: AnimeStatus;
};

export function useAnimes() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnimeStatus | "all">("all");
  const [sort, setSort] = useState<"date" | "title" | "status">("date");

  useEffect(() => {
    (async () => {
      const data = await loadJSON<Anime[]>(STORAGE_KEY, []);
      setAnimes(data.map(normalize));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE_KEY, animes);
  }, [animes, loading]);

  const visibleAnimes = useMemo(() => {
    const filtered = animes.filter((a) => (filter === "all" ? true : a.status === filter));
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.updatedAt - a.updatedAt;
    });
  }, [animes, filter, sort]);

  function addAnime(data: NewAnime) {
    const now = Date.now();
    const { status, ...rest } = data;
    const newAnime: Anime = {
      ...rest,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      status: status ?? (rest.currentEpisode > 0 ? "watching" : "planning"),
      updatedAt: now,
    };
    setAnimes((prev) => [newAnime, ...prev]);
  }

  function updateAnime(id: string, changes: Partial<Anime>) {
    setAnimes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes, updatedAt: Date.now() } : a))
    );
  }

  function removeAnime(id: string) {
    setAnimes((prev) => prev.filter((a) => a.id !== id));
  }

  function markDone(id: string) {
    updateAnime(id, { status: "done", endedAt: new Date().toISOString() });
  }

  function incrementEpisode(id: string) {
    setAnimes((prev) =>
      prev.map((a): Anime => {
        if (a.id !== id) return a;
        const total = a.totalEpisodes;
        if (total && a.currentEpisode >= total) {
          if (a.status === "done") return a;
          return {
            ...a,
            status: "done",
            endedAt: a.endedAt ?? new Date().toISOString(),
            updatedAt: Date.now(),
          };
        }
        const next = total ? Math.min(a.currentEpisode + 1, total) : a.currentEpisode + 1;
        const isDone = !!total && next >= total;
        return {
          ...a,
          currentEpisode: next,
          status: isDone ? "done" : a.status === "planning" ? "watching" : a.status,
          endedAt: isDone ? a.endedAt ?? new Date().toISOString() : a.endedAt,
          startedAt: a.startedAt ?? new Date().toISOString(),
          updatedAt: Date.now(),
        };
      })
    );
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