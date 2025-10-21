import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import NotesScreen from "../src/screens/NotesScreen";

const isWeb = Platform.OS === 'web';

export default function NotesPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Bloc-notes",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Bloc-notes" />}
      <NotesScreen />
    </>
  );
}
