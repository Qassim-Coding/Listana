import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Book } from "../types/book";
import AddBookModal from "./AddBookModal";

export default function BookCard({
  book,
  onUpdateProgress,
  onMarkDone,
  onRemove,
  onEditNotes,
  onEditBook,
}: {
  book: Book;
  onUpdateProgress: (id: string, page: number) => void;
  onMarkDone: (id: string) => void;
  onRemove: (id: string) => void;
  onEditNotes: (id: string, notes: string) => void;
  onEditBook: (
    id: string,
    changes: { title: string; author?: string; totalPages?: number; notes?: string }
  ) => void;
}) {
  const [page, setPage] = useState(book.currentPage?.toString() ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(book.notes ?? "");
  const [editOpen, setEditOpen] = useState(false);

  const progress =
    book.totalPages && book.totalPages > 0
      ? Math.min(100, Math.round(((book.currentPage ?? 0) / book.totalPages) * 100))
      : undefined;

  return (
    <View style={styles.card}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{book.title}</Text>
          {book.author && <Text style={styles.author}>par {book.author}</Text>}
        </View>
        <Pressable onPress={() => onRemove(book.id)}>
          <Text style={styles.delete}>🗑️</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 }}>
        <Pressable style={styles.btn} onPress={() => setEditOpen(true)}>
          <Text style={styles.btnText}>{"\u00C9"}diter</Text>
        </Pressable>
      </View>

      {/* Barre de progression */}
      {book.totalPages ? (
        <>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.pages}>
              {book.currentPage ?? 0}/{book.totalPages} pages
            </Text>
            <Text style={styles.percent}>{progress}%</Text>
          </View>

          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={page}
              keyboardType="numeric"
              onChangeText={setPage}
              placeholder="Page actuelle"
            />
            <Pressable
              style={styles.btn}
              onPress={() => {
                const p = parseInt(page, 10);
                if (!isNaN(p)) onUpdateProgress(book.id, p);
              }}
            >
              <Text style={styles.btnText}>Mettre à jour</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Text style={styles.noPages}>📖 Pages non renseignées</Text>
      )}

      {/* Bouton Terminer */}
      <View style={styles.row}>
        <Pressable style={[styles.btn, { backgroundColor: "#16A34A" }]} onPress={() => onMarkDone(book.id)}>
          <Text style={styles.btnText}>Terminer</Text>
        </Pressable>
      </View>

      {/* Dates */}
      {book.startedAt && (
        <Text style={styles.date}>
          📅 Commencé le {new Date(book.startedAt).toLocaleDateString("fr-FR")}
        </Text>
      )}
      {book.finishedAt && (
        <Text style={styles.date}>
          ✅ Terminé le {new Date(book.finishedAt).toLocaleDateString("fr-FR")}
        </Text>
      )}

      {/* Notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>📝 Notes :</Text>
        {editingNotes ? (
          <>
            <TextInput
              style={styles.notesInput}
              multiline
              value={notesDraft}
              onChangeText={setNotesDraft}
            />
            <Pressable
              style={[styles.btn, { marginTop: 6 }]}
              onPress={() => {
                onEditNotes(book.id, notesDraft);
                setEditingNotes(false);
              }}
            >
              <Text style={styles.btnText}>Enregistrer</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={() => setEditingNotes(true)}>
            <Text style={styles.notesText}>
              {book.notes ? book.notes : "Ajouter une note..."}
            </Text>
          </Pressable>
        )}
      </View>

      <AddBookModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        heading="Modifier le livre"
        initial={{
          title: book.title,
          author: book.author,
          totalPages: book.totalPages,
          notes: book.notes,
        }}
        onSubmit={(data) => {
          onEditBook(book.id, data);
          setEditOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#111827" },
  author: { fontSize: 13, color: "#6B7280" },
  edit: { fontSize: 14, color: "#0E5A90" },
  delete: { fontSize: 20 },

  progressContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#12AAB8",
  },
  progressMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pages: { fontSize: 13, color: "#374151" },
  percent: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#0E5A90",
  },
  noPages: { fontSize: 13, color: "#9CA3AF", marginBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "Poppins_400Regular",
  },
  btn: {
    backgroundColor: "#12AAB8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  btnText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },

  notesContainer: { marginTop: 12 },
  notesLabel: { fontFamily: "Poppins_600SemiBold", color: "#111827", marginBottom: 4 },
  notesInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  notesText: { color: "#374151", fontFamily: "Poppins_400Regular" },

  date: { fontSize: 12, color: "#6B7280", marginTop: 4 },
});


