import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Manga } from "../types/manga";

type Props = {
  item: Manga;
  selected?: boolean;
  onSelect: (manga: Manga) => void;
  onDuplicate?: (manga: Manga) => void;
  onRemove?: (manga: Manga) => void;
};

export default function MangaCard({ item, selected, onSelect, onDuplicate, onRemove }: Props) {
  // Détermine le dernier chapitre/tome lu
  const lastRead = item.lastChapter 
    ? item.lastChapter 
    : item.chapterNumber 
    ? `Chapitre ${item.chapterNumber}` 
    : item.volumeNumber 
    ? `Tome ${item.volumeNumber}` 
    : "Non renseigné";

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

      {/* Série + volume/chapitre */}
      <Text style={styles.subtitle}>
        {item.series ? `${item.series}` : "Auteur inconnu"}
      </Text>

      {/* Dernier chapitre/tome lu */}
      <Text style={styles.lastReadText}>
        Dernier lu : {lastRead}
      </Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {onDuplicate && (
          <Pressable
            style={[styles.actionBtn, styles.ghost]}
            onPress={() => onDuplicate(item)}
          >
            <Text style={styles.actionText}>📑 Dupliquer</Text>
          </Pressable>
        )}
        {onRemove && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
            onPress={() => onRemove(item)}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>🗑️ Supprimer</Text>
          </Pressable>
        )}
      </View>
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
    marginBottom: 4,
  },
  lastReadText: {
    fontSize: 12,
    color: "#12AAB8",
    fontWeight: "600",
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ghost: {
    backgroundColor: "#F3F4F6",
  },
  actionText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
});