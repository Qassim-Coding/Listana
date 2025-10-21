import React from "react";
import { Stack } from "expo-router";
import NotesScreen from "../src/screens/NotesScreen";

export default function NotesPage() {
  return (
    <>
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
      <NotesScreen />
    </>
  );
}
