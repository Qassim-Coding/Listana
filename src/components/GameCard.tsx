import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";
import { Theme } from "../theme";
import { Game } from "../types/game";

export const GAME_STATUS_LABEL: Record<string, string> = {
  toPlay: "À jouer",
  playing: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
};

export const GAME_GENRE_LABEL: Record<string, string> = {
  RPG: "RPG",
  FPS: "FPS",
  "indé": "Indé",
  "rétro": "Rétro",
  mobile: "Mobile",
};

type Props = {
  game: Game;
  onEdit: (game: Game) => void;
  onQuickAction: (game: Game) => void;
};

export default function GameCard({ game, onEdit, onQuickAction }: Props) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const color = t.media.game;
  const initial = game.title.trim().charAt(0).toUpperCase();
  const completed = game.status === "completed";
  const playing = game.status === "playing";
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : "";

  const meta = [game.platform, GAME_GENRE_LABEL[game.genre] ?? game.genre, year, GAME_STATUS_LABEL[game.status]]
    .filter(Boolean)
    .join(" · ");

  let progress = "Pas encore commencé";
  if (game.lastCheckpoint) progress = game.lastCheckpoint;
  else if (completed) progress = "Terminé";
  else if (playing) progress = "En cours";

  return (
    <Pressable
      onPress={() => onEdit(game)}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${game.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      {game.coverUrl ? (
        <Image source={{ uri: game.coverUrl }} style={styles.cover} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.cover, styles.coverEmpty, { backgroundColor: color + "33" }]}>
          <Text style={[styles.coverLetter, { color }]}>{initial}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={[styles.progress, { color }]} numberOfLines={1}>
          {progress}
        </Text>
        {game.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            {game.notes}
          </Text>
        ) : null}
      </View>

      {completed ? (
        <View style={styles.doneBadge} accessibilityLabel="Terminé">
          <Ionicons name="checkmark" size={20} color={t.textMuted} />
        </View>
      ) : (
        <Pressable
          onPress={() => onQuickAction(game)}
          accessibilityRole="button"
          accessibilityLabel={playing ? `Marquer ${game.title} comme terminé` : `Commencer ${game.title}`}
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Ionicons name={playing ? "checkmark" : "play"} size={20} color={t.onAccent} />
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
    cover: { width: 56, height: 80, borderRadius: 12, backgroundColor: t.cardAlt },
    coverEmpty: { alignItems: "center", justifyContent: "center" },
    coverLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(24) },
    body: { flex: 1, minWidth: 0 },
    title: { fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    meta: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    progress: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), marginTop: 8 },
    notes: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6, fontStyle: "italic" },
    actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" },
    doneBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.cardAlt, alignItems: "center", justifyContent: "center" },
  });
}