import { requestWidgetUpdate } from "react-native-android-widget";
import { DATA_WIDGETS, RENDERERS } from "./renderWidgets";

// Redessine les widgets qui affichent ta bibliothèque (« Reprendre » et « Dernier en cours »)
// s'ils sont posés sur l'écran d'accueil (sinon, ne fait rien).
// Appelé au retour sur l'accueil de l'app et quand l'app passe en arrière-plan.
export function refreshWidgets(): void {
  for (const name of DATA_WIDGETS) {
    requestWidgetUpdate({
      widgetName: name,
      renderWidget: (info) => RENDERERS[name](info),
    }).catch(() => {
      // Un widget qui ne se met pas à jour ne doit jamais faire planter l'app
    });
  }
}
