import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MOVIE_STATUS_LABEL } from "../hooks/useMovies";
import { Theme } from "../theme";
import { statusColors } from "../constants/statusColors";
import { useTheme } from "../ThemeContext";
import { Movie } from "../types/movie";

type Props = {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onUpdateProgress: (movie: Movie) => void;
};

export default function MovieCard({ movie, onEdit, onUpdateProgress }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  // Fond léger selon l'état (en cours, à voir, terminé, abandonné), mêmes couleurs dans tout Listana
  const tone = statusColors(t, movie.status);
  const color = t.media.movie;
  const watched = movie.progressMinutes ?? 0;
  const runtime = movie.runtime;
  const done = movie.status === "done";
  const pct = runtime ? Math.min(100, Math.round((watched / runtime) * 100)) : null;
  const initial = movie.title.trim().charAt(0).toUpperCase();

  let progressText = "Pas encore commencé";
  if (done && movie.finishedAt) {
    progressText = `Terminé le ${new Date(movie.finishedAt).toLocaleDateString("fr-FR")}`;
  } else if (done) {
    progressText = "Terminé";
  } else if (runtime) {
    progressText = `${watched} / ${runtime} min`;
  } else if (watched > 0) {
    progressText = `${watched} min vues`;
  }

  const meta = `${movie.year ? `${movie.year} · ` : ""}${MOVIE_STATUS_LABEL[movie.status] ?? ""}`;

  return (
    <Pressable
      onPress={() => onEdit(movie)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${movie.title}`}
      style={({ pressed }) => [
        styles.card,
        tone && { backgroundColor: tone.cardBg, borderColor: tone.cardBorder },
        pressed && { opacity: 0.85 },
      ]}
    >
      {movie.posterUrl ? (
        <Image source={{ uri: movie.posterUrl }} style={styles.cover} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.cover, styles.coverEmpty, { backgroundColor: color + "33" }]}>
          <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <View style={styles.progressRow}>
          <Text style={[styles.progress, { color }]} numberOfLines={1}>
            {progressText}
          </Text>
          {pct !== null && !done && <Text style={styles.pct}>{pct} %</Text>}
        </View>
        {pct !== null && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        )}
        {movie.review ? (
          <Text style={styles.review} numberOfLines={1}>
            {movie.review}
          </Text>
        ) : null}
      </View>

      {done ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminé">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onUpdateProgress(movie)}
          accessibilityRole="button"
          accessibilityLabel={`Mettre à jour la progression de ${movie.title}`}
          hitSlop={8}
          style={styles.updateBtn}
        >
          <Ionicons name="create-outline" size={20} color={t.onAccent} />
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
    cover: { width: 56, height: 80, borderRadius: 12 },
    coverEmpty: { alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8 },
    progress: { flex: 1, fontFamily: t.fonts.semibold, fontSize: t.fs(13) },
    pct: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 6, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
    review: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6, fontStyle: "italic" },
    updateBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    doneBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.cardAlt, alignItems: "center", justifyContent: "center" },
  });
}