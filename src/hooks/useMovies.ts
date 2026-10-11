import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useState } from "react";
import { Movie } from "../types/movie";

type FilterKey = "all" | "watching" | "done" | "planning" | "dropped";
type SortKey = "date" | "title" | "status";

const STORAGE_KEY = "movies";

export const MOVIE_STATUS_LABEL: Record<string, string> = {
  planning: "À voir",
  watching: "En cours",
  done: "Terminé",
  dropped: "Abandonné",
};

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setMovies(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Sauvegarde après chaque changement (même format qu'avant)
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(movies)).catch(() => {});
  }, [movies, loading]);

  function addMovie(movie: Partial<Movie>) {
    const progress = movie.progressMinutes ?? 0;
    const newMovie = {
      ...movie,
      id: nanoid(),
      title: movie.title || "Film sans titre",
      progressMinutes: progress,
      status: movie.status ?? (progress > 0 ? "watching" : "planning"),
      review: movie.review ?? "",
      source: movie.source ?? "manual",
      startedAt: movie.startedAt ?? new Date().toISOString(),
      updatedAt: Date.now(),
    } as Movie;
    setMovies((prev) => [newMovie, ...prev]);
  }

  // Minutes vues : passe en "En cours" puis "Terminé" automatiquement
  function updateProgress(id: string, rawMinutes: number) {
    setMovies((prev) =>
      prev.map((m): Movie => {
        if (m.id !== id) return m;
        const minutes = Math.max(0, m.runtime ? Math.min(rawMinutes, m.runtime) : rawMinutes);
        const finished = !!m.runtime && minutes >= m.runtime;
        return {
          ...m,
          progressMinutes: minutes,
          status: finished ? "done" : m.status === "planning" && minutes > 0 ? "watching" : m.status,
          finishedAt: finished ? m.finishedAt ?? Date.now() : m.finishedAt,
          updatedAt: Date.now(),
        } as Movie;
      })
    );
  }

  function markDone(id: string) {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id
          ? ({
              ...m,
              status: "done",
              progressMinutes: m.runtime ?? m.progressMinutes ?? 0,
              finishedAt: Date.now(),
              updatedAt: Date.now(),
            } as Movie)
          : m
      )
    );
  }

  function updateMovie(id: string, changes: Partial<Movie>) {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes, updatedAt: Date.now() } : m))
    );
  }

  function removeMovie(id: string) {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  }

  const doneCount = movies.filter((m) => m.status === "done").length;

  const visibleMovies = movies
    .filter((m) => (filter === "all" ? true : m.status === filter))
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.updatedAt - a.updatedAt;
    });

  return {
    movies,
    visibleMovies,
    loading,
    addMovie,
    updateProgress,
    markDone,
    updateMovie,
    removeMovie,
    doneCount,
    filter,
    setFilter,
    sort,
    setSort,
  };
}