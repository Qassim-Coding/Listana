import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function toYmd(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseYmd(v?: string): { y: number; m: number; d: number } | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? "");
  if (!r) return null;
  return { y: Number(r[1]), m: Number(r[2]) - 1, d: Number(r[3]) };
}

export function formatYmd(v?: string): string {
  const p = parseYmd(v);
  return p ? `${p.d} ${MONTHS_SHORT[p.m]} ${p.y}` : "";
}

type Props = {
  value: string; // "AAAA-MM-JJ" ou ""
  onChange: (value: string) => void;
  color: string;
  placeholder?: string;
  accessibilityLabel?: string;
};

export default function DateField({
  value,
  onChange,
  color,
  placeholder = "Choisir une date",
  accessibilityLabel = "Date",
}: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const now = new Date();
  const selected = parseYmd(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({
    y: selected?.y ?? now.getFullYear(),
    m: selected?.m ?? now.getMonth(),
  });

  function toggle() {
    if (!open) {
      const s = parseYmd(value);
      setView({ y: s?.y ?? now.getFullYear(), m: s?.m ?? now.getMonth() });
    }
    setOpen(!open);
  }

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function pick(day: number) {
    onChange(toYmd(view.y, view.m, day));
    setOpen(false);
  }

  function pickToday() {
    onChange(toYmd(now.getFullYear(), now.getMonth(), now.getDate()));
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  // Semaines du mois affiché (lundi en premier)
  const weeks = useMemo(() => {
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const count = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= count; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [view]);

  const isToday = (d: number) =>
    d === now.getDate() && view.m === now.getMonth() && view.y === now.getFullYear();
  const isSelected = (d: number) =>
    !!selected && selected.d === d && selected.m === view.m && selected.y === view.y;
  const onColor = t.scheme === "dark" ? t.bg : "#FFFFFF";

  return (
    <View>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} : ${value ? formatYmd(value) : "aucune"}`}
        accessibilityState={{ expanded: open }}
        style={[styles.field, open && { borderColor: color }]}
      >
        <Ionicons name="calendar-outline" size={18} color={value ? color : t.textMuted} />
        <Text style={[styles.fieldText, !value && { color: t.textMuted }]}>
          {value ? formatYmd(value) : placeholder}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={t.textMuted} />
      </Pressable>

      {open && (
        <View style={styles.calendar}>
          <View style={styles.header}>
            <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Mois précédent" style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={t.text} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTHS[view.m]} {view.y}
            </Text>
            <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="Mois suivant" style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={t.text} />
            </Pressable>
          </View>

          <View style={styles.row}>
            {WEEKDAYS.map((w, i) => (
              <View key={`w${i}`} style={styles.cell}>
                <Text style={styles.weekday}>{w}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={`r${wi}`} style={styles.row}>
              {week.map((d, di) =>
                d === null ? (
                  <View key={`e${wi}-${di}`} style={styles.cell} />
                ) : (
                  <Pressable
                    key={`d${d}`}
                    onPress={() => pick(d)}
                    accessibilityRole="button"
                    accessibilityLabel={`${d} ${MONTHS[view.m]} ${view.y}`}
                    accessibilityState={{ selected: isSelected(d) }}
                    style={styles.cell}
                  >
                    {({ pressed }) => (
                      <View
                        style={[
                          styles.day,
                          isToday(d) && { borderColor: color, borderWidth: 1 },
                          pressed && { backgroundColor: t.cardAlt },
                          isSelected(d) && { backgroundColor: color },
                        ]}
                      >
                        <Text style={[styles.dayText, isSelected(d) && { color: onColor, fontFamily: t.fonts.bold }]}>
                          {d}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                )
              )}
            </View>
          ))}

          <View style={styles.footer}>
            <Pressable onPress={clear} accessibilityRole="button" style={styles.footerBtn}>
              <Text style={styles.footerMuted}>Effacer</Text>
            </Pressable>
            <Pressable onPress={pickToday} accessibilityRole="button" style={styles.footerBtn}>
              <Text style={[styles.footerAction, { color }]}>Aujourd’hui</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.bg,
    },
    fieldText: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.text },
    calendar: {
      marginTop: 8,
      padding: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.bg,
      width: "100%",
      maxWidth: 380,
      alignSelf: "center",
    },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    navBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 },
    monthLabel: { fontFamily: t.fonts.bold, fontSize: t.fs(15), color: t.text },
    row: { flexDirection: "row" },
    cell: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
    weekday: { fontFamily: t.fonts.semibold, fontSize: t.fs(11), color: t.textMuted },
    day: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    dayText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.text },
    footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    footerBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 10 },
    footerMuted: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted },
    footerAction: { fontFamily: t.fonts.bold, fontSize: t.fs(13) },
  });
}