import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          // Allow rendering even before custom fonts are ready.
          animation: fontsLoaded ? "default" : "none",
        }}
      />
    </SafeAreaProvider>
  );
}
