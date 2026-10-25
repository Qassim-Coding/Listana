import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { EMPTY_STATS, LibraryStats, ResumeItem, loadResumeLibrary } from "../utils/resumeLibrary";
import { refreshWidgets } from "../widgets/refresh";

export type { LibraryStats, ResumeItem } from "../utils/resumeLibrary";

export function useResumeItems() {
  const [items, setItems] = useState<ResumeItem[]>([]);
  const [stats, setStats] = useState<LibraryStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadResumeLibrary().then((res) => {
        if (!active) return;
        setItems(res.items);
        setStats(res.stats);
        setLoading(false);
      });
      // Retour à l'accueil : on remet aussi le widget « Reprendre » à jour (Android seulement)
      refreshWidgets();
      return () => {
        active = false;
      };
    }, [])
  );

  return { items, stats, loading };
}
