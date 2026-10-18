import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { SearchResult, getTVDetails, hasTmdbToken, searchTV } from "../api/tmdb";
import { NewTVShow, TV_STATUS_LABEL } from "../hooks/useTVShows";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { TVShow } from "../types/tvshow";
import DateField from "./DateField";
import MediaSearchField from "./MediaSearchField";

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
  // Lien TMDB
  const [tmdbId, setTmdbId] = useState<number | undefined>();
  const [posterUrl, setPosterUrl] = useState<string | undefined>();
  const [seasonEpisodes, setSeasonEpisodes] = useState<number[] | undefined>();
  const [linking, setLinking] = useState(false);

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
    setTmdbId(initial?.tmdbId);
    setPosterUrl(initial?.posterUrl);
    setSeasonEpisodes(initial?.seasonEpisodes);
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  // Quand la saison change, on reprend le nombre d'épisodes connu pour cette saison
  function changeSeason(v: string) {
    const clean = digits(v);
    setCurrentSeason(clean);
    const n = parseInt(clean, 10);
    const per = n > 0 ? seasonEpisodes?.[n - 1] : undefined;
    if (per) setEpisodesPerSeason(String(per));
  }

  async function handlePick(r: SearchResult) {
    setLinking(true);
    try {
      const d = await getTVDetails(r.id);
      const max = d.seasons.reduce((m, s) => Math.max(m, s.number), 0);
      const list = Array.from({ length: max }, (_, i) => d.seasons.find((s) => s.number === i + 1)?.episodes ?? 0);
      setTitle(d.title);
      setYear(d.year ? String(d.year) : "");
      setTmdbId(d.id);
      setPosterUrl(d.posterUrl);
      setSeasonEpisodes(list.length ? list : undefined);
      if (d.totalSeasons) setTotalSeasons(String(d.totalSeasons));
      const cs = parseInt(currentSeason, 10) || 1;
      if (list[cs - 1]) setEpisodesPerSeason(String(list[cs - 1]));
    } catch {
      setTitle(r.title);
      setYear(r.year ? String(r.year) : "");
      setTmdbId(r.id);
      setPosterUrl(r.posterUrl);
    } finally {
      setLinking(false);
    }
  }

  function unlink() {
    setTmdbId(undefined);
    setPosterUrl(undefined);
    setSeasonEpisodes(undefined);
  }

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      status,
      currentSeason: parseInt(currentSeason, 10) || 1,
      totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : undefined,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
      episodesPerSeason: parseInt(episodesPerSeason, 10) || 0,
      seasonEpisodes,
      year: year ? parseInt(year, 10) : undefined,
      startedAt: toIso(startedAt) ?? (initial ? undefined : new Date().toISOString()),
      finishedAt:
        status === "done" ? initial?.finishedAt ?? new Date().toISOString() : initial?.finishedAt,
      review: review.trim() || undefined,
      tmdbId,
      posterUrl,
      source: tmdbId ? "tmdb" : "manual",
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
  const color = t.media.tv;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.heading}>{initial ? "Modifier la série" : "Ajouter une série"}</Text>

            {hasTmdbToken() && !tmdbId && (
              <>
                <Text style={styles.label}>{initial ? "Relier à TMDB" : "Rechercher une série"}</Text>
                <MediaSearchField
                  placeholder="Ex. The Boys"
                  search={searchTV}
                  onPick={handlePick}
                  color={color}
                  credit="Données et affiches : TMDB"
                />
              </>
            )}

            {linking && (
              <View style={styles.linkingRow}>
                <ActivityIndicator color={color} />
                <Text style={styles.linkingText}>Récupération des infos…</Text>
              </View>
            )}

            {tmdbId && !linking && (
              <View style={[styles.linked, { borderColor: color + "66" }]}>
                {posterUrl ? (
                  <Image source={{ uri: posterUrl }} style={styles.linkedPoster} />
                ) : (
                  <View style={[styles.linkedPoster, { backgroundColor: color + "33" }]} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.linkedTitle} numberOfLines={2}>
                    {title || "Sans titre"}
                  </Text>
                  <Text style={[styles.linkedMeta, { color }]}>
                    Relié à TMDB{year ? ` · ${year}` : ""}
                    {totalSeasons ? ` · ${totalSeasons} saison${parseInt(totalSeasons, 10) > 1 ? "s" : ""}` : ""}
                  </Text>
                </View>
                <Pressable onPress={unlink} accessibilityRole="button" accessibilityLabel="Retirer le lien TMDB" style={styles.unlinkBtn}>
                  <Ionicons name="close" size={20} color={t.textMuted} />
                </Pressable>
              </View>
            )}

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
                  onChangeText={changeSeason}
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
                <Text style={styles.label}>Épisodes (cette saison)</Text>
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
                <Text style={styles.label}>Année de sortie</Text>
                <TextInput
                  value={year}
                  onChangeText={(v) => setYear(digits(v).slice(0, 4))}
                  keyboardType="number-pad"
                  placeholder="Optionnel"
                  placeholderTextColor={t.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={styles.col} />
            </View>

            <Text style={styles.label}>Début du visionnage</Text>
            <DateField
              value={startedAt}
              onChange={setStartedAt}
              color={color}
              accessibilityLabel="Début du visionnage"
            />

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
    linkingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
    linkingText: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
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
    linkedPoster: { width: 48, height: 72, borderRadius: 10 },
    linkedTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    linkedMeta: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), marginTop: 2 },
    unlinkBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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