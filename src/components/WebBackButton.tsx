import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
};

const isWeb = Platform.OS === 'web';

export default function WebBackButton({ title }: Props) {
  // N'affiche rien sur mobile (le header natif s'en occupe)
  if (!isWeb) return null;

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    // @ts-ignore - web-only
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    // @ts-ignore - web-only
    cursor: "pointer",
    // @ts-ignore - web-only
    transition: "background-color 0.2s ease",
  },
  backButtonPressed: {
    backgroundColor: "#F3F4F6",
  },
  backArrow: {
    fontSize: 28,
    color: "#12AAB8",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Poppins_700Bold",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    // @ts-ignore
    pointerEvents: "none",
  },
  spacer: {
    width: 80, // Pour équilibrer le layout
  },
});
