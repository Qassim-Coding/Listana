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
import { Game } from "../types/game";
import { GAME_GENRE_LABEL, GAME_STATUS_LABEL } from "./GameCard";

type Props = {
  visible: boolean;
  initial: Game | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Game>) => void;
  onDelete?: (game: Game) => void;
};

const STATUSES: Game["status"][] = ["toPlay", "playing", "completed", "abandoned"];
const PLATFORMS: Game["platform"][] = ["PC", "Nintendo", "PS5", "Xbox", "Mobile"];
const GENRES: Game["genre"][] = ["RPG", "FPS", "indé", "rétro", "mobile"];

export default function GameFormModal({ visible, initial, onClose, onSubmit, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Game["status"]>("toPlay");
  const [platform, setPlatform] = useState<Game["platform"]>("PC");
  const [genre, setGenre] = useState<Game["genre"]>("RPG");
  const [lastCheckpoint, setLastCheckpoint] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [notes, setNotes] = useState("");

  // Repart toujours de "initial" (ou de valeurs vides pour un nouvel ajout)
  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setStatus(initial?.status ?? "toPlay");
    setPlatform(initial?.platform ?? "PC");
    setGenre(initial?.genre ?? "RPG");
    setLastCheckpoint(initial?.lastCheckpoint ?? "");
    setReleaseDate(initial?.releaseDate ?? "");
    setNotes(initial?.notes ?? "");
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      status,
      platform,
      genre,
      lastCheckpoint: lastCheckpoint.trim() || undefined,
      releaseDate: releaseDate.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  function handleDelete() {
    if (!initial || !onDelete) return;
    const target = initial;
    const message = `Supprimer « ${target.title} » ?`;
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

  function Chips<V extends string>({
    values,
    value,
    onChange,
    label,
  }: {
    values: V[];
    value: V;
    onChange: (v: V) => void;
    label: (v: V) => string;
  }) {
    return (
      <View style={styles.chips}>
        {values.map((v) => {
          const on = value === v;
          return (
            <Pressable
              key={v}
              onPress={() => onChange(v)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{label(v)}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.heading}>{initial ? "Modifier le jeu" : "Ajouter un jeu"}</Text>

            <Text style={styles.label}>Titre *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Hollow Knight"
              placeholderTextColor={t.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Statut</Text>
            <Chips values={STATUSES} value={status} onChange={setStatus} label={(v) => GAME_STATUS_LABEL[v]} />

            <Text style={styles.label}>Plateforme</Text>
            <Chips values={PLATFORMS} value={platform} onChange={setPlatform} label={(v) => v} />

            <Text style={styles.label}>Genre</Text>
            <Chips values={GENRES} value={genre} onChange={setGenre} label={(v) => GAME_GENRE_LABEL[v] ?? v} />

            <Text style={styles.label}>Où j'en suis (optionnel)</Text>
            <TextInput
              value={lastCheckpoint}
              onChangeText={setLastCheckpoint}
              placeholder="Ex. Chapitre 3, boss de la forêt…"
              placeholderTextColor={t.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Date de sortie (optionnel)</Text>
            <TextInput
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={t.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Astuces, ressenti…"
              placeholderTextColor={t.textMuted}
              multiline
              style={[styles.input, styles.textarea]}
            />

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose} accessibilityRole="button">
                <Text style={styles.btnTextSecondary}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, !valid && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!valid}
                accessibilityRole="button"
              >
                <Text style={styles.btnTextPrimary}>{initial ? "Enregistrer" : "Ajouter"}</Text>
              </Pressable>
            </View>

            {initial && onDelete && (
              <Pressable onPress={handleDelete} accessibilityRole="button" style={styles.deleteBtn}>
                <Text style={[styles.deleteText, { color: danger }]}>Supprimer</Text>
              </Pressable>
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
    deleteBtn: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12, marginTop: 6 },
    deleteText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14) },
  });
}