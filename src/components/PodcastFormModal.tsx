import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppleSearchResult, searchAppleAudiobooks, searchApplePodcasts } from "../api/itunes";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Podcast, PodcastKind, PodcastStatus } from "../types/podcast";
import BottomSheet from "./BottomSheet";
import MediaSearchField from "./MediaSearchField";
import { PODCAST_KIND_LABEL, PODCAST_STATUS_LABEL } from "./PodcastCard";
import SheetActions from "./SheetActions";

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
  // Lien Apple (rempli quand on choisit un résultat de recherche)
  const [appleId, setAppleId] = useState<number | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [storeUrl, setStoreUrl] = useState<string | undefined>(undefined);
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [episodeCount, setEpisodeCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setHost(initial?.host ?? "");
    setStatus(initial?.status ?? "toListen");
    setKind(initial?.kind ?? "podcast");
    setLastEpisode(initial?.lastEpisode ?? "");
    setNotes(initial?.notes ?? "");
    setAppleId(initial?.appleId);
    setCoverUrl(initial?.coverUrl);
    setStoreUrl(initial?.storeUrl);
    setGenre(initial?.genre);
    setEpisodeCount(initial?.episodeCount);
  }, [initial, visible]);

  const valid = title.trim().length > 0;

  function handlePick(r: AppleSearchResult) {
    setTitle(r.title);
    if (r.author) setHost(r.author);
    setAppleId(r.id);
    setCoverUrl(r.posterUrl);
    setStoreUrl(r.storeUrl);
    setGenre(r.genre);
    setEpisodeCount(r.episodeCount);
  }

  function unlink() {
    setAppleId(undefined);
    setCoverUrl(undefined);
    setStoreUrl(undefined);
    setGenre(undefined);
    setEpisodeCount(undefined);
  }

  // Un lien pris dans le catalogue des podcasts ne vaut pas pour un livre audio (et inversement)
  function changeKind(k: PodcastKind) {
    if (k !== kind && appleId) unlink();
    setKind(k);
  }

  function handleSave() {
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      host: host.trim() || undefined,
      status,
      kind,
      lastEpisode: lastEpisode.trim() || undefined,
      notes: notes.trim() || undefined,
      appleId,
      coverUrl,
      storeUrl,
      genre,
      episodeCount,
      source: appleId ? "apple" : "manual",
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

  const color = t.media.podcast;
  const store = kind === "audiobook" ? "Apple Books" : "Apple Podcasts";
  const linkedMeta = [
    `Relié à ${store}`,
    episodeCount ? `${episodeCount} épisode${episodeCount > 1 ? "s" : ""}` : "",
    genre ?? "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.heading}>{initial ? "Modifier" : "Ajouter un podcast ou un livre audio"}</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.segment}>
        {KINDS.map((k) => {
          const on = kind === k;
          return (
            <Pressable
              key={k}
              onPress={() => changeKind(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.segmentBtn, on && styles.segmentBtnOn]}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{PODCAST_KIND_LABEL[k]}</Text>
            </Pressable>
          );
        })}
      </View>

      {!appleId && (
        <>
          <Text style={styles.label}>
            {kind === "audiobook" ? "Rechercher un livre audio" : "Rechercher un podcast"}
          </Text>
          {/* La fonction de recherche change avec le type : podcasts ou livres audio */}
          <MediaSearchField
            placeholder={kind === "audiobook" ? "Ex. Dune" : "Ex. 10'000 pas du Raptor"}
            search={kind === "audiobook" ? searchAppleAudiobooks : searchApplePodcasts}
            onPick={handlePick}
            color={color}
            credit={`Recherche et pochettes : ${store}`}
          />
        </>
      )}

      {!!appleId && (
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
            <Text style={[styles.linkedMeta, { color }]} numberOfLines={2}>
              {linkedMeta}
            </Text>
          </View>
          <Pressable
            onPress={unlink}
            accessibilityRole="button"
            accessibilityLabel={`Retirer le lien ${store}`}
            style={styles.unlinkBtn}
          >
            <Ionicons name="close" size={20} color={t.textMuted} />
          </Pressable>
        </View>
      )}

      <Text style={styles.label}>Titre *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ex. 10'000 pas"
        placeholderTextColor={t.textMuted}
      />

      <Text style={styles.label}>{kind === "audiobook" ? "Auteur / narrateur" : "Animateur"} (optionnel)</Text>
      <TextInput
        style={styles.input}
        value={host}
        onChangeText={setHost}
        placeholder={kind === "audiobook" ? "Optionnel" : "Ex. Le Raptor"}
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
        <SheetActions
          onDuplicate={
            onDuplicate
              ? () => {
                  onDuplicate(initial);
                  onClose();
                }
              : undefined
          }
          onDelete={onDelete ? handleDelete : undefined}
        />
      )}
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
    linkedCover: { width: 56, height: 56, borderRadius: 12 },
    linkedTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    linkedMeta: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), marginTop: 2 },
    unlinkBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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