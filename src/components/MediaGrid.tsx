import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import MediaCard from "./MediaCard";

type Item = { key: string; label: string; emoji: string };
type Props = {
  items: Item[];
  counts?: Record<string, number>;
  onPick: (key: string) => void;
};

export default function MediaGrid({ items, counts, onPick }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={[styles.grid, { justifyContent: isDesktop ? "center" : "flex-start" }]}>
      {items.map((m) => (
        <MediaCard
          key={m.key}
          mediaKey={m.key}
          label={m.label}
          count={counts?.[m.key]}
          onPress={() => onPick(m.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});