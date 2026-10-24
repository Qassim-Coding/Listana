import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
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
import { MangaSearchResult, searchManga } from "../api/mal";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Manga, MangaStatus } from "../types/manga";
import { MANGA_STATUS_LABEL } from "../utils/mangaProgress";
import MediaSearchField from "./MediaSearchField";

type Props = {
  visible: boolean;
  initial: Manga | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Manga>) => void;
  onDuplicate?: (manga: Manga) => void;
  onDelete?: (manga: Manga) => void;
};

const STATUSES: MangaStatus[] = ["toRead", "reading", "completed", "abandoned"];

export default function EditMangaModal({
  visible,
  initial,
  onClose,
  onSubmit,
  onDuplicate,
  onDelete,
}: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [status, setStatus] = useState<MangaStatus>(initial?.status ?? "toRead");
  const [lastChapter, setLastChapter] = useState(initial?.lastChapter ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [progressMode, setProgressMode] = useState<"volume" | "chapter">(
    initial?.progressMode ?? (initial?.volumeNumber ? "volume" : "chapter")
  );
  // Lien MyAnimeList (API officielle)
  const [malId, setMalId] = useState<number | undefined>(initial?.malId);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initial?.coverUrl);
  const [totalVolumes, setTotalVolumes] = useState<number | undefined>(initial?.totalVolumes);
  const [totalChapters, setTotalChapters] = useState<number | undefined>(initial?.totalChapters);

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setSeries(initial?.series ?? "");
    setStatus(initial?.status ?? "toRead");
    setLastChapter(initial?.lastChapter ?? "");
    setNotes(initial?.notes ?? "");
    setProgressMode(initial?.progressMode ?? (initial?.volumeNumber ? "volume" : "chapter"));
    setMalId(initial?.malId);
    setCoverUrl(initial?.coverUrl);
    setTotalVolumes(initial?.totalVolumes);
    setTotalChapters(initial?.totalChapters);
  }, [initial, visible]);

  function handlePick(r: MangaSearchResult) {
    setTitle(r.title);
    if (r.author) setSeries(r.author);
    setMalId(r.id);
    setCoverUrl(r.posterUrl);
    setTotalVolumes(r.volumes);
    setTotalChapters(r.chapters);
  }

  function unlink() {
    setMalId(undefined);
    setCoverUrl(undefined);
    setTotalVolumes(undefined);
    setTotalChapters(undefined);
  }

  const wordCount = useMemo(() => {
    const txt = (notes || "").trim();
    return txt.length === 0 ? 0 : txt.split(/\s+/).length;
  }, [notes]);

  function handleSave() {
    onSubmit({
      title: title.trim(),
      series: series.trim() || undefined,
      status,
      lastChapter: lastChapter.trim() || undefined,
      notes: notes.trim() || undefined,
      progressMode,
      malId,
      coverUrl,
      totalVolumes,
      totalChapters,
      source: malId ? "mal" : "manual",
    });
    onClose();
  }

  function handleDuplicate() {
    if (!initial || !onDuplicate) return;
    onDuplicate(initial);
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
  const color = t.media.manga;
  const totals = [
    totalVolumes ? `${totalVolumes} tome${totalVolumes > 1 ? "s" : ""}` : "",
    totalChapters ? `${totalChapters} chap.` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{initial ? "Modifier le manga" : "Nouveau manga"}</Text>

            {!malId && (
              <>
                <Text style={styles.label}>{initial ? "Relier à MyAnimeList" : "Rechercher un manga"}</Text>
                <MediaSearchField
                  placeholder="Ex. Vagabond"
                  search={searchManga}
                  onPick={handlePick}
                  color={color}
                  credit="Données et couvertures : MyAnimeList"
                />
              </>
            )}

            {!!malId && (
              <View style={[styles.linked, { borderColor: color + "66" }]}>
                {coverUrl ? (
                  <Image source={{ uri: coverUrl }} style={styles.linkedCover} />
                ) : (
                  <View style={[styles.linkedCover, { backgroundColor: color + "33" }]} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.linkedTitle} numberOfLines={2}>
                    {title || "Sans titre"}
                  </Text>
                  <Text style={[styles.linkedMeta, { color }]} numberOfLines={1}>
                    Relié à MyAnimeList{totals ? ` · ${totals}` : ""}
                  </Text>
                </View>
                <Pressable
                  onPress={unlink}
                  accessibilityRole="button"
                  accessibilityLabel="Retirer le lien MyAnimeList"
                  style={styles.unlinkBtn}
                >
                  <Ionicons name="close" size={20} color={t.textMuted} />
                </Pressable>
              </View>
            )}

            <Text style={styles.label}>Titre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. Vagabond"
              placeholderTextColor={t.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Auteur (optionnel)</Text>
            <TextInput
              value={series}
              onChangeText={setSeries}
              placeholder="Ex. Takehiko Inoue"
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
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {MANGA_STATUS_LABEL[s]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Je suis ma lecture par</Text>
            <View style={styles.segment}>
              {(["volume", "chapter"] as const).map((mode) => {
                const on = progressMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setProgressMode(mode)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                  >
                    <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                      {mode === "volume" ? "Tome" : "Chapitre / scan"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Dernier tome / chapitre lu</Text>
            <TextInput
              value={lastChapter}
              onChangeText={setLastChapter}
              placeholder="Ex. 190"
              placeholderTextColor={t.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes, réflexions…"
              placeholderTextColor={t.textMuted}
              multiline
              style={[styles.input, styles.textarea]}
            />
            <Text style={styles.wordCount}>{wordCount} mots</Text>

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose} accessibilityRole="button">
                <Text style={styles.btnTextSecondary}>Annuler</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave} accessibilityRole="button">
                <Text style={styles.btnTextPrimary}>Enregistrer</Text>
              </Pressable>
            </View>

            {initial && (
              <View style={styles.extraRow}>
                {onDuplicate && (
                  <Pressable onPress={handleDuplicate} accessibilityRole="button" style={styles.extraBtn}>
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
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 14,
    },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(20), color: t.text, marginBottom: 8 },
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
    textarea: { minHeight: 110, textAlignVertical: "top" },
    linked: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 12,
      padding: 10,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: t.bg,
    },
    linkedCover: { width: 48, height: 72, borderRadius: 10 },
    linkedTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    linkedMeta: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), marginTop: 2 },
    unlinkBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    wordCount: { fontFamily: t.fonts.regular, fontSize: t.fs(11), color: t.textMuted, marginTop: 4 },
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
    segment: {
      flexDirection: "row",
      gap: 4,
      padding: 4,
      borderRadius: 16,
      backgroundColor: t.bg,
    },
    segmentBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentBtnOn: { backgroundColor: t.cardAlt },
    segmentText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.textMuted },
    segmentTextOn: { fontFamily: t.fonts.bold, color: t.text },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    btn: {
      flex: 1,
      minHeight: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    btnPrimary: { backgroundColor: t.accent },
    btnSecondary: { backgroundColor: t.cardAlt },
    btnTextPrimary: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    btnTextSecondary: { fontFamily: t.fonts.semibold, fontSize: t.fs(16), color: t.text },
    extraRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 8 },
    extraBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
    extraText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}