import React from "react";
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Props = {
  emoji: string;
  label: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const isWeb = Platform.OS === 'web';

export default function MediaCard({ emoji, label, onPress, style }: Props) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore - web-only props
      onMouseEnter={isWeb ? () => setIsHovered(true) : undefined}
      onMouseLeave={isWeb ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        isWeb && isHovered && styles.cardHover,
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
    width: isWeb ? 240 : "48%",
    aspectRatio: 1.1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // @ts-ignore - web-only
    cursor: isWeb ? 'pointer' : undefined,
    // @ts-ignore - web-only
    transition: isWeb ? 'all 0.2s ease' : undefined,
  },
  cardHover: {
    // @ts-ignore - web-only
    transform: [{ translateY: -4 }],
    // @ts-ignore - web-only
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    borderColor: "#12AAB8",
  },
  emoji: { fontSize: 34, marginBottom: 6 },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
});