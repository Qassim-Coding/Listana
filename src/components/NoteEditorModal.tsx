import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { newId } from "../storage/note.store";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";
import { ChecklistItem, Note, NoteKind, NoteMark, NoteWork, noteKind } from "../types/note";
import { WORK_LABEL, markPrefix, workColor } from "../utils/libraryWorks";
import BottomSheet from "./BottomSheet";
import NewNoteSheet from "./NewNoteSheet";

type Props = {
  visible: boolean;
  initial: Note | null; // note existante, ou null pour une nouvelle
  draft?: Partial<Note>; // pour une nouvelle note : type, œuvre, texte de départ
  onClose: () => void;
  onSubmit: (changes: Partial<Note>) => void;
  onDuplicate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
};

export default function NoteEditorModal({ visible, initial, draft, onClose, onSubmit, onDuplicate, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [kind, setKind] = useState<NoteKind>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [showDone, setShowDone] = useState(true);
  const [work, setWork] = useState<NoteWork | undefined>();
  const [marks, setMarks] = useState<NoteMark[]>([]);
  const [markLabel, setMarkLabel] = useState("");
  const [markText, setMarkText] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const src: Partial<Note> = initial ?? draft ?? {};
    const k = initial ? noteKind(initial) : draft?.kind ?? "free";
    setKind(k);
    setTitle(src.title ?? "");
    setContent(k === "list" ? "" : src.content ?? "");
    setItems(src.items ?? []);
    setNewItem("");
    setShowDone(true);
    setWork(src.work);
    setMarks(src.marks ?? []);
    setMarkLabel(src.work ? markPrefix(src.work.key) : "");
    setMarkText("");
  }, [initial, draft, visible]);

  const canSave =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    items.length > 0 ||
    newItem.trim().length > 0 ||
    marks.length > 0 ||
    markText.trim().length > 0;

  function buildChanges(): Partial<Note> {
    // Un article ou un repère tapé mais pas encore ajouté est gardé
    const finalItems = newItem.trim() ? [...items, { id: newId(), text: newItem.trim(), done: false }] : items;
    const finalMarks = markText.trim()
      ? [...marks, { id: newId(), label: markLabel.trim(), text: markText.trim() }]
      : marks;
    const fallback = kind === "list" ? "Liste" : kind === "work" && work ? work.title : "Sans titre";
    return {
      kind,
      title: title.trim() || fallback,
      content: kind === "list" ? "" : content,
      items: kind === "list" ? finalItems : undefined,
      work: kind === "work" ? work : undefined,
      marks: kind === "work" ? finalMarks : undefined,
    };
  }

  function save() {
    if (canSave) onSubmit(buildChanges());
    onClose();
  }

  function handleDelete() {
    if (!initial || !onDelete) return;
    const target = initial;
    const message = `Supprimer « ${target.title || "Sans titre"} » ?`;
    const doDelete = () => {
      onDelete(target);
      onClose();
    };
    if (Platform.OS === "web") {
      if ((globalThis as any).confirm?.(message)) doDelete();
      return;
    }
    Alert.alert("Supprimer", message, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: doDelete },
    ]);
  }

  // ----- Liste -----
  function addItem() {
    const text = newItem.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: newId(), text, done: false }]);
    setNewItem("");
  }
  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const editItem = (id: string, text: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const uncheckAll = () => setItems((prev) => prev.map((i) => ({ ...i, done: false })));

  async function shareList() {
    const lines = items.filter((i) => !i.done).map((i) => `• ${i.text}`);
    const message = `${title.trim() || "Liste"}\n${lines.join("\n")}`;
    try {
      await Share.share({ message });
    } catch {
      // Partage indisponible (certains navigateurs) : on ne fait rien
    }
  }

  // ----- Œuvre -----
  function addMark() {
    const text = markText.trim();
    if (!text) return;
    setMarks((prev) => [...prev, { id: newId(), label: markLabel.trim(), text }]);
    setMarkText("");
    setMarkLabel(work ? markPrefix(work.key) : "");
  }
  const removeMark = (id: string) => setMarks((prev) => prev.filter((m) => m.id !== id));

  const danger = t.scheme === "dark" ? "#FF7A7A" : "#C62828";
  const checkColor = t.scheme === "dark" ? t.accent : t.text;
  const todo = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const pct = items.length ? Math.round((done.length / items.length) * 100) : 0;
  const words = (() => {
    const txt = content.trim();
    return txt ? txt.split(/\s+/).length : 0;
  })();
  const wColor = work ? workColor(t, work.key) : t.media.notes;

  // Sur une liste existante, on coche en faisant ses courses : fermer enregistre aussi
  const closeSaves = kind === "list" && !!initial;

  const header = (
    <View style={styles.topRow}>
      <Pressable onPress={closeSaves ? save : onClose} accessibilityRole="button" hitSlop={12} style={styles.topBtn}>
        <Text style={styles.cancel}>{closeSaves ? "Fermer" : "Annuler"}</Text>
      </Pressable>
      <Pressable onPress={save} accessibilityRole="button" style={styles.saveBtn}>
        <Text style={styles.saveText}>Terminé</Text>
      </Pressable>
    </View>
  );

  const footer = (
    <View style={styles.bottomRow}>
      <Text style={styles.words}>
        {kind === "list"
          ? `${items.length} article${items.length > 1 ? "s" : ""}`
          : `${words} mot${words > 1 ? "s" : ""}`}
      </Text>
      {initial && (
        <View style={styles.extraRow}>
          {onDuplicate && (
            <Pressable
              onPress={() => {
                onDuplicate(initial);
                onClose();
              }}
              accessibilityRole="button"
              style={styles.extraBtn}
            >
              <Text style={styles.extraText}>Dupliquer</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={handleDelete} accessibilityRole="button" style={[styles.extraBtn, styles.deleteBtn, { borderColor: danger }]}>
              <Text style={[styles.extraText, { color: danger }]}>Supprimer</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={save} fill>
      {header}

      {kind === "free" ? (
        <>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Titre de la note"
            style={styles.titleInput}
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Écris ici…"
            placeholderTextColor={t.textMuted}
            accessibilityLabel="Contenu de la note"
            multiline
            style={styles.contentInput}
          />
        </>
      ) : (
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>
          {kind === "list" && (
            <>
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, { color: checkColor, backgroundColor: t.accent + "24" }]}>LISTE À COCHER</Text>
                <Text style={styles.badgeMeta}>
                  {done.length} sur {items.length} cochés
                </Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la liste"
                placeholderTextColor={t.textMuted}
                accessibilityLabel="Titre de la liste"
                style={styles.titleInput}
              />
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` }]} />
              </View>

              {todo.map((i) => (
                <View key={i.id} style={styles.itemRow}>
                  <Pressable
                    onPress={() => toggleItem(i.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: false }}
                    accessibilityLabel={`Cocher ${i.text}`}
                    style={styles.checkHit}
                  >
                    <View style={styles.checkbox} />
                  </Pressable>
                  <TextInput
                    value={i.text}
                    onChangeText={(v) => editItem(i.id, v)}
                    accessibilityLabel="Article"
                    style={styles.itemInput}
                  />
                  <Pressable onPress={() => removeItem(i.id)} accessibilityRole="button" accessibilityLabel={`Retirer ${i.text}`} style={styles.iconBtn}>
                    <Ionicons name="close" size={18} color={t.textMuted} />
                  </Pressable>
                </View>
              ))}

              <View style={styles.addRow}>
                <Ionicons name="add" size={22} color={checkColor} />
                <TextInput
                  value={newItem}
                  onChangeText={setNewItem}
                  onSubmitEditing={addItem}
                  blurOnSubmit={false}
                  returnKeyType="done"
                  placeholder="Ajouter un article"
                  placeholderTextColor={t.textMuted}
                  accessibilityLabel="Ajouter un article"
                  style={styles.itemInput}
                />
                {newItem.trim() ? (
                  <Pressable onPress={addItem} accessibilityRole="button" accessibilityLabel="Ajouter" style={styles.iconBtn}>
                    <Ionicons name="return-down-back" size={20} color={checkColor} />
                  </Pressable>
                ) : null}
              </View>

              {done.length > 0 && (
                <>
                  <Pressable onPress={() => setShowDone(!showDone)} accessibilityRole="button" style={styles.doneToggle}>
                    <Ionicons name={showDone ? "chevron-down" : "chevron-forward"} size={16} color={t.textMuted} />
                    <Text style={styles.doneToggleText}>Cochés ({done.length})</Text>
                  </Pressable>
                  {showDone &&
                    done.map((i) => (
                      <View key={i.id} style={styles.itemRow}>
                        <Pressable
                          onPress={() => toggleItem(i.id)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: true }}
                          accessibilityLabel={`Décocher ${i.text}`}
                          style={styles.checkHit}
                        >
                          <View style={[styles.checkbox, styles.checkboxOn]}>
                            <Ionicons name="checkmark" size={14} color={t.text} />
                          </View>
                        </Pressable>
                        <Text style={styles.doneText} numberOfLines={2}>
                          {i.text}
                        </Text>
                        <Pressable onPress={() => removeItem(i.id)} accessibilityRole="button" accessibilityLabel={`Retirer ${i.text}`} style={styles.iconBtn}>
                          <Ionicons name="close" size={18} color={t.textMuted} />
                        </Pressable>
                      </View>
                    ))}
                </>
              )}

              {items.length > 0 && (
                <View style={styles.listActions}>
                  <Pressable onPress={uncheckAll} accessibilityRole="button" style={styles.pillBtn}>
                    <Text style={styles.pillText}>Tout décocher</Text>
                  </Pressable>
                  <Pressable onPress={shareList} accessibilityRole="button" style={styles.pillBtn}>
                    <Text style={styles.pillText}>Partager</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {kind === "work" && (
            <>
              <View style={[styles.workBanner, { borderColor: wColor + "55", backgroundColor: wColor + "14" }]}>
                <View style={[styles.avatar, { backgroundColor: wColor + "38" }]}>
                  <Text style={[styles.avatarText, { color: wColor }]}>
                    {(work?.title ?? "?").trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.workLabel, { color: wColor }]}>
                    NOTE LIÉE{work ? ` · ${WORK_LABEL[work.key].toUpperCase()}` : ""}
                  </Text>
                  <Text style={styles.workTitle} numberOfLines={1}>
                    {work?.title ?? "Aucune œuvre"}
                  </Text>
                  {work?.meta ? (
                    <Text style={styles.workMeta} numberOfLines={1}>
                      {work.meta}
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => setPickerVisible(true)} accessibilityRole="button" style={styles.changeBtn}>
                  <Text style={styles.changeText}>Changer</Text>
                </Pressable>
              </View>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Titre (ex. Le duel contre Inshun)"
                placeholderTextColor={t.textMuted}
                accessibilityLabel="Titre de la note"
                style={styles.titleInput}
              />
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Écris ici…"
                placeholderTextColor={t.textMuted}
                accessibilityLabel="Contenu de la note"
                multiline
                scrollEnabled={false}
                style={[styles.contentInput, styles.contentInWork]}
              />

              <Text style={styles.sectionLabel}>Repères</Text>
              {marks.length === 0 && (
                <Text style={styles.hint}>Note un passage précis : une page, un épisode, un minutage.</Text>
              )}
              {marks.map((m) => (
                <View key={m.id} style={styles.markRow}>
                  {m.label ? (
                    <Text style={[styles.markChip, { color: wColor }]}>{m.label}</Text>
                  ) : null}
                  <Text style={styles.markText}>{m.text}</Text>
                  <Pressable onPress={() => removeMark(m.id)} accessibilityRole="button" accessibilityLabel="Retirer le repère" style={styles.iconBtn}>
                    <Ionicons name="close" size={18} color={t.textMuted} />
                  </Pressable>
                </View>
              ))}

              <View style={styles.markAdd}>
                <TextInput
                  value={markLabel}
                  onChangeText={setMarkLabel}
                  placeholder="p. 134"
                  placeholderTextColor={t.textMuted}
                  accessibilityLabel="Repère (page, épisode, minutage)"
                  style={[styles.markInput, styles.markLabelInput]}
                />
                <TextInput
                  value={markText}
                  onChangeText={setMarkText}
                  onSubmitEditing={addMark}
                  blurOnSubmit={false}
                  placeholder="Ce qui t’a marqué…"
                  placeholderTextColor={t.textMuted}
                  accessibilityLabel="Texte du repère"
                  style={[styles.markInput, { flex: 1 }]}
                />
                <Pressable
                  onPress={addMark}
                  disabled={!markText.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Ajouter le repère"
                  style={[styles.markAddBtn, !markText.trim() && { opacity: 0.4 }]}
                >
                  <Ionicons name="bookmark" size={18} color={t.onAccent} />
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {footer}

      {kind === "work" && (
        <NewNoteSheet
          visible={pickerVisible}
          worksOnly
          onClose={() => setPickerVisible(false)}
          onPick={(_k, w) => {
            if (w) {
              setWork(w);
              setMarkLabel(markPrefix(w.key));
            }
            setPickerVisible(false);
          }}
        />
      )}
    </BottomSheet>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    topBtn: { minHeight: 44, justifyContent: "center" },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    saveBtn: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: t.accent, justifyContent: "center" },
    saveText: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.onAccent },
    titleInput: { fontFamily: t.fonts.bold, fontSize: t.fs(24), color: t.text, marginTop: 12, paddingVertical: 6 },
    contentInput: {
      flex: 1,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(16),
      lineHeight: t.fs(24),
      color: t.text,
      textAlignVertical: "top",
      marginTop: 8,
    },
    contentInWork: { flex: 0, minHeight: 110 },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
    badge: { fontFamily: t.fonts.bold, fontSize: t.fs(11), letterSpacing: 0.4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
    badgeMeta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 8, marginBottom: 6, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3, backgroundColor: t.accent },
    itemRow: { flexDirection: "row", alignItems: "center", minHeight: 48, borderBottomWidth: 1, borderBottomColor: t.border },
    checkHit: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -10 },
    checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: t.textMuted, alignItems: "center", justifyContent: "center" },
    checkboxOn: { borderWidth: 0, backgroundColor: t.cardAlt },
    itemInput: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(16), color: t.text, paddingVertical: 10 },
    iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    addRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 },
    doneToggle: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, marginTop: 6 },
    doneToggleText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    doneText: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(16), color: t.textMuted, textDecorationLine: "line-through" },
    listActions: { flexDirection: "row", gap: 10, marginTop: 16 },
    pillBtn: {
      flex: 1,
      minHeight: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    pillText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    workBanner: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, padding: 10, borderRadius: 18, borderWidth: 1 },
    avatar: { width: 40, height: 56, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: t.fonts.bold, fontSize: t.fs(18) },
    workLabel: { fontFamily: t.fonts.bold, fontSize: t.fs(10), letterSpacing: 0.4 },
    workTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    workMeta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    changeBtn: { minHeight: 44, paddingHorizontal: 10, justifyContent: "center" },
    changeText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.text },
    sectionLabel: { fontFamily: t.fonts.bold, fontSize: t.fs(13), color: t.text, marginTop: 16, marginBottom: 6 },
    hint: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginBottom: 8 },
    markRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6 },
    markChip: {
      fontFamily: t.fonts.bold,
      fontSize: t.fs(12),
      backgroundColor: t.cardAlt,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
      overflow: "hidden",
      marginTop: 8,
    },
    markText: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(15), lineHeight: t.fs(22), color: t.text, paddingTop: 8 },
    markAdd: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    markInput: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      color: t.text,
      backgroundColor: t.bg,
    },
    markLabelInput: { width: 84 },
    markAddBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: t.border,
      paddingTop: 8,
    },
    words: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    extraRow: { flexDirection: "row", gap: 12 },
    extraBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
    deleteBtn: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 14 },
    extraText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}