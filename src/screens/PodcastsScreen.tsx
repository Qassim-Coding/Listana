import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APPLE_PODCASTS_URL } from "../api/itunes";
import PodcastCard, { PODCAST_STATUS_LABEL } from "../components/PodcastCard";
import PodcastFormModal from "../components/PodcastFormModal";
import {
  addPodcast,
  deletePodcast,
  duplicatePodcastFrom,
  getPodcasts,
  initPodcasts,
  searchPodcasts,
  sortPodcasts,
  updatePodcast,
} from "../storage/podcast.store";
import { Theme } from "../theme";
import { statusColors } from "../constants/statusColors";
import { useTheme } from "../ThemeContext";
import { Podcast } from "../types/podcast";
import { useOpenAddFromLink } from "../hooks/useOpenAddFromLink";

type Filter = "all" | Podcast["status"];
type KindFilter = "all" | "podcast" | "audiobook";

const FILTERS: Filter[] = ["all", "listening", "toListen", "completed", "abandoned"];
const KINDS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "podcast", label: "Podcasts" },
  { key: "audiobook", label: "Livres audio" },
];

// Remplace le dernier nombre par nombre + 1 ("Ép. 41" → "Ép. 42", vide → "1")
function bumpEpisode(value?: string): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return "1";
  const m = raw.match(/(\d+)(?!.*\d)/);
  if (!m || m.index === undefined) return null;
  const next = String(parseInt(m[1], 10) + 1);
  return raw.slice(0, m.index) + next + raw.slice(m.index + m[1].length);
}

