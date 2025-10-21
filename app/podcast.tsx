import { Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import PodcastsScreen from "../src/screens/PodcastsScreen";

const isWeb = Platform.OS === 'web';

export default function PodcastPage() {
  return (
    <>
      {!isWeb && (
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
      )}
      {isWeb && <WebBackButton title="Podcast / Livre audio" />}
      <PodcastsScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, fontFamily: "Poppins_600SemiBold", color: "#111827" },
});
