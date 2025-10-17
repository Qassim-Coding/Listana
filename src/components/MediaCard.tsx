import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Props = {
  emoji: string;
  label: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export default function MediaCard({ emoji, label, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    aspectRatio: 1.1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emoji: { fontSize: 34, marginBottom: 6 },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
});