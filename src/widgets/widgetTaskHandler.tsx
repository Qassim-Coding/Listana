"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { RESUME_WIDGET, renderResume } from "./renderResume";

// Appelé par Android, même quand Listana est fermée :
// widget posé sur l'écran d'accueil, redimensionné, ou mise à jour toutes les 30 minutes.
// Les appuis sur les lignes ouvrent l'app directement (OPEN_APP / OPEN_URI) : rien à faire ici.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction } = props;
  if (widgetInfo.widgetName !== RESUME_WIDGET) return;

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(await renderResume(widgetInfo.height));
      break;
    default:
      break;
  }
}
