import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

type Props = {
  title: string;
};

const isWeb = Platform.OS === "web";

export default function WebBackButton({ title }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  // N'affiche rien sur mobile (le header natif s'en occupe)
  if (!isWeb) return null;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View style={styles.header}>
      <Pressable
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="chevron-back" size={22} color={t.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      // @ts-ignore - web-only
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      // @ts-ignore - web-only
      cursor: "pointer",
    },
    title: {
      position: "absolute",
      left: 72,
      right: 72,
      textAlign: "center",
      fontFamily: t.fonts.bold,
      fontSize: t.fs(20),
      color: t.text,
      // @ts-ignore
      pointerEvents: "none",
    },
    spacer: { width: 44 },
  });
}