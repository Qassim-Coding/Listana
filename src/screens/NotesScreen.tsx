import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NoteCard from "../components/NoteCard";
import NoteEditorModal from "../components/NoteEditorModal";
import {
  addNote,
  deleteNote,
  duplicateNoteFrom,
  getNotes,
  initNotes,
  searchNotes,
  sortNotes,
  updateNote,
} from "../storage/note.store";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Note } from "../types/note";

export default function NotesScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"modification" | "date">("modification");
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => {
    (async () => {
      await initNotes();
      setNotes([...getNotes()]);
    })();
  }, []);

  const refresh = () => setNotes([...getNotes()]);

  function openNew() {
    setEditing(null);
    setEditorVisible(true);
  }

  function openNote(note: Note) {
    setEditing(note);
    setEditorVisible(true);
  }

  function handleSubmit(changes: Partial<Note>) {
    if (editing) {
      updateNote(editing.id, changes);
    } else {
      const now = Date.now();
      addNote({
        id: now.toString(),
        title: (changes.title || "Sans titre") as string,
        content: changes.content || "",
        createdAt: now,
        updatedAt: now,
        archived: false,
      });
    }
    refresh();
  }

  function handleDuplicate(note: Note) {
    addNote(duplicateNoteFrom(note));
    refresh();
  }

  function handleDelete(note: Note) {
    deleteNote(note.id);
    refresh();
  }

  const filtered = query ? searchNotes(notes, query) : notes;
  const shown =
    sortBy === "modification"
      ? sortNotes(filtered)
      : [...filtered].filter((n) => !n.archived).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher dans les notes"
          placeholderTextColor={t.textMuted}
          accessibilityLabel="Rechercher dans les notes"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {shown.length} note{shown.length > 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={() => setSortBy(sortBy === "modification" ? "date" : "modification")}
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text style={styles.sortText}>
            {sortBy === "modification" ? "Dernière modification ↓" : "Date de création ↓"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune note pour l'instant. Crée-en une avec le bouton ci-dessous.</Text>
        }
        renderItem={({ item }) => <NoteCard item={item} onOpen={openNote} />}
      />

      <Pressable onPress={openNew} accessibilityRole="button" style={[styles.addBtn, { bottom: 16 + insets.bottom }]}>
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Nouvelle note</Text>
      </Pressable>

      <NoteEditorModal
        visible={editorVisible}
        initial={editing}
        onClose={() => setEditorVisible(false)}
        onSubmit={handleSubmit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 16, paddingTop: 12 },
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchInput: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.text },
    listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 8 },
    listCount: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    sortText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.text },
    list: { flex: 1 },
    empty: {
      textAlign: "center",
      marginTop: 40,
      paddingHorizontal: 24,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      lineHeight: t.fs(20),
      color: t.textMuted,
    },
    addBtn: {
      position: "absolute",
      left: 16,
      right: 16,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    addText: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
  });
}