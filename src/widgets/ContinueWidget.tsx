"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import React from "react";
import { FlexWidget, TextWidget, type HexColor } from "react-native-android-widget";
import { buildTheme } from "../theme";
import { ResumeItem } from "../utils/resumeLibrary";

// Widget Android « Dernier en cours » (W1-B, 2×2) : UNE seule œuvre, la dernière que tu as touchée.
// Même source que « Reprendre » (loadResumeLibrary), mais on ne garde que la première ligne.
// Un appui n'importe où ouvre l'écran de ce média ; sans rien en cours, il ouvre l'accueil.
// Rappel : seuls FlexWidget / TextWidget sont utilisés (les autres éléments restaient vides sur NightLog).

type MediaKey = ResumeItem["mediaKey"];
type ColorKey = keyof ReturnType<typeof buildTheme>["media"];

const MEDIA: Record<MediaKey, { label: string; color: ColorKey }> = {
  anime: { label: "Animé", color: "anime" },
  tv: { label: "Série", color: "tv" },
  movies: { label: "Film", color: "movie" },
  books: { label: "Livre", color: "book" },
  manga: { label: "Manga", color: "manga" },
  games: { label: "Jeu", color: "game" },
  podcast: { label: "Podcast", color: "podcast" },
};

type Props = {
  item: ResumeItem | null; // null = rien en cours
  scheme: "light" | "dark";
  height: number; // hauteur réelle du widget (dp) : décide ce qu'on affiche quand il est petit
};

const PADDING = 12;
const hex = (c: string) => c as HexColor;

export function ContinueWidget({ item, scheme, height }: Props) {
  const t = buildTheme(scheme);

  const frame = {
    width: "match_parent" as const,
    height: "match_parent" as const,
    flexDirection: "column" as const,
    backgroundColor: hex(t.card),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: hex(t.border),
    padding: PADDING,
  };

  if (!item) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        accessibilityLabel="Ouvrir Listana"
        style={{ ...frame, justifyContent: "center", alignItems: "center" }}
      >
        <TextWidget text="Rien en cours" style={{ fontSize: 14, fontWeight: "700", color: hex(t.text) }} />
        <TextWidget
          text="Touche pour ouvrir Listana"
          maxLines={2}
          style={{ fontSize: 11, color: hex(t.textMuted), marginTop: 2, textAlign: "center" }}
        />
      </FlexWidget>
    );
  }

  const media = MEDIA[item.mediaKey];
  const color = t.media[media.color];
  const tint = hex(color + (scheme === "dark" ? "33" : "24"));

  // Widget plus petit que prévu (grille du lanceur serrée) : titre sur 1 ligne, sans bouton « Continuer »
  const roomy = height >= 150;

  // Barre de progression : deux morceaux qui se partagent la largeur selon le pourcentage
  // (ex. 38 % → 38 parts pleines, 62 parts vides). Pas besoin de connaître la largeur du widget.
  const done = item.pct == null ? 0 : Math.max(0, Math.min(100, item.pct));

  return (
    <FlexWidget
      // Tout le widget ouvre l'écran du média (listana://anime, listana://books…)
      clickAction="OPEN_URI"
      clickActionData={{ uri: `listana://${item.mediaKey}` }}
      accessibilityLabel={`Continuer ${item.title}, ${media.label}, ${item.meta}`}
      style={{ ...frame, justifyContent: "space-between" }}
    >
      {/* En haut : pochette (initiale) + type de média */}
      <FlexWidget style={{ width: "match_parent", flexDirection: "row", alignItems: "center", flexGap: 8 }}>
        <FlexWidget
          style={{
            width: 24,
            height: 32,
            borderRadius: 6,
            backgroundColor: tint,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget
            text={item.title.trim().charAt(0).toUpperCase() || "?"}
            style={{ fontSize: 12, fontWeight: "700", color: hex(color) }}
          />
        </FlexWidget>
        <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
          <TextWidget
            text={media.label}
            maxLines={1}
            style={{ fontSize: 11, fontWeight: "700", color: hex(color) }}
          />
          <TextWidget
            text="Dernier en cours"
            maxLines={1}
            truncate="END"
            style={{ fontSize: 10, color: hex(t.textMuted) }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Au milieu : titre + où j'en suis */}
      <FlexWidget style={{ width: "match_parent", flexDirection: "column" }}>
        <TextWidget
          text={item.title}
          maxLines={roomy ? 2 : 1}
          truncate="END"
          style={{ fontSize: 14, fontWeight: "700", color: hex(t.text) }}
        />
        <TextWidget
          text={item.meta}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 11, fontWeight: "600", color: hex(t.textMuted), marginTop: 2 }}
        />
      </FlexWidget>

      {/* Barre de progression (seulement si on connaît le total) */}
      {item.pct != null ? (
        <FlexWidget
          style={{
            width: "match_parent",
            height: 6,
            borderRadius: 3,
            backgroundColor: hex(t.cardAlt),
            flexDirection: "row",
          }}
        >
          {done > 0 ? (
            <FlexWidget style={{ flex: done, height: 6, borderRadius: 3, backgroundColor: hex(color) }} />
          ) : null}
          {done < 100 ? <FlexWidget style={{ flex: 100 - done, height: 6 }} /> : null}
        </FlexWidget>
      ) : null}

      {/* En bas : bouton « Continuer » (décoratif : tout le widget est cliquable) */}
      {roomy ? (
        <FlexWidget
          style={{
            width: "match_parent",
            height: 28,
            borderRadius: 14,
            backgroundColor: tint,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="Continuer ›" style={{ fontSize: 12, fontWeight: "700", color: hex(color) }} />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
