import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import MediaCard from "./MediaCard";

type Item = { key: string; label: string; emoji: string };
type Props = {
  items: Item[];
  onPick: (key: string) => void;
};

export default function MediaGrid({ items, onPick }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Tablette/Desktop

  return (
    <View style={[
      styles.grid,
      {
        justifyContent: isDesktop ? "center" : "space-between",
        gap: isDesktop ? 16 : 0, // Pas de gap sur mobile (on utilise marginBottom des cartes)
        maxWidth: isDesktop ? 1200 : undefined,
        alignSelf: isDesktop ? "center" : undefined,
        width: isDesktop ? "100%" : undefined,
      }
    ]}>
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
  },
});
