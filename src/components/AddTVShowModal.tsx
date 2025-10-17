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

export default function AddTVShowModal({
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
    currentSeason: number;
    totalSeasons?: number;
    episodesPerSeason: number;
    currentEpisode: number;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [currentSeason, setCurrentSeason] = useState("1");
  const [totalSeasons, setTotalSeasons] = useState("");
  const [episodesPerSeason, setEpisodesPerSeason] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("0");

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;

    const parsedDate = startedAt ? new Date(startedAt) : new Date();
    const safeStartedAt = isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    onSubmit({
      title: title.trim(),
      year: year ? parseInt(year, 10) : undefined,
      review: review.trim() || undefined,
      startedAt: safeStartedAt,
      currentSeason: parseInt(currentSeason, 10) || 1,
      totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : undefined,
      episodesPerSeason: parseInt(episodesPerSeason, 10) || 0,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
    });

    // reset
    setTitle("");
    setYear("");
    setReview("");
    setStartedAt("");
    setCurrentSeason("1");
    setTotalSeasons("");
    setEpisodesPerSeason("");
    setCurrentEpisode("0");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>➕ Ajouter une série</Text>

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
            placeholder="Saison actuelle"
            keyboardType="numeric"
            value={currentSeason}
            onChangeText={setCurrentSeason}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre total de saisons (optionnel)"
            keyboardType="numeric"
            value={totalSeasons}
            onChangeText={setTotalSeasons}
          />
          <TextInput
            style={styles.input}
            placeholder="Épisodes par saison"
            keyboardType="numeric"
            value={episodesPerSeason}
            onChangeText={setEpisodesPerSeason}
          />
          <TextInput
            style={styles.input}
            placeholder="Épisode actuel"
            keyboardType="numeric"
            value={currentEpisode}
            onChangeText={setCurrentEpisode}
          />

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