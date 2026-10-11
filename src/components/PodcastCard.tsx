import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
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
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.cover, { backgroundColor: color + "33" }]}>
        <Ionicons name={kind === "audiobook" ? "book-outline" : "mic-outline"} size={26} color={color} />
      </View>

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
    cover: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progress: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    notes: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6, fontStyle: "italic" },
    plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    plusText: { fontFamily: t.fonts.bold, fontSize: t.fs(14), color: t.onAccent },
    doneBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.cardAlt, alignItems: "center", justifyContent: "center" },
  });
}