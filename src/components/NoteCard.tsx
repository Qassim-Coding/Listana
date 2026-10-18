import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Note, noteKind } from "../types/note";
import { WORK_LABEL, workColor } from "../utils/libraryWorks";

type Props = {
  item: Note;
  onOpen: (note: Note) => void;
  // "tile" = petite carte pour la rangée horizontale des listes
  variant?: "row" | "tile";
};

export default function NoteCard({ item, onOpen, variant = "row" }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const kind = noteKind(item);
  const title = item.title || (kind === "list" ? "Liste sans titre" : "Sans titre");

  // ----- Liste à cocher -----
  if (kind === "list") {
    const items = item.items ?? [];
    const done = items.filter((i) => i.done).length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    const todo = items.filter((i) => !i.done).slice(0, variant === "tile" ? 0 : 3);
    return (
      <Pressable
        onPress={() => onOpen(item)}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir la liste ${title}, ${done} sur ${items.length} cochés`}
        style={({ pressed }) => [variant === "tile" ? styles.tile : styles.card, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.sub}>
          {items.length ? `${done} / ${items.length} cochés` : "Liste vide"}
        </Text>
        {items.length > 0 && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        )}
        {todo.map((i) => (
          <View key={i.id} style={styles.todoRow}>
            <View style={styles.box} />
            <Text style={styles.todoText} numberOfLines={1}>
              {i.text}
            </Text>
          </View>
        ))}
      </Pressable>
    );
  }

  // ----- Note libre ou note sur une œuvre -----
  const work = kind === "work" ? item.work : undefined;
  const color = work ? workColor(t, work.key) : t.media.notes;
  const lastMark = item.marks && item.marks.length ? item.marks[item.marks.length - 1] : undefined;
  const preview = item.content?.trim() || (lastMark ? `${lastMark.label} ${lastMark.text}` : "") || "Note vide";

  return (
    <Pressable
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la note ${title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      {work && (
        <Text style={[styles.workLabel, { color }]} numberOfLines={1}>
          {WORK_LABEL[work.key].toUpperCase()} · {work.title.toUpperCase()}
        </Text>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.preview} numberOfLines={3}>
        {preview}
      </Text>
      <Text style={styles.date}>
        Modifiée le {new Date(item.updatedAt).toLocaleDateString("fr-FR")}
        {item.marks && item.marks.length ? ` · ${item.marks.length} repère${item.marks.length > 1 ? "s" : ""}` : ""}
      </Text>
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      padding: 16,
      marginBottom: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    tile: {
      width: 160,
      padding: 12,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    workLabel: { fontFamily: t.fonts.bold, fontSize: t.fs(10), letterSpacing: 0.4, marginBottom: 4 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    sub: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    track: { height: 4, borderRadius: 2, backgroundColor: t.track, marginTop: 10, overflow: "hidden" },
    fill: { height: 4, borderRadius: 2, backgroundColor: t.accent },
    todoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
    box: { width: 13, height: 13, borderRadius: 4, borderWidth: 2, borderColor: t.textMuted },
    todoText: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.text },
    preview: { fontFamily: t.fonts.regular, fontSize: t.fs(14), lineHeight: t.fs(20), color: t.textMuted, marginTop: 4 },
    date: { fontFamily: t.fonts.regular, fontSize: t.fs(11), color: t.textMuted, marginTop: 10 },
  });
}