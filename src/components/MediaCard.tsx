import React from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, ViewStyle } from "react-native";

type Props = {
  emoji: string;
  label: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const isWeb = Platform.OS === 'web';

export default function MediaCard({ emoji, label, onPress, style }: Props) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Tablette/Desktop

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore - web-only props
      onMouseEnter={isWeb ? () => setIsHovered(true) : undefined}
      onMouseLeave={isWeb ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [
        styles.card,
        // Largeur adaptative selon la taille d'écran
        { width: isDesktop ? 240 : "48%" },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        isWeb && isHovered && styles.cardHover,
        style,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 8,
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
  emoji: { fontSize: 34, marginBottom: 8 },
  label: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    lineHeight: 16,
    flexShrink: 1,
    width: "100%",
  },
});