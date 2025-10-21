import React, { useEffect, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { Note } from "../types/note";

type Props = {
  visible: boolean;
  initial: Note | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Note>) => void;
};

export default function EditNoteModal({ visible, initial, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setContent(initial?.content ?? "");
  }, [initial, visible]);

  const wordCount = useMemo(() => {
    const txt = (content || "").trim();
    return txt.length === 0 ? 0 : txt.split(/\s+/).length;
  }, [content]);

  function handleSave() {
    const changes: Partial<Note> = {
      title: title.trim(),
      content: content.trim(),
    };
    onSubmit(changes);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheet}>
          <Text style={styles.title}>{initial ? "Modifier la note" : "Nouvelle note"}</Text>

          {/* Titre */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            style={styles.input}
          />

          {/* Contenu */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Contenu de la note..."
            multiline
            style={styles.textarea}
          />
          <Text style={styles.wordCount}>{wordCount} mots</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
              <Text style={styles.btnTextSecondary}>Annuler</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
              <Text style={styles.btnTextPrimary}>Enregistrer</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 160,
    textAlignVertical: "top",
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },
  wordCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#12AAB8",
  },
  btnSecondary: {
    backgroundColor: "#E5E7EB",
  },
  btnTextPrimary: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  btnTextSecondary: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
});