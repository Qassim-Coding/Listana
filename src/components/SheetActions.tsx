import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

type Props = {
  onDuplicate?: () => void;
  onDelete?: () => void;
};

// Les boutons « Dupliquer » et « Supprimer » en bas des fenêtres de modification.
// Un seul endroit pour leur style : bien visibles, avec une icône, une bordure,
// une zone tactile de 48 px et une surbrillance quand on appuie.
export default function SheetActions({ onDuplicate, onDelete }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const danger = t.scheme === "dark" ? "#FF7A7A" : "#C62828";

  if (!onDuplicate && !onDelete) return null;

  return (
    <View style={styles.row}>
      {onDuplicate && (
        <Pressable
          onPress={onDuplicate}
          accessibilityRole="button"
          style={({ pressed }: { pressed: boolean }) => [styles.btn, pressed && { backgroundColor: t.cardAlt }]}
        >
          <Ionicons name="copy-outline" size={18} color={t.text} />
          <Text style={styles.text}>Dupliquer</Text>
        </Pressable>
      )}
      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          style={({ pressed }: { pressed: boolean }) => [
            styles.btn,
            { borderColor: danger + "88" },
            pressed && { backgroundColor: danger + "22" },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={danger} />
          <Text style={[styles.text, { color: danger }]}>Supprimer</Text>
        </Pressable>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: 10, marginTop: 14 },
    btn: {
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
    text: { fontFamily: t.fonts.semibold, fontSize: t.fs(15), color: t.text },
  });
}