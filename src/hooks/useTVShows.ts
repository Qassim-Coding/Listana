import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useState } from "react";
import { TVShow } from "../types/tvshow";

type FilterKey = "all" | "watching" | "done" | "planning" | "dropped";
type SortKey = "date" | "title" | "status";

export function useTVShows() {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("tvshows");
      if (raw) setShows(JSON.parse(raw));
      setLoading(false);
    })();
  }, []);

  const persist = async (data: TVShow[]) => {
    setShows(data);
    await AsyncStorage.setItem("tvshows", JSON.stringify(data));
  };

  const addShow = async (show: Partial<TVShow>) => {
    const newShow: TVShow = {
      id: nanoid(),
      title: show.title ?? "Série sans titre",
      year: show.year,
      review: show.review ?? "",
      status: "planning",
      startedAt: show.startedAt ?? new Date().toISOString(),
      currentSeason: show.currentSeason ?? 1,
      totalSeasons: show.totalSeasons,
      episodesPerSeason: show.episodesPerSeason ?? 0,
      currentEpisode: show.currentEpisode ?? 0,
      history: [],
      source: show.source,
      updatedAt: Date.now(),
    };
    await persist([newShow, ...shows]);
  };

  const updateShow = async (id: string, changes: Partial<TVShow>) => {
    const updated = shows.map((s) =>
      s.id === id ? { ...s, ...changes, updatedAt: Date.now() } : s
    );
    await persist(updated);
  };

  const removeShow = async (id: string) => {
    await persist(shows.filter((s) => s.id !== id));
  };

  const markDone = async (id: string) => {
    const updated = shows.map((s) =>
      s.id === id
        ? {
            ...s,
            status: "done",
            finishedAt: new Date().toISOString(),
            updatedAt: Date.now(),
          }
        : s
    );
    await persist(updated);
  };

  // ➕ Incrémenter un épisode vu
  const incrementEpisode = async (id: string) => {
    const updated = shows.map((s) => {
      if (s.id !== id) return s;

      const nextEpisode = (s.currentEpisode ?? 0) + 1;
      const cappedEpisode = s.episodesPerSeason
        ? Math.min(nextEpisode, s.episodesPerSeason)
        : nextEpisode;

      return {
        ...s,
        currentEpisode: cappedEpisode,
        updatedAt: Date.now(),
        history: [
          ...(s.history ?? []),
          {
            season: s.currentSeason,
            episode: cappedEpisode,
            startedAt: new Date().toISOString(),
          },
        ],
      };
    });
    await persist(updated);
  };

  // ▶️ Commencer un épisode (annotation simple)
  const startEpisode = async (id: string) => {
    const updated = shows.map((s) =>
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
    );
    await persist(updated);
  };

  const visibleShows = shows
    .filter((s) => (filter === "all" ? true : s.status === filter))
    .sort((a, b) => {
      if (sort === "title")
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
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