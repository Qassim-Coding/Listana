import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ANIME_STATUS_LABEL } from "../hooks/useAnimes";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Anime } from "../types/anime";

type Props = {
  anime: Anime;
  onEdit: (anime: Anime) => void;
  onIncrementEpisode: (id: string) => void;
};

export default function AnimeCard({ anime, onEdit, onIncrementEpisode }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const color = t.media.anime;
  const total = anime.totalEpisodes;
  const atMax = !!total && anime.currentEpisode >= total;
  const finished = anime.status === "done" || atMax;
  const pct = total ? Math.min(100, Math.round((anime.currentEpisode / total) * 100)) : null;
  const initial = anime.title.trim().charAt(0).toUpperCase();
  const meta = `${anime.kind === "film" ? "Film / OAV" : "Animé"}${anime.year ? ` · ${anime.year}` : ""}`;

  return (
    <Pressable
      onPress={() => onEdit(anime)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${anime.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.cover, { backgroundColor: color + "33" }]}>
        <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {anime.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta} · {ANIME_STATUS_LABEL[anime.status] ?? ""}
        </Text>
        <Text style={[styles.progress, { color }]}>
          Épisode {anime.currentEpisode}
          {total ? ` / ${total}` : ""}
        </Text>
        {pct !== null && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        )}
      </View>

      {finished ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminé">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onIncrementEpisode(anime.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ajouter un épisode à ${anime.title}`}
          hitSlop={8}
          style={styles.plusBtn}
        >
          <Text style={styles.plusText}>+1</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    cover: { width: 56, height: 80, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progress: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 6, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
    plusBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    plusText: { fontFamily: t.fonts.bold, fontSize: t.fs(14), color: t.onAccent },
    doneBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}