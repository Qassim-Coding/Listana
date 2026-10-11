import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

type BookData = { title: string; author?: string; totalPages?: number; notes?: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: BookData) => void;
  initial?: BookData;
  heading?: string;
  onDelete?: () => void;
};

export default function AddBookModal({
  visible,
  onClose,
  onSubmit,
  initial,
  heading = "Ajouter un livre",
  onDelete,
}: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setAuthor(initial?.author ?? "");
    setTotal(initial?.totalPages != null ? String(initial.totalPages) : "");
    setNotes(initial?.notes ?? "");
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
    onClose();
  }

  function handleDelete() {
    if (!onDelete) return;
    const message = `Supprimer « ${initial?.title ?? "ce livre"} » ?`;
    const doDelete = () => {
      onDelete();
      onClose();
    };
    if (Platform.OS === "web") {
      if ((globalThis as any).confirm?.(message)) doDelete();
      return;
    }
    Alert.alert("Supprimer", message, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: doDelete },
    ]);
  }

  const danger = t.scheme === "dark" ? "#FF7A7A" : "#C62828";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.heading}>{heading}</Text>

            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Le Problème à trois corps"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>Auteur (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Ex. Liu Cixin"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>Nombre de pages (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={total}
              onChangeText={(v) => setTotal(v.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder="Ex. 464"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes, citations…"
              placeholderTextColor={t.textMuted}
              multiline
            />

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose} accessibilityRole="button">
                <Text style={styles.btnTextSecondary}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, !valid && { opacity: 0.5 }]}
                disabled={!valid}
                onPress={handleSave}
                accessibilityRole="button"
              >
                <Text style={styles.btnTextPrimary}>Enregistrer</Text>
              </Pressable>
            </View>

            {onDelete && (
              <Pressable onPress={handleDelete} accessibilityRole="button" style={styles.deleteBtn}>
                <Text style={[styles.deleteText, { color: danger }]}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    scrollContent: { flexGrow: 1, justifyContent: "flex-end" },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
      paddingTop: 10,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 14,
    },
    heading: { fontFamily: t.fonts.bold, fontSize: t.fs(20), color: t.text, marginBottom: 4 },
    label: {
      fontFamily: t.fonts.semibold,
      fontSize: t.fs(12),
      color: t.textMuted,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(15),
      color: t.text,
      backgroundColor: t.bg,
    },
    textarea: { minHeight: 100, textAlignVertical: "top" },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    btn: { flex: 1, minHeight: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    btnPrimary: { backgroundColor: t.accent },
    btnSecondary: { backgroundColor: t.cardAlt },
    btnTextPrimary: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    btnTextSecondary: { fontFamily: t.fonts.semibold, fontSize: t.fs(16), color: t.text },
    deleteBtn: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12, marginTop: 6 },
    deleteText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14) },
  });
}