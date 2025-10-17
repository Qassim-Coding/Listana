import React from "react";
import { Stack } from "expo-router";
import MangasScreen from "../src/screens/MangasScreen";

export default function MangaPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Mangas" }} />
      <MangasScreen />
    </>
  );
}
