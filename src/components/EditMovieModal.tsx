import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Movie } from "../types/movie";

export default function EditMovieModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: Movie | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    year?: number;
    runtime?: number;
    review?: string;
    startedAt?: string;
    status?: "planning" | "watching" | "done" | "dropped";
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [runtime, setRuntime] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [status, setStatus] = useState<"planning" | "watching" | "done" | "dropped">("planning");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setYear(initial.year ? String(initial.year) : "");
      setRuntime(initial.runtime ? String(initial.runtime) : "");
      setReview(initial.review ?? "");
      setStartedAt(initial.startedAt ? initial.startedAt.split("T")[0] : "");
      setStatus(initial.status ?? "planning");
    }
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    const y = year ? parseInt(year, 10) : undefined;
    const rt = runtime ? parseInt(runtime, 10) : undefined;
    onSubmit({
      title: title.trim(),
      year: Number.isFinite(y as number) ? y : undefined,
      runtime: Number.isFinite(rt as number) ? rt : undefined,
      review: review.trim() || undefined,
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
      status,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>✏️ Modifier le film</Text>

          <TextInput
            style={styles.input}
            placeholder="Titre *"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Année (optionnel)"
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
          />
          <TextInput
            style={styles.input}
            placeholder="Durée (min, optionnel)"
            keyboardType="numeric"
            value={runtime}
            onChangeText={setRuntime}
          />
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Notes (optionnel)"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={Platform.OS === "ios" ? 4 : 5}
          />

          <TextInput
            style={styles.input}
            placeholder="Date de début (YYYY-MM-DD)"
            value={startedAt}
            onChangeText={setStartedAt}
          />

          {/* Sélecteur de statut */}
          <View style={styles.statusRow}>
            {[
              { key: "planning", label: "À voir" },
              { key: "watching", label: "En cours" },
              { key: "done", label: "Terminé" },
              { key: "dropped", label: "Abandonné" },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setStatus(opt.key as any)}
                style={[
                  styles.statusBtn,
                  status === opt.key && styles.statusBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    status === opt.key && styles.statusTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={[styles.btnText, { color: "#0E5A90" }]}>Annuler</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, !valid && { opacity: 0.5 }]}
              disabled={!valid}
              onPress={handleSave}
            >
              <Text style={styles.btnText}>Enregistrer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  heading: { fontFamily: "Poppins_700Bold", fontSize: 16, color: "#111827", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: "Poppins_400Regular",
  },
  notes: { textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, marginTop: 8, justifyContent: "flex-end" },
  btn: { backgroundColor: "#12AAB8", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnGhost: { backgroundColor: "#E0F2FE" },
  btnText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },

  // Styles pour le sélecteur de statut
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  statusBtnActive: {
    backgroundColor: "#12AAB8",
  },
  statusText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#111827",
  },
  statusTextActive: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
});