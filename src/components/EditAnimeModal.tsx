import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Anime, AnimeKind } from "../types/anime";

type AnimeStatus = "toWatch" | "watching" | "completed" | "abandoned";

export default function EditAnimeModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: Anime | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Anime>) => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [review, setReview] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("0");
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [kind, setKind] = useState<AnimeKind>("anime");
  const [status, setStatus] = useState<AnimeStatus>("toWatch");

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setYear(initial.year?.toString() ?? "");
    setReview(initial.review ?? "");
    setStartedAt(initial.startedAt ?? "");
    setEndedAt(initial.endedAt ?? "");
    setCurrentEpisode(initial.currentEpisode.toString());
    setTotalEpisodes(initial.totalEpisodes?.toString() ?? "");
    setKind(initial.kind);
    setStatus(initial.status ?? "toWatch");
  }, [initial]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;

    const parsedStart = startedAt ? new Date(startedAt) : undefined;
    const safeStartedAt =
      parsedStart && !isNaN(parsedStart.getTime())
        ? parsedStart.toISOString()
        : undefined;

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
      status,
    });

    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.sheet}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.heading}>✏️ Modifier l’animé</Text>

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

              {/* Type d'animé */}
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

              {/* Statut de l'animé */}
              <View style={styles.row}>
                {[
                  { key: "toWatch", label: "À voir" },
                  { key: "watching", label: "En cours" },
                  { key: "completed", label: "Terminé" },
                  { key: "abandoned", label: "Abandonné" },
                ].map(({ key, label }) => (
                  <Pressable
                    key={key}
                    onPress={() => setStatus(key as AnimeStatus)}
                    style={[
                      styles.kindBtn,
                      status === key && styles.kindBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.kindText,
                        status === key && styles.kindTextActive,
                      ]}
                    >
                      {label}
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
            </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flex: 1,
  },
  scroll: {
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
    flexWrap: "wrap",
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