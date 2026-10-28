import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

// Ouvre la fenêtre « Ajouter » quand l'écran est ouvert par le widget « Ajouter »
// (lien listana://books?add=1, listana://anime?add=1…).
//
// Attention au démarrage « à froid » (app fermée, ouverte par le widget) :
// au tout premier affichage, la navigation n'est pas encore prête. router.setParams()
// lançait alors une erreur (« Attempted to navigate before mounting the Root Layout »)
// et l'app se fermait. Donc :
//  1. on attend un court instant que l'écran soit vraiment affiché ;
//  2. on efface le paramètre avec la navigation de l'écran lui-même (navigation.setParams),
//     qui ne dépend pas de cette vérification ;
//  3. try/catch : un lien de widget ne doit jamais faire planter l'app.
const OPEN_DELAY_MS = 350;

export function useOpenAddFromLink(openAdd: () => void) {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const navigation = useNavigation();

  useEffect(() => {
    if (add !== "1") return;

    const timer = setTimeout(() => {
      try {
        openAdd();
        // On retire ?add=1 : la fenêtre ne se rouvrira pas toute seule,
        // et un nouvel appui sur le widget la rouvrira bien.
        navigation.setParams({ add: undefined } as never);
      } catch {
        // On ignore : au pire, la fenêtre ne s'ouvre pas, mais l'app reste ouverte
      }
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [add]);
}
