import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Note } from "../types/note";

type Props = {
  item: Note;
  selected?: boolean;
  onSelect: (note: Note) => void; // used for editing when tapping the card
  onDuplicate?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onRemove?: (note: Note) => void;
};

export default function NoteCard({ item, selected, onSelect, onDuplicate, onEdit, onRemove }: Props) {
  return (
    <Pressable onPress={() => onSelect(item)} style={[styles.card, selected && styles.cardSelected]}>
      {/* Titre + date */}
      <View style={styles.row}>
        <Text style={styles.title}>{item.title || "Sans titre"}</Text>
        <Text style={styles.date}>Dernière modification le {new Date(item.updatedAt).toLocaleDateString()}</Text>
      </View>

      {/* Aperçu du contenu */}
      <Text style={styles.preview} numberOfLines={3}>
        {item.content || "(vide)"}
      </Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {(onEdit || onSelect) && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#12AAB8" }]}
            onPress={() => (onEdit ? onEdit(item) : onSelect(item))}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>{"\u00C9"}diter</Text>
          </Pressable>
        )}
        {onDuplicate && (
          <Pressable style={[styles.actionBtn, styles.ghost]} onPress={() => onDuplicate(item)}>
            <Text style={styles.actionText}>📄 Dupliquer</Text>
          </Pressable>
        )}
        {onRemove && (
          <Pressable style={[styles.actionBtn, { backgroundColor: "#EF4444" }]} onPress={() => onRemove(item)}>
            <Text style={[styles.actionText, { color: "#fff" }]}>🗑️</Text>
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
    marginBottom: 6,
  },
  title: { fontSize: 15, fontWeight: "600", flex: 1 },
  date: { fontSize: 11, color: "#6B7280", marginLeft: 8 },
  preview: { fontSize: 13, color: "#374151", marginBottom: 6 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: "center" },
  ghost: { backgroundColor: "#F3F4F6" },
  actionText: { fontSize: 12, color: "#111827", fontWeight: "600" },
});
