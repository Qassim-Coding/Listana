import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Anime } from "../types/anime";

export default function AnimeCard({
  anime,
  onEdit,
  onRemove,
  onMarkDone,
  onIncrementEpisode,
  onStartEpisode,
}: {
  anime: Anime;
  onEdit: (anime: Anime) => void;
  onRemove: (id: string) => void;
  onMarkDone: (id: string) => void;
  onIncrementEpisode: (id: string) => void;
  onStartEpisode: (id: string) => void;
}) {
  const progress =
    anime.totalEpisodes && anime.totalEpisodes > 0
      ? Math.min(anime.currentEpisode / anime.totalEpisodes, 1)
      : 0;

  const statusLabel = anime.endedAt
    ? `Termin\u00E9 le ${new Date(anime.endedAt).toLocaleDateString('fr-FR')}`
    : anime.startedAt
    ? `Commenc\u00E9 le ${new Date(anime.startedAt).toLocaleDateString('fr-FR')}`
    : anime.status === 'planning'
    ? 'Pr\u00E9vu'
    : anime.status === 'watching'
    ? 'En cours'
    : anime.status === 'dropped'
    ? 'Abandonn\u00E9'
    : 'Termin\u00E9';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{anime.title}</Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>

      <Text style={styles.meta}>
        {anime.kind === "film" ? "Film / OAV" : "Animé"}{" "}
        {anime.year ? `• ${anime.year}` : ""}
      </Text>

      {anime.review ? <Text style={styles.review}>{anime.review}</Text> : null}
      <Text style={styles.progressText}>
        Épisode {anime.currentEpisode}
        {anime.totalEpisodes ? ` / ${anime.totalEpisodes}` : ""}
      </Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>

      <View style={styles.row}>
        <Pressable
          style={[
            styles.btn,
            anime.totalEpisodes && anime.currentEpisode >= anime.totalEpisodes ? { opacity: 0.5 } : null,
          ]}
          disabled={!!(anime.totalEpisodes && anime.currentEpisode >= anime.totalEpisodes)}
          onPress={() => onIncrementEpisode(anime.id)}
        >
          <Text style={styles.btnText}>+1 épisode</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => onStartEpisode(anime.id)}>
          <Text style={styles.btnText}>Commencer</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: "#16A34A" }]} onPress={() => onMarkDone(anime.id)}>
          <Text style={styles.btnText}>Terminé</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => onEdit(anime)}>
          <Text style={styles.btnText}>{"\u00C9"}diter</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: "#EF4444" }]} onPress={() => onRemove(anime.id)}>
          <Text style={styles.btnText}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#111827",
  },
  status: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
  },
  meta: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#374151",
  },
  review: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  progressText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#0E5A90",
  },
  progressBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    backgroundColor: "#12AAB8",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  btn: {
    backgroundColor: "#12AAB8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnGhost: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
  },
});
