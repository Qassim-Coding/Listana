import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MovieCard from "../src/components/MovieCard";
import MovieFormModal from "../src/components/MovieFormModal";
import ProgressUpdateModal from "../src/components/ProgressUpdateModal";
import WebBackButton from "../src/components/WebBackButton";
import { MOVIE_STATUS_LABEL, useMovies } from "../src/hooks/useMovies";
import { Theme, makeHeaderOptions } from "../src/theme";
import { statusColors } from "../src/constants/statusColors";
import { useTheme } from "../src/ThemeContext";
import { Movie } from "../src/types/movie";

const isWeb = Platform.OS === "web";

type Filter = "all" | "watching" | "planning" | "done" | "dropped";
const FILTERS: Filter[] = ["all", "watching", "planning", "done", "dropped"];
const SORT_LABEL = { date: "Plus récents ↓", title: "Titre A → Z", status: "Par statut" } as const;
const NEXT_SORT = { date: "title", title: "status", status: "date" } as const;

export default function MoviesScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const {
    movies,
    visibleMovies,
    loading,
    addMovie,
    updateProgress,
    markDone,
    updateMovie,
    removeMovie,
    filter,
    setFilter,
    sort,
    setSort,
  } = useMovies();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [progressMovie, setProgressMovie] = useState<Movie | null>(null);

  const count = (f: Filter) => (f === "all" ? movies.length : movies.filter((m) => m.status === f).length);
  const q = query.trim().toLowerCase();
  const shown = q ? visibleMovies.filter((m) => m.title.toLowerCase().includes(q)) : visibleMovies;

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(movie: Movie) {
    setEditing(movie);
    setFormOpen(true);
  }

  return (
    <View style={styles.screen}>
      {!isWeb && <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Films" }} />}
      {isWeb && <WebBackButton title="Films" />}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.search}>
            {/* Filtre MA liste (pas une recherche en ligne : celle-ci est dans la fenêtre « Ajouter ») */}
            <Ionicons name="funnel-outline" size={18} color={t.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Filtrer ma liste"
              placeholderTextColor={t.textMuted}
              accessibilityLabel="Filtrer ma liste de films"
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
                    {f === "all" ? "Tous" : MOVIE_STATUS_LABEL[f]} · {count(f)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.listHeader}>
            <Text style={styles.listCount}>
              {shown.length} film{shown.length > 1 ? "s" : ""}
            </Text>
            <Pressable onPress={() => setSort(NEXT_SORT[sort])} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.sortText}>{SORT_LABEL[sort]}</Text>
            </Pressable>
          </View>

          <FlatList
            style={styles.list}
            data={shown}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            ListEmptyComponent={<Text style={styles.empty}>Aucun film ici pour l'instant.</Text>}
            renderItem={({ item }) => (
              <MovieCard movie={item} onEdit={openEdit} onUpdateProgress={setProgressMovie} />
            )}
          />
        </View>
      )}

      <Pressable onPress={openAdd} accessibilityRole="button" style={[styles.addBtn, { bottom: 16 + insets.bottom }]}>
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter un film</Text>
      </Pressable>

      <MovieFormModal
        visible={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => {
          if (editing) updateMovie(editing.id, data);
          else addMovie(data);
        }}
        onDelete={(m) => removeMovie(m.id)}
      />

      <ProgressUpdateModal
        visible={!!progressMovie}
        itemTitle={progressMovie?.title ?? ""}
        currentLabel={`Actuellement : ${progressMovie?.progressMinutes ?? 0}${
          progressMovie?.runtime ? ` / ${progressMovie.runtime}` : ""
        } min`}
        inputLabel="J'en suis à (minutes)"
        start={progressMovie?.progressMinutes ?? 0}
        total={progressMovie?.runtime}
        quick={[10, 30, 60]}
        unit={() => "min"}
        onClose={() => setProgressMovie(null)}
        onSave={(min) => progressMovie && updateProgress(progressMovie.id, min)}
        onMarkDone={() => progressMovie && markDone(progressMovie.id)}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  });
}