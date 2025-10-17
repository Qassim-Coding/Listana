import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useState } from "react";
import { Movie } from "../types/movie";

type FilterKey = "all" | "watching" | "done" | "planning" | "dropped";
type SortKey = "date" | "title" | "status";

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("movies");
      if (raw) setMovies(JSON.parse(raw));
      setLoading(false);
    })();
  }, []);

  const persist = async (data: Movie[]) => {
    setMovies(data);
    await AsyncStorage.setItem("movies", JSON.stringify(data));
  };

  const addMovie = async (movie: Partial<Movie>) => {
    const newMovie: Movie = {
      id: nanoid(),
      title: movie.title ?? "Film sans titre",
      year: movie.year ?? undefined,
      runtime: movie.runtime ?? undefined,
      progressMinutes: 0,
      status: "planning",
      rating: undefined,
      review: movie.review ?? "",
      source: "manual",
      updatedAt: Date.now(),
      // 👇 nouvelle propriété
      startedAt: movie.startedAt ?? new Date().toISOString(),
    };
    await persist([newMovie, ...movies]);
  };

  const updateProgress = async (id: string, minutes: number) => {
    const updated = movies.map((m) =>
      m.id === id
        ? { ...m, progressMinutes: minutes, updatedAt: Date.now() }
        : m
    );
    await persist(updated);
  };

  const markDone = async (id: string) => {
    const updated = movies.map((m) =>
      m.id === id
        ? {
            ...m,
            status: "done",
            progressMinutes: m.runtime ?? m.progressMinutes ?? 0,
            finishedAt: Date.now(),
            updatedAt: Date.now(),
          }
        : m
    );
    await persist(updated);
  };

  const updateMovie = async (id: string, changes: Partial<Movie>) => {
    const updated = movies.map((m) =>
      m.id === id ? { ...m, ...changes, updatedAt: Date.now() } : m
    );
    await persist(updated);
  };

  const removeMovie = async (id: string) => {
    const updated = movies.filter((m) => m.id !== id);
    await persist(updated);
  };

  const doneCount = movies.filter((m) => m.status === "done").length;

  const visibleMovies = movies
    .filter((m) => (filter === "all" ? true : m.status === filter))
    .sort((a, b) => {
      if (sort === "title")
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.updatedAt - a.updatedAt; // sort=date
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