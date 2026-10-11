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
import { NewTVShow, TV_STATUS_LABEL } from "../hooks/useTVShows";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { TVShow } from "../types/tvshow";

type Status = TVShow["status"];

type Props = {
  visible: boolean;
  initial: TVShow | null;
  onClose: () => void;
  onSubmit: (data: NewTVShow) => void;
  onDelete?: (show: TVShow) => void;
};

const STATUSES: Status[] = ["planning", "watching", "done", "dropped"];
const digits = (v: string) => v.replace(/\D/g, "");

function toIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function TVShowFormModal({ visible, initial, onClose, onSubmit, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Status>("planning");
  const [currentSeason, setCurrentSeason] = useState("1");
  const [totalSeasons, setTotalSeasons] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("0");
  const [episodesPerSeason, setEpisodesPerSeason] = useState("");
  const [year, setYear] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setStatus(initial?.status ?? "planning");
    setCurrentSeason(String(initial?.currentSeason ?? 1));
    setTotalSeasons(initial?.totalSeasons ? String(initial.totalSeasons) : "");
    setCurrentEpisode(String(initial?.currentEpisode ?? 0));
    setEpisodesPerSeason(initial?.episodesPerSeason ? String(initial.episodesPerSeason) : "");
    setYear(initial?.year ? String(initial.year) : "");
    setStartedAt(initial?.startedAt ? initial.startedAt.slice(0, 10) : "");
    setReview(initial?.review ?? "");
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      status,
      currentSeason: parseInt(currentSeason, 10) || 1,
      totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : undefined,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
      episodesPerSeason: parseInt(episodesPerSeason, 10) || 0,
      year: year ? parseInt(year, 10) : undefined,
      startedAt: toIso(startedAt) ?? (initial ? undefined : new Date().toISOString()),
      finishedAt:
        status === "done" ? initial?.finishedAt ?? new Date().toISOString() : initial?.finishedAt,
      review: review.trim() || undefined,
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.heading}>{initial ? "Modifier la série" : "Ajouter une série"}</Text>

            <Text style={styles.label}>Titre *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Severance"
              placeholderTextColor={t.textMuted}
              style={styles.input}
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
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{TV_STATUS_LABEL[s]}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={styles.label}>Saison actuelle</Text>
                <TextInput
                  value={currentSeason}
                  onChangeText={(v) => setCurrentSeason(digits(v))}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Total saisons</Text>
                <TextInput
                  value={totalSeasons}
                  onChangeText={(v) => setTotalSeasons(digits(v))}
                  keyboardType="number-pad"
                  placeholder="Optionnel"
                  placeholderTextColor={t.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={styles.label}>Épisode actuel</Text>
                <TextInput
                  value={currentEpisode}
                  onChangeText={(v) => setCurrentEpisode(digits(v))}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Épisodes / saison</Text>
                <TextInput
                  value={episodesPerSeason}
                  onChangeText={(v) => setEpisodesPerSeason(digits(v))}
                  keyboardType="number-pad"
                  placeholder="Ex. 10"
                  placeholderTextColor={t.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={styles.label}>Année</Text>
                <TextInput
                  value={year}
                  onChangeText={(v) => setYear(digits(v).slice(0, 4))}
                  keyboardType="number-pad"
                  placeholder="Optionnel"
                  placeholderTextColor={t.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Début</Text>
                <TextInput
                  value={startedAt}
                  onChangeText={setStartedAt}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={t.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Avis (optionnel)</Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Ton avis…"
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
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 14,
    },
    heading: { fontFamily: t.fonts.bold, fontSize: t.fs(20), color: t.text, marginBottom: 4 },
    label: {
      fontFamily: t.fonts.semibold,
      fontSize: t.fs(12),
      color: t.textMuted,
      marginTop: 12,
      marginBottom: 6,
    },
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
    twoCols: { flexDirection: "row", gap: 10 },
    col: { flex: 1 },
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