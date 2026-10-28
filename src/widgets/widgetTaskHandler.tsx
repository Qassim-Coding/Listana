"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { RENDERERS } from "./renderWidgets";

// Appelé par Android, même quand Listana est fermée :
// widget posé sur l'écran d'accueil, redimensionné, ou mise à jour toutes les 30 minutes.
// On cherche le bon widget dans le répertoire (renderWidgets.tsx) et on le dessine.
// Les appuis ouvrent l'app directement (OPEN_APP / OPEN_URI) : rien à faire ici pour les clics.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction } = props;
  const render = RENDERERS[widgetInfo.widgetName];
  if (!render) return; // widget inconnu (ex. ancien nom) : on ne fait rien

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(await render(widgetInfo));
      break;
    default:
      break;
  }
}
