import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { progressPct } from "../storage/manga.store";
import { Manga } from "../types/manga";

type Props = {
  item: Manga;
  selected?: boolean;
  onSelect: (manga: Manga) => void;
  onDuplicate?: (manga: Manga) => void;
};

export default function MangaCard({ item, selected, onSelect, onDuplicate }: Props) {
  const progress = progressPct(item);

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
        {item.series ? `${item.series} • ` : ""}
        {item.chapterNumber
          ? `Chapitre ${item.chapterNumber}`
          : `Tome ${item.volumeNumber ?? "?"}`}
      </Text>

      {/* Barre de progression */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {item.pagesRead || 0} / {item.pagesTotal || 0} pages • {progress}%
      </Text>

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
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#12AAB8",
  },
  progressText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
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