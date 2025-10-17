import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { AnimeKind } from "../types/anime";

export default function AddAnimeModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    year?: number;
    review?: string;
    startedAt?: string;
    endedAt?: string;
    currentEpisode: number;
    totalEpisodes?: number;
    kind: AnimeKind;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("0");
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [kind, setKind] = useState<AnimeKind>("anime");

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;

    const parsedStart = startedAt ? new Date(startedAt) : new Date();
    const safeStartedAt = isNaN(parsedStart.getTime())
      ? new Date().toISOString()
      : parsedStart.toISOString();

    const parsedEnd = endedAt ? new Date(endedAt) : undefined;
    const safeEndedAt =
      parsedEnd && !isNaN(parsedEnd.getTime())
        ? parsedEnd.toISOString()
        : undefined;

    onSubmit({
      title: title.trim(),
      year: year ? parseInt(year, 10) : undefined,
      review: review.trim() || undefined,
      startedAt: safeStartedAt,
      endedAt: safeEndedAt,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
      totalEpisodes: totalEpisodes ? parseInt(totalEpisodes, 10) : undefined,
      kind,
    });

    // reset
    setTitle("");
    setYear("");
    setReview("");
    setStartedAt("");
    setEndedAt("");
    setCurrentEpisode("0");
    setTotalEpisodes("");
    setKind("anime");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>➕ Ajouter un animé</Text>

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
            style={[styles.input, styles.notes]}
            placeholder="Avis (optionnel)"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={Platform.OS === "ios" ? 3 : 4}
          />
          <TextInput
            style={styles.input}
            placeholder="Date de début (YYYY-MM-DD)"
            value={startedAt}
            onChangeText={setStartedAt}
          />
          <TextInput
            style={styles.input}
            placeholder="Date de fin (optionnel)"
            value={endedAt}
            onChangeText={setEndedAt}
          />
          <TextInput
            style={styles.input}
            placeholder="Épisode actuel"
            keyboardType="numeric"
            value={currentEpisode}
            onChangeText={setCurrentEpisode}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre total d'épisodes (optionnel)"
            keyboardType="numeric"
            value={totalEpisodes}
            onChangeText={setTotalEpisodes}
          />

          {/* Sélecteur de type */}
          <View style={styles.row}>
            {["anime", "film"].map((k) => (
              <Pressable
                key={k}
                onPress={() => setKind(k as AnimeKind)}
                style={[
                  styles.kindBtn,
                  kind === k && styles.kindBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.kindText,
                    kind === k && styles.kindTextActive,
                  ]}
                >
                  {k === "anime" ? "Animé" : "Film / OAV"}
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
              <Text style={styles.btnText}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  heading: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: "Poppins_400Regular",
  },
  notes: {
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  kindBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  kindBtnActive: {
    backgroundColor: "#12AAB8",
  },
  kindText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#111827",
  },
  kindTextActive: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  btn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnGhost: {
    backgroundColor: "#E0F2FE",
  },
  btnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
});