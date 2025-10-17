import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Game } from "../types/game";

export default function GameCard({
  game,
  onUpdate,
  onEdit,
}: {
  game: Game;
  onUpdate: (changes: Partial<Game>) => void;
  onEdit?: (game: Game) => void;
}) {
  const isCompleted = game.status === "completed";

  function handleMarkCompleted() {
    if (!isCompleted) {
      onUpdate({ status: "completed" });
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.meta}>
        🎮 {game.genre} • 🕹️ {game.platform}
      </Text>
      <Text style={styles.status}>📌 {statusLabel(game.status)}</Text>

      {game.lastCheckpoint && (
        <Text style={styles.checkpoint}>
          ⏱️ Dernier moment joué : {game.lastCheckpoint}
        </Text>
      )}

      {game.notes && (
        <Text style={styles.notes}>
          📝 {game.notes}
        </Text>
      )}

      {!isCompleted && (
        <Pressable style={styles.btn} onPress={handleMarkCompleted}>
          <Text style={styles.btnText}>✅ Marquer comme terminé</Text>
        </Pressable>
      )}

      {onEdit && (
        <Pressable style={[styles.btn, { marginTop: 8 }]} onPress={() => onEdit(game)}>
          <Text style={styles.btnText}>{"\u00C9"}diter</Text>
        </Pressable>
      )}
    </View>
  );
}

function statusLabel(status: Game["status"]) {
  switch (status) {
    case "toPlay":
      return "À jouer";
    case "playing":
      return "En cours";
    case "completed":
      return "Terminé";
    case "abandoned":
      return "Abandonné";
    default:
      return "Inconnu";
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  checkpoint: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 6,
  },
  notes: {
    fontSize: 13,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
