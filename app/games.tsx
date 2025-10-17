import { Stack } from "expo-router";
import GamesScreen from "../src/screens/GamesScreen";

export default function GamesPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Jeux vidéo" }} />
      <GamesScreen />
    </>
  );
}
