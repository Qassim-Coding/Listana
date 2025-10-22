import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EditMangaModal from "../components/EditMangaModal";
import MangaCard from "../components/MangaCard";
import {
    addManga,
    deleteManga,
    duplicateMangaFrom,
    getMangas,
    searchMangas,
    sortMangas,
    updateManga,
} from "../storage/manga.store";
import { Manga } from "../types/manga";

export default function MangasScreen() {
  const insets = useSafeAreaInsets();
  const [mangas, setMangas] = useState<Manga[]>(getMangas());
  const [filter, setFilter] = useState<"all" | NonNullable<Manga["status"]>>("all");
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingManga, setEditingManga] = useState<Manga | null>(null);

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
        volumeNumber: changes.volumeNumber,
        chapterNumber: changes.chapterNumber,
        pagesTotal: changes.pagesTotal,
        pagesRead: changes.pagesRead,
        notes: changes.notes,
        lastChapter: changes.lastChapter,
        createdAt: now,
        updatedAt: now,
        archived: false,
      };
      addManga(newManga);
    }
    setMangas(getMangas());
  }

  function handleDuplicate(manga: Manga) {
    const copy = duplicateMangaFrom(manga);
    addManga(copy);
    setMangas(getMangas());
  }

  const filteredBySearch = query ? searchMangas(mangas, query) : mangas;
  const filteredByStatus =
    filter === "all" ? filteredBySearch : filteredBySearch.filter((m) => m.status === filter);

  const sortedMangas =
    sortBy === "updated"
      ? sortMangas(filteredByStatus)
      : [...filteredByStatus].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📚 Mes mangas</Text>

      {/* Filtres */}
      <View style={styles.row}>
        {["all", "toRead", "reading", "completed", "abandoned"].map((key) => (
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
      <FlatList
        data={sortedMangas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <MangaCard
            item={item}
            selected={false}
            onSelect={() => handleEdit(item)}
            onDuplicate={() => handleDuplicate(item)}
            onRemove={() => {
              deleteManga(item.id);
              setMangas(getMangas());
            }}
          />
        )}
      />

      {/* Bouton ajouter */}
      <Pressable
        style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
        onPress={handleAdd}
      >
        <Text style={styles.addText}>＋ Ajouter un manga</Text>
      </Pressable>

      {/* Modale d’édition */}
      <EditMangaModal
        visible={modalVisible}
        initial={editingManga}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

/**
 * Génère un ID unique (fallback si besoin)
 */
function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function labelStatus(key: string) {
  switch (key) {
    case "all":
      return "Tous";
    case "toRead":
      return "À lire";
    case "reading":
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
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterBtnActive: {
    backgroundColor: "#12AAB8",
  },
  filterText: {
    fontSize: 13,
    color: "#111827",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  sortBtnActive: {
    backgroundColor: "#0EA5E9",
  },
  sortText: {
    fontSize: 12,
    color: "#333",
  },
  sortTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#12AAB8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  addText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
