import { Stack } from "expo-router";
import AnimesScreen from "../src/screens/AnimesScreen";

export default function AnimesPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Animés" }} />
      <AnimesScreen />
    </>
  );
}