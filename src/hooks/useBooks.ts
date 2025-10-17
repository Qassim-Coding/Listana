import { useEffect, useMemo, useState } from "react";
import { Book, BookStatus } from "../types/book";
import { loadJSON, saveJSON } from "./useStorage";

const STORAGE_KEY = "listana.books.v1";

function computeStatus(b: Book): BookStatus {
  const cp = b.currentPage ?? 0;
  const tp = b.totalPages ?? undefined;

  if (tp != null && tp > 0) {
    if (cp >= tp) return "done";
    if (cp > 0) return "in_progress";
    return "planning";
  } else {
    if (cp && cp > 0) return "in_progress";
    return "planning";
  }
}

export type BookFilter = "all" | "in_progress" | "done";
export type BookSort = "date" | "title" | "status";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookFilter>("all");
  const [sort, setSort] = useState<BookSort>("date");

  useEffect(() => {
    (async () => {
      const data = await loadJSON<Book[]>(STORAGE_KEY, []);
      setBooks(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) saveJSON(STORAGE_KEY, books);
  }, [books, loading]);

  function addBook(input: {
    title: string;
    author?: string;
    totalPages?: number;
    notes?: string;
  }) {
    const now = Date.now();
    const draft: Book = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title.trim(),
      author: input.author?.trim() || undefined,
      totalPages: input.totalPages || undefined,
      currentPage: 0,
      notes: input.notes?.trim() || undefined,
      status: "planning",
      updatedAt: now,
    };
    setBooks((prev) => [draft, ...prev]);
  }

  // ✅ corrige la logique de progression
  function updateProgress(id: string, nextPage: number) {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        const tp = b.totalPages ?? undefined;
        const clamped =
          tp != null && tp > 0 ? Math.max(0, Math.min(nextPage, tp)) : Math.max(0, nextPage);

        const wasPlanning = b.status === "planning";
        let next: Book = {
          ...b,
          currentPage: clamped,
          updatedAt: Date.now(),
        };

        const newStatus = computeStatus(next);

        if (wasPlanning && newStatus === "in_progress" && !next.startedAt) {
          next.startedAt = Date.now();
        }

        if (newStatus === "done") {
          if (!next.finishedAt) next.finishedAt = Date.now();
        } else {
          // ✅ efface la date terminée si l'utilisateur redescend la page
          if (next.finishedAt) next.finishedAt = undefined;
        }

        next.status = newStatus;
        return next;
      })
    );
  }

  function updateBook(
    id: string,
    changes: Partial<Pick<Book, "title" | "author" | "totalPages" | "notes">>
  ) {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const now = Date.now();

        const next: Book = {
          ...b,
          title: (changes.title?.trim() ?? b.title).trim(),
          author: changes.author !== undefined ? (changes.author?.trim() || undefined) : b.author,
          totalPages:
            changes.totalPages !== undefined && Number.isFinite(changes.totalPages)
              ? (changes.totalPages as number)
              : b.totalPages,
          notes: changes.notes !== undefined ? (changes.notes?.trim() || undefined) : b.notes,
          updatedAt: now,
        };

        // Clamp currentPage if totalPages decreased
        if (next.totalPages != null && next.currentPage != null) {
          next.currentPage = Math.min(next.currentPage, next.totalPages);
        }

        const newStatus = computeStatus(next);
        if (b.status !== "in_progress" && newStatus === "in_progress" && !next.startedAt) {
          next.startedAt = now;
        }
        if (newStatus === "done" && !next.finishedAt) {
          next.finishedAt = now;
        }
        next.status = newStatus;
        return next;
      })
    );
  }

  function markDone(id: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              currentPage: b.totalPages ?? b.currentPage ?? 0,
              status: "done",
              finishedAt: b.finishedAt ?? Date.now(),
              startedAt: b.startedAt ?? Date.now(),
              updatedAt: Date.now(),
            }
          : b
      )
    );
  }

  function updateNotes(id: string, notes: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, notes: notes.trim() || undefined, updatedAt: Date.now() } : b
      )
    );
  }

  function removeBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  const doneCount = useMemo(() => books.filter((b) => b.status === "done").length, [books]);

  const visibleBooks = useMemo(() => {
    let list = books;
    if (filter === "in_progress") list = list.filter((b) => b.status === "in_progress");
    else if (filter === "done") list = list.filter((b) => b.status === "done");

    const byStatusOrder: Record<BookStatus, number> = { in_progress: 0, planning: 1, done: 2 };
    const sorted = [...list].sort((a, b) => {
      if (sort === "date") return (b.updatedAt ?? 0) - (a.updatedAt ?? 0); // newest first
      if (sort === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      // status
      return byStatusOrder[a.status] - byStatusOrder[b.status];
    });
    return sorted;
  }, [books, filter, sort]);
  
  return {
    books,
    visibleBooks,
    loading,
    addBook,
    updateProgress,
    updateBook,
    markDone,
    updateNotes,
    removeBook,
    doneCount,
    filter,
    setFilter,
    sort,
    setSort,
  };
}
