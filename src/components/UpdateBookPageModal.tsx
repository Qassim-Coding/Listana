import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { statusColors } from "../constants/statusColors";
import { Book } from "../types/book";
import BottomSheet from "./BottomSheet";

type Props = {
  book: Book | null;
  onClose: () => void;
  onSave: (page: number) => void;
  onMarkDone: () => void;
  onMarkAbandoned: () => void;
};

export default function UpdateBookPageModal({ book, onClose, onSave, onMarkDone, onMarkAbandoned }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [value, setValue] = useState("0");

  useEffect(() => {
    if (book) setValue(String(book.currentPage ?? 0));
  }, [book]);

  if (!book) return null;

  const start = book.currentPage ?? 0;
  const total = book.totalPages;
  const raw = Math.max(0, parseInt(value, 10) || 0);
  const n = total ? Math.min(raw, total) : raw;
  const delta = n - start;
  const pct = total ? Math.round((n / total) * 100) : null;
  const setN = (x: number) => setValue(String(Math.max(0, total ? Math.min(x, total) : x)));
  const doneTone = statusColors(t, "done");
  const droppedTone = statusColors(t, "abandoned");

  return (
    <BottomSheet visible onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mettre à jour</Text>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.cancel}>Annuler</Text>
        </Pressable>
      </View>

      <Text style={styles.bookTitle} numberOfLines={1}>
        {book.title}
      </Text>
      <Text style={styles.current}>
        Actuellement : page {start}
        {total ? ` / ${total}` : ""}
      </Text>
      {book.status === "abandoned" && (
        <Text style={styles.abandonedNote}>Livre abandonné : enregistre une page pour reprendre la lecture.</Text>
      )}

      <View style={styles.counterBox}>
        <Text style={styles.counterLabel}>Je suis maintenant à la page</Text>
        <View style={styles.counterRow}>
          <Pressable
            onPress={() => setN(n - 1)}
            accessibilityRole="button"
            accessibilityLabel="Retirer une page"
            style={styles.roundBtn}
          >
            <Ionicons name="remove" size={22} color={t.text} />
          </Pressable>
          <TextInput
            value={value}
            onChangeText={(v) => setValue(v.replace(/\D/g, ""))}
            keyboardType="number-pad"
            accessibilityLabel="Page atteinte"
            style={styles.counterInput}
          />
          <Pressable
            onPress={() => setN(n + 1)}
            accessibilityRole="button"
            accessibilityLabel="Ajouter une page"
            style={styles.roundBtn}
          >
            <Ionicons name="add" size={22} color={t.text} />
          </Pressable>
        </View>
        <View style={styles.quickRow}>
          {[10, 25, 50].map((q) => (
            <Pressable key={q} onPress={() => setN(n + q)} accessibilityRole="button" style={styles.quickBtn}>
              <Text style={styles.quickText}>+{q}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.infoRow}>
        {delta !== 0 ? (
          <View style={styles.deltaBadge}>
            <Text style={styles.deltaText}>
              {delta > 0 ? "+" : ""}
              {delta} page{Math.abs(delta) > 1 ? "s" : ""}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {pct !== null && <Text style={styles.pct}>{pct} % lu</Text>}
      </View>

      <Pressable
        onPress={() => {
          onSave(n);
          onClose();
        }}
        accessibilityRole="button"
        style={styles.saveBtn}
      >
        <Text style={styles.saveText}>Enregistrer</Text>
      </Pressable>

      {/* Terminé (vert) et Abandonner (rouge) : les mêmes couleurs que les états dans les listes */}
      {book.status !== "done" && (
        <View style={styles.stateRow}>
          <Pressable
            onPress={() => {
              onMarkDone();
              onClose();
            }}
            accessibilityRole="button"
            style={({ pressed }: { pressed: boolean }) => [
              styles.stateBtn,
              { borderColor: doneTone?.chipBorder },
              pressed && { backgroundColor: doneTone?.chipBg },
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={doneTone?.base} />
            <Text style={styles.stateText}>Terminé</Text>
          </Pressable>
          {book.status !== "abandoned" && (
            <Pressable
              onPress={() => {
                onMarkAbandoned();
                onClose();
              }}
              accessibilityRole="button"
              style={({ pressed }: { pressed: boolean }) => [
                styles.stateBtn,
                { borderColor: droppedTone?.chipBorder },
                pressed && { backgroundColor: droppedTone?.chipBg },
              ]}
            >
              <Ionicons name="close-circle-outline" size={18} color={droppedTone?.base} />
              <Text style={styles.stateText}>Abandonner</Text>
            </Pressable>
          )}
        </View>
      )}
    </BottomSheet>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(22), color: t.text },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    bookTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(17), color: t.text, marginTop: 14 },
    current: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted, marginTop: 2 },
    counterBox: { marginTop: 14, padding: 16, borderRadius: 24, backgroundColor: t.cardAlt },
    counterLabel: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
    roundBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: t.card,
      alignItems: "center",
      justifyContent: "center",
    },
    counterInput: {
      flex: 1,
      textAlign: "center",
      fontFamily: t.fonts.bold,
      fontSize: t.fs(48),
      color: t.text,
      paddingVertical: 4,
    },
    quickRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    quickBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
    },
    quickText: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    deltaBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: t.accent },
    deltaText: { fontFamily: t.fonts.bold, fontSize: t.fs(13), color: t.onAccent },
    pct: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    saveBtn: {
      marginTop: 18,
      minHeight: 56,
      borderRadius: 28,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    saveText: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    stateRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    stateBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: t.border,
    },
    stateText: { fontFamily: t.fonts.semibold, fontSize: t.fs(15), color: t.text },
    abandonedNote: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted, marginTop: 8, fontStyle: "italic" },
  });
}