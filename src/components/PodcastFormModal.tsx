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
import { Podcast, PodcastKind, PodcastStatus } from "../types/podcast";
import { PODCAST_KIND_LABEL, PODCAST_STATUS_LABEL } from "./PodcastCard";

type Props = {
  visible: boolean;
  initial: Podcast | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Podcast>) => void;
  onDuplicate?: (podcast: Podcast) => void;
  onDelete?: (podcast: Podcast) => void;
};

const STATUSES: PodcastStatus[] = ["toListen", "listening", "completed", "abandoned"];
const KINDS: PodcastKind[] = ["podcast", "audiobook"];

export default function PodcastFormModal({ visible, initial, onClose, onSubmit, onDuplicate, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  const [status, setStatus] = useState<PodcastStatus>("toListen");
  const [kind, setKind] = useState<PodcastKind>("podcast");
  const [lastEpisode, setLastEpisode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setHost(initial?.host ?? "");
    setStatus(initial?.status ?? "toListen");
    setKind(initial?.kind ?? "podcast");
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.heading}>{initial ? "Modifier" : "Ajouter un podcast ou un livre audio"}</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.segment}>
              {KINDS.map((k) => {
                const on = kind === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => setKind(k)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                  >
                    <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{PODCAST_KIND_LABEL[k]}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Les Couilles sur la table"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>{kind === "audiobook" ? "Auteur / narrateur" : "Animateur"} (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholder="Optionnel"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>Statut</Text>
            <View style={styles.chips}>
              {STATUSES.map((s) => {
                const on = status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{PODCAST_STATUS_LABEL[s]}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>{kind === "audiobook" ? "Dernier chapitre écouté" : "Dernier épisode écouté"}</Text>
            <TextInput
              style={styles.input}
              value={lastEpisode}
              onChangeText={setLastEpisode}
              placeholder="Ex. 42"
              placeholderTextColor={t.textMuted}
            />

            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes…"
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
                <Text style={styles.btnTextPrimary}>{initial ? "Enregistrer" : "Ajouter"}</Text>
              </Pressable>
            </View>

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
    handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: t.border, marginBottom: 14 },
    heading: { fontFamily: t.fonts.bold, fontSize: t.fs(20), color: t.text, marginBottom: 4 },
    label: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), color: t.textMuted, marginTop: 12, marginBottom: 6 },
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
    textarea: { minHeight: 90, textAlignVertical: "top" },
    segment: { flexDirection: "row", gap: 4, padding: 4, borderRadius: 16, backgroundColor: t.bg },
    segmentBtn: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    segmentBtnOn: { backgroundColor: t.cardAlt },
    segmentText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.textMuted },
    segmentTextOn: { fontFamily: t.fonts.bold, color: t.text },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      minHeight: 40,
      paddingHorizontal: 14,
      borderRadius: 20,
      justifyContent: "center",
      backgroundColor: t.bg,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipOn: { backgroundColor: t.text, borderColor: t.text },
    chipText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    chipTextOn: { color: t.bg },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    btn: { flex: 1, minHeight: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    btnPrimary: { backgroundColor: t.accent },
    btnSecondary: { backgroundColor: t.cardAlt },
    btnTextPrimary: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    btnTextSecondary: { fontFamily: t.fonts.semibold, fontSize: t.fs(16), color: t.text },
    extraRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 8 },
    extraBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
    extraText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}