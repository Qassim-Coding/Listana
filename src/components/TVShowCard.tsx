import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { TV_STATUS_LABEL } from "../hooks/useTVShows";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { TVShow } from "../types/tvshow";

type Props = {
  show: TVShow;
  onEdit: (show: TVShow) => void;
  onIncrementEpisode: (id: string) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function TVShowCard({ show, onEdit, onIncrementEpisode }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const color = t.media.tv;
  const per = show.episodesPerSeason || 0;
  const season = show.currentSeason || 1;
  const episode = show.currentEpisode ?? 0;
  const done = show.status === "done";
  const pct = per > 0 ? Math.min(100, Math.round((episode / per) * 100)) : null;
  const initial = show.title.trim().charAt(0).toUpperCase();

  const seasonLabel = show.totalSeasons ? `Saison ${season} / ${show.totalSeasons}` : `Saison ${season}`;
  const episodeLabel = per > 0 ? `Ép. ${episode} / ${per}` : `Ép. ${episode}`;

  let next = "";
  if (!done) {
    if (per > 0 && episode >= per) {
      const isLast = !!show.totalSeasons && season >= show.totalSeasons;
      next = isLast ? "" : `Prochain : S${pad(season + 1)}E01`;
    } else {
      next = `Prochain : S${pad(season)}E${pad(episode + 1)}`;
    }
  }

  const meta = `${show.year ? `${show.year} · ` : ""}${TV_STATUS_LABEL[show.status] ?? ""}`;

  return (
    <Pressable
      onPress={() => onEdit(show)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${show.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      {show.posterUrl ? (
        <Image source={{ uri: show.posterUrl }} style={styles.cover} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.cover, styles.coverEmpty, { backgroundColor: color + "33" }]}>
          <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {show.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={[styles.progress, { color }]} numberOfLines={1}>
          {seasonLabel} · {episodeLabel}
        </Text>
        {pct !== null && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        )}
        {next ? <Text style={styles.next}>{next}</Text> : null}
      </View>

      {done ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminée">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onIncrementEpisode(show.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ajouter un épisode à ${show.title}`}
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
    cover: { width: 56, height: 80, borderRadius: 12, backgroundColor: t.cardAlt },
    coverEmpty: { alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progress: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 6, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
    next: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6 },
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