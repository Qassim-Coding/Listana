import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

// Ouvre la fenêtre « Ajouter » quand l'écran est ouvert par le widget « Ajouter »
// (lien listana://books?add=1, listana://anime?add=1…).
// Le paramètre est ensuite effacé, pour que la fenêtre ne se rouvre pas toute seule.
export function useOpenAddFromLink(openAdd: () => void) {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (add !== "1") return;
    openAdd();
    router.setParams({ add: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [add]);
}
