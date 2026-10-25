import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  SearchResult,
  getMovieDetails,
  getTVDetails,
  hasTmdbToken,
  searchMovies,
  searchTV,
} from "../api/tmdb";
import { ANIME_STATUS_LABEL, NewAnime } from "../hooks/useAnimes";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Anime, AnimeKind, AnimeStatus } from "../types/anime";
import DateField from "./DateField";
import MediaSearchField from "./MediaSearchField";
import BottomSheet from "./BottomSheet";
import SheetActions from "./SheetActions";

type Props = {
  visible: boolean;
  initial: Anime | null;
  onClose: () => void;
  onSubmit: (data: NewAnime) => void;
  onDelete?: (anime: Anime) => void;
};

const STATUSES: AnimeStatus[] = ["planning", "watching", "done", "dropped"];
const digits = (v: string) => v.replace(/\D/g, "");
const dateOnly = (iso?: string) => (iso ?? "").slice(0, 10);

function toIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function AnimeFormModal({ visible, initial, onClose, onSubmit, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<AnimeKind>("anime");
  const [status, setStatus] = useState<AnimeStatus>("planning");
  const [currentEpisode, setCurrentEpisode] = useState("0");
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [year, setYear] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [review, setReview] = useState("");
  // Lien TMDB
  const [tmdbId, setTmdbId] = useState<number | undefined>();
  const [tmdbType, setTmdbType] = useState<"tv" | "movie" | undefined>();
  const [posterUrl, setPosterUrl] = useState<string | undefined>();
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setKind(initial?.kind ?? "anime");
    setStatus(initial?.status ?? "planning");
    setCurrentEpisode(String(initial?.currentEpisode ?? 0));
    setTotalEpisodes(initial?.totalEpisodes ? String(initial.totalEpisodes) : "");
    setYear(initial?.year ? String(initial.year) : "");
    setStartedAt(dateOnly(initial?.startedAt));
    setEndedAt(dateOnly(initial?.endedAt));
    setReview(initial?.review ?? "");
    setTmdbId(initial?.tmdbId);
    setTmdbType(initial?.tmdbType);
    setPosterUrl(initial?.posterUrl);
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  async function handlePick(r: SearchResult) {
    setLinking(true);
    try {
      if (kind === "film") {
        const d = await getMovieDetails(r.id);
        setTitle(d.title);
        setYear(d.year ? String(d.year) : "");
        setPosterUrl(d.posterUrl);
        setTmdbType("movie");
        if (!totalEpisodes) setTotalEpisodes("1");
      } else {
        const d = await getTVDetails(r.id);
        setTitle(d.title);
        setYear(d.year ? String(d.year) : "");
        setPosterUrl(d.posterUrl);
        setTmdbType("tv");
        if (d.totalEpisodes) setTotalEpisodes(String(d.totalEpisodes));
      }
      setTmdbId(r.id);
    } catch {
      setTitle(r.title);
      setYear(r.year ? String(r.year) : "");
      setPosterUrl(r.posterUrl);
      setTmdbId(r.id);
      setTmdbType(kind === "film" ? "movie" : "tv");
    } finally {
      setLinking(false);
    }
  }

  function unlink() {
    setTmdbId(undefined);
    setTmdbType(undefined);
    setPosterUrl(undefined);
  }

  function handleSave() {
    if (!valid) return;
    const isNew = !initial;
    let ended = toIso(endedAt);
    if (status === "done" && !ended) ended = new Date().toISOString();
    onSubmit({
      title: title.trim(),
      kind,
      status,
      currentEpisode: parseInt(currentEpisode, 10) || 0,
      totalEpisodes: totalEpisodes ? parseInt(totalEpisodes, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      startedAt: toIso(startedAt) ?? (isNew ? new Date().toISOString() : undefined),
      endedAt: ended,
      review: review.trim() || undefined,
      tmdbId,
      tmdbType,
      posterUrl,
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

  const color = t.media.anime;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.heading}>{initial ? "Modifier l’animé" : "Ajouter un animé"}</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.segment}>
        {(["anime", "film"] as const).map((k) => {
          const on = kind === k;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.segmentBtn, on && styles.segmentBtnOn]}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                {k === "anime" ? "Animé" : "Film / OAV"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasTmdbToken() && !tmdbId && (
        <>
          <Text style={styles.label}>
            {initial ? "Relier à TMDB" : kind === "film" ? "Rechercher un film d’animation" : "Rechercher un animé"}
          </Text>
          <MediaSearchField
            placeholder={kind === "film" ? "Ex. Your Name" : "Ex. Frieren"}
            search={kind === "film" ? searchMovies : searchTV}
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
              {tmdbType === "tv" && totalEpisodes ? ` · ${totalEpisodes} ép.` : ""}
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
        placeholder="Ex. Frieren"
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
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{ANIME_STATUS_LABEL[s]}</Text>
            </Pressable>
          );
        })}
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
          <Text style={styles.label}>Total (optionnel)</Text>
          <TextInput
            value={totalEpisodes}
            onChangeText={(v) => setTotalEpisodes(digits(v))}
            keyboardType="number-pad"
            placeholder="Ex. 28"
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
            placeholder="Ex. 2023"
            placeholderTextColor={t.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.col} />
      </View>

      <Text style={styles.label}>Début</Text>
      <DateField value={startedAt} onChange={setStartedAt} color={color} accessibilityLabel="Date de début" />

      <Text style={styles.label}>Fin</Text>
      <DateField value={endedAt} onChange={setEndedAt} color={color} accessibilityLabel="Date de fin" />

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

      {initial && onDelete && <SheetActions onDelete={handleDelete} />}
    </BottomSheet>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
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
  });
}