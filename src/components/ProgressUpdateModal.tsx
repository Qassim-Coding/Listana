import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import BottomSheet from "./BottomSheet";

type Props = {
  visible: boolean;
  itemTitle: string;
  currentLabel: string;
  inputLabel: string;
  start: number;
  total?: number;
  quick: number[];
  unit: (n: number) => string;
  onClose: () => void;
  onSave: (value: number) => void;
  onMarkDone: () => void;
};

export default function ProgressUpdateModal({
  visible,
  itemTitle,
  currentLabel,
  inputLabel,
  start,
  total,
  quick,
  unit,
  onClose,
  onSave,
  onMarkDone,
}: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [value, setValue] = useState("0");

  useEffect(() => {
    if (visible) setValue(String(start));
  }, [visible, start]);

  if (!visible) return null;

  const raw = Math.max(0, parseInt(value, 10) || 0);
  const n = total ? Math.min(raw, total) : raw;
  const delta = n - start;
  const pct = total ? Math.round((n / total) * 100) : null;
  const setN = (x: number) => setValue(String(Math.max(0, total ? Math.min(x, total) : x)));

  return (
    <BottomSheet visible onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mettre à jour</Text>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.cancel}>Annuler</Text>
        </Pressable>
      </View>

      <Text style={styles.itemTitle} numberOfLines={1}>
        {itemTitle}
      </Text>
      <Text style={styles.current}>{currentLabel}</Text>

      <View style={styles.counterBox}>
        <Text style={styles.counterLabel}>{inputLabel}</Text>
        <View style={styles.counterRow}>
          <Pressable onPress={() => setN(n - 1)} accessibilityRole="button" accessibilityLabel="Retirer un" style={styles.roundBtn}>
            <Ionicons name="remove" size={22} color={t.text} />
          </Pressable>
          <TextInput
            value={value}
            onChangeText={(v) => setValue(v.replace(/\D/g, ""))}
            keyboardType="number-pad"
            accessibilityLabel={inputLabel}
            style={styles.counterInput}
          />
          <Pressable onPress={() => setN(n + 1)} accessibilityRole="button" accessibilityLabel="Ajouter un" style={styles.roundBtn}>
            <Ionicons name="add" size={22} color={t.text} />
          </Pressable>
        </View>
        <View style={styles.quickRow}>
          {quick.map((q) => (
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
              {delta} {unit(delta)}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {pct !== null && <Text style={styles.pct}>{pct} %</Text>}
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
      <Pressable
        onPress={() => {
          onMarkDone();
          onClose();
        }}
        accessibilityRole="button"
        style={styles.doneBtn}
      >
        <Text style={styles.doneText}>Marquer comme terminé</Text>
      </Pressable>
    </BottomSheet>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(22), color: t.text },
    cancel: { fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.textMuted },
    itemTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(17), color: t.text, marginTop: 14 },
    current: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted, marginTop: 2 },
    counterBox: { marginTop: 14, padding: 16, borderRadius: 24, backgroundColor: t.cardAlt },
    counterLabel: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
    roundBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    counterInput: { flex: 1, textAlign: "center", fontFamily: t.fonts.bold, fontSize: t.fs(48), color: t.text, paddingVertical: 4 },
    quickRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    quickBtn: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" },
    quickText: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    deltaBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: t.accent },
    deltaText: { fontFamily: t.fonts.bold, fontSize: t.fs(13), color: t.onAccent },
    pct: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    saveBtn: { marginTop: 18, minHeight: 56, borderRadius: 28, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    saveText: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.onAccent },
    doneBtn: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 6 },
    doneText: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.textMuted },
  });
}