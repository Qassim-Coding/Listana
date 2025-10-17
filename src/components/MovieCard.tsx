// src/components/MovieCard.tsx
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Movie } from "../types/movie";

type Props = {
  movie: Movie;
  onUpdateProgress: (id: string, minutes: number) => void;
  onMarkDone: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit?: (movie: Movie) => void; // ouvre la modale d'édition
};

export default function MovieCard({ movie, onUpdateProgress, onMarkDone, onRemove, onEdit }: Props) {
  const [progressInput, setProgressInput] = useState(movie.progressMinutes?.toString() ?? "");

  const percent =
    movie.runtime && movie.runtime > 0
      ? Math.min(100, Math.round(((movie.progressMinutes ?? 0) / movie.runtime) * 100))
      : undefined;

  return (
    <View style={styles.card}>
      {movie.posterUrl ? (
        <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Text style={{ fontSize: 24 }}>🎬</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {/* Titre */}
        <Text style={styles.title}>
          {movie.title} {movie.year ? `(${movie.year})` : ""}
        </Text>

        {/* Date de début : toujours affichée si définie */}
        {movie.startedAt && (
          <Text style={styles.meta}>
            Commencé le {new Date(movie.startedAt).toLocaleDateString()}
          </Text>
        )}

        {/* Note : toujours affichée si définie */}
        {movie.review ? (
          <Text style={styles.review}>
            Note : {movie.review}
          </Text>
        ) : null}

        {/* Barre de progression */}
        {movie.runtime ? (
          <>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${percent}%` }]} />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.pages}>
                {movie.progressMinutes ?? 0}/{movie.runtime} min
              </Text>
              <Text style={styles.percent}>{percent}%</Text>
            </View>
          </>
        ) : null}

        {/* Input progression */}
        <TextInput
          placeholder="Avancement (min)"
          keyboardType="numeric"
          value={progressInput}
          onChangeText={setProgressInput}
          onBlur={() => onUpdateProgress(movie.id, Number(progressInput) || 0)}
          style={styles.input}
        />

        {/* Boutons */}
        <View style={styles.row}>
          <Pressable
            style={[styles.btn, { backgroundColor: "#16A34A" }]}
            onPress={() => onMarkDone(movie.id)}
          >
            <Text style={styles.btnText}>Terminer</Text>
          </Pressable>

          {onEdit && (
            <Pressable
              style={[styles.btn, { backgroundColor: "#12AAB8" }]}
              onPress={() => onEdit(movie)}
            >
              <Text style={styles.btnText}>Éditer</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.btn, { backgroundColor: "#EF4444" }]}
            onPress={() => onRemove(movie.id)}
          >
            <Text style={styles.btnText}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
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
  poster: { width: 70, height: 100, borderRadius: 8, marginRight: 12 },
  posterPlaceholder: {
    width: 70,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 2,
    fontFamily: "Poppins_400Regular",
  },
  review: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
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
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold" },
});
