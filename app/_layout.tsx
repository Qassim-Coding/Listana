import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/ThemeContext";
import { refreshWidgets } from "../src/widgets/refresh";

// Quand l'app est ouverte par un lien (widget : listana://books?add=1…), l'Accueil est quand même
// placé en dessous : le bouton retour ramène à l'Accueil au lieu de fermer l'app.
export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Quand on quitte l'app (bouton accueil, autre app…), les widgets « Reprendre » et « Dernier en cours » se remettent à jour
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") refreshWidgets();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            // Allow rendering even before custom fonts are ready.
            animation: fontsLoaded ? "default" : "none",
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}