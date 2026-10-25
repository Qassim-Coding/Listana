"use no memo"; // le compilateur React (activé dans app.json) casserait le dessin du widget

import React from "react";
import { FlexWidget, TextWidget, type HexColor } from "react-native-android-widget";
import { statusColors } from "../constants/statusColors";
import { buildTheme } from "../theme";
import { ResumeItem } from "../utils/resumeLibrary";

// Widget Android « Reprendre » (W1-A) : les dernières œuvres en cours, toutes catégories confondues.
// Un appui sur une ligne ouvre l'écran de ce média dans Listana ; un appui sur le titre ouvre l'accueil.
// Attention : ce ne sont pas de vrais composants React Native. La bibliothèque dessine une image
// à partir de FlexWidget / TextWidget : seuls ces éléments et leurs styles sont autorisés ici.

type MediaKey = ResumeItem["mediaKey"];

const MEDIA: Record<MediaKey, { label: string; color: keyof ReturnType<typeof buildTheme>["media"] }> = {
  anime: { label: "Animé", color: "anime" },
  tv: { label: "Série", color: "tv" },
  movies: { label: "Film", color: "movie" },
  books: { label: "Livre", color: "book" },
  manga: { label: "Manga", color: "manga" },
  games: { label: "Jeu", color: "game" },
  podcast: { label: "Podcast", color: "podcast" },
};

type Props = {
  items: ResumeItem[];
  total: number; // nombre total d'œuvres en cours
  scheme: "light" | "dark";
  height: number; // hauteur réelle du widget (dp) : décide combien de lignes on affiche
};

const hex = (c: string) => c as HexColor;

export function ResumeWidget({ items, total, scheme, height }: Props) {
  const t = buildTheme(scheme);
  const tone = statusColors(t, "watching"); // fond « en cours » (bleu clair), comme dans l'app
  const rowBg = hex(tone?.cardBg ?? t.cardAlt);
  const rowBorder = hex(tone?.cardBorder ?? t.border);

  // En-tête ~26 dp + marges 24 dp, puis une ligne = 48 dp + 6 dp d'écart
  const rows = Math.max(1, Math.min(4, Math.floor((height - 50) / 54)));
  const shown = items.slice(0, rows);

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        flexDirection: "column",
        backgroundColor: hex(t.card),
        borderRadius: 24,
        borderWidth: 1,
        borderColor: hex(t.border),
        padding: 12,
        flexGap: 6,
      }}
    >
      {/* En-tête : ouvre l'accueil de Listana */}
      <FlexWidget
        clickAction="OPEN_APP"
        accessibilityLabel="Ouvrir Listana"
        style={{
          width: "match_parent",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 4,
        }}
      >
        <TextWidget text="Reprendre" style={{ fontSize: 14, fontWeight: "700", color: hex(t.text) }} />
        <TextWidget
          text={total > 0 ? `${total} en cours` : ""}
          style={{ fontSize: 12, color: hex(t.textMuted) }}
        />
      </FlexWidget>

      {shown.length === 0 ? (
        <FlexWidget
          clickAction="OPEN_APP"
          accessibilityLabel="Ouvrir Listana pour ajouter une œuvre"
          style={{
            width: "match_parent",
            height: "match_parent",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: hex(t.cardAlt),
            borderRadius: 14,
            padding: 12,
          }}
        >
          <TextWidget text="Rien en cours pour l'instant" style={{ fontSize: 13, fontWeight: "700", color: hex(t.text) }} />
          <TextWidget
            text="Touche ici pour ouvrir Listana"
            style={{ fontSize: 12, color: hex(t.textMuted), marginTop: 2 }}
          />
        </FlexWidget>
      ) : (
        shown.map((item) => {
          const media = MEDIA[item.mediaKey];
          const color = t.media[media.color];
          return (
            <FlexWidget
              key={item.id}
              // Ouvre l'écran du média (lien listana://anime, listana://books…)
              clickAction="OPEN_URI"
              clickActionData={{ uri: `listana://${item.mediaKey}` }}
              accessibilityLabel={`${item.title}, ${media.label}, ${item.meta}`}
              style={{
                width: "match_parent",
                height: 48,
                flexDirection: "row",
                alignItems: "center",
                flexGap: 10,
                paddingHorizontal: 8,
                backgroundColor: rowBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: rowBorder,
              }}
            >
              {/* Petite « pochette » : l'initiale dans la couleur du média */}
              <FlexWidget
                style={{
                  width: 28,
                  height: 38,
                  borderRadius: 7,
                  backgroundColor: hex(color + (scheme === "dark" ? "33" : "24")),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TextWidget
                  text={item.title.trim().charAt(0).toUpperCase() || "?"}
                  style={{ fontSize: 13, fontWeight: "700", color: hex(color) }}
                />
              </FlexWidget>
              <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
                <TextWidget
                  text={item.title}
                  maxLines={1}
                  truncate="END"
                  style={{ fontSize: 13, fontWeight: "700", color: hex(t.text) }}
                />
                <TextWidget
                  text={`${media.label} · ${item.meta}`}
                  maxLines={1}
                  truncate="END"
                  style={{ fontSize: 11, fontWeight: "600", color: hex(color) }}
                />
              </FlexWidget>
              <TextWidget text="›" style={{ fontSize: 22, color: hex(t.textMuted) }} />
            </FlexWidget>
          );
        })
      )}
    </FlexWidget>
  );
}
