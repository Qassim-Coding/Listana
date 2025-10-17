import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import EditPodcastModal from "../components/EditPodcastModal";
import PodcastCard from "../components/PodcastCard";
import {
    addPodcast,
    duplicatePodcastFrom,
    getPodcasts,
    sortPodcasts,
    updatePodcast
} from "../storage/podcast.store";
import { Podcast } from "../types/podcast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PodcastsScreen() {
  const insets = useSafeAreaInsets();
  const [podcasts, setPodcasts] = useState<Podcast[]>(getPodcasts());
  const [filter, setFilter] = useState<"all" | Podcast["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "podcast" | "audiobook">("all");
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);

  function handleAdd() {
    setEditingPodcast(null);
    setModalVisible(true);
  }

  function handleEdit(podcast: Podcast) {
    setEditingPodcast(podcast);
    setModalVisible(true);
  }

  function handleSubmit(changes: Partial<Podcast>) {
    if (editingPodcast) {
      updatePodcast(editingPodcast.id, changes);
    } else {
      const now = Date.now();
      const newPodcast: Podcast = {
        id: Date.now().toString(),
        title: (changes.title || "Sans titre") as string,
        host: changes.host,
        status: (changes.status || "toListen") as Podcast["status"],
        kind: (changes as any).kind ?? "podcast",
        notes: changes.notes,
        lastEpisode: changes.lastEpisode,
        createdAt: now,
        updatedAt: now,
        archived: false,
      };
      addPodcast(newPodcast);
    }
    setPodcasts(getPodcasts());
    setModalVisible(false);
    setEditingPodcast(null);
  }

  function handleDuplicate(podcast: Podcast) {
    const copy = duplicatePodcastFrom(podcast);
    addPodcast(copy);
    setPodcasts(getPodcasts());
    setModalVisible(false);
    setEditingPodcast(null);
  }

  const filteredByType =
    typeFilter === "all" ? podcasts : podcasts.filter((p) => (p.kind ?? "podcast") === typeFilter);

  const filteredByStatus =
    filter === "all" ? filteredByType : filteredByType.filter((p) => p.status === filter);

  const sortedPodcasts =
    sortBy === "updated"
      ? sortPodcasts(filteredByStatus)
      : [...filteredByStatus].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🎧 Mes podcasts</Text>

      {/* Filtre Type */}
      <View style={styles.row}>
        {[{ key: "all", label: "Tous types" }, { key: "podcast", label: "Podcast" }, { key: "audiobook", label: "Livre audio" }].map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setTypeFilter(opt.key as any)}
            style={[styles.filterBtn, typeFilter === (opt.key as any) && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, typeFilter === (opt.key as any) && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Filtres Statut */}
      <View style={styles.row}>
        {["all", "toListen", "listening", "completed", "abandoned"].map((key) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key as any)}
            style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
              {labelStatus(key)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tri */}
      <View style={styles.row}>
        {["updated", "title"].map((key) => (
          <Pressable
            key={key}
            onPress={() => setSortBy(key as any)}
            style={[styles.sortBtn, sortBy === key && styles.sortBtnActive]}
          >
            <Text style={[styles.sortText, sortBy === key && styles.sortTextActive]}>
              Trier par {key === "updated" ? "modification" : "titre"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Liste */}
      {sortedPodcasts.length === 0 ? (
        <View style={styles.empty}> 
          <Text style={styles.emptyTitle}>Aucun podcast pour l'instant</Text>
          <Text style={styles.emptySub}>Ajoute un podcast avec le bouton ci-dessous.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPodcasts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          renderItem={({ item }) => (
            <PodcastCard
              item={item}
              selected={false}
              onSelect={() => handleEdit(item)}
              onDuplicate={() => handleDuplicate(item)}
            />
          )}
        />
      )}

      {/* Bouton ajouter */}
      <Pressable
        style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
        onPress={handleAdd}
      >
        <Text style={styles.addText}>＋ Ajouter un podcast</Text>
      </Pressable>

      {/* Modale */}
      <EditPodcastModal
        visible={modalVisible}
        initial={editingPodcast}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

function labelStatus(key: string) {
  switch (key) {
    case "all":
      return "Tous";
    case "toListen":
      return "À écouter";
    case "listening":
      return "En cours";
    case "completed":
      return "Terminé";
    case "abandoned":
      return "Abandonné";
    default:
      return key;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterBtnActive: { backgroundColor: "#12AAB8" },
  filterText: { fontSize: 13, color: "#111827" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  sortBtnActive: { backgroundColor: "#0EA5E9" },
  sortText: { fontSize: 12, color: "#333" },
  sortTextActive: { color: "#fff", fontWeight: "600" },
  addBtn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#6B7280" },
});

