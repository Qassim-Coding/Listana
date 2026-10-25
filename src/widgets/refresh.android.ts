import { requestWidgetUpdate } from "react-native-android-widget";
import { RESUME_WIDGET, renderResume } from "./renderResume";

// Redessine le widget « Reprendre » s'il est posé sur l'écran d'accueil (sinon, ne fait rien).
// Appelé au retour sur l'accueil de l'app et quand l'app passe en arrière-plan.
export function refreshWidgets(): void {
  requestWidgetUpdate({
    widgetName: RESUME_WIDGET,
    renderWidget: (info) => renderResume(info.height),
  }).catch(() => {
    // Un widget qui ne se met pas à jour ne doit jamais faire planter l'app
  });
}
