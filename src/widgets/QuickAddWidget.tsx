"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import React from "react";
import { FlexWidget, TextWidget, type HexColor } from "react-native-android-widget";
import { buildTheme } from "../theme";
import { ResumeItem } from "../utils/resumeLibrary";

// Widget Android « Ajouter » (W4-C, 4×1) : 7 raccourcis, un par média.
// Un appui ouvre l'écran du média ET sa fenêtre « Ajouter » directement (lien listana://books?add=1…).
// L'ouverture de la fenêtre est faite côté app par le hook useOpenAddFromLink.
// Aucune donnée à lire : le widget est toujours le même, seul le thème clair / sombre change.

type MediaKey = ResumeItem["mediaKey"]; // = nom de la route (anime, tv, movies, books…)
type ColorKey = keyof ReturnType<typeof buildTheme>["media"];

// Ordre d'affichage, de gauche à droite. Les initiales sont toutes différentes (A S F L M J P).
const SHORTCUTS: { key: MediaKey; label: string; color: ColorKey; a11y: string }[] = [
  { key: "anime", label: "Animé", color: "anime", a11y: "Ajouter un animé" },
  { key: "tv", label: "Série", color: "tv", a11y: "Ajouter une série" },
  { key: "movies", label: "Film", color: "movie", a11y: "Ajouter un film" },
  { key: "books", label: "Livre", color: "book", a11y: "Ajouter un livre" },
  { key: "manga", label: "Manga", color: "manga", a11y: "Ajouter un manga" },
  { key: "games", label: "Jeu", color: "game", a11y: "Ajouter un jeu vidéo" },
  { key: "podcast", label: "Podcast", color: "podcast", a11y: "Ajouter un podcast" },
];

type Props = {
  scheme: "light" | "dark";
  width: number; // taille réelle du widget (dp), donnée par Android
  height: number;
};

const hex = (c: string) => c as HexColor;

export function QuickAddWidget({ scheme, width, height }: Props) {
  const t = buildTheme(scheme);

  // Widget très bas (certains lanceurs) : on garde les ronds et on cache les noms
  const showLabels = height >= 64;
  const columnWidth = (width - 16) / SHORTCUTS.length;
  const circle = Math.max(26, Math.min(36, Math.floor(columnWidth - 10)));
  const labelSize = columnWidth < 44 ? 9 : 10;

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: hex(t.card),
        borderRadius: 24,
        borderWidth: 1,
        borderColor: hex(t.border),
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      {SHORTCUTS.map((s) => {
        const color = t.media[s.color];
        return (
          <FlexWidget
            key={s.key}
            // Ouvre l'écran du média avec la fenêtre « Ajouter » déjà ouverte
            clickAction="OPEN_URI"
            clickActionData={{ uri: `listana://${s.key}?add=1` }}
            accessibilityLabel={s.a11y}
            style={{
              flex: 1,
              height: "match_parent",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 14,
            }}
          >
            {/* Rond teinté avec l'initiale, dans la couleur du média (comme les pochettes de « Reprendre ») */}
            <FlexWidget
              style={{
                width: circle,
                height: circle,
                borderRadius: circle / 2,
                backgroundColor: hex(color + (scheme === "dark" ? "33" : "24")),
                borderWidth: 1,
                borderColor: hex(color + "66"),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextWidget
                text={s.label.charAt(0)}
                style={{ fontSize: 14, fontWeight: "700", color: hex(color) }}
              />
            </FlexWidget>
            {showLabels ? (
              <TextWidget
                text={s.label}
                maxLines={1}
                truncate="END"
                style={{ fontSize: labelSize, fontWeight: "600", color: hex(t.textMuted), marginTop: 3 }}
              />
            ) : null}
          </FlexWidget>
        );
      })}
    </FlexWidget>
  );
}
