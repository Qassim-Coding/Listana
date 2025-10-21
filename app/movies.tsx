import { Stack } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddMovieModal from "../src/components/AddMovieModal";
import EditMovieModal from "../src/components/EditMovieModal";
import MovieCard from "../src/components/MovieCard";
import WebBackButton from "../src/components/WebBackButton";
import { useMovies } from "../src/hooks/useMovies";
import { Movie } from "../src/types/movie";

const isWeb = Platform.OS === 'web';

export default function MoviesScreen() {
  const {
    movies,
    visibleMovies,
    loading,
    addMovie,
    updateProgress,
    markDone,
    updateMovie,
    removeMovie,
    doneCount,
    filter,
    setFilter,
    sort,
    setSort,
  } = useMovies();

  const insets = useSafeAreaInsets();
  const [openAdd, setOpenAdd] = useState(false);

  // état pour l'édition
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);

  const data = Array.isArray(visibleMovies) ? visibleMovies : movies;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={insets.top + 8}
      >
        {/* Header natif Expo Router */}
        {!isWeb && (
          <Stack.Screen
            options={{
              headerShown: true,
              title: "Mes Films",
              headerTitleStyle: {
                fontFamily: "Poppins_700Bold",
                fontSize: 22,
                color: "#111827",
              },
              headerBackTitleVisible: false,
              headerTintColor: "#12AAB8",
            }}
          />
        )}
        {isWeb && <WebBackButton title="Mes Films" />}

        {/* Contenu */}
        {loading ? (
          <View style={styles.center}>
            <Text>Chargement…</Text>
          </View>
        ) : movies.length === 0 ? (
          <View style={[styles.empty, { paddingBottom: 24 + insets.bottom }]}>
            <Text style={styles.emptyTitle}>Aucun film pour l’instant</Text>
            <Text style={styles.emptySub}>
              Ajoute un film avec le bouton ci-dessous. Tu peux indiquer la
              durée, tes notes et marquer quand tu l’as terminé.
            </Text>
          </View>
        ) : (
          <>
            {/* Filtres & Tri */}
            <View style={styles.controlsRow}>
              <View style={styles.segment}>
                {[
                  { key: "all", label: "Tous" },
                  { key: "planning", label: "À voir" },
                  { key: "watching", label: "En cours" },
                  { key: "done", label: "Terminés" },
                  { key: "dropped", label: "Abandonnés" },
                ].map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setFilter(opt.key as any)}
                    style={[
                      styles.segmentBtn,
                      filter === (opt.key as any) && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        filter === (opt.key as any) &&
                          styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.segment}>
                {[
                  { key: "date", label: "Date" },
                  { key: "title", label: "Titre" },
                  { key: "status", label: "Statut" },
                ].map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setSort(opt.key as any)}
                    style={[
                      styles.segmentBtn,
                      sort === (opt.key as any) && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        sort === (opt.key as any) &&
                          styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <FlatList
              data={data}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  onUpdateProgress={(id, min) => updateProgress(id, min)}
                  onMarkDone={(id) => markDone(id)}
                  onRemove={(id) => removeMovie(id)}
                  onEdit={(m) => {
                    setEditing(m);
                    setOpenEdit(true);
                  }}
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 24 + insets.bottom + 64,
              }}
            />
          </>
        )}

        {/* Bouton ajouter (style jeux-vidéos) */}
        <Pressable
          style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
          onPress={() => setOpenAdd(true)}
        >
          <Text style={styles.addText}>＋ Ajouter un film</Text>
        </Pressable>

        {/* Modales */}
        <AddMovieModal
          visible={openAdd}
          onClose={() => setOpenAdd(false)}
          onSubmit={({ title, year, runtime, review }) => {
            addMovie({ title, year, runtime, review });
            setOpenAdd(false);
          }}
        />

        <EditMovieModal
          visible={openEdit}
          initial={editing}
          onClose={() => {
            setOpenEdit(false);
            setEditing(null);
          }}
          onSubmit={(patch) => {
            if (editing) {
              updateMovie(editing.id, patch);
            }
            setOpenEdit(false);
            setEditing(null);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  empty: { paddingHorizontal: 24, alignItems: "center" },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#0E5A90",
  },
  emptySub: { color: "#6B7280", textAlign: "center", marginTop: 6 },

  addBtn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  addText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // filtres & tri
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    padding: 4,
  },
  segmentBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  segmentBtnActive: { backgroundColor: "#12AAB8" },
  segmentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#0F172A",
  },
  segmentTextActive: { color: "#fff" },
});
