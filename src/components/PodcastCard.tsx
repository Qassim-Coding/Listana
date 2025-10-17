import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Podcast } from "../types/podcast";

type Props = {
  item: Podcast;
  selected?: boolean;
  onSelect: (podcast: Podcast) => void;
  onDuplicate?: (podcast: Podcast) => void;
};

export default function PodcastCard({ item, selected, onSelect, onDuplicate }: Props) {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {/* Titre + date */}
      <View style={styles.row}>
        <Text style={styles.title}>{item.title || "Sans titre"}</Text>
        <Text style={styles.date}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Hôte + dernier épisode */}
      <Text style={styles.subtitle}>
        {item.host ? `${item.host} • ` : ""}
        {item.lastEpisode ? `Épisode ${item.lastEpisode}` : ""}
      </Text>

      {/* Notes éventuelles */}
      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}

      {/* Bouton dupliquer (optionnel) */}
      {onDuplicate && (
        <Pressable
          style={styles.duplicateBtn}
          onPress={() => onDuplicate(item)}
        >
          <Text style={styles.duplicateText}>📑 Dupliquer</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardSelected: {
    backgroundColor: "#E0F2FE",
    borderColor: "#0EA5E9",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  date: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
  },
  notes: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 6,
  },
  duplicateBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  duplicateText: {
    fontSize: 12,
    color: "#111827",
  },
});