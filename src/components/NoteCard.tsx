import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Note } from "../types/note";

type Props = {
  item: Note;
  onOpen: (note: Note) => void;
};

export default function NoteCard({ item, onOpen }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const title = item.title || "Sans titre";

  return (
    <Pressable
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la note ${title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.preview} numberOfLines={3}>
        {item.content?.trim() || "Note vide"}
      </Text>
      <Text style={styles.date}>
        Modifiée le {new Date(item.updatedAt).toLocaleDateString("fr-FR")}
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
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    preview: {
      fontFamily: t.fonts.regular,
      fontSize: t.fs(14),
      lineHeight: t.fs(20),
      color: t.textMuted,
      marginTop: 6,
    },
    date: { fontFamily: t.fonts.regular, fontSize: t.fs(11), color: t.textMuted, marginTop: 10 },
  });
}