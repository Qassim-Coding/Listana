import { Stack } from "expo-router";
import AnimesScreen from "../src/screens/AnimesScreen";

export default function AnimesPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Animés",
          headerTintColor: "#12AAB8",
          headerTitleStyle: {
            fontFamily: "Poppins_700Bold",
            fontSize: 22,
            color: "#111827",
          },
        }}
      />
      <AnimesScreen />
    </>
  );
}
