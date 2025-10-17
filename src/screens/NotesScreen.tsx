import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import EditNoteModal from "../components/EditNoteModal";
import NoteCard from "../components/NoteCard";
import {
  addNote,
  duplicateNoteFrom,
  getNotes,
  initNotes,
  searchNotes,
  sortNotes,
  updateNote,
  deleteNote,
} from "../storage/note.store";
import { Note } from "../types/note";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>(getNotes());
  useEffect(() => {
    (async () => {
      await initNotes();
      setNotes(getNotes());
    })();
  }, []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [query, setQuery] = useState("");

  function handleAdd() {
    setEditingNote(null);
    setModalVisible(true);
  }

  function handleEdit(note: Note) {
    setEditingNote(note);
    setModalVisible(true);
  }

  function handleSubmit(changes: Partial<Note>) {
    if (editingNote) {
      updateNote(editingNote.id, changes);
    } else {
      const now = Date.now();
      const newNote: Note = {
        id: Date.now().toString(),
        title: (changes.title || "Sans titre") as string,
        content: changes.content || "",
        createdAt: now,
        updatedAt: now,
        archived: false,
      };
      addNote(newNote);
    }
    setNotes(getNotes());
  }

  function handleDuplicate(note: Note) {
    const copy = duplicateNoteFrom(note);
    addNote(copy);
    setNotes(getNotes());
  }

  // 🔎 Recherche + tri
  const filtered = query ? searchNotes(notes, query) : notes;
  const sortedNotes = sortNotes(filtered);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📝 Mes notes</Text>

      {/* Barre de recherche */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher une note..."
        style={styles.searchInput}
      />

      {/* Liste */}
      {sortedNotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune note pour l'instant</Text>
          <Text style={styles.emptySub}>Crée une note avec le bouton ci-dessous.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          renderItem={({ item }) => (
            <NoteCard
              item={item}
              selected={false}
              onSelect={() => handleEdit(item)}
              onEdit={() => handleEdit(item)}
              onRemove={() => {
                deleteNote(item.id);
                setNotes(getNotes());
              }}
              onDuplicate={() => handleDuplicate(item)}
            />
          )}
        />
      )}

      {/* Bouton ajouter */}
      <Pressable
        style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
        onPress={handleAdd}
      >
        <Text style={styles.addText}>＋ Nouvelle note</Text>
      </Pressable>

      {/* Modale */}
      <EditNoteModal
        visible={modalVisible}
        initial={editingNote}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },
  addBtn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#6B7280" },
});
