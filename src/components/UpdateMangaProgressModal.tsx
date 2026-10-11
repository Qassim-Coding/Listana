import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Manga } from "../types/manga";
import {
  MangaUnit,
  formatLastRead,
  lastReadNumber,
  mangaUnit,
  unitTitle,
  unitWord,
} from "../utils/mangaProgress";

type Props = {
  manga: Manga | null;
  onClose: () => void;
  onSubmit: (changes: Partial<Manga>) => void;
};

export default function UpdateMangaProgressModal({ manga, onClose, onSubmit }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [mode, setMode] = useState<MangaUnit>("chapter");
  const [value, setValue] = useState("0");

  useEffect(() => {
    if (!manga) return;
    setMode(mangaUnit(manga));
    setValue(String(lastReadNumber(manga)));
  }, [manga]);

  if (!manga) return null;
  const m: Manga = manga;

  const start = lastReadNumber(m);
  const n = Math.max(0, parseInt(value, 10) || 0);
  const delta = n - start;
  const setN = (x: number) => setValue(String(Math.max(0, x)));

  function save(extra?: Partial<Manga>) {
    onSubmit({
      lastChapter: String(n),
      progressMode: mode,
      status: m.status === "toRead" && n > 0 ? "reading" : m.status,
      ...extra,
    });
    onClose();
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mettre à jour</Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.cancel}>Annuler</Text>
            </Pressable>
          </View>

          <Text style={styles.mangaTitle} numberOfLines={1}>
            {m.title || "Sans titre"}
          </Text>
          <Text style={styles.current}>Actuellement : {formatLastRead(m)}</Text>

          <View style={styles.segment}>
            {(["volume", "chapter"] as const).map((u) => {
              const on = mode === u;
              return (
                <Pressable
                  key={u}
                  onPress={() => setMode(u)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                >
                  <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                    {u === "volume" ? "Tome" : "Chapitre / scan"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>
              Je suis maintenant au {unitTitle(mode).toLowerCase()}
            </Text>
            <View style={styles.counterRow}>
              <Pressable
                onPress={() => setN(n - 1)}
                accessibilityRole="button"
                accessibilityLabel="Retirer un"
                style={styles.roundBtn}
              >
                <Ionicons name="remove" size={22} color={t.text} />
              </Pressable>
              <TextInput
                value={value}
                onChangeText={(v) => setValue(v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                accessibilityLabel={`Numéro du ${unitTitle(mode).toLowerCase()} atteint`}
                style={styles.counterInput}
              />
              <Pressable
                onPress={() => setN(n + 1)}
                accessibilityRole="button"
                accessibilityLabel="Ajouter un"
                style={styles.roundBtn}
              >
                <Ionicons name="add" size={22} color={t.text} />
              </Pressable>
            </View>
            <View style={styles.quickRow}>
              {[1, 5, 10].map((q) => (
                <Pressable
                  key={q}
                  onPress={() => setN(n + q)}
                  accessibilityRole="button"
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickText}>+{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {delta !== 0 && (
            <View style={styles.deltaBadge}>
              <Text style={styles.deltaText}>
                {start} → {n} · {delta > 0 ? "+" : ""}
                {delta} {unitWord(mode, delta)}
              </Text>
            </View>
          )}

          <Pressable onPress={() => save()} accessibilityRole="button" style={styles.saveBtn}>
            <Text style={styles.saveText}>Enregistrer</Text>
          </Pressable>
          <Pressable
            onPress={() => save({ status: "completed" })}
            accessibilityRole="button"
            style={styles.doneBtn}
          >
            <Text style={styles.doneText}>Marquer comme terminé</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
      paddingTop: 10,
      paddingBottom: 28,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 12,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(22), color: t.text },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    mangaTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(17), color: t.text, marginTop: 14 },
    current: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted, marginTop: 2 },
    segment: {
      flexDirection: "row",
      gap: 4,
      padding: 4,
      borderRadius: 16,
      backgroundColor: t.bg,
      marginTop: 16,
    },
    segmentBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentBtnOn: { backgroundColor: t.cardAlt },
    segmentText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.textMuted },
    segmentTextOn: { fontFamily: t.fonts.bold, color: t.text },
    counterBox: {
      marginTop: 14,
      padding: 16,
      borderRadius: 24,
      backgroundColor: t.cardAlt,
    },
    counterLabel: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    counterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },
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
    deltaBadge: {
      alignSelf: "flex-start",
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: t.accent,
    },
    deltaText: { fontFamily: t.fonts.bold, fontSize: t.fs(13), color: t.onAccent },
    saveBtn: {
      marginTop: 18,
      minHeight: 56,
      borderRadius: 28,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    saveText: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    doneBtn: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 6 },
    doneText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}