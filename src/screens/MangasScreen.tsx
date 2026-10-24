import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MAL_URL } from "../api/mal";
import EditMangaModal from "../components/EditMangaModal";
import MangaCard from "../components/MangaCard";
import UpdateMangaProgressModal from "../components/UpdateMangaProgressModal";
import {
  addManga,
  deleteManga,
  duplicateMangaFrom,
  getMangas,
  initMangas,
  searchMangas,
  sortMangas,
  updateManga,
} from "../storage/manga.store";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Manga, MangaStatus } from "../types/manga";
import { MANGA_STATUS_LABEL } from "../utils/mangaProgress";

type Filter = "all" | MangaStatus;
const FILTERS: Filter[] = ["all", "reading", "toRead", "completed", "abandoned"];

export default function MangasScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [mangas, setMangas] = useState<Manga[]>(getMangas());
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [progressManga, setProgressManga] = useState<Manga | null>(null);

  useEffect(() => {
    (async () => {
      await initMangas();
      setMangas([...getMangas()]);
    })();
  }, []);

  const refresh = () => setMangas([...getMangas()]);

  function handleAdd() {
    setEditingManga(null);
    setModalVisible(true);
  }

  function handleEdit(manga: Manga) {
    setEditingManga(manga);
    setModalVisible(true);
  }

  function handleSubmit(changes: Partial<Manga>) {
    if (editingManga) {
      updateManga(editingManga.id, changes);
    } else {
      const now = Date.now();
      const newManga: Manga = {
        id: cryptoRandom(),
        title: (changes.title || "Sans titre") as string,
        series: changes.series,
        status: (changes.status || "toRead") as Manga["status"],
        progressMode: changes.progressMode,
        volumeNumber: changes.volumeNumber,
        chapterNumber: changes.chapterNumber,
        pagesTotal: changes.pagesTotal,
        pagesRead: changes.pagesRead,
        notes: changes.notes,
        lastChapter: changes.lastChapter,
        malId: changes.malId,
        coverUrl: changes.coverUrl,
        totalVolumes: changes.totalVolumes,
        totalChapters: changes.totalChapters,
        source: changes.source,
        createdAt: now,
        updatedAt: now,
        archived: false,
      };
      addManga(newManga);
    }
    refresh();
  }

  function handleDuplicate(manga: Manga) {
    addManga(duplicateMangaFrom(manga));
    refresh();
  }

  function handleDelete(manga: Manga) {
    deleteManga(manga.id);
    refresh();
  }

  function handleProgress(changes: Partial<Manga>) {
    if (progressManga) updateManga(progressManga.id, changes);
    refresh();
  }

  const active = mangas.filter((m) => !m.archived);
  const usesMal = active.some((m) => !!m.malId);
  const count = (f: Filter) =>
    f === "all" ? active.length : active.filter((m) => m.status === f).length;

  const bySearch = query ? searchMangas(active, query) : active;
  const byStatus = filter === "all" ? bySearch : bySearch.filter((m) => m.status === filter);
  const sorted =
    sortBy === "updated"
      ? sortMangas(byStatus)
      : [...byStatus].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un manga"
          placeholderTextColor={t.textMuted}
          accessibilityLabel="Rechercher un manga"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => {
          const on = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {f === "all" ? "Tous" : MANGA_STATUS_LABEL[f]} · {count(f)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {sorted.length} manga{sorted.length > 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={() => setSortBy(sortBy === "updated" ? "title" : "updated")}
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text style={styles.sortText}>
            {sortBy === "updated" ? "Plus récents ↓" : "Titre A → Z"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun manga ici pour l’instant.</Text>}
        ListFooterComponent={
          usesMal ? (
            <Pressable
              onPress={() => Linking.openURL(MAL_URL)}
              accessibilityRole="link"
              accessibilityLabel="Données des mangas fournies par MyAnimeList, ouvrir myanimelist.net"
              style={styles.credit}
            >
              <Text style={styles.creditText}>Données et couvertures : MyAnimeList</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <MangaCard item={item} onSelect={handleEdit} onUpdateProgress={setProgressManga} />
        )}
      />

      <Pressable
        onPress={handleAdd}
        accessibilityRole="button"
        style={[styles.addBtn, { bottom: 16 + insets.bottom }]}
      >
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter un manga</Text>
      </Pressable>

      <EditMangaModal
        visible={modalVisible}
        initial={editingManga}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      <UpdateMangaProgressModal
        manga={progressManga}
        onClose={() => setProgressManga(null)}
        onSubmit={handleProgress}
      />
    </View>
  );
}

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
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
    searchInput: {
      flex: 1,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(15),
      color: t.text,
    },
    chipsScroll: { flexGrow: 0, marginTop: 14 },
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
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 14,
      marginBottom: 8,
    },
    listCount: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    sortText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.text },
    list: { flex: 1 },
    empty: {
      textAlign: "center",
      marginTop: 40,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      color: t.textMuted,
    },
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