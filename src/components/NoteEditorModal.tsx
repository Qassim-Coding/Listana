import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Note } from "../types/note";

type Props = {
  visible: boolean;
  initial: Note | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Note>) => void;
  onDuplicate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
};

export default function NoteEditorModal({ visible, initial, onClose, onSubmit, onDuplicate, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setContent(initial?.content ?? "");
  }, [initial, visible]);

  const words = useMemo(() => {
    const txt = content.trim();
    return txt ? txt.split(/\s+/).length : 0;
  }, [content]);

  const canSave = title.trim().length > 0 || content.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSubmit({ title: title.trim() || "Sans titre", content });
    onClose();
  }

  function handleDelete() {
    if (!initial || !onDelete) return;
    const target = initial;
    const message = `Supprimer « ${target.title || "Sans titre"} » ?`;
    const doDelete = () => {
      onDelete(target);
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.sheet, { marginTop: insets.top + 24, paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.topRow}>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12} style={styles.topBtn}>
              <Text style={styles.cancel}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              accessibilityRole="button"
              style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
            >
              <Text style={styles.saveText}>Enregistrer</Text>
            </Pressable>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Titre de la note"
            style={styles.titleInput}
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Écris ici…"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Contenu de la note"
            multiline
            style={styles.contentInput}
          />

          <View style={styles.bottomRow}>
            <Text style={styles.words}>
              {words} mot{words > 1 ? "s" : ""}
            </Text>
            {initial && (
              <View style={styles.extraRow}>
                {onDuplicate && (
                  <Pressable
                    onPress={() => {
                      onDuplicate(initial);
                      onClose();
                    }}
                    accessibilityRole="button"
                    style={styles.extraBtn}
                  >
                    <Text style={styles.extraText}>Dupliquer</Text>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable onPress={handleDelete} accessibilityRole="button" style={styles.extraBtn}>
                    <Text style={[styles.extraText, { color: danger }]}>Supprimer</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    sheet: {
      flex: 1,
      backgroundColor: t.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    topBtn: { minHeight: 44, justifyContent: "center" },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    saveBtn: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 22,
      backgroundColor: t.accent,
      justifyContent: "center",
    },
    saveText: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.onAccent },
    titleInput: {
      fontFamily: t.fonts.bold,
      fontSize: t.fs(24),
      color: t.text,
      marginTop: 16,
      paddingVertical: 6,
    },
    contentInput: {
      flex: 1,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(16),
      lineHeight: t.fs(24),
      color: t.text,
      textAlignVertical: "top",
      marginTop: 8,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: t.border,
      paddingTop: 8,
    },
    words: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    extraRow: { flexDirection: "row", gap: 16 },
    extraBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
    extraText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}