export default function PodcastsScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [podcasts, setPodcasts] = useState<Podcast[]>(getPodcasts());
  const [filter, setFilter] = useState<Filter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);

  useEffect(() => {
    (async () => {
      await initPodcasts();
      setPodcasts([...getPodcasts()]);
    })();
  }, []);

  const refresh = () => setPodcasts([...getPodcasts()]);

  function handleAdd() {
    setEditing(null);
    setModalVisible(true);
  }

  // Ouvert depuis le widget « Ajouter » (listana://…?add=1) : on ouvre directement la fenêtre d'ajout
  useOpenAddFromLink(handleAdd);

  function handleEdit(p: Podcast) {
    setEditing(p);
    setModalVisible(true);
  }

  function handleSubmit(changes: Partial<Podcast>) {
    if (editing) {
      updatePodcast(editing.id, changes);
    } else {
      const now = Date.now();
      addPodcast({
        id: now.toString(),
        title: (changes.title || "Sans titre") as string,
        host: changes.host,
        status: (changes.status || "toListen") as Podcast["status"],
        kind: changes.kind ?? "podcast",
        notes: changes.notes,
        lastEpisode: changes.lastEpisode,
        // Lien Apple : à recopier ici, sinon il serait perdu à l'ajout
        appleId: changes.appleId,
        coverUrl: changes.coverUrl,
        storeUrl: changes.storeUrl,
        genre: changes.genre,
        episodeCount: changes.episodeCount,
        source: changes.source ?? "manual",
        createdAt: now,
        updatedAt: now,
        archived: false,
      } as Podcast);
    }
    refresh();
  }

  function handleNextEpisode(p: Podcast) {
    const next = bumpEpisode(p.lastEpisode);
    if (next === null) {
      handleEdit(p);
      return;
    }
    updatePodcast(p.id, {
      lastEpisode: next,
      status: p.status === "toListen" || p.status === "abandoned" ? "listening" : p.status,
    });
    refresh();
  }

  function handleDuplicate(p: Podcast) {
    addPodcast(duplicatePodcastFrom(p));
    refresh();
  }

  function handleDelete(p: Podcast) {
    deletePodcast(p.id);
    refresh();
  }

  const active = podcasts
    .filter((p) => !p.archived)
    .filter((p) => (kindFilter === "all" ? true : (p.kind ?? "podcast") === kindFilter));
  const count = (f: Filter) => (f === "all" ? active.length : active.filter((p) => p.status === f).length);
  const usesApple = active.some((p) => !!p.appleId);

  const bySearch = query ? searchPodcasts(active, query) : active;
  const byStatus = filter === "all" ? bySearch : bySearch.filter((p) => p.status === filter);
  const shown =
    sortBy === "updated"
      ? sortPodcasts(byStatus)
      : [...byStatus].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        {/* Filtre MA liste (pas une recherche en ligne : celle-ci est dans la fenêtre « Ajouter ») */}
        <Ionicons name="funnel-outline" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Filtrer ma liste"
          placeholderTextColor={t.textMuted}
          accessibilityLabel="Filtrer ma liste de podcasts et livres audio"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.segment}>
        {KINDS.map((k) => {
          const on = kindFilter === k.key;
          return (
            <Pressable
              key={k.key}
              onPress={() => setKindFilter(k.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.segmentBtn, on && styles.segmentBtnOn]}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{k.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => {
          const on = filter === f;
          // Chaque état garde sa couleur (Tous reste neutre)
          const tone = statusColors(t, f);
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                styles.chip,
                tone && { backgroundColor: tone.chipBg, borderColor: tone.chipBorder },
                on && (tone ? { backgroundColor: tone.chipOnBg, borderColor: tone.chipOnBg } : styles.chipOn),
              ]}
            >
              <Text style={[styles.chipText, tone && { color: t.text }, on && (tone ? { color: tone.chipOnText } : styles.chipTextOn)]}>
                {f === "all" ? "Tous" : PODCAST_STATUS_LABEL[f]} · {count(f)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {shown.length} élément{shown.length > 1 ? "s" : ""}
        </Text>
        <Pressable onPress={() => setSortBy(sortBy === "updated" ? "title" : "updated")} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.sortText}>{sortBy === "updated" ? "Plus récents ↓" : "Titre A → Z"}</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        ListEmptyComponent={<Text style={styles.empty}>Rien ici pour l'instant.</Text>}
        ListFooterComponent={
          usesApple ? (
            <Pressable
              onPress={() => Linking.openURL(APPLE_PODCASTS_URL)}
              accessibilityRole="link"
              accessibilityLabel="Pochettes et infos fournies par Apple Podcasts et Apple Books, ouvrir le site"
              style={styles.credit}
            >
              <Text style={styles.creditText}>Pochettes et infos : Apple Podcasts et Apple Books</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <PodcastCard item={item} onEdit={handleEdit} onNextEpisode={handleNextEpisode} />
        )}
      />

      <Pressable onPress={handleAdd} accessibilityRole="button" style={[styles.addBtn, { bottom: 16 + insets.bottom }]}>
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter</Text>
      </Pressable>

      <PodcastFormModal
        visible={modalVisible}
        initial={editing}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 16, paddingTop: 12 },
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    searchInput: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.text },
    segment: { flexDirection: "row", gap: 4, padding: 4, borderRadius: 16, backgroundColor: t.card, marginTop: 12 },
    segmentBtn: { flex: 1, minHeight: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    segmentBtnOn: { backgroundColor: t.cardAlt },
    segmentText: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    segmentTextOn: { fontFamily: t.fonts.bold, color: t.text },
    chipsScroll: { flexGrow: 0, marginTop: 12 },
    chips: { gap: 8, paddingRight: 16 },
    chip: {
      minHeight: 40,
      paddingHorizontal: 14,
      borderRadius: 20,
      justifyContent: "center",
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipOn: { backgroundColor: t.text, borderColor: t.text },
    chipText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    chipTextOn: { color: t.bg },
    listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 8 },
    listCount: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    sortText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.text },
    list: { flex: 1 },
    empty: { textAlign: "center", marginTop: 40, fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.textMuted },
    addBtn: {
      position: "absolute",
      left: 16,
      right: 16,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    addText: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    credit: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12, marginTop: 4 },
    creditText: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, textDecorationLine: "underline" },
  });
}