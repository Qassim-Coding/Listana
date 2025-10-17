// src/components/TVShowCard.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TVShow } from "../types/tvshow";

type Props = {
  show: TVShow;
  onEdit: (show: TVShow) => void;
  onRemove: (id: string) => void;
  onMarkDone: (id: string) => void;
  onIncrementEpisode: (id: string) => void; // +1 épisode
  onStartEpisode?: (id: string) => void; // pour enregistrer l’annotation "commencé le" sur l’épisode courant (optionnel)
};

export default function TVShowCard({
  show,
  onEdit,
  onRemove,
  onMarkDone,
  onIncrementEpisode,
  onStartEpisode,
}: Props) {
  // Progression saison (Episode X / Y → barre %)
  const hasSeasonData = !!show.episodesPerSeason && show.episodesPerSeason > 0;
  const seasonPercent = hasSeasonData
    ? Math.min(100, Math.round((show.currentEpisode / show.episodesPerSeason) * 100))
    : 0;

  // Progression globale (si totalSeasons existe) — optionnelle
  // Ici on reste minimal pour le MVP: affichage indicatif seulement
  const globalLabel =
    show.totalSeasons ? `Saison ${show.currentSeason}/${show.totalSeasons}` : `Saison ${show.currentSeason}`;

  const startedLabel = show.startedAt
    ? `Commencée le ${new Date(show.startedAt).toLocaleDateString()}`
    : undefined;

  const nextEpisodeLabel = hasSeasonData
    ? `Prochain: S${pad(show.currentSeason)}E${pad(Math.min(show.currentEpisode + 1, show.episodesPerSeason))}`
    : `Épisode ${show.currentEpisode + 1}`;

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        {/* Titre */}
        <Text style={styles.title}>
          {show.title} {show.year ? `(${show.year})` : ""}
        </Text>

        {/* Dates et statut minimal */}
        {startedLabel && <Text style={styles.meta}>{startedLabel}</Text>}

        {/* Notes plus généreuses */}
        {show.review ? <Text style={styles.review}>{show.review}</Text> : null}

        {/* Progression Saison: X / Y + barre */}
        <Text style={styles.sectionHeading}>{globalLabel}</Text>
        {hasSeasonData ? (
          <>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${seasonPercent}%` }]} />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.pages}>
                Épisode {show.currentEpisode}/{show.episodesPerSeason}
              </Text>
              <Text style={styles.percent}>{seasonPercent}%</Text>
            </View>
          </>
        ) : (
          <Text style={styles.pages}>Épisode {show.currentEpisode}</Text>
        )}

        {/* Prochain épisode */}
        <Text style={styles.next}>{nextEpisodeLabel}</Text>

        {/* Actions rapides épisode */}
        <View style={styles.row}>
          {onStartEpisode && (
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => onStartEpisode(show.id)}>
              <Text style={[styles.btnText, { color: "#0E5A90" }]}>Commencer l’épisode</Text>
            </Pressable>
          )}
          <Pressable style={[styles.btn, { backgroundColor: "#12AAB8" }]} onPress={() => onIncrementEpisode(show.id)}>
            <Text style={styles.btnText}>+1 épisode vu</Text>
          </Pressable>
        </View>

        {/* Boutons gestion */}
        <View style={[styles.row, { marginTop: 8 }]}>
          <Pressable style={[styles.btn, { backgroundColor: "#16A34A" }]} onPress={() => onMarkDone(show.id)}>
            <Text style={styles.btnText}>Terminer</Text>
          </Pressable>

          <Pressable style={[styles.btn, { backgroundColor: "#12AAB8" }]} onPress={() => onEdit(show)}>
            <Text style={styles.btnText}>Éditer</Text>
          </Pressable>

          <Pressable style={[styles.btn, { backgroundColor: "#EF4444" }]} onPress={() => onRemove(show.id)}>
            <Text style={styles.btnText}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#111827",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
  },
  review: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  sectionHeading: {
    fontSize: 13,
    color: "#0E5A90",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#12AAB8" },
  progressMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pages: { fontSize: 13, color: "#374151" },
  percent: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0E5A90" },
  next: { fontSize: 12, color: "#6B7280", marginTop: 4, fontFamily: "Poppins_400Regular" },
  row: { flexDirection: "row", gap: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  btnGhost: { backgroundColor: "#E0F2FE" },
  btnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold" },
});
