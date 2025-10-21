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
import AddBookModal from "../src/components/AddBookModal";
import BookCard from "../src/components/BookCard";
import WebBackButton from "../src/components/WebBackButton";
import { useBooks } from "../src/hooks/useBooks";

const isWeb = Platform.OS === 'web';

export default function BooksScreen() {
  const {
    books,
    visibleBooks,
    loading,
    addBook,
    updateProgress,
    updateBook,
    markDone,
    updateNotes,
    removeBook,
    doneCount,
    filter,
    setFilter,
    sort,
    setSort,
  } = useBooks();

  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={insets.top + 8}
      >
        {/* Native header via Expo Router */}
        {!isWeb && (
          <Stack.Screen
            options={{
              headerShown: true,
              title: "Mes Livres",
              headerTitleStyle: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#111827" },
              headerBackTitleVisible: false,
              headerTintColor: "#12AAB8",
            }}
          />
        )}
        {isWeb && <WebBackButton title="Mes Livres" />}

        {/* Contenu */}
        {loading ? (
          <View style={styles.center}>
            <Text>Chargement…</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={[styles.empty, { paddingBottom: 24 + insets.bottom }]}>
            <Text style={styles.emptyTitle}>Aucun livre pour l’instant</Text>
            <Text style={styles.emptySub}>
              Ajoute un livre avec le bouton ci-dessous. Les pages sont
              optionnelles et tu peux ajouter des notes.
            </Text>
          </View>
        ) : (
          <>
            {/* Filtres & Tri (inchangés) */}
            <View style={styles.controlsRow}>
              <View style={styles.segment}>
                {[
                  { key: "all", label: "Tous" },
                  { key: "in_progress", label: "En cours" },
                  { key: "done", label: "Terminés" },
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
            data={visibleBooks}
            keyExtractor={(b) => b.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onUpdateProgress={(id, page) => updateProgress(id, page)}
                onMarkDone={(id) => markDone(id)}
                onRemove={(id) => removeBook(id)}
                onEditNotes={(id, notes) => updateNotes(id, notes)}
                onEditBook={(id, changes) => updateBook(id, changes)}
              />
            )}
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 8,
                // Espace en bas pour le FAB + zone sûre
                paddingBottom: 24 + insets.bottom + 64,
              }}
            />
          </>
        )}

        {/* Bouton ajouter (style jeux-vidéos) */}
        <Pressable
          style={[styles.addBtn, { marginBottom: 24 + insets.bottom }]}
          onPress={() => setOpen(true)}
        >
          <Text style={styles.addText}>＋ Ajouter un livre</Text>
        </Pressable>

        {/* Modale d’ajout */}
        <AddBookModal
          visible={open}
          onClose={() => setOpen(false)}
          onSubmit={({ title, author, totalPages, notes }) => {
            addBook({ title, author, totalPages, notes });
            setOpen(false);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },

  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#111827" },
  meta: { color: "#6B7280", marginTop: 2, fontFamily: "Poppins_400Regular" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  empty: { paddingHorizontal: 24, alignItems: "center" },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#0E5A90",
  },
  emptySub: { color: "#6B7280", textAlign: "center", marginTop: 6 },

  // plus de backBtn/backText: on utilise le header natif

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

  // Filtres & tri (inchangés)
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
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segmentBtnActive: {
    backgroundColor: "#12AAB8",
  },
  segmentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#0F172A",
  },
  segmentTextActive: {
    color: "#fff",
  },
});
