import { Stack } from "expo-router";
import TVShowsScreen from "../src/screens/TVShowsScreen";

export default function TVPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Séries TV" }} />
      <TVShowsScreen />
    </>
  );
}