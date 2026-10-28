import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TVShowCard from "../components/TVShowCard";
import TVShowFormModal from "../components/TVShowFormModal";
import { NewTVShow, TV_STATUS_LABEL, useTVShows } from "../hooks/useTVShows";
import { Theme } from "../theme";
import { statusColors } from "../constants/statusColors";
import { useTheme } from "../ThemeContext";
import { TVShow } from "../types/tvshow";
import { useOpenAddFromLink } from "../hooks/useOpenAddFromLink";

type Filter = "all" | TVShow["status"];
const FILTERS: Filter[] = ["all", "watching", "planning", "done", "dropped"];
const SORT_LABEL = { date: "Plus récents ↓", title: "Titre A → Z", status: "Par statut" } as const;
const NEXT_SORT = { date: "title", title: "status", status: "date" } as const;

export default function TVShowsScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const {
    shows,
    visibleShows,
    loading,
    addShow,
    updateShow,
    removeShow,
    incrementEpisode,
    filter,
    setFilter,
    sort,
    setSort,
  } = useTVShows();

  const [query, setQuery] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<TVShow | null>(null);

  function openAdd() {
    setSelected(null);
    setFormVisible(true);
  }

  // Ouvert depuis le widget « Ajouter » (listana://…?add=1) : on ouvre directement la fenêtre d'ajout.
  // Appelé AVANT le « if (loading) return » : React veut les mêmes hooks, dans le même ordre, à chaque affichage.
  useOpenAddFromLink(openAdd);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const count = (f: Filter) => (f === "all" ? shows.length : shows.filter((s) => s.status === f).length);
  const q = query.trim().toLowerCase();
  const shown = q ? visibleShows.filter((s) => s.title.toLowerCase().includes(q)) : visibleShows;

  function openEdit(show: TVShow) {
    setSelected(show);
    setFormVisible(true);
  }

  function handleSubmit(data: NewTVShow) {
    if (selected) updateShow(selected.id, data);
    else addShow(data);
  }

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
          accessibilityLabel="Filtrer ma liste de séries"
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
                {f === "all" ? "Toutes" : TV_STATUS_LABEL[f]} · {count(f)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {shown.length} série{shown.length > 1 ? "s" : ""}
        </Text>
        <Pressable onPress={() => setSort(NEXT_SORT[sort])} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.sortText}>{SORT_LABEL[sort]}</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune série ici pour l'instant.</Text>}
        renderItem={({ item }) => (
          <TVShowCard show={item} onEdit={openEdit} onIncrementEpisode={incrementEpisode} />
        )}
      />

      <Pressable
        onPress={openAdd}
        accessibilityRole="button"
        style={[styles.addBtn, { bottom: 16 + insets.bottom }]}
      >
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter une série</Text>
      </Pressable>

      <TVShowFormModal
        visible={formVisible}
        initial={selected}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onDelete={(s) => removeShow(s.id)}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 16, paddingTop: 12 },
    center: { justifyContent: "center", alignItems: "center" },
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
  });
}