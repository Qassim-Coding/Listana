import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GameCard, { GAME_STATUS_LABEL } from "../components/GameCard";
import GameFormModal from "../components/GameFormModal";
import { addGame, deleteGame, getGames, initGames, updateGame } from "../storage/game.store";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Game } from "../types/game";

type Filter = "all" | Game["status"];
type Sort = "recent" | "title" | "platform" | "genre";

const FILTERS: Filter[] = ["all", "playing", "toPlay", "completed", "abandoned"];
const SORT_LABEL: Record<Sort, string> = {
  recent: "Plus récents ↓",
  title: "Titre A → Z",
  platform: "Par plateforme",
  genre: "Par genre",
};
const NEXT_SORT: Record<Sort, Sort> = { recent: "title", title: "platform", platform: "genre", genre: "recent" };

export default function GamesScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<Game[]>(getGames());
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<Sort>("recent");
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  useEffect(() => {
    (async () => {
      await initGames();
      setGames([...getGames()]);
    })();
  }, []);

  const refresh = () => setGames([...getGames()]);

  function handleAdd() {
    setEditingGame(null);
    setModalVisible(true);
  }

  function handleEdit(game: Game) {
    setEditingGame(game);
    setModalVisible(true);
  }

  function handleSubmit(changes: Partial<Game>) {
    if (editingGame) {
      updateGame(editingGame.id, changes);
    } else {
      addGame({ id: Date.now().toString(), ...changes } as Game);
    }
    refresh();
  }

  function handleQuickAction(game: Game) {
    updateGame(game.id, { status: game.status === "playing" ? "completed" : "playing" });
    refresh();
  }

  function handleDelete(game: Game) {
    deleteGame(game.id);
    refresh();
  }

  const count = (f: Filter) => (f === "all" ? games.length : games.filter((g) => g.status === f).length);
  const q = query.trim().toLowerCase();

  const shown = games
    .filter((g) => (filter === "all" ? true : g.status === filter))
    .filter((g) => (q ? g.title.toLowerCase().includes(q) : true))
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      if (sortBy === "platform") return a.platform.localeCompare(b.platform);
      if (sortBy === "genre") return a.genre.localeCompare(b.genre);
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un jeu"
          placeholderTextColor={t.textMuted}
          accessibilityLabel="Rechercher un jeu"
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
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
                {f === "all" ? "Tous" : GAME_STATUS_LABEL[f]} · {count(f)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {shown.length} jeu{shown.length > 1 ? "x" : ""}
        </Text>
        <Pressable onPress={() => setSortBy(NEXT_SORT[sortBy])} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.sortText}>{SORT_LABEL[sortBy]}</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun jeu ici pour l'instant.</Text>}
        renderItem={({ item }) => (
          <GameCard game={item} onEdit={handleEdit} onQuickAction={handleQuickAction} />
        )}
      />

      <Pressable onPress={handleAdd} accessibilityRole="button" style={[styles.addBtn, { bottom: 16 + insets.bottom }]}>
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter un jeu</Text>
      </Pressable>

      <GameFormModal
        visible={modalVisible}
        initial={editingGame}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
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