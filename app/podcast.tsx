import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { Stack } from "expo-router";
import PodcastsScreen from "../src/screens/PodcastsScreen";

export default function PodcastPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Podcast / Livre audio",
          headerTintColor: "#12AAB8",
          headerTitleStyle: {
            fontFamily: "Poppins_700Bold",
            fontSize: 22,
            color: "#111827",
          },
        }}
      />
      <PodcastsScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, fontFamily: "Poppins_600SemiBold", color: "#111827" },
});
