"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import React from "react";
import type { WidgetRepresentation } from "react-native-android-widget";
import { loadResumeLibrary } from "../utils/resumeLibrary";
import { ResumeWidget } from "./ResumeWidget";

// Nom du widget, le même que dans app.json (plugin react-native-android-widget)
export const RESUME_WIDGET = "Resume";

// Lit la bibliothèque et prépare le widget en version claire ET sombre :
// Android choisit selon le thème du téléphone.
export async function renderResume(height: number): Promise<WidgetRepresentation> {
  const { items, stats } = await loadResumeLibrary();
  return {
    light: <ResumeWidget items={items} total={stats.inProgress} scheme="light" height={height} />,
    dark: <ResumeWidget items={items} total={stats.inProgress} scheme="dark" height={height} />,
  };
}
