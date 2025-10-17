import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { Stack } from "expo-router";
import PodcastsScreen from "../src/screens/PodcastsScreen";

export default function PodcastPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Podcasts" }} />
      <PodcastsScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, fontFamily: "Poppins_600SemiBold", color: "#111827" },
});
