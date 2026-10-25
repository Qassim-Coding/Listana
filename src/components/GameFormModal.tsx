import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { GameSearchResult, hasRawgKey, mapGenre, mapPlatform, searchGames } from "../api/rawg";
import { Theme } from "../theme";
import { Game } from "../types/game";
import DateField from "./DateField";
import { GAME_GENRE_LABEL, GAME_STATUS_LABEL } from "./GameCard";
import MediaSearchField from "./MediaSearchField";
import BottomSheet from "./BottomSheet";
import SheetActions from "./SheetActions";

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
  // Lien RAWG
  const [rawgId, setRawgId] = useState<number | undefined>();
  const [coverUrl, setCoverUrl] = useState<string | undefined>();

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
    setRawgId(initial?.rawgId);
    setCoverUrl(initial?.coverUrl);
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handlePick(r: GameSearchResult) {
    setTitle(r.title);
    if (r.released) setReleaseDate(r.released);
    const p = mapPlatform(r.platforms);
    if (p) setPlatform(p);
    const g = mapGenre(r.genres);
    if (g) setGenre(g);
    setRawgId(r.id);
    setCoverUrl(r.posterUrl);
  }

  function unlink() {
    setRawgId(undefined);
    setCoverUrl(undefined);
  }

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
      rawgId,
      coverUrl,
      source: rawgId ? "rawg" : "manual",
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

  const color = t.media.game;

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
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.heading}>{initial ? "Modifier le jeu" : "Ajouter un jeu"}</Text>

      {hasRawgKey() && !rawgId && (
        <>
          <Text style={styles.label}>{initial ? "Relier à RAWG" : "Rechercher un jeu"}</Text>
          <MediaSearchField
            placeholder="Ex. Hollow Knight"
            search={searchGames}
            onPick={handlePick}
            color={color}
            credit="Données et images : RAWG"
          />
        </>
      )}

      {!!rawgId && (
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
              Relié à RAWG{releaseDate ? ` · ${releaseDate.slice(0, 4)}` : ""}
            </Text>
          </View>
          <Pressable
            onPress={unlink}
            accessibilityRole="button"
            accessibilityLabel="Retirer le lien RAWG"
            style={styles.unlinkBtn}
          >
            <Ionicons name="close" size={20} color={t.textMuted} />
          </Pressable>
        </View>
      )}

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

      <Text style={styles.label}>Où j’en suis (optionnel)</Text>
      <TextInput
        value={lastCheckpoint}
        onChangeText={setLastCheckpoint}
        placeholder="Ex. Chapitre 3, boss de la forêt…"
        placeholderTextColor={t.textMuted}
        style={styles.input}
      />

      <Text style={styles.label}>Date de sortie (optionnel)</Text>
      <DateField
        value={releaseDate}
        onChange={setReleaseDate}
        color={color}
        accessibilityLabel="Date de sortie"
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
    linkedCover: { width: 72, height: 48, borderRadius: 10 },
    linkedTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    linkedMeta: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), marginTop: 2 },
    unlinkBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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