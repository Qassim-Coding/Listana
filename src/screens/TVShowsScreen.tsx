import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddTVShowModal from "../components/AddTVShowModal";
import EditTVShowModal from "../components/EditTVShowModal";
import TVShowCard from "../components/TVShowCard";
import { useTVShows } from "../hooks/useTVShows";
import { TVShow } from "../types/tvshow";

export default function TVShowsScreen() {
  const insets = useSafeAreaInsets();
  const {
    visibleShows,
    loading,
    addShow,
    updateShow,
    removeShow,
    markDone,
    incrementEpisode,
    startEpisode,
    filter,
    setFilter,
    sort,
    setSort,
  } = useTVShows();

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState<TVShow | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#12AAB8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filters}>
        {["all", "planning", "watching", "done", "dropped"].map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f as any)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all"
                ? "Tous"
                : f === "planning"
                ? "À voir"
                : f === "watching"
                ? "En cours"
                : f === "done"
                ? "Terminés"
                : "Abandonnés"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tri */}
      <View style={styles.filters}>
        {["date", "title", "status"].map((s) => (
          <Pressable
            key={s}
            onPress={() => setSort(s as any)}
            style={[styles.filterBtn, sort === s && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, sort === s && styles.filterTextActive]}>
              {s === "date" ? "Date" : s === "title" ? "Titre" : "Statut"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Liste */}
      {visibleShows.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Ajoute ta première série 😊</Text>
        </View>
      ) : (
        <FlatList
          data={visibleShows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TVShowCard
              show={item}
              onEdit={(s) => {
                setSelected(s);
                setEditVisible(true);
              }}
              onRemove={removeShow}
              onMarkDone={markDone}
              onIncrementEpisode={incrementEpisode}
              onStartEpisode={startEpisode}
            />
          )}
        />
      )}

      {/* Bouton ajouter (style jeux-vidéos) */}
      <Pressable
        style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
        onPress={() => setAddVisible(true)}
      >
        <Text style={styles.addText}>＋ Ajouter une série</Text>
      </Pressable>

      {/* Modales */}
      <AddTVShowModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSubmit={async (data) => {
          await addShow(data);
          setAddVisible(false);
        }}
      />
      <EditTVShowModal
        visible={editVisible}
        initial={selected}
        onClose={() => setEditVisible(false)}
        onSubmit={async (changes) => {
          if (selected) {
            await updateShow(selected.id, changes);
          }
          setEditVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 16, color: "#6B7280", fontFamily: "Poppins_400Regular" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterBtnActive: { backgroundColor: "#12AAB8" },
  filterText: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#111827" },
  filterTextActive: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
  addBtn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 12,
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

