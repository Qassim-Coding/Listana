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
    View,
} from "react-native";
import { Manga, MangaStatus } from "../types/manga";

type Props = {
  visible: boolean;
  initial: Manga | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Manga>) => void;
};

const STATUSES: MangaStatus[] = ["toRead", "reading", "completed", "abandoned"];

export default function EditMangaModal({ visible, initial, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [status, setStatus] = useState<MangaStatus>(initial?.status ?? "toRead");
  const [lastChapter, setLastChapter] = useState(initial?.lastChapter ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [progressMode, setProgressMode] = useState<"volume" | "chapter">(
    initial?.progressMode ?? (initial?.volumeNumber ? "volume" : "chapter")
  );

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setSeries(initial?.series ?? "");
    setStatus(initial?.status ?? "toRead");
    setLastChapter(initial?.lastChapter ?? "");
    setNotes(initial?.notes ?? "");
    setProgressMode(initial?.progressMode ?? (initial?.volumeNumber ? "volume" : "chapter"));
  }, [initial, visible]);

  const wordCount = useMemo(() => {
    const txt = (notes || "").trim();
    return txt.length === 0 ? 0 : txt.split(/\s+/).length;
  }, [notes]);

  function handleSave() {
    const changes: Partial<Manga> = {
      title: title.trim(),
      series: series.trim() || undefined,
      status,
      lastChapter: lastChapter.trim() || undefined,
      notes: notes.trim() || undefined,
      progressMode,
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
          <Text style={styles.title}>{initial ? "Modifier le Manga" : "Nouveau Manga"}</Text>

          {/* Titre */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            style={styles.input}
          />

          {/* S�rie */}
          <TextInput
            value={series}
            onChangeText={setSeries}
            placeholder="Auteur (optionnel)"
            style={styles.input}
          />

          {/* Statut */}
          <Text style={styles.label}>Statut</Text>
          <View style={styles.segment}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.segmentBtn, status === s && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, status === s && styles.segmentTextActive]}>
                  {labelStatus(s)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Statut appliqué sur</Text>
          <View style={styles.segment}>
            {[
              { key: "volume", label: "Tome" },
              { key: "chapter", label: "Chapitre" },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setProgressMode(opt.key as "volume" | "chapter")}
                style={[
                  styles.segmentBtn,
                  progressMode === (opt.key as any) && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    progressMode === (opt.key as any) && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Dernier épisode */}
          <TextInput
            value={lastChapter}
            onChangeText={setLastChapter}
            placeholder="Dernier chapitre lu / Tome lu"
            style={styles.input}
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes, réflexions…"
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

function labelStatus(s: MangaStatus) {
  switch (s) {
    case "toRead":
      return "À lire";
    case "reading":
      return "En cours";
    case "completed":
      return "Terminé";
    case "abandoned":
      return "Abandonné";
    default:
      return s;
  }
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
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  segmentBtnActive: {
    backgroundColor: "#0EA5E9",
  },
  segmentText: {
    fontSize: 12,
    color: "#333",
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 120,
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



