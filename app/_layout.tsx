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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Quand on quitte l'app (bouton accueil, autre app…), le widget « Reprendre » se remet à jour
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