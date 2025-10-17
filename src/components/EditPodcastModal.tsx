import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Podcast, PodcastKind, PodcastStatus } from "../types/podcast";

export default function EditPodcastModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initial: Podcast | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Podcast>) => void;
}) {
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  const [status, setStatus] = useState<PodcastStatus>("toListen");
  const [kind, setKind] = useState<PodcastKind>("podcast");
  const [lastEpisode, setLastEpisode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setHost(initial?.host ?? "");
    setStatus(initial?.status ?? "toListen");
    setKind((initial as any)?.kind ?? "podcast");
    setLastEpisode(initial?.lastEpisode ?? "");
    setNotes(initial?.notes ?? "");
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      host: host.trim() || undefined,
      status,
      kind,
      lastEpisode: lastEpisode.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>🎙️ Modifier le podcast</Text>

          <TextInput
            style={styles.input}
            placeholder="Titre *"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Hôte / Animateur (optionnel)"
            value={host}
            onChangeText={setHost}
          />

          <Text style={styles.label}>Statut</Text>
          <View style={styles.segment}>
            {([
              { key: "toListen", label: "À écouter" },
              { key: "listening", label: "En cours" },
              { key: "completed", label: "Terminé" },
              { key: "abandoned", label: "Abandonné" },
            ] as { key: PodcastStatus; label: string }[]).map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setStatus(opt.key)}
                style={[styles.segmentBtn, status === opt.key && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, status === opt.key && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Type</Text>
          <View style={styles.segment}>
            {([
              { key: "podcast", label: "Podcast" },
              { key: "audiobook", label: "Livre audio" },
            ] as { key: PodcastKind; label: string }[]).map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setKind(opt.key)}
                style={[styles.segmentBtn, kind === opt.key && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, kind === opt.key && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Dernier épisode (optionnel)"
            value={lastEpisode}
            onChangeText={setLastEpisode}
          />
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Notes (optionnel)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
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
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, fontFamily: "Poppins_400Regular" },
  notes: { textAlignVertical: "top" },
  label: { fontSize: 12, color: "#555" },
  segment: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segmentBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#E5E7EB" },
  segmentBtnActive: { backgroundColor: "#12AAB8" },
  segmentText: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#111827" },
  segmentTextActive: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
  row: { flexDirection: "row", gap: 10, marginTop: 8, justifyContent: "flex-end" },
  btn: { backgroundColor: "#12AAB8", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnGhost: { backgroundColor: "#E0F2FE" },
  btnText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
})
