import { useEffect, useMemo, useState } from "react";
import { Anime, AnimeStatus } from "../types/anime";
import { episodesOf, isSeasonal } from "../utils/animeProgress";
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
  let next: Anime = fixed ? { ...a, status: fixed } : a;
  // Anciens animés (avant les saisons) : tout est rangé en « saison 1 », avec le même total qu'avant.
  // Les vraies saisons arrivent quand on ouvre l'animé (s'il est relié à TMDB) ou en les saisissant.
  if (isSeasonal(next) && next.currentSeason == null) {
    next = { ...next, currentSeason: 1, episodesPerSeason: next.episodesPerSeason ?? next.totalEpisodes ?? 0 };
  }
  return next;
}

export type NewAnime = Omit<Anime, "id" | "updatedAt" | "status"> & {
  status?: AnimeStatus;
};

// +1 sur un film / OAV : simple compteur, terminé au dernier épisode
function incrementFilm(a: Anime): Anime {
  const total = a.totalEpisodes;
  if (total && a.currentEpisode >= total) {
    if (a.status === "done") return a;
    return { ...a, status: "done", endedAt: a.endedAt ?? new Date().toISOString(), updatedAt: Date.now() };
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
}

// +1 sur un animé (série) : comme les séries TV. En fin de saison, on passe à la saison
// suivante avec SON nombre d'épisodes (20 puis 13, par exemple), et en fin de dernière
// saison l'animé est terminé.
function incrementSeasonal(a: Anime): Anime {
  const now = new Date().toISOString();
  let season = a.currentSeason || 1;
  let per = episodesOf(a, season);
  let episode = (a.currentEpisode ?? 0) + 1;
  let status: AnimeStatus = a.status === "done" ? "done" : "watching";
  let endedAt = a.endedAt;

  if (per > 0 && episode > per) {
    const isLastSeason = !!a.totalSeasons && season >= a.totalSeasons;
    if (isLastSeason) {
      episode = per;
    } else {
      season += 1;
      episode = 1;
      per = a.seasonEpisodes?.[season - 1] || a.episodesPerSeason || 0;
    }
  }

  if (per > 0 && a.totalSeasons && season >= a.totalSeasons && episode >= per) {
    status = "done";
    endedAt = endedAt ?? now;
  }

  return {
    ...a,
    currentSeason: season,
    currentEpisode: episode,
    episodesPerSeason: per || a.episodesPerSeason,
    status,
    endedAt,
    startedAt: a.startedAt ?? now,
    updatedAt: Date.now(),
  };
}

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
    const newAnime: Anime = normalize({
      ...rest,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      status: status ?? (rest.currentEpisode > 0 ? "watching" : "planning"),
      updatedAt: now,
    });
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
        return isSeasonal(a) ? incrementSeasonal(a) : incrementFilm(a);
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
