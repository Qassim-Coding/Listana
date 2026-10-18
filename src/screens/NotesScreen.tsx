import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NewNoteSheet from "../components/NewNoteSheet";
import NoteCard from "../components/NoteCard";
import NoteEditorModal from "../components/NoteEditorModal";
import {
  appendToList,
  createNote,
  deleteNote,
  duplicateNote,
  getNotes,
  initNotes,
  latestList,
  newId,
  searchNotes,
  sortNotes,
  updateNote,
} from "../storage/note.store";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { Note, NoteKind, NoteWork, noteKind } from "../types/note";
import { WORK_LABEL, workColor } from "../utils/libraryWorks";

type Editor = { visible: boolean; initial: Note | null; draft?: Partial<Note> };
type WorkGroup = { key: string; work: NoteWork; notes: Note[] };

export default function NotesScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState("");
  const [quickToList, setQuickToList] = useState(false);
  const [editor, setEditor] = useState<Editor>({ visible: false, initial: null });
  const [newSheet, setNewSheet] = useState(false);
  const [quickWorkSheet, setQuickWorkSheet] = useState(false);
  const [workFilter, setWorkFilter] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      await initNotes();
      setNotes([...getNotes()]);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const refresh = () => setNotes([...getNotes()]);
  const active = sortNotes(notes);
  const lists = active.filter((n) => noteKind(n) === "list");
  const frees = active.filter((n) => noteKind(n) === "free");
  const workNotes = active.filter((n) => noteKind(n) === "work" && n.work);

  // Notes sur une œuvre, regroupées par œuvre (la plus récente en premier)
  const groups: WorkGroup[] = [];
  for (const n of workNotes) {
    const w = n.work as NoteWork;
    const key = `${w.key}:${w.id}`;
    const g = groups.find((x) => x.key === key);
    if (g) g.notes.push(n);
    else groups.push({ key, work: w, notes: [n] });
  }
  const currentGroup = workFilter ? groups.find((g) => g.key === workFilter) : undefined;
  const targetList = quickToList ? latestList() : undefined;

  // ----- Ouverture de l'éditeur -----
  function openNote(note: Note) {
    setEditor({ visible: true, initial: note });
  }
  function openDraft(draft: Partial<Note>) {
    setEditor({ visible: true, initial: null, draft });
  }
  function handlePickType(kind: NoteKind, work?: NoteWork) {
    setNewSheet(false);
    openDraft({ kind, work });
  }

  function handleSubmit(changes: Partial<Note>) {
    if (editor.initial) updateNote(editor.initial.id, changes);
    else createNote(changes.kind ?? "free", changes);
    refresh();
  }

  function handleDuplicate(note: Note) {
    duplicateNote(note);
    refresh();
  }

  function handleDelete(note: Note) {
    deleteNote(note.id);
    refresh();
  }

  // ----- Capture rapide -----
  function submitQuick() {
    const text = quick.trim();
    if (!text) return;
    if (quickToList) {
      const list = latestList();
      if (list) {
        appendToList(list.id, text);
        setToast(`Ajouté à « ${list.title || "Liste"} »`);
      } else {
        createNote("list", { title: "Courses", items: [{ id: newId(), text, done: false }] });
        setToast("Liste « Courses » créée");
      }
    } else {
      const firstLine = text.split("\n")[0];
      const title = firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
      createNote("free", { title, content: text === title ? "" : text });
      setToast("Note enregistrée");
    }
    setQuick("");
    refresh();
  }

  function quickLinkWork(_kind: NoteKind, work?: NoteWork) {
    setQuickWorkSheet(false);
    if (!work) return;
    openDraft({ kind: "work", work, content: quick.trim() });
    setQuick("");
  }

  const results = query.trim() ? searchNotes(active, query) : null;

  function sectionHead(title: string, count: string) {
    return (
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={t.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Chercher dans mes notes"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Chercher dans mes notes"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Effacer la recherche" hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={t.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {results ? (
          <>
            {sectionHead("Résultats", String(results.length))}
            {results.length === 0 && <Text style={styles.empty}>Aucune note ne correspond.</Text>}
            {results.map((n) => (
              <NoteCard key={n.id} item={n} onOpen={openNote} />
            ))}
          </>
        ) : currentGroup ? (
          <>
            <Pressable onPress={() => setWorkFilter(null)} accessibilityRole="button" style={styles.backRow}>
              <Ionicons name="chevron-back" size={18} color={t.text} />
              <Text style={styles.backText}>Toutes les notes</Text>
            </Pressable>
            <View style={styles.groupHeader}>
              <Text style={[styles.groupLabel, { color: workColor(t, currentGroup.work.key) }]}>
                {WORK_LABEL[currentGroup.work.key].toUpperCase()}
              </Text>
              <Text style={styles.groupTitle}>{currentGroup.work.title}</Text>
            </View>
            {currentGroup.notes.map((n) => (
              <NoteCard key={n.id} item={n} onOpen={openNote} />
            ))}
            <Pressable
              onPress={() => openDraft({ kind: "work", work: currentGroup.work })}
              accessibilityRole="button"
              style={styles.outlineBtn}
            >
              <Ionicons name="add" size={18} color={t.text} />
              <Text style={styles.outlineText}>Nouvelle note sur cette œuvre</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Capture rapide */}
            <View style={[styles.quick, { borderColor: quick ? t.accent : t.border }]}>
              <View style={styles.quickRow}>
                <TextInput
                  value={quick}
                  onChangeText={setQuick}
                  onSubmitEditing={submitQuick}
                  placeholder={quickToList ? "Article à ajouter (ex. café)" : "Note rapide… (ex. acheter du café)"}
                  placeholderTextColor={t.textMuted}
                  accessibilityLabel="Note rapide"
                  returnKeyType="done"
                  style={styles.quickInput}
                />
                <Pressable
                  onPress={submitQuick}
                  disabled={!quick.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Enregistrer la note rapide"
                  style={[styles.quickSend, !quick.trim() && { opacity: 0.4 }]}
                >
                  <Ionicons name="arrow-forward" size={20} color={t.onAccent} />
                </Pressable>
              </View>
              <View style={styles.quickChips}>
                <Pressable
                  onPress={() => setQuickToList(!quickToList)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: quickToList }}
                  style={[styles.quickChip, quickToList && styles.quickChipOn]}
                >
                  <Ionicons name={quickToList ? "checkbox" : "square-outline"} size={14} color={quickToList ? t.bg : t.text} />
                  <Text style={[styles.quickChipText, quickToList && { color: t.bg }]} numberOfLines={1}>
                    {quickToList && targetList ? `Dans « ${targetList.title || "Liste"} »` : "Ajouter à une liste"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setQuickWorkSheet(true)} accessibilityRole="button" style={styles.quickChip}>
                  <Ionicons name="link-outline" size={14} color={t.text} />
                  <Text style={styles.quickChipText}>Lier à une œuvre</Text>
                </Pressable>
              </View>
            </View>

            {active.length === 0 && (
              <Text style={styles.empty}>
                Aucune note pour l’instant. Écris une note rapide ci-dessus, ou crée une liste ou une note sur une œuvre avec le bouton en bas.
              </Text>
            )}

            {/* Listes */}
            {lists.length > 0 && (
              <>
                {sectionHead("Listes", String(lists.length))}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
                  {lists.map((n) => (
                    <NoteCard key={n.id} item={n} onOpen={openNote} variant="tile" />
                  ))}
                  <Pressable
                    onPress={() => openDraft({ kind: "list" })}
                    accessibilityRole="button"
                    accessibilityLabel="Nouvelle liste"
                    style={styles.newTile}
                  >
                    <Ionicons name="add" size={24} color={t.textMuted} />
                    <Text style={styles.newTileText}>Nouvelle liste</Text>
                  </Pressable>
                </ScrollView>
              </>
            )}

            {/* Par œuvre */}
            {groups.length > 0 && (
              <>
                {sectionHead("Par œuvre", `${workNotes.length} note${workNotes.length > 1 ? "s" : ""}`)}
                <View style={styles.groupBox}>
                  {groups.map((g, idx) => {
                    const c = workColor(t, g.work.key);
                    const last = g.notes[0];
                    return (
                      <Pressable
                        key={g.key}
                        onPress={() => (g.notes.length === 1 ? openNote(g.notes[0]) : setWorkFilter(g.key))}
                        accessibilityRole="button"
                        accessibilityLabel={`${g.work.title}, ${g.notes.length} note${g.notes.length > 1 ? "s" : ""}`}
                        style={({ pressed }) => [
                          styles.groupRow,
                          idx < groups.length - 1 && styles.groupRowBorder,
                          pressed && { backgroundColor: t.cardAlt },
                        ]}
                      >
                        <View style={[styles.avatar, { backgroundColor: c + "38" }]}>
                          <Text style={[styles.avatarText, { color: c }]}>{g.work.title.trim().charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.groupRowTitle} numberOfLines={1}>
                            {g.work.title}
                          </Text>
                          <Text style={styles.groupRowSub} numberOfLines={1}>
                            {last.title || "Sans titre"}
                          </Text>
                        </View>
                        <Text style={[styles.groupCount, { color: c }]}>{g.notes.length}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* Libres */}
            {frees.length > 0 && (
              <>
                {sectionHead("Libres", String(frees.length))}
                {frees.map((n) => (
                  <NoteCard key={n.id} item={n} onOpen={openNote} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {toast ? (
        <View style={[styles.toast, { bottom: 84 + insets.bottom }]} accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <Pressable onPress={() => setNewSheet(true)} accessibilityRole="button" style={[styles.addBtn, { bottom: 16 + insets.bottom }]}>
        <Ionicons name="add" size={22} color={t.onAccent} />
        <Text style={styles.addText}>Nouvelle note</Text>
      </Pressable>

      <NewNoteSheet visible={newSheet} onClose={() => setNewSheet(false)} onPick={handlePickType} />
      <NewNoteSheet visible={quickWorkSheet} worksOnly onClose={() => setQuickWorkSheet(false)} onPick={quickLinkWork} />

      <NoteEditorModal
        visible={editor.visible}
        initial={editor.initial}
        draft={editor.draft}
        onClose={() => setEditor((e) => ({ ...e, visible: false }))}
        onSubmit={handleSubmit}
        onDuplicate={handleDuplicate}
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
    quick: { marginTop: 12, padding: 6, paddingLeft: 14, borderRadius: 20, backgroundColor: t.card, borderWidth: 1 },
    quickRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    quickInput: { flex: 1, minHeight: 44, fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.text },
    quickSend: { width: 44, height: 44, borderRadius: 14, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    quickChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: 4 },
    quickChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 36,
      maxWidth: "100%",
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.cardAlt,
    },
    quickChipOn: { backgroundColor: t.text, borderColor: t.text },
    quickChipText: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), color: t.text, flexShrink: 1 },
    sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 22, marginBottom: 10 },
    sectionTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(17), color: t.text },
    sectionCount: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    tiles: { gap: 10, paddingRight: 16 },
    newTile: {
      width: 120,
      borderRadius: 18,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      padding: 12,
    },
    newTileText: { fontFamily: t.fonts.semibold, fontSize: t.fs(12), color: t.textMuted },
    groupBox: { borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
    groupRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 14, minHeight: 68 },
    groupRowBorder: { borderBottomWidth: 1, borderBottomColor: t.border },
    avatar: { width: 36, height: 48, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: t.fonts.bold, fontSize: t.fs(16) },
    groupRowTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    groupRowSub: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    groupCount: { fontFamily: t.fonts.bold, fontSize: t.fs(13) },
    backRow: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44, marginTop: 8 },
    backText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    groupHeader: { marginTop: 4, marginBottom: 12 },
    groupLabel: { fontFamily: t.fonts.bold, fontSize: t.fs(11), letterSpacing: 0.5 },
    groupTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(22), color: t.text },
    outlineBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: t.border,
      marginTop: 4,
    },
    outlineText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    empty: {
      textAlign: "center",
      marginTop: 32,
      paddingHorizontal: 16,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      lineHeight: t.fs(20),
      color: t.textMuted,
    },
    toast: {
      position: "absolute",
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.text,
    },
    toastText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.bg },
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