import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type MediaColorKey = keyof Theme["media"];

// Icône et couleur par média (clé = nom de la route)
const MEDIA_STYLE: Record<string, { icon: IconName; color: MediaColorKey }> = {
  anime: { icon: "play-circle-outline", color: "anime" },
  tv: { icon: "tv-outline", color: "tv" },
  movies: { icon: "film-outline", color: "movie" },
  books: { icon: "book-outline", color: "book" },
  manga: { icon: "albums-outline", color: "manga" },
  games: { icon: "game-controller-outline", color: "game" },
  podcast: { icon: "headset-outline", color: "podcast" },
  note: { icon: "document-text-outline", color: "notes" },
};

type Props = {
  mediaKey: string;
  label: string;
  count?: number;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const isWeb = Platform.OS === "web";

export default function MediaCard({ mediaKey, label, count, onPress, style }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [isHovered, setIsHovered] = React.useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const entry = MEDIA_STYLE[mediaKey];
  const icon: IconName = entry?.icon ?? "ellipse-outline";
  const color = entry ? t.media[entry.color] : t.textMuted;
  const a11y = count !== undefined ? `${label}, ${count} élément${count > 1 ? "s" : ""}` : label;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      // @ts-ignore - web-only props
      onMouseEnter={isWeb ? () => setIsHovered(true) : undefined}
      onMouseLeave={isWeb ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [
        styles.card,
        { width: isDesktop ? 160 : "22.5%" },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        isWeb && isHovered && styles.cardHover,
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + "29" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {count !== undefined && <Text style={styles.count}>{count}</Text>}
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      minHeight: 108,
      backgroundColor: t.card,
      borderRadius: t.radius.tile,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 4,
      // @ts-ignore - web-only
      cursor: isWeb ? "pointer" : undefined,
      // @ts-ignore - web-only
      transition: isWeb ? "all 0.2s ease" : undefined,
    },
    cardHover: { borderColor: t.accent },
    iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    label: {
      marginTop: 8,
      fontSize: t.fs(11),
      lineHeight: t.fs(15),
      color: t.text,
      fontFamily: t.fonts.semibold,
      textAlign: "center",
      width: "100%",
    },
    count: { marginTop: 2, fontSize: t.fs(11), color: t.textMuted, fontFamily: t.fonts.regular },
  });
}