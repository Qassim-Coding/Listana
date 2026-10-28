"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import React from "react";
import type { WidgetInfo, WidgetRepresentation } from "react-native-android-widget";
import { loadResumeLibrary } from "../utils/resumeLibrary";
import { ContinueWidget } from "./ContinueWidget";
import { QuickAddWidget } from "./QuickAddWidget";
import { ResumeWidget } from "./ResumeWidget";

// Le « répertoire » des widgets Listana : nom du widget → fonction qui le dessine.
// Les noms doivent être EXACTEMENT ceux de app.json (plugin react-native-android-widget).
// Chaque widget est préparé en version claire ET sombre : Android choisit selon le thème du téléphone.

export const WIDGET = {
  resume: "Resume", // W1-A « Reprendre » (4×2)
  quickAdd: "QuickAdd", // W4-C « Ajouter » (4×1)
  continue: "Continue", // W1-B « Dernier en cours » (2×2)
} as const;

type Renderer = (info: WidgetInfo) => Promise<WidgetRepresentation>;

async function renderResume(info: WidgetInfo): Promise<WidgetRepresentation> {
  const { items, stats } = await loadResumeLibrary();
  return {
    light: <ResumeWidget items={items} total={stats.inProgress} scheme="light" height={info.height} />,
    dark: <ResumeWidget items={items} total={stats.inProgress} scheme="dark" height={info.height} />,
  };
}

async function renderQuickAdd(info: WidgetInfo): Promise<WidgetRepresentation> {
  // Pas de données à lire : seulement les 7 raccourcis
  return {
    light: <QuickAddWidget scheme="light" width={info.width} height={info.height} />,
    dark: <QuickAddWidget scheme="dark" width={info.width} height={info.height} />,
  };
}

async function renderContinue(info: WidgetInfo): Promise<WidgetRepresentation> {
  const { items } = await loadResumeLibrary();
  const item = items[0] ?? null; // la liste est déjà triée : la plus récente d'abord
  return {
    light: <ContinueWidget item={item} scheme="light" height={info.height} />,
    dark: <ContinueWidget item={item} scheme="dark" height={info.height} />,
  };
}

export const RENDERERS: Record<string, Renderer> = {
  [WIDGET.resume]: renderResume,
  [WIDGET.quickAdd]: renderQuickAdd,
  [WIDGET.continue]: renderContinue,
};

// Les widgets qui affichent ta bibliothèque, donc à redessiner quand elle change.
// (« Ajouter » ne change jamais : inutile de le redessiner.)
export const DATA_WIDGETS: string[] = [WIDGET.resume, WIDGET.continue];
