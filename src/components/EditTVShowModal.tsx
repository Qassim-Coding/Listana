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
import { TVShow } from "../types/tvshow";

export default function EditTVShowModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: TVShow | null;
  onClose: () => void;
  onSubmit: (data: Partial<TVShow>) => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [currentSeason, setCurrentSeason] = useState("1");
  const [totalSeasons, setTotalSeasons] = useState("");
  const [episodesPerSeason, setEpisodesPerSeason] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("0");
  const [status, setStatus] = useState<"planning" | "watching" | "done" | "dropped">("planning");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setYear(initial.year ? String(initial.year) : "");
      setReview(initial.review ?? "");
      setStartedAt(initial.startedAt ? initial.startedAt.split("T")[0] : "");
      setCurrentSeason(String(initial.currentSeason ?? 1));
      setTotalSeasons(initial.totalSeasons ? String(initial.totalSeasons) : "");
      setEpisodesPerSeason(initial.episodesPerSeason ? String(initial.episodesPerSeason) : "");
      setCurrentEpisode(String(initial.currentEpisode ?? 0));
      setStatus(initial.status ?? "planning");
    }
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      year: year ? parseInt(year, 10) : undefined,
      review: review.trim() || undefined,
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
      currentSeason: parseInt(currentSeason, 10) || 1,
      totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : undefined,
      episodesPerSeason: parseInt(episodesPerSeason, 10) || 0,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
      status,
    });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>✏️ Modifier la série</Text>

          <TextInput style={styles.input} placeholder="Titre *" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Année" keyboardType="numeric" value={year} onChangeText={setYear} />
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Avis"
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
            placeholder="Nombre total de saisons"
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
  sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
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
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#E5E7EB" },
  statusBtnActive: { backgroundColor: "#12AAB8" },
  statusText: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#111827" },
  statusTextActive: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
});