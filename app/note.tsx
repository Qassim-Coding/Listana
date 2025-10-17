import React from "react";
import { Stack } from "expo-router";
import NotesScreen from "../src/screens/NotesScreen";

export default function NotesPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Bloc-notes" }} />
      <NotesScreen />
    </>
  );
}
