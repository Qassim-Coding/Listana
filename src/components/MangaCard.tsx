import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { statusColors } from "../constants/statusColors";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Manga } from "../types/manga";
import { MANGA_STATUS_LABEL, formatLastRead } from "../utils/mangaProgress";

type Props = {
  item: Manga;
  onSelect: (manga: Manga) => void;
  onUpdateProgress: (manga: Manga) => void;
};

export default function MangaCard({ item, onSelect, onUpdateProgress }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  // Fond léger selon l'état (en cours, à voir, terminé, abandonné), mêmes couleurs dans tout Listana
  const tone = statusColors(t, item.status);
  const color = t.media.manga;
  const title = item.title || "Sans titre";
  const initial = title.trim().charAt(0).toUpperCase();
  const totals = item.totalVolumes ? `${item.totalVolumes} tome${item.totalVolumes > 1 ? "s" : ""}` : "";
  const statusLine = [item.status ? MANGA_STATUS_LABEL[item.status] : "", totals].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${title}`}
      style={({ pressed }) => [
        styles.card,
        tone && { backgroundColor: tone.cardBg, borderColor: tone.cardBorder },
        pressed && { opacity: 0.85 },
      ]}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.cover} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.cover, styles.coverEmpty, { backgroundColor: color + "33" }]}>
          <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.series || "Auteur inconnu"}
        </Text>
        <Text style={[styles.lastRead, { color }]} numberOfLines={1}>
          {formatLastRead(item)}
        </Text>
        <Text style={styles.status}>{statusLine}</Text>
      </View>

      <Pressable
        onPress={() => onUpdateProgress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Mettre à jour la progression de ${title}`}
        hitSlop={8}
        style={styles.updateBtn}
      >
        <Ionicons name="create-outline" size={20} color={t.onAccent} />
      </Pressable>
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    cover: { width: 56, height: 80, borderRadius: 12, backgroundColor: t.cardAlt },
    coverEmpty: { alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    author: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    lastRead: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    status: { fontFamily: t.fonts.regular, fontSize: t.fs(11), color: t.textMuted, marginTop: 2 },
    updateBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}