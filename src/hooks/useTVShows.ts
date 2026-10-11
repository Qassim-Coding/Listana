import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useState } from "react";
import { TVShow } from "../types/tvshow";

type Status = TVShow["status"];
type FilterKey = "all" | Status;
type SortKey = "date" | "title" | "status";

const STORAGE_KEY = "tvshows";

export const TV_STATUS_LABEL: Record<Status, string> = {
  planning: "À voir",
  watching: "En cours",
  done: "Terminé",
  dropped: "Abandonné",
};

export type NewTVShow = Partial<TVShow> & { title: string };

export function useTVShows() {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setShows(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Sauvegarde après chaque changement (même format qu'avant)
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(shows)).catch(() => {});
  }, [shows, loading]);

  function addShow(show: NewTVShow) {
    const currentEpisode = show.currentEpisode ?? 0;
    const newShow: TVShow = {
      id: nanoid(),
      title: show.title || "Série sans titre",
      year: show.year,
      review: show.review ?? "",
      status: show.status ?? (currentEpisode > 0 ? "watching" : "planning"),
      startedAt: show.startedAt ?? new Date().toISOString(),
      finishedAt: show.finishedAt,
      currentSeason: show.currentSeason ?? 1,
      totalSeasons: show.totalSeasons,
      episodesPerSeason: show.episodesPerSeason ?? 0,
      currentEpisode,
      history: [],
      source: show.source,
      updatedAt: Date.now(),
    };
    setShows((prev) => [newShow, ...prev]);
  }

  function updateShow(id: string, changes: Partial<TVShow>) {
    setShows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes, updatedAt: Date.now() } : s))
    );
  }

  function removeShow(id: string) {
    setShows((prev) => prev.filter((s) => s.id !== id));
  }

  function markDone(id: string) {
    updateShow(id, { status: "done", finishedAt: new Date().toISOString() });
  }

  // +1 épisode : passe à la saison suivante en fin de saison,
  // et termine la série en fin de dernière saison (si le total est connu)
  function incrementEpisode(id: string) {
    setShows((prev) =>
      prev.map((s): TVShow => {
        if (s.id !== id) return s;
        const now = new Date().toISOString();
        const per = s.episodesPerSeason || 0;
        let season = s.currentSeason || 1;
        let episode = (s.currentEpisode ?? 0) + 1;
        let status: Status = s.status === "done" ? "done" : "watching";
        let finishedAt = s.finishedAt;

        if (per > 0 && episode > per) {
          const isLastSeason = !!s.totalSeasons && season >= s.totalSeasons;
          if (isLastSeason) {
            episode = per;
          } else {
            season += 1;
            episode = 1;
          }
        }

        if (per > 0 && s.totalSeasons && season >= s.totalSeasons && episode >= per) {
          status = "done";
          finishedAt = finishedAt ?? now;
        }

        return {
          ...s,
          currentSeason: season,
          currentEpisode: episode,
          status,
          finishedAt,
          startedAt: s.startedAt ?? now,
          updatedAt: Date.now(),
          history: [...(s.history ?? []), { season, episode, startedAt: now }],
        };
      })
    );
  }

  function startEpisode(id: string) {
    setShows((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              history: [
                ...(s.history ?? []),
                {
                  season: s.currentSeason,
                  episode: (s.currentEpisode ?? 0) + 1,
                  startedAt: new Date().toISOString(),
                },
              ],
              updatedAt: Date.now(),
            }
          : s
      )
    );
  }

  const visibleShows = shows
    .filter((s) => (filter === "all" ? true : s.status === filter))
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.updatedAt - a.updatedAt;
    });

  return {
    shows,
    visibleShows,
    loading,
    addShow,
    updateShow,
    removeShow,
    markDone,
    incrementEpisode,
    startEpisode,
    filter,
    setFilter,
    sort,
    setSort,
  };
}