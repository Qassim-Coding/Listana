import { Stack } from "expo-router";
import GamesScreen from "../src/screens/GamesScreen";

export default function GamesPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Jeux vidéo",
          headerTintColor: "#12AAB8",
          headerTitleStyle: {
            fontFamily: "Poppins_700Bold",
            fontSize: 22,
            color: "#111827",
          },
        }}
      />
      <GamesScreen />
    </>
  );
}
