import React from "react";
import { Stack } from "expo-router";
import MangasScreen from "../src/screens/MangasScreen";

export default function MangaPage() {
  return (
    <>
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
      <MangasScreen />
    </>
  );
}
