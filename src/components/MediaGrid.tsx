import React from "react";
import { StyleSheet, View } from "react-native";
import MediaCard from "./MediaCard";

type Item = { key: string; label: string; emoji: string };
type Props = {
  items: Item[];
  onPick: (key: string) => void;
};

export default function MediaGrid({ items, onPick }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((m) => (
        <MediaCard
          key={m.key}
          emoji={m.emoji}
          label={m.label}
          onPress={() => onPick(m.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // si "gap" ne marche pas sur ton RN, laisse-le et garde marginBottom sur .card
    gap: 12,
  },
});
