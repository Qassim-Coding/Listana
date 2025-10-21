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

type GameStatus = "toPlay" | "playing" | "completed" | "abandoned";
type GameGenre = "RPG" | "FPS" | "indé" | "rétro" | "mobile";
type GamePlatform = "PC" | "Nintendo" | "PS5" | "Xbox" | "Mobile";

export interface Game {
  id: string;
  title: string;
  genre: GameGenre;
  platform: GamePlatform;
  status: GameStatus;
  releaseDate?: string;
  notes?: string;
  lastCheckpoint?: string;
}

export default function EditGameModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: Game | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Game>) => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<GameGenre>("RPG");
  const [platform, setPlatform] = useState<GamePlatform>("PC");
  const [releaseDate, setReleaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lastCheckpoint, setLastCheckpoint] = useState("");
  const [status, setStatus] = useState<GameStatus>("toPlay");

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setGenre(initial.genre);
    setPlatform(initial.platform);
    setReleaseDate(initial.releaseDate ?? "");
    setNotes(initial.notes ?? "");
    setLastCheckpoint(initial.lastCheckpoint ?? "");
    setStatus(initial.status ?? "toPlay");
  }, [initial]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;

    onSubmit({
      title: title.trim(),
      genre,
      platform,
      releaseDate: releaseDate || undefined,
      notes: notes.trim() || undefined,
      lastCheckpoint: lastCheckpoint.trim() || undefined,
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
              <Text style={styles.heading}>🎮 Modifier le jeu</Text>

              <TextInput
                style={styles.input}
                placeholder="Titre *"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Genre</Text>
              <View style={styles.row}>
                {["RPG", "FPS", "indé", "rétro", "mobile"].map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGenre(g as GameGenre)}
                    style={[
                      styles.kindBtn,
                      genre === g && styles.kindBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.kindText,
                        genre === g && styles.kindTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Plateforme</Text>
              <View style={styles.row}>
                {["PC", "Nintendo", "PS5", "Xbox", "Mobile"].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPlatform(p as GamePlatform)}
                    style={[
                      styles.kindBtn,
                      platform === p && styles.kindBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.kindText,
                        platform === p && styles.kindTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Date de sortie (YYYY-MM-DD)"
                value={releaseDate}
                onChangeText={setReleaseDate}
              />

              <TextInput
                style={[styles.input, styles.notes]}
                placeholder="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={Platform.OS === "ios" ? 3 : 4}
              />

              <TextInput
                style={styles.input}
                placeholder="Dernier moment joué (ex: Chapitre 3)"
                value={lastCheckpoint}
                onChangeText={setLastCheckpoint}
              />

              <Text style={styles.label}>Statut</Text>
              <View style={styles.row}>
                {[
                  { key: "toPlay", label: "À jouer" },
                  { key: "playing", label: "En cours" },
                  { key: "completed", label: "Terminé" },
                  { key: "abandoned", label: "Abandonné" },
                ].map(({ key, label }) => (
                  <Pressable
                    key={key}
                    onPress={() => setStatus(key as GameStatus)}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  notes: {
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
    fontSize: 13,
    color: "#111827",
  },
  kindTextActive: {
    color: "#fff",
    fontWeight: "600",
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
    fontWeight: "600",
  },
});