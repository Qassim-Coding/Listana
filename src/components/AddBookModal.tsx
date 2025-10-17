// src/components/AddBookModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddBookModal({
  visible,
  onClose,
  onSubmit,
  initial,
  heading = "Ajouter un livre",
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; author?: string; totalPages?: number; notes?: string }) => void;
  initial?: { title: string; author?: string; totalPages?: number; notes?: string };
  heading?: string;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setAuthor(initial?.author ?? "");
      setTotal(initial?.totalPages != null ? String(initial.totalPages) : "");
      setNotes(initial?.notes ?? "");
    }
  }, [visible, initial]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    const totalPages = total ? parseInt(total, 10) : undefined;
    onSubmit({
      title: title.trim(),
      author: author.trim() || undefined,
      totalPages: Number.isFinite(totalPages as number) ? totalPages : undefined,
      notes: notes.trim() || undefined,
    });
    setTitle(""); setAuthor(""); setTotal(""); setNotes("");
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>➕ Ajouter un livre</Text>

          <TextInput style={styles.input} placeholder="Titre *" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Auteur (optionnel)" value={author} onChangeText={setAuthor} />
          <TextInput
            style={styles.input}
            placeholder="Nombre de pages (optionnel)"
            keyboardType="numeric"
            value={total}
            onChangeText={setTotal}
          />
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Notes (optionnel)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={Platform.OS === "ios" ? 4 : 5}
          />

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={[styles.btnText, { color: "#0E5A90" }]}>Annuler</Text>
            </Pressable>
            <Pressable style={[styles.btn, !valid && { opacity: 0.5 }]} disabled={!valid} onPress={handleSave}>
              <Text style={styles.btnText}>Enregistrer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
  heading: { fontFamily: "Poppins_700Bold", fontSize: 16, color: "#111827", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10, fontFamily: "Poppins_400Regular",
  },
  notes: { textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, marginTop: 8, justifyContent: "flex-end" },
  btn: { backgroundColor: "#12AAB8", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnGhost: { backgroundColor: "#E0F2FE" },
  btnText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
});
