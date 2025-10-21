import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import MediaCard from "./MediaCard";

type Item = { key: string; label: string; emoji: string };
type Props = {
  items: Item[];
  onPick: (key: string) => void;
};

const isWeb = Platform.OS === 'web';

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
    justifyContent: isWeb ? "center" : "space-between",
    gap: isWeb ? 16 : 12,
    maxWidth: isWeb ? 1200 : undefined,
    alignSelf: isWeb ? "center" : undefined,
    width: isWeb ? "100%" : undefined,
  },
});
