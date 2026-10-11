import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Book, BookStatus } from "../types/book";

export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  planning: "À lire",
  in_progress: "En cours",
  done: "Terminé",
};

type Props = {
  book: Book;
  onEdit: (book: Book) => void;
  onUpdatePage: (book: Book) => void;
};

export default function BookCard({ book, onEdit, onUpdatePage }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const color = t.media.book;
  const current = book.currentPage ?? 0;
  const total = book.totalPages;
  const pct = total ? Math.min(100, Math.round((current / total) * 100)) : null;
  const done = book.status === "done";
  const initial = book.title.trim().charAt(0).toUpperCase();

  let progressText = "Pas encore commencé";
  if (done && book.finishedAt) {
    progressText = `Terminé le ${new Date(book.finishedAt).toLocaleDateString("fr-FR")}`;
  } else if (total) {
    progressText = `Page ${current} / ${total}`;
  } else if (current > 0) {
    progressText = `Page ${current}`;
  }

  return (
    <Pressable
      onPress={() => onEdit(book)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${book.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.cover, { backgroundColor: color + "33" }]}>
        <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {book.author || "Auteur inconnu"} · {BOOK_STATUS_LABEL[book.status] ?? ""}
        </Text>
        <View style={styles.progressRow}>
          <Text style={[styles.progress, { color }]} numberOfLines={1}>
            {progressText}
          </Text>
          {pct !== null && !done && <Text style={styles.pct}>{pct} %</Text>}
        </View>
        {pct !== null && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        )}
        {book.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            {book.notes}
          </Text>
        ) : null}
      </View>

      {done ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminé">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onUpdatePage(book)}
          accessibilityRole="button"
          accessibilityLabel={`Mettre à jour la page de ${book.title}`}
          hitSlop={8}
          style={styles.updateBtn}
        >
          <Ionicons name="create-outline" size={20} color={t.onAccent} />
        </Pressable>
      )}
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    cover: { width: 56, height: 80, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8 },
    progress: { flex: 1, fontFamily: t.fonts.semibold, fontSize: t.fs(13) },
    pct: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 6, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
    notes: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6, fontStyle: "italic" },
    updateBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    doneBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}