import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { appleLinkLabel } from "../api/itunes";
import { Theme } from "../theme";
import { statusColors } from "../constants/statusColors";
import { useTheme } from "../ThemeContext";
import { Podcast } from "../types/podcast";

export const PODCAST_STATUS_LABEL: Record<string, string> = {
  toListen: "À écouter",
  listening: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
};

export const PODCAST_KIND_LABEL: Record<string, string> = {
  podcast: "Podcast",
  audiobook: "Livre audio",
};

type Props = {
  item: Podcast;
  onEdit: (podcast: Podcast) => void;
  onNextEpisode: (podcast: Podcast) => void;
};

export default function PodcastCard({ item, onEdit, onNextEpisode }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  // Fond léger selon l'état (en cours, à voir, terminé, abandonné), mêmes couleurs dans tout Listana
  const tone = statusColors(t, item.status);
  const color = t.media.podcast;
  const title = item.title || "Sans titre";
  const kind = item.kind ?? "podcast";
  const done = item.status === "completed";
  const last = (item.lastEpisode ?? "").trim();

  let progress = "Pas encore commencé";
  if (last && /^\d+$/.test(last)) {
    progress = `${kind === "audiobook" ? "Chapitre" : "Épisode"} ${last}`;
  } else if (last) {
    progress = last;
  }

  const meta = [item.host, PODCAST_KIND_LABEL[kind], PODCAST_STATUS_LABEL[item.status]]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={() => onEdit(item)}
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
          <Ionicons name={kind === "audiobook" ? "book-outline" : "mic-outline"} size={26} color={color} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={[styles.progress, { color }]} numberOfLines={1}>
          {progress}
        </Text>
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            {item.notes}
          </Text>
        ) : null}
        {/* Condition d'Apple : un lien vers la fiche Apple à côté de chaque pochette */}
        {item.storeUrl ? (
          <Pressable
            onPress={() => item.storeUrl && Linking.openURL(item.storeUrl)}
            accessibilityRole="link"
            accessibilityLabel={`${appleLinkLabel(kind)} : ${title}`}
            hitSlop={10}
            style={styles.appleLink}
          >
            <Ionicons name="open-outline" size={14} color={t.textMuted} />
            <Text style={styles.appleText}>{appleLinkLabel(kind)}</Text>
          </Pressable>
        ) : null}
      </View>

      {done ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminé">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onNextEpisode(item)}
          accessibilityRole="button"
          accessibilityLabel={`Épisode suivant de ${title}`}
          hitSlop={8}
          style={styles.plusBtn}
        >
          <Text style={styles.plusText}>+1</Text>
        </Pressable>
      )}
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
    cover: { width: 56, height: 56, borderRadius: 16, backgroundColor: t.cardAlt },
    coverEmpty: { alignItems: "center", justifyContent: "center" },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progress: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    notes: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6, fontStyle: "italic" },
    appleLink: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, marginTop: 6 },
    appleText: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, textDecorationLine: "underline" },
    plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    plusText: { fontFamily: t.fonts.bold, fontSize: t.fs(14), color: t.onAccent },
    doneBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.cardAlt, alignItems: "center", justifyContent: "center" },
  });
}