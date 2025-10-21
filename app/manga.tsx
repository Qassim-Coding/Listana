import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import MangasScreen from "../src/screens/MangasScreen";

const isWeb = Platform.OS === 'web';

export default function MangaPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Mangas",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Mangas" />}
      <MangasScreen />
    </>
  );
}
