import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EditGameModal from "../components/EditGameModal";
import GameCard from "../components/GameCard";
import { addGame, getGames, updateGame } from "../storage/game.store";
import { Game } from "../types/game";

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<Game[]>(getGames());
  const [filter, setFilter] = useState<"all" | Game["status"]>("all");
  const [sortBy, setSortBy] = useState<"platform" | "genre" | "date">("date");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

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
      const newGame: Game = {
        id: Date.now().toString(),
        ...changes,
      } as Game;
      addGame(newGame);
    }
    setGames(getGames());
  }

  const filteredGames =
    filter === "all" ? games : games.filter((g) => g.status === filter);

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "platform") return a.platform.localeCompare(b.platform);
    if (sortBy === "genre") return a.genre.localeCompare(b.genre);
    if (sortBy === "date")
      return (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "");
    return 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mes jeux</Text>

      <View style={styles.row}>
        {["all", "toPlay", "playing", "completed", "abandoned"].map((key) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key as any)}
            style={[
              styles.filterBtn,
              filter === key && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === key && styles.filterTextActive,
              ]}
            >
              {label(key)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        {["platform", "genre", "date"].map((key) => (
          <Pressable
            key={key}
            onPress={() => setSortBy(key as any)}
            style={[
              styles.sortBtn,
              sortBy === key && styles.sortBtnActive,
            ]}
          >
            <Text
              style={[
                styles.sortText,
                sortBy === key && styles.sortTextActive,
              ]}
            >
              Trier par {sortLabel(key)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={sortedGames}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onUpdate={(changes) => {
              updateGame(item.id, changes);
              setGames(getGames());
            }}
            onEdit={(g) => {
              setEditingGame(g);
              setModalVisible(true);
            }}
          />
        )}
      />

      <Pressable
        style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
        onPress={handleAdd}
      >
        <Text style={styles.addText}>＋ Ajouter un jeu</Text>
      </Pressable>

      <EditGameModal
        visible={modalVisible}
        initial={editingGame}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

function label(key: string) {
  switch (key) {
    case "all":
      return "Tous";
    case "toPlay":
      return "À jouer";
    case "playing":
      return "En cours";
    case "completed":
      return "Terminé";
    case "abandoned":
      return "Abandonné";
    default:
      return key;
  }
}

function sortLabel(key: string) {
  switch (key) {
    case "platform":
      return "plateforme";
    case "genre":
      return "genre";
    case "date":
      return "date";
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


