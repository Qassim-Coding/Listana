import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ResumeItem } from "../hooks/useResumeItems";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type MediaColorKey = keyof Theme["media"];

const STYLE: Record<ResumeItem["mediaKey"], { icon: IconName; color: MediaColorKey; badge: string }> = {
  anime: { icon: "play-circle-outline", color: "anime", badge: "ANIMÉ" },
  tv: { icon: "tv-outline", color: "tv", badge: "SÉRIE" },
  movies: { icon: "film-outline", color: "movie", badge: "FILM" },
  books: { icon: "book-outline", color: "book", badge: "LIVRE" },
  manga: { icon: "albums-outline", color: "manga", badge: "MANGA" },
  games: { icon: "game-controller-outline", color: "game", badge: "JEU" },
  podcast: { icon: "headset-outline", color: "podcast", badge: "PODCAST" },
};

type Props = {
  items: ResumeItem[];
  total: number;
};

export default function ResumeSection({ items, total }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Reprendre</Text>
        <Text style={styles.meta}>{total} en cours</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Rien en cours pour l’instant. Commence un épisode, un tome ou un livre pour le retrouver ici.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {items.map((it) => {
            const s = STYLE[it.mediaKey];
            const color = t.media[s.color];
            return (
              <Pressable
                key={it.id}
                onPress={() => router.push(`/${it.mediaKey}`)}
                accessibilityRole="button"
                accessibilityLabel={`${it.title}, ${it.meta}`}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.cover, { backgroundColor: color + "33" }]}>
                  <Ionicons name={s.icon} size={34} color={color} />
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { color }]}>{s.badge}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {it.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {it.meta}
                </Text>
                {it.pct !== null && (
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${it.pct}%`, backgroundColor: color }]} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginTop: 24,
      marginBottom: 12,
    },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(18), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    row: { gap: 12, paddingRight: 20 },
    card: {
      width: 152,
      backgroundColor: t.card,
      borderRadius: t.radius.card,
      borderWidth: 1,
      borderColor: t.border,
      padding: 8,
      paddingBottom: 12,
    },
    cover: { height: 104, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    badge: {
      position: "absolute",
      left: 8,
      bottom: 8,
      backgroundColor: t.overlay,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    badgeText: { fontFamily: t.fonts.bold, fontSize: t.fs(10), letterSpacing: 0.5 },
    cardTitle: { marginTop: 10, marginHorizontal: 4, fontFamily: t.fonts.bold, fontSize: t.fs(14), color: t.text },
    cardMeta: { marginTop: 2, marginHorizontal: 4, fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    track: { height: 5, borderRadius: 3, backgroundColor: t.track, marginTop: 10, marginHorizontal: 4, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
    empty: { backgroundColor: t.card, borderRadius: 20, borderWidth: 1, borderColor: t.border, padding: 16 },
    emptyText: { fontFamily: t.fonts.regular, fontSize: t.fs(13), lineHeight: t.fs(19), color: t.textMuted },
  });
}