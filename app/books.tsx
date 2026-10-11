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
import AddBookModal from "../src/components/AddBookModal";
import BookCard, { BOOK_STATUS_LABEL } from "../src/components/BookCard";
import UpdateBookPageModal from "../src/components/UpdateBookPageModal";
import WebBackButton from "../src/components/WebBackButton";
import { useBooks } from "../src/hooks/useBooks";
import { Theme, makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";
import { Book, BookStatus } from "../src/types/book";

const isWeb = Platform.OS === "web";

type Filter = "all" | BookStatus;
const FILTERS: Filter[] = ["all", "in_progress", "planning", "done"];
const SORT_LABEL = { date: "Plus récents ↓", title: "Titre A → Z", status: "Par statut" } as const;
const NEXT_SORT = { date: "title", title: "status", status: "date" } as const;

export default function BooksScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const { books, visibleBooks, loading, addBook, updateProgress, updateBook, markDone, removeBook, sort, setSort } =
    useBooks();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [pageBook, setPageBook] = useState<Book | null>(null);

  const count = (f: Filter) => (f === "all" ? books.length : books.filter((b) => b.status === f).length);

  const q = query.trim().toLowerCase();
  const shown = visibleBooks
    .filter((b) => (filter === "all" ? true : b.status === filter))
    .filter((b) =>
      q ? b.title.toLowerCase().includes(q) || (b.author ?? "").toLowerCase().includes(q) : true
    );

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setFormOpen(true);
  }

  return (
    <View style={styles.screen}>
      {!isWeb && <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Livres" }} />}
      {isWeb && <WebBackButton title="Livres" />}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={t.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un livre ou un auteur"
              placeholderTextColor={t.textMuted}
              accessibilityLabel="Rechercher un livre"
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
                    {f === "all" ? "Tous" : BOOK_STATUS_LABEL[f]} · {count(f)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.listHeader}>
            <Text style={styles.listCount}>
              {shown.length} livre{shown.length > 1 ? "s" : ""}
            </Text>
            <Pressable onPress={() => setSort(NEXT_SORT[sort])} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.sortText}>{SORT_LABEL[sort]}</Text>
            </Pressable>
          </View>

          <FlatList
            style={styles.list}
            data={shown}
            keyExtractor={(b) => b.id}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Aucun livre ici pour l'instant. Les pages sont optionnelles.
              </Text>
            }
            renderItem={({ item }) => (
              <BookCard book={item} onEdit={openEdit} onUpdatePage={setPageBook} />
            )}
          />
        </View>
      )}

      <Pressable
        onPress={openAdd}
        accessibilityRole="button"
        style={[styles.addBtn, { bottom: 16 + insets.bottom }]}
      >
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Ajouter un livre</Text>
      </Pressable>

      <AddBookModal
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        heading={editing ? "Modifier le livre" : "Ajouter un livre"}
        initial={
          editing
            ? { title: editing.title, author: editing.author, totalPages: editing.totalPages, notes: editing.notes }
            : undefined
        }
        onSubmit={(data) => {
          if (editing) updateBook(editing.id, data);
          else addBook(data);
        }}
        onDelete={editing ? () => removeBook(editing.id) : undefined}
      />

      <UpdateBookPageModal
        book={pageBook}
        onClose={() => setPageBook(null)}
        onSave={(page) => pageBook && updateProgress(pageBook.id, page)}
        onMarkDone={() => pageBook && markDone(pageBook.id)}
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
      paddingHorizontal: 24,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      lineHeight: t.fs(20),
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